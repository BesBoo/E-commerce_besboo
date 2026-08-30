// userController.js - Supabase Postgres version
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { getPool } = require('../config/db');
const { generateToken } = require('../middleware/auth');

const userController = {
    // Ðang ký user m?i
    register: async (req, res) => {
        try {
            console.log('?? Register request body:', req.body);
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('? Validation errors:', errors.array());
                return res.status(400).json({ 
                    message: 'D? li?u không h?p l?',
                    errors: errors.array() 
                });
            }

            const { username, email, password, phone, full_name } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ 
                    message: 'Username, email và password là b?t bu?c' 
                });
            }

            const pool = getPool();

            console.log('?? Checking existing user...');
            const checkUser = await pool.query(
                'SELECT user_id FROM users WHERE username = $1 OR email = $2',
                [username, email]
            );

            if (checkUser.rows.length > 0) {
                console.log('? User already exists');
                return res.status(400).json({ 
                    message: 'Username ho?c email dã t?n t?i' 
                });
            }

            console.log('?? Hashing password...');
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log('? Password hashed successfully');

            console.log('?? Creating new user...');
            const result = await pool.query(
                `INSERT INTO users (username, password_hash, email, phone, full_name)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING user_id, username, email, role`,
                [username, hashedPassword, email, phone || null, full_name || null]
            );

            console.log('? User created:', result.rows[0]);
            const newUser = result.rows[0];
            const token = generateToken(newUser.user_id, newUser.username, newUser.role);

            res.status(201).json({
                message: 'Ðang ký thành công',
                user: {
                    user_id: newUser.user_id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                },
                token
            });
        } catch (error) {
            console.error('? Register error:', error);
            res.status(500).json({ 
                message: 'L?i server khi dang ký', 
                error: error.message 
            });
        }
    },

    // Ðang nh?p
    login: async (req, res) => {
        try {
            console.log('?? Login request:', { username: req.body.username, hasPassword: !!req.body.password });
            
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ 
                    message: 'Vui lòng nh?p username và password' 
                });
            }

            const pool = getPool();
            
            console.log('?? Looking for user:', username);
            const result = await pool.query(
                `SELECT user_id, username, password_hash, email, role, full_name 
                 FROM users 
                 WHERE username = $1`,
                [username]
            );

            console.log('?? User query result:', result.rows.length, 'users found');
            
            if (result.rows.length === 0) {
                console.log('? User not found');
                return res.status(401).json({ 
                    message: 'Username ho?c password không dúng' 
                });
            }

            const user = result.rows[0];
            
            console.log('?? Comparing passwords...');
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            console.log('? Password comparison result:', isValidPassword);

            if (!isValidPassword) {
                console.log('? Invalid password');
                return res.status(401).json({ 
                    message: 'Username ho?c password không dúng' 
                });
            }

            console.log('?? Generating token...');
            const token = generateToken(user.user_id, user.username, user.role);

            console.log('? Login successful');
            res.json({
                message: 'Ðang nh?p thành công',
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name
                },
                token
            });
        } catch (error) {
            console.error('? Login error:', error);
            res.status(500).json({ 
                message: 'L?i server khi dang nh?p', 
                error: error.message 
            });
        }
    },

    // L?y thông tin profile
    getProfile: async (req, res) => {
        try {
            console.log('?? Getting profile for user:', req.user.user_id);
            
            const pool = getPool();
            const result = await pool.query(
                `SELECT user_id, username, email, phone, full_name, address, created_at, updated_at
                 FROM users WHERE user_id = $1`,
                [req.user.user_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User không t?n t?i' });
            }

            res.json({ user: result.rows[0] });
        } catch (error) {
            console.error('? Get profile error:', error);
            res.status(500).json({ 
                message: 'L?i server khi l?y thông tin profile', 
                error: error.message 
            });
        }
    },

    // C?p nh?t profile
    updateProfile: async (req, res) => {
        try {
            console.log('?? Updating profile for user:', req.user.user_id, req.body);
            
            const { phone, full_name, address } = req.body;
            const pool = getPool();

            const result = await pool.query(
                `UPDATE users 
                 SET phone = $1, full_name = $2, address = $3, updated_at = NOW()
                 WHERE user_id = $4`,
                [phone || null, full_name || null, address || null, req.user.user_id]
            );

            console.log('? Profile updated, rows affected:', result.rowCount);
            res.json({ message: 'C?p nh?t thông tin thành công' });
        } catch (error) {
            console.error('? Update profile error:', error);
            res.status(500).json({ 
                message: 'L?i server khi c?p nh?t profile', 
                error: error.message 
            });
        }
    },

    // Ð?i m?t kh?u
    changePassword: async (req, res) => {
        try {
            console.log('?? Changing password for user:', req.user.user_id);
            
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ 
                    message: 'Vui lòng nh?p d?y d? thông tin' 
                });
            }

            const pool = getPool();
            
            const result = await pool.query(
                'SELECT password_hash FROM users WHERE user_id = $1',
                [req.user.user_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User không t?n t?i' });
            }

            const user = result.rows[0];
            const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

            if (!isValidPassword) {
                return res.status(400).json({ 
                    message: 'M?t kh?u hi?n t?i không dúng' 
                });
            }

            const saltRounds = 10;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            await pool.query(
                `UPDATE users 
                 SET password_hash = $1, updated_at = NOW() 
                 WHERE user_id = $2`,
                [hashedNewPassword, req.user.user_id]
            );

            console.log('? Password changed successfully');
            res.json({ message: 'Ð?i m?t kh?u thành công' });
        } catch (error) {
            console.error('? Change password error:', error);
            res.status(500).json({ 
                message: 'L?i server khi d?i m?t kh?u', 
                error: error.message 
            });
        }
    },

    // L?y danh sách users (Admin only)
    getAllUsers: async (req, res) => {
        try {
            console.log('?? Getting all users (Admin request)');
            
            const pool = getPool();
            const result = await pool.query(`
                SELECT user_id, username, email, phone, full_name, role, created_at, updated_at
                FROM users
                ORDER BY created_at DESC
            `);

            console.log('? Found', result.rows.length, 'users');
            res.json({ users: result.rows });
        } catch (error) {
            console.error('? Get all users error:', error);
            res.status(500).json({ 
                message: 'L?i server khi l?y danh sách users', 
                error: error.message 
            });
        }
    },

    // C?p nh?t role user (Admin only)
    updateUserRole: async (req, res) => {
        try {
            console.log('?? Updating user role:', req.body);
            
            const { userId, role } = req.body;

            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Role không h?p l?' });
            }

            const pool = getPool();
            const result = await pool.query(
                `UPDATE users 
                 SET role = $1, updated_at = NOW() 
                 WHERE user_id = $2`,
                [role, userId]
            );

            console.log('? Role updated, rows affected:', result.rowCount);
            res.json({ message: 'C?p nh?t role thành công' });
        } catch (error) {
            console.error('? Update user role error:', error);
            res.status(500).json({ 
                message: 'L?i server khi c?p nh?t role', 
                error: error.message 
            });
        }
    },

    testDB: async (req, res) => {
        try {
            const pool = getPool();
            const result = await pool.query('SELECT COUNT(*) as total FROM users');
            res.json({ 
                message: 'Database connection OK',
                totalUsers: result.rows[0].total
            });
        } catch (error) {
            console.error('? Database test error:', error);
            res.status(500).json({ 
                message: 'Database connection failed', 
                error: error.message 
            });
        }
    }
};

module.exports = userController;
