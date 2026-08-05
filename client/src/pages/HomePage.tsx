import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, HelpCircle, Play, Key, User } from 'lucide-react';
import { socket } from '../socket';
import { SoundFX } from '../utils/SoundFX';

type Mode = 'menu' | 'create' | 'join';

export default function HomePage() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<Mode>('menu');
  const [showRules, setShowRules] = useState(false);

  const handleCreateRoom = () => {
    if (!name.trim()) return;
    SoundFX.playClick();
    socket.emit('create_room', { playerName: name.trim() });
  };

  const handleJoinRoom = () => {
    if (!name.trim() || roomCode.length < 4) return;
    SoundFX.playClick();
    socket.emit('join_room', { roomCode: roomCode.trim(), playerName: name.trim() });
  };

  const canCreate = name.trim().length > 0;
  const canJoin   = name.trim().length > 0 && roomCode.length === 4;

  const slideVariants = {
    initial: { opacity: 0, y: 24, filter: 'blur(3px)' },
    animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
    exit:    { opacity: 0, y: -16, filter: 'blur(3px)' },
  };

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-4 overflow-hidden py-8 z-10">

      {/* Velvet Intrigue Brand Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="text-center mb-10 select-none"
      >
        <div className="relative inline-block">
          <h1 className="font-heading font-black text-6xl md:text-7xl leading-none tracking-[0.15em] text-[#f0ecf5]">
            SHADE
          </h1>
          <div className="h-1 w-16 mx-auto mt-2 bg-[#f59e0b] rounded-full shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
        </div>

        <p className="font-body text-sm tracking-wide text-[#a39bb5] mt-3">
          Kölgədə kim gizlənir? — Sosial Deduksiya Və Kələm Oyunu
        </p>
      </motion.div>

      {/* Main Action Cards */}
      <div className="w-full max-w-md space-y-4">
        <AnimatePresence mode="wait">
          {mode === 'menu' && (
            <motion.div
              key="menu"
              variants={slideVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-4"
            >
              {/* Dual Velvet Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Create Room Card */}
                <div
                  onClick={() => {
                    SoundFX.playClick();
                    setMode('create');
                  }}
                  className="card-surface p-5 text-center flex flex-col items-center justify-between space-y-4 cursor-pointer hover:border-[rgba(245,158,11,0.4)] transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] flex items-center justify-center text-[#f59e0b] group-hover:scale-105 transition-transform">
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#f0ecf5] group-hover:text-[#f59e0b] transition-colors">
                      OTAQ YARAT
                    </h3>
                    <p className="text-xs text-[#a39bb5] mt-1">
                      Oyun meyxanı başlat
                    </p>
                  </div>
                  <button className="btn-primary py-2.5 text-sm font-bold tracking-wider">
                    BAŞLAT
                  </button>
                </div>

                {/* Join Room Card */}
                <div
                  onClick={() => {
                    SoundFX.playClick();
                    setMode('join');
                  }}
                  className="card-surface p-5 text-center flex flex-col items-center justify-between space-y-4 cursor-pointer hover:border-[rgba(163,155,181,0.4)] transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(163,155,181,0.1)] border border-[rgba(163,155,181,0.2)] flex items-center justify-center text-[#f0ecf5] group-hover:scale-105 transition-transform">
                    <Key className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#f0ecf5] group-hover:text-white transition-colors">
                      OTAĞA QOŞUL
                    </h3>
                    <p className="text-xs text-[#a39bb5] mt-1">
                      4-rəqəmli kodla daxil ol
                    </p>
                  </div>
                  <button className="btn-ghost py-2.5 text-sm font-bold tracking-wider">
                    QOŞUL
                  </button>
                </div>
              </div>

              {/* Rules Trigger */}
              <button
                onClick={() => {
                  SoundFX.playClick();
                  setShowRules(true);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-[rgba(36,30,46,0.6)] border border-[rgba(163,155,181,0.12)] text-xs text-[#a39bb5] hover:text-[#f0ecf5] hover:border-[rgba(163,155,181,0.25)] transition-all flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-[#f59e0b]" />
                <span>Oyun Qaydaları Və Rol Bələdçisi</span>
              </button>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              key="create"
              variants={slideVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="card-surface p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setMode('menu')}
                  className="p-2 rounded-xl bg-[rgba(163,155,181,0.1)] hover:bg-[rgba(163,155,181,0.2)] text-[#a39bb5] hover:text-[#f0ecf5] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-heading font-bold text-xl text-[#f0ecf5] tracking-wide">
                  Otaq Yarat (Host)
                </h2>
                <div className="w-9" />
              </div>

              <div>
                <label className="block text-xs font-body text-[#a39bb5] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#f59e0b]" /> Sizin Adınız
                </label>
                <input
                  type="text"
                  placeholder="Məsələn: Orxan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={16}
                  className="input-glass"
                  autoFocus
                />
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={!canCreate}
                className="btn-primary"
              >
                Davam Et ➔
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              variants={slideVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="card-surface p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setMode('menu')}
                  className="p-2 rounded-xl bg-[rgba(163,155,181,0.1)] hover:bg-[rgba(163,155,181,0.2)] text-[#a39bb5] hover:text-[#f0ecf5] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-heading font-bold text-xl text-[#f0ecf5] tracking-wide">
                  Otağa Qoşul
                </h2>
                <div className="w-9" />
              </div>

              <div>
                <label className="block text-xs font-body text-[#a39bb5] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#f59e0b]" /> Sizin Adınız
                </label>
                <input
                  type="text"
                  placeholder="Məsələn: Nərmin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={16}
                  className="input-glass"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-code text-[#a39bb5] mb-2 uppercase tracking-wider">
                  4-Rəqəmli Otaq Kodu
                </label>
                <input
                  type="text"
                  placeholder="4582"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="input-code"
                />
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={!canJoin}
                className="btn-primary"
              >
                Otağa Gir ➔
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg"
          >
            <div className="card-surface p-6 max-w-sm w-full space-y-5 border border-[rgba(163,155,181,0.2)]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#f59e0b]" />
                <h3 className="font-heading font-bold text-xl text-[#f0ecf5]">
                  SHADE Oyunu Qaydaları
                </h3>
              </div>
              <div className="space-y-3 text-xs text-[#a39bb5] leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
                <div className="p-3.5 rounded-2xl bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.2)] space-y-1">
                  <span className="font-bold text-[#34d399] block text-sm">✅ Vətəndaşlar (Citizens):</span>
                  <p className="text-[#f0ecf5]">Ekranındakı gizli sözü görürlər. Məqsəd sözü imposterlərə bildirmədən izah edib imposteri tapmaqdır.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.2)] space-y-1">
                  <span className="font-bold text-[#f43f5e] block text-sm">🔴 İmposterlər:</span>
                  <p className="text-[#f0ecf5]">Gizli sözü bilmir, yalnız kateqoriyanı görürlər (məsələn, "Yeməklər"). Vətəndaş kimi davranıb sözü təxmin etməlidirlər.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] space-y-1">
                  <span className="font-bold text-[#f59e0b] block text-sm">👁️ Hold-to-See Mexanikası:</span>
                  <p className="text-[#f0ecf5]">Kartınızdakı söz və rolunuz gizlidir. Düyməni basıb saxlayaraq yalnız özünüz baxın.</p>
                </div>
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="btn-primary w-full py-3.5 text-sm"
              >
                Anladım! 👍
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
