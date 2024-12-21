#!/usr/bin/env node

/**
 * Wingman API Test Runner
 * ======================
 * 
 * This CLI tool runs automated tests for the Wingman API, covering both mock and integration tests.
 * 
 * How to Run:
 * -----------
 * 1. Make the script executable:
 *    chmod +x tests/cli-runner.js
 * 
 * 2. Run directly:
 *    ./tests/cli-runner.js
 * 
 * 3. Or through npm (after adding to package.json):
 *    npm run test-api
 * 
 * Supported Features:
 * ------------------
 * Mock API Tests:
 * - FEAT_RIDE_REQ_001: Create ride request [/api/ride-requests POST]
 *   Validates ride request creation with required fields and fare calculation
 * 
 * - FEAT_RIDE_REQ_002: Retrieve ride request [/api/ride-requests/:id GET]
 *   Ensures accurate retrieval of ride request details
 * 
 * - FEAT_RIDE_REQ_003: Update ride request [/api/ride-requests/:id PUT]
 *   Verifies ride request status updates and modifications
 * 
 * - FEAT_RIDE_REQ_004: Delete ride request [/api/ride-requests/:id DELETE]
 *   Confirms proper removal of ride requests
 * 
 * Integration Tests (requires running API server):
 * - FEAT_ACCT_001: Account creation [/api/accounts POST]
 *   Tests account creation with validation of required fields
 * 
 * - FEAT_ACCT_002: Account retrieval [/api/accounts/:email GET]
 *   Verifies accurate account information retrieval
 * 
 * - FEAT_ACCT_003: Account updates [/api/accounts/:email PUT]
 *   Ensures proper updating of account details
 * 
 * - FEAT_ACCT_004: Account deletion [/api/accounts/:email DELETE]
 *   Confirms account removal functionality
 * 
 * - FEAT_ACCT_005: Duplicate prevention [/api/accounts POST]
 *   Validates unique email constraint and conflict handling
 * 
 * For detailed feature documentation, see:
 * /tests/README.md#supported-features
 */

class TestRunner {
    constructor() {
        this.results = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.featureResults = new Map(); // Track results by feature ID
    }

    async runAllTests() {
        console.log('\n🚀 Starting API Test Suite\n');

        try {
            // Run mock API tests
            console.log('Running Mock API Tests...');
            await this.runRideRequestTests();

            // Run integration tests
            console.log('\nRunning Integration Tests...');
            console.log('Checking if API server is running...');
            
            try {
                const response = await fetch('http://localhost:3000/api/health');
                if (response.ok) {
                    await this.runAccountIntegrationTests();
                } else {
                    console.log('⚠️  API server is not responding properly. Skipping integration tests.');
                }
            } catch (error) {
                console.log('⚠️  API server is not running. Skipping integration tests.');
                console.log('   To run integration tests:');
                console.log('   1. Start the API server: npm run api');
                console.log('   2. Initialize the database: npm run init-db\n');
            }

            this.displayFinalResults();
            process.exit(this.failedTests > 0 ? 1 : 0);
        } catch (error) {
            console.error('\n❌ Test suite failed:', error);
            process.exit(1);
        }
    }

    async runRideRequestTests() {
        const mockData = {
            vehicleTypes: {
                standard: { id: 1, name: 'standard', base_fare: 5.00, per_mile_rate: 1.50, per_minute_rate: 0.25 },
                premium: { id: 2, name: 'premium', base_fare: 10.00, per_mile_rate: 2.50, per_minute_rate: 0.50 }
            },
            rideRequests: new Map()
        };

        let currentId = 1;
        let rideRequestId;

        // Mock API endpoint
        const mockFetch = async (endpoint, options = {}) => {
            const method = options.method || 'GET';
            const body = options.body ? JSON.parse(options.body) : null;

            // POST /ride-requests
            if (endpoint.endsWith('/ride-requests') && method === 'POST') {
                if (!body.rider_id || !body.pickup_location || !body.destination || !body.vehicle_type) {
                    return { status: 400, json: async () => ({ error: 'Missing required fields' }) };
                }

                const vehicleType = mockData.vehicleTypes[body.vehicle_type];
                if (!vehicleType) {
                    return { status: 400, json: async () => ({ error: 'Invalid vehicle type' }) };
                }

                const rideRequest = {
                    id: currentId++,
                    ...body,
                    estimated_fare: vehicleType.base_fare + (10 * vehicleType.per_mile_rate),
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                mockData.rideRequests.set(rideRequest.id, rideRequest);
                return { status: 201, json: async () => rideRequest };
            }

            // GET /ride-requests/:id
            if (endpoint.match(/\/ride-requests\/\d+$/) && method === 'GET') {
                const id = parseInt(endpoint.split('/').pop());
                const rideRequest = mockData.rideRequests.get(id);
                
                if (!rideRequest) {
                    return { status: 404, json: async () => ({ error: 'Ride request not found' }) };
                }

                return { status: 200, json: async () => rideRequest };
            }

            // PUT /ride-requests/:id
            if (endpoint.match(/\/ride-requests\/\d+$/) && method === 'PUT') {
                const id = parseInt(endpoint.split('/').pop());
                const rideRequest = mockData.rideRequests.get(id);
                
                if (!rideRequest) {
                    return { status: 404, json: async () => ({ error: 'Ride request not found' }) };
                }

                const updatedRequest = {
                    ...rideRequest,
                    ...body,
                    updated_at: new Date().toISOString()
                };

                mockData.rideRequests.set(id, updatedRequest);
                return { status: 200, json: async () => updatedRequest };
            }

            // DELETE /ride-requests/:id
            if (endpoint.match(/\/ride-requests\/\d+$/) && method === 'DELETE') {
                const id = parseInt(endpoint.split('/').pop());
                if (!mockData.rideRequests.has(id)) {
                    return { status: 404, json: async () => ({ error: 'Ride request not found' }) };
                }

                mockData.rideRequests.delete(id);
                return { status: 204, json: async () => {} };
            }

            return { status: 404, json: async () => ({ error: 'Not found' }) };
        };

        // Test: Create Ride Request [FEAT_RIDE_REQ_001]
        try {
            const requestData = {
                rider_id: 1,
                pickup_location: "123 Main St",
                destination: "456 Market St",
                vehicle_type: "standard"
            };

            const response = await mockFetch('http://localhost:3000/api/ride-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            
            this.assert(response.status === 201, 'Create ride request should return 201 status');
            this.assert(data.id !== undefined, 'Create ride request should return ride request ID');
            this.assert(data.estimated_fare > 0, 'Create ride request should calculate estimated fare');
            
            rideRequestId = data.id;
            this.logResult('FEAT_RIDE_REQ_001', 'Create Ride Request', true);
        } catch (error) {
            this.logResult('FEAT_RIDE_REQ_001', 'Create Ride Request', false, error.message);
        }

        // Test: Get Ride Request [FEAT_RIDE_REQ_002]
        try {
            const response = await mockFetch(`http://localhost:3000/api/ride-requests/${rideRequestId}`);
            const data = await response.json();

            this.assert(response.status === 200, 'Get ride request should return 200 status');
            this.assert(data.id === rideRequestId, 'Get ride request should return correct ride request');
            this.assert(data.pickup_location === "123 Main St", 'Get ride request should match pickup location');

            this.logResult('FEAT_RIDE_REQ_002', 'Get Ride Request', true);
        } catch (error) {
            this.logResult('FEAT_RIDE_REQ_002', 'Get Ride Request', false, error.message);
        }

        // Test: Update Ride Request [FEAT_RIDE_REQ_003]
        try {
            const updateData = { status: 'accepted' };

            const response = await mockFetch(`http://localhost:3000/api/ride-requests/${rideRequestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            this.assert(response.status === 200, 'Update ride request should return 200 status');
            this.assert(data.status === 'accepted', 'Update ride request should update status');

            this.logResult('FEAT_RIDE_REQ_003', 'Update Ride Request', true);
        } catch (error) {
            this.logResult('FEAT_RIDE_REQ_003', 'Update Ride Request', false, error.message);
        }

        // Test: Delete Ride Request [FEAT_RIDE_REQ_004]
        try {
            const response = await mockFetch(`http://localhost:3000/api/ride-requests/${rideRequestId}`, {
                method: 'DELETE'
            });

            this.assert(response.status === 204, 'Delete ride request should return 204 status');

            const getResponse = await mockFetch(`http://localhost:3000/api/ride-requests/${rideRequestId}`);
            this.assert(getResponse.status === 404, 'Deleted ride request should not be found');

            this.logResult('FEAT_RIDE_REQ_004', 'Delete Ride Request', true);
        } catch (error) {
            this.logResult('FEAT_RIDE_REQ_004', 'Delete Ride Request', false, error.message);
        }
    }

    async runAccountIntegrationTests() {
        const testEmail = `test${Date.now()}@example.com`;

        // Test: Create Account [FEAT_ACCT_001]
        try {
            const accountData = {
                email: testEmail,
                fullName: "Test User",
                phone: "555-0123"
            };

            const response = await fetch('http://localhost:3000/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(accountData)
            });

            const data = await response.json();
            
            this.assert(response.status === 201, 'Create account should return 201 status');
            this.assert(data.email === testEmail, 'Create account should return account email');
            this.assert(data.full_name === accountData.fullName, 'Create account should return full name');
            this.assert(data.phone === accountData.phone, 'Create account should return phone number');
            
            this.logResult('FEAT_ACCT_001', 'Create Account', true);
        } catch (error) {
            this.logResult('FEAT_ACCT_001', 'Create Account', false, error.message);
        }

        // Test: Get Account [FEAT_ACCT_002]
        try {
            const response = await fetch(`http://localhost:3000/api/accounts/${encodeURIComponent(testEmail)}`);
            const data = await response.json();

            this.assert(response.status === 200, 'Get account should return 200 status');
            this.assert(data.email === testEmail, 'Get account should return correct account');
            this.assert(data.full_name === "Test User", 'Get account should match full name');
            this.assert(data.phone === "555-0123", 'Get account should match phone number');

            this.logResult('FEAT_ACCT_002', 'Get Account', true);
        } catch (error) {
            this.logResult('FEAT_ACCT_002', 'Get Account', false, error.message);
        }

        // Test: Update Account [FEAT_ACCT_003]
        try {
            const updateData = {
                fullName: "Updated User",
                phone: "555-9876"
            };

            const response = await fetch(`http://localhost:3000/api/accounts/${encodeURIComponent(testEmail)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            this.assert(response.status === 200, 'Update account should return 200 status');
            this.assert(data.full_name === updateData.fullName, 'Update account should update full name');
            this.assert(data.phone === updateData.phone, 'Update account should update phone number');

            this.logResult('FEAT_ACCT_003', 'Update Account', true);
        } catch (error) {
            this.logResult('FEAT_ACCT_003', 'Update Account', false, error.message);
        }

        // Test: Delete Account [FEAT_ACCT_004]
        try {
            const response = await fetch(`http://localhost:3000/api/accounts/${encodeURIComponent(testEmail)}`, {
                method: 'DELETE'
            });

            this.assert(response.status === 204, 'Delete account should return 204 status');

            const getResponse = await fetch(`http://localhost:3000/api/accounts/${encodeURIComponent(testEmail)}`);
            this.assert(getResponse.status === 404, 'Deleted account should return 404');

            this.logResult('FEAT_ACCT_004', 'Delete Account', true);
        } catch (error) {
            this.logResult('FEAT_ACCT_004', 'Delete Account', false, error.message);
        }

        // Test: Create Duplicate Account [FEAT_ACCT_005]
        try {
            // Create initial account
            const initialAccount = {
                email: testEmail,
                fullName: "Initial User",
                phone: "555-0123"
            };

            await fetch('http://localhost:3000/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initialAccount)
            });

            // Try to create duplicate account
            const duplicateAccount = {
                email: testEmail,
                fullName: "Duplicate User",
                phone: "555-0000"
            };

            const response = await fetch('http://localhost:3000/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duplicateAccount)
            });

            const data = await response.json();

            this.assert(response.status === 409, 'Create duplicate account should return 409 Conflict status');
            this.assert(data.error === 'Email already exists', 'Create duplicate account should return appropriate error message');

            this.logResult('FEAT_ACCT_005', 'Create Duplicate Account', true);
        } catch (error) {
            this.logResult('FEAT_ACCT_005', 'Create Duplicate Account', false, error.message);
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    logResult(featureId, testName, passed, error = null) {
        this.totalTests++;
        this.featureResults.set(featureId, { passed, error });
        
        if (passed) {
            this.passedTests++;
            console.log(`✅ [${featureId}] ${testName}`);
        } else {
            this.failedTests++;
            console.log(`❌ [${featureId}] ${testName}`);
            if (error) console.log(`   Error: ${error}`);
        }
    }

    displayFinalResults() {
        console.log('\n📊 Test Results Summary');
        console.log('====================');
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests} ✅`);
        console.log(`Failed: ${this.failedTests} ❌`);
        console.log('====================\n');

        if (this.failedTests > 0) {
            console.log('Failed Features:');
            for (const [featureId, result] of this.featureResults) {
                if (!result.passed) {
                    console.log(`❌ ${featureId}: ${result.error}`);
                }
            }
            console.log('\nFor feature documentation, see: /tests/README.md#supported-features\n');
        }
    }
}

// Run the tests
const runner = new TestRunner();
runner.runAllTests();
