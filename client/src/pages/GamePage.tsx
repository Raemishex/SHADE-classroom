import { useState, useRef, useCallback } from 'react';
import { Eye, EyeOff, Mic, Square, Users } from 'lucide-react';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';
import { SoundFX } from '../utils/SoundFX';

export default function GamePage() {
  const { room, myId, myRole, myWord, myCategoryName, myCategoryIcon } = useGameStore();
  const [isPeekOpen, setIsPeekOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const isImposter = myRole === 'imposter';
  const isJoker = myRole === 'joker';

  /* ── Hold-to-end game mechanic (Host Only) ── */
  const startHold = useCallback(() => {
    if (!room) return;
    SoundFX.playClick();
    startRef.current = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - startRef.current) / 1500, 1);
      setHoldProgress(p);
      if (p < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        SoundFX.playVictory();
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

  const myPlayer = room.players.find(p => p.id === myId);
  const isHost = myPlayer?.isHost ?? false;
  const firstSpeaker = room.players.find(p => p.id === room.firstSpeaker);

  const togglePeek = () => {
    SoundFX.playClick();
    setIsPeekOpen(!isPeekOpen);
  };

  return (
    <div className="flex flex-col min-h-dvh pt-20 pb-32 px-4 max-w-md mx-auto w-full select-none z-10 relative">

      {/* ── Top Information Bar ── */}
      <div className="fixed top-0 inset-x-0 z-30 px-4 pt-safe-top pb-3 bg-[#1a1520]/85 backdrop-blur-xl border-b border-[rgba(163,155,181,0.12)]">
        <div className="max-w-md mx-auto flex items-center gap-2 pt-2">
          
          {/* Neutral Role Badge */}
          <div className="px-3 py-2 rounded-xl bg-[rgba(163,155,181,0.08)] border border-[rgba(163,155,181,0.15)] text-[#a39bb5] text-xs font-code">
            <span>ROL</span>
          </div>

          {/* Secret Word Masked Pill */}
          <div className="flex-1 px-4 py-2 rounded-xl bg-[rgba(36,30,46,0.8)] border border-[rgba(163,155,181,0.18)] text-center">
            <p className="text-[10px] font-code text-[#f59e0b] uppercase">
              {isPeekOpen ? (isImposter ? 'KATEQORİYA İPUCUSU' : 'GİZLİ SÖZÜNÜZ') : 'MƏLUMAT MASKALANIB'}
            </p>
            <p className="font-heading font-bold text-base text-[#f0ecf5] tracking-wider truncate">
              {isPeekOpen
                ? isImposter
                  ? room?.settings.imposterHintMode ? `${myCategoryName} ${myCategoryIcon}` : 'Bilinmir'
                  : isJoker
                  ? 'Söz Bilinmir (Joker)'
                  : myWord
                : '••••••••'}
            </p>
          </div>

          {/* Peek Eye Button */}
          <button
            onClick={togglePeek}
            className={`p-2.5 rounded-xl border transition-all ${
              isPeekOpen
                ? 'bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.4)] text-[#f59e0b]'
                : 'bg-[rgba(163,155,181,0.08)] border-[rgba(163,155,181,0.15)] text-[#a39bb5] hover:text-[#f0ecf5]'
            }`}
            title="Bax / Gizlə"
          >
            {isPeekOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── First Speaker Radar / Pulse Banner ── */}
      <div className="card-surface p-6 rounded-3xl text-center space-y-4 my-auto relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[rgba(245,158,11,0.08)] blur-2xl" />
        
        {/* Pulse Mic Icon */}
        <div className="relative w-20 h-20 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] mx-auto flex items-center justify-center text-[#f59e0b]">
          <div className="absolute inset-0 rounded-full bg-[rgba(245,158,11,0.2)] animate-ping" />
          <Mic className="w-8 h-8 relative z-10" />
        </div>

        <div>
          <span className="text-xs font-body text-[#a39bb5] uppercase tracking-widest block">
            İlk Danışan Oyunçu:
          </span>
          <h2 className="font-heading font-bold text-3xl text-[#f0ecf5] tracking-wide mt-1">
            {firstSpeaker?.name ?? 'Məlum deyil'}
          </h2>
        </div>

        <p className="text-xs text-[#a39bb5] font-body leading-relaxed max-w-xs mx-auto">
          Müzakirəni {firstSpeaker?.name} başladır. Ətrafdakılar növbə ilə saat əqrəbi istiqamətində sözlə bağlı 1 cümləlik ipucu verir!
        </p>
      </div>

      {/* Players Discussion List */}
      <div className="card-surface p-4 rounded-3xl space-y-3 mt-4">
        <div className="flex items-center justify-between pb-2 border-b border-[rgba(163,155,181,0.1)]">
          <h4 className="font-heading font-bold text-base text-[#f0ecf5] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#f59e0b]" />
            Otaqdakı Oyunçular ({room.players.length})
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {room.players.map((p) => (
            <div
              key={p.id}
              className={`p-2.5 rounded-xl border text-xs font-body flex items-center gap-2 ${
                p.id === room.firstSpeaker
                  ? 'bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.3)] text-[#f59e0b] font-bold'
                  : 'bg-[rgba(163,155,181,0.05)] border-[rgba(163,155,181,0.1)] text-[#f0ecf5]'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-[rgba(163,155,181,0.1)] flex items-center justify-center font-bold text-[10px]">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fixed Host End Game Control ── */}
      {isHost && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-[#1a1520]/90 backdrop-blur-lg border-t border-[rgba(163,155,181,0.12)] z-40">
          <div className="max-w-md mx-auto">
            <button
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              className="btn-danger relative overflow-hidden py-4 text-lg"
            >
              {/* Progress Bar Fill */}
              <div
                className="absolute inset-0 bg-white/20 transition-all duration-75 pointer-events-none"
                style={{ width: `${holdProgress * 100}%` }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                <Square className="w-5 h-5 fill-current" />
                OYUNU BİTİR (BASIB SAXLAYIN)
              </span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
