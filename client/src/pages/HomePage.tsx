import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { socket } from '../socket';

type Mode = 'menu' | 'create' | 'join';

export default function HomePage() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<Mode>('menu');

  const handleCreateRoom = () => {
    if (!name.trim()) return;
    socket.emit('create_room', { playerName: name.trim() });
  };

  const handleJoinRoom = () => {
    if (!name.trim() || roomCode.length < 4) return;
    socket.emit('join_room', { roomCode: roomCode.trim(), playerName: name.trim() });
  };

  const canCreate = name.trim().length > 0;
  const canJoin   = name.trim().length > 0 && roomCode.length === 4;

  const slideVariants = {
    initial: { opacity: 0, y: 32, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
    exit:    { opacity: 0, y: -20, filter: 'blur(4px)' },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-dvh px-5 overflow-hidden">

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(191,95,255,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(191,95,255,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Logo block */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center mb-12 select-none"
      >
        {/* Logo glow underlay */}
        <div className="relative inline-block">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-40"
            style={{ background: 'radial-gradient(ellipse, rgba(191,95,255,0.6) 0%, transparent 70%)' }} />

          <h1 className="font-rajdhani font-bold text-[5.5rem] leading-none tracking-[0.1em] text-white text-neon-glow-purple">
            SHADE
          </h1>
        </div>

        {/* Subtitle row */}
        <div className="flex items-center gap-3 justify-center mt-1">
          <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(191,95,255,0.5))' }} />
          <span className="font-mono text-[0.65rem] tracking-[0.35em] uppercase"
            style={{ color: 'var(--text-secondary)' }}>
            Classroom
          </span>
          <div className="h-px w-10" style={{ background: 'linear-gradient(270deg, transparent, rgba(191,95,255,0.5))' }} />
        </div>

        {/* Beta badge */}
        <div className="mt-4">
          <span className="inline-block font-mono text-[0.6rem] tracking-[0.25em] uppercase px-3 py-1 rounded-full"
            style={{
              color: 'var(--neon-purple)',
              border: '1px solid rgba(191,95,255,0.3)',
              background: 'rgba(191,95,255,0.06)',
            }}>
            v1.0 Beta
          </span>
        </div>
      </motion.div>

      {/* Panel */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {mode === 'menu' && (
            <motion.div
              key="menu"
              variants={slideVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col gap-3"
            >
              <button onClick={() => setMode('create')} className="btn-primary">
                Otaq Yarat
              </button>
              <button onClick={() => setMode('join')} className="btn-ghost">
                Otağa Qoşul
              </button>

              {/* Tagline */}
              <p className="text-center font-mono text-[0.6rem] tracking-[0.2em] mt-4 uppercase"
                style={{ color: 'var(--text-ghost)' }}>
                Real-time · Sosial deduksiya
              </p>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              key="create"
              variants={slideVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col gap-3"
            >
              {/* Panel header */}
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setMode('menu')}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: 'rgba(155,150,196,0.06)', border: '1px solid rgba(155,150,196,0.12)', color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <p className="font-rajdhani font-semibold text-xl tracking-wider text-white leading-none">
                    Otaq Yarat
                  </p>
                  <p className="font-mono text-[0.6rem] tracking-wider mt-0.5" style={{ color: 'var(--text-ghost)' }}>
                    4 rəqəmli kod əldə edəcəksiniz
                  </p>
                </div>
              </div>

              <div className="relative">
                <input
                  className="input-glass"
                  type="text"
                  placeholder="Adınız"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && canCreate) handleCreateRoom(); }}
                  maxLength={15}
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs"
                  style={{ color: 'var(--text-ghost)' }}>
                  {name.length}/15
                </span>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={!canCreate}
                className="btn-primary mt-1"
              >
                Yarat
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              variants={slideVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col gap-3"
            >
              {/* Panel header */}
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setMode('menu')}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: 'rgba(155,150,196,0.06)', border: '1px solid rgba(155,150,196,0.12)', color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <p className="font-rajdhani font-semibold text-xl tracking-wider text-white leading-none">
                    Otağa Qoşul
                  </p>
                  <p className="font-mono text-[0.6rem] tracking-wider mt-0.5" style={{ color: 'var(--text-ghost)' }}>
                    Hostdan kodu alın
                  </p>
                </div>
              </div>

              <input
                className="input-code"
                type="text"
                placeholder="0000"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter' && canJoin) handleJoinRoom(); }}
                maxLength={4}
                autoFocus
              />

              <div className="relative">
                <input
                  className="input-glass"
                  type="text"
                  placeholder="Adınız"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && canJoin) handleJoinRoom(); }}
                  maxLength={15}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs"
                  style={{ color: 'var(--text-ghost)' }}>
                  {name.length}/15
                </span>
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={!canJoin}
                className="btn-primary mt-1"
              >
                Qoşul
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
