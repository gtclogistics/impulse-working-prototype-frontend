document.addEventListener('DOMContentLoaded', async () => {
    console.log('GTC Impulse Roles page initialized');

    const rolesList = document.getElementById('roles-list');
    const errorMessage = document.getElementById('error-message');
    const newRoleBtn = document.querySelector('.new-role-btn');

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }, 10000);
    }

    async function fetchRoles() {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                showError('Please log in to continue');
                setTimeout(() => navigateTo('login'), 3000);
                return;
            }

            const response = await apiFetch('/api/roles', {
                method: 'GET',
                headers: {
                    'x-user-id': userId
                }
            });

            if (!Array.isArray(response)) {
                showError('Invalid response format: No roles found');
                renderRoles([]);
                return;
            }

            renderRoles(response);
        } catch (error) {
            const errorText = error.message.includes('401') ? 'Unauthorized: userId is required'
                : error.message.includes('403') ? 'You do not have permission to view roles'
                    : `Failed to load roles: ${error.message}`;
            showError(errorText);
            renderRoles([]);
        }
    }

    function renderRoles(roles) {
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
            rolesList.innerHTML = '<div class="no-roles">No roles available</div>';
            return;
        }

        rolesList.innerHTML = roles.map(role => `
            <div class="role-item" role="listitem">
                <div class="role-header" onclick="toggleRoleDetails('${role.roleId}')">
                    <span class="role-name">${role.name}</span>
                    <span class="toggle-icon" id="toggle-${role.roleId}">▼</span>
                </div>
                <div class="role-details" id="details-${role.roleId}">
                    <ul class="permissions-list">
                        ${Array.isArray(role.permissions) && role.permissions.length > 0
            ? role.permissions.map(perm => `<li class="permission-item">${perm}</li>`).join('')
            : '<li class="permission-item">None</li>'}
                    </ul>
                    <div class="scan-statuses">
                        Scan Statuses: ${Array.isArray(role.scanStatuses) && role.scanStatuses.length > 0
            ? role.scanStatuses.join(', ')
            : 'None'}
                    </div>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="navigateToRoleUpdate('${role.roleId}')">Edit</button>
                        <button class="delete-btn" onclick="deleteRole('${role.roleId}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.toggleRoleDetails = function(roleId) {
        const details = document.getElementById(`details-${roleId}`);
        const toggleIcon = document.getElementById(`toggle-${roleId}`);
        const isOpen = details.classList.contains('open');

        details.classList.toggle('open', !isOpen);
        toggleIcon.classList.toggle('open', !isOpen);
        toggleIcon.innerHTML = isOpen ? '▼' : '▲';
    };

    window.navigateToRoleUpdate = function(roleId) {
        localStorage.setItem('editRoleId', roleId);
        navigateTo('rolesupdate');
    };

    window.deleteRole = async function(roleId) {
        if (!confirm('Are you sure you want to delete this role?')) return;

        try {
            const userId = localStorage.getItem('userId');
            await apiFetch(`/api/roles/${roleId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': userId
                }
            });
            showError('Role deleted successfully');
            fetchRoles();
        } catch (error) {
            showError(`Failed to delete role: ${error.message}`);
        }
    };

    newRoleBtn.addEventListener('click', () => {
        newRoleBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            newRoleBtn.style.transform = 'scale(1)';
            navigateTo('rolesnew');
        }, 150);
    });

    fetchRoles();
});