import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type { GameState, Player, Run, CardDef } from '../shared/types';
import { Team } from '../shared/types';
import { createDeck, generateId, sortHand } from '../shared/constants';
import { arrangeRun, validateAddToRun, inferRunContext, isValidNPick } from '../shared/gameLogic';
import { createClient } from 'redis';
import { getScenario } from '../scenarios';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const roomAssignments: Record<string, Record<string, number>> = {};

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

const app = express();
app.use(cors());

// Redis repository functions
async function saveRoomState(roomId: string, state: GameState) {
  await redisClient.set(`room:${roomId}`, JSON.stringify(state), {
    EX: 86400 // 24 hours TTL
  });
}

async function loadRoomState(roomId: string): Promise<GameState | null> {
  const data = await redisClient.get(`room:${roomId}`);
  return data ? JSON.parse(data.toString()) : null;
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 8081;

function initGameState(playerCount: number = 4): GameState {
  const deck = createDeck();
  const cardsPerPlayer = playerCount === 4 ? 27 : 21;
  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    id: `player-${i}`,
    name: `Player ${i + 1}`,
    team: i % 2 === 0 ? Team.A : Team.B,
    hand: sortHand(deck.splice(0, cardsPerPlayer)),
    runs: [],
    hasOpened: false,
    isAI: false
  }));

  const initialDiscard = deck.pop()!;

  return {
    players,
    currentPlayerIndex: 0,
    drawPile: deck,
    discardPile: [initialDiscard],
    phase: 'draw',
    mustPlayCard: null,
    selectedInHand: [],
    nPickPreview: null,
    lastDrawnCard: null,
    isNPickActive: false,
    isConfirmingDraw: false,
    isSelectingRun: false,
    runCreationAmbiguity: null
  };
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', async (roomId: string, playerName: string) => {
    socket.join(roomId);
    
    let roomState = await loadRoomState(roomId);
    if (!roomState) {
      console.log(`Initializing new game for room: ${roomId}`);
      roomState = initGameState();
      await saveRoomState(roomId, roomState);
    }

    if (!roomAssignments[roomId]) roomAssignments[roomId] = {};
    let pIdx = roomAssignments[roomId][socket.id];
    if (pIdx === undefined) {
        const taken = Object.values(roomAssignments[roomId]);
        pIdx = [0, 1, 2, 3].find(i => !taken.includes(i)) ?? -1;
        roomAssignments[roomId][socket.id] = pIdx;
    }

    console.log(`User ${socket.id} (${playerName}) joined room: ${roomId} as Player ${pIdx}`);
    
    socket.emit('state_update', redactState(roomState, pIdx));
    socket.to(roomId).emit('player_joined', { id: socket.id, name: playerName });
  });

  socket.on('game_action', async (roomId: string, action: { type: string; payload: any }) => {
    let roomState = await loadRoomState(roomId);
    if (!roomState) return;

    console.log(`Action ${action.type} received for room ${roomId}`);

    try {
      const newState = processGameAction(roomState, action);
      await saveRoomState(roomId, newState);
      
      const sockets = await io.in(roomId).fetchSockets();
      for (const s of sockets) {
        const idx = roomAssignments[roomId]?.[s.id] ?? -1;
        s.emit('state_update', redactState(newState, idx));
      }
    } catch (error: any) {
      console.error(`Action validation failed: ${error.message}`);
      socket.emit('error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

function redactState(state: GameState, playerIndex: number): any {
  if (playerIndex < 0 || playerIndex >= state.players.length) {
    return state; // Spectator sees full unredacted state
  }

  // Rotate players array so that playerIndex is always at 0 (the local player)
  const rotatedPlayers = [
    ...state.players.slice(playerIndex),
    ...state.players.slice(0, playerIndex)
  ];

  const finalPlayers = rotatedPlayers.map((p, i) => ({
    ...p,
    hand: i === 0 ? p.hand : (p.hand.length as any), // Only show own hand (index 0)
  }));

  const newCurrentPlayerIndex = (state.currentPlayerIndex - playerIndex + state.players.length) % state.players.length;

  return {
    ...state,
    drawPile: state.drawPile.length as any,
    players: finalPlayers,
    currentPlayerIndex: newCurrentPlayerIndex,
    lastDrawnCard: newCurrentPlayerIndex === 0 ? state.lastDrawnCard : null,
    mustPlayCard: newCurrentPlayerIndex === 0 ? state.mustPlayCard : null
  };
}

function processGameAction(state: GameState, action: { type: string; payload: any }): GameState {
  const { type, payload } = action;

  // Reset lastDrawnCard for every action. DRAW_FROM_DECK will set it back if needed.
  state.lastDrawnCard = null;

  if (type === 'LOAD_SCENARIO') {
    const scenario = getScenario(payload.key);
    if (scenario) return scenario;
    return state;
  }

  const player = state.players[state.currentPlayerIndex];
  if (!player) throw new Error('Current player not found');

  switch (type) {
    case 'PICK_FROM_DISCARD': {
      if (state.phase !== 'draw') throw new Error('Cannot draw in this phase');
      const { n } = payload;
      if (n < 1 || n > state.discardPile.length) throw new Error('Invalid pick count');
      
      const isFirstTurn = state.discardPile.length === 1 && state.players.every(p => p.runs.length === 0);
      
      if (!isValidNPick(n, state.discardPile, state.players, state.currentPlayerIndex, isFirstTurn)) {
        throw new Error('Invalid pick. Bottom card cannot be used in a run.');
      }

      const newDiscardPile = [...state.discardPile];
      const pickedCards = newDiscardPile.splice(-n, n);
      const bottomCard = pickedCards[0];
      if (!bottomCard) throw new Error('Failed to pick cards');
      
      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...player,
        hand: sortHand([...player.hand, ...pickedCards]),
      };

      // Rules: No mustPlayCard if it's a wildcard OR the very first turn of the game
      const shouldSetMustPlay = !bottomCard.isWild && !isFirstTurn;

      return {
        ...state,
        discardPile: newDiscardPile,
        players: newPlayers,
        phase: 'play',
        mustPlayCard: shouldSetMustPlay ? bottomCard.id : null
      };
    }

    case 'DRAW_FROM_DECK': {
      if (state.phase !== 'draw') throw new Error('Cannot draw in this phase');
      const newDeck = [...state.drawPile];
      const card = newDeck.pop();
      if (!card) throw new Error('Deck is empty');

      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...player,
        hand: sortHand([...player.hand, card]),
      };

      return {
        ...state,
        drawPile: newDeck,
        players: newPlayers,
        phase: 'play',
        lastDrawnCard: card
      };
    }

    case 'DISCARD_CARD': {
      if (state.phase !== 'play') throw new Error('Cannot discard in this phase');
      if (state.mustPlayCard) throw new Error('You must play the picked card first');
      const cardId = payload.cardId;
      const cardIndex = player.hand.findIndex((c: CardDef) => c.id === cardId);
      if (cardIndex === -1) throw new Error('Card not in hand');

      const newHand = [...player.hand];
      const [discardedCard] = newHand.splice(cardIndex, 1);
      if (!discardedCard) throw new Error('Failed to discard');

      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...player,
        hand: newHand,
      };

      return {
        ...state,
        players: newPlayers,
        discardPile: [...state.discardPile, discardedCard],
        currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
        phase: 'draw',
      };
    }

    case 'CREATE_RUN': {
      if (state.phase !== 'play') throw new Error('Cannot play in this phase');
      const { cards } = payload;
      
      const arranged = arrangeRun(cards, false);
      const context = inferRunContext(arranged);
      if (!context) throw new Error('Invalid run arrangement');
      
      const isPure = arranged.every((c: CardDef) => !c.isWild);

      if (!player.hasOpened && !isPure) throw new Error('First run must be pure');

      const newHand = player.hand.filter((c: CardDef) => !cards.find((rc: any) => rc.id === c.id));
      const newRun: Run = {
        id: generateId(),
        cards: arranged,
        isPure,
        isSet: context.type === 'SET'
      };

      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...player,
        hand: sortHand(newHand),
        runs: [...player.runs, newRun],
        hasOpened: true,
      };

      let nextMustPlayCard = state.mustPlayCard;
      if (nextMustPlayCard && !newHand.some((c: CardDef) => c.id === nextMustPlayCard)) {
        nextMustPlayCard = null;
      }

      return {
        ...state,
        players: newPlayers,
        mustPlayCard: nextMustPlayCard
      };
    }

    case 'ADD_TO_RUN': {
      if (state.phase !== 'play') throw new Error('Cannot play in this phase');
      if (!player.hasOpened) throw new Error('Must open before adding to runs');

      const { runId, cards } = payload;
      const targetPlayerIndex = state.players.findIndex((p: Player) => p.runs.find((r: Run) => r.id === runId));
      if (targetPlayerIndex === -1) throw new Error('Run not found');
      
      const targetPlayer = state.players[targetPlayerIndex];
      if (!targetPlayer) throw new Error('Target player not found');
      
      const targetRunIndex = targetPlayer.runs.findIndex((r: Run) => r.id === runId);
      const targetRun = targetPlayer.runs[targetRunIndex];
      if (!targetRun) throw new Error('Target run not found');

      const validation = validateAddToRun(cards, targetRun);
      if (validation.type === 'INVALID') throw new Error('Invalid move to run');

      const preferHead = payload.options?.preferHead || false;
      const arranged = arrangeRun([...targetRun.cards, ...cards], preferHead);
      const context = inferRunContext(arranged);
      if (!context) throw new Error('Final run is invalid');
      const isPure = arranged.every((c: CardDef) => !c.isWild);

      const newHand = player.hand.filter((c: CardDef) => !cards.find((rc: any) => rc.id === c.id));
      const updatedRun: Run = {
        ...targetRun,
        cards: arranged,
        isPure,
        isSet: context.type === 'SET'
      };

      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...newPlayers[state.currentPlayerIndex]!,
        hand: sortHand(newHand),
      };
      
      const targetP = newPlayers[targetPlayerIndex];
      if (!targetP) throw new Error('Target player not found during update');
      const newRuns = [...targetP.runs];
      newRuns[targetRunIndex] = updatedRun;
      newPlayers[targetPlayerIndex] = {
        ...targetP,
        runs: newRuns,
      };

      let nextMustPlayCard = state.mustPlayCard;
      if (nextMustPlayCard && !newHand.some((c: CardDef) => c.id === nextMustPlayCard)) {
        nextMustPlayCard = null;
      }

      return {
        ...state,
        players: newPlayers,
        mustPlayCard: nextMustPlayCard
      };
    }
    
    default:
      return state;
  }
}

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});