// server/controllers/cartController.js - Supabase Postgres version

const { getPool } = require('../config/db');

const cartController = {
    getCart: async (req, res) => {
        try {
            const pool = getPool();
            const result = await pool.query(`
                SELECT 
                    c.cart_id, c.quantity, c.color, c.size, c.created_at,
                    p.product_id, p.name, p.price, p.image_url, p.stock,
                    p.discount_percent, p.brand, cat.name as category_name
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                LEFT JOIN categories cat ON p.category_id = cat.category_id
                WHERE c.user_id = $1
                ORDER BY c.created_at DESC
            `, [req.user.user_id]);

            const items = result.rows.map(item => ({
                cart_id: item.cart_id,
                product_id: item.product_id,
                name: item.name,
                price: item.price,
                image_url: item.image_url,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                stock: item.stock,
                discount_percent: item.discount_percent || 0,
                brand: item.brand,
                category_name: item.category_name
            }));

            let subtotal = 0;
            items.forEach(item => {
                const finalPrice = item.price * (1 - (item.discount_percent || 0) / 100);
                subtotal += finalPrice * item.quantity;
            });

            res.json({
                items: items,
                subtotal: subtotal,
                total_items: items.reduce((total, item) => total + item.quantity, 0)
            });
        } catch (error) {
            console.error('Get cart error:', error);
            res.status(500).json({ 
                message: 'Không th? t?i gi? hàng', 
                error: error.message,
                code: 'GET_CART_ERROR'
            });
        }
    },

    addToCart: async (req, res) => {
        try {
            if (!req.user?.user_id) {
                return res.status(401).json({ success: false, message: 'User not authenticated' });
            }

            const pool = getPool();
            const { product_id, quantity = 1, color, size } = req.body;

            if (!product_id || isNaN(product_id)) {
                return res.status(400).json({ success: false, message: 'ID s?n ph?m không h?p l?' });
            }

            const productId = parseInt(product_id);
            const normalizedQuantity = Math.min(Math.max(parseInt(quantity) || 1, 1), 99);
            const normalizedColor = color && color.toString().trim() !== '' && color !== 'null' ? color.toString().trim() : null;
            const normalizedSize = size && size.toString().trim() !== '' && size !== 'null' ? size.toString().trim() : null;

            const productResult = await pool.query(
                'SELECT product_id, name, price, stock FROM products WHERE product_id = $1',
                [productId]
            );

            if (productResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'S?n ph?m không t?n t?i' });
            }

            const product = productResult.rows[0];

            if (normalizedQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `S? lu?ng vu?t quá t?n kho (còn ${product.stock})`
                });
            }

            const existingCartResult = await pool.query(`
                SELECT cart_id, quantity 
                FROM cart 
                WHERE user_id = $1 
                AND product_id = $2
                AND (
                    (color IS NULL AND $3::VARCHAR IS NULL) OR 
                    (color = $3)
                )
                AND (
                    (size IS NULL AND $4::VARCHAR IS NULL) OR 
                    (size = $4)
                )
            `, [req.user.user_id, productId, normalizedColor, normalizedSize]);

            if (existingCartResult.rows.length > 0) {
                const existingItem = existingCartResult.rows[0];
                const newQuantity = existingItem.quantity + normalizedQuantity;
                
                if (newQuantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: `T?ng s? lu?ng s? vu?t quá t?n kho (còn ${product.stock})`
                    });
                }

                await pool.query(`
                    UPDATE cart 
                    SET quantity = $1, updated_at = NOW() 
                    WHERE cart_id = $2
                `, [newQuantity, existingItem.cart_id]);
            } else {
                await pool.query(`
                    INSERT INTO cart (user_id, product_id, quantity, color, size, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                `, [req.user.user_id, productId, normalizedQuantity, normalizedColor, normalizedSize]);
            }

            return res.status(201).json({
                success: true,
                message: 'Ðã thêm s?n ph?m vào gi? hàng'
            });
        } catch (error) {
            console.error('Add to cart error:', error);
            res.status(500).json({
                success: false,
                message: 'L?i khi thêm vào gi? hàng',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    updateCartItem: async (req, res) => {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({ message: 'ID gi? hàng không h?p l?', code: 'INVALID_CART_ID' });
            }

            if (quantity <= 0) {
                return await cartController.removeFromCart(req, res);
            }

            const pool = getPool();
            const cartResult = await pool.query(`
                SELECT c.*, p.name, p.stock
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.cart_id = $1 AND c.user_id = $2
            `, [parseInt(id), req.user.user_id]);

            if (cartResult.rows.length === 0) {
                return res.status(404).json({ 
                    message: 'S?n ph?m không t?n t?i trong gi? hàng c?a b?n',
                    code: 'CART_ITEM_NOT_FOUND'
                });
            }

            const cartItem = cartResult.rows[0];

            if (quantity > cartItem.stock) {
                return res.status(400).json({ 
                    message: `S? lu?ng vu?t quá t?n kho. T?n kho: ${cartItem.stock}`,
                    code: 'INSUFFICIENT_STOCK',
                    available_stock: cartItem.stock
                });
            }

            await pool.query(
                'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE cart_id = $2',
                [parseInt(quantity), parseInt(id)]
            );

            res.json({ 
                message: `Ðã c?p nh?t s? lu?ng "${cartItem.name}" thành công`,
                product_name: cartItem.name,
                new_quantity: parseInt(quantity)
            });
        } catch (error) {
            console.error('Update cart item error:', error);
            res.status(500).json({ message: 'L?i server khi c?p nh?t s?n ph?m', error: error.message });
        }
    },

    removeFromCart: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = getPool();

            if (!id || isNaN(id)) {
                return res.status(400).json({ message: 'ID không h?p l?', code: 'INVALID_ID' });
            }

            const cartResult = await pool.query(`
                SELECT c.cart_id, p.name 
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.cart_id = $1 AND c.user_id = $2
            `, [parseInt(id), req.user.user_id]);

            if (cartResult.rows.length === 0) {
                return res.status(404).json({ message: 'S?n ph?m không t?n t?i trong gi? hàng c?a b?n', code: 'CART_ITEM_NOT_FOUND' });
            }

            const productName = cartResult.rows[0].name;

            const deleteResult = await pool.query(
                'DELETE FROM cart WHERE cart_id = $1 AND user_id = $2',
                [parseInt(id), req.user.user_id]
            );

            if (deleteResult.rowCount === 0) {
                return res.status(404).json({ message: 'Không th? xóa s?n ph?m kh?i gi? hàng', code: 'DELETE_FAILED' });
            }

            res.json({ message: `Ðã xóa "${productName}" kh?i gi? hàng`, product_name: productName });
        } catch (error) {
            console.error('Remove from cart error:', error);
            res.status(500).json({ message: 'L?i server khi xóa s?n ph?m', error: error.message });
        }
    },

    removeFromCartByProduct: async (req, res) => {
        try {
            const { product_id, color, size } = req.body;
            const pool = getPool();

            if (!product_id || isNaN(product_id)) {
                return res.status(400).json({ message: 'ID s?n ph?m không h?p l?', code: 'INVALID_PRODUCT_ID' });
            }

            const normalizedColor = color && color.trim() !== '' && color !== 'null' ? color.trim() : null;
            const normalizedSize = size && size.trim() !== '' && size !== 'null' ? size.trim() : null;

            const cartResult = await pool.query(`
                SELECT c.cart_id, p.name 
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = $1 AND c.product_id = $2 
                AND (
                    (c.color IS NULL AND $3::VARCHAR IS NULL) OR 
                    (c.color = $3)
                )
                AND (
                    (c.size IS NULL AND $4::VARCHAR IS NULL) OR 
                    (c.size = $4)
                )
            `, [req.user.user_id, parseInt(product_id), normalizedColor, normalizedSize]);

            if (cartResult.rows.length === 0) {
                return res.status(404).json({ message: 'S?n ph?m không t?n t?i trong gi? hàng', code: 'CART_ITEM_NOT_FOUND' });
            }

            const productName = cartResult.rows[0].name;

            const deleteResult = await pool.query(`
                DELETE FROM cart 
                WHERE user_id = $1 AND product_id = $2 
                AND (
                    (color IS NULL AND $3::VARCHAR IS NULL) OR 
                    (color = $3)
                )
                AND (
                    (size IS NULL AND $4::VARCHAR IS NULL) OR 
                    (size = $4)
                )
            `, [req.user.user_id, parseInt(product_id), normalizedColor, normalizedSize]);

            res.json({ message: `Ðã xóa "${productName}" kh?i gi? hàng`, product_name: productName });
        } catch (error) {
            console.error('Remove from cart by product error:', error);
            res.status(500).json({ message: 'L?i server khi xóa s?n ph?m', error: error.message });
        }
    },

    clearCart: async (req, res) => {
        try {
            const pool = getPool();
            
            const countResult = await pool.query(
                'SELECT COUNT(*) as item_count FROM cart WHERE user_id = $1',
                [req.user.user_id]
            );
            
            const itemCount = parseInt(countResult.rows[0].item_count);

            if (itemCount === 0) {
                return res.json({ message: 'Gi? hàng dã tr?ng', items_removed: 0 });
            }

            const deleteResult = await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.user_id]);

            res.json({ message: 'Ðã xóa t?t c? s?n ph?m kh?i gi? hàng', items_removed: deleteResult.rowCount });
        } catch (error) {
            console.error('Clear cart error:', error);
            res.status(500).json({ message: 'L?i server khi xóa gi? hàng', error: error.message });
        }
    },

    getCartCount: async (req, res) => {
        try {
            const pool = getPool();
            const result = await pool.query(
                'SELECT SUM(quantity) as total_items FROM cart WHERE user_id = $1',
                [req.user.user_id]
            );

            const totalItems = parseInt(result.rows[0].total_items) || 0;
            res.json({ total_items: totalItems });
        } catch (error) {
            console.error('Get cart count error:', error);
            res.status(500).json({ message: 'L?i server khi d?m s?n ph?m', total_items: 0 });
        }
    },

    syncCart: async (req, res) => {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            const { items } = req.body;

            if (!items || !Array.isArray(items)) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'D? li?u gi? hàng không h?p l?' });
            }

            let syncedCount = 0;
            let errorCount = 0;

            for (const item of items) {
                try {
                    const productId = item.product_id || item.productId;
                    const quantity = Math.max(1, parseInt(item.quantity) || 1);

                    const productResult = await client.query(
                        'SELECT name, stock FROM products WHERE product_id = $1',
                        [parseInt(productId)]
                    );

                    if (productResult.rows.length === 0) {
                        errorCount++;
                        continue;
                    }

                    const product = productResult.rows[0];
                    const finalQuantity = Math.min(quantity, product.stock);

                    if (finalQuantity > 0) {
                        const normalizedColor = item.color && item.color.trim() !== '' && item.color !== 'null' ? item.color.trim() : null;
                        const normalizedSize = item.size && item.size.trim() !== '' && item.size !== 'null' ? item.size.trim() : null;

                        const existingResult = await client.query(`
                            SELECT cart_id, quantity FROM cart 
                            WHERE user_id = $1 AND product_id = $2 
                            AND (
                                (color IS NULL AND $3::VARCHAR IS NULL) OR 
                                (color = $3)
                            )
                            AND (
                                (size IS NULL AND $4::VARCHAR IS NULL) OR 
                                (size = $4)
                            )
                        `, [req.user.user_id, parseInt(productId), normalizedColor, normalizedSize]);

                        if (existingResult.rows.length > 0) {
                            const existingItem = existingResult.rows[0];
                            const newQuantity = Math.min(existingItem.quantity + finalQuantity, product.stock);

                            await client.query(
                                'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE cart_id = $2',
                                [newQuantity, existingItem.cart_id]
                            );
                        } else {
                            await client.query(`
                                INSERT INTO cart (user_id, product_id, quantity, color, size, created_at, updated_at)
                                VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                            `, [req.user.user_id, parseInt(productId), finalQuantity, normalizedColor, normalizedSize]);
                        }
                        syncedCount++;
                    } else {
                        errorCount++;
                    }
                } catch (itemError) {
                    errorCount++;
                }
            }

            await client.query('COMMIT');

            const syncedCart = await cartController.getCartData(req.user.user_id);
            
            res.json({
                message: `Ðã d?ng b? gi? hàng thành công`,
                synced_items: syncedCount,
                error_items: errorCount,
                total_items: syncedCart.total_items,
                ...syncedCart
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Sync cart error:', error);
            res.status(500).json({ message: 'L?i server khi d?ng b? gi? hàng', error: error.message });
        } finally {
            client.release();
        }
    },

    async getCartData(userId) {
        try {
            const pool = getPool();
            const result = await pool.query(`
                SELECT 
                    c.cart_id, c.quantity, c.color, c.size,
                    p.product_id, p.name, p.price, p.image_url, p.stock,
                    p.discount_percent, p.brand
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = $1
                ORDER BY c.created_at DESC
            `, [userId]);

            const items = result.rows.map(item => ({
                ...item,
                discount_percent: item.discount_percent || 0
            }));

            let subtotal = 0;
            items.forEach(item => {
                const finalPrice = item.price * (1 - (item.discount_percent || 0) / 100);
                subtotal += finalPrice * item.quantity;
            });

            return {
                items: items,
                subtotal: subtotal,
                total_items: items.reduce((total, item) => total + item.quantity, 0)
            };
        } catch (error) {
            throw error;
        }
    },

    checkout: async (req, res) => {
        const pool = getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            const { shipping_address, phone, notes, promotion_code, payment_method = 'COD' } = req.body;

            if (!shipping_address || !phone) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Ð?a ch? giao hàng và s? di?n tho?i là b?t bu?c' });
            }

            const cartResult = await client.query(`
                SELECT 
                    c.cart_id, c.product_id, c.quantity, c.color, c.size,
                    p.name, p.price, p.stock, p.discount_percent
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = $1
            `, [req.user.user_id]);

            if (cartResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Gi? hàng tr?ng' });
            }

            const cartItems = cartResult.rows;
            let total_amount = 0;
            const unavailableItems = [];

            for (const item of cartItems) {
                if (item.stock < item.quantity) {
                    unavailableItems.push(`${item.name} - Không d? hàng (còn ${item.stock})`);
                    continue;
                }
                const finalPrice = item.price * (1 - (item.discount_percent || 0) / 100);
                total_amount += finalPrice * item.quantity;
            }

            if (unavailableItems.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'M?t s? s?n ph?m không kh? d?ng', unavailable_items: unavailableItems });
            }

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
                    if (total_amount >= promotion.min_order_amount) {
                        if (promotion.discount_type === 'percent') {
                            promotion_discount = Math.floor(total_amount * promotion.discount_value / 100);
                        } else {
                            promotion_discount = promotion.discount_value;
                        }
                        total_amount -= promotion_discount;
                        await client.query('UPDATE promotions SET used_count = used_count + 1 WHERE code = $1', [promotion_code]);
                    }
                } else {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ message: 'Mã khuy?n mãi không h?p l? ho?c dã h?t h?n' });
                }
            }

            const orderResult = await client.query(`
                INSERT INTO orders (user_id, total_amount, shipping_address, phone, notes, payment_method, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING order_id
            `, [req.user.user_id, total_amount, shipping_address, phone, notes || null, payment_method]);

            const order_id = orderResult.rows[0].order_id;

            for (const item of cartItems) {
                const finalPrice = item.price * (1 - (item.discount_percent || 0) / 100);
                await client.query(`
                    INSERT INTO order_details (order_id, product_id, quantity, price, color, size)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [order_id, item.product_id, item.quantity, finalPrice, item.color || null, item.size || null]);

                await client.query(
                    'UPDATE products SET stock = stock - $1 WHERE product_id = $2',
                    [item.quantity, item.product_id]
                );
            }

            await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.user_id]);
            await client.query('COMMIT');

            res.status(201).json({ message: 'Ð?t hàng thành công', order_id: order_id, total_amount, promotion_discount });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Checkout error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        } finally {
            client.release();
        }
    }
};

module.exports = cartController;
