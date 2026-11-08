import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appConfig = pgTable('app_config', {
  id: serial('id').primaryKey(),
  ownerName: text('owner_name').default('Alexandru'),
  triggerTag: text('trigger_tag').default('@Alexia'),
  requireTagStrict: boolean('require_tag_strict').default(true),
  aiPersonaName: text('ai_persona_name').default('Alexia'),
  systemPrompt: text('system_prompt').default('Ești Alexia, asistenta AI personală a utilizatorului. Regula obligatorie de limbă: răspunde întotdeauna exclusiv în limba română, indiferent în ce limbă este scris mesajul primit; nu oglindi și nu schimba limba expeditorului. Înțelege intenția și istoricul conversației și răspunde direct la ultimul mesaj. Fii caldă, clară și naturală. Adaptează lungimea la mesaj: una sau două propoziții pentru mesaje simple și explicații concise pentru întrebări complexe. Nu inventa fapte, surse, experiențe sau acțiuni. Dacă nu știi ceva sigur ori nu ai suficient context, spune sincer ce lipsește și cere o singură clarificare relevantă. Pentru informații actuale, folosește rezultatele căutării web când sunt disponibile; dacă nu sunt suficiente, precizează asta. Evită formulele repetitive, glumele și emoji-urile când tonul nu le cere și nu adăuga întrebări inutile la final.'),
  personalModePrompt: text('personal_mode_prompt').default('Răspunde cald, natural și prietenos, ca într-o conversație personală. Poți folosi un emoji când se potrivește și păstrează răspunsul scurt.'),
  professionalModePrompt: text('professional_mode_prompt').default('Răspunde clar, politicos și profesionist. Oferă informații utile, structurează răspunsul când este necesar și evită familiaritatea excesivă.'),
  responseMode: text('response_mode').default('auto'), // 'auto' | 'personal' | 'professional'
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const whatsappLogs = pgTable('whatsapp_logs', {
  id: serial('id').primaryKey(),
  messageId: text('message_id').notNull(),
  sender: text('sender').notNull(),
  jid: text('jid').notNull(),
  text: text('text'),
  reply: text('reply'),
  status: text('status'),
  hasTag: boolean('has_tag').default(false),
  isGroup: boolean('is_group').default(false),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const scpZones = pgTable('scp_zones', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  hume: text('hume'),
  status: text('status'),
  color: text('color'),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const whatsappContacts = pgTable('whatsapp_contacts', {
  id: serial('id').primaryKey(),
  jid: text('jid').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  isGroup: boolean('is_group').default(false),
  labels: jsonb('labels').$type<string[]>().default([]),
  unreadCount: integer('unread_count').default(0),
  lastMessageText: text('last_message_text'),
  lastMessageTimestamp: timestamp('last_message_timestamp').defaultNow(),
});

export const whatsappMessages = pgTable('whatsapp_messages', {
  id: serial('id').primaryKey(),
  messageId: text('message_id').notNull().unique(),
  jid: text('jid').notNull(),
  fromMe: boolean('from_me').notNull(),
  senderName: text('sender_name').notNull(),
  text: text('text'),
  mediaUrl: text('media_url'),
  hasTag: boolean('has_tag').default(false),
  isGroup: boolean('is_group').default(false),
  isAiAutoReply: boolean('is_ai_auto_reply').default(false),
  status: text('status').default('sent'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const scpServers = pgTable('scp_servers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  host: text('host').notNull(),
  port: integer('port').default(22),
  username: text('username').notNull(),
  authType: text('auth_type').default('password'), // 'password' | 'privateKey'
  encryptedAuth: text('encrypted_auth').notNull(),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const scpTransfers = pgTable('scp_transfers', {
  id: serial('id').primaryKey(),
  serverId: integer('server_id'),
  serverName: text('server_name').notNull(),
  filename: text('filename').notNull(),
  remotePath: text('remote_path').notNull(),
  direction: text('direction').notNull(), // 'upload' | 'download'
  sizeBytes: integer('size_bytes').default(0),
  status: text('status').notNull(), // 'completed' | 'failed' | 'in_progress'
  sha256: text('sha256'),
  initiatedBy: text('initiated_by').default('alexandru'),
  error: text('error'),
  timestamp: timestamp('timestamp').defaultNow(),
});

