# Hub Complet SCP O5 // Terminal Tactic & Centru de Comandă Globală (2026)

Plan de extindere și arhitectură pentru dezvoltarea celei mai complete aplicații SCP, integrând un Hub Tactic de Comandă O5 cu transmisiuni live CCTV, hartă interactivă a incidentelor, bază de date clasificată SCP, simulator de breșă și integrare WhatsApp bidirecțională.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Toate opțiunile au fost confirmate în Turnul 1 de clarificare și vor păstra în totalitate sistemele existente (WhatsApp Web, Baileys Auth, server SSH2 SCP, sinteză AI Gemini și canale CCTV HD).

- **Orientare confirmată**: Hub complet SCP O5 cu Terminal Tactic, Hărți Interactive, Bază de Date SCP, Simulator de Breșă și Transmisiuni CCTV Live.
- **Stil Vizual confirmat**: Stil militar O5 cyberpunk / dark militar cu senzori HUD, terminale de comandă, indicatori Hume și estetică tactică de înaltă precizie.
- **Integrare și Continuitate**: Păstrarea și îmbunătățirea tuturor funcționalităților existente (WhatsApp Web, asistenții duali Alexia și Alexandru O5-01, generare video AI, transferuri criptate SSH2 SCP).

---

## 1. Overview & Core Concept

### What It Does
Aplicația devine centrul suprem de comandă și supraveghere O5 pentru Fundația SCP România și Global. Oferă operatorilor și comandantului Alexandru O5-01 o interfață tactică unificată pentru:
1. **Monitor CCTV & Transmisiuni Live (5 Canale)**: Fluxuri video Full HD cu filtre FLIR/CCTV, anomali senzor și control audio radio.
2. **Terminal Tactic & Hărți Interactive de Incident**: Hartă globală și națională (Leaflet / Google Maps) cu puncte anomale, stări Hume în timp real și generare de rapoarte tactice detaliate.
3. **Arhivă & Bază de Date Clasificată SCP**: Dosare detaliate pentru entități SCP (SCP-173, SCP-106, SCP-096, SCP-087-B, SCP-RO-102 etc.), căutare avansată, nivele de acces O5 și fișe de conținere.
4. **Simulator Interactiv de Breșă de Securitate (Breach Protocol)**: Simulator dinamic de criză cu decizii O5 în timp real, alerte sonore, numărătoare inversă și izolare de urgență.
5. **WhatsApp Web Manager & Asistent AI Dual (Alexia & Alexandru)**: Răspunsuri umane empatici de la Alexia și directive militare autoritare de la Alexandru O5-01, cu rapoarte automate și imagini atașate.
6. **Centru de Transfer Criptat SCP (SSH2 / SFTP)**: Gestionare servere externe și expediere de rapoarte clasificate cu integritate SHA-256.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Comandă Tactică & Supraveghere**:
   - Operatorul comută între Canalele CCTV (CH-01 la CH-05) și aplică modul FLIR sau TV Clar.
   - Atinge o zonă de pe Harta Interactivă pentru a deschide dosarul tactic al incidentului și a genera un raport cu imagine senzor.
2. **Consultare Bază de Date SCP**:
   - Operatorul caută un cod SCP sau o zonă (ex: "București", "SCP-106") și filtrează după clasă (Safe, Euclid, Keter).
   - Deschide fișa completă cu instructajul de conținere, constantele Hume și capturile senzor.
3. **Simulatorul de Breșă de Securitate**:
   - Declansarea manuală sau automată a unui Protocol de Breșă (ex: "Breșă de Conținere SCP-173 în Situl-19").
   - Operatorul alege directive O5 (ex: "Activează Ancorele Scranton", "Deploy MTF Epsilon-11", "Izolare Termobarică") cu impact direct pe starea sistemului.
4. **Conversație WhatsApp & Generare Rapoarte**:
   - Trimiterea unui mesaj cu etichetele `@Alexia` sau `@Alexandru` din WhatsApp sau din simulatorul web.
   - Primirea promptă a rapoartelor cu hărți interactive și imagini de identificare.

### Visual Identity & Theme
- **Aesthetic Direction**: Cyberpunk militar O5 dark, senzori HUD de înaltă definiție, ecran tactu-militar cu accente neon cyan (`#06b6d4`), emerald (`#10b981`), amber (`#f59e0b`) și crimson (`#ef4444`).
- **Typography & Hierarchy**:
  - *Display & Headings*: `Plus Jakarta Sans` / `Outfit` fonturi geometrice îndrăznețe pentru titluri O5.
  - *Data & Telemetry*: `JetBrains Mono` cu cifre tabulare (`tabular-nums`) pentru timestamp-uri 2026, indici Hume și coduri de dosar.
- **Component Styling & Layout**:
  - Panouri negru-saturat (`#0b141a` canvas, `#111b21` suprafețe) cu borduri fine de 1px (`border border-[#222e35]`).
  - Fără badge-uri sau pilule statice; metadatele folosesc text curat cu separatori tipografici (`·`, `/`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Integrare Hărți Interactive Duale (Leaflet & Google Maps)**
  - *Chosen Approach*: Utilizarea Leaflet în interfața web pentru vizualizare interactivă zero-cost și Google Maps direct links / static maps pentru WhatsApp.
  - *Why*: Asigură o experiență fluidă și rapidă în browser fără blocaje de API key, menținând totodată compatibilitatea pe WhatsApp.

- **Decision 2: Personaje AI Distincte (Alexia vs. Alexandru O5-01)**
  - *Chosen Approach*: Selectarea automată a instrucțiunilor de sistem bazată pe tag-ul folosit (`@Alexia` - prietenoasă, caldă, umană; `@Alexandru` - militară, fermă, comandant O5).
  - *Why*: Răspunde exact cerinței de a avea doi agenți distincti cu personalități complementare în cadrul Fundației SCP.

- **Decision 3: Simulator Interactiv de Breșă O5**
  - *Chosen Approach*: Un modul dedicat în tab-ul de monitorizare cu stări interactive, alerte audio opționale și arbore de decizie O5.
  - *Why*: Oferă cea mai captivantă experiență interactivă SCP fără a complica fluxul de transmisie WhatsApp.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SCP O5 COMMAND HUB UI                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ CCTV & TV FEED   │  │ INTERACTIVE MAP  │  │ SCP DATABASE &       │  │
│  │ (5 Live Channels)│  │ (Leaflet Engine) │  │ BREACH SIMULATOR     │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────┘  │
│           │                     │                       │              │
│           └─────────────────────┼───────────────────────┘              │
│                                 ▼                                      │
│                      REACT APP (App.tsx)                               │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ REST API / WebSocket
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND (server.ts)                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ BAILEYS WA SOCK  │  │ GEMINI AI ENGINE │  │ SSH2 SCP FILE ENGINE │  │
│  │ (@whiskeysockets)│  │ (@google/genai)  │  │ (scp-service.ts)     │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────┘  │
└───────────┼─────────────────────┼───────────────────────┼──────────────┘
            │                     │                       │
            ▼                     ▼                       ▼
    ┌──────────────┐     ┌──────────────────┐    ┌─────────────────┐
    │ WHATSAPP NET │     │ GOOGLE SEARCH &  │    │ CLOUD SQL DB    │
    │ (Direct Messages) │ GROUNDING        │    │ (drizzle-orm)   │
    └──────────────┘     └──────────────────┘    └─────────────────┘
```

### Component & State Mapping

1. **`App.tsx` (Root Navigation & Header)**:
   - Administrează tab-urile principale (`surveillance`, `database`, `whatsapp`, `scp`, `breach`).
   - Sincronizează configurația globală și notificările din Cloud SQL.

2. **`TacticalAnomalyOverlay.tsx` & `TacticalVideoPlayer`**:
   - Redă canalele video CCTV cu filtre FLIR/CCTV/Clear TV și senzori de interferență anomala.

3. **`MapOverlay.tsx` (Leaflet Interactive Map)**:
   - Afișează harta cu marcaje roșii pentru incidentele SCP și stările Hume ale fiecărui oraș.

4. **`SCPDatabaseViewer.tsx` (Nou - Baza de Date SCP)**:
   - Interfață de explorare și căutare a entităților SCP, cu fișe tehnice, clase de conținere și rapoarte de cercetare.

5. **`BreachSimulator.tsx` (Nou - Simulator de Breșă)**:
   - Modul interactiv de simulare a scenariilor de criză cu alegeri tactice de intervenție MTF și izolare de urgență.

6. **`server.ts` & `team-ai.ts`**:
   - Procesează mesajele recepționate de Baileys WhatsApp.
   - Selectează persona în funcție de tag (`@Alexia` sau `@Alexandru`).
   - Generează rapoarte cu Google Grounding și atașează imagini senzoriale de identificare.

---

## Summary of Planned Changes

1. **Completare & Rafinare UI/UX**:
   - Adăugarea tab-ului **Bază de Date SCP** cu căutare și fișe tehnice complete.
   - Adăugarea tab-ului **Simulator de Breșă de Securitate** cu scenarii interactive.
2. **Îmbunătățirea Hărții Leaflet (`MapOverlay.tsx`)**:
   - Integrare directă în panoul principal cu afișare de marcaje pentru toate zonele anomale din România (București, Brașov, Onești, Cluj, Timișoara etc.).
3. **Consolidare Backend & Asistenți Duali**:
   - Asigurarea funcționării ireproșabile a ambilor asistenți (`Alexia` și `Alexandru`) pe WhatsApp.
   - Atașarea automată a pozelor de identificare la rapoartele solicitate pe WhatsApp.
