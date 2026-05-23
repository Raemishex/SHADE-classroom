import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Users, CheckCircle2, Circle, ArrowLeft, Copy, Check } from 'lucide-react';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';

interface Category { id: string; nameAz: string; icon: string; }

export default function LobbyPage() {
  const { room, myId } = useGameStore();
  const [categories, setCategories]           = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [copied, setCopied]                   = useState(false);

  useEffect(() => {
    fetch('/words.json')
      .then(r => r.json())
      .then(data => { setCategories(data.categories ?? []); setCategoriesLoading(false); })
      .catch(() => setCategoriesLoading(false));
  }, []);

  if (!room) return null;

  const myPlayer      = room.players.find(p => p.id === myId);
  const isHost        = myPlayer?.isHost ?? false;
  const readyCount    = room.players.filter(p => p.isReady).length;
  const canStart      = readyCount >= 3 && room.settings.selectedCategories.length > 0;
  const readyPct      = room.players.length > 0 ? (readyCount / room.players.length) * 100 : 0;

  const emit = (key: string, value: unknown) =>
    socket.emit('update_settings', { roomCode: room.code, settings: { [key]: value } });

  const toggleCategory = (id: string) => {
    const cur = [...room.settings.selectedCategories];
    emit('selectedCategories', cur.includes(id) ? cur.filter(c => c !== id) : [...cur, id]);
  };

  const selectAll = () =>
    emit('selectedCategories',
      room.settings.selectedCategories.length === categories.length ? [] : categories.map(c => c.id));

  return (
    <div className="flex flex-col min-h-dvh">

      {/* ── Fixed header ────────────────── */}
      <div className="sticky top-0 z-30 px-4 pt-safe-top pb-4"
        style={{ background: 'linear-gradient(180deg, rgba(7,6,15,0.98) 70%, transparent)' }}>
        <div className="max-w-md mx-auto relative flex items-center justify-center pt-4 h-16">
          
          {/* Back Button */}
          <button 
            onClick={() => {
              socket.emit('leave_room', { roomCode: room.code });
              useGameStore.getState().reset();
            }}
            className="absolute left-0 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Otaqdan Çıx">
            <ArrowLeft size={24} />
          </button>

          {/* Room code */}
          <div 
            onClick={() => {
              navigator.clipboard.writeText(room.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="relative inline-flex items-center px-8 py-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(191,95,255,0.25)',
              boxShadow: '0 0 32px rgba(191,95,255,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[0.55rem] tracking-[0.3em] uppercase px-2 transition-colors"
              style={{ color: copied ? 'var(--neon-green)' : 'var(--text-ghost)', background: 'var(--bg-void)' }}>
              {copied ? 'Kopyalandı!' : 'Otaq Kodu'}
            </span>
            <span className="font-mono text-4xl font-bold tracking-[0.18em] text-white select-none">
              {room.code}
            </span>
            
            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: copied ? 'var(--neon-green)' : 'var(--text-ghost)' }}>
               {copied ? <Check size={18} /> : <Copy size={18} />}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ─────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-40">
        <div className="max-w-md mx-auto space-y-4 pt-2">

          {/* Players section */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <Users size={16} style={{ color: 'var(--neon-purple)' }} />
                <span className="font-rajdhani font-semibold text-lg tracking-wider text-white">Oyunçular</span>
              </div>
              <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                {room.players.length}/16
              </span>
            </div>

            {/* Player list */}
            <div className="px-3 py-3 space-y-2">
              <AnimatePresence initial={false}>
                {room.players.map(p => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={p.isReady ? {
                      background: 'rgba(57,255,143,0.05)',
                      border: '1px solid rgba(57,255,143,0.18)',
                    } : {
                      background: 'rgba(155,150,196,0.04)',
                      border: '1px solid rgba(155,150,196,0.08)',
                    }}
                  >
                    {/* Status dot */}
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={p.isReady ? {
                        background: 'var(--neon-green)',
                        boxShadow: '0 0 8px rgba(57,255,143,0.8)',
                      } : {
                        background: 'var(--text-ghost)',
                      }} />

                    {/* Name */}
                    <span className="font-syne font-medium text-white flex-1 truncate">
                      {p.name}
                    </span>

                    {/* Badges & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!p.isConnected && (
                        <span className="font-mono text-[0.55rem] tracking-wider"
                          style={{ color: 'var(--neon-red)' }}>XƏTDƏ DEYİL</span>
                      )}
                      {p.isHost && <Crown size={14} className="text-amber-400" />}
                      {!p.isHost && isHost && (
                        <button
                          onClick={() => socket.emit('kick_player', { roomCode: room.code, targetId: p.id })}
                          className="p-1 rounded-md transition-colors hover:bg-white/10 text-red-400/70 hover:text-red-400"
                          title="Oyundan çıxar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      )}
                      {p.isReady
                        ? <CheckCircle2 size={16} style={{ color: 'var(--neon-green)' }} />
                        : <Circle size={16} style={{ color: 'var(--text-ghost)' }} />}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Min players notice */}
              {room.players.length < 3 && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-3 font-mono text-[0.65rem] tracking-[0.25em] uppercase animate-pulse"
                  style={{ color: 'var(--text-ghost)' }}>
                  Ən azı 3 oyunçu lazımdır
                </motion.p>
              )}
            </div>

            {/* Ready progress bar */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(155,150,196,0.1)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--neon-green)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${readyPct}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <span className="font-mono text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {readyCount}/{room.players.length}
                </span>
              </div>
            </div>
          </div>

          {/* ── Host settings ── */}
          {isHost ? (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: '1px solid rgba(191,95,255,0.2)' }}>

              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(191,95,255,0.1)' }}>
                <p className="font-rajdhani font-semibold text-lg tracking-wider"
                  style={{ color: 'var(--neon-purple)' }}>Oyun Tənzimləmələri</p>
              </div>

              <div className="px-5 py-4 space-y-5">
                {/* Imposter count */}
                <div>
                  <label className="font-mono text-[0.65rem] tracking-[0.2em] uppercase block mb-2"
                    style={{ color: 'var(--text-secondary)' }}>İmposter Sayı</label>
                  <select
                    value={room.settings.imposterCount}
                    onChange={e => emit('imposterCount', e.target.value)}
                    className="w-full rounded-xl px-4 py-3 font-syne text-white outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(155,150,196,0.15)',
                    }}>
                    <option value="auto" className="bg-[#0f0a1f] text-white">Avtomatik</option>
                    <option value="1" className="bg-[#0f0a1f] text-white">1 İmposter</option>
                    <option value="2" className="bg-[#0f0a1f] text-white">2 İmposter</option>
                    <option value="3" className="bg-[#0f0a1f] text-white">3 İmposter</option>
                    <option value="4" className="bg-[#0f0a1f] text-white">4 İmposter</option>
                    <option value="5" className="bg-[#0f0a1f] text-white">5 İmposter</option>
                  </select>
                </div>

                {/* Alliance mode */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-syne font-medium text-white text-sm">İmposter İttifaqı</p>
                    <p className="font-mono text-[0.6rem] mt-0.5" style={{ color: 'var(--text-ghost)' }}>
                      İmposterlər bir-birini görür
                    </p>
                  </div>
                  <button
                    onClick={() => emit('allianceMode', !room.settings.allianceMode)}
                    className="relative w-14 h-7 rounded-full shrink-0 transition-all duration-300"
                    style={room.settings.allianceMode ? {
                      background: 'rgba(191,95,255,0.25)',
                      boxShadow: '0 0 12px rgba(191,95,255,0.4)',
                    } : {
                      background: 'rgba(155,150,196,0.1)',
                    }}>
                    <div
                      className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300"
                      style={room.settings.allianceMode ? {
                        left: '2rem',
                        background: 'var(--neon-purple)',
                        boxShadow: '0 0 8px rgba(191,95,255,0.8)',
                      } : {
                        left: '0.25rem',
                        background: 'var(--text-ghost)',
                      }} />
                  </button>
                </div>

                {/* Imposter Hint Mode */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-syne font-medium text-white text-sm">İmposter İpucu</p>
                    <p className="font-mono text-[0.6rem] mt-0.5" style={{ color: 'var(--text-ghost)' }}>
                      İmposterə kateqoriya göstərilir
                    </p>
                  </div>
                  <button
                    onClick={() => emit('imposterHintMode', !room.settings.imposterHintMode)}
                    className="relative w-14 h-7 rounded-full shrink-0 transition-all duration-300"
                    style={room.settings.imposterHintMode ? {
                      background: 'rgba(191,95,255,0.25)',
                      boxShadow: '0 0 12px rgba(191,95,255,0.4)',
                    } : {
                      background: 'rgba(155,150,196,0.1)',
                    }}>
                    <div
                      className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300"
                      style={room.settings.imposterHintMode ? {
                        left: '2rem',
                        background: 'var(--neon-purple)',
                        boxShadow: '0 0 8px rgba(191,95,255,0.8)',
                      } : {
                        left: '0.25rem',
                        background: 'var(--text-ghost)',
                      }} />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-mono text-[0.65rem] tracking-[0.2em] uppercase"
                      style={{ color: 'var(--text-secondary)' }}>Kateqoriyalar ({room.settings.selectedCategories.length}/{categories.length})</label>
                    <button
                      onClick={selectAll}
                      className="font-mono text-[0.65rem] tracking-wider uppercase transition-colors"
                      style={{ color: 'var(--neon-purple)' }}>
                      {room.settings.selectedCategories.length === categories.length ? 'Hamısını Sil' : 'Hamısını Seç'}
                    </button>
                  </div>

                  {categoriesLoading ? (
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-11 rounded-xl animate-pulse"
                          style={{ background: 'rgba(155,150,196,0.06)' }} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <motion.div
                        className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1"
                        variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
                        initial="hidden" animate="visible">
                        {categories.map(cat => {
                          const sel = room.settings.selectedCategories.includes(cat.id);
                          return (
                            <motion.button
                              key={cat.id}
                              variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                              onClick={() => toggleCategory(cat.id)}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-150 active:scale-[0.96]"
                              style={sel ? {
                                background: 'rgba(191,95,255,0.12)',
                                border: '1px solid rgba(191,95,255,0.4)',
                                color: 'white',
                              } : {
                                background: 'rgba(155,150,196,0.04)',
                                border: '1px solid rgba(155,150,196,0.1)',
                                color: 'var(--text-secondary)',
                              }}>
                              <span className="text-base shrink-0">{cat.icon}</span>
                              <span className="font-syne truncate text-[0.8rem]">{cat.nameAz}</span>
                            </motion.button>
                          );
                        })}
                      </motion.div>

                      {room.settings.selectedCategories.length === 0 && (
                        <p className="font-mono text-[0.65rem] mt-2" style={{ color: 'var(--neon-red)' }}>
                          Ən azı 1 kateqoriya seçilməlidir.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Non-host status card */
            <div className="rounded-2xl px-5 py-4 text-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <p className="font-mono text-[0.6rem] tracking-[0.25em] uppercase animate-pulse"
                style={{ color: 'var(--text-ghost)' }}>
                Host oyunu konfiqurasiya edir
              </p>
              <div className="flex justify-center gap-4 mt-3 font-mono text-xs"
                style={{ color: 'var(--text-secondary)' }}>
                <span>Kateqoriya: {room.settings.selectedCategories.length}</span>
                <span>·</span>
                <span>İmposter: {room.settings.imposterCount === 'auto' ? 'Auto' : room.settings.imposterCount}</span>
                <span>·</span>
                <span>İttifaq: {room.settings.allianceMode ? 'Aktiv' : 'Passiv'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed bottom CTA ────────────── */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-safe-bottom pt-4 safe-bottom"
        style={{ background: 'linear-gradient(0deg, rgba(7,6,15,0.98) 70%, transparent)' }}>
        <div className="max-w-md mx-auto">
          {isHost ? (
            <>
              {!canStart && (
                <p className="text-center font-mono text-[0.6rem] tracking-wider mb-3 uppercase"
                  style={{ color: 'var(--text-ghost)' }}>
                  {room.settings.selectedCategories.length === 0
                    ? 'Kateqoriya seçin'
                    : `Ən azı 3 hazır oyunçu lazımdır (${readyCount}/3)`}
                </p>
              )}
              <button
                onClick={() => socket.emit('start_game', { roomCode: room.code })}
                disabled={!canStart}
                className="btn-primary">
                Oyunu Başlat ({readyCount}/16)
              </button>
            </>
          ) : (
            <button
              onClick={() => socket.emit('player_ready', { roomCode: room.code })}
              className={myPlayer?.isReady ? 'btn-ghost w-full py-4 text-lg font-rajdhani font-bold tracking-wider' : 'btn-citizen w-full'}>
              {myPlayer?.isReady ? '✓ Hazıram — ləğv et' : 'Hazıram'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
