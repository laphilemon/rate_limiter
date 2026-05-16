import  { Request, Response, NextFunction } from "express";
import { client } from "../config/redis.js"
import { pool } from "../config/db.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const luaScriptPath = path.join(__dirname, "../scripts/tokenBucket.lua");
const luaScript = fs.readFileSync(luaScriptPath, "utf8") 

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let dbClient;
  try {
    // Determine identifier and rule type
    let ruleType = "ip_address";
    let identifier = req.ip || "unknown";

    // check fofr authenticated user
    if ((req as any).user?.id) {
      ruleType = "user_id";
      identifier = (req as any).user.id.toString();
    }
    const apikey = (req.headers["x-api-key"] as string) || "";
    if (apikey) {
      ruleType = "api_key";
      identifier = apikey;
    }

    dbClient = await pool.connect();
    const configResult = await dbClient.query(
      "SELECT request_limit, window_second FROM rate_limit_config WHERE rule_type = $1",
      [ruleType],
    );
    dbClient.release();
    dbClient = null;

    const config = configResult.rows[0] || { request_limit: 100, window_second: 60 };

    const key = `rate_limit:${ruleType}:${identifier}`;
    const result = await client.eval(luaScript, {
        keys: [key],
        arguments: [
            config.request_limit.toString(),
            config.window_second.toString(),
            Math.floor(Date.now()/1000).toString()
        ] 
    }) as [number, number, number];
    
    const [allowed, remainingTokens, resetTime ] = result

    //Set rate limit Headers
    res.setHeader('X-RateLimit-Limit', config.request_limit.toString());
    res.setHeader('X-RateLimit-Remaining', remainingTokens.toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toString());
    res.setHeader('X-RateLimit-Window', config.window_second.toString());


    // If not allowed, send 429 response
    if (allowed === 0) {
      return res.status(429).json({
        success: false,
        message: 'Too Many Requests',
        limit: config.request_limit,
        remaining: remainingTokens,
        reset: resetTime
      });
    }

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Rate Limiter Error:', error);
    // Fail open - if rate limiter fails, allow request through
    if (dbClient) {
      dbClient.release();
    }
    next();
  }
};
