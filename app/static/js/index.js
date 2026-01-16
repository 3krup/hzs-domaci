// Recipe Data
const recipes = {
    avokado: {
        title: "Avokado Omlet",
        image: "static/images/avkoado.jpg",
        calories: 504,
        protein: "27g",
        fats: "37g",
        ingredients: [
            "3 jaja",
            "1/2 zrelog avokada",
            "1 kašika maslinovog ulja",
            "Sol i biber po ukusu",
            "50g špinata",
            "1 mala crvena luka",
            "30g feta sira"
        ],
        instructions: [
            "Umutite jaja sa solju i biberom.",
            "Na tavi zagrejte maslinovo ulje i dodajte sitno seckani crveni luk.",
            "Kada luk omekša, dodajte špinat i pirjajte 2 minuta.",
            "Prelijte umućena jaja i kuvajte na srednjoj vatri.",
            "Kada omlet počne da se stvrdne, dodajte isečen avokado i feta sir.",
            "Preklopite omlet i kuvajte još 2-3 minute.",
            "Servirajte toplo."
        ],
        nutrition: {
            "Kcal": 504,
            "Protein": "27g",
            "Masti": "37g"
        }
    },
    piletina: {
        title: "Sesam Piletina",
        image: "static/images/piletina.jpg",
        calories: 333,
        protein: "36.8g",
        fats: "15.2g",
        ingredients: [
            "2 pileća filea (oko 250g)",
            "2 kašike susama",
            "1 kašika meda",
            "2 kašike soja sosa",
            "1 kašika belog sirćeta",
            "1 čen belog luka",
            "1 kašika đumbira (narendanog)",
            "1 kašika ulja"
        ],
        instructions: [
            "Pileće filee isecite na trake.",
            "U posudi pomešajte med, soja sos, sirće, seckani beli luk i đumbir.",
            "Pileće trake umočite u marinadu i ostavite 15 minuta.",
            "Na tavi zagrejte ulje i dodajte pileće trake.",
            "Pržite 6-8 minuta dok ne porumene.",
            "Pospite susamom i još 1 minut pržite.",
            "Servirajte sa svežim povrćem."
        ],
        nutrition: {
            "Kcal": 333,
            "Protein": "36.8g",
            "Masti": "15.2g"
        }
    },
    brownie: {
        title: "Protein Brownie",
        image: "static/images/brownie.webp",
        calories: 302,
        protein: "23g",
        fats: "17g",
        ingredients: [
            "60g proteinskog praha (čokolada)",
            "30g kakaa",
            "30g brašna od badema",
            "1 jaje",
            "100g jogurta",
            "1 kašika meda",
            "1/2 kašičice sode bikarbone",
            "50g tamne čokolade (komadići)"
        ],
        instructions: [
            "Zagrejte rernu na 180°C.",
            "U posudi pomešajte suve sastojke: proteinski prah, kakao, brašno od badema, sodu bikarbonu.",
            "Dodajte jaje, jogurt i med, dobro izmešajte.",
            "Ubacite komadiće čokolade.",
            "Prelijte smesu u podmazan kalup (15x15cm).",
            "Pecite 20-25 minuta.",
            "Ostavite da se ohladi pre sečenja."
        ],
        nutrition: {
            "Kcal": 302,
            "Protein": "23g",
            "Masti": "17g"
        }
    }
};

// Favorites state
let favorites = [];

// DOM Elements
const recipePopup = document.getElementById('recipePopup');
const closePopup = document.getElementById('closePopup');
const recipeCards = document.querySelectorAll('.recipe-card');
const backToTop = document.getElementById('backToTop');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const prijaviSeBtn = document.getElementById('prijaviSeBtn');
const prijaviSeMobileBtn = document.getElementById('prijaviSeMobileBtn');
const authPopup = document.getElementById('authPopup');
const closeAuth = document.getElementById('closeAuth');
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const favoriteButtons = document.querySelectorAll('.favorite-btn');

// Load favorites from localStorage
function loadFavorites() {
    const stored = localStorage.getItem('favorites');
    if (stored) {
        favorites = JSON.parse(stored);
        updateFavoriteButtons();
    }
}

// Load favorites from backend
async function loadFavoritesFromBackend() {
    if (!authState.isLoggedIn) {
        loadFavorites(); // Fallback to localStorage if not logged in
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/my-recipes`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const recipes = await response.json();
            favorites = recipes.map(r => r.id.toString());
            saveFavorites();
            updateFavoriteButtons();
            console.log('Loaded favorites from backend:', favorites);
        } else {
            // Fallback to localStorage
            loadFavorites();
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        // Fallback to localStorage
        loadFavorites();
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Update favorite button UI
function updateFavoriteButtons() {
    favoriteButtons.forEach(btn => {
        const recipeId = btn.dataset.recipe;
        if (favorites.includes(recipeId)) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

// Favorite Button Handler
favoriteButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        // Check if user is logged in
        if (!authState.isLoggedIn) {
            authPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
            document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
            return;
        }
        
        const recipeId = btn.dataset.recipe;
        const isCurrentlyFavorited = btn.classList.contains('active');
        
        try {
            const method = isCurrentlyFavorited ? 'DELETE' : 'POST';
            const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/save`, {
                method: method,
                credentials: 'include'
            });
            
            if (response.ok) {
                // Toggle UI
                if (isCurrentlyFavorited) {
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="far fa-heart"></i>';
                    favorites = favorites.filter(id => id !== recipeId);
                } else {
                    btn.classList.add('active');
                    btn.innerHTML = '<i class="fas fa-heart"></i>';
                    favorites.push(recipeId);
                }
                saveFavorites();
                console.log('Favorite toggled for:', recipeId);
            } else {
                showCustomAlert('Greška pri dodavanju u favorite', 'Greška');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showCustomAlert('Greška pri dodavanju u favorite', 'Greška');
        }
    });
});

// Open Recipe Popup
recipeCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-recipe-details')) {
            const recipeId = card.dataset.recipe;
            const recipe = recipes[recipeId];
            
            if (recipe) {
                let imageSrc = recipe.image;
                if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('../')) {
                    imageSrc = '../' + imageSrc;
                }
                document.getElementById('popupImage').src = imageSrc;
                document.getElementById('popupImage').alt = recipe.title;
                document.getElementById('popupTitle').textContent = recipe.title;
                
                // Set stats
                const popupStats = document.getElementById('popupStats');
                popupStats.innerHTML = `
                    <div style="display: flex; gap: 20px;">
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: #4CAF50;">${recipe.calories}</span>
                            <span style="color: #666; margin-left: 5px;">kcal</span>
                        </div>
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: #4CAF50;">${recipe.protein}</span>
                            <span style="color: #666; margin-left: 5px;">protein</span>
                        </div>
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: #4CAF50;">${recipe.fats}</span>
                            <span style="color: #666; margin-left: 5px;">masti</span>
                        </div>
                    </div>
                `;
                
                // Set ingredients
                const ingredientsList = document.getElementById('ingredientsList');
                ingredientsList.innerHTML = recipe.ingredients
                    .map(ingredient => `<li>${ingredient}</li>`)
                    .join('');
                
                // Set instructions
                const instructionsList = document.getElementById('instructionsList');
                instructionsList.innerHTML = recipe.instructions
                    .map((step, index) => `<li>${step}</li>`)
                    .join('');
                
                // Set nutrition
                const nutritionGrid = document.getElementById('nutritionGrid');
                nutritionGrid.innerHTML = Object.entries(recipe.nutrition)
                    .map(([key, value]) => `
                        <div class="nutrition-item">
                            <span class="label">${key}</span>
                            <span class="value">${value}</span>
                        </div>
                    `)
                    .join('');
                
                recipePopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }
    });
});

// Close Recipe Popup
closePopup.addEventListener('click', () => {
    recipePopup.style.display = 'none';
    document.body.style.overflow = 'auto';
});

recipePopup.addEventListener('click', (e) => {
    if (e.target === recipePopup) {
        recipePopup.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Back to Top
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

// Auth Popup
function setupAuthButtons() {
    const prijaviSeBtn = document.getElementById('prijaviSeBtn');
    const prijaviSeMobileBtn = document.getElementById('prijaviSeMobileBtn');
    
    if (prijaviSeBtn) {
        prijaviSeBtn.addEventListener('click', () => {
            authPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
            document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
        });
    }
    
    if (prijaviSeMobileBtn) {
        prijaviSeMobileBtn.addEventListener('click', () => {
            authPopup.style.display = 'flex';
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'hidden';
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
            document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
        });
    }
}

setupAuthButtons();

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

// Auth Tabs
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

// API Configuration
const API_CONFIG = { API_BASE_URL };

// Authentication state (from auth.js)
// authState is defined in auth.js

// Clear error messages
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

// Show error message
function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
    }
}

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    let isValid = true;
    
    // Email validation
    if (!email) {
        showError('loginEmailError', 'Email je obavezan');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('loginEmailError', 'Unesite validan email');
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        showError('loginPasswordError', 'Lozinka je obavezna');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Disable submit button during request
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Učitavanje...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Login successful:', data.message);
            
            // Store user email in localStorage and update auth state
            setUserEmail(email);
            authState.isLoggedIn = true;
            authState.email = email;
            
            // Close auth popup
            authPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
            loginForm.reset();
            submitBtn.textContent = 'Prijavi se';
            submitBtn.disabled = false;
            
            // Update navbar
            updateNavbarAuth();
            
            // Re-setup button listeners since buttons have changed
            setupAuthButtons();
            
            // Show success message
            showCustomAlert('Uspešno ste se prijavljeni!', 'Prijava');
        } else {
            showError('loginPasswordError', data.message || 'Greška pri prijavi');
            submitBtn.textContent = 'Prijavi se';
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('loginPasswordError', 'Greška pri prijavi. Pokušajte kasnije.');
        submitBtn.textContent = 'Prijavi se';
        submitBtn.disabled = false;
    }
});

// Signup Form Submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();
    let isValid = true;
    
    // Email validation
    if (!email) {
        showError('signupEmailError', 'Email je obavezan');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('signupEmailError', 'Unesite validan email');
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        showError('signupPasswordError', 'Lozinka je obavezna');
        isValid = false;
    } else if (password.length < 6) {
        showError('signupPasswordError', 'Lozinka mora imati najmanje 6 karaktera');
        isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword) {
        showError('signupConfirmError', 'Potvrdite lozinku');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('signupConfirmError', 'Lozinke se ne poklapaju');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Disable submit button during request
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Učitavanje...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Registration successful:', data.message);
            alert(data.message);
            
            // Switch to login tab
            document.querySelector('.auth-tab[data-tab="login"]').click();
            
            // Clear signup form
            signupForm.reset();
            submitBtn.textContent = 'Registruj se';
            submitBtn.disabled = false;
        } else {
            if (response.status === 409) {
                showError('signupEmailError', data.message || 'Email već postoji!');
            } else {
                showError('signupEmailError', data.message || 'Greška pri registraciji');
            }
            submitBtn.textContent = 'Registruj se';
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('signupEmailError', 'Greška pri registraciji. Pokušajte kasnije.');
        submitBtn.textContent = 'Registruj se';
        submitBtn.disabled = false;
    }
});

// Logout Popup (using shared function from auth.js)
function openLogoutPopupMobile() {
    openLogoutPopup();
}

// Open auth popup
function openAuthPopup() {
    authPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function openAuthPopupMobile() {
    authPopup.style.display = 'flex';
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'hidden';
}

// Show back to top button on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
    } else {
        backToTop.style.opacity = '0';
        backToTop.style.visibility = 'hidden';
    }
});

// Initialize back to top button
backToTop.style.opacity = '0';
backToTop.style.visibility = 'hidden';
backToTop.style.transition = 'opacity 0.3s, visibility 0.3s';

// Close popups with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (recipePopup.style.display === 'flex') {
            recipePopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (authPopup.style.display === 'flex') {
            authPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        mobileMenu.classList.remove('active');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication status and update UI
    await initializeAuth();
    
    // Load favorites from backend if logged in, otherwise from localStorage
    await loadFavoritesFromBackend();
});