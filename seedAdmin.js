const bcrypt = require('bcrypt');
const { connectDB, getPool, sql, closeDB } = require('./server/config/db');

async function seedAdmin() {
    try {
        console.log('Connecting to database...');
        await connectDB();
        const pool = getPool();

        const username = 'admin';
        const email = 'admin@example.com';
        const password = 'Admin@123456';
        const role = 'admin';

        // Check if admin already exists
        const checkUser = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .query('SELECT user_id FROM users WHERE username = @username OR email = @username');

        if (checkUser.recordset.length > 0) {
            console.log('Admin user already exists!');
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await pool.request()
                .input('username', sql.NVarChar(50), username)
                .input('password_hash', sql.NVarChar(255), hashedPassword)
                .input('email', sql.NVarChar(100), email)
                .input('role', sql.NVarChar(20), role)
                .input('full_name', sql.NVarChar(100), 'System Administrator')
                .query(`
                    INSERT INTO users (username, password_hash, email, role, full_name)
                    VALUES (@username, @password_hash, @email, @role, @full_name)
                `);
            console.log('Admin account created successfully.');
            console.log('Email:', email);
            console.log('Password:', password);
            console.log('Role:', role);
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await closeDB();
        process.exit(0);
    }
}

seedAdmin();
