// ============================================================
//  GYM MEMBERSHIP MANAGEMENT - Frontend JavaScript
//  Connects all HTML forms to Node.js backend using fetch()
//  No Tomcat. No Servlet. Pure JS ↔ Express API.
// ============================================================

// ============================================================
//  UTILITY — submit any form as JSON via fetch
// ============================================================
function submitForm(formId, apiUrl, onSuccess, onError) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // stop normal HTML form submit

        // Collect all form fields into an object
        const data = {};
        new FormData(form).forEach((value, key) => {
            data[key] = value;
        });

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                onSuccess(result);
            } else {
                onError(result.message || 'Something went wrong');
            }
        })
        .catch(() => onError('Server error. Please try again.'));
    });
}

// ============================================================
//  SHOW / HIDE messages
// ============================================================
function showError(msg) {
    let el = document.getElementById('msg');
    if (!el) {
        el = document.createElement('p');
        el.id = 'msg';
        el.style.cssText = 'color:red;text-align:center;margin:10px 0;font-weight:bold;';
        const box = document.querySelector('.login-box, .member-box, .attendance-box, .payment-box, .trainer-box, .register-box');
        if (box) box.insertBefore(el, box.children[1]);
    }
    el.style.color = 'red';
    el.textContent = msg;
}

function showSuccess(msg) {
    let el = document.getElementById('msg');
    if (!el) {
        el = document.createElement('p');
        el.id = 'msg';
        el.style.cssText = 'color:green;text-align:center;margin:10px 0;font-weight:bold;';
        const box = document.querySelector('.login-box, .member-box, .attendance-box, .payment-box, .trainer-box, .register-box');
        if (box) box.insertBefore(el, box.children[1]);
    }
    el.style.color = 'green';
    el.textContent = msg;
}

// ============================================================
//  PAGE: login.html
// ============================================================
if (document.getElementById('loginForm')) {
    submitForm('loginForm', '/api/login',
        (res) => { window.location.href = '/dashboard.html'; },
        (msg) => { showError('Invalid Username or Password'); }
    );
}

// ============================================================
//  PAGE: register.html
// ============================================================
if (document.getElementById('registerForm')) {
    submitForm('registerForm', '/api/register',
        (res) => {
            showSuccess('Admin registered successfully! Redirecting to login...');
            setTimeout(() => window.location.href = '/login.html', 1500);
        },
        (msg) => { showError(msg); }
    );
}

// ============================================================
//  PAGE: add-member.html
// ============================================================
if (document.getElementById('memberForm')) {
    submitForm('memberForm', '/api/members',
        (res) => {
            showSuccess('Member added successfully!');
            setTimeout(() => window.location.href = '/dashboard.html', 1200);
        },
        (msg) => { showError(msg || 'Failed to add member. Phone or Email may already exist.'); }
    );
}

// ============================================================
//  PAGE: attendance.html
// ============================================================
if (document.getElementById('attendanceForm')) {
    submitForm('attendanceForm', '/api/attendance',
        (res) => {
            showSuccess('Attendance saved successfully!');
            setTimeout(() => window.location.href = '/dashboard.html', 1200);
        },
        (msg) => { showError(msg || 'Failed to save attendance. Please check the Member ID.'); }
    );
}

// ============================================================
//  PAGE: payment.html
// ============================================================
if (document.getElementById('paymentForm')) {
    submitForm('paymentForm', '/api/payments',
        (res) => {
            showSuccess('Payment saved successfully!');
            setTimeout(() => window.location.href = '/dashboard.html', 1200);
        },
        (msg) => { showError(msg || 'Failed to save payment. Please check the Member ID.'); }
    );
}

// ============================================================
//  PAGE: trainer.html
// ============================================================
if (document.getElementById('trainerForm')) {
    submitForm('trainerForm', '/api/trainers',
        (res) => {
            showSuccess('Trainer assigned successfully!');
            setTimeout(() => window.location.href = '/dashboard.html', 1200);
        },
        (msg) => { showError(msg || 'Failed to assign trainer. Please check the Member ID.'); }
    );
}

// ============================================================
//  SEARCH — member list page
// ============================================================
function searchTable() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('#memberTable tr');
    for (let i = 1; i < rows.length; i++) {
        rows[i].style.display = rows[i].innerText.toLowerCase().includes(filter) ? '' : 'none';
    }
}

// ============================================================
//  DELETE confirm — member list page
// ============================================================
function confirmDelete(id, name) {
    if (confirm('Delete member: ' + name + '?\nThis cannot be undone.')) {
        window.location.href = '/api/member-delete?id=' + id;
    }
}
