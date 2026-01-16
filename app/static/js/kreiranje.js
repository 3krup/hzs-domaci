const API_URL = 'http://127.0.0.1:5000';

let isLoggedIn = false;
let currentUser = null;

const kreirajBtn = document.getElementById('kreirajBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const prijaviSeBtn = document.getElementById('prijaviSeBtn');
const prijaviSeMobileBtn = document.getElementById('prijaviSeMobileBtn');
const authPopup = document.getElementById('authPopup');
const closeAuth = document.getElementById('closeAuth');
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const recipeForm = document.getElementById('recipeForm');
const backToTop = document.getElementById('backToTop');

if (kreirajBtn) {
    kreirajBtn.addEventListener('click', () => {
        if (!isLoggedIn) {
            authPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
            document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
            return;
        }
        recipeForm.classList.toggle('hidden');
        recipeForm.scrollIntoView({ behavior: 'smooth' });
    });
}

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

prijaviSeBtn.addEventListener('click', () => {
    authPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
    document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
});

prijaviSeMobileBtn.addEventListener('click', () => {
    authPopup.style.display = 'flex';
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'hidden';
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
    document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
});

closeAuth.addEventListener('click', () => {
    authPopup.style.display = 'none';
    document.body.style.overflow = 'auto';
});

authPopup.addEventListener('click', (e) => {
    if (e.target === authPopup) {
        authPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loginForm.classList.remove('active');
        signupForm.classList.remove('active');
        if (tabName === 'login') {
            loginForm.classList.add('active');
        } else {
            signupForm.classList.add('active');
        }
    });
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';
    if (!email) {
        document.getElementById('loginEmailError').textContent = 'Email je obavezan';
        return;
    }
    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Lozinka je obavezna';
        return;
    }
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            isLoggedIn = true;
            currentUser = email;
            localStorage.setItem('user', email);
            authPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
            loginForm.reset();
            updateButtonUI();
            alert('Uspešna prijava!');
            location.reload();
        } else {
            document.getElementById('loginEmailError').textContent = data.message || 'Greška pri prijavi';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginEmailError').textContent = 'Greška pri povezivanju sa serverom';
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    document.getElementById('signupEmailError').textContent = '';
    document.getElementById('signupPasswordError').textContent = '';
    if (!email) {
        document.getElementById('signupEmailError').textContent = 'Email je obavezan';
        return;
    }
    if (!password || password.length < 6) {
        document.getElementById('signupPasswordError').textContent = 'Lozinka mora imati najmanje 6 karaktera';
        return;
    }
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.status === 201) {
            isLoggedIn = true;
            currentUser = email;
            localStorage.setItem('user', email);
            authPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
            signupForm.reset();
            updateButtonUI();
            alert('Uspešna registracija!');
            location.reload();
        } else {
            document.getElementById('signupEmailError').textContent = data.message || 'Greška pri registraciji';
        }
    } catch (error) {
        console.error('Signup error:', error);
        document.getElementById('signupEmailError').textContent = 'Greška pri povezivanju sa serverom';
    }
});

function updateButtonUI() {
    if (isLoggedIn && currentUser) {
        prijaviSeBtn.textContent = currentUser;
        prijaviSeBtn.style.color = '#4CAF50';
        prijaviSeMobileBtn.textContent = currentUser;
    } else {
        prijaviSeBtn.textContent = 'Prijavi Se';
        prijaviSeBtn.style.color = 'inherit';
        prijaviSeMobileBtn.textContent = 'Prijavi Se';
    }
}

if (backToTop) {
    backToTop.style.opacity = '0';
    backToTop.style.visibility = 'hidden';
    backToTop.style.transition = 'opacity 0.3s, visibility 0.3s';

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (authPopup.style.display === 'flex') {
            authPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        mobileMenu.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('user');
    if (user) {
        isLoggedIn = true;
        currentUser = user;
        updateButtonUI();
    } else {
        authPopup.style.display = 'flex';
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
        document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
        document.body.style.overflow = 'hidden';
    }
});
