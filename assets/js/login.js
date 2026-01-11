// login.js - Add this script to your login.html or link it as <script src="login.js"></script>
const baseUrl = "http://localhost:8080";
const url = baseUrl+"/api/v1/auth/login";
console.log(url);

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission [web:9][web:13]

        // Clear previous messages
        errorMsg.textContent = '';
        successMsg.textContent = '';
        errorMsg.classList.remove('show'); // Assuming CSS class for visibility
        successMsg.classList.remove('show');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(baseUrl+'/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.status === 200) {
                // Save token and user to localStorage [web:10]
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                alert(data.message); // Show success message

                window.location.href = 'index.html'; // Redirect to index page [web:14]
            } else if (response.status === 401) {
                alert(data.message); // Show unauthorized message
                let error = document.getElementById("errorMsg");
                error.innerText = data.message;
            } else if (response.status === 500) {
                alert(data.message); // Show server error message
            } else {
                alert('Unexpected error occurred');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Network error. Please try again.');
        }
    });
});
