document.addEventListener('DOMContentLoaded', async () => {
    console.log('kreiranje.js DOMContentLoaded - checking auth status');
    const isLoggedIn = await checkAuthStatus();
    console.log('Auth status:', isLoggedIn);
    
    if (!isLoggedIn) {
        console.log('User not logged in - showing alert');
        // Show custom alert and redirect
        showCustomAlert('Morate biti ulogovani da biste kreirali recepte!', 'Pristup odbijen');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    console.log('User logged in - initializing auth');
    // Initialize auth UI
    await initializeAuth();
    setupAuthButtons();
    
    // Initialize recipe creator
    console.log('Initializing recipe creator');
    new RecipeCreator();
    
    // Fetch and display user's recipes
    await fetchAndDisplayUserRecipes();
});

// Check if user is logged in before allowing access
// Fetch and display user's recipes
async function fetchAndDisplayUserRecipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/my-recipes`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.error('Failed to fetch recipes');
            return;
        }
        
        const data = await response.json();
        const recipes = data.recipes || [];
        
        console.log('Fetched recipes:', recipes);
        
        const recipesGrid = document.querySelector('.recipes-grid');
        
        // Clear grid (keep the add recipe card)
        const addCard = recipesGrid.querySelector('#addRecipeCard');
        recipesGrid.innerHTML = '';
        recipesGrid.appendChild(addCard);
        
        // Display each recipe
        recipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            recipesGrid.appendChild(recipeCard);
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}

function createRecipeCard(recipe) {
    const mealTypeLabel = getMealTypeLabel(recipe.meal_type);
    const difficultyLabel = getDifficultyLabel(recipe.difficulty);
    const dietLabel = getDietTypeLabel(recipe.diet_type);
    
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
        <div class="recipe-image">
            <img src="${API_BASE_URL}/uploads/${recipe.image_url}" alt="${recipe.title}">
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

// Recipe Creation Form Handler
class RecipeCreator {
    constructor() {
        this.form = document.getElementById('createRecipeForm');
        this.popup = document.getElementById('createRecipePopup');
        this.addRecipeCard = document.getElementById('addRecipeCard');
        this.closePopupBtn = document.getElementById('closePopup');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.imagePreview = document.getElementById('imagePreview');
        this.recipeImage = document.getElementById('recipeImage');
        
        this.recipeData = {
            image: null,
            name: '',
            difficulty: '',
            prepTime: 0,
            mealType: '',
            dietType: '',
            ingredients: [],
            instructions: [],
            nutrition: {
                kcal: 0,
                protein: 0,
                masti: 0
            }
        };
        
        this.init();
    }
    
    init() {
        // Add Recipe Card Click
        this.addRecipeCard.addEventListener('click', () => this.openPopup());
        
        // Close Popup
        this.closePopupBtn.addEventListener('click', () => this.closePopup());
        this.cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.closePopup();
        });
        
        // Close popup when clicking outside
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.closePopup();
            }
        });
        
        // Image Upload
        this.imagePreview.addEventListener('click', () => this.recipeImage.click());
        this.recipeImage.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Form Submit
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Mobile Menu
        this.setupMobileMenu();
        
        // Scroll to Top
        this.setupScrollToTop();
    }
    
    openPopup() {
        this.popup.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.resetForm();
    }
    
    closePopup() {
        this.popup.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    resetForm() {
        this.form.reset();
        this.imagePreview.classList.remove('has-image');
        this.recipeData = {
            image: null,
            name: '',
            difficulty: '',
            prepTime: 0,
            mealType: '',
            dietType: '',
            ingredients: [],
            instructions: [],
            nutrition: {
                kcal: 0,
                protein: 0,
                masti: 0
            }
        };
    }
    
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            // Store the actual file object for FormData
            this.recipeData.image = file;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (event) => {
                this.displayImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
    
    displayImagePreview(imageSrc) {
        this.imagePreview.classList.add('has-image');
        // Remove existing image if any
        const existingImg = this.imagePreview.querySelector('img');
        if (existingImg) {
            existingImg.remove();
        }
        // Add new image
        const img = document.createElement('img');
        img.src = imageSrc;
        this.imagePreview.appendChild(img);
    }
    
    
    collectFormData() {
        this.recipeData.name = document.getElementById('recipeName').value;
        this.recipeData.difficulty = document.getElementById('difficulty').value;
        this.recipeData.prepTime = parseInt(document.getElementById('prepTime').value);
        this.recipeData.mealType = document.getElementById('mealType').value;
        this.recipeData.dietType = document.getElementById('dietType').value;
        
        // Parse ingredients (split by newline)
        const ingredientsText = document.getElementById('ingredients').value;
        this.recipeData.ingredients = ingredientsText
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');
        
        // Parse instructions (split by newline)
        const instructionsText = document.getElementById('instructions').value;
        this.recipeData.instructions = instructionsText
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');
        
        // Mandatory nutrition values
        this.recipeData.nutrition.kcal = parseFloat(document.querySelector('[data-nutrition="kcal"]').value) || 0;
        this.recipeData.nutrition.protein = parseFloat(document.querySelector('[data-nutrition="protein"]').value) || 0;
        this.recipeData.nutrition.masti = parseFloat(document.querySelector('[data-nutrition="masti"]').value) || 0;
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate required fields
        if (!this.form.checkValidity()) {
            showCustomAlert('Molimo popunite sve obavezne polje', 'Greška');
            return;
        }
        
        // Collect all form data
        this.collectFormData();
        
        // Validate image
        if (!this.recipeData.image) {
            showCustomAlert('Molimo izaberite sliku', 'Greška');
            return;
        }
        
        // Validate ingredients and instructions
        if (this.recipeData.ingredients.length === 0) {
            showCustomAlert('Molimo dodajte bar jedan sastojak', 'Greška');
            return;
        }
        
        if (this.recipeData.instructions.length === 0) {
            showCustomAlert('Molimo dodajte bar jedan korak pripreme', 'Greška');
            return;
        }
        
        // Prepare FormData for multipart/form-data
        const formData = new FormData();
        formData.append('image', this.recipeData.image);
        formData.append('title', this.recipeData.name);
        formData.append('difficulty', this.recipeData.difficulty);
        formData.append('meal_type', this.recipeData.mealType);
        formData.append('kcal', this.recipeData.nutrition.kcal);
        formData.append('protein', this.recipeData.nutrition.protein);
        formData.append('fat', this.recipeData.nutrition.masti);
        formData.append('ingredients', this.recipeData.ingredients.join('\n'));
        formData.append('preparation_steps', this.recipeData.instructions.join('\n'));
        
        // Send to API
        await this.sendToAPI(formData);
    }
    
    async sendToAPI(formData) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Čuvanje...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/add-recipe`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showCustomAlert('Recept uspešno dodat!', 'Uspeh');
                this.closePopup();
                this.resetForm();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Refresh page after 1 second to show new recipe
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showCustomAlert(data.message || 'Greška pri dodavanju recepta', 'Greška');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('Greška pri dodavanju recepta. Pokušajte kasnije.', 'Greška');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    

    
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
        
        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }
    
    setupScrollToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Show button on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RecipeCreator();
});
