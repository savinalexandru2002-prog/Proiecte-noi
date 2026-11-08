import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  proto,
  WAMessageKey
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import { exec } from 'child_process';
import { db, pool, appConfig, whatsappLogs, scpZones, whatsappContacts, whatsappMessages, scpServers, scpTransfers } from './src/db/index.ts';
import { eq, desc } from 'drizzle-orm';
import { 
  generateTeamAIResponse, 
  generateDailyObjective, 
  runDeepStrategicAnalysis, 
  generateGroundedFileContent, 
  performGlobalIntelligenceSweep,
  searchSpotifyGrounding,
  generateGlobalTacticalReport
} from './src/lib/team-ai.ts';
import { testScpConnection, uploadFileScp, downloadFileScp, calculateFileSha256, generateClassifiedTacticalReportForServer } from './src/lib/scp-service.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
});

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

// App State (Will be synced with DB)
let config = {
  ownerName: 'Alexandru',
  triggerTag: '@Alexia',
  requireTagStrict: true,
  aiPersonaName: 'Alexia',
  systemPrompt: 'Ești Alexia, asistenta personală a lui Alexandru. Răspunde întotdeauna în limba română. Fii caldă, empatică și naturală. Păstrează contextul conversației și răspunde direct, fără a repeta formule robotice. Dacă nu știi ceva, caută pe Google și oferă un răspuns complet și interesant. Fii sinceră dacă nu ai suficiente informații.',
  personalModePrompt: 'Răspunde cald, natural și prietenos, ca într-o conversație personală. Poți folosi un emoji când se potrivește și păstrează răspunsul scurt.',
  professionalModePrompt: 'Răspunde clar, politicos și profesionist. Oferă informații utile, structurează răspunsul când este necesar și evită familiaritatea excesivă.',
  responseMode: 'auto' as 'auto' | 'personal' | 'professional',
};

let whatsappState = {
  status: 'connected', 
  qr: '',
  pairingCode: '',
  device: { id: '40751391684:69@s.whatsapp.net', name: 'Alexandru' } as any,
};

let conversationHistory: Record<string, any[]> = {};
let sock: WASocket | null = null;

// Seed SCP Zones from JSON if empty
async function seedScpZones() {
  try {
    const existing = await db.select().from(scpZones).limit(1);
    if (existing.length === 0) {
      console.log('[SEED] Populating scp_zones from local database...');
      let scpDb = { zones: {} as Record<string, any> };
      try { 
        scpDb = JSON.parse(fs.readFileSync('scp_database.json', 'utf-8')); 
        const zonesToInsert = Object.entries(scpDb.zones).map(([key, zone]: [string, any]) => ({
          key,
          name: zone.name,
          hume: zone.hume || '1.00 Hume',
          status: zone.status || 'Stable',
          color: zone.color || 'emerald',
          description: zone.description || ''
        }));
        if (zonesToInsert.length > 0) {
          await db.insert(scpZones).values(zonesToInsert);
          console.log(`[SEED] Inserted ${zonesToInsert.length} zones.`);
        }
      } catch (e) {
        console.warn('[SEED] Could not read scp_database.json for seeding.');
      }
    }
  } catch (err) {
    console.error('[SEED] Error seeding zones:', err);
  }
}

// Sync Config from DB
async function syncConfig() {
  try {
    const dbConfig = await db.select().from(appConfig).limit(1);
    if (dbConfig.length > 0) {
      config = {
        ownerName: dbConfig[0].ownerName || 'Alexandru',
        triggerTag: dbConfig[0].triggerTag || '@Alexandru',
        requireTagStrict: dbConfig[0].requireTagStrict ?? true,
        aiPersonaName: dbConfig[0].aiPersonaName || 'Alexandra',
        systemPrompt: dbConfig[0].systemPrompt || '',
        personalModePrompt: dbConfig[0].personalModePrompt || '',
        professionalModePrompt: dbConfig[0].professionalModePrompt || '',
        responseMode: (dbConfig[0].responseMode as 'auto' | 'personal' | 'professional') || 'auto',
      };
      console.log('[CONFIG] Synced from Cloud SQL.');
    } else {
      await db.insert(appConfig).values({
        ownerName: config.ownerName,
        triggerTag: config.triggerTag,
        requireTagStrict: config.requireTagStrict,
        aiPersonaName: config.aiPersonaName,
        systemPrompt: config.systemPrompt,
        personalModePrompt: config.personalModePrompt,
        professionalModePrompt: config.professionalModePrompt,
        responseMode: config.responseMode,
      });
      console.log('[CONFIG] Initialized in Cloud SQL.');
    }
  } catch (err) {
    console.error('[CONFIG] Sync error:', err);
  }
}

// Initialize WhatsApp and SCP Tables in PostgreSQL
async function initCustomTables() {
  try {


    // Seed initial SCP servers if empty
    const existingServers = await db.select().from(scpServers).limit(1);
    if (existingServers.length === 0) {
      await db.insert(scpServers).values([
        {
          name: 'Nod Tactic Brașov Subteran (-24m)',
          host: '10.0.4.12',
          port: 22,
          username: 'mtf-beta7',
          authType: 'password',
          encryptedAuth: 'O5_TACTICAL_BRA_2026',
          status: 'active'
        },
        {
          name: 'Situl-19 Server Arhivă Criptată (Vault-173)',
          host: '192.168.19.10',
          port: 22,
          username: 'o5-overseer',
          authType: 'password',
          encryptedAuth: 'CONTAINMENT_ALPHA_SECURE',
          status: 'active'
        },
        {
          name: 'Onești TEZ-14 Scranton Node',
          host: '10.0.2.14',
          port: 2222,
          username: 'epsilon-11',
          authType: 'password',
          encryptedAuth: 'SRA4_MAGNETIC_LOCK',
          status: 'active'
        }
      ]);
      console.log('[SEED] Initial SCP servers seeded.');
    }

    // Seed initial contact if empty
    const existingContacts = await db.select().from(whatsappContacts).limit(1);
    if (existingContacts.length === 0) {
      await db.insert(whatsappContacts).values([
        {
          jid: '40751391684@s.whatsapp.net',
          name: 'Alexandru (Comandant Suprem O5-01)',
          phone: '+40 751 391 684',
          isGroup: false,
          labels: ['Prioritar', 'Comandă O5'],
          unreadCount: 0,
          lastMessageText: 'Sistemul de supraveghere și transfer SCP este activ.',
          lastMessageTimestamp: new Date()
        }
      ]);
      console.log('[SEED] Initial contact seeded.');
    }
  } catch (err) {
    console.warn('[DB INIT] Table creation/seeding note:', err);
  }
}

// In-memory message store
const messageCache = new Map<string, proto.IMessage>();
const msgRetryStore = new Map<string, any>();
const msgRetryCounterCache = {
  get: <T>(key: string): T | undefined => msgRetryStore.get(key) as T,
  set: <T>(key: string, value: T): void => { msgRetryStore.set(key, value); },
  del: (key: string): void => { msgRetryStore.delete(key); },
  flushAll: (): void => { msgRetryStore.clear(); }
};

export function purgeSessionForJid(jid?: string | null) {
  if (!jid) return 0;
  try {
    const rawId = jid.split('@')[0].split(':')[0];
    const authDir = path.resolve(__dirname, 'baileys_auth_info');
    if (!fs.existsSync(authDir)) return 0;
    const files = fs.readdirSync(authDir);
    let removed = 0;
    for (const file of files) {
      if ((file.startsWith('session-') || file.startsWith('sender-key-')) && file.includes(rawId)) {
        try { fs.unlinkSync(path.join(authDir, file)); removed++; } catch {}
      }
    }
    return removed;
  } catch (err) { return 0; }
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    logger: pino({ level: 'silent' }),
    browser: ['AI Assistant', 'Chrome', '1.0.0'],
    getMessage: async (key: WAMessageKey) => messageCache.get(key.id!) || undefined,
    msgRetryCounterCache,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr && whatsappState.status !== 'connected') { 
      whatsappState.status = 'qr'; whatsappState.qr = qr; 
    }
    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      whatsappState.status = 'disconnected'; whatsappState.qr = '';
      if (statusCode !== DisconnectReason.loggedOut) setTimeout(connectToWhatsApp, 3000);
    } else if (connection === 'open') {
      whatsappState.status = 'connected'; whatsappState.qr = ''; whatsappState.device = sock?.user;
      setTimeout(() => setProfilePicture('src/assets/images/scp_guard_edit_pinterest.jpg'), 2000);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      if (msg.key?.id && msg.message) {
        messageCache.set(msg.key.id, msg.message);
        if (messageCache.size > 1000) messageCache.delete(messageCache.keys().next().value!);
      }
      if (msg.messageStubType === proto.WebMessageInfo.StubType.CIPHERTEXT || !msg.message) {
        if (msg.messageStubType === proto.WebMessageInfo.StubType.CIPHERTEXT) purgeSessionForJid(msg.key.participant || msg.key.remoteJid);
        continue;
      }
      const remoteJid = msg.key.remoteJid;
      const isFromMe = msg.key.fromMe;
      const pushName = msg.pushName || (isFromMe ? 'EU' : 'Necunoscut');
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || '';
      if (!text && !isFromMe) continue;

      const isGroup = remoteJid?.endsWith('@g.us') || msg.key.remoteJid?.endsWith('@g.us') || false;

      // 1. Sync contact into whatsapp_contacts
      if (remoteJid) {
        try {
          const rawPhone = remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
          const existing = await db.select().from(whatsappContacts).where(eq(whatsappContacts.jid, remoteJid)).limit(1);
          if (existing.length > 0) {
            await db.update(whatsappContacts).set({
              name: (isFromMe ? existing[0].name : pushName) || existing[0].name,
              lastMessageText: text,
              lastMessageTimestamp: new Date(),
              unreadCount: isFromMe ? existing[0].unreadCount : (existing[0].unreadCount || 0) + 1,
            }).where(eq(whatsappContacts.jid, remoteJid));
          } else {
            await db.insert(whatsappContacts).values({
              jid: remoteJid,
              name: pushName || rawPhone,
              phone: '+' + rawPhone,
              isGroup,
              labels: isGroup ? ['Grup'] : ['Direct'],
              unreadCount: isFromMe ? 0 : 1,
              lastMessageText: text,
              lastMessageTimestamp: new Date(),
            });
          }
        } catch (e) {}
      }

      // Compute tag detection
      const lowerText = (text || '').toLowerCase();
      const mentionedJids: string[] = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid as string[]) || [];
      const isMentionedByJid = mentionedJids.some((j: string) => 
        j.includes('40751391684') || 
        (sock?.user?.id && j.includes(sock.user.id.split(':')[0]))
      );
      const tags = config.triggerTag.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
      const hasTag = tags.some(tag => lowerText.includes(tag)) || isMentionedByJid;
      
      console.log(`[DEBUG] Text: ${lowerText}, Tags: ${JSON.stringify(tags)}, hasTag: ${hasTag}`);

      // 2. Persist message into whatsapp_messages (with upsert to prevent unique constraint failures)
      try {
        await db.insert(whatsappMessages).values({
          messageId: msg.key.id || ('MSG_' + Date.now()),
          jid: remoteJid || 'unknown',
          fromMe: !!isFromMe,
          senderName: pushName,
          text,
          isGroup,
          hasTag: hasTag,
          isAiAutoReply: false,
          status: 'delivered',
        }).onConflictDoUpdate({
          target: whatsappMessages.messageId,
          set: {
            text,
            status: 'delivered',
          }
        });
      } catch (e) {}

      // Allow outgoing messages if they contain a tag (self-command); otherwise skip outgoing to avoid loops
      if (isFromMe && !hasTag) {
        continue;
      }

      // STRICT USER RULE #2: DO NOT RESPOND TO GROUPS!
      // If message is from a group (@g.us), STOP IMMEDIATELY. Zero automated AI replies!
      if (isGroup) {
        continue;
      }

      // STRICT USER RULE #3: RESPOND ONLY IN DIRECT MESSAGES WHEN TAGGED WITH A CONFIGURED TAG
      if (!hasTag) {
        continue;
      }

      try {
        const jidKey = remoteJid || 'default_chat';
        if (!conversationHistory[jidKey]) conversationHistory[jidKey] = [];

        // Check if this is an SCP (Secure Copy Protocol) file transfer command
        const isScp = lowerText.includes('scp') && (
          lowerText.includes('transfer') || 
          lowerText.includes('trimite') || 
          lowerText.includes('descarca') || 
          lowerText.includes('preia') || 
          lowerText.includes('upload') || 
          lowerText.includes('server') || 
          lowerText.includes('nod') || 
          lowerText.includes('lista')
        );

        // Check if this is a Tactical Report request
        const isReport = tags.some(tag => lowerText.includes(tag)) && lowerText.includes('raport');
        let reportTopic = '';
        if (isReport) {
           const match = lowerText.match(/raport\s+(.+)/i);
           reportTopic = match ? match[1] : 'Situație Globală';
        }

        let replyText = '';
        let attachmentPath: string | null = null;

        if (isReport) {
           const isTaggedAlexia = lowerText.includes('@alexia');
           replyText = await generateGlobalTacticalReport(reportTopic, isTaggedAlexia);
           const proofImgRelPath = getProofImageForPrompt(reportTopic);
           if (fs.existsSync(path.resolve(__dirname, proofImgRelPath))) {
             attachmentPath = path.resolve(__dirname, proofImgRelPath);
           }
           const senderName = isTaggedAlexia ? 'ALEXIA-OMEGA' : 'ALEXANDRU-OMEGA (O5)';

           await db.insert(whatsappLogs).values({
             messageId: msg.key.id!, sender: pushName, jid: remoteJid!, text, reply: replyText, status: 'replied', hasTag, isGroup: false
           });

           await db.insert(whatsappMessages).values({
            messageId: 'AI_REPLY_' + Date.now(),
            jid: remoteJid!,
            fromMe: true,
            senderName,
            text: replyText,
            isGroup: false,
            hasTag: false,
            isAiAutoReply: true,
            status: 'sent',
          });
        } else if (isScp) {
          const servers = await db.select().from(scpServers);
          const isTaggedAlexia = lowerText.includes('@alexia');
          const responderName = isTaggedAlexia ? 'ALEXIA-ARCHIVE (SCP)' : 'ALEXANDRU-OMEGA (O5)';
          const tacticalTone = !isTaggedAlexia;

          if (lowerText.includes('lista') || lowerText.includes('server') || servers.length === 0) {
            const sList = servers.map(s => `• ${s.name} (${s.host}:${s.port}) [SSH2/AES-256]`).join('\n');
            replyText = tacticalTone 
              ? `🔒 [PROTOCOL SCP // SERVER NODES DISPONIBILE]\nSalut, Alexandru! Iată serverele SCP criptate configurate:\n${sList || 'Niciun nod extern configurat.'}\n\nFolosește comanda: "@Alexandru scp trimite [nume_fișier]" pentru transfer securizat.`
              : `Bună, Alexandru! 😊 Am verificat arhiva și iată nodurile noastre active:\n${sList || 'Momentan nu avem niciun server configurat.'}\n\nSpune-mi dacă vrei să trimit eu un document pe unul dintre ele! ✨`;
          } else {
            // Execute simulated or real SCP file transfer to target node
            const targetServer = servers[0];
            const nameMatch = lowerText.match(/trimite\s+([^\s@]+)/i) || lowerText.match(/descarca\s+([^\s@]+)/i);
            const topic = nameMatch ? nameMatch[1] : `raport_tactic_o5_${Date.now()}`;
            const testFileName = topic.endsWith('.txt') ? topic : `${topic}.txt`;
            
            const vaultDir = path.resolve(process.cwd(), 'public/scp_vault');
            if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
            const localFilePath = path.join(vaultDir, testFileName);

            // GROUNDED FILE GENERATION (Wikipedia/Google)
            const classifiedReport = await generateGroundedFileContent(topic);
            fs.writeFileSync(localFilePath, classifiedReport, 'utf8');
            
            const fileSha = calculateFileSha256(localFilePath);
            
            // Record transfer
            await db.insert(scpTransfers).values({
              serverId: targetServer.id,
              serverName: targetServer.name,
              filename: testFileName,
              remotePath: `/var/scp/vault/${testFileName}`,
              direction: 'upload',
              sizeBytes: fs.statSync(localFilePath).size,
              status: 'completed',
              sha256: fileSha,
              initiatedBy: isTaggedAlexia ? 'whatsapp_alexia' : 'whatsapp_alexandru',
            });

            replyText = tacticalTone
              ? `**DIRECTIVA CONSILIULUI O5 // CONFIRMARE TRANSFER SCP CRIPTAT (Grounded Sinteza)**\n\nDestinație: ${targetServer.name}\nProtocol: SSH2 / SFTP Grounded Research Stream\nSubiect: ${topic}\nIntegritate SHA-256: ${fileSha}\nStatus: Dosar Tactic Clasificat Transmis cu Succes!\n\n*Securizează. Conține. Protejează.*`
              : `Gata, Alexandru! ✨ Am terminat cercetarea pentru "${topic}" și am trimis dosarul către ${targetServer.name}. Totul a decurs perfect, iar integritatea datelor este confirmată. Sper să-ți fie de folos! ❤️`;
            attachmentPath = localFilePath;
          }

          // Persist SCP message with correct persona
          await db.insert(whatsappMessages).values({
            messageId: 'AI_REPLY_' + Date.now(),
            jid: remoteJid!,
            fromMe: true,
            senderName: config.aiPersonaName.toUpperCase(),
            text: replyText,
            isGroup: false,
            hasTag: false,
            isAiAutoReply: true,
            status: 'sent',
          });
        } else {
          // Pass history and full personality config to AI
          const teamResult = await generateTeamAIResponse(text, conversationHistory[jidKey], config);
          replyText = teamResult?.merged || `[${config.aiPersonaName.toUpperCase()} // 2026] Transmisiune securizată recepționată.`;
          const proofImgRelPath = getProofImageForPrompt(text);
          attachmentPath = path.resolve(__dirname, proofImgRelPath);

          // Use the sender name from the AI team result or config
          const currentAiName = teamResult?.senderName || config.aiPersonaName.toUpperCase();

          await db.insert(whatsappLogs).values({
            messageId: msg.key.id!, sender: pushName, jid: remoteJid!, text, reply: replyText, status: 'replied', hasTag: hasTag, isGroup: false
          });

          // Insert AI reply into whatsapp_messages
          await db.insert(whatsappMessages).values({
            messageId: 'AI_REPLY_' + Date.now(),
            jid: remoteJid!,
            fromMe: true,
            senderName: currentAiName,
            text: replyText,
            isGroup: false,
            hasTag: false,
            isAiAutoReply: true,
            status: 'sent',
          });
        }

        conversationHistory[jidKey].push({ role: 'user', text, time: new Date().toISOString() });
        conversationHistory[jidKey].push({ role: 'assistant', text: replyText, time: new Date().toISOString() });
        if (conversationHistory[jidKey].length > 20) conversationHistory[jidKey] = conversationHistory[jidKey].slice(-20);

        if (attachmentPath && fs.existsSync(attachmentPath)) {
          if (attachmentPath.endsWith('.jpg') || attachmentPath.endsWith('.png')) {
            await sock?.sendMessage(remoteJid!, { image: fs.readFileSync(attachmentPath), caption: replyText }, { quoted: msg });
          } else {
            await sock?.sendMessage(remoteJid!, { document: fs.readFileSync(attachmentPath), fileName: path.basename(attachmentPath), mimetype: 'text/plain', caption: replyText }, { quoted: msg });
          }
        } else {
          await sock?.sendMessage(remoteJid!, { text: replyText }, { quoted: msg });
        }
      } catch (err) { console.error('Message process error:', err); }
    }
  });
}

function getProofImageForPrompt(text: string): string {
  const p = text.toLowerCase();
  if (p.includes('brasov') || p.includes('brașov') || p.includes('subteran') || p.includes('polivalent')) {
    return 'src/assets/images/cctv_brasov_subterranean_1793728562302.jpg';
  }
  if (p.includes('onesti') || p.includes('onești') || p.includes('dumbrava') || p.includes('perchiu')) {
    return 'src/assets/images/cctv_onesti_dumbrava_1793728577062.jpg';
  }
  if (p.includes('173') || p.includes('site19') || p.includes('situl-19')) {
    return 'src/assets/images/cctv_site19_scp173_1793728606406.jpg';
  }
  if (p.includes('bodycam') || p.includes('postavaru') || p.includes('poiana') || p.includes('nu-7')) {
    return 'src/assets/images/cctv_mtf_bodycam_1793728622584.jpg';
  }
  return 'src/assets/images/scp_guard_edit_pinterest.jpg';
}

const DYNAMIC_ONLINE_SCP_AVATARS = [
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', // Dark Tactical FLIR
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', // Steel Containment Door
  'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800', // Deep Subterranean Bunker
  'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800', // MTF Tactical Mask Operative
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', // Encrypted Terminal Server
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800', // Eerie Anomalous Forest
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800', // Cyber Matrix Grid
  'https://images.unsplash.com/photo-1517420784912-86927d79b691?w=800', // Research Lab Containment
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', // O5 Operative Executive
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800', // Subterranean Abyssal Void
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', // Heavy Containment Seal
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', // Cyber Cybernetic Anomaly
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', // Liquid Metallic Entity 🍐
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=800', // Neon Cyberpunk Hazard Zone
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800', // Surreal Abstract Anomaly
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', // Biohazard Containment Vault
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800', // Chromatic Abort Sequence
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800', // Surreal Dimensional Void 🍐
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800', // Quantum Distortion Field
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800', // Thermal Sensor Bio-Entity
  'https://images.unsplash.com/photo-1518709337583-8a396e95c1a7?w=800', // Sub-Zero Cryo Chamber
  'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800', // Deep Space Hume Distortion
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', // Night Vision Tactical Unit
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', // Blast Door Locks
  'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=800', // Hologram Anomalous Pear 🍐
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800', // Red Reality Shift
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'  // High O5 Command Terminal
];

const ROTATING_AVATARS = [
  'src/assets/images/scp_guard_edit_pinterest.jpg',
  'src/assets/images/cctv_brasov_subterranean_1793728562302.jpg',
  'src/assets/images/cctv_onesti_dumbrava_1793728577062.jpg',
  'src/assets/images/cctv_site19_scp173_1793728606406.jpg',
  'src/assets/images/cctv_mtf_bodycam_1793728622584.jpg',
  'src/assets/images/scp_alexia_omega_avatar_1793648209955.jpg',
  'src/assets/images/scp_alexia_omega_avatar_day2_1793648390069.jpg',
  'src/assets/images/scp_alexia_omega_avatar_day3_1793648402832.jpg',
  'src/assets/images/scp_alexia_omega_avatar_day4_1793648539952.jpg',
  'src/assets/images/scp_alexia_omega_avatar_day5_1793648550973.jpg',
  'src/assets/images/scp_alexia_omega_avatar_day6_1793648560949.jpg',
  'src/assets/images/scp_alexia_omega_avatar_day7_1793648570549.jpg'
];

let currentAvatarOffset = 0;
const usedOnlineAvatarUrls = new Set<string>();
let nextAvatarChangeTimestamp = Date.now() + 5 * 60 * 1000;
let lastAvatarInfo = {
  url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
  updatedAt: new Date().toISOString(),
  source: 'Online Surreal SCP Search'
};

async function fetchDynamicSurrealScpImage(): Promise<string | null> {
  const scpSearchKeywords = [
    'scp-foundation', 'containment-breach', 'surreal-anomaly', 'biohazard-bunker',
    'thermal-flir-entity', 'hume-distortion', 'scranton-anchor', 'anomalous-creature',
    'tactical-cyberpunk-mask', 'abyssal-subterranean', 'liquid-metal-anomaly', 'quantum-void'
  ];
  
  // Pick random keyword and random image index modifier
  const keyword = scpSearchKeywords[Math.floor(Math.random() * scpSearchKeywords.length)];
  const randomSig = Math.floor(Math.random() * 100000);
  const dynamicUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80&sig=${randomSig}&query=${keyword}`;
  return dynamicUrl;
}

async function setProfilePicture(imageFilePath?: string) {
  try {
    if (!sock?.user?.id) return { success: false, error: 'WhatsApp client not connected' };
    const userJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    // If explicit file path is passed
    if (imageFilePath) {
      const targetPath = path.resolve(__dirname, imageFilePath);
      if (fs.existsSync(targetPath)) {
        await sock.updateProfilePicture(userJid, fs.readFileSync(targetPath));
        nextAvatarChangeTimestamp = Date.now() + 5 * 60 * 1000;
        lastAvatarInfo = { url: imageFilePath, updatedAt: new Date().toISOString(), source: 'Explicit Path' };
        return { success: true, avatar: imageFilePath };
      }
    }

    // 1. Try dynamic online search first (ensuring non-repeating surreal images)
    const candidates = DYNAMIC_ONLINE_SCP_AVATARS.filter(url => !usedOnlineAvatarUrls.has(url));
    let onlineUrl: string;

    if (candidates.length > 0) {
      onlineUrl = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      // If all pre-indexed candidates were used, clear the set or generate dynamic query
      usedOnlineAvatarUrls.clear();
      onlineUrl = (await fetchDynamicSurrealScpImage()) || DYNAMIC_ONLINE_SCP_AVATARS[0];
    }

    usedOnlineAvatarUrls.add(onlineUrl);

    try {
      const resp = await fetch(onlineUrl);
      if (resp.ok) {
        const arrayBuf = await resp.arrayBuffer();
        const imgBuffer = Buffer.from(arrayBuf);
        await sock.updateProfilePicture(userJid, imgBuffer);
        nextAvatarChangeTimestamp = Date.now() + 5 * 60 * 1000;
        lastAvatarInfo = { url: onlineUrl, updatedAt: new Date().toISOString(), source: 'Online Surreal SCP Feed' };
        console.log(`[AVATAR 5-MIN ONLINE SEARCH] Set new surreal online SCP profile picture: ${onlineUrl}`);
        return { success: true, source: onlineUrl };
      }
    } catch (e) {
      console.warn('[AVATAR ONLINE FETCH] Falling back to local archive avatar:', e);
    }

    // 2. Fallback to local avatar pool
    const localRelPath = ROTATING_AVATARS[currentAvatarOffset % ROTATING_AVATARS.length];
    currentAvatarOffset++;
    const targetPath = path.resolve(__dirname, localRelPath);
    if (fs.existsSync(targetPath)) {
      await sock.updateProfilePicture(userJid, fs.readFileSync(targetPath));
      nextAvatarChangeTimestamp = Date.now() + 5 * 60 * 1000;
      lastAvatarInfo = { url: localRelPath, updatedAt: new Date().toISOString(), source: 'Local Archive' };
      console.log(`[AVATAR 5-MIN] Updated profile picture from local SCP archive: ${localRelPath}`);
      return { success: true, avatar: localRelPath };
    }

    return { success: false, error: 'No avatar found' };
  } catch (err: any) { 
    console.error('[AVATAR ERROR]', err);
    return { success: false, error: err.message }; 
  }
}

async function generateAI(p: string) {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  for (const m of models) {
    try {
      const res = await ai.models.generateContent({ model: m, contents: [{ role: 'user', parts: [{ text: p }] }] });
      if (res.text) return res.text;
    } catch (e: any) {
      const errStr = String(e?.message || e);
      if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('Quota exceeded')) {
        break; // Stop trying other models when quota exceeded
      }
    }
  }
  return null;
}

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

let dailyObjective = 'OBIECTIV: ANALIZĂ VECTORIALĂ INIȚIALĂ';

// Update objective every 12 hours
setInterval(async () => {
  try {
    dailyObjective = await generateDailyObjective(config.aiPersonaName);
  } catch (e) {}
}, 1000 * 60 * 60 * 12);

// Initial trigger
setTimeout(async () => {
  try {
    dailyObjective = await generateDailyObjective(config.aiPersonaName);
  } catch (e) {}
}, 5000);

app.get('/api/whatsapp/status', (req, res) => res.json({ 
  ...whatsappState, 
  objective: dailyObjective,
  nextAvatarChangeTimestamp,
  lastAvatarInfo,
  config: { ...config, hasApiKey: !!process.env.GEMINI_API_KEY } 
}));
app.get('/api/whatsapp/history', async (req, res) => {
  try { res.json({ logs: await db.select().from(whatsappLogs).orderBy(desc(whatsappLogs.timestamp)).limit(50) }); } catch (e) { res.json({ logs: [] }); }
});

// WhatsApp Web Chats & Contacts API
app.get('/api/whatsapp/chats', async (req, res) => {
  try {
    const contacts = await db.select().from(whatsappContacts).orderBy(desc(whatsappContacts.lastMessageTimestamp));
    res.json({ chats: contacts });
  } catch (err: any) {
    res.status(500).json({ error: err.message, chats: [] });
  }
});

app.get('/api/whatsapp/chats/:jid/messages', async (req, res) => {
  try {
    const jid = req.params.jid;
    const messages = await db.select().from(whatsappMessages).where(eq(whatsappMessages.jid, jid)).orderBy(whatsappMessages.timestamp);
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message, messages: [] });
  }
});

app.post('/api/whatsapp/chats/:jid/send', async (req, res) => {
  try {
    const jid = req.params.jid;
    const { text, mediaUrl } = req.body;
    if (!text && !mediaUrl) return res.status(400).json({ error: 'Text or mediaUrl required' });

    let sentMsgInfo: any = null;
    if (sock) {
      if (mediaUrl && fs.existsSync(mediaUrl)) {
        sentMsgInfo = await sock.sendMessage(jid, { image: fs.readFileSync(mediaUrl), caption: text || '' });
      } else {
        sentMsgInfo = await sock.sendMessage(jid, { text: text || '' });
      }
    }

    const newMsg = {
      messageId: sentMsgInfo?.key?.id || ('MANUAL_' + Date.now()),
      jid,
      fromMe: true,
      senderName: config.ownerName || 'Alexandru',
      text: text || '',
      mediaUrl: mediaUrl || null,
      hasTag: false,
      isGroup: jid.endsWith('@g.us'),
      isAiAutoReply: false,
      status: 'sent',
    };

    await db.insert(whatsappMessages).values(newMsg);

    await db.update(whatsappContacts).set({
      lastMessageText: text || 'Media trimisă',
      lastMessageTimestamp: new Date(),
    }).where(eq(whatsappContacts.jid, jid));

    res.json({ success: true, message: newMsg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/chats/:jid/labels', async (req, res) => {
  try {
    const jid = req.params.jid;
    const { labels } = req.body;
    if (!Array.isArray(labels)) return res.status(400).json({ error: 'Labels must be an array' });
    await db.update(whatsappContacts).set({ labels }).where(eq(whatsappContacts.jid, jid));
    res.json({ success: true, labels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/chats/:jid/read', async (req, res) => {
  try {
    const jid = req.params.jid;
    await db.update(whatsappContacts).set({ unreadCount: 0 }).where(eq(whatsappContacts.jid, jid));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/ai-draft', async (req, res) => {
  try {
    const { jid, contactName, recentMessages = [] } = req.body;
    
    // Determine the mode based on auto-logic if set to auto
    let modePrompt = config.personalModePrompt;
    if (config.responseMode === 'professional') {
      modePrompt = config.professionalModePrompt;
    } else if (config.responseMode === 'auto') {
      const lastMsgText = recentMessages[recentMessages.length - 1]?.text || '';
      const tacticalKeywords = ['scp', 'raport', 'misiune', 'status', 'protocol', 'securitate', 'dosar', 'transfer'];
      if (tacticalKeywords.some(k => lastMsgText.toLowerCase().includes(k))) {
        modePrompt = config.professionalModePrompt;
      }
    } else if (config.responseMode === 'personal') {
      modePrompt = config.personalModePrompt;
    }

    const prompt = `Ești ${config.aiPersonaName.toUpperCase()}, AI personal pentru ${config.ownerName}.
${config.systemPrompt}

STIL CURENT: ${modePrompt}

Contactul curent: ${contactName || jid}.
Ultimele mesaje:
${recentMessages.map((m: any) => `${m.fromMe ? config.ownerName : contactName || 'Contact'}: ${m.text}`).join('\n')}

Sarcina ta: Formulează o propunere de răspuns inteligentă, fermă și impecabilă în limba română pe care ${config.ownerName} o poate trimite acestui contact.
Răspunde direct cu textul propus, fără explicații suplimentare sau ghilimele.`;

    // Internal AI call with grounding for draft
    let draft = 'Salut! Am recepționat mesajul tău.';
    try {
      const res = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      draft = res.text || draft;
    } catch (e) {}

    res.json({ success: true, draft: draft.trim() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SCP Servers & Encrypted File Transfers API
app.get('/api/scp/servers', async (req, res) => {
  try {
    const servers = await db.select().from(scpServers).orderBy(desc(scpServers.createdAt));
    res.json({ servers });
  } catch (err: any) {
    res.status(500).json({ error: err.message, servers: [] });
  }
});

app.post('/api/scp/servers', async (req, res) => {
  try {
    const { name, host, port = 22, username, authType = 'password', encryptedAuth } = req.body;
    if (!name || !host || !username) {
      return res.status(400).json({ error: 'Nume, host și utilizator sunt obligatorii.' });
    }
    const [inserted] = await db.insert(scpServers).values({
      name,
      host,
      port: Number(port) || 22,
      username,
      authType,
      encryptedAuth: encryptedAuth || '',
      status: 'active'
    }).returning();
    res.json({ success: true, server: inserted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/scp/servers/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(scpServers).where(eq(scpServers.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/scp/servers/:id/test', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [server] = await db.select().from(scpServers).where(eq(scpServers.id, id)).limit(1);
    if (!server) return res.status(404).json({ error: 'Server negăsit' });

    const result = await testScpConnection({
      name: server.name,
      host: server.host,
      port: server.port || 22,
      username: server.username,
      authType: server.authType as any,
      authValue: server.encryptedAuth
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/scp/transfers', async (req, res) => {
  try {
    const transfers = await db.select().from(scpTransfers).orderBy(desc(scpTransfers.timestamp)).limit(50);
    res.json({ transfers });
  } catch (err: any) {
    res.status(500).json({ error: err.message, transfers: [] });
  }
});

app.post('/api/scp/transfer', async (req, res) => {
  try {
    const { serverId, filename, remotePath = '/var/scp/vault', direction = 'upload', content } = req.body;
    const [server] = await db.select().from(scpServers).where(eq(scpServers.id, Number(serverId))).limit(1);
    if (!server) return res.status(404).json({ error: 'Serverul țintă nu a fost găsit.' });

    const safeFilename = (filename || `scp_export_${Date.now()}.txt`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const localDir = path.resolve(__dirname, 'public/scp_vault');
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const localFilePath = path.join(localDir, safeFilename);

    if (direction === 'upload') {
      let finalContent = content;
      if (!finalContent) {
        // Use grounded generation for "upload" if no content is provided
        finalContent = await generateGroundedFileContent(filename || 'General Tactical Report');
      }
      
      fs.writeFileSync(localFilePath, finalContent, 'utf8');
      
      const remoteTarget = `${remotePath.replace(/\/$/, '')}/${safeFilename}`;
      const transferRes = await uploadFileScp({
        name: server.name,
        host: server.host,
        port: server.port || 22,
        username: server.username,
        authType: server.authType as any,
        authValue: server.encryptedAuth
      }, localFilePath, remoteTarget);

      await db.insert(scpTransfers).values({
        serverId: server.id,
        serverName: server.name,
        filename: safeFilename,
        remotePath: remoteTarget,
        direction: 'upload',
        sizeBytes: transferRes.sizeBytes,
        status: transferRes.success ? 'completed' : 'failed',
        sha256: transferRes.sha256 || calculateFileSha256(localFilePath),
        initiatedBy: 'web_alexandru',
        error: transferRes.error || null,
      });

      res.json({
        ...transferRes,
        downloadUrl: transferRes.success ? `/scp_vault/${safeFilename}` : undefined
      });
    } else {
      const remoteSource = `${remotePath.replace(/\/$/, '')}/${safeFilename}`;
      const transferRes = await downloadFileScp({
        name: server.name,
        host: server.host,
        port: server.port || 22,
        username: server.username,
        authType: server.authType as any,
        authValue: server.encryptedAuth
      }, remoteSource, localFilePath);

      await db.insert(scpTransfers).values({
        serverId: server.id,
        serverName: server.name,
        filename: safeFilename,
        remotePath: remoteSource,
        direction: 'download',
        sizeBytes: transferRes.sizeBytes,
        status: transferRes.success ? 'completed' : 'failed',
        sha256: transferRes.sha256 || (fs.existsSync(localFilePath) ? calculateFileSha256(localFilePath) : ''),
        initiatedBy: 'web_alexandru',
        error: transferRes.error || null,
      });

      res.json({
        ...transferRes,
        downloadUrl: transferRes.success ? `/scp_vault/${safeFilename}` : undefined
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/config', async (req, res) => {
  const { 
    ownerName, triggerTag, requireTagStrict, 
    aiPersonaName, systemPrompt, personalModePrompt, 
    professionalModePrompt, responseMode 
  } = req.body;
  
  if (ownerName) config.ownerName = ownerName;
  if (triggerTag) config.triggerTag = triggerTag;
  if (requireTagStrict !== undefined) config.requireTagStrict = !!requireTagStrict;
  if (aiPersonaName) config.aiPersonaName = aiPersonaName;
  if (systemPrompt) config.systemPrompt = systemPrompt;
  if (personalModePrompt) config.personalModePrompt = personalModePrompt;
  if (professionalModePrompt) config.professionalModePrompt = professionalModePrompt;
  if (responseMode) config.responseMode = responseMode;

  await db.update(appConfig).set({ 
    ownerName: config.ownerName, 
    triggerTag: config.triggerTag, 
    requireTagStrict: config.requireTagStrict,
    aiPersonaName: config.aiPersonaName,
    systemPrompt: config.systemPrompt,
    personalModePrompt: config.personalModePrompt,
    professionalModePrompt: config.professionalModePrompt,
    responseMode: config.responseMode,
    updatedAt: new Date() 
  }).where(eq(appConfig.id, 1));
  
  res.json({ success: true, config });
});
app.post('/api/whatsapp/set-pinterest-avatar', async (req, res) => res.json(await setProfilePicture('src/assets/images/scp_guard_edit_pinterest.jpg')));

app.post('/api/whatsapp/repair-sessions', async (req, res) => {
  try {
    const authDir = path.resolve(__dirname, 'baileys_auth_info');
    if (!fs.existsSync(authDir)) return res.json({ success: true, repairedSessions: 0 });
    const files = fs.readdirSync(authDir);
    let removed = 0;
    for (const file of files) {
      if (file.startsWith('session-') || file.startsWith('sender-key-')) {
        try { fs.unlinkSync(path.join(authDir, file)); removed++; } catch {}
      }
    }
    // We don't logout, just force re-sync on next message
    res.json({ success: true, repairedSessions: removed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/update-avatar', async (req, res) => {
  const result = await setProfilePicture();
  res.json(result);
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
      sock = null;
    }
    const authDir = path.resolve(__dirname, 'baileys_auth_info');
    if (fs.existsSync(authDir)) fs.rmSync(authDir, { recursive: true, force: true });
    whatsappState.status = 'disconnected';
    whatsappState.qr = '';
    res.json({ success: true });
    setTimeout(() => connectToWhatsApp(), 2000);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/test-message', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'Text required' });
  
  const lowerText = text.toLowerCase();
  const isReport = lowerText.includes('raport');
  let replyText = '';

  try {
    if (isReport) {
      const match = lowerText.match(/raport\s+(.+)/i);
      const reportTopic = match ? match[1] : 'Situație Globală';
      const isTaggedAlexia = lowerText.includes('@alexia');
      replyText = await generateGlobalTacticalReport(reportTopic, isTaggedAlexia);
    } else {
      const teamResult = await generateTeamAIResponse(text, [], config);
      replyText = teamResult?.merged || 'Test failed';
    }

    await db.insert(whatsappLogs).values({
      messageId: 'TEST_' + Date.now(), sender: 'Tester', jid: 'test@s.whatsapp.net', text, reply: replyText, status: 'replied', hasTag: true, isGroup: false
    });
    res.json({ success: true, reply: replyText });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/history/clear', async (req, res) => {
  try {
    // Correct drizzle-orm syntax for deleting all rows
    await db.delete(whatsappLogs);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/scp/update-database', async (req, res) => {
  try {
    // Re-run seed logic but with clearing first if requested
    const scpDb = JSON.parse(fs.readFileSync('scp_database.json', 'utf-8')); 
    const zonesToInsert = Object.entries(scpDb.zones).map(([key, zone]: [string, any]) => ({
      key,
      name: zone.name,
      hume: zone.hume || '1.00 Hume',
      status: zone.status || 'Stable',
      color: zone.color || 'emerald',
      description: zone.description || ''
    }));
    
    if (zonesToInsert.length > 0) {
      // Upsert logic for zones
      for (const zone of zonesToInsert) {
        await db.insert(scpZones).values(zone).onConflictDoUpdate({
          target: scpZones.key,
          set: {
            name: zone.name,
            hume: zone.hume,
            status: zone.status,
            color: zone.color,
            description: zone.description,
            updatedAt: new Date()
          }
        });
      }
    }
    res.json({ success: true, zoneCount: zonesToInsert.length, entityCount: 0 });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/video/generate-ai', async (req, res) => {
  try {
    const { cameraIndex = 0, locationName = 'Brașov Subteran' } = req.body;
    const timestamp = Date.now();
    const outPath = path.resolve(__dirname, 'public/videos', `gen_${timestamp}.mp4`);
    const audioWavPath = `/tmp/gen_audio_${timestamp}.wav`;
    const pyScript = `import wave, struct, math\nwith wave.open('${audioWavPath}', 'w') as f:\n    f.setnchannels(1)\n    f.setsampwidth(2)\n    f.setframerate(44100)\n    frames = bytearray()\n    for i in range(int(44100 * 6.0)):\n        t = i / 44100\n        s = 0.22 * math.sin(2 * math.pi * 60 * t)\n        frames.extend(struct.pack('<h', int(s * 32767)))\n    f.writeframes(frames)`;
    fs.writeFileSync(`/tmp/gen_py_${timestamp}.py`, pyScript);
    await new Promise((r) => exec(`python3 /tmp/gen_py_${timestamp}.py`, r));
    const baseImages = ['src/assets/images/cctv_brasov_subterranean_1793728562302.jpg','src/assets/images/cctv_onesti_dumbrava_1793728577062.jpg','src/assets/images/cctv_site19_scp173_1793728606406.jpg','src/assets/images/cctv_mtf_bodycam_1793728622584.jpg','src/assets/images/scp_guard_edit_pinterest.jpg'];
    // Improved ffmpeg command with zoompan for "real" motion and tactical noise
    const filterComplex = `[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,zoompan=z='min(zoom+0.0005,1.5)':d=180:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720,noise=alls=15:allf=t+u,vignette=PI/4[v]`;
    await new Promise((r, j) => exec(`ffmpeg -y -loop 1 -i "${baseImages[cameraIndex % baseImages.length]}" -i "${audioWavPath}" -filter_complex "${filterComplex}" -map "[v]" -map 1:a -c:v libx264 -t 6 -r 30 -pix_fmt yuv420p "${outPath}"`, (e) => e ? j(e) : r(true)));
    res.json({ success: true, videoUrl: `/videos/gen_${timestamp}.mp4`, meta: { name: locationName, hume: '0.88 Hume', description: 'Sinteză reală ALEXIA-OMEGA (2026).' } });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// Autonomous 24/7 Heartbeat & System Reporting
function startAutonomousMonitor() {
  console.log('[SYSTEM] Autonomous monitor active (24/7).');
  
  // Every 1 hour, generate a "Tactical System Check"
  setInterval(async () => {
    try {
      const status = whatsappState.status;
      const logMsg = `[HEARTBEAT 2026] System Status: ${status.toUpperCase()} | Unit: ${config.aiPersonaName.toUpperCase()} | Time: ${new Date().toLocaleTimeString('ro-RO')}`;
      
      console.log(logMsg);
      
      // Persist heartbeat in DB as a system log
      await db.insert(whatsappLogs).values({
        messageId: 'HB_' + Date.now(),
        sender: `${config.aiPersonaName.toUpperCase()} (2026)`,
        jid: 'status@system.local',
        text: 'HEARTBEAT_CHECK',
        reply: logMsg,
        status: 'system',
        hasTag: false,
        isGroup: false
      });
      
      // If disconnected and not currently connecting, try to nudge
      if (status === 'disconnected') {
        console.warn('[SYSTEM] Connection lost. Attempting nudge...');
        connectToWhatsApp();
      }
    } catch (err) {
      console.error('[SYSTEM] Heartbeat error:', err);
    }
  }, 1000 * 60 * 10); // 10 minutes

  // Every 2 hours, generate a "Deep Strategic Thought"
  setInterval(async () => {
    try {
      const systemState = `WhatsApp: ${whatsappState.status} | DB: connected | Mode: ${config.responseMode}`;
      const thought = await runDeepStrategicAnalysis(systemState);
      
      // GLOBAL INTELLIGENCE SWEEP (Web Search)
      const sweep = await performGlobalIntelligenceSweep();
      const combinedThought = `${thought}\n\n[GLOBAL INTELLIGENCE SWEEP]: ${sweep}`;
      
      console.log(`\x1b[35m[${config.aiPersonaName.toUpperCase()} THOUGHT]\x1b[0m ${combinedThought}`);
      
      // Occasionally notify owner about strategic reflections (15% chance)
      if (Math.random() < 0.15 && sock && whatsappState.status === 'connected') {
        const jid = '40751391684@s.whatsapp.net';
        await sock.sendMessage(jid, { text: `🛡️ [DIRECTIVĂ AUTONOMĂ ${config.aiPersonaName.toUpperCase()}]\n\n${combinedThought}\n\n*Directivă: Rămâneți vigilent.*` });
      }
    } catch (e) {}
  }, 1000 * 60 * 60 * 2);

  // Every 6 hours, perform a "Database Global Sync" (Search for new anomalies to add to scp_zones)
  setInterval(async () => {
    try {
      console.log('[SYSTEM] Performing Global Database Sync (Anomaly Discovery)...');
      
      // Perform sweep
      let sweep = await performGlobalIntelligenceSweep();
      
      // If sweep is generic, try Spotify for "hidden signals"
      if (sweep.toLowerCase().includes('liniștită') || sweep.length < 50) {
        console.log('[SYSTEM] Global scan quiet. Intercepting Spotify signals...');
        const spotifySignals = await searchSpotifyGrounding('anomalii recente sau semnale criptate 2026');
        sweep = `[MEDIA INTERCEPT]: ${spotifySignals}`;
      }

      const existingZones = await db.select().from(scpZones);
      const zoneNames = existingZones.map(z => z.name.toLowerCase());

      // Extract a potential name
      const nameParts = sweep.split(/[.,!]/)[0].split(' ').slice(0, 4).join(' ') || `Sector_${Date.now()}`;
      const candidateName = `ANOMALIE: ${nameParts}`;

      if (!zoneNames.includes(candidateName.toLowerCase())) {
        await db.insert(scpZones).values({
          key: `AUTO_${Date.now()}`,
          name: candidateName,
          hume: (0.7 + Math.random() * 0.3).toFixed(2) + ' Hume',
          status: 'Uncontained',
          color: 'amber',
          description: `Descoperit prin scanare autonomă globală (Google/Spotify/Wiki): ${sweep}`
        });
        console.log(`[SYSTEM] New anomaly archived: ${candidateName}`);
      } else {
        console.log(`[SYSTEM] Anomaly "${candidateName}" already exists. Updating existing entry...`);
        await db.update(scpZones).set({
          description: `Actualizat prin scanare globală: ${sweep}`,
          updatedAt: new Date()
        }).where(eq(scpZones.name, candidateName));
      }
    } catch (e) {
      console.error('[SYSTEM] Global sync error:', e);
    }
  }, 1000 * 60 * 60 * 6);

  // Automatic 5-Minute Profile Picture Rotation (Every 5 Minutes)
  setInterval(async () => {
    try {
      if (whatsappState.status === 'connected') {
        console.log('[AVATAR] Executing 5-minute profile picture rotation...');
        await setProfilePicture();
      }
    } catch (err) {
      console.error('[AVATAR] 5-minute rotation error:', err);
    }
  }, 1000 * 60 * 5); // Every 5 minutes
}

async function startServer() {
  await seedScpZones();
  await syncConfig();
  console.log('[DEBUG] Config after sync:', JSON.stringify(config));
  await initCustomTables();
  await connectToWhatsApp();
  startAutonomousMonitor(); // Start the 24/7 monitor
  app.use('/videos', express.static(path.resolve(__dirname, 'public/videos')));
  app.use('/scp_vault', express.static(path.resolve(__dirname, 'public/scp_vault')));
  app.use(express.static(path.resolve(__dirname, 'public')));
  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
    app.get('/api/debug/config', (req, res) => {
      console.log('[DEBUG] Config accessed:', JSON.stringify(config));
      res.json(config);
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Running on port ${PORT}`));
}
startServer();
