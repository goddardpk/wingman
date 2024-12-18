document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const pickupInput = document.getElementById('pickup');
    const destinationInput = document.getElementById('destination');
    const vehicleTypeSelect = document.getElementById('vehicle-type');
    const fareEstimate = document.getElementById('fare-estimate');
    const requestButton = document.getElementById('request-ride');
    const statusContainer = document.getElementById('status-container');
    const statusMessage = document.getElementById('status-message');
    const driverInfo = document.getElementById('driver-info');

    // Mock data for testing
    const mockDrivers = [
        { id: 1, name: 'John Doe', rating: 4.8, car: 'Toyota Camry', plate: 'ABC123' },
        { id: 2, name: 'Jane Smith', rating: 4.9, car: 'Honda Accord', plate: 'XYZ789' },
        { id: 3, name: 'Mike Johnson', rating: 4.7, car: 'Tesla Model 3', plate: 'EV1234' }
    ];

    // Base rates for fare calculation
    const rates = {
        standard: { base: 5, perMile: 1.5, perMinute: 0.2 },
        premium: { base: 10, perMile: 2.5, perMinute: 0.4 },
        xl: { base: 15, perMile: 3.0, perMinute: 0.5 }
    };

    // Form validation and button enable/disable
    function validateForm() {
        const isValid = pickupInput.value.trim() !== '' && 
                       destinationInput.value.trim() !== '';
        requestButton.disabled = !isValid;
        return isValid;
    }

    // Calculate mock fare estimate
    function calculateFare() {
        const pickup = pickupInput.value.trim();
        const destination = destinationInput.value.trim();
        const vehicleType = vehicleTypeSelect.value;

        if (pickup && destination) {
            // Mock distance and time calculation
            const mockDistance = Math.random() * 10 + 2; // 2-12 miles
            const mockDuration = Math.random() * 20 + 10; // 10-30 minutes
            
            const rate = rates[vehicleType];
            const fare = rate.base + 
                        (rate.perMile * mockDistance) + 
                        (rate.perMinute * mockDuration);

            fareEstimate.innerHTML = `
                <h3>Estimated Fare</h3>
                <p>$${fare.toFixed(2)}</p>
                <small>Distance: ${mockDistance.toFixed(1)} miles</small><br>
                <small>Duration: ${Math.round(mockDuration)} minutes</small>
            `;
        }
    }

    // Simulate finding a driver
    function findDriver() {
        return new Promise((resolve, reject) => {
            statusContainer.classList.remove('status-hidden');
            statusMessage.innerHTML = '<p class="loading">Finding a driver...</p>';

            // Simulate API delay
            setTimeout(() => {
                const randomDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
                const randomSuccess = Math.random() > 0.2; // 80% success rate

                if (randomSuccess) {
                    resolve(randomDriver);
                } else {
                    reject(new Error('No drivers available'));
                }
            }, 2000);
        });
    }

    // Event Listeners
    pickupInput.addEventListener('input', () => {
        validateForm();
        calculateFare();
    });

    destinationInput.addEventListener('input', () => {
        validateForm();
        calculateFare();
    });

    vehicleTypeSelect.addEventListener('change', calculateFare);

    requestButton.addEventListener('click', async () => {
        if (!validateForm()) return;

        try {
            const driver = await findDriver();
            statusMessage.innerHTML = '<p class="success">Driver found!</p>';
            driverInfo.innerHTML = `
                <h3>Driver Details</h3>
                <p>Name: ${driver.name}</p>
                <p>Rating: ${driver.rating} ⭐</p>
                <p>Vehicle: ${driver.car}</p>
                <p>Plate: ${driver.plate}</p>
                <p class="success">ETA: ${Math.floor(Math.random() * 10 + 5)} minutes</p>
            `;
        } catch (error) {
            statusMessage.innerHTML = `
                <p class="error">${error.message}</p>
                <button onclick="location.reload()" class="primary-button">Try Again</button>
            `;
        }
    });
});
