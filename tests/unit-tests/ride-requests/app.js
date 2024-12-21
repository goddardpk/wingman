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
    }

    // Rest of the mock methods remain the same...
    // [Previous mockFetch implementation remains unchanged]

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

    // Test methods remain the same...
    // [Previous test method implementations remain unchanged]

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
