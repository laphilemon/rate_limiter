# Rate Limiter Service

A high-performance, distributed rate-limiting service built with Node.js, TypeScript, Redis, PostgreSQL, and RabbitMQ. This service implements the **Token Bucket** algorithm using Redis Lua scripts to ensure atomicity and scalability across multiple instances.

## System Design

![System Design](./docs/images/system-design.excalidraw.png)
*Diagram created using Excalidraw. Source files can be found in `/docs/images`.*

## Project Structure

```
.
├── docker-compose.yml
├── Dockerfile
├── .env                    # Environment variables (DB_URL, REDIS_URL)
├── .gitignore
├── package.json
├── create-db.js            # Database initialization script
├── docs                    # Documentation assets
│   └── images              # System design diagrams (Excalidraw)
├── src
│   ├── config              # Database & Redis connection setups
│   │   ├── db.ts           # PostgreSQL (Pool/Prisma)
│   │   ├── redis.ts        # Redis client
│   │   └── rabbitmq.ts     # RabbitMQ connection
│   ├── database            # Infrastructure scripts
│   │   ├── schema.sql      # Main SQL schema
│   │   └── rateLimiter.sql # Rate limit configuration seed
│   ├── middleware          # The core Rate Limiter logic
│   │   └── rateLimiter.ts
│   ├── models              # TypeScript types/interfaces for your DB
│   │   └── rules.ts
│   ├── scripts             # Redis Lua scripts for atomicity
│   │   └── tokenBucket.lua
│   └── server.ts           # Entry point (already exists)
└── tests                   # Unit and integration tests
    └── rateLimiter.test.ts
```

## Features

- **Distributed State**: Redis-backed storage for high-throughput scaling.
- **Event Driven**: RabbitMQ integration for streaming rate limit events and rule updates.
- **Persistence**: PostgreSQL for managing long-term rate limit configurations and client API keys.
- **Type Safety**: Fully written in TypeScript.
- **Containerized**: Ready for deployment via Docker and Docker Compose.

## Redis Lua Scripts

The core of the rate limiting logic relies on an atomic Token Bucket implementation using Redis Lua scripts. This ensures that operations like checking the bucket and refilling tokens are performed as a single, indivisible unit, preventing race conditions in a high-concurrency environment.

The `tokenBucket.lua` script (located in `src/scripts/tokenBucket.lua`) is responsible for:
- Calculating the current number of tokens available.
- Refilling tokens based on the configured refill rate.
- Decrementing tokens for each request.
- Determining if a request should be allowed or denied.

```lua
-- Content of src/scripts/tokenBucket.lua will go here.
-- This script atomically manages the token bucket logic in Redis.
```
## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   PORT=9090
   DATABASE_URL=postgresql://postgres:password123@localhost:5432/ratelimiter
   REDIS_HOST=localhost
   REDIS_PORT=6379
   RABBITMQ_URL=amqp://guest:guest@localhost:5672
   ```

3. **Database setup**
   - Ensure PostgreSQL is running
   - Create the database: `node create-db.js`
   - Apply the schema in `src/database/schema.sql`

4. **Redis setup**
   - Ensure Redis is running (default: 6379)

5. **RabbitMQ setup**
   - Ensure RabbitMQ is running (default: 5672)
   - The service will automatically assert `rate_limit_events` and `rule_updates` exchanges.

6. **Build the project**
   ```bash
   npm run build
   ```

7. **Run the service**
   ```bash
   npm start
   ```

## Development

- **Run tests**
  ```bash
  npm test
  ```

- **Run in development mode**
  ```bash
  npm run dev
  ```

## Docker

Build and run with Docker Compose:
```bash
docker-compose up --build
```

## API Usage

The rate limiter is designed to be used as middleware in your Express-like applications.

Example usage:
```typescript
import { rateLimiter } from './src/middleware/rateLimiter';

app.get('/api/resource', rateLimiter, (req, res) => {
  // Your route handler
});
```

## Configuration

Rules are managed in the `rate_limit_configs` table. You can update rules dynamically, and the system uses RabbitMQ `fanout` exchanges to propagate changes across service instances.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

MIT# rate_limiter
