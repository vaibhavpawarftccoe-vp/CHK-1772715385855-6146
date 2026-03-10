/**
 * EduBot Authentication JavaScript
 * Handles login, registration, and student ID generation
 */

// ============================================
// Form Toggle Functions
// ============================================
function showRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('successMessage').classList.remove('active');
}

function showLogin() {
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('successMessage').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
}

function showSuccess(studentId) {
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('generatedStudentId').textContent = studentId;
    document.getElementById('successMessage').classList.add('active');
}

// ============================================
// Password Toggle
// ============================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.classList.remove('fa-eye');
        button.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        button.classList.remove('fa-eye-slash');
        button.classList.add('fa-eye');
    }
}

// ============================================
// Toast Notification
// ============================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    
    // Set icon based on type
    const icon = toast.querySelector('i');
    icon.className = 'fas';
    if (type === 'success') {
        icon.classList.add('fa-check-circle');
        icon.style.color = '#10b981';
    } else if (type === 'error') {
        icon.classList.add('fa-exclamation-circle');
        icon.style.color = '#ef4444';
    } else {
        icon.classList.add('fa-info-circle');
        icon.style.color = '#6366f1';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Handle Login
// ============================================
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Show loading state
    const submitBtn = event.target.querySelector('.btn-auth');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Logging in...';
    submitBtn.disabled = true;
    
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            showToast('Login successful! Redirecting...', 'success');
            // Store student info in localStorage
            localStorage.setItem('studentId', data.studentId);
            localStorage.setItem('studentName', data.name);
            localStorage.setItem('studentEmail', data.email);
            
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showToast(data.message || 'Invalid email or password', 'error');
        }
    })
    .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showToast('An error occurred. Please try again.', 'error');
        console.error('Login error:', error);
    });
}

// ============================================
// Handle Registration
// ============================================
function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('phone').value;
    const course = document.getElementById('course').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('.btn-auth');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Creating account...';
    submitBtn.disabled = true;
    
    const formData = {
        firstName,
        lastName,
        email,
        phone,
        course,
        password
    };
    
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            showSuccess(data.studentId);
            // Store student info
            localStorage.setItem('studentId', data.studentId);
            localStorage.setItem('studentName', `${firstName} ${lastName}`);
            localStorage.setItem('studentEmail', email);
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    })
    .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showToast('An error occurred. Please try again.', 'error');
        console.error('Registration error:', error);
    });
}

// ============================================
// Copy Student ID
// ============================================
function copyStudentId() {
    const studentId = document.getElementById('generatedStudentId').textContent;
    
    navigator.clipboard.writeText(studentId).then(() => {
        showToast('Student ID copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = studentId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Student ID copied to clipboard!', 'success');
    });
}

// ============================================
// Check if user is already logged in
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const studentId = localStorage.getItem('studentId');
    
    // If on login page and already logged in, redirect to dashboard
    if (studentId && window.location.pathname === '/login') {
        // Optional: Uncomment to auto-redirect logged in users
        // window.location.href = '/dashboard';
    }
});

// ============================================
// Logout Function
// ============================================
function logout() {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentEmail');
    
    fetch('/api/logout', {
        method: 'POST'
    }).then(() => {
        window.location.href = '/login';
    }).catch(() => {
        window.location.href = '/login';
    });
}
