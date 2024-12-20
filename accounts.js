document.addEventListener('DOMContentLoaded', async function () {
    const saveButton = document.getElementById('save-settings');
    const statusMessage = document.getElementById('status-message');
    const paymentCards = document.querySelectorAll('.ride-card[data-payment]');
    
    // Load current user data (assuming email is stored in localStorage)
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        try {
            const userData = await accountsApi.getAccount(userEmail);
            if (userData) {
                document.getElementById('fullName').value = userData.full_name;
                document.getElementById('email').value = userData.email;
                document.getElementById('phone').value = userData.phone;
                
                // Load payment methods
                const paymentMethods = await accountsApi.getPaymentMethods(userData.id);
                updatePaymentMethodsDisplay(paymentMethods);
            }
        } catch (err) {
            showStatus('Error loading user data', 'error');
        }
    }

    // Handle payment method selection
    paymentCards.forEach(card => {
        card.addEventListener('click', () => {
            paymentCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // Handle save settings
    saveButton.addEventListener('click', async () => {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (!fullName || !email || !phone) {
            showStatus('Please fill in all required fields', 'error');
            return;
        }

        try {
            await accountsApi.updateAccount(email, { fullName, phone });
            showStatus('Settings saved successfully!', 'success');
            
            // Update stored email if it changed
            if (email !== userEmail) {
                localStorage.setItem('userEmail', email);
            }
        } catch (err) {
            showStatus('Error saving settings', 'error');
        }
    });

    function updatePaymentMethodsDisplay(paymentMethods) {
        const container = document.querySelector('.ride-cards');
        container.innerHTML = '';

        paymentMethods.forEach(method => {
            const card = document.createElement('div');
            card.className = 'ride-card';
            card.dataset.payment = method.type;

            const icon = method.type === 'card' ? 'fa-credit-card' : 'fa-paypal';
            const details = method.type === 'card' ? 
                `**** **** **** ${method.last_four}` :
                method.email;

            card.innerHTML = `
                <i class="fas ${icon}"></i>
                <div class="ride-details">
                    <h3>${method.type === 'card' ? 'Credit Card' : 'PayPal'}</h3>
                    <p>${details}</p>
                    <span class="price">${method.is_primary ? 'Primary' : 'Connected'}</span>
                </div>
            `;

            container.appendChild(card);
        });
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;

        setTimeout(() => {
            statusMessage.className = 'status-message';
        }, 3000);
    }
});
