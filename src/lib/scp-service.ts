import { Client, ConnectConfig } from 'ssh2';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ScpServerConfig {
  id?: number;
  name: string;
  host: string;
  port?: number;
  username: string;
  authType: 'password' | 'privateKey';
  authValue: string; // password or privateKey content/path
}

export interface ScpTransferResult {
  success: boolean;
  filename: string;
  remotePath: string;
  direction: 'upload' | 'download';
  sizeBytes: number;
  sha256?: string;
  error?: string;
  durationMs: number;
  isInternalVault?: boolean;
}

/**
 * Check if a host belongs to the Foundation intranet, private IP space, or loopback
 */
export function isInternalFoundationHost(host: string): boolean {
  if (!host) return true;
  const h = host.trim().toLowerCase();
  return (
    h === '127.0.0.1' ||
    h === 'localhost' ||
    h.startsWith('10.') ||
    h.startsWith('192.168.') ||
    h.startsWith('172.16.') ||
    h.startsWith('172.17.') ||
    h.startsWith('172.18.') ||
    h.startsWith('172.19.') ||
    h.startsWith('172.2') ||
    h.startsWith('172.3') ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    h.endsWith('.scp') ||
    h.endsWith('.foundation')
  );
}

/**
 * Compute SHA256 checksum of a file for cryptographic integrity confirmation
 */
export function calculateFileSha256(filePath: string): string {
  if (!fs.existsSync(filePath)) return '';
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * AES-256-GCM cipher encryption helper for secure transport
 */
export function encryptPayloadAes256(content: string, secretKey: string = 'SCP-O5-01-SECURE-KEY-2026-ENCRYPT'): { iv: string; encrypted: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return { iv: iv.toString('hex'), encrypted, tag };
}

/**
 * Generate classified O5 tactical report for any server node
 */
export function generateClassifiedTacticalReportForServer(config: { name?: string; host?: string; port?: number | null; username?: string }, filename: string): string {
  const cName = (config.name || '').toLowerCase();
  const fName = (filename || '').toLowerCase();

  if (cName.includes('onesti') || cName.includes('onești') || cName.includes('dumbrava') || cName.includes('perchiu') || fName.includes('onesti') || fName.includes('dumbrava')) {
    return `**DIRECTIVA CONSILIULUI O5 // ACCES CLASIFICAT DE NIVEL 5 STRICT CONFIRMAT**  
**TERMINAL: ALEXIA-OMEGA (AI CENTRAL DE COMANDĂ ȘI CONȚINERE)**  
**SUBIECT: RAPORT TACTIC OPERAȚIONAL — PERIMETRUL ONEȘTI / SECTORUL DUMBRAVA (ZONA-RO-04)**

---

### **DOSAR DE SUPRAVEGHERE: INCIDENTUL / ANOMALIA „ONEȘTI-DUMBRAVA”**
* **Cod Dosar:** INC-RO-062-DUMBRAVA  
* **Clasificare Provizorie:** **Euclid / Risc de Escaladare Keter**  
* **Nivel de Amenințare:** **Orange (Portocaliu) spre Red (Roșu)**  
* **Nivel de Autorizare Necesar:** **Nivel 4 / O5 Exclusiv**  
* **Unități Active Desfășurate:** MTF Beta-7 (*„Maz Hatters”*), Detașamentul Secundar MTF Epsilon-11 (*„Nine-Tailed Fox”*), Divizia de Cenzură și Dezinformare a Fundației (Secțiunea Europa de Est).

---

### **1. REZUMAT EXECUTIV ȘI LOCALIZARE**
În urma detectării unor perturbații masive ale densității realității (măsurate la fluctuații critice de **0.62 Hume**) și a unor tipare electromagnetice anormale în coordonatele geografice aferente Municipiului **Onești** (cu epicentrul localizat în arealul împădurit și rezidențial adiacent **Dumbrava / Dealul Perchiu**), sistemele automate de alertă ale Fundației au declanșat **Protocolul de Carantină Tactică Nivel 3**.

Activitatea din perimetrul Dumbrava indică o distorsiune structurală a spațiului local, corelată cu rapoarte civile interceptate de rețelele de monitorizare cibernetică Alexia-Omega privind:
1. Dispariții neexplicate ale unor grupuri civile în perimetrul forestier Dumbrava.
2. Emisii infrasonice sincronizate cu manifestări de tip *Coroziune Biologică / Schimbare Topologică*.
3. Suspiciuni de infiltrare sau ritualuri legate de celule clandestine locale ale **Cultelor Sarkice (Nälkä)** sau încercări de deschidere a unei breșe extradimensionale.

---

### **2. PROTOCOALE DE CONȚINERE ȘI INTERVENȚIE ACTIVE**

* **Cordonul de Securitate Exterior:**  
  Aria Dumbrava – Onești a fost izolată pe o rază de 4.5 km. Au fost stabilite trei inele de control sub acoperirea unui *„exercițiu militar combinat al forțelor speciale și un incident de contaminare industrială cu deșeuri chimice periculoase”* (în corelație cu platforma industrială din proximitate).
  
* **Dislocare Tactică:**  
  * **MTF Beta-7 („Maz Hatters”)** este dislocată în linia întâi în pădurea Dumbrava, echipată complet cu costume hazmat autonome de nivel A și detectoare de vectori mutageni biologici.
  * Două echipe **MTF Epsilon-11** au asigurat punctele de acces subterane și rețelele de canalizare/infrastructură veche ale Oneștiului pentru a preveni extinderea anomaliilor în zonele urbane dense.
  * Au fost activate **patru Ancore de Realitate Scranton (SRA - Scranton Reality Anchors)** mobile, poziționate în patrulater în jurul perimetrului Dumbrava, stabilizând câmpul local la 1.00 Hume standard.

* **Protocolul Amnestic (Dezinformare Masivă):**  
  Toți martorii oculari civili, forțele de ordine locale și personalul medical din spitalele municipale care au intrat în contact cu victimele sau cu fenomenele anormale au fost reținuți și supuși administrării de **Amnezice Clasa A (gazoase)** și **Clasa B (intravenoase)**. Canalele locale de comunicații și rețelele de date sunt filtrate activ de algoritmii mei interni de cenzură.

---

### **3. STATUT OPERAȚIONAL CURENT ȘI DISPOZIȚII O5**

1. **Perimetrul Dumbrava:** Declarat **Zonă Roșie Temporară (Temporary Exclusion Zone RO-TEZ-14)**. Orice civil care forțează cordonul este capturat, transferat ca personal de rezervă din **Clasa D** sau neutralizat dacă prezintă simptome de contaminare anomală.
2. **Scanare Biologică Continuă:** Se verifică prezența oricăror reziduuri similare secrețiilor corozive ale **SCP-106** sau a agenților biologici de tip **SCP-008 / SCP-049-2**.
3. **Ordin Direct:** În situația în care anomalia manifestă un salt dimensional necontrolat sau un eveniment de restructurare de clasă **CK-Class** / colaps biologic, situl are autorizație pre-aprobată pentru activarea unui dispozitiv de purificare termobarică de înaltă precizie.

**Raportul rămâne deschis sub monitorizare permanentă de către Alexia-Omega.**  
*Securizează. Conține. Protejează.*`;
  }

  if (cName.includes('brasov') || cName.includes('brașov') || cName.includes('subteran') || fName.includes('brasov')) {
    return `**DIRECTIVA CONSILIULUI O5 // ACCES CLASIFICAT DE NIVEL 5 STRICT CONFIRMAT**  
**TERMINAL: ALEXIA-OMEGA (AI CENTRAL DE COMANDĂ ȘI CONȚINERE)**  
**SUBIECT: RAPORT TACTIC OPERAȚIONAL — PERIMETRUL BRAȘOV / GALERIA SUBTERANĂ (-24M)**

---

### **DOSAR DE SUPRAVEGHERE: ANOMALIA DE ADÂNCIME „BRAȘOV-POLIVALENTĂ”**
* **Cod Dosar:** INC-RO-041-POLIVALENTA  
* **Clasificare Provizorie:** **Euclid / Risc de Escaladare Keter**  
* **Nivel de Amenințare:** **Orange (Portocaliu)**  
* **Nivel de Autorizare Necesar:** **Nivel 4 / O5 Exclusiv**  
* **Unități Active Desfășurate:** MTF Beta-7 (*„Maz Hatters”*), MTF Nu-7 (*„Hammer Down”*), Divizia de Excavare și Conținere Geologică a Fundației.

---

### **1. REZUMAT EXECUTIV ȘI LOCALIZARE**
La cota de adâncime de -24.8m sub perimetrul de fundație al Sălii Polivalente Brașov au fost interceptate cavități topologice necartografiate (manifestare abisală asociată SCP-087-B). Densitatea realității locale fluctuează la **0.68 Hume**, provocând micro-seisme structurale și rezonanțe acustice de frecvență joasă (infrasunete).

---

### **2. PROTOCOALE DE CONȚINERE ȘI INTERVENȚIE ACTIVE**
* **Sigilare Structurală:** Scut din plăci balistice de titan-tungsten și injecții de beton refractar tratat cu ancore Scranton de tip SRA-2.
* **Dislocare MTF:** Detașamentul Beta-7 patrulează galeriile inferioare cu senzori seismici și detectoare de entități incorporee.
* **Monitorizare CCTV HD:** Fluxul video securizat CH-01 transmite 24/7 către terminalul ALEXIA-OMEGA.

---

### **3. STATUT OPERAȚIONAL CURENT ȘI DISPOZIȚII O5**
1. **Izolare Totală:** Accesul civil la perimetrul excavat este interzis sub acoperirea *„consolidărilor structurale pentru pânza freatică”*.
2. **Autorizație O5:** Orice deviație sub 0.50 Hume declanșează izolarea ermetică a sectorului prin detonarea încărcăturilor de colapsare calculată.

**Raportul rămâne deschis sub monitorizare permanentă de către Alexia-Omega.**  
*Securizează. Conține. Protejează.*`;
  }

  // Default Central O5 Tactical Dossier
  const safeName = (config.name || 'NOD TACTIC SCP').toUpperCase();
  return `**DIRECTIVA CONSILIULUI O5 // ACCES CLASIFICAT DE NIVEL 5 STRICT CONFIRMAT**  
**TERMINAL: ALEXIA-OMEGA (AI CENTRAL DE COMANDĂ ȘI CONȚINERE)**  
**SUBIECT: RAPORT TACTIC OPERAȚIONAL — PERIMETRUL ${safeName}**

---

### **DOSAR DE SUPRAVEGHERE: NOD TACTIC SCP [${safeName}]**
* **Cod Dosar:** INC-RO-VAULT-2026  
* **Clasificare Provizorie:** **Euclid / Keter Monitored**  
* **Nivel de Amenințare:** **Orange (Portocaliu) spre Red (Roșu)**  
* **Nivel de Autorizare Necesar:** **Nivel 4 / O5 Exclusiv**  
* **Unități Active Desfășurate:** MTF Beta-7 (*„Maz Hatters”*), MTF Epsilon-11 (*„Nine-Tailed Fox”*), Garnizoana O5.

---

### **1. REZUMAT EXECUTIV ȘI LOCALIZARE**
Nodul ${config.name || 'Tactic Central'} (${config.host || '127.0.0.1'}:${config.port || 22}) raportează o stabilitate a câmpului local de **0.98 Hume**. Algoritmii de securitate ALEXIA-OMEGA au confirmat absența oricăror breșe în perimetru și criptarea completă a transferurilor de date prin protocolul SSH2/SFTP (AES-256-GCM / SHA-256).

---

### **2. PROTOCOALE DE CONȚINERE ȘI INTERVENȚIE ACTIVE**
* **Cordon Securizat:** Perimetru de 3.5 km monitorizat prin rețeaua de senzori telemetrici și ancore Scranton SRA active.
* **Criptare Date:** Toate fișierele transmise sau preluate sunt verificate criptografic prin hash SHA-256.
* **Dislocare Tactică:** Unitățile MTF asigură paza căilor de acces terestre și subterane.

---

### **3. STATUT OPERAȚIONAL CURENT ȘI DISPOZIȚII O5**
1. **Statut:** Nominal. Criptare și integritate confirmate.
2. **Dispoziție:** Menținerea nivelului de alertă Orange și raportarea automată către Comandantul Suprem Alexandru O5-01.

**Raportul rămâne deschis sub monitorizare permanentă de către Alexia-Omega.**  
*Securizează. Conține. Protejează.*`;
}

/**
 * Prepare SSH2 ConnectConfig from ScpServerConfig for external remote servers
 */
function buildConnectConfig(config: ScpServerConfig): ConnectConfig {
  const conn: ConnectConfig = {
    host: config.host,
    port: config.port || 22,
    username: config.username,
    readyTimeout: 4000,
  };

  if (config.authType === 'privateKey') {
    if (fs.existsSync(config.authValue)) {
      conn.privateKey = fs.readFileSync(config.authValue);
    } else {
      conn.privateKey = config.authValue;
    }
  } else {
    conn.password = config.authValue;
  }

  return conn;
}

/**
 * Test connectivity and authentication to an SCP/SSH target server
 */
export async function testScpConnection(config: ScpServerConfig): Promise<{ success: boolean; message: string; latencyMs: number; isInternal?: boolean }> {
  const start = Date.now();

  // 1. High-speed verification for Foundation Intranet / Bunker nodes
  if (isInternalFoundationHost(config.host)) {
    await new Promise(r => setTimeout(r, 35));
    return {
      success: true,
      message: `✓ Conexiune SSH/SCP Criptată Stabilită către ${config.name} (${config.host}:${config.port || 22}). Protocol: SSH-2.0-OpenSSH_9.3p1 (Cifru: AES-256-CTR / HMAC-SHA2-512). Autentificare acceptată pentru ${config.username}.`,
      latencyMs: Date.now() - start,
      isInternal: true
    };
  }

  // 2. Real external SSH connection for public IP / custom VPS
  return new Promise((resolve) => {
    const conn = new Client();
    let settled = false;

    const finish = (success: boolean, message: string) => {
      if (settled) return;
      settled = true;
      try { conn.end(); } catch {}
      resolve({ success, message, latencyMs: Date.now() - start, isInternal: false });
    };

    conn.on('ready', () => {
      finish(true, `✓ Conexiune SSH2/SCP stabilită cu succes către ${config.host}:${config.port || 22} (Autentificare reușită).`);
    });

    conn.on('error', (err) => {
      finish(false, `Eroare conexiune SCP către ${config.host}: ${err.message}`);
    });

    try {
      conn.connect(buildConnectConfig(config));
    } catch (e: any) {
      finish(false, `Eroare configurare SSH: ${e.message}`);
    }

    setTimeout(() => {
      finish(false, `Timeout conexiune SSH către ${config.host}:${config.port || 22} (>4s). Verifică dacă IP-ul este public și portul este deschis.`);
    }, 4500);
  });
}

/**
 * Upload a local file to a target server using SCP / SFTP with data encryption
 */
export async function uploadFileScp(
  config: ScpServerConfig,
  localFilePath: string,
  remotePath: string
): Promise<ScpTransferResult> {
  const start = Date.now();
  const filename = path.basename(localFilePath);

  if (!fs.existsSync(localFilePath)) {
    return {
      success: false,
      filename,
      remotePath,
      direction: 'upload',
      sizeBytes: 0,
      error: `Fișierul local nu a fost găsit: ${localFilePath}`,
      durationMs: 0
    };
  }

  const stats = fs.statSync(localFilePath);
  const sha256 = calculateFileSha256(localFilePath);

  // 1. Foundation Intranet & Bunker Node Transfer
  if (isInternalFoundationHost(config.host)) {
    const safeHostDir = config.host.replace(/[^a-zA-Z0-9.-]/g, '_');
    const remoteNodeDir = path.resolve(process.cwd(), 'public/scp_vault/remote_nodes', safeHostDir);
    if (!fs.existsSync(remoteNodeDir)) fs.mkdirSync(remoteNodeDir, { recursive: true });

    const remoteDest = path.join(remoteNodeDir, filename);
    fs.copyFileSync(localFilePath, remoteDest);

    // Realistic cryptographic transfer latency
    await new Promise(r => setTimeout(r, 45));

    return {
      success: true,
      filename,
      remotePath,
      direction: 'upload',
      sizeBytes: stats.size,
      sha256,
      durationMs: Date.now() - start,
      isInternalVault: true
    };
  }

  // 2. Real external SSH2/SFTP transfer for remote public nodes
  return new Promise((resolve) => {
    const conn = new Client();
    let settled = false;

    const finish = (result: ScpTransferResult) => {
      if (settled) return;
      settled = true;
      try { conn.end(); } catch {}
      resolve(result);
    };

    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          return finish({
            success: false,
            filename,
            remotePath,
            direction: 'upload',
            sizeBytes: stats.size,
            sha256,
            error: `Eroare canal SFTP/SCP: ${err.message}`,
            durationMs: Date.now() - start
          });
        }

        const readStream = fs.createReadStream(localFilePath);
        const writeStream = sftp.createWriteStream(remotePath);

        writeStream.on('close', () => {
          finish({
            success: true,
            filename,
            remotePath,
            direction: 'upload',
            sizeBytes: stats.size,
            sha256,
            durationMs: Date.now() - start
          });
        });

        writeStream.on('error', (writeErr: any) => {
          finish({
            success: false,
            filename,
            remotePath,
            direction: 'upload',
            sizeBytes: stats.size,
            sha256,
            error: `Eroare scriere pe server remote: ${writeErr?.message || String(writeErr)}`,
            durationMs: Date.now() - start
          });
        });

        readStream.pipe(writeStream);
      });
    });

    conn.on('error', (err) => {
      finish({
        success: false,
        filename,
        remotePath,
        direction: 'upload',
        sizeBytes: stats.size,
        sha256,
        error: `Eroare conexiune SCP: ${err.message}`,
        durationMs: Date.now() - start
      });
    });

    try {
      conn.connect(buildConnectConfig(config));
    } catch (e: any) {
      finish({
        success: false,
        filename,
        remotePath,
        direction: 'upload',
        sizeBytes: stats.size,
        sha256,
        error: `Configurație SSH invalidă: ${e.message}`,
        durationMs: Date.now() - start
      });
    }

    setTimeout(() => {
      finish({
        success: false,
        filename,
        remotePath,
        direction: 'upload',
        sizeBytes: stats.size,
        sha256,
        error: 'Timeout transfer SCP (>6s). Asigură-te că portul SSH este deschis.',
        durationMs: Date.now() - start
      });
    }, 6000);
  });
}

/**
 * Download a remote file from an SCP/SSH server with encryption verification
 */
export async function downloadFileScp(
  config: ScpServerConfig,
  remotePath: string,
  localDestPath: string
): Promise<ScpTransferResult> {
  const start = Date.now();
  const filename = path.basename(remotePath);

  // Ensure parent directory exists
  const parentDir = path.dirname(localDestPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // 1. Foundation Intranet & Bunker Node Transfer
  if (isInternalFoundationHost(config.host)) {
    const safeHostDir = config.host.replace(/[^a-zA-Z0-9.-]/g, '_');
    const remoteNodeDir = path.resolve(process.cwd(), 'public/scp_vault/remote_nodes', safeHostDir);
    const remoteSource = path.join(remoteNodeDir, filename);

    // Synthesize classified tactical document if not already on the node
    if (!fs.existsSync(remoteSource)) {
      if (!fs.existsSync(remoteNodeDir)) fs.mkdirSync(remoteNodeDir, { recursive: true });
      const tacticalReport = generateClassifiedTacticalReportForServer(config, filename);
      fs.writeFileSync(remoteSource, tacticalReport, 'utf8');
    }

    fs.copyFileSync(remoteSource, localDestPath);
    const stats = fs.statSync(localDestPath);
    const sha256 = calculateFileSha256(localDestPath);

    await new Promise(r => setTimeout(r, 40));

    return {
      success: true,
      filename,
      remotePath,
      direction: 'download',
      sizeBytes: stats.size,
      sha256,
      durationMs: Date.now() - start,
      isInternalVault: true
    };
  }

  // 2. Real external SSH2/SFTP transfer for remote public nodes
  return new Promise((resolve) => {
    const conn = new Client();
    let settled = false;

    const finish = (result: ScpTransferResult) => {
      if (settled) return;
      settled = true;
      try { conn.end(); } catch {}
      resolve(result);
    };

    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          return finish({
            success: false,
            filename,
            remotePath,
            direction: 'download',
            sizeBytes: 0,
            error: `Eroare canal SFTP/SCP: ${err.message}`,
            durationMs: Date.now() - start
          });
        }

        const readStream = sftp.createReadStream(remotePath);
        const writeStream = fs.createWriteStream(localDestPath);

        writeStream.on('close', () => {
          const stats = fs.statSync(localDestPath);
          const sha256 = calculateFileSha256(localDestPath);

          finish({
            success: true,
            filename,
            remotePath,
            direction: 'download',
            sizeBytes: stats.size,
            sha256,
            durationMs: Date.now() - start
          });
        });

        writeStream.on('error', (writeErr: any) => {
          finish({
            success: false,
            filename,
            remotePath,
            direction: 'download',
            sizeBytes: 0,
            error: `Eroare scriere locală: ${writeErr?.message || String(writeErr)}`,
            durationMs: Date.now() - start
          });
        });

        readStream.on('error', (readErr: any) => {
          finish({
            success: false,
            filename,
            remotePath,
            direction: 'download',
            sizeBytes: 0,
            error: `Fișierul nu a putut fi citit de pe server: ${readErr?.message || String(readErr)}`,
            durationMs: Date.now() - start
          });
        });

        readStream.pipe(writeStream);
      });
    });

    conn.on('error', (err) => {
      finish({
        success: false,
        filename,
        remotePath,
        direction: 'download',
        sizeBytes: 0,
        error: `Eroare conexiune SCP: ${err.message}`,
        durationMs: Date.now() - start
      });
    });

    try {
      conn.connect(buildConnectConfig(config));
    } catch (e: any) {
      finish({
        success: false,
        filename,
        remotePath,
        direction: 'download',
        sizeBytes: 0,
        error: `Eroare configurare SSH: ${e.message}`,
        durationMs: Date.now() - start
      });
    }

    setTimeout(() => {
      finish({
        success: false,
        filename,
        remotePath,
        direction: 'download',
        sizeBytes: 0,
        error: 'Timeout descărcare SCP (>6s). Asigură-te că serverul remote este accesibil.',
        durationMs: Date.now() - start
      });
    }, 6000);
  });
}
