// server/controllers/promotionController.js
const { getPool } = require('../config/db');
const { validationResult } = require('express-validator');

const promotionController = {
    getActivePromotions: async (req, res) => {
        try {
            const pool = getPool();
            const result = await pool.query(`
                SELECT * FROM promotions 
                WHERE is_active = TRUE
                AND (start_date IS NULL OR start_date <= NOW())
                AND (end_date IS NULL OR end_date >= NOW())
                ORDER BY created_at DESC
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('L?i khi l?y khuy?n mãi:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    validatePromotion: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { code, order_amount } = req.body;
            const pool = getPool();
            
            const result = await pool.query(`
                SELECT * FROM promotions 
                WHERE code = $1 AND is_active = TRUE
                AND (start_date IS NULL OR start_date <= NOW())
                AND (end_date IS NULL OR end_date >= NOW())
            `, [code]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Mã khuy?n mãi không h?p l? ho?c dã h?t h?n' });
            }

            const promotion = result.rows[0];

            if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
                return res.status(400).json({ message: 'Mã khuy?n mãi dã h?t lu?t s? d?ng' });
            }

            if (order_amount && order_amount < promotion.min_order_amount) {
                return res.status(400).json({ 
                    message: `Ðon hàng t?i thi?u d? áp d?ng là ${promotion.min_order_amount}d` 
                });
            }

            let discount_amount = 0;
            if (promotion.discount_type === 'percent') {
                discount_amount = Math.floor(order_amount * (promotion.discount_value / 100));
            } else {
                discount_amount = promotion.discount_value;
            }

            res.json({
                message: 'Áp d?ng mã khuy?n mãi thành công',
                promotion: {
                    code: promotion.code,
                    discount_type: promotion.discount_type,
                    discount_value: promotion.discount_value,
                    discount_amount: discount_amount
                }
            });
        } catch (error) {
            console.error('Check promotion error:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    getAllPromotions: async (req, res) => {
        try {
            const pool = getPool();
            const result = await pool.query('SELECT * FROM promotions ORDER BY created_at DESC');
            res.json(result.rows);
        } catch (error) {
            console.error('L?i khi l?y danh sách khuy?n mãi:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    createPromotion: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const pool = getPool();
            const { code, discount_type, discount_value, min_order_amount, usage_limit, start_date, end_date, description } = req.body;
            
            const result = await pool.query(`
                INSERT INTO promotions (code, discount_type, discount_value, min_order_amount, usage_limit, start_date, end_date, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [code, discount_type, discount_value, min_order_amount, usage_limit, start_date, end_date, description]);
            
            res.status(201).json({ message: 'T?o mã khuy?n mãi thành công', promotion: result.rows[0] });
        } catch (error) {
            console.error('L?i khi t?o khuy?n mãi:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    updatePromotion: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const pool = getPool();
            const { code, discount_type, discount_value, min_order_amount, usage_limit, start_date, end_date, is_active, description } = req.body;
            const { id } = req.params;

            const result = await pool.query(`
                UPDATE promotions
                SET code = $1, discount_type = $2, discount_value = $3, min_order_amount = $4, usage_limit = $5, start_date = $6, end_date = $7, is_active = $8, description = $9
                WHERE promotion_id = $10
                RETURNING *
            `, [code, discount_type, discount_value, min_order_amount, usage_limit, start_date, end_date, is_active, description, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Không tìm th?y mã khuy?n mãi' });
            }

            res.json({ message: 'C?p nh?t thành công', promotion: result.rows[0] });
        } catch (error) {
            console.error('L?i khi c?p nh?t khuy?n mãi:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },

    deletePromotion: async (req, res) => {
        try {
            const pool = getPool();
            const { id } = req.params;
            
            const result = await pool.query(`
                DELETE FROM promotions
                WHERE promotion_id = $1
                RETURNING *
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Không tìm th?y mã khuy?n mãi' });
            }

            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            console.error('L?i khi xóa khuy?n mãi:', error);
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    }
};

module.exports = promotionController;
