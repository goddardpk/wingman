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

// Handle navigation item clicks
mainNav.addEventListener('click', (e) => {
    const helpLink = e.target.closest('a[href="help.html"]');
    if (helpLink) {
        e.preventDefault();
        window.location.href = 'help.html';
    }
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

// Cookie handling functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// Check for test account cookie and load saved addresses on load
window.addEventListener('DOMContentLoaded', async () => {
    const testEmail = getCookie('testAccount');
    if (testEmail === 'test@wingman.com') {
        try {
            const response = await fetch('/api/accounts/test@wingman.com');
            if (response.ok) {
                const userData = await response.json();
                updateLoginState(true, {
                    name: userData.full_name,
                    email: userData.email,
                    picture: 'https://ui-avatars.com/api/?name=Test+User'
                });
            }
        } catch (error) {
            console.error('Error loading test account:', error);
        }
    }
    
    // Load saved addresses from localStorage
    loadSavedAddresses();
});

// Load saved addresses from localStorage
function loadSavedAddresses() {
    const homeAddress = localStorage.getItem('homeAddress');
    const workAddress = localStorage.getItem('workAddress');
    
    if (homeAddress) {
        pickupAutocomplete.setPresetAddress('home', homeAddress);
    }
    if (workAddress) {
        destinationAutocomplete.setPresetAddress('work', workAddress);
    }
}

// Open modal
loginButton.addEventListener('click', () => {
    if (isLoggedIn) {
        // If logged in, clicking should log out
        updateLoginState(false, null);
        deleteCookie('testAccount');
        showStatus('Logged out successfully', 'success');
    } else {
        loginModal.classList.add('show');
    }
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
    try {
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

// Guest login (now uses test account)
guestLoginButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/accounts/test@wingman.com');
        if (response.ok) {
            const userData = await response.json();
            updateLoginState(true, {
                name: userData.full_name,
                email: userData.email,
                picture: 'https://ui-avatars.com/api/?name=Test+User'
            });
            setCookie('testAccount', 'test@wingman.com', 7); // Set cookie for 7 days
            loadSavedAddresses();
            loginModal.classList.remove('show');
            showStatus('Logged in as test user', 'success');
        }
    } catch (error) {
        showStatus('Failed to login as test user', 'error');
    }
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
        this.presetAddresses = new Map();

        this.setupDropdown();
        this.setupEventListeners();
    }

    setPresetAddress(type, address) {
        this.presetAddresses.set(type, address);
        
        // Get quick-locations container
        const quickLocations = document.querySelector('.quick-locations');
        if (!quickLocations) return;
        
        // Find or create the button
        const buttonClass = `quick-location-btn ${type}-btn`;
        let button = quickLocations.querySelector(`.${type}-btn`);
        
        if (!button) {
            button = document.createElement('button');
            button.className = buttonClass;
            button.innerHTML = `<i class="fas fa-${type === 'home' ? 'home' : 'building'}"></i> ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            quickLocations.appendChild(button);
        }
        
        // Update button click handler
        button.onclick = () => {
            if (this.input.id === 'pickup' && type === 'home') {
                this.input.value = address;
                this.selectedLocation = {
                    name: address,
                    lat: 0,
                    lon: 0
                };
            } else if (this.input.id === 'destination' && type === 'work') {
                this.input.value = address;
                this.selectedLocation = {
                    name: address,
                    lat: 0,
                    lon: 0
                };
            }
        };
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
            if (this.dropdown.children.length > 1) {
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
        
        if (addressObj.house_number && addressObj.road) {
            parts.push(`${addressObj.house_number} ${addressObj.road}`);
        } else if (addressObj.road) {
            parts.push(addressObj.road);
        }

        if (addressObj.suburb) {
            parts.push(addressObj.suburb);
        } else if (addressObj.neighbourhood) {
            parts.push(addressObj.neighbourhood);
        }

        if (addressObj.city) {
            parts.push(addressObj.city);
        } else if (addressObj.town) {
            parts.push(addressObj.town);
        }

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
        while (this.dropdown.children.length > 1) {
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
const pickupInput = document.getElementById('pickup');
const destinationInput = document.getElementById('destination');

if (pickupInput && destinationInput) {
    const pickupAutocomplete = new AddressAutocomplete(pickupInput);
    const destinationAutocomplete = new AddressAutocomplete(destinationInput);

    // Ride selection functionality
    const rideCards = document.querySelectorAll('.ride-card');
    const bookButton = document.getElementById('book-ride');
    const statusMessage = document.getElementById('status-message');
    let selectedRide = null;

    rideCards.forEach(card => {
        card.addEventListener('click', () => {
            rideCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedRide = card.dataset.ride;
        });
    });

    if (bookButton) {
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

            showStatus('Booking successful! Your ride is on the way.', 'success');
        });
    }
}

function showStatus(message, type) {
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        
        setTimeout(() => {
            statusMessage.className = 'status-message';
        }, 5000);
    }
}
