import 'dotenv/config'
import amqp, { Channel } from 'amqplib'

const RABBITMQ_URL = process.env.RABBITMQ_URL ||
    `amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASS || 'guest'}@localhost:5672`;

// Define a local interface to force the compiler to recognize the methods
interface RabbitConnection {
    createChannel(): Promise<Channel>;
    close(): Promise<void>;
}

let connection: RabbitConnection | null = null;
let channel: Channel | null = null;

export const connectRabbitMQ = async () => {
    try {
        // Double-cast to unknown first to bypass strict type checking
        const conn = (await amqp.connect(RABBITMQ_URL)) as unknown as RabbitConnection;
        connection = conn;
        
        channel = await connection.createChannel();
        console.log("Connected to RabbitMq");

        if (channel) {
            await channel.assertExchange('rate_limit_events', 'topic', { durable: true });
            await channel.assertExchange('rule_updates', 'fanout', { durable: true });
        }
    } catch (error) {
        console.error('Failed to connect to RabbitMq:', error);
        throw error;
    }    
}

export const getChannel = (): Channel => {
    if (!channel) throw new Error("RabbitMq channel not initialized.");
    return channel;    
}

export const closeRabbitMQ = async () => {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
    } catch (error) {
        console.error('Error closing RabbitMq connection:', error);
    }
}