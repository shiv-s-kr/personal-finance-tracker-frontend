// register.js - Complete registration handler with validation
const baseUrl = "http://localhost:8080";
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Clear previous messages
        clearErrors();
        document.getElementById('successMsg').textContent = '';
        
        // Get form values
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Client-side validation
        const isValid = validateForm(fullname, email, password, confirmPassword);
        
        if (!isValid) {
            return;
        }
        
        // Submit to API
        await submitRegistration(fullname, email, password);
    });

});

function validateForm(fullname, email, password, confirmPassword) {
    let isValid = true;
    
    // Full name validation
    if (fullname === '' || fullname.length < 2) {
        showError('nameError', 'Full name is required (minimum 2 characters)');
        isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Password validation
    if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
        showError('confirmError', 'Passwords do not match');
        isValid = false;
    }
    
    return isValid;
}

function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;
}

function clearErrors() {
    const errors = ['nameError', 'emailError', 'passwordError', 'confirmError'];
    errors.forEach(id => {
        document.getElementById(id).textContent = '';
    });
}

async function submitRegistration(name, email, password) {
    try {
        const response = await fetch(baseUrl+'/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        if (response.status === 201 || response.status === 200) {
            // Success - show message and redirect to login
            document.getElementById('successMsg').textContent = data.message || 'Registration successful! Redirecting to login...';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else if (response.status === 400) {
            showError('emailError', data.message || 'Validation error');
        } else if (response.status === 409) {
            showError('emailError', data.message || 'Email already exists');
        } else if (response.status === 500) {
            alert(data.message || 'Server error. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Network error. Please check your connection.');
    }
}
