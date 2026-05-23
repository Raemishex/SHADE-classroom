import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';

const triggerHaptic = (type: 'light' | 'medium') => {
  if ('vibrate' in navigator) {
    navigator.vibrate(type === 'light' ? [10] : [20]);
  }
};

export default function CardRevealPage() {
  const { room, myRole, myWord, myCategoryName, myCategoryIcon, myAllies } = useGameStore();
  const [isRevealed, setIsRevealed]             = useState(false);
  const [hasSeenAtLeastOnce, setHasSeenAtLeastOnce] = useState(false);
  const [hasConfirmed, setHasConfirmed]         = useState(false);

  const isImposter = myRole === 'imposter';

  const handlePointerDown = useCallback(() => {
    triggerHaptic('light');
    setIsRevealed(true);
    setHasSeenAtLeastOnce(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsRevealed(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!room || hasConfirmed) return;
    triggerHaptic('medium');
    setHasConfirmed(true);
    socket.emit('player_seen_card', { roomCode: room.code });
  }, [room, hasConfirmed]);

  const seenPlayers  = room?.players.filter(p => p.hasSeenCard) ?? [];
  const totalPlayers = room?.players.length ?? 0;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-dvh px-5 overflow-hidden select-none">

      {/* ── Ambient role glow ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000"
        style={{ opacity: isRevealed ? 1 : 0 }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: isImposter
              ? 'radial-gradient(circle, rgba(255,45,85,0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(57,255,143,0.10) 0%, transparent 70%)',
          }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 blur-3xl"
          style={{
            background: isImposter
              ? 'radial-gradient(ellipse, rgba(255,45,85,0.06) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(57,255,143,0.05) 0%, transparent 70%)',
          }} />
      </div>

      {/* ── Top instruction ── */}
      <div className="h-16 flex items-center mb-6">
        <AnimatePresence mode="wait">
          {!hasConfirmed && !hasSeenAtLeastOnce && (
            <motion.p
              key="hint"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="font-mono text-sm tracking-wider text-center animate-pulse"
              style={{ color: 'var(--text-ghost)' }}>
              Kartı görmək üçün basıb saxla
            </motion.p>
          )}
          {hasConfirmed && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(57,255,143,0.07)',
                  border: '1px solid rgba(57,255,143,0.2)',
                }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'var(--neon-green)', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="font-mono text-xs tracking-wider"
                  style={{ color: 'rgba(57,255,143,0.7)' }}>
                  Digər oyunçular gözlənilir
                </span>
              </div>

              {/* Who has seen */}
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-xs">
                {seenPlayers.map(p => (
                  <span key={p.id} className="font-mono text-[0.6rem] tracking-wider"
                    style={{ color: 'rgba(57,255,143,0.55)' }}>
                    ✓ {p.name}
                  </span>
                ))}
                {room?.players.filter(p => !p.hasSeenCard).map(p => (
                  <span key={p.id} className="font-mono text-[0.6rem] tracking-wider"
                    style={{ color: 'var(--text-ghost)' }}>
                    ◌ {p.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Card ── */}
      <div
        className="relative perspective-1000"
        style={{ width: '18rem', height: '26rem' }}>
        <div
          className="relative w-full h-full transform-style-3d transition-transform duration-500 ease-out cursor-pointer"
          style={{ transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={e => e.preventDefault()}
        >
          {/* ── Card Back (face-down) ── */}
          <div className="absolute inset-0 rounded-3xl backface-hidden flex flex-col items-center justify-center overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-glow)',
              boxShadow: '0 0 0 1px var(--border-glow), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>

            {/* Hex pattern SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]"
              xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hex" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
                  <polygon points="20,2 38,12 38,34 20,44 2,34 2,12"
                    fill="none" stroke="rgba(191,95,255,1)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hex)" />
            </svg>

            {/* Logo */}
            <div className="flex flex-col items-center gap-2 opacity-25">
              <p className="font-rajdhani font-bold text-4xl tracking-[0.2em] text-white">SHADE</p>
              <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(191,95,255,0.6), transparent)' }} />
              <p className="font-mono text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: 'var(--neon-purple)' }}>
                Classroom
              </p>
            </div>

            {/* Hold indicator */}
            <div className="absolute bottom-8 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse"
                style={{ border: '2px solid rgba(191,95,255,0.4)' }}>
                <div className="w-4 h-4 rounded-full" style={{ background: 'rgba(191,95,255,0.5)' }} />
              </div>
              <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase" style={{ color: 'rgba(191,95,255,0.4)' }}>
                Basıb Saxla
              </p>
            </div>
          </div>

          {/* ── Card Front (revealed) ── */}
          {isImposter ? (
            /* IMPOSTER card */
            <div className="absolute inset-0 rounded-3xl backface-hidden rotate-y-180 flex flex-col overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #1a0a0f 0%, #120709 100%)',
                border: '1px solid rgba(255,45,85,0.35)',
                boxShadow: '0 0 40px rgba(255,45,85,0.2), 0 0 80px rgba(255,45,85,0.08)',
              }}>

              {/* Header */}
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,45,85,0.15)' }}>
                <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase mb-1"
                  style={{ color: 'rgba(255,45,85,0.55)' }}>Rolun</p>
                <p className="font-rajdhani text-2xl font-bold text-neon-glow-red"
                  style={{ color: 'var(--neon-red)' }}>🔴 İMPOSTERsən</p>
              </div>

              {/* Hint */}
              <div className="flex-1 flex flex-col px-6 py-5">
                {room?.settings.imposterHintMode ? (
                  <>
                    <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase mb-2"
                      style={{ color: 'rgba(255,45,85,0.4)' }}>Kateqoriya İpucun</p>
                    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl px-4 py-6"
                      style={{ background: 'rgba(255,45,85,0.04)', border: '1px solid rgba(255,45,85,0.12)' }}>
                      <p className="font-rajdhani text-4xl font-bold text-white text-center leading-tight">
                        {myCategoryName}
                      </p>
                      <p className="text-3xl mt-2">{myCategoryIcon}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center rounded-2xl px-4 py-6"
                    style={{ background: 'rgba(255,45,85,0.04)', border: '1px solid rgba(255,45,85,0.12)' }}>
                    <p className="font-rajdhani text-lg text-white/50 text-center leading-relaxed">
                      Sözü yalnız vətəndaşlar bilir.<br/>Onlara qoşul və diqqət çəkmə.
                    </p>
                  </div>
                )}

                {/* Allies */}
                {myAllies.length > 0 && (
                  <div className="mt-4">
                    <div className="neon-divider mb-3" />
                    <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase mb-2"
                      style={{ color: 'rgba(255,45,85,0.4)' }}>Müttəfiqlərin</p>
                    <div className="flex flex-wrap gap-2">
                      {myAllies.map((ally, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl font-syne text-sm font-medium"
                          style={{
                            color: 'var(--neon-red)',
                            background: 'rgba(255,45,85,0.08)',
                            border: '1px solid rgba(255,45,85,0.25)',
                          }}>
                          🤝 {ally}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <p className="text-center font-syne text-xs pb-5 px-6" style={{ color: 'rgba(255,45,85,0.45)' }}>
                Sözü tap, blef et, inanmalarını sağla
              </p>
            </div>
          ) : (
            /* CITIZEN card */
            <div className="absolute inset-0 rounded-3xl backface-hidden rotate-y-180 flex flex-col overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0a1a0f 0%, #071209 100%)',
                border: '1px solid rgba(57,255,143,0.35)',
                boxShadow: '0 0 40px rgba(57,255,143,0.2), 0 0 80px rgba(57,255,143,0.08)',
              }}>

              {/* Header */}
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(57,255,143,0.15)' }}>
                <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase mb-1"
                  style={{ color: 'rgba(57,255,143,0.55)' }}>Rolun</p>
                <p className="font-rajdhani text-2xl font-bold text-neon-glow-green"
                  style={{ color: 'var(--neon-green)' }}>👤 VƏTƏNDAŞsan</p>
              </div>

              {/* Word */}
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase mb-4"
                  style={{ color: 'rgba(57,255,143,0.4)' }}>Gizli Söz</p>
                <div className="w-full rounded-2xl px-4 py-8 text-center"
                  style={{ background: 'rgba(57,255,143,0.04)', border: '1px solid rgba(57,255,143,0.12)' }}>
                  <p className="font-rajdhani text-4xl font-bold text-white leading-tight">
                    {myWord}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <p className="text-center font-syne text-xs pb-5 px-6" style={{ color: 'rgba(57,255,143,0.45)' }}>
                Bu sözü yalnız sən bilirsən — unutma!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm button ── */}
      <div className="h-20 mt-8 w-full max-w-xs flex items-start justify-center">
        <AnimatePresence>
          {hasSeenAtLeastOnce && !hasConfirmed && (
            <motion.button
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', damping: 18 }}
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl font-rajdhani font-bold text-lg tracking-wider"
              style={isImposter ? {
                color: 'var(--bg-void)',
                background: 'linear-gradient(135deg, #ff2d55, #cc1033)',
                boxShadow: '0 0 20px rgba(255,45,85,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,45,85,0.4)',
              } : {
                color: 'var(--bg-void)',
                background: 'linear-gradient(135deg, #39ff8f, #1acc6a)',
                boxShadow: '0 0 20px rgba(57,255,143,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '1px solid rgba(57,255,143,0.5)',
              }}>
              Gördüm ✓
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Progress strip at bottom */}
      {totalPlayers > 0 && (
        <div className="fixed bottom-0 left-0 right-0 h-0.5">
          <div className="h-full transition-all duration-500"
            style={{
              width: `${(seenPlayers.length / totalPlayers) * 100}%`,
              background: isImposter ? 'var(--neon-red)' : 'var(--neon-green)',
              boxShadow: isImposter ? '0 0 8px rgba(255,45,85,0.8)' : '0 0 8px rgba(57,255,143,0.8)',
            }} />
        </div>
      )}
    </div>
  );
}
