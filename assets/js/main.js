// ********** Navbar Handler ********** 

document.addEventListener('DOMContentLoaded', function () {
    loadUserProfile();
    setupLogout();
});

function loadUserProfile() {
    const user = localStorage.getItem('user');
    const profileText = document.getElementById('profile-text');
    const profileLink = document.getElementById('profileLink');

    if (user) {
        try {
            const userData = JSON.parse(user);
            profileText.textContent = `${userData.name || userData.email || 'User'}`;
        } catch (e) {
            profileText.textContent = 'User';
        }
    } else {
        profileText.textContent = 'Hi';
        profileLink.style.display = 'none';
    }
}

function setupLogout() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    const settingsLink = document.getElementById('settingsLink');
    if (settingsLink) {
        settingsLink.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'settings.html'; // Create this page if needed
        });
    }
}
