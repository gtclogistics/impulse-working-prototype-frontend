document.addEventListener('DOMContentLoaded', async () => {
    console.log('GTC Impulse Update Role page initialized');

    const form = document.getElementById('update-role-form');
    const errorMessage = document.getElementById('error-message');
    const packageScanCheckbox = document.getElementById('package-scan');
    const scanStatusesGroup = document.getElementById('scan-statuses-group');
    const roleId = localStorage.getItem('editRoleId');

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }, 10000);
    }

    async function fetchRole() {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId || !roleId) {
                showError('Please log in and select a role to edit');
                setTimeout(() => navigateTo('roles'), 3000);
                return;
            }

            const response = await apiFetch(`/api/roles/${roleId}`, {
                method: 'GET',
                headers: {
                    'x-user-id': userId
                }
            });

            document.getElementById('role-name').value = response.name;

            const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]');
            permissionCheckboxes.forEach(checkbox => {
                checkbox.checked = response.permissions.includes(checkbox.value);
            });

            const hasPackageScan = response.permissions.includes('package-scan');
            scanStatusesGroup.style.display = hasPackageScan ? 'block' : 'none';
            if (hasPackageScan && Array.isArray(response.scanStatuses)) {
                const scanStatusCheckboxes = document.querySelectorAll('input[name="scanStatuses"]');
                scanStatusCheckboxes.forEach(checkbox => {
                    checkbox.checked = response.scanStatuses.includes(checkbox.value);
                });
            }
        } catch (error) {
            const errorText = error.message.includes('400') ? 'Invalid role ID format'
                : error.message.includes('401') ? 'Unauthorized: userId is required'
                    : error.message.includes('403') ? 'You do not have permission to view roles'
                        : error.message.includes('404') ? 'Role not found'
                            : `Failed to load role: ${error.message}`;
            showError(errorText);
            setTimeout(() => navigateTo('roles'), 3000);
        }
    }

    packageScanCheckbox.addEventListener('change', () => {
        scanStatusesGroup.style.display = packageScanCheckbox.checked ? 'block' : 'none';
        if (!packageScanCheckbox.checked) {
            document.querySelectorAll('input[name="scanStatuses"]').forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        if (!userId || !roleId) {
            showError('Please log in and select a role to edit');
            setTimeout(() => navigateTo('roles'), 3000);
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
            const response = await apiFetch(`/api/roles/${roleId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            showError('Role updated successfully');
            setTimeout(() => navigateTo('roles'), 1000);
        } catch (error) {
            const errorText = error.message.includes('400') ? 'Invalid input: Check role name, permissions, or scan statuses'
                : error.message.includes('401') ? 'Unauthorized: userId is required'
                    : error.message.includes('403') ? 'You do not have permission to update roles'
                        : error.message.includes('404') ? 'Role not found'
                            : error.message.includes('409') ? 'Role with this name already exists'
                                : `Failed to update role: ${error.message}`;
            showError(errorText);
        }
    });

    fetchRole();
});