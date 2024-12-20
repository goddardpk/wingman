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
    }

    // Mock API calls instead of real HTTP requests
    async mockFetch(endpoint, options = {}) {
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // POST /ride-requests
        if (endpoint === `${this.baseUrl}/ride-requests` && method === 'POST') {
            if (!body.rider_id || !body.pickup_location || !body.destination || !body.vehicle_type) {
                return {
                    status: 400,
                    json: () => Promise.resolve({ error: 'Missing required fields' })
                };
            }

            const vehicleType = this.mockData.vehicleTypes[body.vehicle_type];
            if (!vehicleType) {
                return {
                    status: 400,
                    json: () => Promise.resolve({ error: 'Invalid vehicle type' })
                };
            }

            const rideRequest = {
                id: this.currentId++,
                ...body,
                estimated_fare: vehicleType.base_fare + (10 * vehicleType.per_mile_rate), // Mock fare calculation
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            this.mockData.rideRequests.set(rideRequest.id, rideRequest);
            return {
                status: 201,
                json: () => Promise.resolve(rideRequest)
            };
        }

        // GET /ride-requests/:id
        if (endpoint.match(/\/ride-requests\/\d+$/) && method === 'GET') {
            const id = parseInt(endpoint.split('/').pop());
            const rideRequest = this.mockData.rideRequests.get(id);
            
            if (!rideRequest) {
                return {
                    status: 404,
                    json: () => Promise.resolve({ error: 'Ride request not found' })
                };
            }

            return {
                status: 200,
                json: () => Promise.resolve(rideRequest)
            };
        }

        // PUT /ride-requests/:id
        if (endpoint.match(/\/ride-requests\/\d+$/) && method === 'PUT') {
            const id = parseInt(endpoint.split('/').pop());
            const rideRequest = this.mockData.rideRequests.get(id);
            
            if (!rideRequest) {
                return {
                    status: 404,
                    json: () => Promise.resolve({ error: 'Ride request not found' })
                };
            }

            const updatedRequest = {
                ...rideRequest,
                ...body,
                updated_at: new Date().toISOString()
            };

            this.mockData.rideRequests.set(id, updatedRequest);
            return {
                status: 200,
                json: () => Promise.resolve(updatedRequest)
            };
        }

        // DELETE /ride-requests/:id
        if (endpoint.match(/\/ride-requests\/\d+$/) && method === 'DELETE') {
            const id = parseInt(endpoint.split('/').pop());
            if (!this.mockData.rideRequests.has(id)) {
                return {
                    status: 404,
                    json: () => Promise.resolve({ error: 'Ride request not found' })
                };
            }

            this.mockData.rideRequests.delete(id);
            return {
                status: 204,
                json: () => Promise.resolve()
            };
        }

        return {
            status: 404,
            json: () => Promise.resolve({ error: 'Not found' })
        };
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

            const response = await this.mockFetch(`${this.baseUrl}/ride-requests`, {
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
            const response = await this.mockFetch(`${this.baseUrl}/ride-requests/${this.rideRequestId}`);
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

            const response = await this.mockFetch(`${this.baseUrl}/ride-requests/${this.rideRequestId}`, {
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
            const response = await this.mockFetch(`${this.baseUrl}/ride-requests/${this.rideRequestId}`, {
                method: 'DELETE'
            });

            // Assertions
            this.assert(response.status === 204, 'Should return 204 status');

            // Verify deletion
            const getResponse = await this.mockFetch(`${this.baseUrl}/ride-requests/${this.rideRequestId}`);
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
    }
}

// Initialize and run tests when page loads
window.onload = () => {
    const tests = new RideRequestUnitTests();
    tests.runTests();
};
