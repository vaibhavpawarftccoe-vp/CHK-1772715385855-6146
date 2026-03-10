/**
 * EduBot - Education Chatbot JavaScript
 * Enhanced interactivity with smooth scrolling and animations
 */

// ============================================
// DOM Elements
// ============================================
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const navbar = document.querySelector('.navbar');

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initSmoothScroll();
    initScrollAnimations();
    initChatInput();
});

// ============================================
// Navbar Scroll Effect
// ============================================
function initNavbar() {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ============================================
// Smooth Scroll for Navigation Links
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Scroll Animations using Intersection Observer
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.feature-card, .step, .benefit-content, .benefit-image'
    );
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// Add CSS class when element is visible
const style = document.createElement('style');
style.textContent = `
    .animate-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ============================================
// Chat Input Handling
// ============================================
function initChatInput() {
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Auto-focus input when chat section is visible
    const chatSection = document.getElementById('chat-section');
    const chatObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => userInput.focus(), 500);
            }
        });
    }, { threshold: 0.5 });
    
    chatObserver.observe(chatSection);
}

// ============================================
// Send Message Function
// ============================================
function sendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') return;

    // Remove welcome message if it exists
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Scroll to bottom
    scrollToBottom();

    // Send to server
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response with slight delay for natural feel
        setTimeout(() => {
            addMessage(data.reply, 'bot');
            scrollToBottom();
        }, 300);
    })
    .catch(error => {
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        scrollToBottom();
        console.error('Error:', error);
    });
}

// ============================================
// Send Quick Reply
// ============================================
function sendQuickReply(message) {
    userInput.value = message;
    sendMessage();
}

// ============================================
// Add Message to Chat
// ============================================
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = getCurrentTime();
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messageDiv.appendChild(time);
    
    chatbox.appendChild(messageDiv);
}

// ============================================
// Show Typing Indicator
// ============================================
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(indicator);
    
    chatbox.appendChild(typingDiv);
    scrollToBottom();
}

// ============================================
// Remove Typing Indicator
// ============================================
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ============================================
// Clear Chat
// ============================================
function clearChat() {
    chatbox.innerHTML = `
        <div class="welcome-message">
            <div class="bot-avatar-large">
                <i class="fas fa-robot"></i>
            </div>
            <h3>Welcome to EduBot!</h3>
            <p>I'm here to help you with:</p>
            <div class="quick-replies">
                <button class="quick-reply" onclick="sendQuickReply('Tell me about admissions')">Admissions</button>
                <button class="quick-reply" onclick="sendQuickReply('What courses do you offer?')">Courses</button>
                <button class="quick-reply" onclick="sendQuickReply('Placement information')">Placements</button>
                <button class="quick-reply" onclick="sendQuickReply('Campus facilities')">Facilities</button>
                <button class="quick-reply" onclick="sendQuickReply('Fee structure')">Fees</button>
                <button class="quick-reply" onclick="sendQuickReply('Contact information')">Contact</button>
            </div>
        </div>
    `;
}

// ============================================
// Scroll to Bottom of Chat
// ============================================
function scrollToBottom() {
    chatbox.scrollTop = chatbox.scrollHeight;
}

// ============================================
// Get Current Time
// ============================================
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// ============================================
// Mobile Menu Toggle (for future use)
// ============================================
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-open');
}

// ============================================
// Parallax Effect for Hero Section
// ============================================
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < hero.offsetHeight) {
        hero.style.backgroundPositionY = (scrolled * 0.5) + 'px';
    }
});

// ============================================
// Counter Animation for Stats
// ============================================
function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 30);
}

// Trigger counter animation when stats are visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                if (!isNaN(parseInt(text))) {
                    const target = parseInt(text);
                    const suffix = text.replace(/[0-9]/g, '');
                    stat.textContent = '0';
                    animateCounter(stat, target, suffix);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ============================================
// Demo Video Modal Functions
// ============================================
let demoInterval = null;
let demoCurrentStep = 1;
let demoTotalSteps = 5;
let demoIsPlaying = true;
let demoProgress = 0;

function openDemoVideo() {
    const modal = document.getElementById('demoVideoModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        startDemoAnimation();
    }
}

function closeDemoVideo() {
    const modal = document.getElementById('demoVideoModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        stopDemoAnimation();
    }
}

function startDemoAnimation() {
    demoCurrentStep = 1;
    demoProgress = 0;
    demoIsPlaying = true;
    
    updateDemoStep();
    
    // Progress animation (30 seconds total, 6 seconds per step)
    demoInterval = setInterval(() => {
        if (!demoIsPlaying) return;
        
        demoProgress += 0.5; // Update every 100ms
        
        const totalProgress = ((demoCurrentStep - 1) * 20) + (demoProgress / 6);
        document.getElementById('demoProgressFill').style.width = totalProgress + '%';
        
        // Update time display
        const currentSeconds = Math.floor((demoCurrentStep - 1) * 6 + demoProgress);
        document.getElementById('demoTime').textContent = 
            `00:${currentSeconds.toString().padStart(2, '0')} / 00:30`;
        
        if (demoProgress >= 6) {
            demoProgress = 0;
            demoCurrentStep++;
            
            if (demoCurrentStep > demoTotalSteps) {
                demoCurrentStep = 1; // Loop back to start
            }
            
            updateDemoStep();
        }
    }, 100);
}

function stopDemoAnimation() {
    if (demoInterval) {
        clearInterval(demoInterval);
        demoInterval = null;
    }
}

function updateDemoStep() {
    // Update showcase items
    document.querySelectorAll('.showcase-item').forEach((item, index) => {
        item.classList.toggle('active', index + 1 === demoCurrentStep);
    });
    
    // Update progress steps
    document.querySelectorAll('.progress-steps span').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === demoCurrentStep);
    });
}

function toggleDemoPlayback() {
    demoIsPlaying = !demoIsPlaying;
    const btn = document.getElementById('demoPlayBtn');
    if (btn) {
        btn.innerHTML = demoIsPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDemoVideo();
    }
});
