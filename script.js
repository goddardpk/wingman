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

// Address autocomplete functionality
class AddressAutocomplete {
    constructor(inputElement) {
        this.input = inputElement;
        this.dropdown = null;
        this.debounceTimer = null;
        this.selectedLocation = null;
        this.isLoading = false;

        this.setupDropdown();
        this.setupEventListeners();
    }

    setupDropdown() {
        // Create dropdown element
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'autocomplete-dropdown';
        this.dropdown.style.display = 'none';
        this.input.parentElement.appendChild(this.dropdown);

        // Create loading indicator
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'autocomplete-item';
        this.loadingIndicator.textContent = 'Searching...';
        this.loadingIndicator.style.display = 'none';
        this.dropdown.appendChild(this.loadingIndicator);
    }

    setupEventListeners() {
        // Input event with debounce
        this.input.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.handleInput(), 300);
        });

        // Focus event
        this.input.addEventListener('focus', () => {
            this.input.parentElement.classList.add('active');
            if (this.dropdown.children.length > 1) { // More than just loading indicator
                this.showDropdown();
            }
        });

        // Click outside event
        document.addEventListener('click', (e) => {
            if (!this.input.parentElement.contains(e.target)) {
                this.hideDropdown();
            }
        });

        // Prevent form submission on enter
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    async handleInput() {
        const query = this.input.value.trim();
        
        if (query.length < 3) {
            this.hideDropdown();
            return;
        }

        this.showLoading();

        try {
            const results = await this.searchAddress(query);
            if (results.length > 0) {
                this.showResults(results);
            } else {
                this.showNoResults();
            }
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
            this.showError();
        }

        this.hideLoading();
    }

    async searchAddress(query) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en-US,en;q=0.9',
                        'User-Agent': 'WingMan-RideApp/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Nominatim API error:', error);
            throw error;
        }
    }

    showResults(results) {
        this.clearDropdown();
        
        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            
            // Format the display address
            const address = this.formatAddress(result.address);
            item.textContent = address;
            
            item.addEventListener('click', () => {
                this.input.value = address;
                this.selectedLocation = {
                    name: address,
                    lat: result.lat,
                    lon: result.lon,
                    rawData: result
                };
                this.hideDropdown();
            });
            
            this.dropdown.appendChild(item);
        });

        this.showDropdown();
    }

    formatAddress(addressObj) {
        const parts = [];
        
        // Add house number and street
        if (addressObj.house_number && addressObj.road) {
            parts.push(`${addressObj.house_number} ${addressObj.road}`);
        } else if (addressObj.road) {
            parts.push(addressObj.road);
        }

        // Add neighborhood or suburb
        if (addressObj.suburb) {
            parts.push(addressObj.suburb);
        } else if (addressObj.neighbourhood) {
            parts.push(addressObj.neighbourhood);
        }

        // Add city
        if (addressObj.city) {
            parts.push(addressObj.city);
        } else if (addressObj.town) {
            parts.push(addressObj.town);
        }

        // Add state and country
        if (addressObj.state) {
            parts.push(addressObj.state);
        }
        if (addressObj.country) {
            parts.push(addressObj.country);
        }

        return parts.join(', ');
    }

    showNoResults() {
        this.clearDropdown();
        const noResults = document.createElement('div');
        noResults.className = 'autocomplete-item';
        noResults.textContent = 'No results found';
        this.dropdown.appendChild(noResults);
        this.showDropdown();
    }

    showError() {
        this.clearDropdown();
        const error = document.createElement('div');
        error.className = 'autocomplete-item';
        error.textContent = 'Error fetching suggestions. Please try again.';
        this.dropdown.appendChild(error);
        this.showDropdown();
    }

    showLoading() {
        this.isLoading = true;
        this.loadingIndicator.style.display = 'block';
        this.showDropdown();
    }

    hideLoading() {
        this.isLoading = false;
        this.loadingIndicator.style.display = 'none';
    }

    clearDropdown() {
        while (this.dropdown.children.length > 1) { // Keep loading indicator
            this.dropdown.removeChild(this.dropdown.lastChild);
        }
    }

    showDropdown() {
        this.dropdown.style.display = 'block';
        this.input.parentElement.classList.add('active');
    }

    hideDropdown() {
        this.dropdown.style.display = 'none';
        this.input.parentElement.classList.remove('active');
    }

    getSelectedLocation() {
        return this.selectedLocation;
    }
}

// Initialize autocomplete for pickup and destination inputs
const pickupAutocomplete = new AddressAutocomplete(document.getElementById('pickup'));
const destinationAutocomplete = new AddressAutocomplete(document.getElementById('destination'));

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

    const pickupLocation = pickupAutocomplete.getSelectedLocation();
    const destinationLocation = destinationAutocomplete.getSelectedLocation();

    if (!pickupLocation || !destinationLocation) {
        showStatus('Please select valid pickup and destination locations from the suggestions.', 'error');
        return;
    }

    if (!selectedRide) {
        showStatus('Please select a ride option.', 'error');
        return;
    }

    // Here you would typically send the coordinates to your backend
    console.log('Booking ride with coordinates:', {
        pickup: {
            lat: pickupLocation.lat,
            lon: pickupLocation.lon,
            address: pickupLocation.name
        },
        destination: {
            lat: destinationLocation.lat,
            lon: destinationLocation.lon,
            address: destinationLocation.name
        },
        rideType: selectedRide
    });

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
