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
