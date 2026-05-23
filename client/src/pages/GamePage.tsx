import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mic } from 'lucide-react';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';

export default function GamePage() {
  const { room, myId, myRole, myWord, myCategoryName, myCategoryIcon, myAllies } = useGameStore();
  const [isPeekOpen, setIsPeekOpen]   = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isEnding, setIsEnding]       = useState(false);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const isImposter = myRole === 'imposter';

  /* ── Hold-to-end mechanic ── */
  const startHold = useCallback(() => {
    if (!room) return;
    startRef.current = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - startRef.current) / 1800, 1);
      setHoldProgress(p);
      if (p < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setIsEnding(true);
        socket.emit('end_game', { roomCode: room.code });
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [room]);

  const cancelHold = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setHoldProgress(0);
  }, []);

  if (!room) return null;

  const myPlayer         = room.players.find(p => p.id === myId);
  const isHost           = myPlayer?.isHost ?? false;
  const firstSpeaker     = room.players.find(p => p.id === room.firstSpeaker);

  return (
    <div className="flex flex-col min-h-dvh" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>

      {/* ── Fixed top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-30 px-4 pt-safe-top pb-3"
        style={{ background: 'linear-gradient(180deg, rgba(7,6,15,0.98) 80%, transparent)' }}>
        <div className="max-w-md mx-auto flex items-center gap-2 pt-3">

          {/* Role pill */}
          <div className="px-2.5 py-1.5 rounded-xl shrink-0"
            style={{
              background: 'rgba(155,150,196,0.05)',
              border: '1px solid rgba(155,150,196,0.2)',
              color: 'var(--text-secondary)',
            }}>
            <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase">
              Rolun
            </p>
          </div>

          {/* Secret info pill */}
          <div className="flex-1 px-4 py-2.5 rounded-xl min-w-0 text-center"
            style={{
              background: 'rgba(155,150,196,0.05)',
              border: '1px solid rgba(155,150,196,0.2)',
            }}>
            <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase truncate"
              style={{ color: 'var(--text-ghost)' }}>
              Gizli Məlumat
            </p>
            <p className="font-rajdhani font-bold text-base truncate mt-0.5"
              style={{ color: 'var(--text-secondary)' }}>
              {isPeekOpen ? (isImposter ? (room?.settings.imposterHintMode ? `${myCategoryName} ${myCategoryIcon}` : 'Bilinmir') : myWord) : '••••••••'}
            </p>
          </div>

          {/* Peek button */}
          <button
            onClick={() => setIsPeekOpen(v => !v)}
            className="p-2.5 rounded-xl shrink-0 transition-all duration-200"
            style={isPeekOpen ? {
              background: 'rgba(191,95,255,0.15)',
              border: '1px solid rgba(191,95,255,0.4)',
              color: 'var(--neon-purple)',
            } : {
              background: 'rgba(155,150,196,0.05)',
              border: '1px solid rgba(155,150,196,0.1)',
              color: 'var(--text-secondary)',
            }}>
            {isPeekOpen ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* ── Peek overlay ── */}
      <AnimatePresence>
        {isPeekOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[72px] left-0 right-0 z-20 px-4"
            onClick={() => setIsPeekOpen(false)}>
            <div className="max-w-md mx-auto rounded-2xl p-5 shadow-2xl"
              style={{
                background: 'rgba(14,12,26,0.97)',
                border: '1px solid rgba(191,95,255,0.2)',
                backdropFilter: 'blur(20px)',
              }}>
              <p className="font-rajdhani font-semibold text-lg tracking-wider text-center mb-4"
                style={{ color: 'var(--neon-purple)' }}>Gizli Məlumatınız</p>

              <div className="rounded-xl p-4"
                style={{ background: 'rgba(7,6,15,0.6)', border: '1px solid var(--border-subtle)' }}>
                {isImposter ? (
                  <>
                    {room?.settings.imposterHintMode ? (
                      <>
                        <p className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-center mb-1"
                          style={{ color: 'var(--text-ghost)' }}>Kateqoriya</p>
                        <p className="font-rajdhani text-2xl font-bold text-center text-white mb-4">
                          {myCategoryName} {myCategoryIcon}
                        </p>
                      </>
                    ) : (
                      <p className="font-rajdhani text-lg text-center text-white/50 mb-4 py-2">
                        Sən İmpostersən!
                      </p>
                    )}
                    {myAllies.length > 0 && (
                      <>
                        <div className="neon-divider mb-3" />
                        <p className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-center mb-2"
                          style={{ color: 'var(--text-ghost)' }}>Müttəfiqlərin</p>
                        <div className="flex flex-wrap gap-2 justify-center">
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
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-center mb-2"
                      style={{ color: 'var(--text-ghost)' }}>Gizli Söz</p>
                    <p className="font-rajdhani text-3xl font-bold text-center text-white">{myWord}</p>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsPeekOpen(false)}
                className="w-full mt-4 py-3 rounded-xl font-syne font-medium transition-colors"
                style={{ background: 'rgba(155,150,196,0.08)', border: '1px solid rgba(155,150,196,0.1)', color: 'var(--text-secondary)' }}>
                Bağla
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-36"
        style={{ paddingTop: '88px' }}
        onClick={() => isPeekOpen && setIsPeekOpen(false)}>
        <div className="max-w-md mx-auto space-y-5 pt-4">

          {/* First speaker card */}
          {firstSpeaker && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14, delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,45,85,0.06) 0%, rgba(191,95,255,0.06) 100%)',
                border: '1px solid rgba(191,95,255,0.18)',
              }}>

              {/* Animated BG pulse */}
              <div className="absolute inset-0 -z-10 rounded-3xl"
                style={{ background: 'radial-gradient(ellipse at center, rgba(191,95,255,0.04) 0%, transparent 70%)' }} />

              <p className="font-mono text-[0.55rem] tracking-[0.35em] uppercase mb-3"
                style={{ color: 'var(--text-ghost)' }}>İlk Danışan</p>

              <div className="flex items-center justify-center gap-3">
                <div className="p-3 rounded-2xl"
                  style={{
                    background: 'rgba(255,45,85,0.12)',
                    border: '1px solid rgba(255,45,85,0.3)',
                    boxShadow: '0 0 16px rgba(255,45,85,0.25)',
                  }}>
                  <Mic className="w-6 h-6" style={{ color: 'var(--neon-red)' }} />
                </div>
                <span className="font-rajdhani text-3xl font-bold text-white">{firstSpeaker.name}</span>
              </div>

              <p className="font-syne text-xs mt-3" style={{ color: 'var(--text-ghost)' }}>
                Bu oyunçudan başlayaraq hamı növbə ilə bir cümlə deyir
              </p>
            </motion.div>
          )}

          {/* Player grid */}
          <div>
            <p className="font-mono text-[0.6rem] tracking-[0.25em] uppercase mb-3"
              style={{ color: 'var(--text-ghost)' }}>Oyunçular</p>

            <div className="grid grid-cols-2 gap-2">
              {room.players.map((p, i) => {
                const isFirst = p.id === room.firstSpeaker;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="relative px-3 py-3 rounded-xl overflow-hidden"
                    style={isFirst ? {
                      background: 'rgba(255,45,85,0.07)',
                      border: '1px solid rgba(255,45,85,0.28)',
                    } : {
                      background: 'rgba(155,150,196,0.04)',
                      border: '1px solid rgba(155,150,196,0.08)',
                    }}>

                    {isFirst && (
                      <div className="absolute top-2 right-2">
                        <Mic className="w-3 h-3" style={{ color: 'rgba(255,45,85,0.6)' }} />
                      </div>
                    )}

                    <p className="font-syne text-sm text-white truncate pr-4">{p.name}</p>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {p.isHost && (
                        <span className="font-mono text-[0.5rem] tracking-wider" style={{ color: 'rgba(251,191,36,0.7)' }}>
                          HOST
                        </span>
                      )}
                      {!p.isConnected && (
                        <span className="font-mono text-[0.5rem] tracking-wider" style={{ color: 'rgba(255,45,85,0.6)' }}>
                          ✗ offline
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Host end-game bar ── */}
      {isHost && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-safe-bottom pt-4 safe-bottom"
          style={{ background: 'linear-gradient(0deg, rgba(7,6,15,0.98) 70%, transparent)' }}>
          <div className="max-w-md mx-auto">
            <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-center mb-3"
              style={{ color: 'var(--text-ghost)' }}>
              {holdProgress > 0 ? 'Buraxma...' : 'Bitirmək üçün basıb saxla (1.8s)'}
            </p>

            <button
              onPointerDown={startHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              disabled={isEnding}
              className="relative w-full py-4 rounded-2xl overflow-hidden font-rajdhani font-bold text-lg tracking-wider select-none"
              style={{
                color: isEnding ? 'rgba(255,45,85,0.5)' : 'var(--neon-red)',
                background: 'rgba(255,45,85,0.06)',
                border: `1px solid rgba(255,45,85,${holdProgress > 0 ? 0.5 : 0.25})`,
                boxShadow: holdProgress > 0 ? '0 0 20px rgba(255,45,85,0.2)' : 'none',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}>

              {/* Fill bar */}
              <div
                className="absolute inset-0 origin-left"
                style={{
                  background: 'rgba(255,45,85,0.15)',
                  transform: `scaleX(${holdProgress})`,
                  transformOrigin: 'left',
                  transition: holdProgress === 0 ? 'transform 0.2s' : 'none',
                }} />

              <span className="relative z-10">
                {isEnding ? 'Bitir...' : 'Oyunu Bitir'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
