import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface HolographicCard3DProps {
  role: 'citizen' | 'imposter' | 'detective' | 'joker' | null;
  word: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  allies: string[];
  isRevealed: boolean;
  hasSeenCard: boolean;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onSeenClick: () => void;
}

export function HolographicCard3D({
  role,
  word,
  categoryName,
  categoryIcon,
  allies,
  isRevealed,
  hasSeenCard,
  onPointerDown,
  onPointerUp,
  onSeenClick,
}: HolographicCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isRevealed) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / rect.height) * -12,
      y: (x / rect.width) * 12,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
    onPointerUp();
  };

  const isCitizen = role === 'citizen';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto select-none">
      {/* 3D Card Container */}
      <div
        className="perspective-1000 w-72 h-[26rem] cursor-pointer touch-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <motion.div
          ref={cardRef}
          className="relative w-full h-full transform-style-3d transition-transform duration-300 ease-out"
          animate={{
            rotateY: isRevealed ? 180 : 0,
            rotateX: tilt.x,
            rotateZ: tilt.y * 0.2,
          }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Card Back (Face Down) */}
          <div className="absolute inset-0 backface-hidden rounded-3xl p-6 flex flex-col items-center justify-between border border-[rgba(163,155,181,0.2)] bg-[#241e2e] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="w-full flex justify-between items-center opacity-40">
              <span className="text-xs font-mono uppercase tracking-widest text-[#a39bb5]">SHADE</span>
              <span className="text-xs font-mono">✦ ✦ ✦</span>
            </div>

            <div className="flex flex-col items-center justify-center my-auto text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] flex items-center justify-center shadow-inner">
                <span className="text-4xl">🕵️</span>
              </div>
              <div>
                <p className="font-heading text-lg text-[#f0ecf5] font-semibold">Basıb Saxla</p>
                <p className="text-xs text-[#a39bb5] mt-1">Kartı görmək üçün barmağını saxla</p>
              </div>
            </div>

            <div className="w-full text-center opacity-30 text-[10px] font-mono tracking-wider">
              TAP & HOLD TO REVEAL
            </div>
          </div>

          {/* Card Front (Face Up - Flipped 180deg) */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 flex flex-col items-center justify-between bg-[#241e2e] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border ${
              isCitizen
                ? 'border-[rgba(52,211,153,0.4)] shadow-[0_0_30px_rgba(52,211,153,0.12)]'
                : 'border-[rgba(244,63,94,0.4)] shadow-[0_0_30px_rgba(244,63,94,0.12)]'
            }`}
          >
            {/* Card Header */}
            <div className="w-full flex justify-between items-center">
              <span
                className={`text-xs font-mono font-bold tracking-widest uppercase ${
                  isCitizen ? 'text-[#34d399]' : 'text-[#f43f5e]'
                }`}
              >
                {isCitizen ? '👤 VƏTƏNDAŞ' : '🔴 İMPOSTER'}
              </span>
              <span className="text-xs text-[#a39bb5]">
                {categoryIcon} {categoryName}
              </span>
            </div>

            {/* Card Content */}
            <div className="flex flex-col items-center justify-center my-auto text-center gap-4 w-full">
              {isCitizen ? (
                <>
                  <p className="text-xs text-[#a39bb5] font-medium tracking-wide uppercase">Məxfilik: Yüksək</p>
                  <div className="py-3 px-6 rounded-2xl bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.2)] w-full">
                    <p className="text-xs text-[#34d399] uppercase tracking-wider mb-1">Məxfilik Sözü</p>
                    <p className="font-heading text-3xl font-bold text-[#f0ecf5] tracking-wide">{word}</p>
                  </div>
                  <p className="text-xs text-[#a39bb5] italic">Bu sözü başqalarına bildirmə!</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#f43f5e] font-medium tracking-wide uppercase">Blef Vəziyyəti</p>
                  <div className="py-3 px-6 rounded-2xl bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.2)] w-full">
                    <p className="text-xs text-[#f43f5e] uppercase tracking-wider mb-1">İpucu Kateqoriya</p>
                    <p className="font-heading text-2xl font-bold text-[#f59e0b] tracking-wide">
                      {categoryIcon} {categoryName}
                    </p>
                  </div>
                  {allies.length > 0 && (
                    <div className="w-full pt-2 border-t border-[rgba(163,155,181,0.1)]">
                      <p className="text-xs text-[#a39bb5]">Müttəfiq İmposterlər:</p>
                      <p className="text-sm font-bold text-[#f43f5e] mt-0.5">{allies.join(', ')}</p>
                    </div>
                  )}
                  <p className="text-xs text-[#a39bb5] italic">Sözü dinləyərək tap və blef et!</p>
                </>
              )}
            </div>

            {/* Card Footer */}
            <div className="w-full text-center text-[11px] text-[#a39bb5] opacity-60">
              SHADE SECRET CARD
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Button */}
      <div className="mt-8 w-full max-w-xs">
        <button
          onClick={onSeenClick}
          disabled={!hasSeenCard}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
            hasSeenCard
              ? 'bg-[#34d399] text-[#1a1520] shadow-[0_4px_20px_rgba(52,211,153,0.25)] hover:bg-[#6ee7b7]'
              : 'bg-[rgba(163,155,181,0.1)] text-[#a39bb5] border border-[rgba(163,155,181,0.15)] opacity-50 cursor-not-allowed'
          }`}
        >
          <span>Gördüm</span>
          <span>✓</span>
        </button>
        {!hasSeenCard && (
          <p className="text-xs text-[#a39bb5] text-center mt-2 opacity-70">
            Düyüməyə basmazdan əvvəl kartı basıb saxlayın
          </p>
        )}
      </div>
    </div>
  );
}
