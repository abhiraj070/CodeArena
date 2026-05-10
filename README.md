# ⚔️ CodeArena

> A real-time competitive coding platform where developers can battle head-to-head, solve coding problems, and compete through live WebSocket-powered matches.

---

# Overview

CodeArena is a full-stack competitive programming platform designed for real-time coding battles.

Users can:

* Join coding matches
* Compete against opponents live
* Submit and execute code
* Communicate through realtime socket events
* Track match activity and results

The project follows a service-oriented architecture with separate services for:

* API handling
* Realtime socket communication
* Code execution
* Frontend delivery

CodeArena focuses on realtime interaction, scalable backend communication, and modular deployment.

---

# Features

* User authentication and authorization
* Real-time coding battles
* WebSocket-powered live communication
* Online code execution
* Matchmaking system
* Multiple backend services
* Dockerized local development setup
* Responsive frontend UI
* REST API integration
* Redis integration for realtime systems

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Socket.IO Client

## Backend

* Node.js
* Express.js
* Socket.IO
* MongoDB
* Redis

## Infrastructure & Deployment

* Docker
* Docker Compose
* Vercel
* Render

---

# System Architecture

```txt
┌────────────────────┐
│      Frontend      │
│   React + Vite     │
└─────────┬──────────┘
          │
          │ HTTP / WebSocket
          │
┌─────────▼──────────┐
│    API Gateway     │
│     Express.js     │
└─────────┬──────────┘
          │
 ┌────────┴────────┐
 │                 │
 │                 │
▼▼                 ▼
WebSocket      Code Execution
Service         Service
(Socket.IO)      

          │
          ▼
     MongoDB
       Redis
```

---

# Project Structure

```txt
CodeArena/
│
├── frontend/                 # React frontend
│
├── api-gateway/              # Main backend APIs
│
├── websocket-service/        # Socket.IO realtime service
│
├── code-execution-service/   # Code execution handling
│
├── docker-compose.yml
│
└── README.md
```

---

# Realtime Communication

CodeArena uses Socket.IO for realtime interactions between players.

Realtime functionality includes:

* Match creation
* Match updates
* Live status synchronization
* Submission events
* Match result updates

The websocket layer allows both players to stay synchronized during active coding sessions.

---

# Matchmaking

The platform includes a realtime matchmaking system that pairs users for coding battles.

Redis is used to support fast temporary state management and realtime coordination.

---

# Code Execution

Users can write and submit code directly from the browser.

The backend execution service:

* Receives submissions
* Processes execution requests
* Returns execution results
* Handles multiple programming languages

---

# API Architecture

The backend follows a modular service structure.

Example API responsibilities include:

* Authentication
* User management
* Match handling
* Submission handling
* Match history

---

# Local Development Setup

## Prerequisites

* Node.js
* Docker
* MongoDB
* Redis

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/codearena.git
cd codearena
```

---

# Install Dependencies

## Frontend

```bash
cd frontend
npm install
```

## API Gateway

```bash
cd api-gateway
npm install
```

## WebSocket Service

```bash
cd websocket-service
npm install
```

## Code Execution Service

```bash
cd code-execution-service
npm install
```

---

# Run With Docker

```bash
docker-compose up --build
```

---

# Run Frontend

```bash
cd frontend
npm run dev
```

---

# Run Backend Services

## API Gateway

```bash
cd api-gateway
npm run dev
```

## WebSocket Service

```bash
cd websocket-service
npm run dev
```

## Code Execution Service

```bash
cd code-execution-service
npm run dev
```

---

# Environment Variables

Example environment variables:

```env
PORT=8000
MONGO_URI=your_mongodb_uri
REDIS_URL=your_redis_url
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
WEBSOCKET_URL=your_websocket_url
```

---

# Deployment

## Frontend

Deployed using:

* Vercel

## Backend Services

Deployed using:

* Render

## Local Infrastructure

Managed through:

* Docker Compose

---

# Future Improvements

* Ranked matchmaking
* Leaderboard system
* Match replay system
* Contest mode
* Team battles
* AI-assisted problem recommendations
* Improved analytics dashboard

---

# Why This Project Matters

CodeArena demonstrates:

* Realtime system design
* WebSocket communication
* Multi-service backend architecture
* Distributed deployment workflow
* Dockerized development environments
* Full-stack application development
* Scalable backend communication patterns

