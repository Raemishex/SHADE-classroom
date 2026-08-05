import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, AlertTriangle } from 'lucide-react';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';
import { SoundFX } from '../utils/SoundFX';

export default function ResultPage() {
  const { room, myId, myWord, myCategoryName, myAllies } = useGameStore();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    SoundFX.playVictory();

    // Velvet Intrigue Confetti burst with warm game colors
    const burst = (origin: { x: number; y: number }) =>
      confetti({
        particleCount: 75,
        spread: 80,
        origin,
        colors: ['#f59e0b', '#34d399', '#f43f5e', '#f0ecf5', '#a39bb5'],
        ticks: 240,
        scalar: 1.1,
      });

    setTimeout(() => { burst({ x: 0.25, y: 0.55 }); burst({ x: 0.75, y: 0.55 }); }, 200);
    setTimeout(() => { burst({ x: 0.5, y: 0.35 }); }, 800);

    const timers = [
      setTimeout(() => setPhase(1), 350),
      setTimeout(() => setPhase(2), 950),
      setTimeout(() => setPhase(3), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!room) return null;

  const myPlayer = room.players.find(p => p.id === myId);
  const isHost = myPlayer?.isHost ?? false;
  const imposters = myAllies ?? [];
  const citizens = room.players.filter(p => !imposters.includes(p.name)).map(p => p.name);

  const handleRematch = () => {
    SoundFX.playVictory();
    socket.emit('rematch', { roomCode: room.code });
  };

  const handleMainMenu = () => {
    SoundFX.playClick();
    socket.emit('leave_room', { roomCode: room.code });
    useGameStore.getState().reset();
  };

  return (
    <div className="flex flex-col min-h-dvh pb-32 z-10 relative">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-md mx-auto w-full space-y-6">

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="text-center space-y-2"
        >
          <span className="text-xs font-code tracking-widest text-[#a39bb5] uppercase">
            Raund Başa Çatdı
          </span>
          <h1 className="font-heading font-bold text-5xl tracking-wider text-[#f0ecf5]">
            NƏTİCƏLƏR 🎉
          </h1>
          <div className="velvet-divider" />
        </motion.div>

        {/* Word + Category Reveal */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              key="word"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="card-surface p-6 rounded-3xl text-center space-y-2 border-[rgba(245,158,11,0.3)] shadow-[0_8px_30px_rgba(245,158,11,0.1)]"
            >
              <span className="text-xs font-body text-[#a39bb5] uppercase tracking-widest block">
                Əsl Gizli Söz:
              </span>
              <h2 className="font-heading font-bold text-4xl text-[#34d399] tracking-wide">
                {myWord ?? room.currentWord ?? 'Bilinmir'}
              </h2>
              <p className="text-xs text-[#a39bb5] font-body">
                Kateqoriya: {myCategoryName ?? room.currentCategory?.nameAz ?? 'Bilinmir'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Imposters List Card */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              key="imposters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="p-5 rounded-3xl bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.25)] space-y-3"
            >
              <div className="flex items-center gap-2 text-[#f43f5e]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-heading font-bold text-xl text-[#f0ecf5]">
                  İmposterlər Kim İdi?
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {imposters.map((name) => (
                  <span
                    key={name}
                    className="px-3.5 py-1.5 rounded-xl bg-[rgba(244,63,94,0.15)] border border-[rgba(244,63,94,0.3)] text-[#f43f5e] font-body font-bold text-sm"
                  >
                    🔴 {name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Citizens List Card */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              key="citizens"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="p-5 rounded-3xl bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.25)] space-y-3"
            >
              <div className="flex items-center gap-2 text-[#34d399]">
                <Trophy className="w-5 h-5" />
                <h3 className="font-heading font-bold text-xl text-[#f0ecf5]">
                  Vətəndaşlar
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {citizens.map((name) => (
                  <span
                    key={name}
                    className="px-3.5 py-1.5 rounded-xl bg-[rgba(52,211,153,0.15)] border border-[rgba(52,211,153,0.3)] text-[#34d399] font-body text-sm font-semibold"
                  >
                    ✅ {name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Fixed Bottom Actions ─────────────── */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-[#1a1520]/90 backdrop-blur-lg border-t border-[rgba(163,155,181,0.12)] z-40">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={handleMainMenu}
            className="btn-ghost flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ana Menyu
          </button>

          {isHost && (
            <button
              onClick={handleRematch}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              YENİDƏN OYNA (REMATCH)
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
