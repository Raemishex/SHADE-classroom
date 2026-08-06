import { useEffect, useState } from 'react';
import { Crown, Users, CheckCircle2, Circle, ArrowLeft, Copy, Check, X, Sparkles, Wand2 } from 'lucide-react';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';
import { SoundFX } from '../utils/SoundFX';

interface Category { id: string; nameAz: string; icon: string; }

export default function LobbyPage() {
  const { room, myId } = useGameStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/words.json')
      .then(r => r.json())
      .then(data => { setCategories(data.categories ?? []); })
      .catch(() => {});
  }, []);

  if (!room) return null;

  const myPlayer = room.players.find(p => p.id === myId);
  const isHost = myPlayer?.isHost ?? false;
  const readyCount = room.players.filter(p => p.isReady).length;
  const canStart = readyCount >= 3 && room.settings.selectedCategories.length > 0;
  const readyPct = room.players.length > 0 ? (readyCount / room.players.length) * 100 : 0;

  const emitSetting = (key: string, value: unknown) => {
    SoundFX.playClick();
    socket.emit('update_settings', { roomCode: room.code, settings: { [key]: value } });
  };

  const toggleCategory = (id: string) => {
    SoundFX.playClick();
    const cur = [...room.settings.selectedCategories];
    emitSetting('selectedCategories', cur.includes(id) ? cur.filter(c => c !== id) : [...cur, id]);
  };

  const selectAllCategories = () => {
    SoundFX.playClick();
    emitSetting(
      'selectedCategories',
      room.settings.selectedCategories.length === categories.length ? [] : categories.map(c => c.id)
    );
  };

  const handleCopyCode = () => {
    SoundFX.playClick();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    SoundFX.playClick();
    socket.emit('player_ready', { roomCode: room.code });
  };

  const handleStartGame = () => {
    if (!canStart) return;
    SoundFX.playVictory();
    socket.emit('start_game', { roomCode: room.code });
  };

  const handleKickPlayer = (targetId: string) => {
    SoundFX.playClick();
    socket.emit('kick_player', { roomCode: room.code, targetId });
  };

  return (
    <div className="flex flex-col min-h-dvh pb-32 z-10 relative">

      {/* ── Fixed Header ────────────────── */}
      <div className="sticky top-0 z-30 px-4 pt-safe-top pb-3 bg-[#1a1520]/80 backdrop-blur-xl border-b border-[rgba(163,155,181,0.12)]">
        <div className="max-w-md mx-auto relative flex items-center justify-between h-14">
          
          {/* Back Button */}
          <button 
            onClick={() => {
              SoundFX.playClick();
              socket.emit('leave_room', { roomCode: room.code });
              useGameStore.getState().reset();
            }}
            className="p-2 rounded-xl bg-[rgba(163,155,181,0.1)] text-[#a39bb5] hover:text-[#f0ecf5] hover:bg-[rgba(163,155,181,0.2)] transition-colors"
            title="Otaqdan Çıx"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Room Code Copy Pill */}
          <div 
            onClick={handleCopyCode}
            className="flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.3)] shadow-[0_4px_20px_rgba(245,158,11,0.1)] cursor-pointer hover:scale-105 transition-all active:scale-95"
          >
            <span className="font-code text-2xl font-bold tracking-widest text-[#f59e0b]">
              {room.code}
            </span>
            {copied ? (
              <Check className="w-4 h-4 text-[#34d399]" />
            ) : (
              <Copy className="w-4 h-4 text-[#f59e0b] opacity-60" />
            )}
          </div>

          <div className="w-9" />
        </div>
      </div>

      {/* ── Scrollable Body ─────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4 max-w-md mx-auto w-full">

        {/* Players List Card */}
        <div className="card-surface p-4 rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(163,155,181,0.1)]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#f59e0b]" />
              <h3 className="font-heading font-bold text-lg text-[#f0ecf5]">
                Oyunçular ({room.players.length}/16)
              </h3>
            </div>
            <span className="text-xs font-code text-[#34d399] bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)] px-2.5 py-1 rounded-full">
              {readyCount} Hazırdır
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[rgba(163,155,181,0.08)] h-2 rounded-full overflow-hidden border border-[rgba(163,155,181,0.1)]">
            <div 
              className="bg-[#34d399] h-full transition-all duration-300"
              style={{ width: `${readyPct}%` }}
            />
          </div>

          {/* Player Grid */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            {room.players.map((p) => {
              const isMe = p.id === myId;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    p.isReady
                      ? 'bg-[rgba(52,211,153,0.06)] border-[rgba(52,211,153,0.25)]'
                      : 'bg-[rgba(163,155,181,0.04)] border-[rgba(163,155,181,0.1)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      p.isHost ? 'bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] text-[#f59e0b]' : 'bg-[rgba(163,155,181,0.1)] border border-[rgba(163,155,181,0.2)] text-[#f0ecf5]'
                    }`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-body text-sm font-semibold text-[#f0ecf5]">
                          {p.name}
                        </span>
                        {isMe && <span className="text-[10px] text-[#f59e0b] font-code">(Siz)</span>}
                        {p.isHost && <Crown className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.isReady ? (
                      <span className="inline-flex items-center gap-1 text-xs font-code text-[#34d399] bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)] px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hazır
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-code text-[#a39bb5] bg-[rgba(163,155,181,0.06)] px-2 py-0.5 rounded-lg">
                        <Circle className="w-3.5 h-3.5" /> Gözləyir
                      </span>
                    )}

                    {/* Kick Button (Host Only) */}
                    {isHost && !p.isHost && (
                      <button
                        onClick={() => handleKickPlayer(p.id)}
                        className="p-1.5 rounded-lg bg-[rgba(244,63,94,0.15)] text-[#f43f5e] hover:bg-[rgba(244,63,94,0.25)] transition-colors"
                        title="Otaqdan Çıxart"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Host Controls Section */}
        <div className="card-surface p-4 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(163,155,181,0.1)]">
            <h3 className="font-heading font-bold text-lg text-[#f0ecf5] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f59e0b]" />
              Oyun Tənzimləmələri {isHost ? '(Host)' : '(İzləmə)'}
            </h3>
          </div>

          {/* Imposter Count Selector */}
          <div className="space-y-2">
            <label className="text-xs font-body text-[#a39bb5] uppercase tracking-wider block">
              İmposter Sayı: <span className="text-[#f0ecf5] font-bold">{room.settings.imposterCount === 'auto' ? 'Avtomatik (1-5)' : `${room.settings.imposterCount} Nəfər`}</span>
            </label>
            {isHost && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(['auto', 1, 2, 3, 4, 5] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => emitSetting('imposterCount', val)}
                    className={`px-3.5 py-1.5 rounded-xl font-code text-xs border transition-all ${
                      room.settings.imposterCount === val
                        ? 'bg-[#f59e0b] border-[#f59e0b] text-[#1a1520] font-bold shadow-md'
                        : 'bg-[rgba(163,155,181,0.06)] border-[rgba(163,155,181,0.15)] text-[#a39bb5] hover:text-[#f0ecf5]'
                    }`}
                  >
                    {val === 'auto' ? 'Auto' : val}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Special Roles Toggles (Opsional Detective & Joker) */}
          <div className="space-y-2 pt-2 border-t border-[rgba(163,155,181,0.1)]">
            <span className="text-xs font-body text-[#a39bb5] uppercase tracking-wider block flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-[#f59e0b]" /> Xüsusi Rollar
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Detective Toggle */}
              <button
                disabled={!isHost}
                onClick={() => emitSetting('detectiveEnabled', !room.settings.detectiveEnabled)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  room.settings.detectiveEnabled
                    ? 'bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.3)] text-[#f59e0b]'
                    : 'bg-[rgba(163,155,181,0.05)] border-[rgba(163,155,181,0.1)] text-[#a39bb5]'
                }`}
              >
                <div className="font-bold text-xs">🔍 Cəsus (Detective)</div>
                <div className="text-[10px] opacity-70">İpucunu 1 tur sonra görür</div>
              </button>

              {/* Joker Toggle */}
              <button
                disabled={!isHost}
                onClick={() => emitSetting('jokerEnabled', !room.settings.jokerEnabled)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  room.settings.jokerEnabled
                    ? 'bg-[rgba(244,63,94,0.12)] border-[rgba(244,63,94,0.3)] text-[#f43f5e]'
                    : 'bg-[rgba(163,155,181,0.05)] border-[rgba(163,155,181,0.1)] text-[#a39bb5]'
                }`}
              >
                <div className="font-bold text-xs">🤡 Joker (Chaos)</div>
                <div className="text-[10px] opacity-70">Hamının onu çıxarmasını istəyir</div>
              </button>
            </div>
          </div>

          {/* Alliance & Hint Mode Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(163,155,181,0.1)]">
            <button
              disabled={!isHost}
              onClick={() => emitSetting('allianceMode', !room.settings.allianceMode)}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                room.settings.allianceMode
                  ? 'bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.3)] text-[#f59e0b]'
                  : 'bg-[rgba(163,155,181,0.05)] border-[rgba(163,155,181,0.1)] text-[#a39bb5]'
              }`}
            >
              🤝 İmposter İttifaqı {room.settings.allianceMode ? '(Açıq)' : '(Bağlı)'}
            </button>

            <button
              disabled={!isHost}
              onClick={() => emitSetting('imposterHintMode', !room.settings.imposterHintMode)}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                room.settings.imposterHintMode
                  ? 'bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.3)] text-[#f59e0b]'
                  : 'bg-[rgba(163,155,181,0.05)] border-[rgba(163,155,181,0.1)] text-[#a39bb5]'
              }`}
            >
              💡 İpucu Rejimi {room.settings.imposterHintMode ? '(Açıq)' : '(Bağlı)'}
            </button>
          </div>

          {/* Categories Grid */}
          <div className="space-y-2 pt-2 border-t border-[rgba(163,155,181,0.1)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-body text-[#a39bb5] uppercase tracking-wider">
                Kateqoriyalar ({room.settings.selectedCategories.length}/{categories.length})
              </span>
              {isHost && (
                <button
                  onClick={selectAllCategories}
                  className="text-xs font-body text-[#f59e0b] hover:underline"
                >
                  Hamısını Seç / Ləğv et
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = room.settings.selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    disabled={!isHost}
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-xs font-body font-medium flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.35)] text-[#f0ecf5]'
                        : 'bg-[rgba(163,155,181,0.05)] border-[rgba(163,155,181,0.1)] text-[#a39bb5]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.nameAz}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ── Fixed Bottom Actions ─────────────── */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-[#1a1520]/90 backdrop-blur-lg border-t border-[rgba(163,155,181,0.12)] z-40">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={handleToggleReady}
            className={myPlayer?.isReady ? 'btn-ghost' : 'btn-citizen'}
          >
            {myPlayer?.isReady ? 'Gözləməyə Keç' : 'HAZIRAM 👍'}
          </button>

          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className="btn-primary"
            >
              OYUNU BAŞLAT 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
