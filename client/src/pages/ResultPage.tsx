import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';

export default function ResultPage() {
  const { room, myId, myWord, myCategoryName, myAllies } = useGameStore();
  const [phase, setPhase] = useState(0);
  // phase 0 → headline
  // phase 1 → word reveal
  // phase 2 → imposters
  // phase 3 → citizens

  useEffect(() => {
    // Confetti burst
    const burst = (origin: { x: number; y: number }) =>
      confetti({
        particleCount: 60,
        spread: 70,
        origin,
        colors: ['#bf5fff', '#ff2d55', '#39ff8f', '#4d9fff', '#ffffff'],
        ticks: 200,
      });

    setTimeout(() => { burst({ x: 0.2, y: 0.6 }); burst({ x: 0.8, y: 0.6 }); }, 300);
    setTimeout(() => { burst({ x: 0.5, y: 0.4 }); }, 900);

    // Phase progression
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!room) return null;

  const myPlayer  = room.players.find(p => p.id === myId);
  const isHost    = myPlayer?.isHost ?? false;
  const imposters = myAllies ?? [];
  const citizens  = room.players.filter(p => !imposters.includes(p.name)).map(p => p.name);

  const handleRematch = () => socket.emit('rematch', { roomCode: room.code });
  const handleMainMenu = () => {
    socket.emit('leave_room', { roomCode: room.code });
    useGameStore.getState().reset();
  };

  return (
    <div className="flex flex-col min-h-dvh">

      {/* Ambient bg */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(191,95,255,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(57,255,143,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-10">
        <div className="max-w-md mx-auto space-y-6">

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center">
            <p className="font-mono text-[0.6rem] tracking-[0.4em] uppercase mb-2"
              style={{ color: 'var(--text-ghost)' }}>Oyun Bitdi</p>
            <h1 className="font-rajdhani font-bold text-5xl tracking-wider text-white text-neon-glow-purple">
              NƏTİCƏLƏR
            </h1>
            <div className="neon-divider mt-4" />
          </motion.div>

          {/* Word + Category reveal */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                key="word"
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 16, stiffness: 200 }}
                className="rounded-3xl overflow-hidden"
                style={{ border: '1px solid rgba(191,95,255,0.2)' }}>

                {/* Category row */}
                <div className="px-6 py-4"
                  style={{
                    background: 'rgba(191,95,255,0.07)',
                    borderBottom: '1px solid rgba(191,95,255,0.12)',
                  }}>
                  <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase mb-1"
                    style={{ color: 'var(--text-ghost)' }}>Kateqoriya</p>
                  <p className="font-syne font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {myCategoryName}
                  </p>
                </div>

                {/* Word reveal */}
                <div className="px-6 py-8 text-center"
                  style={{ background: 'var(--bg-surface)' }}>
                  <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase mb-3"
                    style={{ color: 'var(--text-ghost)' }}>Gizli Söz idi</p>
                  <p className="font-rajdhani font-bold text-5xl text-white"
                    style={{ textShadow: '0 0 30px rgba(255,255,255,0.12)' }}>
                    {myWord}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Imposters */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div key="imposters" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase mb-3"
                  style={{ color: 'rgba(255,45,85,0.6)' }}>İmposterlər</p>

                <div className="space-y-2">
                  {imposters.map((name, i) => (
                    <motion.div
                      key={name}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.18, type: 'spring', damping: 16 }}
                      className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,45,85,0.06)',
                        border: '1px solid rgba(255,45,85,0.25)',
                        boxShadow: '0 0 20px rgba(255,45,85,0.05)',
                      }}>
                      <div className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          background: 'var(--neon-red)',
                          boxShadow: '0 0 12px rgba(255,45,85,0.8)',
                        }} />
                      <span className="font-rajdhani font-bold text-xl text-white flex-1">{name}</span>
                      <span className="font-mono text-xs tracking-wider"
                        style={{ color: 'var(--neon-red)' }}>İMPOSTER</span>
                    </motion.div>
                  ))}

                  {imposters.length === 0 && (
                    <p className="font-mono text-xs text-center py-2" style={{ color: 'var(--text-ghost)' }}>
                      İmposter yoxdur
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Citizens */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div key="citizens" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase mb-3"
                  style={{ color: 'rgba(57,255,143,0.6)' }}>Vətəndaşlar</p>

                <motion.div
                  className="rounded-2xl p-4"
                  style={{
                    background: 'rgba(57,255,143,0.04)',
                    border: '1px solid rgba(57,255,143,0.15)',
                  }}>
                  <div className="flex flex-wrap gap-2">
                    {citizens.map((name, i) => (
                      <motion.span
                        key={name}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 }}
                        className="px-3 py-1.5 rounded-xl font-syne text-sm"
                        style={{
                          color: 'white',
                          background: 'rgba(57,255,143,0.07)',
                          border: '1px solid rgba(57,255,143,0.2)',
                        }}>
                        ✅ {name}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spacer for bottom buttons */}
          <div className="h-8" />
        </div>
      </div>

      {/* Fixed bottom controls */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.4 }}
        className="fixed bottom-0 left-0 right-0 px-4 pb-safe-bottom pt-4 safe-bottom"
        style={{ background: 'linear-gradient(0deg, rgba(7,6,15,0.98) 70%, transparent)' }}>
        <div className="max-w-md mx-auto flex flex-col gap-3">
          {isHost && (
            <button onClick={handleRematch} className="btn-primary">
              Yenidən Oyna 🔄
            </button>
          )}
          <button onClick={handleMainMenu} className="btn-ghost">
            Ana Menyu
          </button>
        </div>
      </motion.div>
    </div>
  );
}
