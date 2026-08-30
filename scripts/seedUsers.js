require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL_CONNECTION,
    ssl: { rejectUnauthorized: false }
});

async function seedUsers() {
    console.log('Seeding users...');
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const userPassword = await bcrypt.hash('user123', salt);
        
        // Insert Admin
        await client.query(`
            INSERT INTO users (username, password_hash, email, full_name, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
        `, ['admin', adminPassword, 'admin@besboo.com', 'Administrator', 'admin']);
        
        // Insert Normal User
        await client.query(`
            INSERT INTO users (username, password_hash, email, full_name, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
        `, ['user', userPassword, 'user@besboo.com', 'Khách hàng', 'customer']);
        
        await client.query('COMMIT');
        console.log('Users seeded successfully!');
        console.log('---------------------------------');
        console.log('Tài kho?n Admin:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('---------------------------------');
        console.log('Tài kho?n User (Khách hàng):');
        console.log('Username: user');
        console.log('Password: user123');
        console.log('---------------------------------');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding users:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

seedUsers();
