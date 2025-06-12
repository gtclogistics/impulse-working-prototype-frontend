document.addEventListener('DOMContentLoaded', () => {
    console.log('GTC Impulse Login page initialized');

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }, 5000);
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            showError('Invalid email format');
            return;
        }

        try {
            const response = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            localStorage.setItem('userId', response.userId);
            localStorage.setItem('token', 'dummy-token');
            navigateTo('home');
        } catch (error) {
            const errorText = error.message.includes('400') ? 'Invalid email or password format'
                : error.message.includes('401') ? 'Wrong credentials'
                    : error.message.includes('404') ? 'Email not found'
                        : 'An error occurred. Please try again.';
            showError(errorText);
        }
    });

    const togglePasswordBtn = document.querySelector('.toggle-password');
    togglePasswordBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePassword();
        }
    });
});

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleIcon.textContent = isPassword ? '🙈' : '👁️';
    toggleIcon.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
}