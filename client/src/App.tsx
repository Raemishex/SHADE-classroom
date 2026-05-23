import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, WifiOff } from 'lucide-react';
import { socket } from './socket';
import { useGameStore } from './store/gameStore';

import HomePage      from './pages/HomePage';
import LobbyPage     from './pages/LobbyPage';
import CardRevealPage from './pages/CardRevealPage';
import GamePage      from './pages/GamePage';
import ResultPage    from './pages/ResultPage';

/* ─── Page transition wrapper ─────────────────────── */
const PageTransition = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
    animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
    exit={{    opacity: 0, y: -8,  filter: 'blur(3px)' }}
    transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
    style={{ minHeight: '100dvh' }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const { room, setRoom, setMyInfo } = useGameStore();
  const [toast,       setToast]       = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  /* ── Toast helper ── */
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Socket events ── */
  useEffect(() => {
    const onConnect    = () => { setIsConnected(true); setMyInfo({ myId: socket.id ?? null }); };
    const onDisconnect = () => { setIsConnected(false); };

    // If already connected at mount, set myId immediately
    if (socket.connected && socket.id) {
      setMyInfo({ myId: socket.id });
    }

    socket.on('connect',    onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('room_created', ({ room }) => setRoom(room));
    socket.on('room_joined',  ({ room }) => setRoom(room));
    socket.on('room_updated', ({ room }) => setRoom(room));

    socket.on('game_started', data => {
      setMyInfo({
        myRole:         data.role,
        myWord:         data.word,
        myCategoryName: data.categoryName,
        myCategoryIcon: data.categoryIcon,
        myAllies:       data.allies,
      });
    });

    socket.on('game_phase_changed', ({ status, firstSpeaker }) => {
      setRoom({ ...useGameStore.getState().room!, status, firstSpeaker: firstSpeaker ?? null });
    });

    socket.on('game_ended', data => {
      setMyInfo({
        myWord:         data.word,
        myCategoryName: data.category,
        myAllies:       data.imposters,
      });
    });

    socket.on('host_changed', ({ newHostId, newHostName }) => {
      showToast(`${newHostName} yeni host oldu`);
      const cur = useGameStore.getState().room;
      if (cur) setRoom({ ...cur, hostId: newHostId });
    });

    socket.on('kicked', () => {
      showToast("Siz otaqdan çıxarıldınız");
      useGameStore.getState().reset();
    });

    socket.on('error', ({ message }) => showToast(message));

    return () => {
      socket.off('connect',           onConnect);
      socket.off('disconnect',        onDisconnect);
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('room_updated');
      socket.off('game_started');
      socket.off('game_phase_changed');
      socket.off('game_ended');
      socket.off('host_changed');
      socket.off('kicked');
      socket.off('error');
    };
  }, [setRoom, setMyInfo]);

  /* ── Page resolver ── */
  const [pageId, PageComponent] = (() => {
    if (!room) return ['home', HomePage] as const;
    switch (room.status) {
      case 'lobby':       return ['lobby',  LobbyPage]      as const;
      case 'card_reveal': return ['reveal', CardRevealPage]  as const;
      case 'playing':     return ['game',   GamePage]        as const;
      case 'ended':       return ['result', ResultPage]      as const;
      default:            return ['home',   HomePage]        as const;
    }
  })();

  return (
    <div className="relative w-full min-h-dvh">

      {/* ── Connection status banner ── */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ y: -48 }}
            animate={{ y: 0 }}
            exit={{ y: -48 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-0 inset-x-0 z-[60] flex justify-center"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-b-2xl font-mono text-xs text-white tracking-wider"
              style={{
                background: 'rgba(255,45,85,0.92)',
                backdropFilter: 'blur(8px)',
              }}>
              <WifiOff size={14} />
              Bağlantı kəsildi — yenidən qoşulunur...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page renders ── */}
      <AnimatePresence mode="wait">
        <PageTransition id={pageId}>
          <PageComponent />
        </PageTransition>
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0, scale: 0.92 }}
            animate={{ y: 0,   opacity: 1, scale: 1 }}
            exit={{    y: -60, opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-[88vw]"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-2xl font-syne text-sm text-white shadow-2xl"
              style={{
                background: 'rgba(255,45,85,0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,45,85,0.4)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(255,45,85,0.2)',
              }}>
              <AlertCircle size={16} className="shrink-0" />
              <span>{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
