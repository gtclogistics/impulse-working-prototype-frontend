document.addEventListener('DOMContentLoaded', async () => {
    console.log('GTC Impulse Home page initialized');

    const greeting = document.getElementById('greeting');
    const moduleGrid = document.getElementById('module-grid');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.querySelector('.logout-btn');

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }, 10000);
    }

    // const userName = localStorage.getItem('userName') || 'User';
    // greeting.textContent = `Hi, ${userName}`;

    const modules = [
        { name: 'My Shifts', permission: 'shifts', path: 'shifts', icon: '📅' },
        { name: 'Shift Scheduling', permission: 'scheduling', path: 'scheduleshifts', icon: '⏰' },
        { name: 'Delivery', permission: 'delivery', path: 'delivery', icon: '🚚' },
        { name: 'Routes', permission: 'routes', path: 'routes', icon: '🗺️' },
        { name: 'Packages', permission: 'package', path: 'packages', icon: '📦' },
        { name: 'Employees', permission: 'employees', path: 'employees', icon: '👥' },
        { name: 'Roles', permission: 'roles-and-permissions', path: 'roles', icon: '🔐' }
    ];

    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            showError('Please log in to continue');
            setTimeout(() => navigateTo('login'), 3000);
            return;
        }

        const response = await apiFetch('/api/home', {
            method: 'GET',
            headers: {
                'x-user-id': userId
            }
        });

        const permittedScreens = response.screensPermissions || [];
        const permittedModules = modules.filter(module =>
            module.permission === 'package'
                ? permittedScreens.some(perm => perm.startsWith('package'))
                : permittedScreens.includes(module.permission)
        );

        greeting.textContent = `Hi, ${response.userName}`;

        moduleGrid.innerHTML = permittedModules.map(module => `
            <a href="../${module.path}/${module.path}.html" class="module" role="gridcell" aria-label="${module.name}">
                <div class="module-icon">${module.icon}</div>
                <span class="module-name">${module.name}</span>
            </a>
        `).join('');

    } catch (error) {
        const errorText = error.message.includes('400') ? 'Invalid user ID'
            : error.message.includes('404') ? 'User not found'
                : 'Failed to load permissions. Please try again.';
        showError(errorText);
    }

    logoutBtn.addEventListener('click', () => {
        logoutBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            logoutBtn.style.transform = 'scale(1)';
            logout();
        }, 150);
    });
});