// Integration Tests for Account API using real HTTP requests
class AccountIntegrationTests {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.testResults = [];
        this.testEmail = `test${Date.now()}@example.com`; // Unique email for each test run
        console.log('AccountIntegrationTests initialized');
    }

    async runTests() {
        try {
            console.log('Starting test suite...');
            await this.testCreateAccount();
            await this.testGetAccount();
            await this.testUpdateAccount();
            await this.testDeleteAccount();
            await this.testCreateDuplicateAccount(); // Test unique email constraint
            this.displayResults();
        } catch (error) {
            console.error('Test suite failed:', error);
            this.logResult('Test Suite', 'Failed', error.message);
            this.displayResults();
        }
    }

    async testCreateAccount() {
        try {
            console.log('Running create account test...');
            const accountData = {
                email: this.testEmail,
                fullName: "Test User",
                phone: "555-0123"
            };

            console.log('Making POST request to:', `${this.baseUrl}/accounts`);
            console.log('With data:', accountData);

            const response = await fetch(`${this.baseUrl}/accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accountData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            // Assertions
            this.assert(response.status === 201, 'Should return 201 status');
            this.assert(data.email === this.testEmail, 'Should return account email');
            this.assert(data.full_name === accountData.fullName, 'Should return full name');
            this.assert(data.phone === accountData.phone, 'Should return phone number');
            
            this.logResult('Create Account', 'Passed');
        } catch (error) {
            console.error('Create account test failed:', error);
            this.logResult('Create Account', 'Failed', error.message);
            throw error;
        }
    }

    async testGetAccount() {
        try {
            console.log('Running get account test...');
            const response = await fetch(`${this.baseUrl}/accounts/${encodeURIComponent(this.testEmail)}`);
            const data = await response.json();

            // Assertions
            this.assert(response.status === 200, 'Should return 200 status');
            this.assert(data.email === this.testEmail, 'Should return correct account');
            this.assert(data.full_name === "Test User", 'Should match full name');
            this.assert(data.phone === "555-0123", 'Should match phone number');

            this.logResult('Get Account', 'Passed');
        } catch (error) {
            console.error('Get account test failed:', error);
            this.logResult('Get Account', 'Failed', error.message);
            throw error;
        }
    }

    async testUpdateAccount() {
        try {
            console.log('Running update account test...');
            const updateData = {
                fullName: "Updated User",
                phone: "555-9876"
            };

            const response = await fetch(`${this.baseUrl}/accounts/${encodeURIComponent(this.testEmail)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            // Assertions
            this.assert(response.status === 200, 'Should return 200 status');
            this.assert(data.full_name === updateData.fullName, 'Should update full name');
            this.assert(data.phone === updateData.phone, 'Should update phone number');

            this.logResult('Update Account', 'Passed');
        } catch (error) {
            console.error('Update account test failed:', error);
            this.logResult('Update Account', 'Failed', error.message);
            throw error;
        }
    }

    async testDeleteAccount() {
        try {
            console.log('Running delete account test...');
            const response = await fetch(`${this.baseUrl}/accounts/${encodeURIComponent(this.testEmail)}`, {
                method: 'DELETE'
            });

            // Assertions
            this.assert(response.status === 204, 'Should return 204 status');

            // Verify deletion
            const getResponse = await fetch(`${this.baseUrl}/accounts/${encodeURIComponent(this.testEmail)}`);
            this.assert(getResponse.status === 404, 'Deleted account should not be found');

            this.logResult('Delete Account', 'Passed');
        } catch (error) {
            console.error('Delete account test failed:', error);
            this.logResult('Delete Account', 'Failed', error.message);
            throw error;
        }
    }

    async testCreateDuplicateAccount() {
        try {
            console.log('Running create duplicate account test...');
            const accountData = {
                email: this.testEmail,
                fullName: "Duplicate User",
                phone: "555-0000"
            };

            const response = await fetch(`${this.baseUrl}/accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accountData)
            });

            // Assertions
            this.assert(response.status === 409, 'Should return 409 Conflict status');
            const data = await response.json();
            this.assert(data.error === 'Email already exists', 'Should return appropriate error message');

            this.logResult('Create Duplicate Account', 'Passed');
        } catch (error) {
            console.error('Create duplicate account test failed:', error);
            this.logResult('Create Duplicate Account', 'Failed', error.message);
            throw error;
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    logResult(testName, status, error = null) {
        this.testResults.push({
            name: testName,
            status,
            error
        });
    }

    displayResults() {
        const resultsDiv = document.getElementById('testResults');
        resultsDiv.innerHTML = '';

        this.testResults.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = `test-result ${result.status.toLowerCase()}`;
            resultElement.innerHTML = `
                <h3>${result.name}</h3>
                <p>Status: ${result.status}</p>
                ${result.error ? `<p class="error">Error: ${result.error}</p>` : ''}
            `;
            resultsDiv.appendChild(resultElement);
        });

        // Add warning about required setup
        if (this.testResults.some(result => result.status === 'Failed')) {
            const setupWarning = document.createElement('div');
            setupWarning.className = 'setup-warning';
            setupWarning.innerHTML = `
                <h3>⚠️ Test Setup Requirements</h3>
                <p>For integration tests to pass, ensure:</p>
                <ul>
                    <li>API server is running (npm run api)</li>
                    <li>Database is initialized (npm run init-db)</li>
                    <li>Required tables are created</li>
                </ul>
            `;
            resultsDiv.insertBefore(setupWarning, resultsDiv.firstChild);
        }
    }
}

// Initialize and run tests when page loads
window.onload = () => {
    console.log('Page loaded, initializing tests...');
    const tests = new AccountIntegrationTests();
    tests.runTests().catch(error => {
        console.error('Failed to run tests:', error);
    });
};
