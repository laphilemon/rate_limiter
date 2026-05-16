import 'dotenv/config';
import { createClient } from 'redis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Handle the URL construction based on whether a password is provided
const redisUrl = REDIS_PASSWORD
    ? `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
    : `redis://${REDIS_HOST}:${REDIS_PORT}`;

export const client = createClient({
    url: redisUrl
});

export const connectRedis = async () => {
    try {
        await client.connect();
        console.log(`Redis connected successfully to ${REDIS_HOST}:${REDIS_PORT}`);
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};

export const closeRedis = async () => {
    try {
        await client.quit();
        console.log('Redis connection closed.');
    } catch (error) {
        console.error('Error closing Redis connection:', error);        
    }
}