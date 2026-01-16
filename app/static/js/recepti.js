// Recipe Data - Same as index page
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
            "Ugljeni hidrati": "8g",
            "Vlakna": "5g",
            "Šećer": "2g",
            "Nasićene masti": "8g",
            "Holesterol": "425mg",
            "Natrijum": "520mg"
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
            "Ugljeni hidrati": "12g",
            "Vlakna": "2g",
            "Šećer": "8g",
            "Nasićene masti": "3g",
            "Holesterol": "85mg",
            "Natrijum": "650mg"
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
            "Ugljeni hidrati": "24g",
            "Vlakna": "6g",
            "Šećer": "14g",
            "Nasićene masti": "5g",
            "Holesterol": "65mg",
            "Natrijum": "220mg"
        }
    }
};

// State Management - Backend ready
let activeFilters = {
    'tip-obroka': '',
    'tip-ishrane': '',
    'max-calories': null,
    'search': ''
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
const maxCaloriesInput = document.getElementById('maxCaloriesInput');
const favoriteButtons = document.querySelectorAll('.favorite-btn');

// Load favorites from localStorage
function loadFavorites() {
    const stored = localStorage.getItem('favorites');
    if (stored) {
        favorites = JSON.parse(stored);
        updateFavoriteButtons();
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
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const recipeId = btn.dataset.recipe;
        
        if (favorites.includes(recipeId)) {
            favorites = favorites.filter(id => id !== recipeId);
        } else {
            favorites.push(recipeId);
        }
        
        saveFavorites();
        updateFavoriteButtons();
        
        // TODO: Send to backend when implemented
        console.log('Favorite toggled for:', recipeId, 'Favorites:', favorites);
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

// Max Calories Handler
maxCaloriesInput.addEventListener('input', (e) => {
    activeFilters['max-calories'] = e.target.value ? parseInt(e.target.value) : null;
    console.log('Max calories:', activeFilters['max-calories']);
    applyFilters();
});

// Apply Filters
function applyFilters() {
    // TODO: This will be replaced with backend API call
    // For now, it's ready for backend integration
    console.log('Applying filters:', activeFilters);
    // In real implementation, send activeFilters to backend
    // const response = await fetch('/api/recipes/filter', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(activeFilters)
    // });
    // const filtered = await response.json();
}

// Clear Filters
clearFiltersBtn.addEventListener('click', () => {
    // Reset all filters
    activeFilters = {
        'tip-obroka': '',
        'tip-ishrane': '',
        'max-calories': null,
        'search': ''
    };
    
    // Reset UI
    tipObrokaFilter.value = '';
    tipIshraneFilter.value = '';
    searchInput.value = '';
    maxCaloriesInput.value = '';
    
    console.log('Filters cleared');
    applyFilters();
});

// Open Recipe Popup
recipeCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-recipe-details')) {
            const recipeId = card.dataset.recipe;
            const recipe = recipes[recipeId];
            
            if (recipe) {
                document.getElementById('popupImage').src = recipe.image;
                document.getElementById('popupImage').alt = recipe.title;
                document.getElementById('popupTitle').textContent = recipe.title;
                
                // Set stats
                const popupStats = document.getElementById('popupStats');
                popupStats.innerHTML = `
                    <div style="display: flex; gap: 20px;">
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${recipe.calories}</span>
                            <span style="color: #666; margin-left: 5px;">kcal</span>
                        </div>
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${recipe.protein}</span>
                            <span style="color: #666; margin-left: 5px;">protein</span>
                        </div>
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: #578B62;">${recipe.fats}</span>
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
prijaviSeBtn.addEventListener('click', () => {
    authPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
    document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
});

prijaviSeMobileBtn?.addEventListener('click', () => {
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

// Form Validation
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    let isValid = true;
    
    // Clear previous errors
    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';
    
    // Email validation
    if (!email) {
        document.getElementById('loginEmailError').textContent = 'Email je obavezan';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('loginEmailError').textContent = 'Unesite validan email';
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Lozinka je obavezna';
        isValid = false;
    }
    
    if (isValid) {
        // TODO: Send to backend
        console.log('Login data:', { email, password });
        alert('Uspešna prijava! (simulacija)');
        authPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        loginForm.reset();
    }
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();
    let isValid = true;
    
    // Clear previous errors
    document.getElementById('signupNameError').textContent = '';
    document.getElementById('signupEmailError').textContent = '';
    document.getElementById('signupPasswordError').textContent = '';
    document.getElementById('signupConfirmError').textContent = '';
    
    // Name validation
    if (!name) {
        document.getElementById('signupNameError').textContent = 'Ime je obavezno';
        isValid = false;
    } else if (name.length < 2) {
        document.getElementById('signupNameError').textContent = 'Ime mora imati najmanje 2 karaktera';
        isValid = false;
    }
    
    // Email validation
    if (!email) {
        document.getElementById('signupEmailError').textContent = 'Email je obavezan';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('signupEmailError').textContent = 'Unesite validan email';
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        document.getElementById('signupPasswordError').textContent = 'Lozinka je obavezna';
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('signupPasswordError').textContent = 'Lozinka mora imati najmanje 6 karaktera';
        isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword) {
        document.getElementById('signupConfirmError').textContent = 'Potvrdite lozinku';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('signupConfirmError').textContent = 'Lozinke se ne poklapaju';
        isValid = false;
    }
    
    if (isValid) {
        // TODO: Send to backend
        console.log('Signup data:', { name, email, password });
        alert('Uspešna registracija! (simulacija)');
        authPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        signupForm.reset();
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
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
});
