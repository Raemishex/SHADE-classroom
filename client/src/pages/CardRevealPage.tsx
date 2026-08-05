import { useState, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';
import { SoundFX } from '../utils/SoundFX';
import { HolographicCard3D } from '../components/3d/HolographicCard3D';

const triggerHaptic = (type: 'light' | 'medium') => {
  if ('vibrate' in navigator) {
    navigator.vibrate(type === 'light' ? [10] : [20]);
  }
};

export default function CardRevealPage() {
  const { room, myRole, myWord, myCategoryName, myCategoryIcon, myAllies } = useGameStore();
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasSeenAtLeastOnce, setHasSeenAtLeastOnce] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handlePointerDown = useCallback(() => {
    triggerHaptic('light');
    SoundFX.playPeekHum();
    setIsRevealed(true);
    setHasSeenAtLeastOnce(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsRevealed(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!room || hasConfirmed) return;
    triggerHaptic('medium');
    SoundFX.playClick();
    setHasConfirmed(true);
    socket.emit('player_seen_card', { roomCode: room.code });
  }, [room, hasConfirmed]);

  const seenPlayers = room?.players.filter(p => p.hasSeenCard) ?? [];
  const totalPlayers = room?.players.length ?? 0;

  return (
    <div className="relative flex flex-col items-center justify-between min-h-dvh px-5 py-6 overflow-hidden select-none z-10">

      {/* Top Status Banner */}
      <div className="h-16 flex flex-col items-center justify-center text-center">
        {!hasConfirmed ? (
          <p className="font-body text-xs tracking-wider text-[#f59e0b] font-medium animate-pulse">
            👇 Kartı görmək üçün basıb saxlayın
          </p>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.3)] text-[#34d399] font-code text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Digər oyunçular gözlənilir ({seenPlayers.length}/{totalPlayers})</span>
          </div>
        )}
      </div>

      {/* Tactile 3D Card Display */}
      <div className="w-full my-auto flex justify-center">
        <HolographicCard3D
          role={myRole}
          word={myWord}
          categoryName={myCategoryName}
          categoryIcon={myCategoryIcon}
          allies={myAllies}
          isRevealed={isRevealed}
          hasSeenCard={hasSeenAtLeastOnce}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onSeenClick={handleConfirm}
        />
      </div>

      {/* Bottom Status */}
      <div className="h-12 flex items-center justify-center text-center text-xs text-[#a39bb5]">
        {hasConfirmed ? 'Oyun tezliklə başlayacaq...' : 'Kartı yalnız özünüz görün'}
      </div>

    </div>
  );
}
