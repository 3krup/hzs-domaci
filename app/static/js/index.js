const API_URL = 'http://127.0.0.1:5000';

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

let favorites = [];
let isLoggedIn = false;
let currentUser = null;

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

function loadFavorites() {
    const stored = localStorage.getItem('favorites');
    if (stored) {
        favorites = JSON.parse(stored);
        updateFavoriteButtons();
    }
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

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

favoriteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (!isLoggedIn) {
            authPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
            document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
            return;
        }
        
        const recipeId = btn.dataset.recipe;
        
        if (favorites.includes(recipeId)) {
            favorites = favorites.filter(id => id !== recipeId);
        } else {
            favorites.push(recipeId);
        }
        
        saveFavorites();
        updateFavoriteButtons();
    });
});

// Recipe Popup
recipeCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-recipe-details')) {
            const recipeId = card.dataset.recipe;
            const recipe = recipes[recipeId];
            
            if (recipe) {
                document.getElementById('popupImage').src = recipe.image;
                document.getElementById('popupImage').alt = recipe.title;
                document.getElementById('popupTitle').textContent = recipe.title;
                
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
                
                const ingredientsList = document.getElementById('ingredientsList');
                ingredientsList.innerHTML = recipe.ingredients
                    .map(ingredient => `<li>${ingredient}</li>`)
                    .join('');
                
                const instructionsList = document.getElementById('instructionsList');
                instructionsList.innerHTML = recipe.instructions
                    .map((step, index) => `<li>${step}</li>`)
                    .join('');
                
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

// Mobile Menu
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

// AUTH HANDLERS
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

// LOGIN
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
            headers: {
                'Content-Type': 'application/json'
            },
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
        } else {
            document.getElementById('loginEmailError').textContent = data.message || 'Greška pri prijavi';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginEmailError').textContent = 'Greška pri povezivanju sa serverom';
    }
});

// SIGNUP
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
            headers: {
                'Content-Type': 'application/json'
            },
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

// Back to top button
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

// Close popups with Escape
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
    const user = localStorage.getItem('user');
    if (user) {
        isLoggedIn = true;
        currentUser = user;
        updateButtonUI();
    }
});
