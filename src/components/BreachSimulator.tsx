import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Siren, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Radio, 
  Flame, 
  Zap, 
  Activity,
  Award
} from 'lucide-react';

export function BreachSimulator() {
  const [activeBreach, setActiveBreach] = useState<boolean>(false);
  const [breachScenario, setBreachScenario] = useState<{
    scpCode: string;
    site: string;
    threat: string;
    humeDrop: string;
    description: string;
  } | null>(null);
  
  const [timerSeconds, setTimerSeconds] = useState<number>(120);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [resolved, setResolved] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (activeBreach && timerSeconds > 0 && !resolved) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && activeBreach && !resolved) {
      setActionLog((prev) => [...prev, '🚨 TIMP EXPIRAT: Nivelul de conținere a eșuat. Eveniment de clasă CK inițiat!']);
    }
    return () => clearInterval(interval);
  }, [activeBreach, timerSeconds, resolved]);

  const handleStartBreach = (code: string, site: string, threat: string, humeDrop: string, desc: string) => {
    setActiveBreach(true);
    setResolved(false);
    setTimerSeconds(90);
    setBreachScenario({ scpCode: code, site, threat, humeDrop, description: desc });
    setActionLog([
      `⚠️ ALERTA ROȘIE DE BREȘĂ: ${code} a părăsit celula din ${site}!`,
      `[SENZOR HUME] Scădere critică la ${humeDrop}.`
    ]);
  };

  const handleAction = (actionName: string, outcomeText: string, humeStabilized: boolean) => {
    setActionLog((prev) => [...prev, `👉 [DIRECTIVĂ O5] Executat: ${actionName}`, `↳ ${outcomeText}`]);
    if (humeStabilized) {
      setResolved(true);
      setActionLog((prev) => [...prev, '✅ BREȘĂ NEUTRALIZATĂ: Stabilitate Hume restabilită la 1.00 Hume.']);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Banner */}
      <div className="bg-[#111b21] border border-red-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222e35]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse">
              <Siren className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-red-400 uppercase tracking-wider">Simulator Interactiv de Breșă de Securitate O5</h3>
              <p className="text-xs text-[#8696a0]">Gestiune de Criză în Timp Real // Protocol de Conținere Rapidă</p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
            <Activity className="w-3 h-3 animate-ping" />
            <span>MODUL INTERACTIV ACTIV</span>
          </div>
        </div>

        {/* Start Breach Scenario Buttons */}
        {!activeBreach ? (
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">Selectează un Scenariu de Breșă pentru Simulare:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleStartBreach('SCP-173', 'Situl-19 (Heavy)', 'Keter / Red', '0.42 Hume', 'Contact vizual pierdut din cauza unei defecțiuni la sistemul optic din celulă.')}
                className="p-4 bg-[#0b141a] hover:bg-[#1a2730] border border-amber-500/40 hover:border-amber-400 rounded-2xl text-left space-y-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">SCP-173</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded">Euclid</span>
                </div>
                <p className="text-xs font-bold text-[#e9edef] group-hover:text-amber-300 transition-colors">Breșă Situl-19 (Contact Vizual)</p>
                <p className="text-[10px] text-[#8696a0]">Cădere senzori optici în celula de beton.</p>
              </button>

              <button
                onClick={() => handleStartBreach('SCP-106', 'Perimetrul Dumbrava / Onești', 'Keter / Critical', '0.28 Hume', 'Extinderea secrețiilor corozive pe o rază de 1.2 km.')}
                className="p-4 bg-[#0b141a] hover:bg-[#1a2730] border border-red-500/40 hover:border-red-400 rounded-2xl text-left space-y-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-400">SCP-106</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[9px] font-bold rounded">Keter</span>
                </div>
                <p className="text-xs font-bold text-[#e9edef] group-hover:text-red-300 transition-colors">Incidentul Onești-Dumbrava</p>
                <p className="text-[10px] text-[#8696a0]">Scădere masivă Hume și coroziune biologică.</p>
              </button>

              <button
                onClick={() => handleStartBreach('SCP-RO-102', 'Metrou Unirii București', 'Keter / Red', '0.35 Hume', 'Fluctuație spațio-temporală necontrolată sub Dâmbovița.')}
                className="p-4 bg-[#0b141a] hover:bg-[#1a2730] border border-pink-500/40 hover:border-pink-400 rounded-2xl text-left space-y-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-pink-400">SCP-RO-102</span>
                  <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 text-[9px] font-bold rounded">Keter</span>
                </div>
                <p className="text-xs font-bold text-[#e9edef] group-hover:text-pink-300 transition-colors">Breșă Subterană București</p>
                <p className="text-[10px] text-[#8696a0]">Efecte memetice și oscilații de realitate.</p>
              </button>
            </div>
          </div>
        ) : (
          /* Active Breach Control Interface */
          <div className="space-y-6">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-red-600 text-white font-mono font-bold text-xs rounded uppercase animate-pulse">
                    BREȘĂ ACTIVĂ
                  </span>
                  <h4 className="font-bold text-sm text-red-300">{breachScenario?.scpCode} — {breachScenario?.site}</h4>
                </div>
                <p className="text-xs text-[#8696a0] mt-1">{breachScenario?.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-mono text-[#8696a0]">Timp Rămas</p>
                  <p className={`text-2xl font-mono font-bold ${timerSeconds < 30 ? 'text-red-500 animate-ping' : 'text-amber-400'}`}>
                    {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveBreach(false);
                    setBreachScenario(null);
                  }}
                  className="px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-xs font-bold text-[#e9edef] rounded-xl border border-[#222e35] transition-colors cursor-pointer"
                >
                  Abandonează
                </button>
              </div>
            </div>

            {/* Decision Actions */}
            {!resolved && timerSeconds > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Directive O5 de Intervenție Tactică (Selectează o acțiune):</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleAction('Dislocare MTF Specializat', 'Detașamentele Beta-7 și Epsilon-11 au asigurat inelul de carantină.', false)}
                    className="p-3 bg-[#0b141a] hover:bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-left text-xs font-bold text-cyan-300 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>1. Trimite Echipele MTF</span>
                  </button>

                  <button
                    onClick={() => handleAction('Activare Ancore Scranton SRA-4', 'Campul de realitate stabilizat la 1.00 Hume standard. Subiectul re-securizat!', true)}
                    className="p-3 bg-[#0b141a] hover:bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 rounded-xl text-left text-xs font-bold text-emerald-300 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2. Activează Ancorele Scranton</span>
                  </button>

                  <button
                    onClick={() => handleAction('Administrare Amnezice Clasa A', 'Populația civilă locală a fost supusă gazării cu Amnezice.', false)}
                    className="p-3 bg-[#0b141a] hover:bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 rounded-xl text-left text-xs font-bold text-pink-300 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>3. Execută Protocol Amnezic</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Log Output */}
            <div className="p-4 bg-[#0b141a] border border-[#222e35] rounded-2xl space-y-2">
              <p className="text-[11px] font-mono font-bold text-[#8696a0] uppercase tracking-wider">Jurnal Operativ de Criză O5:</p>
              <div className="space-y-1 font-mono text-xs max-h-48 overflow-y-auto custom-scrollbar">
                {actionLog.map((log, idx) => (
                  <p key={idx} className={log.includes('✅') ? 'text-emerald-400 font-bold' : log.includes('🚨') ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
