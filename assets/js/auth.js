// Check Login 
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Skip auth check on login page
    if (currentPage === 'login.html') {
        return;
    }

    if (token && user) {
        try {
            JSON.parse(user); // Validate user data
            // If on index.html and logged in, redirect to dashboard
            if (currentPage === 'index.html') {
                window.location.href = 'dashboard.html';
            }
            // On other pages, stay (logged in state confirmed)
        } catch (e) {
            // Invalid data, clear and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            console.warn('Invalid user data cleared');
            window.location.href = 'login.html';
        }
    } else {
        // Not logged in, redirect to login from any page
        window.location.href = 'login.html';
    }
}
