const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:K527xD8dARne%259Y@db.ojzxpvpthyplyjlhksrg.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        const result = await pool.query('SELECT 1 as test');
        console.log("Success! Direct connection works:", result.rows);
    } catch (e) {
        console.error("Direct connection failed:", e);
    } finally {
        await pool.end();
    }
}
test();
