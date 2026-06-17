import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './socket/index.js';
import sessionRoutes from './routes/session.js';

const ORIGIN = 'http://localhost:5173';
const METHODS = ['GET', 'POST'];

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {origin: ORIGIN, methods: METHODS}
})