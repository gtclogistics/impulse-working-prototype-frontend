document.addEventListener('DOMContentLoaded', () => {
    console.log('GTC Impulse Register page initialized');

    const form = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }, 10000);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const fullName = document.getElementById('fullname').value.trim();
        const password = document.getElementById('password').value;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
        // const nameRegex = /^[A-Za-z\s]{2,50}$/;

        if (!emailRegex.test(email)) {
            showError('Invalid email format');
            return;
        }

        // if (!nameRegex.test(fullname)) {
        //     showError('Full name must be 2-50 characters, letters and spaces only');
        //     return;
        // }
        //
        // if (!passwordRegex.test(password)) {
        //     showError('Password must be 12+ characters with uppercase, lowercase, numbers, and special characters');
        //     return;
        // }

        const payload = {
            email: email,
            fullName: fullName,
            password: password
        };

        try {
            const response = await apiFetch('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // localStorage.setItem('userId', response.userId);
            showError('Registration successful! Redirecting to login...');
            setTimeout(() => navigateTo('login'), 1000);
        } catch (error) {
            const errorText = error.message.includes('400') ? 'Invalid input: Check email, full name, or password'
                : error.message.includes('403') ? 'Email not approved by admin'
                    : error.message.includes('409') ? 'Email already in use'
                        : `Registration failed: ${error.message}`;
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