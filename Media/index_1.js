const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./attendance.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the SQLite database.');
});

// Create Users Table
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
`);

// Create Attendance Table
db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
    )
`);

module.exports = db;

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Add User
router.post('/add', (req, res) => {
    const { name } = req.body;
    db.run(`INSERT INTO users (name) VALUES (?)`, [name], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name });
    });
});

// List Users
router.get('/', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;

const express = require('express');
const blocServer = express.Router();
const database = require('../db/database');

// Mark Attendance
router.post('/mark', (req, res) => {
    const { userId, date, status } = req.body;
    db.run(`INSERT INTO attendance (userId, date, status) VALUES (?, ?, ?)`, [userId, date, status], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, userId, date, status });
    });
});

// Get Attendance by User
router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    db.all(`SELECT * FROM attendance WHERE userId = ?`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
