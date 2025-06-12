document.addEventListener('DOMContentLoaded', () => {
    console.log('Redirecting to login page for GTC - Impulse');
    // Fallback redirect in case meta refresh fails
    setTimeout(() => {
        window.location.href = 'login/login.html';
    }, 1800);
});