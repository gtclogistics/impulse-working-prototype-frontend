const config = {
    apiUrl: 'https://gtc-impulse-dev.azurewebsites.net'
};

async function apiFetch(endpoint, options = {}) {
    try {
        const fetchOptions = { ...options };
        if (fetchOptions.method === 'GET' || fetchOptions.method === 'HEAD') {
            delete fetchOptions.body;
        }

        const response = await fetch(`${config.apiUrl}${endpoint}`, {
            ...fetchOptions,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'x-user-id': localStorage.getItem('userId') || '',
                ...fetchOptions.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API fetch error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-toast';
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; background: #ff3b30;
            color: #fff; padding: 12px 24px; border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2); z-index: 2000;
            animation: slideIn 0.3s ease forwards;
        `;
        document.body.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
        throw error;
    }
}

function saveFormData(formId, data) {
    try {
        localStorage.setItem(formId, JSON.stringify(data));
    } catch (e) {
        console.warn('localStorage unavailable:', e);
    }
}

function loadFormData(formId) {
    try {
        return JSON.parse(localStorage.getItem(formId)) || {};
    } catch (e) {
        console.warn('localStorage unavailable:', e);
        return {};
    }
}

function logout() {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
    } catch (e) {
        console.warn('localStorage unavailable:', e);
    }
    window.location.href = '../index.html';
}

function navigateTo(page) {
    const pages = {
        index: 'index.html',
        login: 'login/login.html',
        home: 'home/home.html',
        shifts: 'shifts/shifts.html',
        scheduleshifts: 'scheduleshifts/scheduleshifts.html',
        delivery: 'delivery/delivery.html',
        routes: 'routes/routes.html',
        packages: 'packages/packages.html',
        employees: 'employees/employees.html',
        roles: 'roles/roles.html',
        forgotpassword: 'forgotpassword/forgotpassword.html',
        register: 'register/register.html',
        availability: 'availability/availability.html',
        availabilityrequests: 'availabilityrequests/availabilityrequests.html',
        newavailability: 'newavailability/newavailability.html',
        newavailabilityrequests: 'newavailabilityrequests/newavailabilityrequests.html',
        scheduleavailabilities: 'scheduleavailabilities/scheduleavailabilities.html',
        schedulerequests: 'schedulerequests/schedulerequests.html',
        deliveryroutestop: 'deliveryroutestop/deliveryroutestop.html',
        deliverystop: 'deliverystop/deliverystop.html',
        routeprocess: 'routeprocess/routeprocess.html',
        packagetracking: 'packagetracking/packagetracking.html',
        packagescan: 'packagescan/packagescan.html',
        packagelabel: 'packagelabel/packagelabel.html',
        rolesnew: 'rolesnew/rolesnew.html',
        rolesupdate: 'rolesupdate/rolesupdate.html',
    };
    window.location.href = `../${pages[page]}`;
    // const urlPath = '/Users/interlink/Work/GTC/Projects/impulse-working-prototype-frontend/';
    // let pageUrl = pages[page] || 'index.html';
    // window.location.url = `${urlPath}${pageUrl}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.transform = 'scale(0.95)';
            btn.style.transition = 'transform 0.1s ease';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 100);
        });
    });

    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('input', () => {
            const formData = Object.fromEntries(new FormData(form));
            saveFormData(form.id || 'default-form', formData);
        });
    });

    const container = document.querySelector('.container');
    if (container) {
        container.style.animation = 'fadeIn 0.5s ease forwards';
    }

    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animation = `slideIn 0.5s ease ${index * 0.1}s forwards`;
    });

    console.log('GTC-Impulse global utilities initialized');
});