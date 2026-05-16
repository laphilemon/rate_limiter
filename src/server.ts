import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { connectRedis, closeRedis } from './config/redis.js';
import { connectDB, closeDB } from './config/db.js';
import { connectRabbitMQ, closeRabbitMQ } from './config/rabbitmq.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 9090;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Example route using rate limiter middleware
app.get('/api/resource', rateLimiter, (req: Request, res: Response) => {
  res.status(200).json({
    message: "Request processed sucessfully",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const shutdown = async () => {
  console.log('Received shutdown signal, closing connections...')
  await closeRabbitMQ();
  await closeRedis();
  await closeDB();
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)


// Start server
async function startServer() {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbitMQ();

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
