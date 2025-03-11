// ===== Helper Functions =====
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// ===== Authentication System =====
let currentAuthAction = 'login';

function showAuthOptionsModal() {
    document.getElementById('authOptionsModal').style.display = 'block';
}

function closeAuthOptionsModal() {
    document.getElementById('authOptionsModal').style.display = 'none';
}

function showAuthModal(action) {
    closeAuthOptionsModal();
    currentAuthAction = action;
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('loginForm').style.display = action === 'login' ? 'block' : 'none';
    document.getElementById('signupForm').style.display = action === 'signup' ? 'block' : 'none';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function toggleSignupForm(userType) {
    document.getElementById('donorSignup').style.display = userType === 'donor' ? 'block' : 'none';
    document.getElementById('charitySignup').style.display = userType === 'charity' ? 'block' : 'none';
}

// ===== User Registration =====
function registerUser() {
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const userData = { type: userType };

    if (userType === 'donor') {
        userData.name = document.getElementById('donorName').value;
        userData.email = document.getElementById('donorEmail').value;
        userData.password = document.getElementById('donorPassword').value;
    } else {
        userData.name = document.getElementById('charityName').value;
        userData.email = document.getElementById('charityEmail').value;
        userData.password = document.getElementById('charityPassword').value;
        userData.registrationNumber = document.getElementById('registrationNumber').value;
        userData.address = document.getElementById('charityAddress').value;
    }

    if (!userData.email || !userData.password || !userData.name) {
        alert('Please fill in all required fields!');
        return;
    }

    localStorage.setItem(userData.email, JSON.stringify(userData));
    alert('Registration successful! Please login.');
    closeAuthModal();
}

// ===== User Login =====
function loginUser() {
    const userType = document.getElementById('userTypeLogin').value;
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email === 'admin' && password === 'admin') {
        const adminData = { name: 'Admin', type: 'admin' };
        sessionStorage.setItem('currentUser', JSON.stringify(adminData));
        alert('Admin login successful!');
        closeAuthModal();
        updateAuthState();
        window.location.href = 'admin.html';
        return;
    }

    const userData = JSON.parse(localStorage.getItem(email));
    if (!userData || userData.password !== password || userData.type !== userType) {
        alert('Invalid credentials!');
        return;
    }

    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    alert('Login successful!');
    closeAuthModal();
    updateAuthState();
}

// ===== Authentication State Management =====
function updateAuthState() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const loginLink = document.querySelector('.nav-links a:last-child');
    
    if (user) {
        loginLink.outerHTML = `
            <span>Welcome, ${user.name}</span>
            ${user.type === 'charity' ? '<a href="dashboard.html">Dashboard</a>' : ''}
            ${user.type === 'admin' ? '<a href="admin.html">Admin Dashboard</a>' : ''}
            <a href="#" onclick="logout()">Logout</a>
        `;
    } else {
        loginLink.outerHTML = `<a href="#" onclick="showAuthOptionsModal()">Login</a>`;
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    updateAuthState();
    alert('Logged out successfully!');
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }
}

// ===== Admin Authorization Check =====
function checkAdminAuth() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user || user.type !== 'admin') {
        alert('Admin access required!');
        window.location.href = 'index.html';
    } else {
        document.getElementById('adminName').textContent = user.name;
    }
}

// ===== Donation Handling with Login Check =====
function checkLoginAndDonate(charityName) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user) {
        alert('Please login to donate!');
        showAuthOptionsModal();
        return;
    }
    showDonationForm(charityName);
}

function showDonationForm(charityName) {
    const form = document.getElementById('donationForm');
    form.style.display = 'block';
    document.getElementById('charityName').textContent = charityName;
    form.scrollIntoView({ behavior: 'smooth' });
}

function setAmount(amount) {
    document.getElementById('amount').value = amount * 1.18;
}

document.getElementById('donationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user) {
        alert('Please login to donate!');
        showAuthOptionsModal();
        return;
    }

    const amount = document.getElementById('amount').value;
    const charity = document.getElementById('charityName').textContent;
    const frequency = document.getElementById('frequency').value;

    if (amount < 100) {
        alert('Minimum donation amount is ₹100');
        return;
    }

    alert(`Thank you, ${user.name}, for your ₹${amount} ${frequency} donation to ${charity}!`);
    this.reset();
    this.style.display = 'none';
});

// Initialize auth state on page load
updateAuthState();