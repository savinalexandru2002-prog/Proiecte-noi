import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 rounded-2xl bg-amber-600/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-white shadow-2xl border border-amber-400/50 animate-bounce">
      <WifiOff className="w-4 h-4 text-white" />
      <span>Sistem în Mod Offline — Se utilizează datele stocate local (Cache)</span>
    </div>
  );
};
