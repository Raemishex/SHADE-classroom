const fs = require('fs');
const path = require('path');

// Load words
const wordsPath = path.join(__dirname, 'words.json');
let wordsData = { metadata: {}, categories: [], words: {} };
try {
  const fileContent = fs.readFileSync(wordsPath, 'utf8');
  wordsData = JSON.parse(fileContent);
} catch (error) {
  console.error("Could not load words.json. Make sure it exists in the server directory.");
}

const rooms = {};

// Generate random 4 digit code
function generateRoomCode() {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms[code]);
  return code;
}

function sanitizeRoom(room) {
  const sanitized = { ...room };
  sanitized.players = room.players.map(p => ({
    id: p.id,
    name: p.name,
    isHost: p.isHost,
    isReady: p.isReady,
    hasSeenCard: p.hasSeenCard,
    isConnected: p.isConnected
    // role is omitted here
  }));
  return sanitized;
}

function findRoomByPlayerId(socketId) {
  for (const code in rooms) {
    if (rooms[code].players.some(p => p.id === socketId)) {
      return rooms[code];
    }
  }
  return null;
}

function calculateImposterCount(playerCount, manualCount) {
  if (manualCount === "auto" || manualCount === 0 || manualCount === "0") {
    if (playerCount <= 5) return 1;
    return 2;
  }
  const max = Math.floor(playerCount / 2) - 1;
  return Math.min(Number(manualCount), max > 0 ? max : 1);
}

function assignRoles(room, io) {
  const players = room.players;
  const count = calculateImposterCount(players.length, room.settings.imposterCount);
  
  // Shuffle player array
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  
  // First `count` players become imposters, rest are citizens
  shuffled.forEach((player, index) => {
    player.role = index < count ? "imposter" : "citizen";
  });
  
  // Select random category
  const allCategoryIds = wordsData.categories.map(c => c.id);
  const selectedCats = room.settings.selectedCategories.length > 0
    ? room.settings.selectedCategories
    : allCategoryIds;
  
  const randomCat = selectedCats[Math.floor(Math.random() * selectedCats.length)];
  const wordsInCat = wordsData.words[randomCat];
  
  if (!wordsInCat || wordsInCat.length === 0) {
      console.error("No words found for category:", randomCat);
      return false; // Error finding words
  }

  const randomWordObj = wordsInCat[Math.floor(Math.random() * wordsInCat.length)];
  
  room.currentWord = randomWordObj.az;
  room.currentCategory = wordsData.categories.find(c => c.id === randomCat);
  room.status = "card_reveal";
  
  // Select first speaker randomly
  room.firstSpeaker = players[Math.floor(Math.random() * players.length)].id;
  
  // Reset card-seen status
  players.forEach(p => p.hasSeenCard = false);

  players.forEach(player => {
    const isImposter = player.role === "imposter";
    const allies = isImposter && room.settings.allianceMode
      ? players.filter(p => p.role === "imposter" && p.id !== player.id).map(p => p.name)
      : [];
    
    io.to(player.id).emit("game_started", {
      role: player.role,
      word: isImposter ? null : room.currentWord,
      categoryName: room.currentCategory.nameAz,
      categoryIcon: room.currentCategory.icon,
      allies: allies,
    });
  });

  return true;
}

module.exports = function setupRoomHandlers(io, socket) {
  
  socket.on("create_room", ({ playerName }) => {
    if (!playerName || playerName.trim() === '') {
      socket.emit("error", { message: "Ad boş ola bilməz" });
      return;
    }

    const roomCode = generateRoomCode();
    
    rooms[roomCode] = {
      code: roomCode,
      hostId: socket.id,
      status: "lobby",
      settings: {
        selectedCategories: [],
        imposterCount: "auto",
        allianceMode: false,
        imposterHintMode: true,
      },
      players: [
        {
          id: socket.id,
          name: playerName.trim(),
          isHost: true,
          role: null,
          isReady: true, // host is ready by default
          hasSeenCard: false,
          isConnected: true,
          disconnectedAt: null,
        }
      ],
      currentWord: null,
      currentCategory: null,
      firstSpeaker: null,
      createdAt: Date.now(),
    };

    socket.join(roomCode);
    socket.emit("room_created", { room: sanitizeRoom(rooms[roomCode]) });
  });

  socket.on("join_room", ({ roomCode, playerName }) => {
    if (!playerName || playerName.trim() === '') {
      socket.emit("error", { message: "Ad boş ola bilməz" });
      return;
    }

    const room = rooms[roomCode];
    if (!room) {
      socket.emit("error", { message: "Otaq tapılmadı" });
      return;
    }

    if (room.players.length >= 16) {
      socket.emit("error", { message: "Otaq tam doludur (Maks. 16 nəfər)" });
      return;
    }

    // Check reconnection
    const existingPlayer = room.players.find(p => p.name === playerName.trim() && !p.isConnected);
    if (existingPlayer) {
      existingPlayer.id = socket.id;
      existingPlayer.isConnected = true;
      existingPlayer.disconnectedAt = null;
      socket.join(roomCode);
      socket.emit("room_joined", { room: sanitizeRoom(room) });
      io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });
      
      // Resend game state if game started
      if (room.status !== 'lobby') {
        const isImposter = existingPlayer.role === "imposter";
        const allies = isImposter && room.settings.allianceMode
          ? room.players.filter(p => p.role === "imposter" && p.id !== existingPlayer.id).map(p => p.name)
          : [];
        
        socket.emit("game_started", {
          role: existingPlayer.role,
          word: isImposter ? null : room.currentWord,
          categoryName: room.currentCategory.nameAz,
          categoryIcon: room.currentCategory.icon,
          allies: allies,
        });
        
        if (room.status === "playing") {
          socket.emit("game_phase_changed", { status: room.status, firstSpeaker: room.firstSpeaker });
        }
      }
      return;
    }

    if (room.players.some(p => p.name === playerName.trim() && p.isConnected)) {
      socket.emit("error", { message: "Bu ad artıq istifadə olunur" });
      return;
    }

    if (room.status !== "lobby") {
       socket.emit("error", { message: "Oyun artıq başlayıb" });
       return;
    }

    const newPlayer = {
      id: socket.id,
      name: playerName.trim(),
      isHost: false,
      role: null,
      isReady: false,
      hasSeenCard: false,
      isConnected: true,
      disconnectedAt: null,
    };

    room.players.push(newPlayer);
    socket.join(roomCode);
    
    socket.emit("room_joined", { room: sanitizeRoom(room) });
    io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });
  });

  socket.on("player_ready", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });
    }
  });

  socket.on("update_settings", ({ roomCode, settings }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;
    
    room.settings = { ...room.settings, ...settings };
    io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });
  });

  socket.on("start_game", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit("error", { message: "Otaq tapılmadı" });
      return;
    }

    if (room.hostId !== socket.id) {
       socket.emit("error", { message: "Yalnız host oyunu başlada bilər" });
       return;
    }

    const readyPlayers = room.players.filter(p => p.isReady && p.isConnected);
    if (readyPlayers.length < 3) {
      socket.emit("error", { message: "Oyuna başlamaq üçün ən azı 3 hazır oyunçu lazımdır" });
      return;
    }

    // if some players are not ready, maybe we kick them or just proceed?
    // We'll proceed with all connected players for now, but usually they should all be ready.
    // The prompt says: "Game start requires minimum 3 ready players"
    
    const success = assignRoles(room, io);
    if (success) {
       io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });
       io.to(roomCode).emit("game_phase_changed", { status: "card_reveal" });
    } else {
       socket.emit("error", { message: "Söz seçilərkən xəta baş verdi. Zəhmət olmasa, fərqli kateqoriya seçin." });
    }
  });

  socket.on("player_seen_card", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.status !== "card_reveal") return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.hasSeenCard = true;
      io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });

      // Check if everyone has seen their card
      const allSeen = room.players.filter(p => p.isConnected).every(p => p.hasSeenCard);
      if (allSeen) {
        room.status = "playing";
        io.to(roomCode).emit("game_phase_changed", { status: "playing", firstSpeaker: room.firstSpeaker });
        io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });
      }
    }
  });

  socket.on("end_game", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    room.status = "ended";
    const imposters = room.players.filter(p => p.role === "imposter").map(p => p.name);
    
    io.to(roomCode).emit("game_phase_changed", { status: "ended" });
    io.to(roomCode).emit("game_ended", {
      word: room.currentWord,
      category: room.currentCategory.nameAz,
      imposters: imposters,
      reason: "Host oyunu bitirdi"
    });
    io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });
  });

  socket.on("rematch", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    room.status = "lobby";
    room.currentWord = null;
    room.currentCategory = null;
    room.firstSpeaker = null;
    
    room.players.forEach(p => {
      p.role = null;
      p.isReady = p.isHost; // host is always ready initially
      p.hasSeenCard = false;
    });

    io.to(roomCode).emit("game_phase_changed", { status: "lobby" });
    io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });
  });

  socket.on("leave_room", ({ roomCode }) => {
    handleDisconnectOrLeave(socket, roomCode);
  });

  socket.on("disconnect", () => {
    const room = findRoomByPlayerId(socket.id);
    if (room) {
      handleDisconnectOrLeave(socket, room.code, true);
    }
  });

  function handleDisconnectOrLeave(socket, roomCode, isDisconnect = false) {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (isDisconnect) {
      player.isConnected = false;
      player.disconnectedAt = Date.now();
      
      transferHostIfNeeded(room, player.id, socket, io);
      io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });

      setTimeout(() => {
        const currentRoom = rooms[roomCode];
        if (!currentRoom) return;
        const currentPlayer = currentRoom.players.find(p => p.id === socket.id);
        if (currentPlayer && !currentPlayer.isConnected) {
          currentRoom.players = currentRoom.players.filter(p => p.id !== socket.id);
          io.to(roomCode).emit("room_updated", { room: sanitizeRoom(currentRoom) });
          if (currentRoom.players.length === 0) delete rooms[roomCode];
        }
      }, 60000);

    } else {
      // Voluntary leave
      room.players = room.players.filter(p => p.id !== socket.id);
      socket.leave(roomCode);
      transferHostIfNeeded(room, socket.id, socket, io);
      
      if (room.players.length === 0) {
        delete rooms[roomCode];
      } else {
        io.to(roomCode).emit("room_updated", { room: sanitizeRoom(room) });
      }
    }
  }

  function transferHostIfNeeded(room, oldHostId, socket, io) {
    const oldHost = room.players.find(p => p.id === oldHostId) || { isHost: true }; // hack for leave
    if (room.hostId === oldHostId || oldHost.isHost) {
      const newHost = room.players.find(p => p.isConnected && p.id !== oldHostId);
      if (newHost) {
        if(oldHost) oldHost.isHost = false;
        newHost.isHost = true;
        room.hostId = newHost.id;
        io.to(room.code).emit("host_changed", { newHostId: newHost.id, newHostName: newHost.name });
      }
    }
  }

};
