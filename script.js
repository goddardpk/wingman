document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const rideCards = document.querySelectorAll('.ride-card');
    const bookButton = document.getElementById('book-ride');
    const statusMessage = document.getElementById('status-message');
    const pickupInput = document.getElementById('pickup');
    const destinationInput = document.getElementById('destination');
    const quickLocationBtns = document.querySelectorAll('.quick-location-btn');

    // Selected ride type
    let selectedRide = null;

    // Handle ride selection
    rideCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            rideCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            card.classList.add('selected');
            selectedRide = card.dataset.ride;
        });
    });

    // Quick location buttons
    quickLocationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const location = btn.textContent.includes('Home')
                ? '123 Home Street'
                : '456 Work Avenue';
            destinationInput.value = location;
        });
    });

    // Book ride button
    bookButton.addEventListener('click', () => {
        const pickup = pickupInput.value.trim();
        const destination = destinationInput.value.trim();

        // Validate inputs
        if (!pickup || !destination) {
            showStatus('Please enter both pickup and destination locations', 'error');
            return;
        }

        if (!selectedRide) {
            showStatus('Please select a ride type', 'error');
            return;
        }

        // Simulate booking process
        showStatus('Processing your booking...', 'success');

        // Simulate API call
        setTimeout(() => {
            showStatus(`Your ${selectedRide} ride has been booked! Driver will arrive in 5 minutes.`, 'success');

            // Reset form
            setTimeout(() => {
                pickupInput.value = '';
                destinationInput.value = '';
                rideCards.forEach(c => c.classList.remove('selected'));
                selectedRide = null;
                statusMessage.style.display = 'none';
            }, 3000);
        }, 1500);
    });

    // Show status message
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message';
        statusMessage.classList.add(type);
        statusMessage.style.display = 'block';
    }

    // Add some sample locations for demo purposes
    const sampleLocations = [
        'Airport Terminal 1',
        'Central Station',
        'Downtown Mall',
        'University Campus',
        'Beach Resort'
    ];

    // Simple autocomplete for location inputs
    [pickupInput, destinationInput].forEach(input => {
        input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            if (value.length > 2) {
                const matches = sampleLocations.filter(loc =>
                    loc.toLowerCase().includes(value)
                );
                // In a real app, you would show these matches in a dropdown
                console.log('Matching locations:', matches);
            }
        });
    });
});
