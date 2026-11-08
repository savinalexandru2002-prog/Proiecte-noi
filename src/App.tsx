import React, { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Smartphone, 
  RefreshCw, 
  Settings, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Zap,
  User,
  Volume2,
  VolumeX,
  Video,
  Play,
  Pause,
  Radio,
  Eye,
  Camera,
  Activity,
  Maximize2,
  Tv,
  Sparkles,
  Wand2,
  WifiOff,
  Download,
  MessageSquare,
  Lock
} from 'lucide-react';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TacticalAnomalyOverlay } from './components/TacticalAnomalyOverlay';
import { WhatsAppWebManager } from './components/WhatsAppWebManager';
import { SCPTransferManager } from './components/SCPTransferManager';
import { MapOverlay } from './components/MapOverlay';
import { SCPDatabaseViewer } from './components/SCPDatabaseViewer';
import { BreachSimulator } from './components/BreachSimulator';
import { AvatarRotationWidget } from './components/AvatarRotationWidget';

import cctvBrasov from './assets/images/cctv_brasov_subterranean_1793728562302.jpg';
import cctvOnesti from './assets/images/cctv_onesti_dumbrava_1793728577062.jpg';
import cctvSite19 from './assets/images/cctv_site19_scp173_1793728606406.jpg';
import cctvBodycam from './assets/images/cctv_mtf_bodycam_1793728622584.jpg';
import scpGuardImg from './assets/images/scp_guard_edit_pinterest.jpg';

const SCP_CAMERAS = [
  {
    id: 'CAM-01',
    channel: 'CH-01',
    name: 'Brașov - Sala Polivalentă & Galeria Subterană',
    sector: 'SECTOR RO-04',
    hume: '0.68 Hume',
    unit: 'MTF Beta-7 „Maz Hatters”',
    description: 'Monitorizare excavații adâncime -24m. Flux video real procesat de Unitatea ALEXIA (2026).',
    image: cctvBrasov,
    videoUrl: '/videos/cam1_brasov.mp4',
    feedCode: 'FEED-LIVE://RO-04-BRASOV-CAV'
  },
  {
    id: 'CAM-02',
    channel: 'CH-02',
    name: 'Dumbrava (Dealul Oanei) & Onești (Dealul Perchiu)',
    sector: 'SECTOR RO-02 / TEZ-14',
    hume: '0.62 Hume',
    unit: 'MTF Epsilon-11 „Nine-Tailed Fox”',
    description: 'Ancore Scranton mobile SRA-4 active. Supraveghere nocturnă forestieră în timp real (2026).',
    image: cctvOnesti,
    videoUrl: '/videos/cam2_onesti.mp4',
    feedCode: 'FEED-LIVE://RO-02-DUMBRAVA-OANEI-PERCHIU'
  },
  {
    id: 'CAM-03',
    channel: 'CH-03',
    name: 'Situl-19 - Celula de Conținere SCP-173',
    sector: 'HEAVY CONTAINMENT / SECTOR-19',
    hume: '1.00 Hume',
    unit: 'Garnizoana Centrală de Securitate O5',
    description: 'Contact vizual permanent confirmat prin Secure-Feed 2026. Procedură de izolare activă.',
    image: cctvSite19,
    videoUrl: '/videos/cam3_site19.mp4',
    feedCode: 'FEED-LIVE://SITE19-CELL-173'
  },
  {
    id: 'CAM-04',
    channel: 'CH-04',
    name: 'MTF Bodycam Live - Masivul Postăvaru & Poiana',
    sector: 'VECTOR POSTĂVARU RO-S3',
    hume: '0.74 Hume',
    unit: 'Detașament Nu-7 „Hammer Down”',
    description: 'Patrulă tactică nocturnă echipată cu Bodycam-X26. Sinteză reală ALEXIA-OMEGA.',
    image: cctvBodycam,
    videoUrl: '/videos/cam4_bodycam.mp4',
    feedCode: 'FEED-LIVE://BODYCAM-NU7-09'
  },
  {
    id: 'CAM-05',
    channel: 'CH-05',
    name: 'Garnizoana Centrală - Gardian Tactic SCP Live',
    sector: 'SECTOR-GUARD // O5 DIRECT PROTOCOL',
    hume: '0.99 Hume',
    unit: 'Unitatea de Gardă și Protecție O5',
    description: 'Personal de securitate în post permanent. Flux video securizat Arhiva 2026.',
    image: scpGuardImg,
    videoUrl: '/videos/cam5_scpguard.mp4',
    feedCode: 'FEED-LIVE://SCP-GUARD-TACTICAL'
  }
];

function TacticalVideoPlayer({
  camera,
  isPlaying,
  pictureMode,
  isMuted,
  onTogglePlay,
  onToggleMute,
}: {
  camera: typeof SCP_CAMERAS[0];
  isPlaying: boolean;
  pictureMode: 'tv_clear' | 'flir' | 'cctv';
  isMuted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showChannelBanner, setShowChannelBanner] = useState(true);

  useEffect(() => {
    setShowChannelBanner(true);
    const timer = setTimeout(() => setShowChannelBanner(false), 2600);
    return () => clearTimeout(timer);
  }, [camera.id, camera.videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, camera.videoUrl]);

  return (
    <div 
      onClick={onTogglePlay}
      className="relative w-full h-full cursor-pointer overflow-hidden group select-none bg-black flex items-center justify-center"
      title="Atinge ecranul pentru a pune pe pauză sau reda transmisiunea TV"
    >
      <video
        ref={videoRef}
        key={camera.videoUrl}
        src={camera.videoUrl}
        poster={camera.image}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onLoadedMetadata={(e) => (e.currentTarget.playbackRate = 2.0)}
        className={`w-full h-full object-cover transition-all duration-300 ${
          pictureMode === 'tv_clear'
            ? 'contrast-[1.08] saturate-[1.12] brightness-[1.02] filter-none'
            : pictureMode === 'flir'
            ? 'grayscale contrast-[1.45] brightness-[1.25] sepia hue-rotate-[90deg]'
            : 'contrast-[1.15] brightness-[0.92] sepia-[0.2]'
        }`}
      />

      {/* Dynamic Tactical Anomaly Canvas Overlay */}
      <TacticalAnomalyOverlay
        cameraId={camera.id}
        channel={camera.channel}
        isPlaying={isPlaying}
        pictureMode={pictureMode}
        isMuted={isMuted}
      />

      {/* Prominent Audio Toggle Button Overlay when muted */}
      {isMuted && isPlaying && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
        >
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-full shadow-2xl text-xs sm:text-sm backdrop-blur transition-all active:scale-95 animate-pulse cursor-pointer border-2 border-white/60">
            <Volume2 className="w-4 h-4 fill-current shrink-0" />
            <span>Apasă pentru Sunet Video (Radio & Ambianță)</span>
          </button>
        </div>
      )}

      {/* Audio Active Badge */}
      {!isMuted && (
        <div className="absolute top-12 sm:top-14 right-3 z-20 pointer-events-none">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-black/80 text-emerald-400 border border-emerald-500/40 rounded text-[9px] font-mono font-bold shadow-lg">
            <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
            AUDIO TV 128 KBPS
          </span>
        </div>
      )}

      {/* Optional CCTV Scanlines only in CCTV mode */}
      {pictureMode === 'cctv' && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-40" />
      )}

      {/* FLIR Night Vision Phosphor tint */}
      {pictureMode === 'flir' && (
        <div className="absolute inset-0 pointer-events-none bg-emerald-500/20 mix-blend-color" />
      )}

      {/* TV Channel Change OSD Banner */}
      {showChannelBanner && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-black/90 text-white rounded-xl border border-cyan-500/60 shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
            <span className="px-2 py-0.5 bg-cyan-500 text-black font-extrabold text-[11px] sm:text-xs font-mono rounded">
              {camera.channel}
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-cyan-300">{camera.name}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-300 font-mono">1080p Full HD • 60 FPS • LIVE TV FEED</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState<any>({
    status: 'connected',
    qr: '',
    config: {
      ownerName: 'Alexandru',
      triggerTag: '@Alexandru',
      requireTagStrict: true,
    }
  });
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'surveillance' | 'whatsapp' | 'scp' | 'database' | 'breach'>('surveillance');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [cameras, setCameras] = useState(SCP_CAMERAS);
  const [selectedCamera, setSelectedCamera] = useState(4);
  const [pictureMode, setPictureMode] = useState<'tv_clear' | 'flir' | 'cctv'>('tv_clear');
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [dbUpdating, setDbUpdating] = useState(false);
  const [dbUpdateToast, setDbUpdateToast] = useState<string | null>(null);
  const [currentTimeCode, setCurrentTimeCode] = useState('');
  const [settingsTab, setSettingsTab] = useState<'general' | 'personality'>('general');
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  // Global Error Suppression for noisy environment logs (Vite/HMR/PWA)
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const msg = args[0]?.toString() || '';
      if (msg.includes('[vite]') || msg.includes('WebSocket') || msg.includes('service-worker')) return;
      originalError(...args);
    };

    console.warn = (...args) => {
      const msg = args[0]?.toString() || '';
      if (msg.includes('[vite]') || msg.includes('HMR') || msg.includes('service-worker')) return;
      originalWarn(...args);
    };

    const handleError = (e: ErrorEvent) => {
      if (e.message?.includes('WebSocket') || e.message?.includes('vite')) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
    };
  }, []);

  // AI Video Generator State
  const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genLocation, setGenLocation] = useState('Brașov - Sala Polivalentă');
  const [genAnomalyType, setGenAnomalyType] = useState('Euclid');

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleGenerateAiVideo = async () => {
    setIsGeneratingVideo(true);
    setGenStep(1);

    const stepTimer = setInterval(() => {
      setGenStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1800);

    try {
      const res = await fetch('/api/video/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraIndex: selectedCamera,
          locationName: genLocation,
          anomalyType: genAnomalyType,
        }),
      });

      clearInterval(stepTimer);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.videoUrl) {
          const updated = [...cameras];
          updated[selectedCamera] = {
            ...updated[selectedCamera],
            name: data.meta.name || updated[selectedCamera].name,
            description: data.meta.description || updated[selectedCamera].description,
            hume: data.meta.hume || updated[selectedCamera].hume,
            videoUrl: data.videoUrl,
          };
          setCameras(updated);
          setIsMuted(false);
          setIsPlayingVideo(true);
          setIsAiGenModalOpen(false);
          setDbUpdateToast(`Transmisiune video generată de AI cu succes! Sunetul radio este activ.`);
        } else {
          alert('Eroare: ' + (data.error || 'Serverul nu a putut genera video-ul.'));
        }
      } else {
        alert('Eroare de comunicare la generarea video AI.');
      }
    } catch (err: any) {
      clearInterval(stepTimer);
      alert('Eroare: ' + err.message);
    } finally {
      setIsGeneratingVideo(false);
      setGenStep(0);
    }
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setStatus(data);
        
        if (data.qr) {
          const url = await QRCode.toDataURL(data.qr, { width: 400, margin: 2 });
          setQrDataUrl(url);
        } else {
          setQrDataUrl('');
        }
      }
    } catch (err) {
      // Ignore network / html fallback errors during server restart
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/history');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setHistory(data.logs || []);
      }
    } catch (err) {
      // Ignore network / html fallback errors during server restart
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchHistory();
    const interval = setInterval(() => {
      fetchStatus();
      fetchHistory();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchHistory]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Force year to 2026 for tactical consistency
      const timeStr = `2026-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString('ro-RO')}.${String(now.getMilliseconds()).padStart(3, '0').slice(0, 2)}`;
      setCurrentTimeCode(timeStr);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateScpDb = async () => {
    setDbUpdating(true);
    try {
      const res = await fetch('/api/scp/update-database', { method: 'POST' });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setDbUpdateToast(`✅ Baza de date SCP a fost actualizată! ${data.zoneCount} zone & ${data.entityCount} dosare sincronizate.`);
          setTimeout(() => setDbUpdateToast(null), 6000);
        } else {
          alert('Eroare la actualizarea bazei de date: ' + (data.error || 'Necunoscută'));
        }
      } else {
        alert('Eroare la actualizarea bazei de date: Serverul a returnat un răspuns nevalid.');
      }
    } catch (e) {
      alert('Eroare de conexiune la actualizarea bazei de date.');
    } finally {
      setDbUpdating(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Ești sigur că vrei să deconectezi asistentul?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/logout', { method: 'POST' });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        await fetchStatus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated = {
      ownerName: formData.get('ownerName'),
      triggerTag: formData.get('triggerTag'),
      requireTagStrict: formData.get('requireTagStrict') === 'on',
      aiPersonaName: formData.get('aiPersonaName'),
      systemPrompt: formData.get('systemPrompt'),
      personalModePrompt: formData.get('personalModePrompt'),
      professionalModePrompt: formData.get('professionalModePrompt'),
      responseMode: formData.get('responseMode'),
    };

    setLoading(true);
    try {
      await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setIsSettingsOpen(false);
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] font-sans">
      {/* Header */}
      <header className="bg-[#111b21] border-b border-[#222e35] px-3 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">WhatsApp AI Assistant</h1>
            <p className="text-xs text-[#8696a0] mt-1 flex items-center gap-1.5">
              {status.status === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
                  Conectat ca {status.device?.notify || status.device?.id?.split(':')[0]}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Așteptare scanare QR
                </>
              )}
            </p>
          </div>
        </div>

        {!status.config.hasApiKey && (
          <div className="bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-red-400 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            <span>Configurați GEMINI_API_KEY în Secrets!</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <PWAInstallButton />
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] border border-cyan-500/40 hover:border-cyan-400 rounded-xl transition-all shadow-md text-xs font-bold cursor-pointer group"
            title="Deschide Panoul de Setări & Toate Comenzile Mutuale"
          >
            <Settings className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
            <span>Setări & Comenzi Mutuale</span>
          </button>
        </div>
      </header>

      {/* Primary Section Switcher Tabs */}
      <div className="bg-[#111b21] border-b border-[#222e35] px-3 sm:px-6 py-2.5 sticky top-0 z-40 backdrop-blur-md bg-[#111b21]/95">
        <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto gap-2 custom-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('surveillance')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'surveillance'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'bg-[#0b141a] text-[#8696a0] hover:text-[#e9edef] border border-[#222e35]'
              }`}
            >
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>Monitor CCTV & Satelit (2026)</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'database'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-400 shadow-lg shadow-pink-500/10'
                  : 'bg-[#0b141a] text-[#8696a0] hover:text-[#e9edef] border border-[#222e35]'
              }`}
            >
              <Lock className="w-4 h-4 text-pink-400" />
              <span>Arhivă & Bază de Date SCP</span>
            </button>

            <button
              onClick={() => setActiveTab('breach')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'breach'
                  ? 'bg-red-500/20 text-red-300 border border-red-400 shadow-lg shadow-red-500/10'
                  : 'bg-[#0b141a] text-[#8696a0] hover:text-[#e9edef] border border-[#222e35]'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Simulator Breșă SCP</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'whatsapp'
                  ? 'bg-[#00a884] text-black font-extrabold shadow-lg shadow-[#00a884]/20'
                  : 'bg-[#0b141a] text-[#8696a0] hover:text-[#e9edef] border border-[#222e35]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Web & Contacte</span>
            </button>

            <button
              onClick={() => setActiveTab('scp')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'scp'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-300 border border-pink-400 shadow-lg shadow-pink-500/10'
                  : 'bg-[#0b141a] text-[#8696a0] hover:text-[#e9edef] border border-[#222e35]'
              }`}
            >
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Transfer SSH2 SCP</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-[#8696a0]">
            <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
            <span>DIRECTIVĂ: Răspunde la @Alexia & @Alexandru</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-3 sm:p-6 md:p-8">
        {activeTab === 'whatsapp' ? (
          <WhatsAppWebManager ownerName={status.config.ownerName} />
        ) : activeTab === 'scp' ? (
          <SCPTransferManager />
        ) : activeTab === 'database' ? (
          <SCPDatabaseViewer />
        ) : activeTab === 'breach' ? (
          <BreachSimulator />
        ) : (
          <div className="space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Connected State */}
            <div className="bg-[#111b21] border border-[#222e35] rounded-3xl p-8 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#00a884]/20 flex items-center justify-center border-4 border-[#00a884] mb-6">
                <CheckCircle2 className="w-12 h-12 text-[#00a884]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Asistentul este ACTIV</h2>
              <p className="text-[#8696a0] max-w-md">
                Aplicația este sincronizată cu contul tău de WhatsApp. 
                Asistentul AI răspunde automat la mesajele care conțin <strong className="text-[#00a884]">{status.config.triggerTag}</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8">
                <div className="bg-[#0b141a] p-4 rounded-2xl border border-[#222e35] text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-[#00a884]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8696a0]">Filtru Activ</span>
                  </div>
                  <p className="text-lg font-mono text-[#00a884] truncate">{status.config.triggerTag}</p>
                </div>

                <div className="bg-[#0b141a] p-4 rounded-2xl border border-cyan-500/40 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Mod Exclusiv</span>
                  </div>
                  <p className="text-xs font-bold text-cyan-300">DOAR Mesaje Directe (1-la-1)</p>
                  <p className="text-[10px] text-[#8696a0] mt-0.5 font-mono">Grupuri Blocate 100%</p>
                </div>

                <div className="bg-[#0b141a] p-4 rounded-2xl border border-[#222e35] text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-[#00a884]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8696a0]">Comandă Raport</span>
                  </div>
                  <p className="text-xs font-bold text-[#e9edef] truncate">{status.config.triggerTag} raport bucurești</p>
                </div>
              </div>

              {/* Strategic Objective Banner */}
              <div className="w-full mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-1000 delay-300">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em]">Obiectiv Strategic // CLOUD-SENTINEL</p>
                  <p className="text-sm font-mono text-cyan-300 font-bold">{status.objective || 'OBIECTIV: SUPRAVEGHERE ACTIVĂ'}</p>
                </div>
              </div>
            </div>

            {/* Profile Picture Rotation & 5-Minute Live Countdown Timer Widget */}
            <AvatarRotationWidget 
              nextChangeTimestamp={status.nextAvatarChangeTimestamp}
              lastAvatarInfo={status.lastAvatarInfo}
              onTriggerChange={fetchStatus}
            />

            <div className="p-6 bg-[#111b21] border border-emerald-500/30 rounded-3xl flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <Bot className="w-6 h-6 text-[#00a884]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#e9edef] mb-1 text-lg">Comenzi AI, Google Maps & Limbaj Uman (Doar Mesaje Directe)</h4>
                  <p className="text-sm text-[#8696a0] leading-relaxed">
                    🗺️ <strong>Integrare Google Maps:</strong> Toate rapoartele de zonă și notificările de incident includ link-uri interactive către Google Maps.<br/>
                    💬 <strong>Ton Uman & Expresiv:</strong> AI-ul oferă răspunsuri fluide, prietenoase și naturale pe WhatsApp.<br/>
                    1. <strong className="text-[#00a884]">@Alexia [Întrebare / Raport Oraș]</strong> – Răspunsuri inteligente umane + rapoarte de zonă cu Google Maps.<br/>
                    2. <strong className="text-[#00a884]">@Raport [Detalii Incident]</strong> – Înregistrează incidentul și trimite locația pe Google Maps.<br/>
                    3. <strong className="text-[#00a884]">@Alexia muzica</strong> – Sugestii Spotify și discuții libere.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
                {[
                  'București', 'Onești', 'Brașov', 'Cluj', 
                  'Timișoara', 'Iași', 'Constanța', 'Craiova', 
                  'Bacău', 'Suceava', 'Sibiu', 'Galați', 
                  'Ploiești', 'Oradea', 'Arad', 'Vrancea',
                  'Tulcea', 'Reșița', 'Buzău', 'Maramureș'
                ].map(city => (
                  <div key={city} className="bg-[#0b141a] px-3 py-2 rounded-xl border border-[#222e35] text-[11px] font-mono flex items-center justify-between">
                    <span className="text-[#8696a0]">Zona:</span>
                    <span className="text-emerald-400 font-bold">{city}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Containment Terminal // Hume Constants & Threat Levels */}
            <div className="bg-[#111b21] border border-cyan-500/30 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between mb-4 pb-3 border-b border-[#222e35] gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300">Terminal Containment // ALEXIA-OMEGA (2026)</h4>
                    <p className="text-xs text-[#8696a0]">Monitorizare constantă Hume & Raportare Zilnică</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const res = await fetch('/api/whatsapp/test-message', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ text: '@Alexandru raport complet' }),
                        });
                        if (res.ok) {
                          await fetchHistory();
                          alert('Raportul Complet Tactic a fost generat și înregistrat în jurnal!');
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Generează imediat Raportul Complet Tactic al Zilei"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    Generare Raport Zilnic
                  </button>
                  <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono rounded-full uppercase animate-pulse">
                    Live Feed Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Brașov - Sala Polivalentă', hume: '0.68 Hume', status: 'Orange (High)', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
                  { name: 'Dumbrava (Dealul Oanei) / Onești (Perchiu)', hume: '0.62 Hume', status: 'Red (Critical)', color: 'border-red-500/40 text-red-400 bg-red-500/10' },
                  { name: 'București - Sector 5', hume: '0.82 Hume', status: 'Caution', color: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10' },
                  { name: 'Cluj - Hoia-Baciu', hume: '0.95 Hume', status: 'Stable', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' }
                ].map((zone, i) => (
                  <div key={i} className="bg-[#0b141a] p-4 rounded-2xl border border-[#222e35] flex flex-col justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#e9edef] truncate">{zone.name}</p>
                      <p className="text-[10px] font-mono text-[#8696a0] mt-0.5">Constanta Hume</p>
                      <p className="text-lg font-mono font-bold text-cyan-400">{zone.hume}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border text-center ${zone.color}`}>
                      {zone.status}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Leaflet Map Overlay */}
              <div className="mt-5 space-y-2">
                <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Harta Interactivă Tactică a Incidentelor SCP (România):</p>
                <MapOverlay location="România - Centru de Comandă O5 Sector RO" lat={45.9432} lng={24.9668} />
              </div>
            </div>

            {/* DB Update Toast Notification */}
            {dbUpdateToast && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-400 font-mono animate-in fade-in slide-in-from-top-2 duration-300">
                <span>{dbUpdateToast}</span>
                <button onClick={() => setDbUpdateToast(null)} className="text-emerald-500 hover:text-emerald-300 font-bold ml-4">✕</button>
              </div>
            )}

            {/* SCP TV Monitor & Live Surveillance Feeds */}
            <div id="scp-video-terminal" className="bg-[#111b21] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222e35]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                    <Tv className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300">Sinteză Video Tactică // ALEXIA-OMEGA (2026)</h4>
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[9px] font-mono font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        SECURE-FEED {currentTimeCode}
                      </span>
                    </div>
                    <p className="text-xs text-[#8696a0]">Sinteză realistă în timp real • Protocol O5-CLR • Arhivă 2026</p>
                  </div>
                </div>

                {/* Picture Modes & TV Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* AI Video Generator Button */}
                  <button
                    onClick={() => {
                      setGenLocation(cameras[selectedCamera].name);
                      setIsAiGenModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/50 hover:to-cyan-600/50 text-cyan-200 rounded-lg border border-cyan-400/50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer animate-pulse"
                    title="Generează o nouă transmisiune video AI cu sunet dedicat"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Lansează Sinteză ALEXIA</span>
                  </button>

                  {/* TV Clar (HD) Button */}
                  <button
                    onClick={() => setPictureMode('tv_clear')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      pictureMode === 'tv_clear'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-500/20 font-bold'
                        : 'bg-[#202c33] text-[#8696a0] border-[#222e35] hover:text-[#e9edef]'
                    }`}
                    title="Imagine clară ca pe ecran TV (fără filtre sau distorsiuni)"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>TV Clar (HD)</span>
                  </button>

                  {/* FLIR Night Vision */}
                  <button
                    onClick={() => setPictureMode(pictureMode === 'flir' ? 'tv_clear' : 'flir')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      pictureMode === 'flir'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-lg font-bold'
                        : 'bg-[#202c33] text-[#8696a0] border-[#222e35] hover:text-[#e9edef]'
                    }`}
                    title="Viziune Termică / Noapte FLIR"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>FLIR Termic</span>
                  </button>

                  {/* CCTV Retro Tactic */}
                  <button
                    onClick={() => setPictureMode(pictureMode === 'cctv' ? 'tv_clear' : 'cctv')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      pictureMode === 'cctv'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                        : 'bg-[#202c33] text-[#8696a0] border-[#222e35] hover:text-[#e9edef]'
                    }`}
                    title="Mod Cameră Supraveghere CCTV"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>CCTV</span>
                  </button>

                  {/* Play / Pause */}
                  <button
                    onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                    className="px-3 py-1.5 bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942] rounded-lg border border-[#222e35] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={isPlayingVideo ? 'Pune video pe pauză' : 'Pornește redarea video'}
                  >
                    {isPlayingVideo ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isPlayingVideo ? 'Pauză' : 'Redă'}</span>
                  </button>

                  {/* Mute / Unmute */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      !isMuted 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-[#202c33] text-[#8696a0] border-[#222e35] hover:text-[#e9edef]'
                    }`}
                    title={isMuted ? 'Activează sunet TV' : 'Oprește sunetul'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  {/* Fullscreen TV Mode */}
                  <button
                    onClick={toggleFullscreen}
                    className="px-2.5 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] rounded-lg border border-[#222e35] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Ecran complet TV"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>

              {/* Channel Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {cameras.map((cam, idx) => (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setSelectedCamera(idx);
                      setIsPlayingVideo(true);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedCamera === idx
                        ? 'bg-cyan-500/15 border-cyan-400/80 shadow-lg text-cyan-300'
                        : 'bg-[#0b141a] border-[#222e35] text-[#8696a0] hover:border-cyan-500/30 hover:text-[#e9edef]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="font-bold flex items-center gap-1 text-white">
                        <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded text-[9px]">
                          {cam.channel}
                        </span>
                        {cam.id}
                      </span>
                      <span className="text-[9px] text-cyan-400 font-bold">{cam.hume}</span>
                    </div>
                    <p className="text-xs font-bold truncate text-[#e9edef]">{cam.name}</p>
                  </button>
                ))}
              </div>

              {/* TV Video Monitor Player */}
              <div 
                ref={videoContainerRef}
                className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-cyan-500/30 shadow-2xl select-none"
              >
                {/* Real Video Player Component */}
                <TacticalVideoPlayer
                  camera={cameras[selectedCamera]}
                  isPlaying={isPlayingVideo}
                  pictureMode={pictureMode}
                  isMuted={isMuted}
                  onTogglePlay={() => setIsPlayingVideo(!isPlayingVideo)}
                  onToggleMute={() => setIsMuted(!isMuted)}
                />

                {/* Paused Overlay */}
                {!isPlayingVideo && (
                  <div 
                    onClick={() => setIsPlayingVideo(true)}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs cursor-pointer text-center p-4 transition-all"
                  >
                    <div className="p-4 bg-cyan-500/20 border border-cyan-400/50 rounded-2xl mb-2 text-cyan-300 shadow-xl">
                      <Play className="w-10 h-10 fill-current" />
                    </div>
                    <span className="font-mono text-sm uppercase tracking-widest text-cyan-300 font-bold">Transmisiune Oprită // Atinge Ecranul Pentru Redare TV</span>
                    <span className="text-xs text-[#8696a0] mt-1 font-mono">Video Real HD • Canal {cameras[selectedCamera].channel}</span>
                  </div>
                )}

                {/* Tactical HUD Header */}
                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between text-[9px] sm:text-[11px] font-mono text-[#e9edef] pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white font-bold rounded text-[8px] sm:text-[10px]">
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white animate-pulse" />
                      REC
                    </span>
                    <span className="bg-black/80 px-2 py-0.5 rounded border border-white/20 font-bold text-white">
                      {cameras[selectedCamera].channel} • {cameras[selectedCamera].id}
                    </span>
                    <span className="bg-black/80 px-2 py-0.5 rounded border border-cyan-500/40 text-cyan-300 font-bold hidden sm:inline">
                      {cameras[selectedCamera].hume}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-black/80 px-2 py-0.5 rounded border border-cyan-400/50 text-cyan-300 font-bold flex items-center gap-1 text-[8px] sm:text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      TV 1080p HD
                    </span>
                    <span className="bg-black/80 px-2 py-0.5 rounded border border-white/20 text-[#8696a0] hidden sm:inline">
                      O5-CLR
                    </span>
                  </div>
                </div>

                {/* Tactical HUD Footer */}
                <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex flex-wrap items-end justify-between text-[9px] sm:text-[11px] font-mono text-[#e9edef] pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] gap-2">
                  <div className="bg-black/80 p-2 rounded-lg border border-white/20 max-w-[70%] sm:max-w-md backdrop-blur-xs">
                    <p className="font-bold text-cyan-300 flex items-center gap-1 truncate text-xs">
                      <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {cameras[selectedCamera].name}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-[#8696a0] line-clamp-1 mt-0.5">
                      {cameras[selectedCamera].description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-black/80 px-2 py-1 rounded-lg border border-white/20 font-bold text-emerald-400 text-[10px] sm:text-xs">
                      {currentTimeCode}
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-cyan-300/80 bg-black/70 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">
                      Atinge pt. Pauză / Play
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111b21] border border-[#222e35] rounded-3xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 bg-[#202c33] border-b border-[#222e35] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-[#00a884] ${loading ? 'animate-spin' : ''}`} />
                  <h4 className="font-bold text-sm uppercase tracking-wider">Istoric Mesaje Live</h4>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={async () => {
                      if(!confirm('Ștergi istoricul afișat?')) return;
                      const res = await fetch('/api/whatsapp/history/clear', { method: 'POST' });
                      const contentType = res.headers.get('content-type');
                      if (res.ok && contentType && contentType.includes('application/json')) {
                        fetchHistory();
                      } else {
                        alert('Eroare la ștergerea istoricului.');
                      }
                    }}
                    className="text-[10px] text-red-500 hover:underline font-bold uppercase"
                  >
                    Șterge Jurnal
                  </button>
                  <span className="text-[10px] text-[#8696a0] font-mono">Ultimele 50 mesaje</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#222e35] text-[#8696a0] font-bold uppercase tracking-tighter">
                      <th className="px-6 py-3">Ora</th>
                      <th className="px-6 py-3">Expeditor</th>
                      <th className="px-6 py-3">Mesaj Primit</th>
                      <th className="px-6 py-3">Tag @</th>
                      <th className="px-6 py-3">Status / Răspuns AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222e35]">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[#8696a0]">
                          Niciun mesaj înregistrat încă. Trimite un mesaj de test!
                        </td>
                      </tr>
                    ) : (
                      history.map((log) => (
                        <tr key={log.id} className={`hover:bg-[#202c33]/30 transition-colors ${log.isFromMe ? 'bg-[#00a884]/5' : ''}`}>
                          <td className="px-6 py-4 font-mono text-[#8696a0] whitespace-nowrap">{log.timestamp}</td>
                          <td className="px-6 py-4 font-bold text-[#e9edef] whitespace-nowrap flex items-center gap-2">
                            {log.sender}
                            {log.isFromMe && <span className="text-[9px] bg-[#00a884] text-white px-1 rounded">TU</span>}
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate text-[#8696a0]" title={log.text}>{log.text}</td>
                          <td className="px-6 py-4">
                            {log.hasTag ? (
                              <span className="bg-[#00a884]/20 text-[#00a884] px-2 py-0.5 rounded text-[10px] font-bold">DA</span>
                            ) : (
                              <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold">NU</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {log.status === 'replied' ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#00a884] font-bold flex items-center gap-1 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" /> TRIMIS
                                  </span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => {
                                          if (!('speechSynthesis' in window)) {
                                            alert('Sinteza vocală nu este suportată în acest browser.');
                                            return;
                                          }
                                          if (playingId === log.id) {
                                            window.speechSynthesis.cancel();
                                            setPlayingId(null);
                                            return;
                                          }
                                          window.speechSynthesis.cancel();
                                          setPlayingId(log.id);

                                          const cleanText = log.reply
                                            .replace(/[*#_`>\[\]()-]/g, ' ')
                                            .replace(/https?:\/\/\S+/g, 'link Google Maps');

                                          const utterance = new SpeechSynthesisUtterance(cleanText);
                                          utterance.lang = 'ro-RO';
                                          utterance.rate = 1.0;
                                          utterance.pitch = 1.0;

                                          const voices = window.speechSynthesis.getVoices();
                                          const roVoice = voices.find(v => v.lang.toLowerCase().includes('ro'));
                                          if (roVoice) utterance.voice = roVoice;

                                          utterance.onend = () => setPlayingId(null);
                                          utterance.onerror = () => setPlayingId(null);

                                          window.speechSynthesis.speak(utterance);
                                        }}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all text-[10px] font-bold cursor-pointer ${
                                          playingId === log.id 
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse' 
                                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                                        }`}
                                        title={playingId === log.id ? "Oprește redarea" : "Ascultă raportul vocal"}
                                      >
                                        <Volume2 className={`w-3 h-3 ${playingId === log.id ? 'text-amber-400' : 'text-cyan-400'}`} />
                                        {playingId === log.id ? 'Stop' : 'Audio'}
                                      </button>

                                      <button
                                        onClick={() => {
                                          const lower = (log.reply || '').toLowerCase();
                                          if (lower.includes('guard') || lower.includes('gardian') || lower.includes('soldat') || lower.includes('pinterest') || lower.includes('garnizoan')) setSelectedCamera(4);
                                          else if (lower.includes('onesti') || lower.includes('dumbrava') || lower.includes('oanei') || lower.includes('perchiu')) setSelectedCamera(1);
                                          else if (lower.includes('173') || lower.includes('situl-19')) setSelectedCamera(2);
                                          else if (lower.includes('postavaru') || lower.includes('bodycam') || lower.includes('poiana')) setSelectedCamera(3);
                                          else setSelectedCamera(0);

                                          setIsPlayingVideo(true);
                                          const el = document.getElementById('scp-video-terminal');
                                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 rounded-lg transition-all text-[10px] font-bold cursor-pointer"
                                        title="Deschide transmisiunea video TV Full HD pentru această zonă"
                                      >
                                        <Tv className="w-3 h-3 text-cyan-400" />
                                        Video TV
                                      </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-[#8696a0] italic line-clamp-2">{log.reply}</p>
                              </div>
                            ) : log.status === 'ignored_no_tag' ? (
                              <span className="text-[#8696a0] flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> Ignorat (lipsă tag)
                              </span>
                            ) : log.status === 'error' ? (
                              <span className="text-red-500 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Eroare: {log.error?.slice(0, 20)}...
                              </span>
                            ) : (
                              <span className="text-amber-400 animate-pulse uppercase font-bold tracking-tighter">Procesare...</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Settings & Mutual Commands Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#111b21] w-full max-w-xl rounded-3xl border border-cyan-500/40 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#1a2730] border-b border-[#222e35] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                  <Settings className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-cyan-300 uppercase tracking-wider">Centru de Control</h3>
                  <p className="text-[10px] text-[#8696a0]">Configurație {status.config.aiPersonaName} (2026)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="p-1 hover:bg-white/10 rounded-lg text-[#8696a0] hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="bg-[#1a2730] px-6 flex items-center gap-4 border-b border-[#222e35] shrink-0">
              <button 
                onClick={() => setSettingsTab('general')}
                className={`py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${settingsTab === 'general' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-[#8696a0] hover:text-white'}`}
              >
                General
              </button>
              <button 
                onClick={() => setSettingsTab('personality')}
                className={`py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${settingsTab === 'personality' ? 'border-pink-400 text-pink-300' : 'border-transparent text-[#8696a0] hover:text-white'}`}
              >
                Personalitate AI
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
                {settingsTab === 'general' ? (
                  <>
                    {/* Mutual Actions Panel */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Comenzi Mutuale & Acțiuni Rapide
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Signal Encryption Repair */}
                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const res = await fetch('/api/whatsapp/repair-sessions', { method: 'POST' });
                              const contentType = res.headers.get('content-type');
                              if (res.ok && contentType && contentType.includes('application/json')) {
                                const data = await res.json();
                                if (data.success) {
                                  alert(`Sesiunile de criptare Signal au fost resincronizate cu succes (${data.repairedSessions} ratchete curățate). Erorile Bad MAC au fost rezolvate!`);
                                } else {
                                  alert('Nu s-au putut resincroniza sesiunile.');
                                }
                              } else {
                                alert('Eroare: Răspuns server nevalid la repararea sesiunilor.');
                              }
                            } catch (e) {
                              alert('Eroare de conexiune la resincronizarea sesiunilor.');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-2xl transition-all text-left flex items-start gap-3 cursor-pointer group"
                        >
                          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-xs">Repară Criptare Signal</p>
                            <p className="text-[10px] text-[#8696a0] mt-0.5">Resincronizează cheile Signal & elimină erorile Bad MAC</p>
                          </div>
                        </button>

                        {/* Pinterest Avatar */}
                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const res = await fetch('/api/whatsapp/set-pinterest-avatar', { method: 'POST' });
                              const contentType = res.headers.get('content-type');
                              if (res.ok && contentType && contentType.includes('application/json')) {
                                const data = await res.json();
                                if (data.success) {
                                  alert(`Poza de profil WhatsApp a fost setată cu succes cu ${status.config.aiPersonaName}!`);
                                } else {
                                  alert('Nu s-a putut seta poza: ' + (data.error || data.reason || 'Eroare'));
                                }
                              } else {
                                alert('Eroare: Răspuns server nevalid la setarea pozei.');
                              }
                            } catch (e) {
                              alert('Eroare la setarea pozei.');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="p-3 bg-purple-500/10 hover:bg-purple-500/20 text-pink-300 border border-pink-500/30 rounded-2xl transition-all text-left flex items-start gap-3 cursor-pointer group"
                        >
                          <Sparkles className="w-5 h-5 text-pink-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-xs">Poză Personalitate</p>
                            <p className="text-[10px] text-[#8696a0] mt-0.5">Setează instant poza de profil pentru {status.config.aiPersonaName}</p>
                          </div>
                        </button>

                        {/* 5-Min Avatar Rotation */}
                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const res = await fetch('/api/whatsapp/update-avatar', { method: 'POST' });
                              const contentType = res.headers.get('content-type');
                              if (res.ok && contentType && contentType.includes('application/json')) {
                                const data = await res.json();
                                if (data.success) {
                                  alert('Poza de profil a fost rotită cu succes pe WhatsApp! (Se schimbă automat din 5 în 5 minute).');
                                } else {
                                  alert('Nu s-a putut schimba poza de profil: ' + (data.error || data.reason || 'Eroare necunoscută'));
                                }
                              } else {
                                alert('Eroare: Răspuns server nevalid la actualizarea pozei.');
                              }
                            } catch (e) {
                              alert('Eroare la actualizarea pozei de profil.');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="p-3 bg-[#00a884]/10 hover:bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/30 rounded-2xl transition-all text-left flex items-start gap-3 cursor-pointer group"
                        >
                          <Bot className="w-5 h-5 text-[#00a884] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-xs">Rotație Poză 5 Min</p>
                            <p className="text-[10px] text-[#8696a0] mt-0.5">Schimbare forțată a imaginii din rotația automată</p>
                          </div>
                        </button>

                        {/* Test AI Message */}
                        <button
                          type="button"
                          onClick={async () => {
                            const text = prompt(`Introdu un mesaj de test (include ${status.config.triggerTag}):`, `${status.config.triggerTag} salut!`);
                            if (!text) return;
                            setLoading(true);
                            try {
                              const res = await fetch('/api/whatsapp/test-message', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text }),
                              });
                              const contentType = res.headers.get('content-type');
                              if (res.ok && contentType && contentType.includes('application/json')) {
                                await fetchHistory();
                                alert('Mesaj de test procesat cu succes de AI!');
                              } else {
                                alert('Eroare: Testul AI a eșuat pe server.');
                              }
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-2xl transition-all text-left flex items-start gap-3 cursor-pointer group"
                        >
                          <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-xs">Testează Răspuns AI</p>
                            <p className="text-[10px] text-[#8696a0] mt-0.5">Trimite o întrebare sau comandă de probă</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#222e35]">
                      <p className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">Identitate & Tag</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider">Nume Titular (Tu)</label>
                          <input 
                            name="ownerName" 
                            defaultValue={status.config.ownerName}
                            className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-4 py-2.5 text-xs text-[#e9edef] focus:outline-none focus:border-[#00a884] transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider">Tag-uri Declanșatoare (separate prin virgulă)</label>
                          <input 
                            name="triggerTag" 
                            defaultValue={status.config.triggerTag}
                            placeholder="@Alexia, @Alexandru"
                            className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-4 py-2.5 text-xs font-mono text-[#00a884] focus:outline-none focus:border-[#00a884] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#0b141a] border border-[#222e35] rounded-2xl">
                        <div>
                          <p className="font-bold text-xs">Filtru Strict</p>
                          <p className="text-[10px] text-[#8696a0]">Răspunde DOAR la mesaje care conțin eticheta {status.config.triggerTag}</p>
                        </div>
                        <input 
                          type="checkbox" 
                          name="requireTagStrict" 
                          defaultChecked={status.config.requireTagStrict}
                          className="w-5 h-5 accent-[#00a884] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* QR Code Re-pairing */}
                    <div className="pt-4 border-t border-[#222e35] space-y-3">
                      <p className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">Conexiune WhatsApp</p>
                      {status.status === 'qr' && qrDataUrl ? (
                        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl">
                          <img src={qrDataUrl} alt="WhatsApp QR" className="w-48 h-48" />
                          <p className="text-[10px] text-black font-bold text-center uppercase tracking-tighter">Scanează pentru reconectare</p>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#0b141a] border border-[#222e35] rounded-2xl flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-[#8696a0]">Status: <span className="text-[#00a884] font-bold uppercase">{status.status}</span></p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={() => {
                                if (status.status === 'connected') {
                                  if (confirm('Vrei să forțezi o nouă scanare QR?')) handleLogout();
                                } else fetchStatus();
                              }}
                              className="px-3 py-1.5 bg-[#202c33] text-[#e9edef] border border-[#222e35] rounded-xl text-[10px] font-bold hover:bg-[#2a3942] transition-colors cursor-pointer"
                            >
                              Reset Conexiune
                            </button>
                            <button 
                              type="button"
                              onClick={handleLogout}
                              className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-[10px] font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <LogOut className="w-3 h-3" />
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between">
                         <p className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-2">
                            <Bot className="w-4 h-4 text-pink-400" />
                            Reguli Comune
                         </p>
                         <div className="bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/30 text-[10px] text-pink-400 font-bold uppercase">
                            {status.config.aiPersonaName} răspunde acum
                         </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider">Nume Personalitate AI</label>
                        <input 
                          name="aiPersonaName" 
                          defaultValue={status.config.aiPersonaName}
                          className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-4 py-2.5 text-xs text-[#e9edef] focus:outline-none focus:border-pink-400 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider">System Prompt (Instrucțiuni Core)</label>
                        <textarea 
                          name="systemPrompt" 
                          rows={6}
                          defaultValue={status.config.systemPrompt}
                          className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-4 py-3 text-xs text-[#e9edef] focus:outline-none focus:border-pink-400 transition-colors resize-none leading-relaxed font-sans"
                        />
                        <p className="text-[10px] text-[#8696a0] italic">Definește identitatea, limba obligatorie și regulile generale de comportament.</p>
                      </div>

                      <div className="pt-4 border-t border-[#222e35] space-y-4">
                        <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Două căi de răspuns</p>
                        <p className="text-[10px] text-[#8696a0]">Alege automat stilul potrivit sau fixează unul singur pentru toate mesajele.</p>
                        
                        <select 
                          name="responseMode"
                          defaultValue={status.config.responseMode}
                          className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-4 py-2.5 text-xs text-[#e9edef] focus:outline-none focus:border-cyan-400 transition-colors"
                        >
                          <option value="auto">Automat (Sistemul alege stilul optim)</option>
                          <option value="personal">Mod personal (Cald și prietenos)</option>
                          <option value="professional">Mod profesional (Clar și concis)</option>
                        </select>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                               <Sparkles className="w-3 h-3" /> Mod personal
                            </label>
                            <textarea 
                              name="personalModePrompt" 
                              rows={4}
                              defaultValue={status.config.personalModePrompt}
                              className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-4 py-3 text-[11px] text-[#e9edef] focus:outline-none focus:border-emerald-400 transition-colors resize-none leading-relaxed"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                               <ShieldCheck className="w-3 h-3" /> Mod profesional
                            </label>
                            <textarea 
                              name="professionalModePrompt" 
                              rows={4}
                              defaultValue={status.config.professionalModePrompt}
                              className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-4 py-3 text-[11px] text-[#e9edef] focus:outline-none focus:border-cyan-400 transition-colors resize-none leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {loading ? 'Sincronizare Setări...' : 'Salvează Configurația Globală'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Video Generator Modal */}
      {isAiGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111b21] w-full max-w-lg rounded-3xl border border-cyan-500/50 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#1a2730] border-b border-[#222e35] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-cyan-300 uppercase tracking-wider">Unitatea de Sinteză ALEXIA-OMEGA // Model 2026</h3>
                  <p className="text-[10px] text-[#8696a0]">Generare flux video ultra-realist cu inteligență tactică</p>
                </div>
              </div>
              <button 
                onClick={() => !isGeneratingVideo && setIsAiGenModalOpen(false)} 
                disabled={isGeneratingVideo}
                className="p-1 hover:bg-white/10 rounded-lg text-[#8696a0] hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Target Location Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Zonă sau Obiectiv SCP
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Garnizoana SCP - Gardian Tactic (Pinterest)',
                    'Brașov - Sala Polivalentă',
                    'Dumbrava (Dealul Oanei) & Onești',
                    'Situl-19 - Celula SCP-173',
                    'MTF Bodycam - Poiana Brașov',
                    'Cluj - Pădurea Hoia-Baciu',
                    'București - Sectorul 5'
                  ].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      disabled={isGeneratingVideo}
                      onClick={() => setGenLocation(loc)}
                      className={`p-2 rounded-xl text-left border text-[11px] font-mono transition-all cursor-pointer ${
                        genLocation === loc
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-[#0b141a] border-[#222e35] text-[#8696a0] hover:border-cyan-500/30 hover:text-[#e9edef]'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    disabled={isGeneratingVideo}
                    value={genLocation}
                    onChange={(e) => setGenLocation(e.target.value)}
                    placeholder="Sau introdu o altă zonă din România..."
                    className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-4 py-2.5 text-xs text-[#e9edef] focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* Threat Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">
                  Nivel de Amenințare & Conținere
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { level: 'Safe', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
                    { level: 'Euclid', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
                    { level: 'Keter', color: 'border-red-500/40 text-red-400 bg-red-500/10' }
                  ].map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      disabled={isGeneratingVideo}
                      onClick={() => setGenAnomalyType(item.level)}
                      className={`py-2 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                        genAnomalyType === item.level
                          ? `${item.color} border-current ring-1 ring-current`
                          : 'bg-[#0b141a] border-[#222e35] text-[#8696a0] hover:text-[#e9edef]'
                      }`}
                    >
                      {item.level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation Progress Indicator */}
              {isGeneratingVideo && (
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                      Sinteză Video & Audio în desfășurare...
                    </span>
                    <span className="font-mono text-[10px] text-cyan-400">Etapa {genStep || 1}/3</span>
                  </div>

                  <div className="w-full h-1.5 bg-[#0b141a] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${(genStep || 1) * 33.3}%` }}
                    />
                  </div>

                  <p className="text-[10px] font-mono text-[#8696a0] text-center">
                    {genStep === 1 && 'Etapa 1/3: Consultare Directiva O5 & Sinteză Vector...'}
                    {genStep === 2 && 'Etapa 2/3: Randare Video 1080p cu Dinamică Optică...'}
                    {genStep >= 3 && 'Etapa 3/3: Mixare Piste Audio Tactică & Radio MTF...'}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                disabled={isGeneratingVideo}
                onClick={handleGenerateAiVideo}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{isGeneratingVideo ? 'Se generează transmisiunea...' : 'Lansează Generarea Video AI (MP4 + Audio)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <OfflineIndicator />
    </div>
  );
}
