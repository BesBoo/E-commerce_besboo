require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.SUPABASE_URL_CONNECTION,
    ssl: { rejectUnauthorized: false },
    max: 1
});

async function test() {
    try {
        const result = await pool.query(`
            SELECT 
                o.order_id, o.total_amount, o.status, o.created_at,
                o.shipping_address, o.phone,
                u.username, u.full_name, u.email,
                COUNT(od.order_detail_id) as item_count
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            LEFT JOIN order_details od ON o.order_id = od.order_id
            WHERE 1=1
            GROUP BY o.order_id, o.total_amount, o.status, o.created_at,
                     o.shipping_address, o.phone, u.username, u.full_name, u.email
            ORDER BY o.created_at DESC
            LIMIT $1 OFFSET $2
        `, [10, 0]);
        console.log("Success! Found rows:", result.rows.length);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
test();
