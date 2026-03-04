# Testing Dhappa Multiplayer Locally

This guide explains how to spin up the local development environment to test the multiplayer synchronization and game rules.

## Prerequisites

- **Node.js**: v18 or higher.
- **Docker**: Required to run the local Redis instance.

---

## Step 1: Start Redis
The game server uses Redis to persist room states. Run this command to start a local container:

```bash
sudo docker run -d --name dhappa-redis -p 6379:6379 redis
```

*Note: If you already have it running, you can clear the database to start fresh with:*
```bash
sudo docker exec -it dhappa-redis redis-cli FLUSHALL
```

---

## Step 2: Start the Backend Server
Navigate to the `server` directory and start the dev server. It will run on port **8081**.

```bash
cd server
npm install
npm run dev
```

---

## Step 3: Start the Frontend Client
In a new terminal window at the project root, start the Vite development server:

```bash
npm install
npm run dev
```

---

## Step 4: Test Multiplayer Sync
1. Open the Vite URL (default: `http://localhost:5173`) in your primary browser.
2. Open a **New Incognito/Private Window** to the same URL.
3. **Join a Room**: Enter the same Room ID in both windows.
4. **Play**: Perform actions (Draw, Create Run, Discard) in one window and verify that the game state updates instantly in the other window.

---

## Troubleshooting

### Port 8081 is in use
If the backend fails to start, kill any zombie processes:
```bash
lsof -t -i:8081 | xargs kill -9
```

### Cards are blank or invisible
Ensure you have done a **Hard Refresh** (`Ctrl + Shift + R`) in your browser to clear the Tailwind and React cache.

### Resetting Game State
To force all players to start a brand new game, flush Redis:
```bash
sudo docker exec -it dhappa-redis redis-cli FLUSHALL
```
