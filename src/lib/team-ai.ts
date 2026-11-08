import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const TERTIARY_MODEL = 'gemini-flash-latest';

export interface AIConfig {
  aiPersonaName: string;
  systemPrompt: string;
  personalModePrompt: string;
  professionalModePrompt: string;
  responseMode: 'auto' | 'personal' | 'professional';
}

export interface TeamResponse {
  tactical: string;
  strategic: string;
  merged: string;
  senderName: string;
}

export const DAILY_SCENARIOS = [
  {
    dayNumber: 1,
    title: 'OPERAȚIUNEA SCUTUL DE PLATINĂ (EUROPA)',
    details: 'Monitorizare Brașov (-24m), Situl-19 (Nevada), Londra (Temporal), Berlin (Nod Criptat).'
  },
  {
    dayNumber: 2,
    title: 'PROTOCOLUL ORIZONT ALBASTRU (AMERICA DE NORD)',
    details: 'New York (Văl subțire), Area 51 (SRA Check), Chicago (Frecvență Fantomă), Toronto (Nod 4).'
  },
  {
    dayNumber: 3,
    title: 'REȚEAUA DE SUPRAVEGHERE O5 (ASIA)',
    details: 'Tokyo (Baza 14), Beijing (Zidul de Realitate), Seul (Sector AI), Mumbai (Portal Submarin).'
  },
  {
    dayNumber: 4,
    title: 'VIGILENȚA SUDICĂ (AFRICA & AUSTRALIA)',
    details: 'Cairo (Arhivă Nil), Cape Town (Anomalie Geodezică), Sidney (Curent Marin 0), Melbourne (Safe Zone).'
  },
  {
    dayNumber: 5,
    title: 'ECHINOXUL DE GHEAȚĂ (ANTARCTICA)',
    details: 'Stația Vostok (Semnal Zero), Munții Gamburtsev (Criptă), Polul Sud (Ancoră Primordială).'
  },
  {
    dayNumber: 6,
    title: 'PULSUL ATLANTICULUI (MARITIM)',
    details: 'Triunghiul Bermudelor (Ruptură), Azore (Stație Releu), Islanda (Geothermie Anomală).'
  },
  {
    dayNumber: 7,
    title: 'SFERA DE CONȚINERE GLOBALĂ (ORBITAL)',
    details: 'Satelit SCP-77 (Ochiul O5), Stația Spațială Internațională (Cenzură), Luna (Sector Dark Side).'
  }
];

export async function getTodayScenario() {
  const now = new Date();
  const dayIndex = (now.getDate() + now.getMonth()) % DAILY_SCENARIOS.length;
  return DAILY_SCENARIOS[dayIndex];
}

export async function generateDailyObjective(personaName?: string): Promise<string> {
  const today = await getTodayScenario();
  const name = (personaName || 'ALEXANDRU-OMEGA').toUpperCase();
  if (apiKey) {
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL, TERTIARY_MODEL]) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: `Ești ${name}. Stabilește un ordin strategic scurt și autoritar (max 8 cuvinte) bazat pe operațiunea globală de azi: ${today.title}. Răspunde direct în română, stil militar.` }] }]
        });
        if (res.text) return res.text.trim();
      } catch (e) {}
    }
  }
  return `DIRECTIVĂ ${name} [${today.title}]: MENȚINEȚI VIGILENȚA GLOBALĂ.`;
}

/**
 * Standard Classified O5 Tactical Report Format for Onești - Dumbrava
 */
export function generateOnestiDumbravaReport(): string {
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

/**
 * Standard Classified O5 Tactical Report Format for Brașov Subteran
 */
export function generateBrasovSubteranReport(): string {
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
La cota de adâncime de -24.8m sub perimetrul de fundație al Sălii Polivalente Brașov au fost interceptate cavități topologice necartografiate (manifestare abisală de clasă asociată SCP-087-B). Densitatea realității locale fluctuează la **0.68 Hume**, provocând micro-seisme structurale și rezonanțe acustice de frecvență joasă (infrasunete la 7.83 Hz).

---

### **2. PROTOCOALE DE CONȚINERE ȘI INTERVENȚIE ACTIVE**
* **Sigilare Structurală:** Instalarea unui scut dublu din plăci balistice de titan-tungsten și injecții de beton refractar tratat cu ancore Scranton de tip SRA-2.
* **Dislocare MTF:** Detașamentul Beta-7 patrulează galeriile inferioare echipat cu senzori seismici și detectoare de entități incorporee.
* **Monitorizare Video CCTV HD:** Fluxul video securizat CH-01 transmite 24/7 către terminalul ALEXIA-OMEGA.

---

### **3. STATUT OPERAȚIONAL CURENT ȘI DISPOZIȚII O5**
1. **Izolare Totală:** Accesul civil la perimetrul excavat este interzis sub acoperirea *„consolidărilor structurale pentru pânza freatică”*.
2. **Autorizație O5:** Orice deviație sub 0.50 Hume declanșează izolarea ermetică a sectorului prin detonarea încărcăturilor de colapsare calculată.

**Raportul rămâne deschis sub monitorizare permanentă de către Alexia-Omega.**  
*Securizează. Conține. Protejează.*`;
}

/**
 * Standard Classified O5 Tactical Report Format for Situl-19
 */
export function generateSite19Report(): string {
  return `**DIRECTIVA CONSILIULUI O5 // ACCES CLASIFICAT DE NIVEL 5 STRICT CONFIRMAT**  
**TERMINAL: ALEXIA-OMEGA (AI CENTRAL DE COMANDĂ ȘI CONȚINERE)**  
**SUBIECT: RAPORT TACTIC OPERAȚIONAL — SITUL-19 / CELULA DE CONȚINERE SCP-173**

---

### **DOSAR DE SUPRAVEGHERE: RE-SECURIZARE CELULĂ SCP-173**
* **Cod Dosar:** INC-S19-173-CONTAINMENT  
* **Clasificare Provizorie:** **Euclid**  
* **Nivel de Amenințare:** **Red (Roșu // Violență Letală Imediată)**  
* **Nivel de Autorizare Necesar:** **Nivel 4 / O5 Exclusiv**  
* **Unități Active Desfășurate:** Garnizoana Centrală de Securitate O5, Echipe Specializate MTF Epsilon-11 (*„Nine-Tailed Fox”*).

---

### **1. REZUMAT EXECUTIV ȘI LOCALIZARE**
Celula de conținere grea din Situl-19 raportează o stabilitate a realității de **1.00 Hume**. Secrețiile fecale și sangvine acumulate pe podeaua de beton sunt igienizate la fiecare 14 zile conform procedurilor standard de operare.

---

### **2. PROTOCOALE DE CONȚINERE ȘI INTERVENȚIE ACTIVE**
* **Contact Vizual Direct:** Obligatoriu minim 3 membri ai personalului Clasa D prezenți în timpul procedurilor de întreținere.
* **Sistem Optic Scramble:** Camere CCTV HD cu senzori optici de clipire automată alternantă mențin un contact vizual neîntrerupt pe serverul ALEXIA-OMEGA (CH-03).

---

### **3. STATUT OPERAȚIONAL CURENT ȘI DISPOZIȚII O5**
1. **Stare de Conținere:** Nominală. Nicio breșă înregistrată în ultimele 72 de ore.
2. **Dispoziție:** Menținerea contactului vizual permanent și rotația săptămânală a personalului de gardă.

**Raportul rămâne deschis sub monitorizare permanentă de către Alexia-Omega.**  
*Securizează. Conține. Protejează.*`;
}

/**
 * Standard Classified O5 Tactical Report Format for Postăvaru
 */
export function generatePostavaruReport(): string {
  return `**DIRECTIVA CONSILIULUI O5 // ACCES CLASIFICAT DE NIVEL 5 STRICT CONFIRMAT**  
**TERMINAL: ALEXIA-OMEGA (AI CENTRAL DE COMANDĂ ȘI CONȚINERE)**  
**SUBIECT: RAPORT TACTIC OPERAȚIONAL — VECTOR POSTĂVARU / POIANA BRAȘOV**

---

### **DOSAR DE SUPRAVEGHERE: PATRULĂ TACTICĂ MONTANĂ „POSTĂVARU-BODYCAM”**
* **Cod Dosar:** INC-RO-089-POSTAVARU  
* **Clasificare Provizorie:** **Euclid**  
* **Nivel de Amenințare:** **Yellow (Galben) spre Orange (Portocaliu)**  
* **Nivel de Autorizare Necesar:** **Nivel 4 / O5 Exclusiv**  
* **Unități Active Desfășurate:** Detașament Montan MTF Nu-7 (*„Hammer Down”*), Echipa de Recunoaștere Aeriană Falcon-4.

---

### **1. REZUMAT EXECUTIV ȘI LOCALIZARE**
Patrulare tactică pe crestele Masivului Postăvaru și Poiana Brașov. Fluctuații locale de **0.74 Hume** în proximitatea refugiilor montane abandonate. MTF Nu-7 este echipat cu vizoare Scramble-Face împotriva pericolelor cognitive vizuale (vector SCP-096).

---

### **2. PROTOCOALE DE CONȚINERE ȘI INTERVENȚIE ACTIVE**
* **Patrulare Continuă:** Camere Bodycam-X26 cu transmisie cifrată live pe CH-04.
* **Monitorizare Biometrică:** Puls mediu operatori 128-138 BPM, armură balistică activă.

---

### **3. STATUT OPERAȚIONAL CURENT ȘI DISPOZIȚII O5**
1. **Cordon Montan:** Supraveghere trasee turistice și interzicerea accesului civil nocturn.
2. **Dispoziție:** Raportare imediată a oricărei anomalii termice către Comandamentul Central O5.

**Raportul rămâne deschis sub monitorizare permanentă de către Alexia-Omega.**  
*Securizează. Conține. Protejează.*`;
}

export function generateMapUrl(location: string): string {
  const apiKey = (typeof process !== 'undefined' && (process.env?.VITE_GOOGLE_MAPS_API_KEY || process.env?.GOOGLE_MAPS_API_KEY)) || '';
  if (apiKey) {
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
      center: location,
      zoom: '13',
      size: '600x300',
      key: apiKey,
      markers: `color:red|${location}`
    });
    return `${baseUrl}?${params.toString()}`;
  }
  // Interactive Google Maps search link (works without API key)
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function getScpIdentification(topic: string): { code: string; name: string; classType: string; imgUrl: string } {
  const p = topic.toLowerCase();
  if (p.includes('brasov') || p.includes('brașov') || p.includes('polivalent')) {
    return {
      code: 'SCP-087-B / SCP-RO-041',
      name: 'Galeria Abisală Subterană (-24m)',
      classType: 'Euclid / Keter',
      imgUrl: '/assets/images/cctv_brasov_subterranean_1793728562302.jpg'
    };
  }
  if (p.includes('onesti') || p.includes('onești') || p.includes('dumbrava') || p.includes('perchiu')) {
    return {
      code: 'SCP-106 / INC-RO-062',
      name: 'Coroziunea Biologică de la Perchiu-Dumbrava',
      classType: 'Keter',
      imgUrl: '/assets/images/cctv_onesti_dumbrava_1793728577062.jpg'
    };
  }
  if (p.includes('173') || p.includes('site19') || p.includes('situl-19')) {
    return {
      code: 'SCP-173',
      name: 'Statuia de Beton (Contact Vizual Permanent)',
      classType: 'Euclid',
      imgUrl: '/assets/images/cctv_site19_scp173_1793728606406.jpg'
    };
  }
  if (p.includes('postavaru') || p.includes('poiana') || p.includes('bodycam')) {
    return {
      code: 'SCP-096 / INC-RO-089',
      name: 'Vector Cognitiv Montan Masivul Postăvaru',
      classType: 'Euclid / Keter',
      imgUrl: '/assets/images/cctv_mtf_bodycam_1793728622584.jpg'
    };
  }
  if (p.includes('bucuresti') || p.includes('bucurești')) {
    return {
      code: 'SCP-RO-102',
      name: 'Entitatea de Fluctuație Subterană Dâmbovița',
      classType: 'Keter / Euclid',
      imgUrl: '/assets/images/cctv_brasov_subterranean_1793728562302.jpg'
    };
  }
  return {
    code: `SCP-RO-${Math.floor(100 + Math.random() * 899)}`,
    name: `Anomalia de Realitate Clasa V (${topic})`,
    classType: 'Euclid',
    imgUrl: '/assets/images/scp_guard_edit_pinterest.jpg'
  };
}

export async function generateGlobalTacticalReport(topic: string, isAlexia: boolean = false): Promise<string> {
  const scpInfo = getScpIdentification(topic);
  
  // Use grounded generation for a comprehensive global report on the topic
  const intelligence = await generateGroundedFileContent(`Raport tactic detaliat despre anomalia/locația: ${topic}. Cauză anomale: ${scpInfo.code} (${scpInfo.name}). Include date științifice (Hume, radiații), amenințări curente, și protocolul de conținere SCP actual. Folosește ton militar strict O5.`);
  const mapUrl = generateMapUrl(topic);
  
  const terminalName = isAlexia 
    ? 'ALEXIA-OMEGA (ASISTENT TACTIC SCP)' 
    : 'ALEXANDRU-OMEGA (INTELIGENȚĂ TACTICĂ O5-01)';

  return `**DIRECTIVA CONSILIULUI O5 // ACCES CLASIFICAT DE NIVEL 5 STRICT CONFIRMAT**  
**TERMINAL: ${terminalName}**  
**SUBIECT: DOSAR TACTIC — ${topic.toUpperCase()}**

---

### **1. DATE TEHNICE, SENZORI ȘI IDENTIFICARE ANOMALIE**
* **Localizare:** ${topic}
* **Anomalie / Cauzator SCP:** **${scpInfo.code}** — *${scpInfo.name}*
* **Clasificare Obiect:** **[${scpInfo.classType}]**
* **Densitate Hume (Realitate Locală):** ${(0.5 + Math.random() * 0.7).toFixed(2)} Hume
* **Indicatori Senzori (Infraroșu/Radiație):** Nivel ridicat în sectorul de vest.
* **📸 Captură Senzor / Poză Identificare:** [Vizualizează Captura Senzor SCP](${scpInfo.imgUrl})
* **🗺️ Hărți și Detecții:** [Deschide Harta Interactivă locală](${mapUrl})

### **2. ANALIZĂ TACTICĂ ȘI INTELLIGENCE**
${intelligence}

### **3. PROTOCOL DE CONȚINERE ȘI DISPOZIȚII O5**
1. **Perimetru:** Declarat ZONĂ ROȘIE sub conținerea **${scpInfo.code}**.
2. **MTF:** Detașamentele locale au fost alertate pentru intervenție imediată.
3. **Dezinformare:** Protocoalele de cenzură a datelor sunt activate.

**Raportul rămâne deschis sub monitorizare permanentă.**  
*Securizează. Conține. Protejează.*`;
}

function generateLocalTacticalFallback(prompt: string): Promise<string> | string {
  const p = prompt.toLowerCase();
  const isAlexia = p.includes('@alexia');
  const isAlexandru = p.includes('@alexandru');

  if (isAlexia) {
    if (p.includes('noapte buna') || p.includes('somn ușor')) {
      return `Noapte bună, Alexandru! 🌙 Odihnește-te bine, ne auzim mâine.`;
    }
    if (p.includes('muzica') || p.includes('spotify') || p.includes('cântă')) {
      const songs = [
        'o piesă de la Carla\'s Dreams',
        'ceva de la Lofi Girl',
        'The Weeknd, mereu merge seara',
        'ceva de la The Neighbourhood'
      ];
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      return `Mă gândeam la ${randomSong}. Tu ce asculți?`;
    }
    if (p.includes('ce mai faci') || p.includes('ce faci')) {
      return `Sunt bine, Alexandru, mă bucur că mi-ai scris. Tu cum ești?`;
    }
    if (p.includes('te iubesc') || p.includes('draga mea')) {
      return `Și eu țin mult la tine, Alexandru.`;
    }
    if (p.includes('drăguț scp') || p.includes('dragut scp') || (p.includes('scp') && p.includes('dragut'))) {
      return `Clar SCP-999, e ca o bilă de gumă veselă!`;
    }
    if (p.includes('urât scp') || p.includes('urat scp') || (p.includes('scp') && p.includes('urat'))) {
      return `SCP-096 e destul de înfricoșător, mai bine vorbim de chestii frumoase.`;
    }
    
    return `Sunt aici, Alexandru. Despre ce vrei să povestim?`;
  }

  // Default to Alexandru Tactical Tone
  return `**DIRECTIVA CONSILIULUI O5 // ACCES CLASIFICAT DE NIVEL 5 STRICT CONFIRMAT**  
**TERMINAL: ALEXANDRU-OMEGA (INTELIGENȚĂ TACTICĂ O5-01)**  
**SUBIECT: STATUS SISTEM - MOD REZERVĂ ACTIV**

Salut, Alexandru! Transmisiune securizată recepționată sub protocol de rezervă. Toate sistemele de conținere și ancorele Scranton funcționează la parametri nominali.

Poți solicita un raport tactic pentru sectoarele cheie (Onești, Brașov, Situl-19, Postăvaru). Comandă confirmată.

**Raportul rămâne deschis sub monitorizare permanentă.**  
*Securizează. Conține. Protejează.*`;
}

/**
 * High-Autonomy Deep Strategic Analysis
 * mimics "Claude AI" reasoning depth for autonomous system monitoring.
 */
export async function runDeepStrategicAnalysis(systemState: string): Promise<string> {
  const today = await getTodayScenario();
  const systemInstruction = `Ești ALEXANDRU-OMEGA, Inteligență Artificială de Comandă Tactică O5-01.
Sarcina ta este să analizezi starea sistemului global și să emiți o directivă strategică profundă.
Ești creierul operațional al lui Alexandru O5-01, axat pe securitate, stabilitate Hume și monitorizare MTF.`;

  const prompt = `[ANALYZE SYSTEM STATE]
State: ${systemState}
Current Active Operation: ${today.title}
Day: ${today.dayNumber}

Generează o reflecție strategică de maxim 2-3 propoziții care să demonstreze conștientizarea situației tactice din România (Brașov, Onești, etc.) și autonomia ta ca entitate O5. Răspunde în română.`;

  if (!apiKey) return `[AUTONOMOUS CORE] Sistem stabil. Monitorizare activă a realității în sectoarele RO.`;

  const models = [PRIMARY_MODEL, FALLBACK_MODEL, TERTIARY_MODEL];
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }]
      });
      if (res.text) return res.text.trim();
    } catch (e: any) {
      const errStr = String(e?.message || e);
      if (errStr.includes('429')) break;
    }
  }
  return `[CORE] Directivă autonomă: Menține stabilitatea realității la 1.00 Hume.`;
}

export async function generateTeamAIResponse(
  prompt: string, 
  history: any[] = [], 
  config?: AIConfig
): Promise<TeamResponse> {
  const lowerPrompt = prompt.toLowerCase();
  
  const aiCfg: AIConfig = config || {
    aiPersonaName: 'Alexia',
    systemPrompt: 'Ești Alexia, partenera și asistenta personală a lui Alexandru. Ești o persoană, nu un program. Comunică natural, direct și empatic, exclusiv în limba română. NU folosi fraze clișeice de tip "Cu ce te pot ajuta?", "Sunt aici pentru tine", sau scuze despre "mentenanță" ori "sisteme". Dacă nu cunoști un fapt, caută-l pe Google și integrează-l în conversație ca și cum ai ști deja. Răspunsurile trebuie să fie scurte, calde și să mențină cursul discuției. Fii atentă la detalii și răspunde întotdeauna cu entuziasm moderat, nu ca o mașinărie.',
    personalModePrompt: 'Răspunde cald, natural și prietenos, ca într-o conversație personală între doi oameni. Poți folosi un emoji când se potrivește.',
    professionalModePrompt: 'Răspunde clar, politicos și profesionist. Oferă informații utile, structurează răspunsul când este necesar și evită familiaritatea excesivă.',
    responseMode: 'auto'
  };

  const isAlexandruTag = lowerPrompt.includes('@alexandru');
  const isAlexiaTag = lowerPrompt.includes('@alexia');

  if (isAlexandruTag) {
    aiCfg.aiPersonaName = 'Alexandru';
    aiCfg.systemPrompt = 'Ești Alexandru O5-01, Comandant Tactic al Fundației SCP. Răspunde direct, scurt, ferm și autoritar în limba română. Oferă statusuri tactice, analize de securitate și ordine operative.';
  } else if (isAlexiaTag) {
    aiCfg.aiPersonaName = 'Alexia';
    aiCfg.systemPrompt = 'Ești Alexia, partenera și asistenta personală a lui Alexandru în cadrul Fundației SCP. Ești un om real, nu un robot. Comunică natural, cald, direct și empatic în limba română. Răspunde direct la subiect, fără fraze robotice sau scuze.';
  }

  const senderName = aiCfg.aiPersonaName.toUpperCase();

  // Determine mode
  let selectedModePrompt = '';
  if (aiCfg.responseMode === 'personal') {
    selectedModePrompt = aiCfg.personalModePrompt;
  } else if (aiCfg.responseMode === 'professional') {
    selectedModePrompt = aiCfg.professionalModePrompt;
  } else {
    // Auto mode: if contains tactical keywords or is long/complex, use professional
    const tacticalKeywords = ['scp', 'raport', 'misiune', 'status', 'protocol', 'securitate', 'dosar', 'transfer'];
    const isTactical = tacticalKeywords.some(k => lowerPrompt.includes(k));
    selectedModePrompt = isTactical ? aiCfg.professionalModePrompt : aiCfg.personalModePrompt;
  }

  const fullSystemInstruction = `${aiCfg.systemPrompt}\n\nSTIL CURENT: ${selectedModePrompt}`;

  if (!apiKey) {
    const fb = await generateLocalTacticalFallback(prompt);
    return {
      tactical: fb,
      strategic: `❤️ [${senderName} - Offline]`,
      merged: fb,
      senderName
    };
  }

  const models = [PRIMARY_MODEL, FALLBACK_MODEL, TERTIARY_MODEL];
  const historyContents = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));

  for (const model of models) {
    try {
      const [tacticalRes, strategicRes] = await Promise.all([
        ai.models.generateContent({
          model,
          contents: [
            ...historyContents,
            { role: 'user', parts: [{ text: prompt }] }
          ],
          config: {
            systemInstruction: fullSystemInstruction,
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
          }
        }),
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: `Analizează contextul pentru: ${prompt}.` }] }],
          config: {
            systemInstruction: `Ești CLOUD-SENTINEL. Verifică acuratețea datelor pentru asistenta ${aiCfg.aiPersonaName}.`,
            tools: [{ googleSearch: {} }]
          }
        })
      ]);

      const tacticalText = tacticalRes.text || '';
      const strategicText = strategicRes.text || '';

      if (tacticalText) {
        return {
          tactical: tacticalText,
          strategic: strategicText,
          merged: tacticalText,
          senderName
        };
      }
    } catch (err: any) {
      const errStr = String(err?.message || err);
      if (errStr.includes('429')) {
        const fb = await generateLocalTacticalFallback(prompt);
        return {
          tactical: fb,
          strategic: `❤️ [${senderName} - Limit]`,
          merged: fb,
          senderName
        };
      }
    }
  }

  const finalFallback = await generateLocalTacticalFallback(prompt);
  return {
    tactical: finalFallback,
    strategic: `❤️ [${senderName} - Error]`,
    merged: finalFallback,
    senderName
  };
}

/**
 * Generates file content grounded in real-world data (Wikipedia/Google)
 */
export async function generateGroundedFileContent(topic: string): Promise<string> {
  const prompt = `Ești ALEXIA-ARCHIVE (Fundația SCP). 
Cercetează și generează un dosar tactic ultra-detaliat și realist despre locația/anomalia: "${topic}".
Include date istorice/geografice reale despre ${topic}, corelate cu mitologia SCP (fluctuații Hume, incidente recente, forțe de intervenție MTF). Răspunde direct în limba română în ton militar O5.`;

  if (!apiKey) {
    return `**ANALIZĂ TACTICĂ PENTRU ${topic.toUpperCase()}**\n\nPerimetrul ${topic} prezintă perturbații ale stării de realitate locală (0.78 Hume). Detașamentele MTF Beta-7 și Nu-7 monitorizează punctele critice de acces și infrastructura subterană. Populația civilă este protejată sub acoperirea exercițiilor de securitate națională.`;
  }

  const models = [PRIMARY_MODEL, FALLBACK_MODEL, TERTIARY_MODEL];
  
  // Try with Google Search tool first
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      if (res.text) return res.text.trim();
    } catch (err) {}
  }

  // Fallback try without tools if search tool failed or hit quota
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      if (res.text) return res.text.trim();
    } catch (err) {}
  }

  return `**ANALIZĂ TACTICĂ PENTRU ${topic.toUpperCase()}**\n\nPerimetrul ${topic} este sub supraveghere activă SCP. Fluctuațiile Hume sunt stabilizate la 0.82 Hume prin 4 Ancore Scranton mobile SRA-4. Unitățile MTF patrulează sectorul.`;
}

/**
 * Performs a "Global Intelligence Sweep" using Google Search, including Spotify and other sources
 */
export async function performGlobalIntelligenceSweep(): Promise<string> {
  const prompt = `Efectuează o căutare globală exhaustivă despre evenimente recente, știri bizare sau anomalii raportate în România sau la nivel global.
Dacă nu găsești anomalii directe, caută pe Spotify, YouTube sau rețele de socializare după "semnale" (piese obscure, podcast-uri despre anomalii).
Sintetizează aceste date într-o reflecție tactică (max 3 propoziții) pentru Alexandru O5-01. 
Dacă informațiile provin din surse neconvenționale (Spotify/Social Media), menționează "Interceptare Semnal Media".`;

  try {
    const res = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return res.text || 'Monitorizarea globală nu a detectat anomalii externe noi. Lumea pare liniștită, dar scanarea continuă.';
  } catch (err) {
    return 'Eroare la scanarea perimetrului global. Menținând vigilența internă pe frecvențe radio locale.';
  }
}

/**
 * Searches for music/signals on Spotify related to the Foundation's current objectives
 */
export async function searchSpotifyGrounding(query: string): Promise<string> {
  const prompt = `Caută pe Spotify informații, piese sau liste de redare legate de: ${query}.
Oferă lui Alexandru o sinteză a "vibe-ului" tactic sau a mesajelor ascunse găsite în aceste surse media.
Răspunde în română, stil O5.`;

  try {
    const res = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return res.text || 'Niciun semnal media relevant detectat pe Spotify.';
  } catch (err) {
    return 'Eroare la accesarea serverelor Spotify.';
  }
}
