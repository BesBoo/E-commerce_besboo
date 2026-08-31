// server/controllers/contactController.js
const { getPool } = require('../config/db');

const contactController = {
    createContact: async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;
            if (!name || !email || !message) {
                return res.status(400).json({ message: 'Vui lòng di?n d?y d? thông tin b?t bu?c' });
            }
            res.status(201).json({ message: 'C?m on b?n dã liên h?. Chúng tôi s? ph?n h?i s?m nh?t.' });
        } catch (error) {
            res.status(500).json({ message: 'L?i server', error: error.message });
        }
    },
    getAllContacts: async (req, res) => { res.json([]); },
    getContactStats: async (req, res) => { res.json({}); },
    getContact: async (req, res) => { res.json({}); },
    updateContactStatus: async (req, res) => { res.json({}); },
    deleteContact: async (req, res) => { res.json({}); }
};
module.exports = contactController;
