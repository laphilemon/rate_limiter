import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { Pool, PoolClient } from 'pg';
import { release } from "node:os";

// System under Test
async function createDatabaseIfNotExists(adminPool: Pool){
    const client = await adminPool.connect();
    try{
        const result = await client.query('SELECT 1 FROM pg_datname WHERE datname = $1', ['ratelimiter'])
        if (result.rowCount === 0){
            await client.query('CREATE DATABASE ratelimiter');
            console.log('database "ratelimiter" created successfully');
        }else{
            console.log('database "ratelimiter" already exist')
        }
    }finally{
        await client.release();
    }
    await adminPool.end();
}

// --- Test Suite Execution 

describe("database provisionig System - Resiliency $ Property Properties", () =>{
    let mockClient: any;
    let mockPool: any;

    beforeEach(() => {
        mockClient = {
            query: vi.fn(),
            release: vi.fn()
        };
    })
})