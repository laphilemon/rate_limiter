import { Pool, Client } from "pg";
import 'dotenv/config';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "password123";
const DB_PORT = Number(process.env.DB_PORT) || 5432;
const DB_NAME = process.env.DB_NAME || "rate_limit_db";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

// import database files
const schemaPath = path.join(__dirname, '../database/schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const adminPool = new Pool ({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: 'postgres'
})

async function runDatabaseSetup() {
    const adminClient = await adminPool.connect();
    try {
        const result = await adminClient.query("SELECT  1 FROM pg_database WHERE datname = $1", [DB_NAME])

        if (result.rowCount === 0) {
            await adminClient.query(`CREATE DATABASE ${DB_NAME}`)
            console.log("Database ${DB_NAME} create sucessfully")
        } else {
            console.log(`Database ${DB_NAME} already exist`);
        }
    } finally{
        adminClient.release();
        await adminPool.end();
    }   
}
async function runSchemaMigration(){
    const targetClient = new Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT
});
await targetClient.connect();
try {
    console.log(`Executing schema initialization from file: ${schemaPath}`)
    await targetClient.query("BEGIN;");

    //Excute the raw SQL loaded directly from database dir file
    await targetClient.query(schemaSql);

    await targetClient.query("COMMIT;")
    console.log("Database tables ,extension and index created sucessfully")
} catch (error: any) {
    await targetClient.query("ROLLBACK;");
    console.error("Database migration Failed", error.stack)
}finally{
    await targetClient.end();
}
}


async function main() {
    await runDatabaseSetup();
    await runSchemaMigration();
}
main().catch(console.error)