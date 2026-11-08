import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Server, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Hash, 
  Plus, 
  Trash2, 
  Key, 
  Terminal, 
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  ExternalLink
} from 'lucide-react';

interface ScpServer {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: string;
  status: string;
  createdAt: string;
}

interface ScpTransfer {
  id: number;
  serverId?: number;
  serverName: string;
  filename: string;
  remotePath: string;
  direction: 'upload' | 'download';
  sizeBytes: number;
  status: string;
  sha256?: string;
  initiatedBy: string;
  error?: string;
  timestamp: string;
}

function isInternalHost(host: string): boolean {
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

export function SCPTransferManager() {
  const [servers, setServers] = useState<ScpServer[]>([]);
  const [transfers, setTransfers] = useState<ScpTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{ id: number; success: boolean; message: string; latencyMs?: number } | null>(null);

  // Form states
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [nodeType, setNodeType] = useState<'intranet' | 'external'>('intranet');
  const [newServer, setNewServer] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    authType: 'password',
    encryptedAuth: ''
  });

  // Transfer state
  const [selectedServerId, setSelectedServerId] = useState<number | ''>('');
  const [transferDirection, setTransferDirection] = useState<'upload' | 'download'>('upload');
  const [transferFilename, setTransferFilename] = useState('raport_misiune_scp.txt');
  const [transferRemotePath, setTransferRemotePath] = useState('/var/scp/vault');
  const [transferContent, setTransferContent] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);

  // Download Animation state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStep, setDownloadStep] = useState('');

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/scp/servers');
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers || []);
        if (data.servers && data.servers.length > 0 && selectedServerId === '') {
          setSelectedServerId(data.servers[0].id);
        }
      }
    } catch (e) {}
  };

  const fetchTransfers = async () => {
    try {
      const res = await fetch('/api/scp/transfers');
      if (res.ok) {
        const data = await res.json();
        setTransfers(data.transfers || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchServers();
    fetchTransfers();
    const interval = setInterval(() => {
      fetchTransfers();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTestConnection = async (id: number) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/scp/servers/${id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResult({ 
        id, 
        success: data.success, 
        message: data.message || (data.success ? 'Conexiune reușită' : 'Eșec conexiune'), 
        latencyMs: data.latencyMs 
      });
    } catch (e) {
      setTestResult({ id, success: false, message: 'Eroare de comunicare la testul conexiunii.' });
    } finally {
      setTestingId(null);
    }
  };

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServer.name || !newServer.host || !newServer.username) return;
    setLoading(true);
    try {
      const res = await fetch('/api/scp/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServer),
      });
      if (res.ok) {
        await fetchServers();
        setIsAddServerOpen(false);
        setNewServer({ name: '', host: '', port: 22, username: '', authType: 'password', encryptedAuth: '' });
      } else {
        alert('Eroare la adăugarea serverului.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = async (id: number) => {
    if (!confirm('Ești sigur că vrei să elimini acest server SCP din configurație?')) return;
    try {
      await fetch(`/api/scp/servers/${id}`, { method: 'DELETE' });
      await fetchServers();
    } catch (e) {}
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServerId) {
      alert('Selectează un server țintă.');
      return;
    }

    if (transferDirection === 'download') {
      setIsDownloading(true);
      setDownloadStep('Inițiere protocol SSH2...');
      setTimeout(() => setDownloadStep('Scanare sector remote...'), 1000);
      setTimeout(() => setDownloadStep('Extracție date criptate AES-256...'), 2000);
      setTimeout(() => setDownloadStep('Verificare hash SHA-256...'), 3500);
    }

    setTransferring(true);
    setTransferResult(null);
    try {
      const res = await fetch('/api/scp/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: selectedServerId,
          filename: transferFilename,
          remotePath: transferRemotePath,
          direction: transferDirection,
          content: transferContent || undefined,
        }),
      });
      const data = await res.json();
      setTransferResult(data);
      await fetchTransfers();
      
      if (transferDirection === 'download' && data.success) {
        setDownloadStep('TRANSFER COMPLET!');
        setTimeout(() => setIsDownloading(false), 1500);
      } else if (transferDirection === 'download') {
        setIsDownloading(false);
      }

    } catch (err: any) {
      setTransferResult({ success: false, error: err.message });
      setIsDownloading(false);
    } finally {
      setTransferring(false);
    }
  };

  const handleGlobalSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scp/update-database', { method: 'POST' });
      if (res.ok) {
        alert('Sincronizare Globală Reușită. Baza de date SCP a fost actualizată cu noi semnale din Google/Wiki.');
        await fetchServers();
      }
    } catch (e) {
      alert('Eroare la sincronizarea globală.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Integrated Download Animation Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-md w-full p-8 text-center space-y-6 bg-[#111b21] border border-cyan-500/50 rounded-[40px] shadow-[0_0_100px_rgba(6,182,212,0.2)]">
            <div className="relative inline-block">
              <div className="w-24 h-24 border-4 border-cyan-500/10 rounded-full animate-pulse" />
              <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center animate-pulse">
                    <Download className="w-8 h-8 text-cyan-400" />
                 </div>
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white uppercase tracking-[0.3em]">Sincronizare Grounded</h2>
              <p className="text-cyan-400 font-mono text-[10px] animate-pulse tracking-widest">{downloadStep.toUpperCase()}</p>
            </div>
            <div className="w-full bg-cyan-900/30 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 animate-progress-fast" />
            </div>
            <p className="text-[10px] text-[#8696a0] font-mono">Surse: Google • Wikipedia • Spotify</p>
          </div>
        </div>
      )}

      {/* Overview Banner */}
      <div className="bg-[#111b21] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-cyan-300 uppercase tracking-wider">
              Modul Transfer Criptat SCP // SSH2 Secure Copy Protocol
            </h3>
            <p className="text-xs text-[#8696a0] mt-0.5">
              Cifru: AES-256-GCM • Validare: Grounded (Wikipedia/Google/Spotify)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGlobalSync}
            disabled={loading}
            className="px-4 py-2 bg-purple-600/20 border border-purple-500/40 text-purple-300 font-bold rounded-xl text-xs transition-all hover:bg-purple-600/30 active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Global</span>
          </button>
          <button
            onClick={() => setIsAddServerOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Server SCP</span>
          </button>
        </div>
      </div>

      {/* Intelligence Intercept Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-[#0b141a] border border-[#222e35] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase">Status Monitorizare Globală</p>
              <p className="text-xs text-[#e9edef] font-mono">Scanare Real-Time Google & Wikipedia Activă</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
             <span className="text-[9px] font-bold text-emerald-500">LIVE SYNC</span>
          </div>
        </div>
        <button 
          onClick={handleGlobalSync}
          className="bg-[#0b141a] border border-[#222e35] rounded-2xl p-4 flex items-center justify-between hover:border-cyan-500/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-cyan-400 uppercase">Interceptare Spotify</p>
              <p className="text-xs text-[#e9edef]">Scanare semnale media...</p>
            </div>
          </div>
          <RefreshCw className="w-3 h-3 text-[#8696a0] group-hover:animate-spin" />
        </button>
      </div>

      {/* Grid: Server Nodes & Transfer Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Server Nodes List */}
        <div className="bg-[#111b21] border border-[#222e35] rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222e35]">
            <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Noduri de Servere ({servers.length})
            </h4>
            <button onClick={fetchServers} title="Actualizează lista de servere" className="p-1 text-[#8696a0] hover:text-white transition-colors cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {servers.length === 0 ? (
              <p className="text-xs text-[#8696a0] py-6 text-center">Niciun server SCP configurat încă.</p>
            ) : (
              servers.map(server => {
                const internal = isInternalHost(server.host);
                return (
                  <div key={server.id} className="p-4 bg-[#0b141a] border border-[#222e35] rounded-2xl flex flex-col gap-2 hover:border-cyan-500/30 transition-all group">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-xs sm:text-sm text-[#e9edef]">
                            {server.name}
                          </p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                            internal 
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' 
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {internal ? 'NOD INTRANET' : 'SSH2 EXTERN'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[#8696a0] mt-1">
                          {server.username}@{server.host}:{server.port}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleTestConnection(server.id)}
                          disabled={testingId === server.id}
                          className="px-2.5 py-1 bg-[#202c33] hover:bg-[#2a3942] text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <Activity className={`w-3 h-3 text-cyan-400 ${testingId === server.id ? 'animate-spin' : ''}`} />
                          <span>Test</span>
                        </button>

                        <button
                          onClick={() => handleDeleteServer(server.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Test Result Message */}
                    {testResult && testResult.id === server.id && (
                      <div className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-start gap-2 animate-in slide-in-from-top-1 ${
                        testResult.success 
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                          : 'bg-red-500/10 text-red-300 border-red-500/30'
                      }`}>
                        {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className="break-words leading-relaxed">{testResult.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Transfer Initiation Console */}
        <div className="bg-[#111b21] border border-[#222e35] rounded-3xl p-5 sm:p-6 space-y-4 shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-[#222e35]">
            <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Consolă Comandă O5
            </h4>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-mono text-[#8696a0]">GROUNDED SINTEZA</span>
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            </div>
          </div>

          <form onSubmit={handleExecuteTransfer} className="space-y-4">
            {/* Direction Selector */}
            <div className="grid grid-cols-2 gap-2 bg-[#0b141a] p-1 rounded-2xl border border-[#222e35]">
              <button
                type="button"
                onClick={() => setTransferDirection('upload')}
                className={`py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  transferDirection === 'upload'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-lg border border-cyan-500/30'
                    : 'text-[#8696a0] hover:text-[#e9edef]'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>UPLOAD</span>
              </button>

              <button
                type="button"
                onClick={() => setTransferDirection('download')}
                className={`py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  transferDirection === 'download'
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-lg border border-emerald-500/30'
                    : 'text-[#8696a0] hover:text-[#e9edef]'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>DOWNLOAD</span>
              </button>
            </div>

            {/* Target Server Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">Nod Destinație</label>
              <select
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(Number(e.target.value))}
                className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-3 py-2 text-xs text-[#e9edef] focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="" disabled>Alege un server...</option>
                {servers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.host})
                  </option>
                ))}
              </select>
            </div>

            {/* Filename & Remote Path */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">Subiect / Fișier</label>
                <input
                  type="text"
                  value={transferFilename}
                  onChange={(e) => setTransferFilename(e.target.value)}
                  className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-3 py-2 text-xs text-[#e9edef] focus:outline-none focus:border-cyan-400 font-mono"
                  placeholder="Ex: Raport Wikipedia Brașov"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">Cale Vault</label>
                <input
                  type="text"
                  value={transferRemotePath}
                  onChange={(e) => setTransferRemotePath(e.target.value)}
                  className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl px-3 py-2 text-xs text-[#e9edef] focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Content to upload */}
            {transferDirection === 'upload' && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2">
                <label className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider block">
                  Cercetare Grounded (Lasă gol pentru sinteză automată)
                </label>
                <textarea
                  rows={4}
                  value={transferContent}
                  onChange={(e) => setTransferContent(e.target.value)}
                  placeholder="Introdu conținut sau lasă ALEXIA să cerceteze pe Google/Spotify/Wikipedia subiectul menționat mai sus..."
                  className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl p-3 text-xs text-[#e9edef] focus:outline-none focus:border-cyan-400 font-mono resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Submit Transfer Button */}
            <button
              type="submit"
              disabled={transferring}
              className={`w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black rounded-xl text-xs sm:text-sm shadow-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 active:scale-95 relative overflow-hidden ${transferring ? 'animate-pulse' : ''}`}
            >
              <ShieldCheck className={`w-4 h-4 ${transferring ? 'animate-spin' : ''}`} />
              <span>{transferring ? 'PROTOCOL ÎN CURS...' : `LANSEAZĂ ${transferDirection.toUpperCase()}`}</span>
              
              {/* Progress Scan Animation Line */}
              {transferring && (
                <div className="absolute inset-0 bg-white/10 pointer-events-none">
                  <div className="h-full w-1/3 bg-white/20 skew-x-12 animate-shimmer absolute top-0 left-[-50%]" />
                </div>
              )}
            </button>

            {transferring && (
              <div className="flex flex-col items-center gap-2 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl animate-pulse">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest">
                    Accesare Baze de Date Externe (Google/Wiki/Spotify)...
                  </span>
                </div>
                <div className="w-full bg-[#0b141a] h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 animate-progress-fast" />
                </div>
              </div>
            )}
          </form>

          {/* Transfer Result Banner */}
          {transferResult && (
            <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 animate-in fade-in duration-300 ${
              transferResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  {transferResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  {transferResult.success ? 'DOSAR PRELUAT / TRANSMIS' : 'EȘEC PROTOCOL'}
                </span>
                <span className="text-white/80 text-[10px]">{transferResult.durationMs}ms</span>
              </div>

              {transferResult.sha256 && transferResult.success && (
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10">
                  <p className="text-[9px] text-[#8696a0] uppercase mb-1">Hash Validare:</p>
                  <p className="text-[10px] text-cyan-300 break-all select-all font-mono leading-tight">
                    {transferResult.sha256}
                  </p>
                </div>
              )}

              {transferResult.downloadUrl && transferResult.success && (
                <div className="pt-1">
                  <a 
                    href={transferResult.downloadUrl} 
                    download={transferResult.filename}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500 text-black font-bold text-[11px] rounded-lg hover:bg-cyan-400 transition-colors shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DESCARCĂ RAPORTUL SINTETIZAT</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transfer History Table */}
      <div className="bg-[#111b21] border border-[#222e35] rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-[#202c33] border-b border-[#222e35] flex items-center justify-between">
          <h4 className="font-bold text-sm uppercase tracking-wider text-[#e9edef] flex items-center gap-2">
            <Hash className="w-4 h-4 text-cyan-400" />
            Arhivă Transferuri Criptate
          </h4>
          <button 
            onClick={fetchTransfers} 
            className="p-1.5 bg-[#111b21] hover:bg-[#2a3942] text-cyan-400 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#222e35] text-[#8696a0] font-bold uppercase tracking-tighter">
                <th className="px-6 py-4">Sursă / Dată</th>
                <th className="px-6 py-4">Obiect / Subiect</th>
                <th className="px-6 py-4 text-center">Protocol</th>
                <th className="px-6 py-4">Integritate SHA-256</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222e35]">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#8696a0] italic">
                    Arhiva este goală. Niciun transfer înregistrat.
                  </td>
                </tr>
              ) : (
                transfers.map(tr => (
                  <tr key={tr.id} className="hover:bg-[#202c33]/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-[#e9edef]">{tr.serverName}</p>
                      <p className="text-[10px] text-[#8696a0] font-mono mt-0.5">{new Date(tr.timestamp).toLocaleString('ro-RO')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-cyan-300 font-bold truncate max-w-[150px]">{tr.filename}</p>
                      <p className="text-[10px] text-[#8696a0] truncate max-w-[150px]">{tr.remotePath}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        tr.direction === 'upload' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {tr.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-[#8696a0]">
                      {tr.sha256 ? tr.sha256.slice(0, 16) + '...' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {tr.status === 'completed' ? (
                        <div className="flex items-center justify-end gap-2">
                           <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                           <a href={`/scp_vault/${tr.filename}`} download className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                              <Download className="w-3.5 h-3.5" />
                           </a>
                        </div>
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 ml-auto" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Server Modal */}
      {isAddServerOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="bg-[#111b21] w-full max-w-md rounded-3xl border border-cyan-500/40 p-6 space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#222e35]">
              <h4 className="font-bold text-sm text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                Înregistrare Nod Nou
              </h4>
              <button onClick={() => setIsAddServerOpen(false)} className="text-[#8696a0] hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleAddServer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setNodeType('intranet')} className={`p-3 rounded-2xl border font-bold transition-all cursor-pointer ${nodeType === 'intranet' ? 'bg-purple-500/20 text-purple-300 border-purple-400' : 'bg-black/40 text-[#8696a0] border-[#222e35]'}`}>NOD INTRANET</button>
                  <button type="button" onClick={() => setNodeType('external')} className={`p-3 rounded-2xl border font-bold transition-all cursor-pointer ${nodeType === 'external' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400' : 'bg-black/40 text-[#8696a0] border-[#222e35]'}`}>SERVER EXTERN</button>
              </div>

              <input type="text" required placeholder="Identificator (Ex: Vault Situl-19)" value={newServer.name} onChange={(e) => setNewServer({ ...newServer, name: e.target.value })} className="w-full bg-black/40 border border-[#222e35] rounded-xl px-4 py-3 text-[#e9edef] focus:outline-none focus:border-cyan-400 transition-all" />
              <div className="grid grid-cols-3 gap-2">
                <input type="text" required placeholder="Host / IP" value={newServer.host} onChange={(e) => setNewServer({ ...newServer, host: e.target.value })} className="col-span-2 w-full bg-black/40 border border-[#222e35] rounded-xl px-4 py-3 text-[#e9edef] font-mono focus:outline-none focus:border-cyan-400 transition-all" />
                <input type="number" value={newServer.port} onChange={(e) => setNewServer({ ...newServer, port: Number(e.target.value) })} className="w-full bg-black/40 border border-[#222e35] rounded-xl px-4 py-3 text-[#e9edef] font-mono focus:outline-none focus:border-cyan-400 transition-all" />
              </div>
              <input type="text" required placeholder="Utilizator" value={newServer.username} onChange={(e) => setNewServer({ ...newServer, username: e.target.value })} className="w-full bg-black/40 border border-[#222e35] rounded-xl px-4 py-3 text-[#e9edef] font-mono focus:outline-none focus:border-cyan-400 transition-all" />
              <input type="password" required placeholder="Criptografie Parolă / Cheie" value={newServer.encryptedAuth} onChange={(e) => setNewServer({ ...newServer, encryptedAuth: e.target.value })} className="w-full bg-black/40 border border-[#222e35] rounded-xl px-4 py-3 text-[#e9edef] font-mono focus:outline-none focus:border-cyan-400 transition-all" />

              <button type="submit" disabled={loading} className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50">
                {loading ? 'Sincronizare...' : 'Confirmă Înregistrare Nod'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
