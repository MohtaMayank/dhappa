import { io, Socket } from 'socket.io-client';

const serverUrl = process.env.SERVER_URL || 'http://localhost:8081';

export async function injectScenario(roomId: string, scenarioKey: string): Promise<void> {
  const socket: Socket = io(serverUrl);

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      socket.emit('game_action', roomId, {
        type: 'LOAD_SCENARIO',
        payload: { key: scenarioKey }
      });
      // Wait a bit for the server to process it
      setTimeout(() => {
        socket.disconnect();
        resolve();
      }, 500);
    });

    socket.on('connect_error', (err) => {
      reject(new Error(`Failed to connect to game server for scenario injection: ${err.message}`));
    });

    socket.on('error', (msg) => {
      reject(new Error(`Server error during scenario injection: ${msg}`));
    });

    // Timeout if it takes too long
    setTimeout(() => {
      socket.disconnect();
      reject(new Error('Scenario injection timed out after 5s'));
    }, 5000);
  });
}
