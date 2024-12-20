// Integration Tests for Ride Requests API using real HTTP requests
class RideRequestIntegrationTests {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.testResults = [];
        this.featureName = 'Real-time assistance matching';
    }

    async runTests() {
        try {
            await this.testGetVehicleTypes();
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

    async testGetVehicleTypes() {
        try {
            const response = await fetch(`${this.baseUrl}/vehicle-types`);
            
            // Test response status
            this.assert(response.status === 200, 'Should return 200 status');
            
            const vehicleTypes = await response.json();
            
            // Test response structure
            this.assert(Array.isArray(vehicleTypes), 'Response should be an array');
            this.assert(vehicleTypes.length > 0, 'Should return at least one vehicle type');
            
            // Test first vehicle type has all required properties
            const firstType = vehicleTypes[0];
            this.assert(typeof firstType.id === 'number', 'Vehicle type should have numeric id');
            this.assert(typeof firstType.name === 'string', 'Vehicle type should have name');
            this.assert(typeof firstType.base_fare === 'number', 'Vehicle type should have base_fare');
            this.assert(typeof firstType.per_mile_rate === 'number', 'Vehicle type should have per_mile_rate');
            this.assert(typeof firstType.per_minute_rate === 'number', 'Vehicle type should have per_minute_rate');
            
            this.logResult('Get Vehicle Types', 'Passed');
        } catch (error) {
            this.logResult('Get Vehicle Types', 'Failed', error.message);
            throw error;
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

        let allPassed = true;

        this.testResults.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = `test-result ${result.status.toLowerCase()}`;
            resultElement.innerHTML = `
                <h3>${result.name}</h3>
                <p>Status: ${result.status}</p>
                ${result.error ? `<p class="error">Error: ${result.error}</p>` : ''}
            `;
            resultsDiv.appendChild(resultElement);

            if (result.status === 'Failed') {
                allPassed = false;
            }
        });

        // Add warning about required setup if tests failed
        if (!allPassed) {
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

        // Update test tracking status
        if (window.updateTestTypeStatus) {
            const status = allPassed ? 'test-passed' : 'test-failed';
            window.updateTestTypeStatus(this.featureName, 'integration', status);
            
            // Also update the overall feature status if both unit and integration tests are complete
            const unitStatus = localStorage.getItem(`unit-test-${this.featureName}`);
            if (unitStatus) {
                const overallStatus = (status === 'test-passed' && unitStatus === 'test-passed') 
                    ? 'passed' 
                    : 'failed';
                window.updateFeatureStatus(this.featureName, overallStatus);
            }
        }
    }
}

// Initialize and run tests when page loads
window.onload = () => {
    const tests = new RideRequestIntegrationTests();
    tests.runTests();
};
