// server/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const config = {
    connectionString: process.env.SUPABASE_URL_CONNECTION || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
};

let pool;

const connectDB = async () => {
    try {
        if (!pool) {
            pool = new Pool(config);
            await pool.query('SELECT NOW()'); // Test connection
            console.log("? Database connected to PostgreSQL (Supabase)");
        }
        return pool;
    } catch (error) {
        console.error("? Database connection error:", error);
        throw error;
    }
};

const getPool = () => {
    if (!pool) {
        pool = new Pool(config);
    }
    return pool;
};

const closeDB = async () => {
    try {
        if (pool) {
            await pool.end();
            console.log("?? Database connection closed");
            pool = null;
        }
    } catch (error) {
        console.error("? Error closing database connection:", error);
    }
};

const testConnection = async () => {
    try {
        console.log('Testing database connection...');
        const testPool = new Pool(config);
        const result = await testPool.query('SELECT version()');
        
        console.log('? Connection test successful');
        console.log('PostgreSQL Version:', result.rows[0].version);
        
        await testPool.end();
        return true;
    } catch (err) {
        console.error('? Database connection error during test:', err.message);
        return false;
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Closing database connection...');
    await closeDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM. Closing database connection...');
    await closeDB();
    process.exit(0);
});

module.exports = {
    connectDB,
    getPool,
    closeDB,
    testConnection
};
