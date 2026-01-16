// State Management - Database only (no hardcoded recipes)
let activeFilters = {
    'tip-obroka': '',
    'tip-ishrane': '',
    'max-calories': null,
    'search': '',
    'showFavoritesOnly': false
};

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
const tipObrokaFilter = document.getElementById('tipObrokaFilter');
const tipIshraneFilter = document.getElementById('tipIshrane Filter');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const searchInput = document.getElementById('searchInput');
const maxMinutasInput = document.getElementById('maxMinutasInput');
const searchBtn = document.querySelector('.search-btn');
const favoritesFilterBtn = document.getElementById('favoritesFilterBtn');
const favoriteButtons = document.querySelectorAll('.favorite-btn');

// Fetch and display all recipes from database
async function fetchAllRecipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.error('Failed to fetch recipes from database');
            return false;
        }
        
        const data = await response.json();
        const dbRecipes = data.recipes || [];
        
        console.log('Fetched recipes from database:', dbRecipes);
        
        // Convert database recipes to the format used by the page
        const recipesGrid = document.querySelector('.recipes-grid');
        recipesGrid.innerHTML = '';
        
        dbRecipes.forEach(recipe => {
            const recipeCard = createDatabaseRecipeCard(recipe);
            recipesGrid.appendChild(recipeCard);
        });
        
        return true;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return false;
    }
}

function createDatabaseRecipeCard(recipe) {
    const mealTypeLabel = getMealTypeLabel(recipe.meal_type);
    const difficultyLabel = getDifficultyLabel(recipe.difficulty);
    
    // Determine diet type label
    let dietLabel = 'Ostalo';
    if (recipe.is_halal) {
        dietLabel = 'Halal';
    } else if (recipe.is_posno) {
        dietLabel = 'Posno';
    }
    
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.recipe = recipe.id;
    
    // Determine image source
    let imageSrc = '';
    if (recipe.image_url && recipe.image_url.startsWith('http')) {
        imageSrc = recipe.image_url;
    } else if (recipe.image_url) {
        imageSrc = API_BASE_URL + '/uploads/' + recipe.image_url;
    } else if (recipe.image) {
        // Hardcoded recipe - add ../ prefix for relative path
        imageSrc = '../' + recipe.image;
    }
    
    card.innerHTML = `
        <div class="recipe-image">
            <img src="${imageSrc}" alt="${recipe.title}">
            <button class="favorite-btn" data-recipe="${recipe.id}">
                <i class="far fa-heart"></i>
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
            </div>
            <p class="difficulty"><i class="fas fa-signal"></i> Slozenost: ${difficultyLabel}</p>
            <button class="btn-recipe-details">Detaljnije</button>
        </div>
    `;
    
    return card;
}

function getMealTypeLabel(mealType) {
    const labels = {
        'dorucak': 'Doručak',
        'rucak': 'Ručak',
        'vecera': 'Večera',
        'uzina': 'Užina'
    };
    return labels[mealType] || mealType;
}

function getDifficultyLabel(difficulty) {
    const labels = {
        'lako': 'Lako',
        'srednje': 'Srednje',
        'tesko': 'Teško'
    };
    return labels[difficulty] || difficulty;
}

function getDietTypeLabel(dietType) {
    const labels = {
        'posno': 'Posno',
        'vegetarijansko': 'Vegetarijansko',
        'vegansko': 'Vegansko',
        'halal': 'Halal'
    };
    return labels[dietType] || dietType;
}

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
            const authPopup = document.getElementById('authPopup');
            if (authPopup) {
                const loginForm = document.getElementById('loginForm');
                const signupForm = document.getElementById('signupForm');
                authPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                loginForm.classList.add('active');
                signupForm.classList.remove('active');
                document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
                document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
            }
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

// Filter Dropdown Handlers
tipObrokaFilter.addEventListener('change', (e) => {
    activeFilters['tip-obroka'] = e.target.value;
    console.log('Tip obroka filter:', activeFilters['tip-obroka']);
    applyFilters();
});

tipIshraneFilter.addEventListener('change', (e) => {
    activeFilters['tip-ishrane'] = e.target.value;
    console.log('Tip ishrane filter:', activeFilters['tip-ishrane']);
    applyFilters();
});

// Search Handler
searchInput.addEventListener('input', (e) => {
    activeFilters.search = e.target.value.toLowerCase();
    console.log('Search:', activeFilters.search);
    applyFilters();
});

// Max Minutes Handler
maxMinutasInput.addEventListener('input', (e) => {
    activeFilters['max-minutos'] = e.target.value ? parseInt(e.target.value) : null;
    console.log('Max minutos:', activeFilters['max-minutos']);
    applyFilters();
});

// Apply Filters - Call API
async function applyFilters() {
    console.log('Applying filters:', activeFilters);
    
    let recipesList = [];
    
    // If showing favorites only
    if (activeFilters['showFavoritesOnly']) {
        try {
            const response = await fetch(`${API_BASE_URL}/my-recipes`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                let dbRecipes = await response.json();
                console.log('Fetched favorites:', dbRecipes);
                // Don't merge hardcoded with favorites - only show user's saved recipes
                recipesList = dbRecipes;
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    } else {
        // Build query parameters for search
        const params = new URLSearchParams();
        
        if (activeFilters.search) {
            params.append('searchName', activeFilters.search);
        }
        
        if (activeFilters['tip-obroka']) {
            params.append('meal_type', activeFilters['tip-obroka']);
        }
        
        if (activeFilters['tip-ishrane']) {
            params.append('posno', activeFilters['tip-ishrane'] === 'posno' ? '1' : '0');
        }
        
        if (activeFilters['max-minutos']) {
            params.append('max_time', activeFilters['max-minutos']);
        }
        
        try {
            const queryString = params.toString();
            const url = queryString 
                ? `${API_BASE_URL}/search?${queryString}`
                : `${API_BASE_URL}/recipes`;
            
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                let dbRecipes = await response.json();
                console.log('Fetched recipes from database:', dbRecipes);
                recipesList = dbRecipes;
            } else {
                // If fetch fails, start with empty list
                recipesList = [];
            }
        } catch (error) {
            console.error('Error applying filters:', error);
            recipesList = [];
        }
        
        // Apply filters to all recipes (database only, no hardcoded)
        recipesList = filterRecipes(recipesList);
    }
    
    // Display filtered recipes
    displayRecipes(recipesList);
}

function filterRecipes(recipes) {
    return recipes.filter(recipe => {
        // Filter by meal type
        if (activeFilters['tip-obroka'] && recipe.meal_type !== activeFilters['tip-obroka']) {
            return false;
        }
        
        // Filter by diet type (posno = is_posno)
        if (activeFilters['tip-ishrane'] === 'posno' && !recipe.is_posno) {
            return false;
        }
        
        // Filter by max time
        if (activeFilters['max-minutos']) {
            const prepTime = recipe.prep_time_minutes || 0;
            if (prepTime > activeFilters['max-minutos']) {
                return false;
            }
        }
        
        // Filter by search name
        if (activeFilters.search) {
            const searchLower = activeFilters.search.toLowerCase();
            if (!recipe.title.toLowerCase().includes(searchLower)) {
                return false;
            }
        }
        
        return true;
    });
}

function displayRecipes(recipes) {
    const recipesGrid = document.querySelector('.recipes-grid');
    recipesGrid.innerHTML = '';
    
    if (recipes.length === 0) {
        recipesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">Nema recepata koji odgovaraju vašim filterima.</p>';
        return;
    }
    
    recipes.forEach(recipe => {
        const recipeCard = createDatabaseRecipeCard(recipe);
        recipesGrid.appendChild(recipeCard);
    });
    
    // Re-attach favorite button listeners
    attachFavoriteButtonListeners();
    updateFavoriteButtons();
    
    // Attach details button listeners
    attachDetailsButtonListeners();
}

function attachFavoriteButtonListeners() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    favoriteButtons.forEach(btn => {
        btn.removeEventListener('click', handleFavoriteClick);
        btn.addEventListener('click', handleFavoriteClick);
    });
}

function handleFavoriteClick(e) {
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
    
    const recipeId = this.dataset.recipe;
    const isCurrentlyFavorite = favorites.includes(recipeId.toString());
    
    // All recipes are from database - save to backend
    const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
    
    fetch(`${API_BASE_URL}/recipes/${recipeId}/save`, {
        method: method,
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            // Update local favorites
            if (isCurrentlyFavorite) {
                favorites = favorites.filter(id => id !== recipeId.toString());
            } else {
                favorites.push(recipeId.toString());
            }
            
            saveFavorites();
            updateFavoriteButtons();
            showCustomAlert('Uspešno', 'Dodan u favorite');
            console.log('Recipe favorite toggled for:', recipeId, 'Favorites:', favorites);
        } else {
            showCustomAlert('Greška pri dodavanju u favorite', 'Greška');
            console.error('Failed to save favorite');
        }
    })
    .catch(error => {
        showCustomAlert('Greška pri dodavanju u favorite', 'Greška');
        console.error('Error saving favorite:', error);
    });
}

function attachDetailsButtonListeners() {
    const detailsButtons = document.querySelectorAll('.btn-recipe-details');
    
    detailsButtons.forEach(btn => {
        btn.addEventListener('click', handleDetailsClick);
    });
}

function handleDetailsClick(e) {
    e.stopPropagation();
    
    const card = this.closest('.recipe-card');
    const recipeId = card.dataset.recipe;
    
    // Get image from the card directly
    const cardImage = card.querySelector('img');
    const cardImageSrc = cardImage ? cardImage.src : '';
    
    // All recipes are from database now
    const title = card.querySelector('h3').textContent;
    const stats = card.querySelectorAll('.stat');
    
    document.getElementById('popupImage').src = cardImageSrc;
    document.getElementById('popupImage').alt = title;
    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupDescription').textContent = 'Detalji recepta';
    
    // Set stats from card
    const popupStats = document.getElementById('popupStats');
    const statsText = Array.from(stats).map(s => s.textContent);
    
    popupStats.innerHTML = `
        <div style="display: flex; gap: 20px;">
            <div>
                <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${statsText[0]?.split(' ')[0] || 'N/A'}</span>
                <span style="color: #666; margin-left: 5px;">kcal</span>
            </div>
            <div>
                <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${statsText[1]?.split('g')[0] || 'N/A'}g</span>
                <span style="color: #666; margin-left: 5px;">protein</span>
            </div>
        </div>
    `;
    
    // Clear ingredients/instructions (not available in database schema)
    document.getElementById('ingredientsList').innerHTML = '<li>Detalji recepta nisu dostupni</li>';
    document.getElementById('instructionsList').innerHTML = '<li>Detalji recepta nisu dostupni</li>';
    document.getElementById('nutritionGrid').innerHTML = '';
    
    recipePopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}


// Search Button Click
searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    applyFilters();
});

// Favorites Filter Button Click
favoritesFilterBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (!authState.isLoggedIn) {
        authPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
        document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
        return;
    }
    
    // Toggle favorites filter
    activeFilters['showFavoritesOnly'] = !activeFilters['showFavoritesOnly'];
    
    // Clear other filters when showing favorites
    if (activeFilters['showFavoritesOnly']) {
        activeFilters['tip-obroka'] = '';
        activeFilters['tip-ishrane'] = '';
        activeFilters['max-minutos'] = null;
        activeFilters['search'] = '';
        
        tipObrokaFilter.value = '';
        tipIshraneFilter.value = '';
        maxMinutasInput.value = '';
        searchInput.value = '';
    }
    
    favoritesFilterBtn.classList.toggle('active');
    await applyFilters();
});

// Clear Filters
clearFiltersBtn.addEventListener('click', () => {
    // Reset all filters
    activeFilters = {
        'tip-obroka': '',
        'tip-ishrane': '',
        'max-calories': null,
        'search': '',
        'showFavoritesOnly': false
    };
    
    // Reset UI
    tipObrokaFilter.value = '';
    tipIshraneFilter.value = '';
    searchInput.value = '';
    maxMinutasInput.value = '';
    favoritesFilterBtn.classList.remove('active');
    
    console.log('Filters cleared');
    applyFilters();
});

// Open Recipe Popup
recipeCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-recipe-details')) {
            const recipeId = card.dataset.recipe;
            
            // Get recipe from hardcoded recipes object
            const recipe = recipes[recipeId];
            
            if (recipe) {
                // Handle image path - add ../ prefix for hardcoded recipes
                let imageSrc = recipe.image;
                if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('../')) {
                    imageSrc = '../' + imageSrc;
                }
                
                document.getElementById('popupImage').src = imageSrc;
                document.getElementById('popupImage').alt = recipe.title;
                document.getElementById('popupTitle').textContent = recipe.title;
                
                // Set stats
                const popupStats = document.getElementById('popupStats');
                const kcal = recipe.nutrition['Kcal'] || recipe.calories;
                const protein = recipe.nutrition['Protein'] || recipe.protein;
                const fats = recipe.nutrition['Masti'] || recipe.fats;
                
                popupStats.innerHTML = `
                    <div style="display: flex; gap: 20px;">
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${kcal}</span>
                            <span style="color: #666; margin-left: 5px;">kcal</span>
                        </div>
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${protein}</span>
                            <span style="color: #666; margin-left: 5px;">protein</span>
                        </div>
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${fats}</span>
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
    const authPopup = document.getElementById('authPopup');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
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
            document.getElementById('mobileMenu').classList.remove('active');
            document.body.style.overflow = 'hidden';
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
            document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
        });
    }
}

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

// Helper functions
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

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
            
            // Store user email in localStorage
            setUserEmail(email);
            
            authPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
            loginForm.reset();
            submitBtn.textContent = 'Prijavi se';
            submitBtn.disabled = false;
            
            // Update navbar
            updateNavbarAuth();
            
            // Show success message
            alert(data.message);
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
    
    // Setup auth buttons
    setupAuthButtons();
    
    // Load favorites from backend if logged in, otherwise from localStorage
    await loadFavoritesFromBackend();
    
    // Apply filters (which will fetch and display recipes)
    await applyFilters();
});
