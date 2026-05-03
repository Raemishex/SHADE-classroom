import { useEffect, useState } from 'react';
import { socket } from './socket';
import { useGameStore } from './store/gameStore';

import HomePage from './pages/HomePage.tsx';
import LobbyPage from './pages/LobbyPage.tsx';
import CardRevealPage from './pages/CardRevealPage.tsx';
import GamePage from './pages/GamePage.tsx';
import ResultPage from './pages/ResultPage.tsx';

function App() {
  const { room, setRoom, setMyInfo } = useGameStore();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    socket.on('connect', () => {
      setMyInfo({ myId: socket.id });
    });

    socket.on('room_created', ({ room }) => {
      setRoom(room);
    });

    socket.on('room_joined', ({ room }) => {
      setRoom(room);
    });

    socket.on('room_updated', ({ room }) => {
      setRoom(room);
    });

    socket.on('game_started', (data) => {
      setMyInfo({
        myRole: data.role,
        myWord: data.word,
        myCategoryName: data.categoryName,
        myCategoryIcon: data.categoryIcon,
        myAllies: data.allies,
      });
    });

    socket.on('game_phase_changed', ({ status, firstSpeaker }) => {
      setRoom({ ...useGameStore.getState().room!, status, firstSpeaker: firstSpeaker || null });
    });

    socket.on('game_ended', (data) => {
      setMyInfo({
        myWord: data.word,
        myCategoryName: data.category,
        myAllies: data.imposters // reusing allies to pass imposters list in result screen
      });
      // status will be updated via room_updated
    });

    socket.on('host_changed', ({ newHostId, newHostName }) => {
      showToast(`${newHostName} yeni host oldu`);
      const currentRoom = useGameStore.getState().room;
      if (currentRoom) {
         setRoom({ ...currentRoom, hostId: newHostId });
      }
    });

    socket.on('error', ({ message }) => {
      showToast(message);
    });

    return () => {
      socket.off('connect');
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('room_updated');
      socket.off('game_started');
      socket.off('game_phase_changed');
      socket.off('game_ended');
      socket.off('host_changed');
      socket.off('error');
    };
  }, [setRoom, setMyInfo]);

  // Render logic based on room status
  const renderPage = () => {
    if (!room) {
      return <HomePage />;
    }
    
    switch (room.status) {
      case 'lobby':
        return <LobbyPage />;
      case 'card_reveal':
        return <CardRevealPage />;
      case 'playing':
        return <GamePage />;
      case 'ended':
        return <ResultPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen">
      {renderPage()}
      
      {/* Simple Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity font-inter text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
