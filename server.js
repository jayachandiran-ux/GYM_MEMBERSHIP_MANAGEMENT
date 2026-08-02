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
const PORT = process.env.PORT || 8080;

// ============================================================
//  DATABASE CONNECTION
// ============================================================
const db = mysql.createConnection({
    host    : process.env.DB_HOST     || 'localhost',
    port    : process.env.DB_PORT     || 3306,
    user    : process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || 'Jai@2007',
    database: process.env.DB_NAME     || 'gym_management_system',
    ssl     : process.env.DB_HOST ? { rejectUnauthorized: false } : false
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
    <div class="header"><h2><img src="/images/gym_management_logo.avif" alt="" style="width:26px;height:26px;object-fit:contain;border-radius:4px;vertical-align:middle;margin-right:8px;background:rgba(255,255,255,0.1);padding:2px;">GYM MEMBERSHIP MANAGEMENT</h2></div>
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
//  TODAY'S ATTENDANCE VIEW
//  GET /api/today-attendance
// ============================================================
app.get('/api/today-attendance', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const sql = `
        SELECT a.attendance_id, a.member_id, m.full_name,
               a.attendance_date, a.check_in_time, a.attendance_status
        FROM attendance a
        LEFT JOIN members m ON a.member_id = m.member_id
        WHERE a.attendance_date = ?
        ORDER BY a.attendance_id DESC`;

    db.query(sql, [today], (err, rows) => {
        let tableRows = '';
        if (!err && rows.length > 0) {
            rows.forEach(r => {
                const statusColor = r.attendance_status === 'Present' ? '#2e7d32' : '#c62828';
                const statusBg    = r.attendance_status === 'Present' ? '#e8f5e9' : '#ffebee';
                tableRows += `
                <tr>
                    <td>${r.attendance_id}</td>
                    <td>${r.member_id}</td>
                    <td>${esc(r.full_name) || '-'}</td>
                    <td>${esc(r.attendance_date)}</td>
                    <td>${esc(r.check_in_time)}</td>
                    <td><span style="color:${statusColor};background:${statusBg};padding:3px 10px;border-radius:12px;font-weight:bold;">${esc(r.attendance_status)}</span></td>
                </tr>`;
            });
        } else if (!err && rows.length === 0) {
            tableRows = `<tr><td colspan="6" style="text-align:center;color:#888;padding:20px;">No attendance records for today (${today})</td></tr>`;
        } else {
            tableRows = `<tr><td colspan="6" style="color:red;text-align:center;">Error: ${err.message}</td></tr>`;
        }

        res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Today's Attendance</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/avif" href="/images/gym_management_logo.avif">
    <link rel="stylesheet" href="/css/report.css">
    <style>
        .back-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
        .back-btn { background:#1a1a2e; color:white; border:none; padding:9px 18px; border-radius:8px; cursor:pointer; font-size:13px; text-decoration:none; }
        .back-btn:hover { background:#333; }
        .today-badge { background:#e05500; color:white; padding:5px 14px; border-radius:20px; font-size:13px; font-weight:bold; }
        .count-info { font-size:13px; color:#888; margin-bottom:12px; }
    </style>
</head>
<body>
    <div class="header"><h2><img src="/images/gym_management_logo.avif" alt="" style="width:26px;height:26px;object-fit:contain;border-radius:4px;vertical-align:middle;margin-right:8px;background:rgba(255,255,255,0.1);padding:2px;">GYM MEMBERSHIP MANAGEMENT</h2></div>
    <div class="report-box">
        <div class="back-bar">
            <h3 style="margin:0;">📋 Today's Attendance</h3>
            <span class="today-badge">${today}</span>
        </div>
        <p class="count-info">Total records: <strong>${rows ? rows.length : 0}</strong></p>
        <table>
            <tr>
                <th>#</th>
                <th>Member ID</th>
                <th>Member Name</th>
                <th>Date</th>
                <th>Check-in Time</th>
                <th>Status</th>
            </tr>
            ${tableRows}
        </table>
        <div class="buttons" style="margin-top:20px;">
            <button onclick="location.href='/dashboard.html'">← Back to Dashboard</button>
            <button onclick="window.print()">🖨 Print</button>
        </div>
    </div>
</body>
</html>`);
    });
});

//  POST /api/attendance
// ============================================================
app.post('/api/attendance', (req, res) => {
    const { memberId, date, checkInTime, status } = req.body;
    db.query(
        `INSERT INTO attendance (member_id, attendance_date, check_in_time, attendance_status) VALUES (?, ?, ?, ?)`,
        [parseInt(memberId), date, checkInTime, status],
        (err) => {
            if (err) return res.json({ success: false, message: 'Failed to save attendance' });
            // Fetch member name to return in success response
            db.query('SELECT full_name FROM members WHERE member_id = ?', [parseInt(memberId)], (e2, rows) => {
                const memberName = (!e2 && rows.length > 0) ? rows[0].full_name : null;
                res.json({ success: true, memberName });
            });
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
    <div class="header"><h2><img src="/images/gym_management_logo.avif" alt="" style="width:26px;height:26px;object-fit:contain;border-radius:4px;vertical-align:middle;margin-right:8px;background:rgba(255,255,255,0.1);padding:2px;">GYM MEMBERSHIP MANAGEMENT</h2></div>
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
//  PAYMENT HISTORY
//  GET /api/payment-history
// ============================================================
app.get('/api/payment-history', (req, res) => {
    const sql = `
        SELECT p.payment_id, p.member_id, m.full_name,
               p.amount, p.payment_date, p.payment_method, p.payment_status
        FROM payments p
        LEFT JOIN members m ON p.member_id = m.member_id
        ORDER BY p.payment_id DESC`;

    db.query(sql, (err, rows) => {
        let tableRows = '';
        let totalAmount = 0.0;
        if (!err && rows.length > 0) {
            rows.forEach(r => {
                const statusColor = r.payment_status === 'Paid' ? '#2e7d32' : '#c62828';
                const statusBg    = r.payment_status === 'Paid' ? '#e8f5e9' : '#ffebee';
                totalAmount += parseFloat(r.amount) || 0;
                tableRows += `
                <tr>
                    <td>${r.payment_id}</td>
                    <td>${r.member_id}</td>
                    <td>${esc(r.full_name) || '-'}</td>
                    <td>₹${parseFloat(r.amount || 0).toFixed(2)}</td>
                    <td>${formatDate(r.payment_date)}</td>
                    <td>${esc(r.payment_method)}</td>
                    <td><span style="color:${statusColor};background:${statusBg};padding:3px 10px;border-radius:12px;font-weight:bold;">${esc(r.payment_status)}</span></td>
                </tr>`;
            });
        } else if (!err) {
            tableRows = `<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">No payment records found.</td></tr>`;
        } else {
            tableRows = `<tr><td colspan="7" style="color:red;text-align:center;">Error: ${err.message}</td></tr>`;
        }

        res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Payment History</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/avif" href="/images/gym_management_logo.avif">
    <link rel="stylesheet" href="/css/report.css">
    <style>
        .back-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
        .back-btn { background:#1a1a2e; color:white; border:none; padding:9px 18px; border-radius:8px; cursor:pointer; font-size:13px; text-decoration:none; }
        .back-btn:hover { background:#333; }
        .summary-bar { display:flex; gap:24px; margin-bottom:14px; flex-wrap:wrap; }
        .summary-item { background:#f4f5f7; border-radius:8px; padding:9px 18px; font-size:13px; color:#555; }
        .summary-item strong { color:#1a1a2e; font-size:15px; }
    </style>
</head>
<body>
    <div class="header"><h2><img src="/images/gym_management_logo.avif" alt="" style="width:26px;height:26px;object-fit:contain;border-radius:4px;vertical-align:middle;margin-right:8px;background:rgba(255,255,255,0.1);padding:2px;">GYM MEMBERSHIP MANAGEMENT</h2></div>
    <div class="report-box">
        <div class="back-bar">
            <h3 style="margin:0;">💰 Payment History</h3>
        </div>
        <div class="summary-bar">
            <div class="summary-item">Total Records: <strong>${rows ? rows.length : 0}</strong></div>
            <div class="summary-item">Total Amount: <strong>₹${totalAmount.toFixed(2)}</strong></div>
        </div>
        <table>
            <tr>
                <th>Payment ID</th>
                <th>Member ID</th>
                <th>Member Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
            </tr>
            ${tableRows}
        </table>
        <div class="buttons" style="margin-top:20px;">
            <button onclick="location.href='/dashboard.html'">← Back to Dashboard</button>
            <button onclick="window.print()">🖨 Print</button>
        </div>
    </div>
</body>
</html>`);
    });
});

// ============================================================
//  ACTIVE MEMBERS
//  GET /api/active-members
// ============================================================
app.get('/api/active-members', (req, res) => {
    db.query("SELECT COUNT(*) AS total FROM members WHERE membership_status = 'Active'", (err, countResult) => {
        const total = err ? 0 : countResult[0].total;

        db.query(
            `SELECT member_id, full_name, age, gender, phone_number, email,
                    membership_plan, join_date, expiry_date, membership_status
             FROM members WHERE membership_status = 'Active' ORDER BY member_id DESC`,
            (err2, rows) => {
                let tableRows = '';
                if (!err2 && rows.length > 0) {
                    rows.forEach(r => {
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
                            <td><span style="color:#2e7d32;background:#e8f5e9;padding:3px 10px;border-radius:12px;font-weight:bold;">Active</span></td>
                        </tr>`;
                    });
                } else {
                    tableRows = `<tr><td colspan="10" style="text-align:center;color:#888;padding:20px;">No active members found.</td></tr>`;
                }

                res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Active Members</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/avif" href="/images/gym_management_logo.avif">
    <link rel="stylesheet" href="/css/memberlist.css">
    <style>
        .back-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .active-badge { background:#2e7d32; color:white; padding:5px 14px; border-radius:20px; font-size:13px; font-weight:bold; }
    </style>
</head>
<body>
    <div class="header"><h2><img src="/images/gym_management_logo.avif" alt="" style="width:26px;height:26px;object-fit:contain;border-radius:4px;vertical-align:middle;margin-right:8px;background:rgba(255,255,255,0.1);padding:2px;">GYM MEMBERSHIP MANAGEMENT</h2></div>
    <div class="list-box">
        <div class="back-bar">
            <h3>🏃 Active Members</h3>
            <span class="active-badge">Active Only</span>
        </div>
        <div class="top-buttons">
            <a href="/dashboard.html" class="btn-back">&#8592; Back to Dashboard</a>
            <div class="search-bar">
                <input type="text" id="searchInput" onkeyup="searchTable()" placeholder="Search by name, phone, email...">
            </div>
        </div>
        <p class="total">Active Members: <strong>${total}</strong></p>
        <div class="table-wrap">
        <table id="memberTable">
            <tr>
                <th>ID</th><th>Name</th><th>Age</th><th>Gender</th>
                <th>Phone</th><th>Email</th><th>Plan</th>
                <th>Join Date</th><th>Expiry Date</th><th>Status</th>
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
    </script>
</body>
</html>`);
            }
        );
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

