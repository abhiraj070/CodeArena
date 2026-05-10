# ⚔️ CodeArena

> A real-time competitive coding platform where developers battle head-to-head on algorithm challenges — with live code execution, Redis-powered matchmaking, ranked leaderboards, and match replay.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Redis Architecture](#redis-architecture)
- [Socket.io Event System](#socketio-event-system)
- [Matchmaking System](#matchmaking-system)
- [Match Lifecycle](#match-lifecycle)
- [Leaderboard System](#leaderboard-system)
- [Match Replay System](#match-replay-system)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Overview

CodeArena is a full-stack competitive coding platform built for developers who want to test their problem-solving skills in real-time 1v1 matches. Players are matched by skill rating, compete on the same problem simultaneously, and are ranked globally via an Elo-style rating system.

The platform is engineered around three core pillars:

- **Real-time** — Socket.io drives every live interaction: match start, code submission, opponent progress, and result delivery.
- **Speed** — Redis handles all hot-path data: matchmaking queues, active match state, presence, and leaderboards.
- **Persistence** — MongoDB stores users, problems, match history, and snapshots that power the replay system.

---

## Features

- 🔐 JWT-based authentication
- 🎮 Real-time 1v1 matchmaking by rating bracket
- 💻 In-browser code editor with language selection
- ⚡ Live opponent status (submitted / still coding)
- 🏆 Global leaderboard with Elo-style rating
- 📼 Match replay — step through both players' submission history
- 📊 Personal stats: win rate, avg solve time, rating history
- 🟢 Online presence tracking via Redis TTL

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Cache / Pub-Sub | Redis (ioredis) |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Code Execution | Judge0 (self-hosted or cloud) |
| Frontend | React + Monaco Editor |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│              React + Monaco Editor + Socket.io          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP + WebSocket
┌────────────────────────▼────────────────────────────────┐
│                    Express Server                        │
│         REST API  │  Socket.io Server                   │
└──────┬────────────┴──────────┬──────────────────────────┘
       │                       │
┌──────▼──────┐        ┌───────▼──────────────┐
│   MongoDB   │        │        Redis          │
│             │        │                       │
│  - Users    │        │  - Matchmaking Queue  │
│  - Problems │        │  - Active Match State │
│  - Matches  │        │  - Leaderboard (ZSet) │
│  - Replays  │        │  - Presence (TTL Key) │
└─────────────┘        └───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Judge0 / Executor  │
                    │  (Code Execution)    │
                    └─────────────────────┘
```

The server runs a single Express + Socket.io process. Redis serves as the coordination layer — matchmaking decisions, match state, and leaderboard reads never touch MongoDB in the hot path. MongoDB is written to only when a match concludes (result persistence + replay snapshot).

---

## Database Design

### User

```js
{
  _id: ObjectId,
  username: String,          // unique
  email: String,             // unique
  passwordHash: String,
  rating: Number,            // Elo rating, default 1000
  stats: {
    matchesPlayed: Number,
    wins: Number,
    losses: Number,
    avgSolveTimeMs: Number,
  },
  ratingHistory: [
    { rating: Number, changedAt: Date }
  ],
  createdAt: Date
}
```

### Problem

```js
{
  _id: ObjectId,
  title: String,
  slug: String,              // unique, URL-friendly
  difficulty: 'easy' | 'medium' | 'hard',
  description: String,       // Markdown
  constraints: String,
  examples: [
    { input: String, output: String, explanation: String }
  ],
  testCases: [
    { input: String, expectedOutput: String, isHidden: Boolean }
  ],
  tags: [String],
  usedInMatches: Number      // tracked for problem rotation fairness
}
```

### Match

```js
{
  _id: ObjectId,
  players: [
    {
      userId: ObjectId,
      username: String,
      ratingBefore: Number,
      ratingAfter: Number,
      result: 'win' | 'loss' | 'draw',
      solveTimeMs: Number,
      finalCode: String,
      language: String,
    }
  ],
  problemId: ObjectId,
  status: 'active' | 'completed' | 'abandoned',
  startedAt: Date,
  endedAt: Date,
  winnerId: ObjectId | null,
}
```

### Replay (Snapshot)

```js
{
  _id: ObjectId,
  matchId: ObjectId,
  events: [
    {
      type: 'submission' | 'test_result' | 'forfeit',
      userId: ObjectId,
      timestamp: Date,
      payload: Mixed    // code snapshot, test results, etc.
    }
  ]
}
```

---

## Redis Architecture

Redis is the engine behind everything time-sensitive. Here's how each data structure is used:

### Matchmaking Queue — `List`

```
Key: queue:<bracket>
     e.g. queue:1000, queue:1200, queue:1400

Type: List (LPUSH to enqueue, BRPOP to dequeue)

Value: JSON string { userId, socketId, rating, joinedAt }
```

Players are bucketed into 200-point rating brackets. The matchmaking worker uses `BRPOP` with a timeout to efficiently block-wait for a pair.

### Active Match State — `Hash`

```
Key: match:<matchId>

Type: Hash

Fields:
  player1Id, player2Id
  player1Status  → 'coding' | 'submitted' | 'passed'
  player2Status  → 'coding' | 'submitted' | 'passed'
  problemId
  startedAt      → Unix timestamp
  
TTL: 3600s (auto-expire abandoned matches)
```

### Leaderboard — `Sorted Set`

```
Key: leaderboard:global

Type: Sorted Set

Score: Elo rating (float)
Member: userId

Commands used:
  ZADD leaderboard:global <rating> <userId>   → update after match
  ZREVRANK leaderboard:global <userId>         → get rank (0-indexed)
  ZREVRANGE leaderboard:global 0 49 WITHSCORES → top 50
```

### Presence — `String with TTL`

```
Key: presence:<userId>

Value: socketId

TTL: 30s (refreshed by client heartbeat every 15s)
```

A user is "online" if this key exists. No complex cleanup logic needed — TTL handles it automatically.

### Problem Cooldown — `Set`

```
Key: used-problems:<userId>

Type: Set

Value: problemIds seen in last N matches
TTL: 86400s (24 hours)
```

Prevents a player from getting the same problem twice in a session.

---

## Socket.io Event System

### Connection & Rooms

Each match gets its own Socket.io room: `match:<matchId>`. Both players join this room upon match start. All in-match events are scoped to this room using `io.to(matchId).emit(...)`.

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `queue:join` | `{ token }` | Join matchmaking queue |
| `queue:leave` | — | Leave queue before match found |
| `match:submit` | `{ code, language }` | Submit solution |
| `match:forfeit` | — | Forfeit the current match |
| `presence:heartbeat` | — | Refresh online TTL |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `queue:matched` | `{ matchId, opponentUsername, problem }` | Match found |
| `match:start` | `{ startedAt, durationMs }` | Match officially begins |
| `match:opponent_submitted` | `{ at }` | Opponent has submitted |
| `match:result` | `{ winnerId, ratingDelta, solveTimeMs }` | Match concluded |
| `match:opponent_forfeited` | — | Opponent quit |
| `error` | `{ message }` | Server-side error |

---

## Matchmaking System

### Flow

```
Player joins queue
       │
       ▼
Redis LPUSH → queue:<bracket>
       │
       ▼
Matchmaking Worker (setInterval, 500ms)
       │
  BRPOP two players from same bracket
       │
  No pair? → try adjacent brackets (±200 rating)
       │
  Pair found → generate matchId
       │
  HMSET match:<matchId> { player1, player2, problem, startedAt }
  SET TTL 3600
       │
  Emit queue:matched to both sockets
  io.to(player1.socketId).emit(...)
  io.to(player2.socketId).emit(...)
       │
  Both sockets join room: match:<matchId>
       │
  Emit match:start
```

### Rating Bracket Expansion

If a player waits more than 30 seconds, the matchmaker expands their eligible bracket by ±200 rating. This prevents long queue times at less-populated rating ranges.

---

## Match Lifecycle

```
[Queue] → [Matched] → [Active] → [Submitted] → [Judged] → [Completed]

1. Both players receive problem simultaneously
2. Players write and submit code
3. Server sends code to Judge0
4. Judge0 runs all test cases
5. First player to pass all hidden test cases wins
6. If neither passes within time limit → draw or best-score wins
7. Elo ratings updated, match written to MongoDB
8. Replay snapshot saved
```

### Rating Delta (Elo-style)

```
K = 32

Expected score for player A:
  E_A = 1 / (1 + 10^((R_B - R_A) / 400))

New rating:
  R_A' = R_A + K * (S_A - E_A)
  
  S_A = 1 (win), 0 (loss), 0.5 (draw)
```

---

## Leaderboard System

The leaderboard is entirely served from Redis — MongoDB is never queried for rankings.

### After Every Match

```js
// Update both players' scores in the sorted set
await redis.zadd('leaderboard:global', player1.newRating, player1.userId);
await redis.zadd('leaderboard:global', player2.newRating, player2.userId);
```

### Fetching Top 50

```js
const top50 = await redis.zrevrange('leaderboard:global', 0, 49, 'WITHSCORES');
```

### Fetching a Player's Rank

```js
const rank = await redis.zrevrank('leaderboard:global', userId);
// rank is 0-indexed; add 1 for display
```

User details (username, avatar) are fetched from MongoDB for the top N users in a single `find` query after the sorted set returns the IDs.

---

## Match Replay System

When a match completes, a `Replay` document is saved with an ordered event log — every submission attempt, test result, and status change — timestamped from match start.

### Replay Playback

The client fetches the replay document and re-renders both players' code editor states by scrubbing through events by timestamp offset. This gives a frame-by-frame view of how both players approached the problem.

```
GET /api/matches/:matchId/replay

Response:
{
  match: { ... },
  events: [
    { type: 'submission', userId, timestamp, payload: { code, language } },
    { type: 'test_result', userId, timestamp, payload: { passed, failedCase } },
    ...
  ]
}
```

---

## API Reference

### Auth

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT |

### Users

| Method | Route | Description |
|---|---|---|
| GET | `/api/users/:username` | Public profile + stats |
| GET | `/api/users/me` | Own profile (auth required) |

### Matches

| Method | Route | Description |
|---|---|---|
| GET | `/api/matches/:matchId` | Match details |
| GET | `/api/matches/:matchId/replay` | Replay event log |
| GET | `/api/users/:userId/matches` | Match history (paginated) |

### Leaderboard

| Method | Route | Description |
|---|---|---|
| GET | `/api/leaderboard` | Top 50 globally |
| GET | `/api/leaderboard/rank/:userId` | Rank of a specific user |

### Problems (Admin)

| Method | Route | Description |
|---|---|---|
| POST | `/api/problems` | Add problem (admin) |
| GET | `/api/problems` | List all problems |

---

## Project Structure

```
codearena/
├── server/
│   ├── config/
│   │   ├── db.js              # Mongoose connection
│   │   └── redis.js           # ioredis client
│   ├── models/
│   │   ├── User.js
│   │   ├── Problem.js
│   │   ├── Match.js
│   │   └── Replay.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── matches.js
│   │   ├── leaderboard.js
│   │   └── problems.js
│   ├── socket/
│   │   ├── index.js           # Socket.io init + middleware
│   │   ├── matchHandler.js    # In-match events
│   │   └── queueHandler.js    # Queue join/leave events
│   ├── services/
│   │   ├── matchmaking.js     # Matchmaking worker loop
│   │   ├── judge.js           # Judge0 integration
│   │   ├── rating.js          # Elo calculation
│   │   ├── leaderboard.js     # Redis ZSet operations
│   │   └── replay.js          # Snapshot builder
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js
│   └── app.js                 # Express + Socket.io bootstrap
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/        # Monaco Editor wrapper
│   │   │   ├── Match/         # Match UI, timer, opponent status
│   │   │   ├── Leaderboard/
│   │   │   └── Replay/        # Replay scrubber
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   └── useMatch.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Queue.jsx
│   │   │   ├── Match.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── Profile.jsx
│   │   └── App.jsx
│
├── .env.example
├── docker-compose.yml         # MongoDB + Redis + Judge0
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB
- Redis
- Judge0 (Docker recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/codearena.git
cd codearena

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running with Docker (Recommended)

```bash
# Starts MongoDB, Redis, and Judge0
docker-compose up -d

# Start the server
cd server && npm run dev

# Start the client
cd client && npm run dev
```

### Running Manually

```bash
# Make sure MongoDB and Redis are running locally, then:
cd server && npm run dev
cd client && npm run dev
```

---

## Environment Variables

Create a `.env` file in `/server` based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/codearena
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
JUDGE0_URL=http://localhost:2358
JUDGE0_API_KEY=                   # leave empty if self-hosted
MATCHMAKING_INTERVAL_MS=500
QUEUE_BRACKET_SIZE=200
QUEUE_EXPAND_AFTER_MS=30000
MATCH_DURATION_MS=1800000         # 30 minutes
```

---

## License

MIT