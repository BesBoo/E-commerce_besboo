const { Pool } = require('pg');

async function run() {
    const pool = new Pool({
        host: 'db.ojzxpvpthyplyjlhksrg.supabase.co',
        port: 6543,
        database: 'postgres',
        user: 'postgres',
        password: '123w456wDuc@@',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });
    
    try {
        await pool.query('SELECT 1');
        console.log("Success with port 6543");
        return true;
    } catch (e) {
        console.log("Failed:", e.message);
        return false;
    } finally {
        await pool.end();
    }
}
run();
