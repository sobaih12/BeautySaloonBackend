const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /employees - List all employees
router.get('/users/employees', (req, res) => {
    const sql = "SELECT id, name, schedule FROM users WHERE role = 'employee'";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse schedule JSON
        const employees = rows.map(emp => ({
            ...emp,
            schedule: emp.schedule ? JSON.parse(emp.schedule) : []
        }));
        res.json({ employees });
    });
});

// GET /users/:id - Get specific user profile
router.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT id, name, username, role, schedule FROM users WHERE id = ?";
    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "User not found" });

        if (row.schedule) {
            row.schedule = JSON.parse(row.schedule);
        }
        res.json({ user: row });
    });
});

// PUT /users/:id - Update user (Profile / Schedule)
router.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, schedule } = req.body; // Can update name and schedule

    let sql = "UPDATE users SET name = ? WHERE id = ?";
    let params = [name, id];

    if (schedule) {
        sql = "UPDATE users SET name = ?, schedule = ? WHERE id = ?";
        params = [name, JSON.stringify(schedule), id];
    }

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Profile updated successfully" });
    });
});

module.exports = router;
