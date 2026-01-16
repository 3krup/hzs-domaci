// Favorites state (database recipes only now)
let favorites = [];
let latestRecipes = [];

// DOM Elements  
const recipePopup = document.getElementById('recipePopup');
const closePopup = document.getElementById('closePopup');
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

// Load saved recipes (favorites) from backend
async function loadFavoritesFromBackend() {
    if (!authState.isLoggedIn) {
        favorites = [];
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/saved-recipes`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const savedRecipes = await response.json();
            favorites = savedRecipes.map(r => r.id.toString());
            console.log('Loaded saved recipes:', favorites);
        } else {
            favorites = [];
        }
    } catch (error) {
        console.error('Error loading saved recipes:', error);
        favorites = [];
    }
}

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
        // Remove any existing listeners
        prijaviSeBtn.removeEventListener('click', prijaviSeBtn._authClickHandler);
        
        // Only add listener if user is not logged in
        if (!authState.isLoggedIn) {
            prijaviSeBtn._authClickHandler = () => {
                authPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                loginForm.classList.add('active');
                signupForm.classList.remove('active');
                document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
                document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
            };
            prijaviSeBtn.addEventListener('click', prijaviSeBtn._authClickHandler);
        }
    }
    
    if (prijaviSeMobileBtn) {
        // Remove any existing listeners
        prijaviSeMobileBtn.removeEventListener('click', prijaviSeMobileBtn._authClickHandler);
        
        // Only add listener if user is not logged in
        if (!authState.isLoggedIn) {
            prijaviSeMobileBtn._authClickHandler = () => {
                authPopup.style.display = 'flex';
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'hidden';
                loginForm.classList.add('active');
                signupForm.classList.remove('active');
                document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
                document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
            };
            prijaviSeMobileBtn.addEventListener('click', prijaviSeMobileBtn._authClickHandler);
        }
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

            // Refresh favorites and update buttons
            await loadFavoritesFromBackend();
            updateFavoriteButtons();
            
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

// Fetch latest 3 recipes from database
async function loadLatestRecipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/latest?limit=3`);
        if (response.ok) {
            latestRecipes = await response.json();
            displayLatestRecipes();
        } else {
            console.error('Failed to load latest recipes');
        }
    } catch (error) {
        console.error('Error loading latest recipes:', error);
    }
}

// Display latest recipes on pocetna page
function displayLatestRecipes() {
    const recipesContainer = document.querySelector('.recipe-container');
    if (!recipesContainer) return;
    
    // Clear existing recipe cards
    recipesContainer.innerHTML = '';
    
    // Create cards for latest recipes
    latestRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.recipe = recipe.id;

        const isFavorited = favorites.includes(recipe.id.toString());
        const mealTypeLabel = getMealTypeLabel(recipe.meal_type);
        const difficultyLabel = getDifficultyLabel(recipe.difficulty);
        const dietLabel = getDietTypeLabel(recipe);

        card.innerHTML = `
            <div class="recipe-image">
                <img src="${recipe.image_url}" alt="${recipe.title}">
                <button class="favorite-btn ${isFavorited ? 'active' : ''}" data-recipe="${recipe.id}">
                    <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="recipe-info">
                <div class="recipe-tags">
                    <span class="tag tag-meal">${mealTypeLabel}</span>
                    <span class="tag tag-diet">${dietLabel}</span>
                </div>
                <h3>${recipe.title}</h3>
                <div class="recipe-stats">
                    <div class="stat">
                        <span class="value">${recipe.kcal}</span>
                        <span class="label">kcal</span>
                    </div>
                    <div class="stat">
                        <span class="value">${recipe.protein}g</span>
                        <span class="label">protein</span>
                    </div>
                    <div class="stat">
                        <span class="value">${recipe.fat}g</span>
                        <span class="label">masti</span>
                    </div>
                    ${recipe.prep_time_minutes ? `<div class="stat">
                        <span class="value">${recipe.prep_time_minutes}</span>
                        <span class="label">min</span>
                    </div>` : ''}
                </div>
                <p class="difficulty"><i class="fas fa-signal"></i> Slozenost: ${difficultyLabel}</p>
                <button class="btn-recipe-details">Detaljnije</button>
            </div>
        `;
        recipesContainer.appendChild(card);
    });
    
    // Re-attach event listeners to new cards
    attachRecipeCardListeners();
}

function getMealTypeLabel(mealType) {
    const labels = {
        'dorucak': 'Doručak',
        'rucak': 'Ručak',
        'vecera': 'Večera',
        'uzina': 'Užina'
    };
    return labels[mealType] || mealType || 'Ostalo';
}

function getDifficultyLabel(difficulty) {
    const labels = {
        'lako': 'Lako',
        'srednje': 'Srednje',
        'tesko': 'Teško'
    };
    return labels[difficulty] || difficulty || 'Srednje';
}

function getDietTypeLabel(recipe) {
    if (recipe.is_vegan) return 'Vegansko';
    if (recipe.is_vegetarian) return 'Vegetarijansko';
    if (recipe.is_posno) return 'Posno';
    if (recipe.is_halal) return 'Halal';
    return 'Ostalo';
}

function updateFavoriteButtons() {
    document.querySelectorAll('.recipe-card .favorite-btn').forEach(btn => {
        const recipeId = btn.dataset.recipe;
        if (favorites.includes(recipeId.toString())) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

// Attach listeners to recipe cards
function attachRecipeCardListeners() {
    // Attach click handlers to details buttons
    document.querySelectorAll('.recipe-card .btn-recipe-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.recipe-card');
            const recipeId = card.dataset.recipe;
            const cardImage = card.querySelector('img');
            const cardImageSrc = cardImage ? cardImage.src : '';
            const title = card.querySelector('h3')?.textContent || '';

            // Show loading state
            document.getElementById('popupImage').src = cardImageSrc;
            document.getElementById('popupImage').alt = title;
            document.getElementById('popupTitle').textContent = title;
            document.getElementById('popupDescription').textContent = 'Učitavanje detalja...';
            document.getElementById('ingredientsList').innerHTML = '<li>Učitavanje...</li>';
            document.getElementById('instructionsList').innerHTML = '<li>Učitavanje...</li>';
            document.getElementById('nutritionGrid').innerHTML = '';

            recipePopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            fetch(`${API_BASE_URL}/recipes/${recipeId}`)
                .then(response => response.json())
                .then(recipe => {
                    document.getElementById('popupDescription').textContent = recipe.description || 'Nema dostupnog opisa';

                    if (recipe.ingredients && recipe.ingredients.length > 0) {
                        document.getElementById('ingredientsList').innerHTML = recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');
                    } else {
                        document.getElementById('ingredientsList').innerHTML = '<li>Nema dostupnih sastojaka</li>';
                    }

                    if (recipe.instructions && recipe.instructions.length > 0) {
                        document.getElementById('instructionsList').innerHTML = recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('');
                    } else {
                        document.getElementById('instructionsList').innerHTML = '<li>Nema dostupnih uputstava</li>';
                    }

                    const popupStats = document.getElementById('popupStats');
                    popupStats.innerHTML = `
                        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                            ${recipe.kcal !== null ? `<div>
                                <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${recipe.kcal}</span>
                                <span style="color: #666; margin-left: 5px;">kcal</span>
                            </div>` : ''}
                            ${recipe.protein !== null ? `<div>
                                <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${recipe.protein}</span>
                                <span style="color: #666; margin-left: 5px;">g proteina</span>
                            </div>` : ''}
                            ${recipe.fat !== null ? `<div>
                                <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${recipe.fat}</span>
                                <span style="color: #666; margin-left: 5px;">g masti</span>
                            </div>` : ''}
                        </div>
                    `;

                    let nutritionHTML = '';
                    if (recipe.kcal !== null) nutritionHTML += `<div class="nutrition-item"><span class="label">Kalorije</span><span class="value">${recipe.kcal} kcal</span></div>`;
                    if (recipe.protein !== null) nutritionHTML += `<div class="nutrition-item"><span class="label">Proteini</span><span class="value">${recipe.protein}g</span></div>`;
                    if (recipe.fat !== null) nutritionHTML += `<div class="nutrition-item"><span class="label">Masti</span><span class="value">${recipe.fat}g</span></div>`;

                    if (nutritionHTML) {
                        document.getElementById('nutritionGrid').innerHTML = nutritionHTML;
                    }
                })
                .catch(error => {
                    console.error('Error fetching recipe details:', error);
                    document.getElementById('popupDescription').textContent = 'Greška pri učitavanju detalja';
                    document.getElementById('ingredientsList').innerHTML = '<li>Greška pri učitavanju</li>';
                    document.getElementById('instructionsList').innerHTML = '<li>Greška pri učitavanju</li>';
                });
        });
    });

    // Attach favorite button listeners
    document.querySelectorAll('.recipe-card .favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();

            if (!authState.isLoggedIn) {
                authPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                loginForm.classList.add('active');
                signupForm.classList.remove('active');
                document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
                document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
                return;
            }

            const recipeId = parseInt(btn.dataset.recipe, 10);
            const isCurrentlyFavorited = btn.classList.contains('active');

            try {
                const method = isCurrentlyFavorited ? 'DELETE' : 'POST';
                const response = await fetch(`${API_BASE_URL}/saved-recipes`, {
                    method: method,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ recipe_id: recipeId })
                });

                if (response.ok) {
                    if (isCurrentlyFavorited) {
                        btn.classList.remove('active');
                        btn.innerHTML = '<i class="far fa-heart"></i>';
                        favorites = favorites.filter(id => id !== recipeId.toString());
                    } else {
                        btn.classList.add('active');
                        btn.innerHTML = '<i class="fas fa-heart"></i>';
                        favorites.push(recipeId.toString());
                    }
                    showCustomAlert('Uspešno', 'Dodan u favorite');
                } else {
                    console.error('Failed to save favorite');
                }
            } catch (error) {
                console.error('Error toggling favorite:', error);
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication status and update UI
    await initializeAuth();
    
    // Load favorites from backend
    await loadFavoritesFromBackend();
    
    // Load and display latest 3 recipes
    await loadLatestRecipes();
});