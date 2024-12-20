// Integration Tests for Ride Requests API using real HTTP requests
class RideRequestIntegrationTests {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.testResults = [];
    }

    async runTests() {
        try {
            await this.testCreateRideRequest();
            await this.testGetRideRequest();
            await this.testUpdateRideRequest();
            await this.testDeleteRideRequest();
            this.displayResults();
        } catch (error) {
            console.error('Test suite failed:', error);
            this.logResult('Test Suite', 'Failed', error.message);
            this.displayResults();
        }
    }

    async testCreateRideRequest() {
        try {
            const requestData = {
                rider_id: 1,
                pickup_location: "123 Main St",
                destination: "456 Market St",
                vehicle_type: "standard"
            };

            const response = await fetch(`${this.baseUrl}/ride-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            
            // Assertions
            this.assert(response.status === 201, 'Should return 201 status');
            this.assert(data.id !== undefined, 'Should return ride request ID');
            this.assert(data.estimated_fare > 0, 'Should calculate estimated fare');
            
            // Store ID for other tests
            this.rideRequestId = data.id;
            
            this.logResult('Create Ride Request', 'Passed');
        } catch (error) {
            this.logResult('Create Ride Request', 'Failed', error.message);
            throw error;
        }
    }

    async testGetRideRequest() {
        try {
            const response = await fetch(`${this.baseUrl}/ride-requests/${this.rideRequestId}`);
            const data = await response.json();

            // Assertions
            this.assert(response.status === 200, 'Should return 200 status');
            this.assert(data.id === this.rideRequestId, 'Should return correct ride request');
            this.assert(data.pickup_location === "123 Main St", 'Should match pickup location');

            this.logResult('Get Ride Request', 'Passed');
        } catch (error) {
            this.logResult('Get Ride Request', 'Failed', error.message);
            throw error;
        }
    }

    async testUpdateRideRequest() {
        try {
            const updateData = {
                status: 'accepted'
            };

            const response = await fetch(`${this.baseUrl}/ride-requests/${this.rideRequestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            // Assertions
            this.assert(response.status === 200, 'Should return 200 status');
            this.assert(data.status === 'accepted', 'Should update status');

            this.logResult('Update Ride Request', 'Passed');
        } catch (error) {
            this.logResult('Update Ride Request', 'Failed', error.message);
            throw error;
        }
    }

    async testDeleteRideRequest() {
        try {
            const response = await fetch(`${this.baseUrl}/ride-requests/${this.rideRequestId}`, {
                method: 'DELETE'
            });

            // Assertions
            this.assert(response.status === 204, 'Should return 204 status');

            // Verify deletion
            const getResponse = await fetch(`${this.baseUrl}/ride-requests/${this.rideRequestId}`);
            this.assert(getResponse.status === 404, 'Deleted ride request should not be found');

            this.logResult('Delete Ride Request', 'Passed');
        } catch (error) {
            this.logResult('Delete Ride Request', 'Failed', error.message);
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
    const tests = new RideRequestIntegrationTests();
    tests.runTests();
};
