// Recipe Creation Form Handler
class RecipeCreator {
    constructor() {
        this.form = document.getElementById('createRecipeForm');
        this.popup = document.getElementById('createRecipePopup');
        this.addRecipeCard = document.getElementById('addRecipeCard');
        this.closePopupBtn = document.getElementById('closePopup');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.addNutritionBtn = document.getElementById('addNutritionBtn');
        this.imagePreview = document.getElementById('imagePreview');
        this.recipeImage = document.getElementById('recipeImage');
        this.additionalNutrition = document.getElementById('additionalNutrition');
        
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
                masti: 0,
                additional: []
            }
        };
        
        this.additionalNutritionCount = 0;
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
        
        // Add Additional Nutrition Field
        this.addNutritionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.addAdditionalNutritionField();
        });
        
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
        this.additionalNutrition.innerHTML = '';
        this.additionalNutritionCount = 0;
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
                masti: 0,
                additional: []
            }
        };
    }
    
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.recipeData.image = event.target.result;
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
    
    addAdditionalNutritionField() {
        this.additionalNutritionCount++;
        const fieldId = `additional-nutrition-${this.additionalNutritionCount}`;
        
        const container = document.createElement('div');
        container.className = 'additional-nutrition-item';
        container.id = fieldId;
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Naziv (npr. Ugljeni hidrati)';
        nameInput.className = 'nutrition-name-input';
        
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.placeholder = 'Vrednost (npr. 20g)';
        valueInput.className = 'nutrition-value-input';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-remove-nutrition';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            container.remove();
        });
        
        container.appendChild(nameInput);
        container.appendChild(valueInput);
        container.appendChild(removeBtn);
        
        this.additionalNutrition.appendChild(container);
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
        
        // Additional nutrition values
        this.recipeData.nutrition.additional = [];
        const additionalFields = this.additionalNutrition.querySelectorAll('.additional-nutrition-item');
        additionalFields.forEach(field => {
            const nameInput = field.querySelector('.nutrition-name-input').value;
            const valueInput = field.querySelector('.nutrition-value-input').value;
            if (nameInput && valueInput) {
                this.recipeData.nutrition.additional.push({
                    name: nameInput,
                    value: valueInput
                });
            }
        });
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate required fields
        if (!this.form.checkValidity()) {
            alert('Molimo popunite sve obavezne polje');
            return;
        }
        
        // Collect all form data
        this.collectFormData();
        
        // Validate ingredients and instructions
        if (this.recipeData.ingredients.length === 0) {
            alert('Molimo dodajte bar jedan sastojak');
            return;
        }
        
        if (this.recipeData.instructions.length === 0) {
            alert('Molimo dodajte bar jedan korak pripreme');
            return;
        }
        
        // Log data for API integration (ready for backend)
        console.log('Recipe Data Ready for API:', this.recipeData);
        
        // Prepare data for API
        const apiPayload = this.prepareAPIPayload();
        console.log('API Payload:', apiPayload);
        
        // TODO: Send to API when available
        // this.sendToAPI(apiPayload);
        
        // Success message
        alert('Recept je sacuvan!\n\nOvaj recept ce uskoro biti dostupan nakon integracije sa bazom podataka.');
        this.closePopup();
        this.resetForm();
    }
    
    prepareAPIPayload() {
        return {
            name: this.recipeData.name,
            difficulty: this.recipeData.difficulty,
            prepTime: this.recipeData.prepTime,
            tags: {
                meal: this.recipeData.mealType,
                diet: this.recipeData.dietType
            },
            ingredients: this.recipeData.ingredients,
            instructions: this.recipeData.instructions,
            nutrition: {
                kcal: this.recipeData.nutrition.kcal,
                protein: this.recipeData.nutrition.protein,
                masti: this.recipeData.nutrition.masti,
                additional: this.recipeData.nutrition.additional
            },
            image: this.recipeData.image, // Base64 or file reference
            createdAt: new Date().toISOString(),
            userId: null // Will be set from authentication
        };
    }
    
    // Placeholder for API integration
    sendToAPI(payload) {
        // TODO: Implement API call
        // fetch('/api/recipes', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${authToken}`
        //     },
        //     body: JSON.stringify(payload)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     console.log('Recipe created:', data);
        //     this.closePopup();
        //     this.resetForm();
        //     // Refresh recipes list
        // })
        // .catch(error => console.error('Error:', error));
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
