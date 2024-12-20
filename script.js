// Menu functionality
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const menuContainer = document.querySelector('.menu-container');

// Toggle menu when hamburger icon is clicked
menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    mainNav.classList.toggle('show');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuContainer.contains(e.target)) {
        mainNav.classList.remove('show');
    }
});

// Close menu when nav item is clicked
mainNav.addEventListener('click', () => {
    mainNav.classList.remove('show');
});

// Login Modal functionality
const loginModal = document.getElementById('login-modal');
const loginButton = document.getElementById('login-button');
const closeModalButton = document.querySelector('.close-modal');
const googleLoginButton = document.querySelector('.google-login');
const guestLoginButton = document.querySelector('.guest-login');

let isLoggedIn = false;
let currentUser = null;

// Open modal
loginButton.addEventListener('click', () => {
    loginModal.classList.add('show');
});

// Close modal when clicking close button
closeModalButton.addEventListener('click', () => {
    loginModal.classList.remove('show');
});

// Close modal when clicking outside
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('show');
    }
});

// Mock Google OAuth login
googleLoginButton.addEventListener('click', async () => {
    // Simulate OAuth flow
    try {
        // In a real implementation, this would redirect to Google's OAuth page
        await mockGoogleAuth();
        loginModal.classList.remove('show');
        updateLoginState(true, {
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            picture: 'https://ui-avatars.com/api/?name=John+Doe'
        });
        showStatus('Successfully logged in with Google', 'success');
    } catch (error) {
        showStatus('Failed to login with Google', 'error');
    }
});

// Guest login
guestLoginButton.addEventListener('click', () => {
    updateLoginState(true, {
        name: 'Guest User',
        email: 'guest@wingman.com',
        picture: 'https://ui-avatars.com/api/?name=Guest+User'
    });
    loginModal.classList.remove('show');
    showStatus('Logged in as guest', 'success');
});

function updateLoginState(loggedIn, user) {
    isLoggedIn = loggedIn;
    currentUser = user;
    
    // Update UI
    loginButton.innerHTML = isLoggedIn 
        ? `<i class="fas fa-user-circle"></i> ${currentUser.name}`
        : '<i class="fas fa-sign-in-alt"></i> Login';
}

// Mock Google Auth (simulates OAuth flow)
function mockGoogleAuth() {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(resolve, 1000);
    });
}

// Ride selection functionality
const rideCards = document.querySelectorAll('.ride-card');
const bookButton = document.getElementById('book-ride');
const statusMessage = document.getElementById('status-message');
let selectedRide = null;

rideCards.forEach(card => {
    card.addEventListener('click', () => {
        // Remove selected class from all cards
        rideCards.forEach(c => c.classList.remove('selected'));
        // Add selected class to clicked card
        card.classList.add('selected');
        selectedRide = card.dataset.ride;
    });
});

bookButton.addEventListener('click', () => {
    if (!isLoggedIn) {
        showStatus('Please login to book a ride', 'error');
        loginModal.classList.add('show');
        return;
    }

    const pickup = document.getElementById('pickup').value;
    const destination = document.getElementById('destination').value;

    if (!pickup || !destination) {
        showStatus('Please enter pickup and destination locations.', 'error');
        return;
    }

    if (!selectedRide) {
        showStatus('Please select a ride option.', 'error');
        return;
    }

    // Simulate booking success
    showStatus('Booking successful! Your ride is on the way.', 'success');
});

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        statusMessage.className = 'status-message';
    }, 5000);
}
