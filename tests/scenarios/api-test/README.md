# API Tests for Ride Request System

This directory contains stubbed API tests for the ride request functionality, focusing on testing CRUD operations for the initial request flow.

## Test Coverage

The test suite verifies the following API endpoints using mock data:

### 1. Create Ride Request (POST /api/ride-requests)

- Creates a new ride request with pickup location, destination, and vehicle type
- Validates required fields
- Calculates estimated fare based on vehicle type
- Returns 201 status with created request data

### 2. Get Ride Request (GET /api/ride-requests/:id)

- Retrieves a specific ride request by ID
- Verifies all request details are returned
- Returns 404 for non-existent requests

### 3. Update Ride Request (PUT /api/ride-requests/:id)

- Updates ride request status and other fields
- Validates update data
- Returns updated request data
- Returns 404 for non-existent requests

### 4. Delete Ride Request (DELETE /api/ride-requests/:id)

- Removes a ride request from the system
- Returns 204 on successful deletion
- Returns 404 for non-existent requests

## Implementation Details

The tests use a stubbed implementation that:

- Mocks all API calls without hitting a real server
- Uses in-memory storage (Map) to simulate a database
- Includes mock vehicle types and fare calculations
- Simulates network delays for realistic testing
- Validates request data and returns appropriate status codes

## Running the Tests

Simply open the test page in your browser:

```bash
open tests/scenarios/api-test/index.html
```

No additional setup is required since these are stubbed tests that don't depend on:

- Database
- API server
- Network connectivity
- External dependencies

## Test Results

The test results will be displayed in the browser with:

- Individual test status (passed/failed)
- Detailed error messages for failed tests
- Request/response data for debugging

## Mock Data Structure

The tests use the following mock data structure:

```javascript
mockData = {
  vehicleTypes: {
    standard: {
      id: 1,
      name: "standard",
      base_fare: 5.0,
      per_mile_rate: 1.5,
      per_minute_rate: 0.25,
    },
    premium: {
      id: 2,
      name: "premium",
      base_fare: 10.0,
      per_mile_rate: 2.5,
      per_minute_rate: 0.5,
    },
  },
  rideRequests: new Map(), // Stores ride requests in memory
};
```

## Troubleshooting

If tests fail, check:

1. Browser console for detailed error messages
2. Test assertions in app.js
3. Mock data structure for any initialization issues
