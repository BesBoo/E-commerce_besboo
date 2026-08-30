// server/controllers/promotionController.js
const { getPool } = require('../config/db');

const promotionController = {
    checkPromotion: async (req, res) => {
        try {
            const { code, order_amount } = req.body;

            if (!code) {
                return res.status(400).json({ message: 'Vui lòng nh?p mã khuy?n mãi' });
            }

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
            res.json({ promotions: result.rows });
        } catch (error) {
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    }
};

module.exports = promotionController;
