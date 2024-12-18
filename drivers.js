const db = require('./db');

document.addEventListener('DOMContentLoaded', async () => {
    const driverSearch = document.getElementById('driver-search');
    const statusMessage = document.getElementById('status-message');
    const refreshButton = document.getElementById('refresh-status');
    const filterButtons = document.querySelectorAll('.quick-location-btn');
    
    // Load initial drivers data
    try {
        const drivers = await db.getAllDrivers();
        updateDriversDisplay(drivers);
    } catch (err) {
        showStatus('Error loading drivers', 'error');
    }

    // Search functionality
    driverSearch.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm) {
            try {
                const drivers = await db.searchDrivers(searchTerm);
                updateDriversDisplay(drivers);
            } catch (err) {
                showStatus('Error searching drivers', 'error');
            }
        } else {
            const drivers = await db.getAllDrivers();
            updateDriversDisplay(drivers);
        }
    });

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const filterType = button.textContent.trim().toLowerCase();
            
            filterButtons.forEach(btn => btn.style.borderColor = 'var(--border-color)');
            button.style.borderColor = 'var(--accent-color)';

            try {
                let drivers;
                if (filterType === 'active') {
                    drivers = await db.filterDriversByStatus('active');
                } else if (filterType === 'on break') {
                    drivers = await db.filterDriversByStatus('break');
                }
                updateDriversDisplay(drivers);
            } catch (err) {
                showStatus('Error filtering drivers', 'error');
            }
        });
    });

    // Refresh functionality
    refreshButton.addEventListener('click', async () => {
        showStatus('Refreshing driver status...', 'success');
        try {
            const drivers = await db.getAllDrivers();
            updateDriversDisplay(drivers);
            showStatus('Driver status updated successfully', 'success');
        } catch (err) {
            showStatus('Error refreshing drivers', 'error');
        }
    });

    function updateDriversDisplay(drivers) {
        const container = document.querySelector('.ride-cards');
        container.innerHTML = '';

        drivers.forEach(driver => {
            const card = document.createElement('div');
            card.className = 'ride-card';
            
            const statusClass = driver.status === 'active' ? 'active' : 
                              driver.status === 'available' ? 'available' : 'break';
            
            const statusText = driver.status === 'active' ? 'Active - In Ride' :
                             driver.status === 'available' ? 'Available' : 'On Break';

            card.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <div class="ride-details">
                    <h3>${driver.full_name}</h3>
                    <p>ID: #${driver.driver_id} • ${driver.service_type}</p>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            `;

            container.appendChild(card);
        });
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 2000);
    }
});