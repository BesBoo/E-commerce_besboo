require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL_CONNECTION,
    ssl: { rejectUnauthorized: false }
});

// Evaluate product-data.js
const mockDataContent = fs.readFileSync('./client/js/product-data.js', 'utf8');
const window = {};
eval(mockDataContent);
const data = window.BesBooData;

async function seed() {
    console.log('Seeding data to Supabase using pg...');
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Seed Categories
        console.log('Seeding categories...');
        for (const c of data.categories) {
            await client.query(`
                INSERT INTO categories (category_id, name, description, image_url)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (category_id) DO NOTHING
            `, [c.category_id, c.name, c.description, c.image_url]);
        }

        // Seed Products
        console.log('Seeding products...');
        const products = data.products.slice(0, 16);
        for (const p of products) {
            await client.query(`
                INSERT INTO products (
                    product_id, name, description, price, stock, category_id,
                    image_url, images, colors, sizes, brand, is_featured, is_new, discount_percent
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
                )
                ON CONFLICT (product_id) DO NOTHING
            `, [
                p.product_id, p.name, p.description, p.price, p.stock, p.category_id,
                p.image_url, 
                p.images ? JSON.stringify(p.images) : null,
                p.colors ? JSON.stringify(p.colors) : null,
                p.sizes ? JSON.stringify(p.sizes) : null,
                p.brand, p.is_featured || false, p.is_new || false, p.discount_percent || 0
            ]);
        }

        await client.query('COMMIT');
        console.log('Seeding completed successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding data:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
