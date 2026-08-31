// server/controller/orderController.js

const { getPool } = require('../config/db');

const orderController = {
    createOrder: async (req, res) => {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            const { items, shipping_address, phone, notes, promotion_code } = req.body;
            
            if (!items || items.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Gi? hàng tr?ng' });
            }

            let total_amount = 0;
            let promotion_discount = 0;

            if (promotion_code) {
                const promotionResult = await client.query(`
                    SELECT discount_type, discount_value, min_order_amount, usage_limit, used_count
                    FROM promotions
                    WHERE code = $1 AND is_active = TRUE
                    AND (start_date IS NULL OR start_date <= NOW())
                    AND (end_date IS NULL OR end_date >= NOW())
                `, [promotion_code]);

                if (promotionResult.rows.length > 0) {
                    const promotion = promotionResult.rows[0];
                    
                    if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
                        await client.query('ROLLBACK');
                        return res.status(400).json({ message: 'Mã khuy?n mãi dã h?t lu?t s? d?ng' });
                    }
                }
            }

            for (const item of items) {
                const productResult = await client.query(
                    'SELECT price, stock, name FROM products WHERE product_id = $1',
                    [item.product_id]
                );

                if (productResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ message: `S?n ph?m ID ${item.product_id} không t?n t?i` });
                }

                const product = productResult.rows[0];
                
                if (product.stock < item.quantity) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ 
                        message: `S?n ph?m ${product.name} không d? hàng. T?n kho: ${product.stock}` 
                    });
                }

                total_amount += product.price * item.quantity;
            }

            if (promotion_code) {
                const promotionResult = await client.query(`
                    SELECT discount_type, discount_value, min_order_amount
                    FROM promotions
                    WHERE code = $1 AND is_active = TRUE
                    AND (start_date IS NULL OR start_date <= NOW())
                    AND (end_date IS NULL OR end_date >= NOW())
                `, [promotion_code]);

                if (promotionResult.rows.length > 0) {
                    const promotion = promotionResult.rows[0];
                    
                    if (total_amount >= promotion.min_order_amount) {
                        if (promotion.discount_type === 'percent') {
                            promotion_discount = Math.floor(total_amount * promotion.discount_value / 100);
                        } else {
                            promotion_discount = promotion.discount_value;
                        }
                        
                        total_amount -= promotion_discount;
                        
                        await client.query(
                            'UPDATE promotions SET used_count = used_count + 1 WHERE code = $1',
                            [promotion_code]
                        );
                    }
                }
            }

            const orderResult = await client.query(`
                INSERT INTO orders (user_id, total_amount, shipping_address, phone, notes)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING order_id
            `, [req.user.user_id, total_amount, shipping_address, phone, notes || null]);

            const order_id = orderResult.rows[0].order_id;

            for (const item of items) {
                const productResult = await client.query(
                    'SELECT price FROM products WHERE product_id = $1',
                    [item.product_id]
                );

                const product = productResult.rows[0];

                await client.query(`
                    INSERT INTO order_details (order_id, product_id, quantity, price, color, size)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [order_id, item.product_id, item.quantity, product.price, item.color || null, item.size || null]);

                await client.query(
                    'UPDATE products SET stock = stock - $1 WHERE product_id = $2',
                    [item.quantity, item.product_id]
                );

                await client.query(
                    'DELETE FROM cart WHERE user_id = $1 AND product_id = $2',
                    [req.user.user_id, item.product_id]
                );
            }

            await client.query('COMMIT');

            res.status(201).json({
                message: 'Ð?t hàng thành công',
                order_id: order_id,
                total_amount: total_amount,
                promotion_discount: promotion_discount
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Create order error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        } finally {
            client.release();
        }
    },

    getUserOrders: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            const pool = getPool();

            const result = await pool.query(`
                SELECT 
                    o.order_id, o.total_amount, o.status, o.created_at,
                    o.shipping_address, o.phone, o.notes,
                    COUNT(od.order_detail_id) as item_count
                FROM orders o
                LEFT JOIN order_details od ON o.order_id = od.order_id
                WHERE o.user_id = $1
                GROUP BY o.order_id, o.total_amount, o.status, o.created_at,
                         o.shipping_address, o.phone, o.notes
                ORDER BY o.created_at DESC
                LIMIT $2 OFFSET $3
            `, [req.user.user_id, parseInt(limit), offset]);

            const countResult = await pool.query(
                'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
                [req.user.user_id]
            );

            const total = countResult.rows[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                orders: result.rows,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_items: parseInt(total),
                    items_per_page: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get user orders error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    getOrderById: async (req, res) => {
        try {
            const { orderId } = req.params;
            const pool = getPool();
            const isAdmin = req.user.role === 'admin';

            let query = `
                SELECT o.*, u.username, u.email, u.full_name
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                WHERE o.order_id = $1
            `;
            let params = [orderId];

            if (!isAdmin) {
                query += ' AND o.user_id = $2';
                params.push(req.user.user_id);
            }

            const orderResult = await pool.query(query, params);

            if (orderResult.rows.length === 0) {
                return res.status(404).json({ message: 'Ðon hàng không t?n t?i' });
            }

            const detailsResult = await pool.query(`
                SELECT 
                    od.*, p.name, p.image_url, p.brand
                FROM order_details od
                JOIN products p ON od.product_id = p.product_id
                WHERE od.order_id = $1
            `, [orderId]);

            const order = orderResult.rows[0];
            order.items = detailsResult.rows;

            res.json({ order });
        } catch (error) {
            console.error('Get order by id error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    cancelOrder: async (req, res) => {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            const { orderId } = req.params;

            const orderResult = await client.query(
                'SELECT status FROM orders WHERE order_id = $1 AND user_id = $2',
                [orderId, req.user.user_id]
            );

            if (orderResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Ðon hàng không t?n t?i' });
            }

            const order = orderResult.rows[0];
            if (order.status !== 'pending') {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Không th? h?y don hàng này' });
            }

            const itemsResult = await client.query(
                'SELECT product_id, quantity FROM order_details WHERE order_id = $1',
                [orderId]
            );

            for (const item of itemsResult.rows) {
                await client.query(
                    'UPDATE products SET stock = stock + $1 WHERE product_id = $2',
                    [item.quantity, item.product_id]
                );
            }

            await client.query(
                "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE order_id = $1",
                [orderId]
            );

            await client.query('COMMIT');
            res.json({ message: 'H?y don hàng thành công' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Cancel order error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        } finally {
            client.release();
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const { 
                page = 1, 
                limit = 20, 
                status, 
                user_id,
                from_date,
                to_date
            } = req.query;

            const offset = (page - 1) * limit;
            const pool = getPool();

            let whereConditions = ['1=1'];
            let params = [];
            let paramIndex = 1;

            if (status) {
                whereConditions.push(`o.status = $${paramIndex++}`);
                params.push(status);
            }
            if (user_id) {
                whereConditions.push(`o.user_id = $${paramIndex++}`);
                params.push(parseInt(user_id));
            }
            if (from_date) {
                whereConditions.push(`o.created_at >= $${paramIndex++}`);
                params.push(new Date(from_date));
            }
            if (to_date) {
                whereConditions.push(`o.created_at <= $${paramIndex++}`);
                params.push(new Date(to_date));
            }

            const whereClause = whereConditions.join(' AND ');

            const queryParams = [...params, parseInt(limit), offset];
            
            const result = await pool.query(`
                SELECT 
                    o.order_id, o.total_amount, o.status, o.created_at,
                    o.shipping_address, o.phone,
                    u.username, u.full_name, u.email,
                    COUNT(od.order_detail_id) as item_count
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                LEFT JOIN order_details od ON o.order_id = od.order_id
                WHERE ${whereClause}
                GROUP BY o.order_id, o.total_amount, o.status, o.created_at,
                         o.shipping_address, o.phone, u.username, u.full_name, u.email
                ORDER BY o.created_at DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `, queryParams);

            const countResult = await pool.query(`
                SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}
            `, params);

            const total = countResult.rows[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                orders: result.rows,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_items: parseInt(total),
                    items_per_page: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get all orders error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Tr?ng thái không h?p l?' });
            }

            const pool = getPool();
            $result = await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *', [status, orderId]); if ($result.rowCount === 0) { return res.status(404).json({ message: 'Không tìm th?y don hàng' }); }

            res.json({ message: 'C?p nh?t tr?ng thái don hàng thành công' });
        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    getOrderStats: async (req, res) => {
        try {
            const pool = getPool();

            const overviewResult = await pool.query(`
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
                    SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                    SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as total_revenue
                FROM orders
            `);

            const revenueResult = await pool.query(`
                SELECT 
                    EXTRACT(YEAR FROM created_at) as year,
                    EXTRACT(MONTH FROM created_at) as month,
                    SUM(total_amount) as revenue,
                    COUNT(*) as order_count
                FROM orders
                WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL '12 months'
                GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
                ORDER BY year DESC, month DESC
            `);

            const topProductsResult = await pool.query(`
                SELECT 
                    p.product_id, p.name, p.image_url,
                    SUM(od.quantity) as total_sold,
                    SUM(od.quantity * od.price) as revenue
                FROM order_details od
                JOIN products p ON od.product_id = p.product_id
                JOIN orders o ON od.order_id = o.order_id
                WHERE o.status = 'delivered'
                GROUP BY p.product_id, p.name, p.image_url
                ORDER BY total_sold DESC
                LIMIT 10
            `);

            res.json({
                overview: overviewResult.rows[0],
                monthly_revenue: revenueResult.rows,
                top_products: topProductsResult.rows
            });
        } catch (error) {
            console.error('Get order stats error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    }
};

module.exports = orderController;

