import React, { useState, useEffect } from 'react';
import { RefreshCw, Camera, Clock, Sparkles, Image, CheckCircle2, AlertCircle } from 'lucide-react';

interface AvatarRotationWidgetProps {
  nextChangeTimestamp?: number;
  lastAvatarInfo?: {
    url?: string;
    updatedAt?: string;
    source?: string;
  };
  onTriggerChange?: () => void;
}

export function AvatarRotationWidget({ 
  nextChangeTimestamp, 
  lastAvatarInfo,
  onTriggerChange 
}: AvatarRotationWidgetProps) {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(300);
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(lastAvatarInfo?.url || null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Synchronize countdown timer with target timestamp or default 300 seconds
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const target = nextChangeTimestamp || (now + 300 * 1000);
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setTimeLeftSeconds(diff > 300 ? 300 : diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextChangeTimestamp]);

  useEffect(() => {
    if (lastAvatarInfo?.url) {
      setCurrentAvatarUrl(lastAvatarInfo.url);
    }
  }, [lastAvatarInfo]);

  // Handle immediate manual trigger
  const handleForceChange = async () => {
    if (isChanging) return;
    setIsChanging(true);
    setToastMsg(null);

    try {
      const res = await fetch('/api/whatsapp/update-avatar', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setToastMsg('✨ Schimbare executată cu succes! Imaginea de profil WhatsApp s-a actualizat.');
        if (data.source || data.avatar) {
          setCurrentAvatarUrl(data.source || data.avatar);
        }
        if (onTriggerChange) onTriggerChange();
      } else {
        setToastMsg('⚠️ Nu s-a putut schimba imaginea: ' + (data.error || 'Clientul WhatsApp nu este conectat.'));
      }
    } catch (err: any) {
      setToastMsg('❌ Eroare la conectarea cu serverul: ' + err.message);
    } finally {
      setIsChanging(false);
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  // Format seconds to MM:SS
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, (timeLeftSeconds / 300) * 100));

  return (
    <div className="bg-[#111b21] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
      {/* Background Cyber Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222e35]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-2xl border border-cyan-500/30">
            <Camera className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300">
                Rotire Profil WhatsApp (5-Min Anomaly Shift 🍐)
              </h4>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-mono font-bold">
                AUTOMAT 24/7
              </span>
            </div>
            <p className="text-xs text-[#8696a0]">
              Caută și aplică imagini anomale suprareale din surse online externe la fiecare 5 minute.
            </p>
          </div>
        </div>

        {/* Manual Shift Trigger Button */}
        <button
          onClick={handleForceChange}
          disabled={isChanging}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer border border-white/40"
          title="Execută o schimbare instantanee de imagine de profil acum"
        >
          <RefreshCw className={`w-4 h-4 text-black ${isChanging ? 'animate-spin' : ''}`} />
          <span>{isChanging ? 'Se Schimbă Profilul...' : 'Schimbă Imaginea ACUM 🍐'}</span>
        </button>
      </div>

      {/* Live Countdown Clock Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Timer Box */}
        <div className="bg-[#0b141a] p-4 rounded-2xl border border-cyan-500/30 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 shrink-0">
            <Clock className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8696a0]">Următoarea Schimbare Automată</p>
            <p className="text-2xl font-mono font-extrabold text-cyan-400 tracking-wider">
              {timeFormatted}
            </p>
          </div>
        </div>

        {/* Progress Depletion Bar */}
        <div className="bg-[#0b141a] p-4 rounded-2xl border border-[#222e35] space-y-2 md:col-span-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#8696a0]">Interval 5-Minut Rotire Anomala</span>
            <span className="text-cyan-400 font-bold">{Math.round(progressPercent)}% Rămas</span>
          </div>
          <div className="w-full bg-[#111b21] h-3 rounded-full overflow-hidden border border-[#222e35] p-0.5">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#8696a0] font-mono">
            <span>Ultima actualizare: {lastAvatarInfo?.updatedAt ? new Date(lastAvatarInfo.updatedAt).toLocaleTimeString('ro-RO') : 'Recente'}</span>
            <span className="text-emerald-400 font-bold">Surse Online Unice (Fără Repetare)</span>
          </div>
        </div>
      </div>

      {/* Current Avatar Status Preview */}
      {currentAvatarUrl && (
        <div className="p-3 bg-[#0b141a] border border-[#222e35] rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400/60 shrink-0 shadow-lg bg-black">
            <img 
              src={currentAvatarUrl} 
              alt="Profil SCP Curent" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                // Fallback icon on broken image
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-cyan-300 truncate">Sursa curentă imagine profil:</p>
            <p className="text-[11px] font-mono text-[#8696a0] truncate">{currentAvatarUrl}</p>
          </div>
          <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg text-[10px] font-mono font-bold shrink-0">
            🍐 SCP Active Shift
          </span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-mono flex items-center justify-between animate-in fade-in duration-300">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 font-bold hover:text-white ml-2">✕</button>
        </div>
      )}
    </div>
  );
}
