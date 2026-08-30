// server/controllers/categoryController.js
const { getPool } = require('../config/db');

const categoryController = {
    getAllCategories: async (req, res) => {
        try {
            const pool = getPool();
            const result = await pool.query(`
                SELECT 
                    c.category_id,
                    c.name,
                    c.description,
                    c.image_url,
                    COUNT(p.product_id) as product_count
                FROM categories c
                LEFT JOIN products p ON c.category_id = p.category_id AND p.stock > 0
                GROUP BY c.category_id, c.name, c.description, c.image_url
                ORDER BY c.name ASC
            `);

            res.json({
                success: true,
                categories: result.rows
            });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ 
                success: false,
                message: 'L?i server khi l?y danh sách danh m?c', 
                error: error.message 
            });
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = getPool();

            const result = await pool.query(`
                SELECT * FROM categories 
                WHERE category_id = $1
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Danh m?c không t?n t?i' });
            }

            res.json({ category: result.rows[0] });
        } catch (error) {
            console.error('Get category error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    }
};

module.exports = categoryController;
