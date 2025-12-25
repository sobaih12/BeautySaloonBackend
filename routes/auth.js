const express = require('express');
const router = express.Router();
const db = require('../database');

// Login Endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!user) {
            return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
        }

        // Simple password check (for MVP)
        if (user.password !== password) {
            return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
        }

        // Return user info (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        res.json({ message: "Login successful", user: userWithoutPassword });
    });
});

// Register Endpoint
router.post('/register', (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    // Check if username exists
    db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ error: "اسم المستخدم موجود مسبقاً" });

        // Insert new customer
        const sql = `INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, 'customer')`;
        db.run(sql, [name, username, password], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Return user info
            res.json({
                message: "Registration successful",
                user: { id: this.lastID, name, username, role: 'customer' }
            });
        });
    });
});

module.exports = router;
