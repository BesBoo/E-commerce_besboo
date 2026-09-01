const express = require('express');
const { body } = require('express-validator');
const { getPool } = require('../config/db');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');

const router = express.Router();

// =============================================================================
// CATEGORIES ROUTES
// =============================================================================

// Lấy tất cả danh mục
router.get('/categories', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.query(`
            SELECT c.*, COUNT(p.product_id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.category_id = p.category_id
            GROUP BY c.category_id, c.name, c.description, c.image_url, c.created_at
            ORDER BY c.name
        `);

        res.json({ categories: result.rows });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Tạo danh mục mới (Admin only)
router.post('/categories', 
    authenticateToken, 
    requireAdmin, 
    [
        body('name').isLength({ min: 2, max: 100 }).withMessage('Tên danh mục phải từ 2-100 ký tự'),
        body('description').optional().isLength({ max: 255 }).withMessage('Mô tả không được quá 255 ký tự')
    ],
    async (req, res) => {
        try {
            const { name, description, image_url } = req.body;
            const pool = getPool();

            const result = await pool.query(`
                INSERT INTO categories (name, description, image_url)
                VALUES ($1, $2, $3)
                RETURNING category_id
            `, [name, description, image_url]);

            res.status(201).json({
                message: 'Tạo danh mục thành công',
                category_id: result.rows[0].category_id
            });
        } catch (error) {
            console.error('Create category error:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
);

// =============================================================================
// CART ROUTES
// =============================================================================

// Lấy giỏ hàng
router.get('/cart', authenticateToken, requireUser, async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.query(`
            SELECT 
                c.cart_id, c.quantity, c.color, c.size,
                p.product_id, p.name, p.price, p.image_url, p.stock,
                p.discount_percent
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC
        `, [req.user.user_id]);

        const cartItems = result.rows.map(item => ({
            ...item,
            subtotal: item.price * item.quantity * (1 - item.discount_percent / 100)
        }));

        const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

        res.json({ 
            cart_items: cartItems,
            total_amount: total,
            item_count: cartItems.length
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/cart', 
    authenticateToken, 
    requireUser,
    [
        body('product_id').isInt({ min: 1 }).withMessage('ID sản phẩm không hợp lệ'),
        body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
        body('color').optional().isLength({ max: 50 }).withMessage('Màu sắc không hợp lệ'),
        body('size').optional().isLength({ max: 20 }).withMessage('Kích thước không hợp lệ')
    ],
    async (req, res) => {
        try {
            const { product_id, quantity, color, size } = req.body;
            const pool = getPool();

            // Kiểm tra sản phẩm tồn tại và còn hàng
            const productResult = await pool.query(
                'SELECT stock, name FROM products WHERE product_id = $1', 
                [product_id]
            );

            if (productResult.rows.length === 0) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            const product = productResult.rows[0];
            if (product.stock < quantity) {
                return res.status(400).json({ 
                    message: `Sản phẩm ${product.name} không đủ hàng. Tồn kho: ${product.stock}` 
                });
            }

            // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
            const existingResult = await pool.query(`
                SELECT cart_id, quantity FROM cart 
                WHERE user_id = $1 AND product_id = $2 
                AND COALESCE(color, '') = COALESCE($3, '')
                AND COALESCE(size, '') = COALESCE($4, '')
            `, [req.user.user_id, product_id, color || null, size || null]);

            if (existingResult.rows.length > 0) {
                // Cập nhật số lượng
                const newQuantity = existingResult.rows[0].quantity + quantity;
                if (newQuantity > product.stock) {
                    return res.status(400).json({ 
                        message: `Tổng số lượng vượt quá tồn kho. Tồn kho: ${product.stock}` 
                    });
                }

                await pool.query(
                    'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE cart_id = $2',
                    [newQuantity, existingResult.rows[0].cart_id]
                );
            } else {
                // Thêm mới
                await pool.query(`
                    INSERT INTO cart (user_id, product_id, quantity, color, size)
                    VALUES ($1, $2, $3, $4, $5)
                `, [req.user.user_id, product_id, quantity, color || null, size || null]);
            }

            res.json({ message: 'Thêm vào giỏ hàng thành công', success: true });
        } catch (error) {
            console.error('Add to cart error:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/cart/:cartId', authenticateToken, requireUser, async (req, res) => {
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Số lượng phải là số nguyên dương' });
        }

        const pool = getPool();

        // Kiểm tra cart item thuộc về user
        const cartResult = await pool.query(`
            SELECT c.product_id, p.stock, p.name
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.cart_id = $1 AND c.user_id = $2
        `, [cartId, req.user.user_id]);

        if (cartResult.rows.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng' });
        }

        const item = cartResult.rows[0];
        if (quantity > item.stock) {
            return res.status(400).json({ 
                message: `Sản phẩm ${item.name} không đủ hàng. Tồn kho: ${item.stock}` 
            });
        }

        await pool.query(
            'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE cart_id = $2',
            [quantity, cartId]
        );

        res.json({ message: 'Cập nhật giỏ hàng thành công' });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/cart/:cartId', authenticateToken, requireUser, async (req, res) => {
    try {
        const { cartId } = req.params;
        const pool = getPool();

        await pool.query(
            'DELETE FROM cart WHERE cart_id = $1 AND user_id = $2',
            [cartId, req.user.user_id]
        );

        res.json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Xóa toàn bộ giỏ hàng
router.delete('/cart', authenticateToken, requireUser, async (req, res) => {
    try {
        const pool = getPool();
        await pool.query(
            'DELETE FROM cart WHERE user_id = $1',
            [req.user.user_id]
        );

        res.json({ message: 'Xóa toàn bộ giỏ hàng thành công' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// =============================================================================
// FAVORITES ROUTES
// =============================================================================

// Lấy danh sách yêu thích
router.get('/favorites', authenticateToken, requireUser, async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.query(`
            SELECT 
                f.favorite_id, f.created_at,
                p.product_id, p.name, p.price, p.image_url, p.discount_percent,
                c.name as category_name,
                AVG(CAST(r.rating as FLOAT)) as avg_rating
            FROM favorites f
            JOIN products p ON f.product_id = p.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN reviews r ON p.product_id = r.product_id
            WHERE f.user_id = $1
            GROUP BY f.favorite_id, f.created_at, p.product_id, p.name, 
                     p.price, p.image_url, p.discount_percent, c.name
            ORDER BY f.created_at DESC
        `, [req.user.user_id]);

        res.json({ favorites: result.rows });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Thêm/xóa sản phẩm yêu thích
router.post('/favorites/:productId', authenticateToken, requireUser, async (req, res) => {
    try {
        const { productId } = req.params;
        const pool = getPool();

        // Kiểm tra sản phẩm tồn tại
        const productCheck = await pool.query(
            'SELECT product_id FROM products WHERE product_id = $1',
            [productId]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Kiểm tra đã yêu thích chưa
        const favoriteCheck = await pool.query(
            'SELECT favorite_id FROM favorites WHERE user_id = $1 AND product_id = $2',
            [req.user.user_id, productId]
        );

        if (favoriteCheck.rows.length > 0) {
            // Xóa khỏi yêu thích
            await pool.query(
                'DELETE FROM favorites WHERE favorite_id = $1',
                [favoriteCheck.rows[0].favorite_id]
            );
            
            res.json({ message: 'Đã xóa khỏi danh sách yêu thích', is_favorite: false });
        } else {
            // Thêm vào yêu thích
            await pool.query(
                'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)',
                [req.user.user_id, productId]
            );
            
            res.json({ message: 'Đã thêm vào danh sách yêu thích', is_favorite: true });
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// =============================================================================
// PROMOTIONS ROUTES
// =============================================================================

// Lấy tất cả mã khuyến mãi đang hoạt động
router.get('/promotions', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.query(`
            SELECT code, discount_type, discount_value, min_order_amount, 
                   start_date, end_date, usage_limit, used_count
            FROM promotions
            WHERE is_active = true
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
            AND (usage_limit IS NULL OR used_count < usage_limit)
            ORDER BY discount_value DESC
        `);

        res.json({ promotions: result.rows });
    } catch (error) {
        console.error('Get promotions error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Kiểm tra mã khuyến mãi
router.post('/promotions/validate', authenticateToken, requireUser, async (req, res) => {
    try {
        const { code, order_amount } = req.body;

        if (!code || !order_amount) {
            return res.status(400).json({ message: 'Thiếu thông tin mã khuyến mãi hoặc giá trị đơn hàng' });
        }

        const pool = getPool();
        const result = await pool.query(`
            SELECT discount_type, discount_value, min_order_amount, usage_limit, used_count
            FROM promotions
            WHERE code = $1 AND is_active = true
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
        `, [code]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Mã khuyến mãi không tồn tại hoặc đã hết hạn' });
        }

        const promotion = result.rows[0];

        if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
            return res.status(400).json({ message: 'Mã khuyến mãi đã hết lượt sử dụng' });
        }

        if (order_amount < promotion.min_order_amount) {
            return res.status(400).json({ 
                message: `Đơn hàng tối thiểu ${promotion.min_order_amount.toLocaleString('vi-VN')}đ để sử dụng mã này` 
            });
        }

        let discount_amount = 0;
        if (promotion.discount_type === 'percent') {
            discount_amount = Math.floor(order_amount * promotion.discount_value / 100);
        } else {
            discount_amount = promotion.discount_value;
        }

        res.json({
            message: 'Mã khuyến mãi hợp lệ',
            discount_amount: discount_amount,
            final_amount: order_amount - discount_amount
        });
    } catch (error) {
        console.error('Validate promotion error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Tạo mã khuyến mãi (Admin only)
router.post('/promotions', 
    authenticateToken, 
    requireAdmin,
    [
        body('code').isLength({ min: 3, max: 50 }).withMessage('Mã khuyến mãi phải từ 3-50 ký tự'),
        body('discount_value').isInt({ min: 1 }).withMessage('Giá trị giảm giá phải là số dương'),
        body('discount_type').isIn(['percent', 'fixed']).withMessage('Loại giảm giá không hợp lệ')
    ],
    async (req, res) => {
        try {
            const { 
                code, discount_type, discount_value, min_order_amount,
                start_date, end_date, usage_limit 
            } = req.body;

            const pool = getPool();
            
            // Kiểm tra mã đã tồn tại
            const existingCode = await pool.query(
                'SELECT code FROM promotions WHERE code = $1',
                [code]
            );

            if (existingCode.rows.length > 0) {
                return res.status(400).json({ message: 'Mã khuyến mãi đã tồn tại' });
            }

            await pool.query(`
                INSERT INTO promotions (code, discount_type, discount_value, min_order_amount, 
                                      start_date, end_date, usage_limit)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [code, discount_type, discount_value, min_order_amount || 0, start_date || null, end_date || null, usage_limit || null]);

            res.status(201).json({ message: 'Tạo mã khuyến mãi thành công' });
        } catch (error) {
            console.error('Create promotion error:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
);

module.exports = router;
