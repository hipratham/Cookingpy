// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Global variables
let ingredientsList = [];
let isDarkTheme = false;
let foodParticles = [];
let isFirstSearch = true;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
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
        ScrollTrigger.create({
            trigger: title,
            start: 'top 80%',
            onEnter: () => title.classList.add('active'),
            once: true
        });
    });
    
    // Animate glass cards when scrolled into view
    gsap.utils.toArray('.glass-card').forEach(card => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 80%',
            onEnter: () => card.classList.add('active'),
            once: true
        });
    });
    
    // Animate input container
    ScrollTrigger.create({
        trigger: '.input-container',
        start: 'top 80%',
        onEnter: () => document.querySelector('.input-container').classList.add('active'),
        once: true
    });
}

// Setup event listeners
function setupEventListeners() {
    // Ingredient input events
    const ingredientsInput = document.getElementById('ingredients');
    
    ingredientsInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addIngredientTag();
        }
    });
    
    // Add ingredient button
    document.getElementById('add-ingredient-btn').addEventListener('click', function() {
        addIngredientTag();
    });
    
    // Quick ingredient buttons
    document.querySelectorAll('.quick-ingredient').forEach(btn => {
        btn.addEventListener('click', function() {
            const ingredient = this.textContent.trim();
            if (!ingredientsList.includes(ingredient)) {
                ingredientsList.push(ingredient);
                renderIngredientTags();
                createFoodParticleAt(this);
            }
        });
    });
    
    // How it works modal
    document.getElementById('how-it-works-btn').addEventListener('click', function() {
        showModal('how-it-works-modal');
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-close-btn, .modal-backdrop').forEach(elem => {
        elem.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Stop propagation on modal content
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Back to recipes button
    document.getElementById('back-to-recipes').addEventListener('click', function() {
        document.getElementById('recipe-detail-section').classList.add('hidden');
        document.getElementById('recipe-results').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', function() {
        toggleTheme();
    });
}

// Initialize Lottie animations
function initLottieAnimations() {
    // Cooking animation for hero section
    lottie.loadAnimation({
        container: document.getElementById('cooking-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets8.lottiefiles.com/packages/lf20_yvla9mj2.json' // Replace with your own animation path
    });
    
    // Loading animation
    lottie.loadAnimation({
        container: document.getElementById('cooking-loader'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets5.lottiefiles.com/packages/lf20_qdbb21wb.json' // Replace with your own animation path
    });
}

// Create food particles
function createFoodParticles() {
    const emojis = ['🍕', '🍔', '🌮', '🍣', '🍩', '🍎', '🥑', '🍗', '🥦', '🧀', '🍇', '🥐', '🍜', '🥟'];
    const container = document.getElementById('particles-container');
    
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
    particle.style