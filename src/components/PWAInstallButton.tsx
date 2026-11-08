import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, XCircle } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-all text-xs font-semibold cursor-pointer shadow-lg active:scale-95 animate-pulse"
      >
        <Download className="w-4 h-4 text-cyan-400" />
        Instalează Aplicația (PWA)
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-all text-xs font-semibold cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-cyan-400" />
          Instalează pe iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-sm rounded-3xl bg-[#111b21] border border-cyan-500/50 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-cyan-300">Instalare pe iPhone / iPad</h3>
                <button onClick={() => setShowIOSGuide(false)} className="text-[#8696a0] hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-[#e9edef]">
                <p className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-bold">1</span>
                  Apasă butonul <strong>Partajare (Share)</strong> din bara Safari.
                </p>
                <p className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-bold">2</span>
                  Derulează în jos și apasă <strong>Adăugare pe ecranul principal (Add to Home Screen)</strong>.
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-cyan-500/10 border border-cyan-500/30 py-3 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                Am înțeles
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
