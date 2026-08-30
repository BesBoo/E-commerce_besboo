require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL_CONNECTION,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Fixing sequences...');
        await pool.query(`
            SELECT setval('categories_category_id_seq', (SELECT MAX(category_id) FROM categories));
            SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));
        `);
        console.log('Sequences fixed!');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
