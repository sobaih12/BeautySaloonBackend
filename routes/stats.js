const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/stats/daily', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const stats = {
        todayBookings: 0,
        activeEmployees: 0,
        employeePerformance: []
    };

    // 1. Today's Bookings Count
    db.get("SELECT count(*) as count FROM bookings WHERE date = ?", [today], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.todayBookings = row.count;

        // 2. Active Employees (Total count of employees)
        // Ideally checking who has bookings today or is scheduled, but simpler for light MVP: Total Employees
        db.get("SELECT count(*) as count FROM users WHERE role = 'employee'", [], (err, empRow) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.activeEmployees = empRow.count;

            // 3. Employee Performance (Completed Bookings Total)
            const perfSql = `
                SELECT u.name, count(b.id) as completed_count
                FROM users u
                LEFT JOIN bookings b ON u.id = b.employee_id AND b.status = 'completed'
                WHERE u.role = 'employee'
                GROUP BY u.id
            `;
            db.all(perfSql, [], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.employeePerformance = rows;

                res.json(stats);
            });
        });
    });
});

module.exports = router;
