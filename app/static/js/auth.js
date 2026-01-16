// Shared Authentication Module
const API_BASE_URL = 'http://146.190.22.228:5000';

// Custom Alert Popup
function showCustomAlert(message, title = 'Obaveštenje') {
    console.log('showCustomAlert called with:', title, message);
    const popup = document.createElement('div');
    popup.className = 'custom-alert-overlay';
    popup.innerHTML = `
        <div class="custom-alert-popup">
            <div class="alert-header">
                <h2>${title}</h2>
            </div>
            <div class="alert-body">
                <p>${message}</p>
            </div>
            <div class="alert-footer">
                <button class="btn-alert-ok">Razumem</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    console.log('Popup appended to body');
    
    const okBtn = popup.querySelector('.btn-alert-ok');
    okBtn.addEventListener('click', () => {
        popup.remove();
    });
    
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// Authentication state
let authState = {
    isLoggedIn: false,
    email: null
};

// Check if user is logged in
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/my-recipes`, {
            method: 'GET',
            credentials: 'include'
        });
        if (response.ok) {
            authState.isLoggedIn = true;
            return true;
        } else {
            authState.isLoggedIn = false;
            return false;
        }
    } catch (error) {
        authState.isLoggedIn = false;
        return false;
    }
}

// Get user email from localStorage
function getUserEmail() {
    return localStorage.getItem('userEmail');
}

// Store user email
function setUserEmail(email) {
    localStorage.setItem('userEmail', email);
    authState.email = email;
}

// Clear user data
function clearUserData() {
    localStorage.removeItem('userEmail');
    authState.isLoggedIn = false;
    authState.email = null;
}

// Check if user should have access to page
async function ensureLoggedIn(redirectPage = true) {
    const isLoggedIn = await checkAuthStatus();
    if (!isLoggedIn) {
        if (redirectPage) {
            // Show auth popup if on current page
            const authPopup = document.getElementById('authPopup');
            if (authPopup) {
                authPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }
        return false;
    }
    
    const email = getUserEmail();
    if (email) {
        authState.isLoggedIn = true;
        authState.email = email;
    }
    return true;
}

// Update navbar for all pages
function updateNavbarAuth() {
    const email = getUserEmail();
    
    if (email && authState.isLoggedIn) {
        const prijaviSeBtn = document.getElementById('prijaviSeBtn');
        const prijaviSeMobileBtn = document.getElementById('prijaviSeMobileBtn');
        
        if (prijaviSeBtn) {
            prijaviSeBtn.innerHTML = email;
            prijaviSeBtn.className = 'btn-email';
            prijaviSeBtn.id = 'emailBtn';
            prijaviSeBtn.onclick = null;
            prijaviSeBtn.addEventListener('click', openLogoutPopup);
        }
        
        if (prijaviSeMobileBtn) {
            prijaviSeMobileBtn.innerHTML = email;
            prijaviSeMobileBtn.className = 'btn-email';
            prijaviSeMobileBtn.id = 'emailBtnMobile';
            prijaviSeMobileBtn.onclick = null;
            prijaviSeMobileBtn.addEventListener('click', openLogoutPopup);
        }
    }
}

// Open logout popup - keep original name
function showLogoutPopup() {
    const popup = document.createElement('div');
    popup.className = 'logout-popup-overlay';
    popup.innerHTML = `
        <div class="logout-popup">
            <h2>Odjava</h2>
            <p>Da li ste sigurni da želite da se odjavite?</p>
            <div class="logout-popup-buttons">
                <button class="btn-cancel" onclick="this.closest('.logout-popup-overlay').remove()">Otkaži</button>
                <button class="btn-logout">Odjavi se</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    const logoutBtn = popup.querySelector('.btn-logout');
    logoutBtn.addEventListener('click', async () => {
        await performLogout();
        popup.remove();
    });
    
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// Alias for backward compatibility
function openLogoutPopup() {
    showLogoutPopup();
}

// Logout function
async function performLogout() {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        clearUserData();
        
        // Reset navbar
        const emailBtn = document.getElementById('emailBtn') || document.getElementById('emailBtnMobile');
        if (emailBtn) {
            emailBtn.innerHTML = 'Prijavi Se';
            emailBtn.id = 'prijaviSeBtn';
            emailBtn.className = 'btn-prijava';
            emailBtn.onclick = null;
        }
        
        alert('Uspešno ste se odjavili!');
        
        // Redirect or reload
        if (window.location.pathname.includes('kreiranje')) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Greška pri odjavi');
    }
}

// Alias for backward compatibility
async function logout() {
    await performLogout();
}

// Initialize auth on page load
async function initializeAuth() {
    const isLoggedIn = await checkAuthStatus();
    if (isLoggedIn) {
        const email = getUserEmail();
        if (email) {
            authState.isLoggedIn = true;
            authState.email = email;
            updateNavbarAuth();
        }
    }
}
