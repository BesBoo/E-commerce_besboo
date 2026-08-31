// middleware/auth.js - Fixed version
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware xác thực token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        console.log('🔑 Auth check - Header:', authHeader ? 'Present' : 'Missing');
        console.log('🔑 Auth check - Token:', token ? 'Present' : 'Missing');

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        // Verify JWT token
        console.log('🔍 Verifying token...');
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token decoded:', { userId: decoded.userId, username: decoded.username, role: decoded.role });
        
        // Lấy thông tin user từ database (PostgreSQL / Supabase)
        const pool = getPool();
        const result = await pool.query(
            `SELECT user_id, username, email, role, full_name 
             FROM users 
             WHERE user_id = $1`,
            [decoded.userId]
        );

        console.log('👤 User lookup result:', result.rows.length, 'users found');

        if (result.rows.length === 0) {
            console.log('❌ User not found in database');
            return res.status(401).json({ message: 'Invalid token - user not found' });
        }

        req.user = result.rows[0];
        console.log('✅ User authenticated:', { 
            user_id: req.user.user_id, 
            username: req.user.username, 
            role: req.user.role 
        });
        
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        
        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else {
            return res.status(500).json({ message: 'Authentication error' });
        }
    }
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
    console.log('👑 Checking admin permission for user:', req.user?.username, 'role:', req.user?.role);
    
    if (req.user && req.user.role === 'admin') {
        console.log('✅ Admin access granted');
        next();
    } else {
        console.log('❌ Admin access denied');
        res.status(403).json({ message: 'Admin access required' });
    }
};

// Middleware kiểm tra quyền user hoặc admin
const requireUser = (req, res, next) => {
    console.log('👤 Checking user permission for user:', req.user?.username, 'role:', req.user?.role);
    
    if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
        console.log('✅ User access granted');
        next();
    } else {
        console.log('❌ User access denied');
        res.status(403).json({ message: 'User access required' });
    }
};

// Tạo JWT token
const generateToken = (userId, username, role) => {
    console.log('🎫 Generating token for:', { userId, username, role });
    
    const payload = {
        userId: userId,
        username: username,
        role: role,
        iat: Math.floor(Date.now() / 1000) // issued at time
    };

    const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    console.log('✅ Token generated successfully');
    return token;
};

// Verify token (utility function)
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        return null;
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireUser,
    generateToken,
    verifyToken
};