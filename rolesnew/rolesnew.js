document.addEventListener('DOMContentLoaded', () => {
    console.log('GTC Impulse New Role page initialized');

    const form = document.getElementById('new-role-form');
    const errorMessage = document.getElementById('error-message');
    const packageScanCheckbox = document.getElementById('package-scan');
    const scanStatusesGroup = document.getElementById('scan-statuses-group');

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }, 10000);
    }

    packageScanCheckbox.addEventListener('change', () => {
        scanStatusesGroup.style.display = packageScanCheckbox.checked ? 'block' : 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        if (!userId) {
            showError('Please log in to continue');
            setTimeout(() => navigateTo('login'), 3000);
            return;
        }

        const roleName = document.getElementById('role-name').value.trim();
        const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked')).map(input => input.value);
        const scanStatuses = Array.from(document.querySelectorAll('input[name="scanStatuses"]:checked')).map(input => input.value);

        if (!roleName) {
            showError('Role name is required');
            return;
        }

        if (permissions.length === 0) {
            showError('At least one permission is required');
            return;
        }

        const validPermissions = ['shifts', 'scheduling', 'delivery', 'routes', 'packages-list', 'packages-labels', 'package-scan', 'roles-and-permissions', 'employees'];
        if (!permissions.every(perm => validPermissions.includes(perm))) {
            showError('Invalid permissions selected');
            return;
        }

        const validScanStatuses = ['to warehouse', 'to sort', 'to load'];
        if (scanStatuses.length > 0) {
            if (!permissions.includes('package-scan')) {
                showError('Scan statuses can only be selected if Package Scan permission is enabled');
                return;
            }
            if (!scanStatuses.every(status => validScanStatuses.includes(status))) {
                showError('Invalid scan statuses selected');
                return;
            }
        }

        const payload = {
            userId,
            name: roleName,
            permissions,
            scanStatuses: scanStatuses.length > 0 ? scanStatuses : null
        };

        try {
            const response = await apiFetch('/api/roles', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            showError('Role created successfully');
            setTimeout(() => navigateTo('roles'), 1000);
        } catch (error) {
            const errorText = error.message.includes('400') ? 'Invalid input: Check role name, permissions, or scan statuses'
                : error.message.includes('401') ? 'Unauthorized: userId is required'
                    : error.message.includes('403') ? 'You do not have permission to create roles'
                        : error.message.includes('409') ? 'Role with this name already exists'
                            : `Failed to create role: ${error.message}`;
            showError(errorText);
        }
    });
});