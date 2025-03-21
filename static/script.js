// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Global variables
let ingredientsList = [];
let isDarkTheme = false;
let foodParticles = [];
let isFirstSearch = true;

// Document ready function
document.addEventListener('DOMContentLoaded', function () {
    // Initialize animations
    initAnimations();

    // Setup event listeners
    setupEventListeners();

    // Initialize Lottie animations
    initLottieAnimations();

    // Create food particles
    createFoodParticles();

    // Trigger Hero animations
    setTimeout(() => {
        activateHeroAnimations();
    }, 500);
});

// Initialize animations
function initAnimations() {
    // Animate section titles when scrolled into view
    gsap.utils.toArray('.section-title').forEach(title => {
        if (title) {
            ScrollTrigger.create({
                trigger: title,
                start: 'top 80%',
                onEnter: () => title.classList.add('active'),
                once: true
            });
        }
    });

    // Animate glass cards when scrolled into view
    gsap.utils.toArray('.glass-card').forEach(card => {
        if (card) {
            ScrollTrigger.create({
                trigger: card,
                start: 'top 80%',
                onEnter: () => card.classList.add('active'),
                once: true
            });
        }
    });

    // Animate input container
    const inputContainer = document.querySelector('.input-container');
    if (inputContainer) {
        ScrollTrigger.create({
            trigger: '.input-container',
            start: 'top 80%',
            onEnter: () => inputContainer.classList.add('active'),
            once: true
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Ingredient input events
    const ingredientsInput = document.getElementById('ingredients');
    if (ingredientsInput) {
        ingredientsInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addIngredientTag();
            }
        });
    }

    // Add ingredient button
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', function () {
            addIngredientTag();
        });
    }

    // Quick ingredient buttons
    document.querySelectorAll('.quick-ingredient').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function () {
                const ingredient = this.textContent.trim();
                if (!ingredientsList.includes(ingredient)) {
                    ingredientsList.push(ingredient);
                    renderIngredientTags();
                    createFoodParticleAt(this);
                }
            });
        }
    });

    // How it works modal
    const howItWorksBtn = document.getElementById('how-it-works-btn');
    if (howItWorksBtn) {
        howItWorksBtn.addEventListener('click', function () {
            showModal('how-it-works-modal');
        });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-close-btn, .modal-backdrop').forEach(elem => {
        if (elem) {
            elem.addEventListener('click', function () {
                closeAllModals();
            });
        }
    });

    // Stop propagation on modal content
    document.querySelectorAll('.modal-content').forEach(content => {
        if (content) {
            content.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    });

    // Back to recipes button
    const backToRecipesBtn = document.getElementById('back-to-recipes');
    if (backToRecipesBtn) {
        backToRecipesBtn.addEventListener('click', function () {
            const recipeDetailSection = document.getElementById('recipe-detail-section');
            if (recipeDetailSection) {
                recipeDetailSection.classList.add('hidden');
            }
            const recipeResults = document.getElementById('recipe-results');
            if (recipeResults) {
                recipeResults.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            toggleTheme();
        });
    }
}

// Initialize Lottie animations
function initLottieAnimations() {
    // Check if Lottie is available
    if (typeof lottie === 'undefined') {
        console.warn('Lottie library not loaded. Animations will not work.');
        return;
    }

    // Cooking animation for hero section
    if (document.getElementById('cooking-animation')) {
        lottie.loadAnimation({
            container: document.getElementById('cooking-animation'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'https://assets8.lottiefiles.com/packages/lf20_yvla9mj2.json'
        });
    }

    // Loading animation
    if (document.getElementById('cooking-loader')) {
        lottie.loadAnimation({
            container: document.getElementById('cooking-loader'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'https://assets5.lottiefiles.com/packages/lf20_qdbb21wb.json'
        });
    }
}

// Create food particles
function createFoodParticles() {
    const emojis = ['🍕', '🍔', '🌮', '🍣', '🍩', '🍎', '🥑', '🍗', '🥦', '🧀', '🍇', '🥐', '🍜', '🥟'];
    const container = document.getElementById('particles-container');

    if (!container) {
        console.warn('Particles container not found');
        return;
    }

    // Create particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'food-particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        container.appendChild(particle);

        // Add to array for animation
        foodParticles.push(particle);

        // Set initial position
        gsap.set(particle, {
            x: Math.random() * window.innerWidth,
            y: -100,
            rotation: Math.random() * 360,
            opacity: 0
        });
    }

    // Animate particles
    animateFoodParticles();
}

// Animate food particles
function animateFoodParticles() {
    foodParticles.forEach((particle, index) => {
        const delay = index * 0.5;

        gsap.to(particle, {
            y: window.innerHeight + 100,
            x: `+=${Math.random() * 200 - 100}`,
            rotation: `+=${Math.random() * 720 - 360}`,
            opacity: 0.7,
            duration: 10 + Math.random() * 20,
            delay: delay,
            ease: 'power1.inOut',
            onComplete: () => {
                // Reset position
                gsap.set(particle, {
                    x: Math.random() * window.innerWidth,
                    y: -100,
                    rotation: Math.random() * 360
                });

                // Animate again
                gsap.to(particle, {
                    y: window.innerHeight + 100,
                    x: `+=${Math.random() * 200 - 100}`,
                    rotation: `+=${Math.random() * 720 - 360}`,
                    opacity: 0.7,
                    duration: 10 + Math.random() * 20,
                    ease: 'power1.inOut',
                    onComplete: () => {
                        // Recursive call for continuous animation
                        resetAndAnimateParticle(particle);
                    }
                });
            }
        });
    });
}

// Reset and animate a single particle
function resetAndAnimateParticle(particle) {
    gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: -100,
        rotation: Math.random() * 360
    });

    gsap.to(particle, {
        y: window.innerHeight + 100,
        x: `+=${Math.random() * 200 - 100}`,
        rotation: `+=${Math.random() * 720 - 360}`,
        opacity: 0.7,
        duration: 10 + Math.random() * 20,
        ease: 'power1.inOut',
        onComplete: () => resetAndAnimateParticle(particle)
    });
}

// Create food particle at an element
function createFoodParticleAt(element) {
    const emojis = ['🍕', '🍔', '🌮', '🍣', '🍩', '🍎', '🥑', '🍗', '🥦', '🧀', '🍇', '🥐', '🍜', '🥟'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Get position
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Create particle
    const particle = document.createElement('div');
    particle.className = 'food-particle';
    particle.textContent = emoji;
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    document.body.appendChild(particle);

    // Animate particle
    gsap.to(particle, {
        y: y - 100,
        x: x + (Math.random() * 100 - 50),
        rotation: Math.random() * 360,
        opacity: 0,
        duration: 1.5,
        ease: 'power1.inOut',
        onComplete: () => {
            particle.remove();
        }
    });
}

// Add ingredient tag
function addIngredientTag() {
    const ingredientsInput = document.getElementById('ingredients');
    const ingredient = ingredientsInput.value.trim();

    if (ingredient && !ingredientsList.includes(ingredient)) {
        ingredientsList.push(ingredient);
        renderIngredientTags();
        ingredientsInput.value = '';
    }
}

// Render ingredient tags
function renderIngredientTags() {
    const tagsContainer = document.getElementById('ingredient-tags');
    tagsContainer.innerHTML = '';

    ingredientsList.forEach((ingredient, index) => {
        const tag = document.createElement('div');
        tag.className = 'ingredient-tag bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center';
        tag.innerHTML = `
            <span>${ingredient}</span>
            <button onclick="removeIngredientTag(${index})" class="ml-2 text-orange-700 hover:text-orange-900">×</button>
        `;
        tagsContainer.appendChild(tag);
    });
}

// Remove ingredient tag
function removeIngredientTag(index) {
    ingredientsList.splice(index, 1);
    renderIngredientTags();
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        gsap.to(modal, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => modal.classList.add('hidden')
        });
    });
}

// Toggle theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
}

// Activate hero animations
function activateHeroAnimations() {
    gsap.from('.logo-icon', {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });

    gsap.from('.app-title', {
        y: -50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power2.out'
    });

    gsap.from('.tagline', {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: 'power2.out'
    });

    gsap.from('.search-container', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.6,
        ease: 'power2.out'
    });
}

// Get recipes
async function getRecipes() {
    const ingredientsInput = document.getElementById('ingredients');
    const ingredients = ingredientsInput.value.trim();
    
    if (!ingredients) {
        showNotification('Please enter some ingredients first!', 'error');
        return;
    }

    // Show loading animation
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('recipe-list').innerHTML = '';

    try {
        const response = await fetch('/get_recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: ingredients })
        });

        const data = await response.json();
        
        // Hide loading animation
        document.getElementById('loading').classList.add('hidden');

        if (data.recipes && data.recipes.length > 0) {
            const recipeList = document.getElementById('recipe-list');
            recipeList.innerHTML = '';
            
            data.recipes.forEach(recipe => {
                const recipeCard = createRecipeCard({
                    id: recipe.id,
                    title: recipe.title,
                    image: recipe.image || 'default-recipe-image.jpg',
                    tags: recipe.tags || ['Quick', 'Easy'],
                    cookTime: recipe.cookTime || '30',
                    servings: recipe.servings || '4',
                    rating: recipe.rating || '4.5'
                });
                recipeList.innerHTML += recipeCard;
            });
        } else {
            showNotification('No recipes found for these ingredients.', 'warning');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error fetching recipes. Please try again.', 'error');
        document.getElementById('loading').classList.add('hidden');
    }
}

// Function to show notifications
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    notification.classList.add(
        'notification',
        'p-4',
        'rounded-lg',
        'shadow-lg',
        'mb-4',
        type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500',
        'text-white'
    );
    
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Function to view recipe details
function viewRecipeDetails(recipeId) {
    // Show loading animation
    document.getElementById('loading').classList.remove('hidden');
    
    fetch(`/get_recipe_details/${recipeId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('recipe-list').classList.add('hidden');
            
            const detailsContainer = document.getElementById('recipe-details-container');
            const detailsContent = document.getElementById('recipe-details');
            
            detailsContent.innerHTML = `
                <h2 class="text-3xl font-bold mb-4">${data.title}</h2>
                <img src="${data.image}" alt="${data.title}" class="w-full rounded-lg mb-6">
                <div class="mb-6">
                    <h3 class="text-xl font-bold mb-2">Ingredients</h3>
                    <ul class="list-disc pl-6">
                        ${data.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3 class="text-xl font-bold mb-2">Instructions</h3>
                    <ol class="list-decimal pl-6">
                        ${data.instructions.map(step => `<li class="mb-2">${step}</li>`).join('')}
                    </ol>
                </div>
            `;
            
            detailsContainer.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error fetching recipe details. Please try again.', 'error');
            document.getElementById('loading').classList.add('hidden');
        });
}

// Back to recipes button handler
document.getElementById('back-to-recipes').addEventListener('click', () => {
    document.getElementById('recipe-details-container').classList.add('hidden');
    document.getElementById('recipe-list').classList.remove('hidden');
});

// Render recipes
function renderRecipes(recipes) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';

    if (recipes.length === 0) {
        recipeList.innerHTML = '<p class="text-gray-600 text-center">No recipes found. Try different ingredients!</p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-105';
        recipeCard.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2 dark:text-white">${recipe}</h3>
                <button onclick="getRecipeDetails('${recipe}')" class="text-orange-500 hover:text-orange-700">View Recipe</button>
            </div>
        `;
        recipeList.appendChild(recipeCard);
    });
}

// Get recipe details
function getRecipeDetails(recipeName) {
    fetch(`/get_recipe_details?recipe=${encodeURIComponent(recipeName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'error');
                return;
            }

            renderRecipeDetails(recipeName, data.recipe_details);
        })
        .catch(error => {
            console.error('Error fetching recipe details:', error);
            showNotification('Failed to fetch recipe details. Please try again.', 'error');
        });
}

// Render recipe details
function renderRecipeDetails(recipeName, details) {
    const recipeDetailsContainer = document.getElementById('recipe-details-container');
    const recipeDetails = document.getElementById('recipe-details');

    recipeDetails.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 dark:text-white">${recipeName}</h2>
        <div class="prose max-w-none dark:text-white">${details}</div>
    `;

    recipeDetailsContainer.classList.remove('hidden');
    recipeDetailsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Show notification
function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification bg-${type === 'error' ? 'red' : 'green'}-500 text-white px-4 py-2 rounded-lg shadow-lg`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const particlesContainer = document.getElementById('particles-container');
    
    // Initialize food particles
    function createFoodParticles() {
        if (!particlesContainer) {
            console.warn('Particles container not found');
            return;
        }

        const foods = ['🥕', '🥦', '🍅', '🥬', '🧄', '🥔'];
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('span');
            particle.className = 'food-particle';
            particle.textContent = foods[Math.floor(Math.random() * foods.length)];
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // Create particles when page loads
    createFoodParticles();
});