const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const config = {
    connectionString: process.env.SUPABASE_URL_CONNECTION,
    ssl: { rejectUnauthorized: false }
};

async function initDB() {
    const pool = new Pool(config);
    try {
        console.log('Connecting to database...');
        const sqlPath = path.join(__dirname, '../database/schema_supabase.sql');
        const sqlQuery = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Executing schema...');
        await pool.query(sqlQuery);
        console.log('Schema created successfully!');
    } catch (err) {
        console.error('Error executing schema:', err.message);
    } finally {
        await pool.end();
    }
}

initDB();
