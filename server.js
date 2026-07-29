// ============================================================
//  GYM MEMBERSHIP MANAGEMENT SYSTEM
//  Backend: Node.js + Express + MySQL2
//  Same HTML/CSS frontend — no changes to UI
// ============================================================

const express = require('express');
const mysql   = require('mysql2');
const session = require('express-session');
const path    = require('path');

const app  = express();
const PORT = 8080;

// ============================================================
//  DATABASE CONNECTION
// ============================================================
const db = mysql.createConnection({
    host    : 'localhost',
    port    : 3306,
    user    : 'root',
    password: 'Jai@2007',
    database: 'gym_management_system'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('Database connected successfully');
    initializeSchema();
});

// ============================================================
//  CREATE TABLES IF NOT EXIST
// ============================================================
function initializeSchema() {
    const queries = [
        `CREATE TABLE IF NOT EXISTS admin (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL
        )`,
        `INSERT INTO admin(username, password) VALUES('admin', 'Jai@2007')
         ON DUPLICATE KEY UPDATE password = VALUES(password)`,
        `CREATE TABLE IF NOT EXISTS members (
            member_id INT PRIMARY KEY AUTO_INCREMENT,
            full_name VARCHAR(100) NOT NULL,
            age INT,
            gender VARCHAR(20),
            phone_number VARCHAR(20) UNIQUE,
            email VARCHAR(100) UNIQUE,
            address VARCHAR(255),
            membership_plan VARCHAR(50),
            join_date VARCHAR(20),
            expiry_date VARCHAR(20),
            membership_status VARCHAR(20)
        )`,
        `CREATE TABLE IF NOT EXISTS attendance (
            attendance_id INT PRIMARY KEY AUTO_INCREMENT,
            member_id INT,
            attendance_date VARCHAR(20),
            check_in_time VARCHAR(20),
            attendance_status VARCHAR(20)
        )`,
        `CREATE TABLE IF NOT EXISTS payments (
            payment_id INT PRIMARY KEY AUTO_INCREMENT,
            member_id INT,
            amount DOUBLE,
            payment_date VARCHAR(20),
            payment_method VARCHAR(50),
            payment_status VARCHAR(20)
        )`
    ];

    queries.forEach(sql => {
        db.query(sql, (err) => {
            if (err) console.error('Schema error:', err.message);
        });
    });

    // Insert default trainers if not exists
    const trainerInsert = `INSERT IGNORE INTO trainers (trainer_name, specialization, phone_number, email, experience) VALUES
        ('Arun',    'Body Building', '9876543210', 'arun@gym.com',    5),
        ('Karthik', 'Weight Loss',   '9876543211', 'karthik@gym.com', 4),
        ('Vijay',   'Fitness',       '9876543212', 'vijay@gym.com',   6),
        ('Rahul',   'Yoga',          '9876543213', 'rahul@gym.com',   3)`;
    db.query(trainerInsert, (err) => {
        if (err) console.error('Trainer insert error:', err.message);
    });

    console.log('Schema initialized');
}

// ============================================================
//  MIDDLEWARE
// ============================================================
app.use(express.urlencoded({ extended: true }));  // parse form data
app.use(express.json());                           // parse JSON

// Session setup
app.use(session({
    secret: 'gym_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 }  // 30 minutes
}));

// Serve static files from html/, css/, images/, web/
app.use('/css',    express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'html')));
// Serve app.js from web/ folder at /app.js
app.use(express.static(path.join(__dirname, 'web')));

// ============================================================
//  ROOT → login.html
// ============================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'login.html'));
});

// ============================================================
//  SESSION INFO — returns logged in username
//  GET /api/session
// ============================================================
app.get('/api/session', (req, res) => {
    res.json({ username: req.session.admin || 'Admin' });
});


//  GET /api/stats
// ============================================================
app.get('/api/stats', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    let stats = { totalMembers: 0, totalPayments: 0, todayAttendance: 0, activeMembers: 0 };
    let done = 0;
    const check = () => { if (++done === 4) res.json(stats); };

    db.query('SELECT COUNT(*) AS c FROM members', (e, r) => {
        if (!e) stats.totalMembers = r[0].c; check();
    });
    db.query('SELECT COUNT(*) AS c FROM payments', (e, r) => {
        if (!e) stats.totalPayments = r[0].c; check();
    });
    db.query('SELECT COUNT(*) AS c FROM attendance WHERE attendance_date = ?', [today], (e, r) => {
        if (!e) stats.todayAttendance = r[0].c; check();
    });
    db.query("SELECT COUNT(*) AS c FROM members WHERE membership_status = 'Active'", (e, r) => {
        if (!e) stats.activeMembers = r[0].c; check();
    });
});

//  POST /api/login
// ============================================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query(
        'SELECT * FROM admin WHERE username = ? AND password = ?',
        [username, password],
        (err, results) => {
            if (err) return res.json({ success: false, message: 'Database error' });
            if (results.length > 0) {
                req.session.admin = username;
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Invalid Username or Password' });
            }
        }
    );
});

// ============================================================
//  MODULE 2 — ADMIN REGISTRATION
//  POST /api/register
// ============================================================
app.post('/api/register', (req, res) => {
    const { fullname, username, password, confirmPassword } = req.body;
    if (!username || !password || !fullname)
        return res.json({ success: false, message: 'All fields are required' });
    if (password !== confirmPassword)
        return res.json({ success: false, message: 'Passwords do not match' });
    db.query('INSERT INTO admin(username, password) VALUES(?, ?)', [username.trim(), password], (err) => {
        if (err) return res.json({ success: false, message: 'Username already exists' });
        res.json({ success: true });
    });
});

// ============================================================
//  MODULE 3 — ADD MEMBER
//  POST /api/members
// ============================================================
app.post('/api/members', (req, res) => {
    const { name, age, gender, phone, email, address, plan, joinDate, expiryDate } = req.body;
    db.query(
        `INSERT INTO members (full_name, age, gender, phone_number, email, address, membership_plan, join_date, expiry_date, membership_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
        [name, parseInt(age), gender, phone, email, address, plan, joinDate, expiryDate],
        (err) => {
            if (err) return res.json({ success: false, message: 'Phone or Email already exists' });
            res.json({ success: true });
        }
    );
});

// ============================================================
//  MODULE 4 — MEMBER LIST
//  GET /api/member-list
// ============================================================
app.get('/api/member-list', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM members', (err, countResult) => {
        const total = err ? 0 : countResult[0].total;

        db.query(
            `SELECT member_id, full_name, age, gender, phone_number, email,
                    membership_plan, join_date, expiry_date, membership_status
             FROM members ORDER BY member_id DESC`,
            (err, rows) => {
                let tableRows = '';
                if (!err && rows.length > 0) {
                    rows.forEach(r => {
                        const statusClass = r.membership_status === 'Active' ? 'status-active' : 'status-inactive';
                        tableRows += `
                        <tr>
                            <td>${r.member_id}</td>
                            <td>${esc(r.full_name)}</td>
                            <td>${r.age}</td>
                            <td>${esc(r.gender)}</td>
                            <td>${esc(r.phone_number)}</td>
                            <td>${esc(r.email)}</td>
                            <td>${esc(r.membership_plan)}</td>
                            <td>${formatDate(r.join_date)}</td>
                            <td>${formatDate(r.expiry_date)}</td>
                            <td><span class="${statusClass}">${esc(r.membership_status)}</span></td>
                            <td>
                                <a class="btn-edit" href="/edit-member.html?id=${r.member_id}">Edit</a>
                                <button class="btn-delete" onclick="confirmDelete(${r.member_id},'${esc(r.full_name)}')">Delete</button>
                            </td>
                        </tr>`;
                    });
                } else {
                    tableRows = `<tr><td colspan="11" style="text-align:center;color:#888;padding:20px;">No members found.</td></tr>`;
                }

                res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Member List</title>
    <meta charset="UTF-8">
    <link rel="icon" type="image/avif" href="/images/gym_management_logo.avif">
    <link rel="stylesheet" href="/css/memberlist.css">
</head>
<body>
    <div class="header"><h2>GYM MEMBERSHIP MANAGEMENT</h2></div>
    <div class="list-box">
        <h3>Member List</h3>
        <div class="top-buttons">
            <a href="/dashboard.html" class="btn-back">&#8592; Back to Dashboard</a>
            <div class="search-bar">
                <input type="text" id="searchInput" onkeyup="searchTable()" placeholder="Search by name, phone, email...">
            </div>
        </div>
        <p class="total">Total Members: <strong>${total}</strong></p>
        <div class="table-wrap">
        <table id="memberTable">
            <tr>
                <th>ID</th><th>Name</th><th>Age</th><th>Gender</th>
                <th>Phone</th><th>Email</th><th>Plan</th>
                <th>Join Date</th><th>Expiry Date</th><th>Status</th><th>Actions</th>
            </tr>
            ${tableRows}
        </table>
        </div>
    </div>
    <script>
        function searchTable() {
            var input = document.getElementById('searchInput').value.toLowerCase();
            var rows = document.querySelectorAll('#memberTable tr');
            for (var i = 1; i < rows.length; i++) {
                rows[i].style.display = rows[i].innerText.toLowerCase().includes(input) ? '' : 'none';
            }
        }
        function confirmDelete(id, name) {
            if (confirm('Delete member: ' + name + '?\\nThis cannot be undone.')) {
                window.location.href = '/api/member-delete?id=' + id;
            }
        }
    </script>
</body>
</html>`);
            }
        );
    });
});

// ============================================================
//  EDIT MEMBER — GET member by ID
//  GET /api/member/:id
// ============================================================
app.get('/api/member/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.query(
        'SELECT * FROM members WHERE member_id = ?', [id],
        (err, rows) => {
            if (err || rows.length === 0)
                return res.json({ success: false, message: 'Member not found' });
            const m = rows[0];
            // Format date fields so they work with HTML date inputs (YYYY-MM-DD)
            m.join_date    = formatDate(m.join_date);
            m.expiry_date  = formatDate(m.expiry_date);
            res.json({ success: true, member: m });
        }
    );
});

// ============================================================
//  EDIT MEMBER — UPDATE member
//  POST /api/member-update
// ============================================================
app.post('/api/member-update', (req, res) => {
    const { memberId, name, age, gender, phone, email, address, plan, joinDate, expiryDate, status } = req.body;
    db.query(
        `UPDATE members SET
            full_name = ?, age = ?, gender = ?, phone_number = ?,
            email = ?, address = ?, membership_plan = ?,
            join_date = ?, expiry_date = ?, membership_status = ?
         WHERE member_id = ?`,
        [name, parseInt(age), gender, phone, email, address, plan, joinDate, expiryDate, status, parseInt(memberId)],
        (err) => {
            if (err) return res.json({ success: false, message: err.message });
            res.json({ success: true });
        }
    );
});

//  GET /api/member-delete?id=X
// ============================================================
app.get('/api/member-delete', (req, res) => {
    const id = parseInt(req.query.id);
    if (!id || isNaN(id)) return res.redirect('/api/member-list');

    // Delete related records first to avoid foreign key constraint errors
    db.query('DELETE FROM attendance WHERE member_id = ?', [id], () => {
        db.query('DELETE FROM payments WHERE member_id = ?', [id], () => {
            db.query('DELETE FROM trainer_assignments WHERE member_id = ?', [id], () => {
                db.query('DELETE FROM members WHERE member_id = ?', [id], (err) => {
                    if (err) console.error('Delete error:', err.message);
                    res.redirect('/api/member-list');
                });
            });
        });
    });
});

// ============================================================
//  MODULE 6 — ATTENDANCE
//  POST /api/attendance
// ============================================================
app.post('/api/attendance', (req, res) => {
    const { memberId, date, checkInTime, status } = req.body;
    db.query(
        `INSERT INTO attendance (member_id, attendance_date, check_in_time, attendance_status) VALUES (?, ?, ?, ?)`,
        [parseInt(memberId), date, checkInTime, status],
        (err) => {
            if (err) return res.json({ success: false, message: 'Failed to save attendance' });
            res.json({ success: true });
        }
    );
});

// ============================================================
//  MODULE 7 — PAYMENT
//  POST /api/payments
// ============================================================
app.post('/api/payments', (req, res) => {
    const { memberId, amount, paymentDate, paymentMethod } = req.body;
    db.query(
        `INSERT INTO payments (member_id, amount, payment_date, payment_method, payment_status) VALUES (?, ?, ?, ?, 'Paid')`,
        [parseInt(memberId), parseFloat(amount), paymentDate, paymentMethod],
        (err) => {
            if (err) return res.json({ success: false, message: 'Failed to save payment' });
            res.json({ success: true });
        }
    );
});

// ============================================================
//  MODULE 8 — TRAINER ASSIGNMENT
//  POST /api/trainers
// ============================================================
app.post('/api/trainers', (req, res) => {
    const { memberId, memberName, trainer, specialization, assignedDate } = req.body;

    db.query(
        'SELECT trainer_id FROM trainers WHERE trainer_name = ? LIMIT 1',
        [trainer],
        (err, results) => {
            if (err || results.length === 0) {
                return res.json({ success: false, message: 'Trainer not found in database' });
            }
            const trainerId = results[0].trainer_id;
            db.query(
                `INSERT INTO trainer_assignments (member_id, trainer_id, assigned_date) VALUES (?, ?, ?)`,
                [parseInt(memberId), trainerId, assignedDate],
                (err2) => {
                    if (err2) return res.json({ success: false, message: 'Failed to assign trainer' });
                    res.json({ success: true });
                }
            );
        }
    );
});

// ============================================================
//  MODULE 9 — REPORT
//  GET /api/report
// ============================================================
app.get('/api/report', (req, res) => {
    const sql = `
        SELECT m.member_id, m.full_name, m.membership_plan, m.membership_status,
            IFNULL((
                SELECT t.trainer_name FROM trainers t
                INNER JOIN trainer_assignments ta ON t.trainer_id = ta.trainer_id
                WHERE ta.member_id = m.member_id LIMIT 1
            ), '-') AS trainer_name,
            IFNULL((
                SELECT p.payment_status FROM payments p
                WHERE p.member_id = m.member_id
                ORDER BY p.payment_id DESC LIMIT 1
            ), '-') AS payment_status
        FROM members m
        ORDER BY m.member_id`;

    db.query(sql, (err, rows) => {
        let tableRows = '';
        if (!err && rows.length > 0) {
            rows.forEach(r => {
                tableRows += `
                <tr>
                    <td>${r.member_id}</td>
                    <td>${esc(r.full_name)}</td>
                    <td>${esc(r.membership_plan)}</td>
                    <td>${esc(r.trainer_name)}</td>
                    <td>${esc(r.payment_status)}</td>
                    <td>${esc(r.membership_status)}</td>
                </tr>`;
            });
        } else {
            tableRows = `<tr><td colspan="6" style="text-align:center;color:#888;padding:20px;">No data found.</td></tr>`;
        }

        res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Reports</title>
    <link rel="icon" type="image/avif" href="/images/gym_management_logo.avif">
    <link rel="stylesheet" href="/css/report.css">
</head>
<body>
    <div class="header"><h2>GYM MEMBERSHIP MANAGEMENT</h2></div>
    <div class="report-box">
        <h3>Member Report</h3>
        <table>
            <tr>
                <th>Member ID</th><th>Name</th><th>Plan</th>
                <th>Trainer</th><th>Payment</th><th>Status</th>
            </tr>
            ${tableRows}
        </table>
        <div class="buttons">
            <button onclick="window.print()">Print Report</button>
            <button onclick="location.href='/dashboard.html'">Back</button>
        </div>
    </div>
</body>
</html>`);
    });
});

// ============================================================
//  HELPER — format date safely
// ============================================================
function formatDate(val) {
    if (!val) return '-';
    // If it's a Date object, format it as YYYY-MM-DD
    if (val instanceof Date) {
        return val.toISOString().split('T')[0];
    }
    // If it's a string, return as-is
    return String(val);
}


function esc(str) {
    if (str == null) return '-';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ============================================================
//  START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log('');
    console.log('============================================');
    console.log(' GYM MEMBERSHIP MANAGEMENT SYSTEM');
    console.log(' Node.js + Express + MySQL');
    console.log('============================================');
    console.log(` Server running at: http://localhost:${PORT}`);
    console.log(' Login: admin / Jai@2007');
    console.log('============================================');
    console.log('');
});
