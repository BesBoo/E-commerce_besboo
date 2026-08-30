require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL_CONNECTION,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query('SELECT user_id, username, email, password_hash, role FROM users');
        console.log(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
