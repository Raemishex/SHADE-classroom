import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  hasSeenCard: boolean;
  isConnected: boolean;
}

export interface RoomSettings {
  selectedCategories: string[];
  imposterCount: number | 'auto';
  allianceMode: boolean;
  imposterHintMode: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  status: 'lobby' | 'card_reveal' | 'playing' | 'ended';
  settings: RoomSettings;
  players: Player[];
  currentWord?: string | null;
  currentCategory?: { id: string; nameAz: string; icon: string } | null;
  firstSpeaker?: string | null;
}

interface GameState {
  // My personal info
  myId: string | null;
  myName: string;
  myRole: 'citizen' | 'imposter' | null;
  myWord: string | null;
  myCategoryName: string | null;
  myCategoryIcon: string | null;
  myAllies: string[];
  
  // Room info
  room: Room | null;
  
  // UI state
  isPeekOpen: boolean;
  isCardRevealed: boolean;
  
  // Actions
  setMyInfo: (info: Partial<GameState>) => void;
  setRoom: (room: Room) => void;
  togglePeek: () => void;
  setIsCardRevealed: (isRevealed: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  myId: null,
  myName: '',
  myRole: null,
  myWord: null,
  myCategoryName: null,
  myCategoryIcon: null,
  myAllies: [],
  room: null,
  isPeekOpen: false,
  isCardRevealed: false,
  
  setMyInfo: (info) => set((state) => ({ ...state, ...info })),
  setRoom: (room) => set({ room }),
  togglePeek: () => set((state) => ({ isPeekOpen: !state.isPeekOpen })),
  setIsCardRevealed: (isCardRevealed) => set({ isCardRevealed }),
  
  reset: () => set({
    myRole: null,
    myWord: null,
    myCategoryName: null,
    myCategoryIcon: null,
    myAllies: [],
    room: null,
    isPeekOpen: false,
    isCardRevealed: false
  }),
}));
