import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type { GameState, Player, Run, CardDef } from '../shared/types';
import { Team } from '../shared/types';
import { createDeck, generateId, sortHand } from '../shared/constants';
import { arrangeRun, validateAddToRun, inferRunContext, isValidNPick, applyRepresentations, canGoOut, canMergeSequences, mergeSequences } from '../shared/gameLogic';
import { createClient } from 'redis';
import { getScenario } from '../scenarios';
import { randomUUID } from 'crypto';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 8081;

// Health check routes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.status(200).send('Server is up');
});

// 1. Define a global flag or a wrapper for your data store
let isRedisConnected = false;

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  socket: {
    connectTimeout: 2000, // Reduced for faster E2E startup
    reconnectStrategy: (retries) => (retries > 2 ? new Error('Max retries') : 500),
  }
});

redisClient.on('error', (err) => {
  console.log('Redis Client Error:', err.message);
  isRedisConnected = false;
});

// 2. Start the HTTP server IMMEDIATELY
// This ensures Playwright sees the port open and doesn't hang.
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
  
  // 3. Attempt Redis connection in the background AFTER the server is up
  connectRedis();
});

async function connectRedis() {
  try {
    await redisClient.connect();
    isRedisConnected = true;
    console.log('✅ Connected to Redis');
  } catch (e) {
    console.log('⚠️ Redis failed. Using In-Memory fallback.');
    isRedisConnected = false;
  }
}

interface RoomContainer {
  state: GameState;
  auth: Record<number, { name: string; passcode: string; token: string }>;
}

const memoryStore: Record<string, RoomContainer> = {};
const roomAssignments: Record<string, Record<string, number>> = {};

async function saveRoom(roomId: string, container: RoomContainer) {
    if (isRedisConnected && redisClient.isOpen) {
        try {
            await Promise.race([
                redisClient.set(`room:${roomId}`, JSON.stringify(container)),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Redis Timeout')), 500))
            ]);
        } catch (e) {
            console.error("Redis Set failed, falling back to memory:", e);
            memoryStore[roomId] = container;
        }
    } else {
        memoryStore[roomId] = container;
    }
}

async function loadRoom(roomId: string): Promise<RoomContainer | null> {
    if (isRedisConnected && redisClient.isOpen) {
        try {
            const data = await Promise.race([
                redisClient.get(`room:${roomId}`),
                new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Redis Timeout')), 500))
            ]) as string | null;
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Redis Get failed, falling back to memory:", e);
        }
    }
    return memoryStore[roomId] || null;
}

function initGameState(playerCount: number = 4): GameState {
  const deck = createDeck();
  const cardsPerPlayer = playerCount === 4 ? 27 : 21;
  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    id: `player-${i}`,
    name: '', // Initialize with empty name
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
    runCreationAmbiguity: null,
    winner: null
  };
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', async (roomId: string, name: string, passcode: string, token?: string) => {
    socket.join(roomId);
    
    let container = await loadRoom(roomId);
    if (!container) {
      console.log(`Initializing new game for room: ${roomId}`);
      container = {
        state: initGameState(),
        auth: {}
      };
      // Save it immediately so others see the room as initialized
      await saveRoom(roomId, container);
    }

    if (!roomAssignments[roomId]) roomAssignments[roomId] = {};
    
    let pIdx: number = -1;
    let finalToken: string | undefined = token;

    // 1. Try Token Match (Same device refresh)
    if (token) {
        const foundIdx = Object.keys(container.auth).find(idx => container.auth[parseInt(idx)].token === token);
        if (foundIdx !== undefined) pIdx = parseInt(foundIdx);
    }

    // 2. Try Name + Passcode Match (Manual Rejoin)
    if (pIdx === -1) {
        const foundIdx = Object.keys(container.auth).find(idx => {
            const a = container.auth[parseInt(idx)];
            return a.name === name && a.passcode === passcode;
        });
        if (foundIdx !== undefined) {
            pIdx = parseInt(foundIdx);
            finalToken = container.auth[pIdx].token; // Re-use existing token
        }
    }

    // 3. New Join
    if (pIdx === -1) {
        // Find first empty seat
        const takenSeats = Object.keys(container.auth).map(i => parseInt(i));
        const nextSeat = [0, 1, 2, 3].find(i => !takenSeats.includes(i));
        
        if (nextSeat !== undefined) {
            // Ensure name is unique in this room for new seats
            const nameExists = Object.values(container.auth).some(a => a.name === name);
            if (nameExists) {
                socket.emit('error', 'Name already taken in this room. If this is you, enter your passcode.');
                return;
            }

            pIdx = nextSeat;
            finalToken = randomUUID();
            container.auth[pIdx] = { name, passcode, token: finalToken };
            container.state.players[pIdx].name = name; // Update name in state
            await saveRoom(roomId, container);
        } else {
            socket.emit('error', 'Room is full');
            return;
        }
    }

    roomAssignments[roomId][socket.id] = pIdx;
    
    console.log(`User ${socket.id} (${name}) joined room: ${roomId} as Player ${pIdx}`);
    
    // Explicitly send the assigned index and token to the user for persistence
    socket.emit('auth_success', { roomId, playerIndex: pIdx, token: finalToken });
    socket.emit('state_update', redactState(container.state, pIdx));
    socket.to(roomId).emit('player_joined', { id: socket.id, name: name });
  });

  socket.on('game_action', async (roomId: string, action: { type: string; payload: any }) => {
    let container = await loadRoom(roomId);
    if (!container) return;

    console.log(`Action ${action.type} received for room ${roomId}`);

    try {
      const newState = processGameAction(container.state, action);
      container.state = newState;
      await saveRoom(roomId, container);
      
      const sockets = await io.in(roomId).fetchSockets();
      for (const s of sockets) {
        const idx = roomAssignments[roomId]?.[s.id] ?? -1;
        s.emit('state_update', redactState(container.state, idx));
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

      const teamPlayers = state.players.filter(p => p.team === player.team);
      const isWinner = canGoOut(player, teamPlayers);

      const newHand = [...player.hand];
      const [discardedCard] = newHand.splice(cardIndex, 1);
      if (!discardedCard) throw new Error('Failed to discard');

      const isDhappa = discardedCard.value === '2';

      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...player,
        hand: newHand,
      };

      return {
        ...state,
        players: newPlayers,
        discardPile: isDhappa ? [] : [...state.discardPile, discardedCard],
        currentPlayerIndex: isWinner ? state.currentPlayerIndex : (state.currentPlayerIndex + 1) % state.players.length,
        phase: isWinner ? 'play' : 'draw',
        winner: isWinner ? player.team : null
      };
    }

    case 'CREATE_RUN': {
      if (state.phase !== 'play') throw new Error('Cannot play in this phase');
      const { cards } = payload;
      
      const arranged = arrangeRun(cards, false);
      const withRepresentations = applyRepresentations(arranged);
      const context = inferRunContext(withRepresentations);
      if (!context) throw new Error('Invalid run arrangement');
      
      const isPure = arranged.every((c: CardDef) => !c.isWild);

      if (!player.hasOpened && !isPure) throw new Error('First run must be pure');

      const newHand = player.hand.filter((c: CardDef) => !cards.find((rc: any) => rc.id === c.id));
      const newRun: Run = {
        id: generateId(),
        cards: withRepresentations,
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
      
      if (targetPlayer.team !== player.team) {
        throw new Error('Can only add cards to runs of your own team');
      }
      
      const targetRunIndex = targetPlayer.runs.findIndex((r: Run) => r.id === runId);
      const targetRun = targetPlayer.runs[targetRunIndex];
      if (!targetRun) throw new Error('Target run not found');

      const validation = validateAddToRun(cards, targetRun);
      if (validation.type === 'INVALID') throw new Error('Invalid move to run');

      const newPlayers = [...state.players];
      let newHand = player.hand.filter((c: CardDef) => !cards.find((rc: any) => rc.id === c.id));
      let updatedRunCards = [...targetRun.cards];

      if (validation.type === 'REPLACE_FLYING') {
          const cardToReturn = validation.cardToReturn;
          newHand = sortHand([...newHand, cardToReturn]);
          // Remove the wildcard and replace with the natural card
          const wildIdx = updatedRunCards.findIndex(c => c.id === cardToReturn.id);
          updatedRunCards[wildIdx] = cards[0]; // cards[0] is the natural card
      } else if (validation.type === 'REPLACE_STATIC') {
          // Shifting logic (Static wild stays on table)
          const preferHead = payload.options?.preferHead || false;
          // IMPORTANT: Clear the 'represents' property of the displaced wildcard 
          // before re-arranging, so it can find its new position.
          const cardsWithDisplacedWildCleared = [...targetRun.cards, ...cards].map(c => {
              if (c.id === validation.displacedCard.id) {
                  const { represents, ...rest } = c;
                  return rest;
              }
              return c;
          });
          updatedRunCards = arrangeRun(cardsWithDisplacedWildCleared, preferHead);
      } else {
          // EXTEND
          const preferHead = payload.options?.preferHead || false;
          updatedRunCards = arrangeRun([...targetRun.cards, ...cards], preferHead);
      }

      const withRepresentations = applyRepresentations(updatedRunCards);
      const context = inferRunContext(withRepresentations);
      if (!context) throw new Error('Final run is invalid');
      const isPure = withRepresentations.every((c: CardDef) => !c.isWild);

      const updatedRun: Run = {
        ...targetRun,
        cards: withRepresentations,
        isPure,
        isSet: context.type === 'SET'
      };

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

    case 'MERGE_RUNS': {
      if (state.phase !== 'play') throw new Error('Cannot merge runs in this phase');
      const { runIdA, runIdB } = payload;

      const runA = player.runs.find(r => r.id === runIdA);
      const runB = player.runs.find(r => r.id === runIdB);

      if (!runA || !runB) throw new Error('Both runs must belong to the current player to merge');
      if (!canMergeSequences(runA, runB)) throw new Error('These runs cannot be merged');

      const mergedCards = mergeSequences(runA, runB);
      const context = inferRunContext(mergedCards);
      if (!context) throw new Error('Merged run is invalid');

      const newRun: Run = {
        id: runIdA, // Keep the first ID as anchor
        cards: mergedCards,
        isPure: mergedCards.every(c => !c.isWild),
        isSet: context.type === 'SET'
      };

      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...player,
        runs: player.runs.filter(r => r.id !== runIdA && r.id !== runIdB).concat(newRun)
      };

      return {
        ...state,
        players: newPlayers
      };
    }
    
    default:
      return state;
  }
}
