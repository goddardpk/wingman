// API client for account operations
const API_BASE_URL = 'http://localhost:3000/api';

const accountsApi = {
    async getAccount(email) {
        const response = await fetch(`${API_BASE_URL}/accounts/${encodeURIComponent(email)}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to get account: ${response.statusText}`);
        }
        return response.json();
    },

    async updateAccount(email, data) {
        const response = await fetch(`${API_BASE_URL}/accounts/${encodeURIComponent(email)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to update account: ${response.statusText}`);
        }
        return response.json();
    },

    async createAccount(data) {
        const response = await fetch(`${API_BASE_URL}/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to create account: ${response.statusText}`);
        }
        return response.json();
    },

    async deleteAccount(email) {
        const response = await fetch(`${API_BASE_URL}/accounts/${encodeURIComponent(email)}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to delete account: ${response.statusText}`);
        }
    },

    // Keep the payment methods function using db for now since we haven't migrated that to the API yet
    async getPaymentMethods(accountId) {
        // In browser context, we'll need to add payment methods API endpoint later
        return [];
    }
};

// Export for browser
window.accountsApi = accountsApi;
