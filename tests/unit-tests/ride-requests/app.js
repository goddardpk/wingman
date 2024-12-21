// Unit Tests for Ride Requests API using stubs
class RideRequestUnitTests {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.testResults = [];
        this.mockData = {
            vehicleTypes: {
                standard: { id: 1, name: 'standard', base_fare: 5.00, per_mile_rate: 1.50, per_minute_rate: 0.25 },
                premium: { id: 2, name: 'premium', base_fare: 10.00, per_mile_rate: 2.50, per_minute_rate: 0.50 }
            },
            rideRequests: new Map()
        };
        this.currentId = 1;
        this.featureName = 'Real-time assistance matching';

        // Override fetch with mock implementation
        window.fetch = this.mockFetch.bind(this);
    }

    async mockFetch(url, options = {}) {
        // Mock GET /api/vehicle-types
        if (url === `${this.baseUrl}/vehicle-types` && (!options.method || options.method === 'GET')) {
            return {
                ok: true,
                status: 200,
                json: async () => Object.values(this.mockData.vehicleTypes)
            };
        }

        // Mock POST /api/ride-requests
        if (url === `${this.baseUrl}/ride-requests` && options.method === 'POST') {
            const data = JSON.parse(options.body);
            const vehicleType = this.mockData.vehicleTypes[data.vehicle_type];
            if (!vehicleType) {
                return {
                    ok: false,
                    status: 400,
                    json: async () => ({ error: 'Invalid vehicle type' })
                };
            }

            const id = this.currentId++;
            const rideRequest = {
                id,
                ...data,
                estimated_fare: vehicleType.base_fare + 10 * vehicleType.per_mile_rate,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            this.mockData.rideRequests.set(id, rideRequest);

            return {
                ok: true,
                status: 201,
                json: async () => rideRequest
            };
        }

        // Mock GET /api/ride-requests/:id
        const getRideRequestMatch = url.match(new RegExp(`${this.baseUrl}/ride-requests/(\\d+)`));
        if (getRideRequestMatch && (!options.method || options.method === 'GET')) {
            const id = parseInt(getRideRequestMatch[1]);
            const rideRequest = this.mockData.rideRequests.get(id);
            
            if (!rideRequest) {
                return {
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Ride request not found' })
                };
            }

            return {
                ok: true,
                status: 200,
                json: async () => rideRequest
            };
        }

        // Mock PUT /api/ride-requests/:id
        if (getRideRequestMatch && options.method === 'PUT') {
            const id = parseInt(getRideRequestMatch[1]);
            const rideRequest = this.mockData.rideRequests.get(id);
            
            if (!rideRequest) {
                return {
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Ride request not found' })
                };
            }

            const updates = JSON.parse(options.body);
            Object.assign(rideRequest, updates, {
                updated_at: new Date().toISOString()
            });

            return {
                ok: true,
                status: 200,
                json: async () => rideRequest
            };
        }

        // Mock DELETE /api/ride-requests/:id
        if (getRideRequestMatch && options.method === 'DELETE') {
            const id = parseInt(getRideRequestMatch[1]);
            if (!this.mockData.rideRequests.has(id)) {
                return {
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Ride request not found' })
                };
            }

            this.mockData.rideRequests.delete(id);
            return {
                ok: true,
                status: 204,
                json: async () => ({})
            };
        }

        throw new Error(`Unhandled request: ${url}`);
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
            const vehicleTypes = await response.json();
            
            // Test that we get an array of vehicle types
            this.assert(Array.isArray(vehicleTypes), 'Response should be an array');
            
            // Test that each vehicle type has the required properties
            vehicleTypes.forEach(type => {
                this.assert(typeof type.id === 'number', 'Vehicle type should have numeric id');
                this.assert(typeof type.name === 'string', 'Vehicle type should have name');
                this.assert(typeof type.base_fare === 'number', 'Vehicle type should have base_fare');
                this.assert(typeof type.per_mile_rate === 'number', 'Vehicle type should have per_mile_rate');
                this.assert(typeof type.per_minute_rate === 'number', 'Vehicle type should have per_minute_rate');
            });

            // Test that we get both standard and premium types
            this.assert(vehicleTypes.length === 2, 'Should have exactly 2 vehicle types');
            this.assert(vehicleTypes.some(type => type.name === 'standard'), 'Should have standard vehicle type');
            this.assert(vehicleTypes.some(type => type.name === 'premium'), 'Should have premium vehicle type');

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
            this.assert(response.ok, 'Response should be successful');
            this.assert(response.status === 201, 'Should return 201 status');
            this.assert(data.id !== undefined, 'Should return ride request ID');
            this.assert(data.estimated_fare > 0, 'Should calculate estimated fare');
            this.assert(data.status === 'pending', 'Should set initial status to pending');
            
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
            this.assert(response.ok, 'Response should be successful');
            this.assert(response.status === 200, 'Should return 200 status');
            this.assert(data.id === this.rideRequestId, 'Should return correct ride request');
            this.assert(data.pickup_location === "123 Main St", 'Should match pickup location');
            this.assert(data.destination === "456 Market St", 'Should match destination');

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
            this.assert(response.ok, 'Response should be successful');
            this.assert(response.status === 200, 'Should return 200 status');
            this.assert(data.status === 'accepted', 'Should update status');
            this.assert(data.id === this.rideRequestId, 'Should return correct ride request');

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
            this.assert(response.ok, 'Response should be successful');
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

        // Update test tracking status
        if (window.updateTestTypeStatus) {
            const status = allPassed ? 'test-passed' : 'test-failed';
            window.updateTestTypeStatus(this.featureName, 'unit', status);
            
            // Also update the overall feature status if both unit and integration tests are complete
            const integrationStatus = localStorage.getItem(`integration-test-${this.featureName}`);
            if (integrationStatus) {
                const overallStatus = (status === 'test-passed' && integrationStatus === 'test-passed') 
                    ? 'passed' 
                    : 'failed';
                window.updateFeatureStatus(this.featureName, overallStatus);
            }
        }
    }
}

// Initialize and run tests when page loads
window.onload = () => {
    const tests = new RideRequestUnitTests();
    tests.runTests();
};
