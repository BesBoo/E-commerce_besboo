// server/controllers/productController.js

const { getPool } = require('../config/db');

const productController = {
    getAllProducts : async (req, res) => {
        try {
            const pool = getPool();
            const { 
                page = 1, 
                limit = 12, 
                category, 
                search, 
                sort = 'newest',
                min_price,
                max_price,
                brand 
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            let whereConditions = ['p.stock > 0'];
            let params = [];
            let paramIndex = 1;
            
            if (category) {
                whereConditions.push(`c.name = $${paramIndex++}`);
                params.push(category);
            }
            
            if (search) {
                whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex})`);
                params.push(`%${search}%`);
                paramIndex++;
            }
            
            if (min_price) {
                whereConditions.push(`p.price >= $${paramIndex++}`);
                params.push(parseFloat(min_price));
            }
            
            if (max_price) {
                whereConditions.push(`p.price <= $${paramIndex++}`);
                params.push(parseFloat(max_price));
            }
            
            if (brand) {
                whereConditions.push(`p.brand = $${paramIndex++}`);
                params.push(brand);
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
            
            let orderBy;
            switch (sort) {
                case 'price_asc':
                    orderBy = 'ORDER BY p.price ASC';
                    break;
                case 'price_desc':
                    orderBy = 'ORDER BY p.price DESC';
                    break;
                case 'name':
                    orderBy = 'ORDER BY p.name ASC';
                    break;
                case 'newest':
                default:
                    orderBy = 'ORDER BY p.created_at DESC, p.product_id DESC';
                    break;
            }

            const queryParams = [...params, parseInt(limit), offset];

            const query = `
                SELECT 
                    p.product_id, p.name, p.price, p.image_url, p.model_3d,
                    p.discount_percent, p.brand, p.stock, p.created_at,
                    c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                ${whereClause}
                ${orderBy}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            const countQuery = `
                SELECT COUNT(*) as total
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                ${whereClause}
            `;

            const [result, countResult] = await Promise.all([
                pool.query(query, queryParams),
                pool.query(countQuery, params)
            ]);

            const products = result.rows.map(product => ({
                ...product,
                discount_percent: product.discount_percent || 0
            }));

            const total = countResult.rows[0].total;
            const totalPages = Math.ceil(total / parseInt(limit));

            res.json({
                products,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_items: parseInt(total),
                    items_per_page: parseInt(limit),
                    has_next: parseInt(page) < totalPages,
                    has_prev: parseInt(page) > 1
                }
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({ 
                message: 'Kh�ng th? t?i danh s�ch s?n ph?m',
                error: error.message
            });
        }
    },

    
    getAdminProducts: async (req, res) => {
        try {
            const pool = getPool();
            const { 
                page = 1, 
                limit = 12, 
                category, 
                search,
                is_featured,
                is_new,
                sort = 'newest'
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            let whereConditions = ['1=1'];
            let params = [];
            let paramIndex = 1;
            
            if (category) {
                whereConditions.push(`(c.name = ${paramIndex} OR c.category_id::text = ${paramIndex})`);
                params.push(category.toString());
                paramIndex++;
            }
            
            if (search) {
                whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex})`);
                params.push(`%${search}%`);
                paramIndex++;
            }
            
            if (is_featured === 'true') {
                whereConditions.push(`p.is_featured = true`);
            }
            
            if (is_new === 'true') {
                whereConditions.push(`p.is_new = true`);
            }

            let orderBy = 'p.created_at DESC, p.product_id DESC';
            switch (sort) {
                case 'price-asc':
                    orderBy = 'p.price ASC, p.product_id DESC';
                    break;
                case 'price-desc':
                    orderBy = 'p.price DESC, p.product_id DESC';
                    break;
                case 'stock-asc':
                    orderBy = 'p.stock ASC, p.product_id DESC';
                    break;
                case 'stock-desc':
                    orderBy = 'p.stock DESC, p.product_id DESC';
                    break;
                case 'name-asc':
                    orderBy = 'p.name ASC, p.product_id DESC';
                    break;
                case 'name-desc':
                    orderBy = 'p.name DESC, p.product_id DESC';
                    break;
            }

            const query = `
                SELECT 
                    p.product_id, p.name, p.price, p.image_url, p.model_3d,
                    p.discount_percent, p.brand, p.stock, p.created_at, p.updated_at,
                    p.is_featured, p.is_new, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY ${orderBy}
                LIMIT $${paramIndex++} OFFSET $${paramIndex++}
            `;
            
            params.push(parseInt(limit), offset);

            const result = await pool.query(query, params);

            const countQuery = `
                SELECT COUNT(*) 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE ${whereConditions.join(' AND ')}
            `;
            
            const countParams = params.slice(0, -2);
            const countResult = await pool.query(countQuery, countParams);
            const totalProducts = parseInt(countResult.rows[0].count);

            res.json({
                products: result.rows,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(totalProducts / limit),
                    total_products: totalProducts,
                    limit: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Get admin products error:', error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    getProductById: async (req, res) => {
        try {
            const { productId } = req.params;
            const pool = getPool();

            const result = await pool.query(`
                SELECT 
                    p.product_id, p.name, p.description, p.price, p.stock,
                    p.image_url, p.model_3d, p.images, p.colors, p.sizes, p.brand,
                    p.is_featured, p.is_new, p.discount_percent, p.created_at,
                    c.name as category_name, c.category_id,
                    AVG(CAST(r.rating as FLOAT)) as avg_rating,
                    COUNT(r.review_id) as review_count
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                LEFT JOIN reviews r ON p.product_id = r.product_id
                WHERE p.product_id = $1
                GROUP BY p.product_id, p.name, p.description, p.price, p.stock,
                         p.image_url, p.model_3d, p.images, p.colors, p.sizes, p.brand,
                         p.is_featured, p.is_new, p.discount_percent, p.created_at,
                         c.name, c.category_id
            `, [parseInt(productId)]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'S?n ph?m kh�ng t?n t?i' });
            }

            const reviews = await pool.query(`
                SELECT r.*, u.username, u.full_name
                FROM reviews r
                JOIN users u ON r.user_id = u.user_id
                WHERE r.product_id = $1
                ORDER BY r.created_at DESC
            `, [parseInt(productId)]);

            const product = result.rows[0];
            product.reviews = reviews.rows;

            res.json({ success: true, product });
        } catch (error) {
            console.error('Get product by id error:', error);
            res.status(500).json({ success: false, message: 'L?i server', error: error.message });
        }
    },

    getFeaturedProducts : async (req, res) => {
        try {
            const pool = getPool();
            const result = await pool.query(`
                SELECT 
                    p.product_id, p.name, p.price, p.image_url, p.model_3d, p.discount_percent,
                    p.brand, c.name as category_name, p.stock,
                    COALESCE(AVG(CAST(r.rating as FLOAT)), 0) as avg_rating,
                    COUNT(r.review_id) as review_count
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                LEFT JOIN reviews r ON p.product_id = r.product_id
                WHERE p.stock > 0 
                GROUP BY 
                    p.product_id, p.name, p.price, p.image_url, p.model_3d, p.discount_percent, 
                    p.brand, c.name, p.stock
                HAVING COUNT(r.review_id) > 0 OR AVG(CAST(r.rating as FLOAT)) >= 4
                ORDER BY 
                    (COUNT(r.review_id) * 0.3 + COALESCE(AVG(CAST(r.rating as FLOAT)), 0) * 0.7) DESC,
                    p.product_id DESC
                LIMIT 8
            `);

            const featuredProducts = result.rows.map(product => ({
                ...product,
                discount_percent: product.discount_percent || 0,
                avg_rating: Math.round(product.avg_rating * 10) / 10
            }));

            res.json({ products: featuredProducts, total: featuredProducts.length });
        } catch (error) {
            console.error('Get featured products error:', error);
            res.status(500).json({ message: 'Kh�ng th? t?i s?n ph?m n?i b?t', error: error.message });
        }
    },

    getNewProducts : async (req, res) => {
        try {
            const pool = getPool();
            const result = await pool.query(`
                SELECT 
                    p.product_id, p.name, p.price, p.image_url, p.model_3d, p.discount_percent,
                    p.brand, c.name as category_name, p.stock, p.created_at
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.stock > 0
                ORDER BY p.created_at DESC, p.product_id DESC
                LIMIT 8
            `);

            const newProducts = result.rows.map(product => ({
                ...product,
                discount_percent: product.discount_percent || 0
            }));

            res.json({ products: newProducts, total: newProducts.length });
        } catch (error) {
            console.error('Get new products error:', error);
            res.status(500).json({ message: 'Kh�ng th? t?i s?n ph?m m?i', error: error.message });
        }
    },

    createProduct: async (req, res) => {
        try {
            const {
                name, description, price, stock, category_id,
                image_url, images, colors, sizes, brand,
                is_featured, is_new, discount_percent
            } = req.body;

            const pool = getPool();
            const result = await pool.query(`
                INSERT INTO products (
                    name, description, price, stock, category_id, image_url,
                    images, colors, sizes, brand, is_featured, is_new, discount_percent
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
                )
                RETURNING product_id
            `, [
                name, description, price, stock, category_id, image_url,
                images ? JSON.stringify(images) : null,
                colors ? JSON.stringify(colors) : null,
                sizes ? JSON.stringify(sizes) : null,
                brand, is_featured || false, is_new || false, discount_percent || 0
            ]);

            res.status(201).json({
                message: 'T?o s?n ph?m th�nh c�ng',
                product_id: result.rows[0].product_id
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                name, description, price, stock, category_id,
                image_url, images, colors, sizes, brand,
                is_featured, is_new, discount_percent
            } = req.body;

            const pool = getPool();
            await pool.query(`
                UPDATE products 
                SET name = $1, description = $2, price = $3,
                    stock = $4, category_id = $5, image_url = $6,
                    images = $7, colors = $8, sizes = $9, brand = $10,
                    is_featured = $11, is_new = $12, 
                    discount_percent = $13, updated_at = NOW()
                WHERE product_id = $14
            `, [
                name, description, price, stock, category_id, image_url,
                images ? JSON.stringify(images) : null,
                colors ? JSON.stringify(colors) : null,
                sizes ? JSON.stringify(sizes) : null,
                brand, is_featured || false, is_new || false, discount_percent || 0,
                id
            ]);

            res.json({ message: 'C?p nh?t s?n ph?m th�nh c�ng' });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = getPool();

            await pool.query('DELETE FROM products WHERE product_id = $1', [id]);

            res.json({ message: 'X�a s?n ph?m th�nh c�ng' });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    addReview: async (req, res) => {
        try {
            const { productId, rating, comment } = req.body;
            const pool = getPool();

            const purchaseCheck = await pool.query(`
                SELECT COUNT(*) as count
                FROM order_details od
                JOIN orders o ON od.order_id = o.order_id
                WHERE o.user_id = $1 AND od.product_id = $2 
                AND o.status = 'delivered'
            `, [req.user.user_id, productId]);

            if (parseInt(purchaseCheck.rows[0].count) === 0) {
                return res.status(400).json({ message: 'B?n c?n mua s?n ph?m n�y tru?c khi d�nh gi�' });
            }

            const existingReview = await pool.query(
                'SELECT review_id FROM reviews WHERE user_id = $1 AND product_id = $2',
                [req.user.user_id, productId]
            );

            if (existingReview.rows.length > 0) {
                return res.status(400).json({ message: 'B?n d� d�nh gi� s?n ph?m n�y r?i' });
            }

            await pool.query(`
                INSERT INTO reviews (user_id, product_id, rating, comment)
                VALUES ($1, $2, $3, $4)
            `, [req.user.user_id, productId, rating, comment]);

            res.status(201).json({ message: 'Th�m d�nh gi� th�nh c�ng' });
        } catch (error) {
            console.error('Add review error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    }
};

module.exports = productController;

