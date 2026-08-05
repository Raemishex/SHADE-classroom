import React from 'react';
import { useGameStore } from '../store/gameStore';
import { SoundFX } from '../utils/SoundFX';
import { Volume2, VolumeX, ShoppingBag, Coins } from 'lucide-react';

export const HeaderBar: React.FC = () => {
  const { coins, isMuted, setIsMuted, toggleStore } = useGameStore();

  const handleMuteToggle = () => {
    const nextMuted = SoundFX.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleStoreOpen = () => {
    SoundFX.playClick();
    toggleStore();
  };

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 max-w-md mx-auto z-40 relative">
      {/* Brand Logo / Title */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🕵️‍♂️</span>
        <span className="font-heading font-bold text-lg tracking-wider text-[#f0ecf5]">
          SHADE
        </span>
        <span className="text-[10px] font-code px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] font-bold">
          v3.0
        </span>
      </div>

      {/* Action Buttons: Currency, Store, Mute */}
      <div className="flex items-center gap-2">
        {/* Coins Pill */}
        <button
          onClick={handleStoreOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] text-xs font-code font-bold hover:bg-[rgba(245,158,11,0.2)] transition-all active:scale-95 shadow-[0_2px_12px_rgba(245,158,11,0.15)]"
        >
          <Coins className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>{coins}</span>
        </button>

        {/* Store Trigger */}
        <button
          onClick={handleStoreOpen}
          className="p-2 rounded-xl bg-[rgba(163,155,181,0.08)] border border-[rgba(163,155,181,0.15)] text-[#f0ecf5] hover:bg-[rgba(163,155,181,0.18)] transition-all active:scale-95"
          title="Kart Mağazası"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={handleMuteToggle}
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            isMuted
              ? 'bg-[rgba(244,63,94,0.12)] border-[rgba(244,63,94,0.3)] text-[#f43f5e]'
              : 'bg-[rgba(163,155,181,0.08)] border-[rgba(163,155,181,0.15)] text-[#f59e0b] hover:bg-[rgba(245,158,11,0.18)]'
          }`}
          title={isMuted ? 'Səsi Aç' : 'Səsi Bağla'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
