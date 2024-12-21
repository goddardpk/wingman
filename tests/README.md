# Wingman Test Suite

This directory contains various types of tests for the Wingman application. The tests are organized into different categories to maintain clarity and separation of concerns.

## Test Organization

### Unit Tests (`/unit-tests`)

- Located in `/tests/unit-tests`
- Uses stubbed/mock data
- No database or API server required
- Fast execution
- Tests individual components in isolation
- Example: `/unit-tests/ride-requests` tests ride request API endpoints using mocked responses

### Integration Tests (`/integration-tests`)

- Located in `/tests/integration-tests`
- Uses real API calls and database
- Requires proper setup (database initialization, API server running)
- Tests multiple components working together
- Example: `/integration-tests/ride-requests` tests ride request API endpoints with actual HTTP calls

### Scenario Tests (`/scenarios`)

- Located in `/tests/scenarios`
- End-to-end test scenarios
- Tests complete user workflows
- Example: Basic rider request flow, API testing scenarios

## Running Tests

### CLI Test Runner (New!)

The CLI test runner (`cli-runner.js`) provides a command-line interface for running API tests without browser interaction.

```bash
# Make the script executable
chmod +x tests/cli-runner.js

# Run the tests
./tests/cli-runner.js
```

### Browser-based Tests

#### Unit Tests

```bash
# No setup required, just open in browser:
open tests/unit-tests/ride-requests/index.html
```

#### Integration Tests

```bash
# 1. Initialize database
npm run init-db

# 2. Start API server
npm run api

# 3. Open tests in browser
open tests/integration-tests/ride-requests/index.html
```

#### Scenario Tests

```bash
# Open specific scenario
open tests/scenarios/[scenario-name]/index.html
```

## Supported Features

The following feature IDs represent core functionality tested by our test suite. These IDs serve as an immutable canon of application features, where any changes may indicate a feature modification or branch requirement.

### Ride Request Features

#### FEAT_RIDE_REQ_001

- **Description**: Create ride request
- **Endpoint**: POST /api/ride-requests
- **Validates**:
  - Required fields validation
  - Fare calculation
  - Response structure
  - Status codes (201 for success)

#### FEAT_RIDE_REQ_002

- **Description**: Retrieve ride request
- **Endpoint**: GET /api/ride-requests/:id
- **Validates**:
  - Correct request retrieval
  - Data accuracy
  - Status codes (200 for success, 404 for not found)

#### FEAT_RIDE_REQ_003

- **Description**: Update ride request
- **Endpoint**: PUT /api/ride-requests/:id
- **Validates**:
  - Status updates
  - Data modifications
  - Response accuracy
  - Status codes (200 for success)

#### FEAT_RIDE_REQ_004

- **Description**: Delete ride request
- **Endpoint**: DELETE /api/ride-requests/:id
- **Validates**:
  - Request removal
  - Proper cleanup
  - Status codes (204 for success)

### Account Features

#### FEAT_ACCT_001

- **Description**: Account creation
- **Endpoint**: POST /api/accounts
- **Validates**:
  - Required fields validation
  - Account creation
  - Response structure
  - Status codes (201 for success)

#### FEAT_ACCT_002

- **Description**: Account retrieval
- **Endpoint**: GET /api/accounts/:email
- **Validates**:
  - Correct account retrieval
  - Data accuracy
  - Status codes (200 for success, 404 for not found)

#### FEAT_ACCT_003

- **Description**: Account updates
- **Endpoint**: PUT /api/accounts/:email
- **Validates**:
  - Field updates
  - Data accuracy
  - Status codes (200 for success)

#### FEAT_ACCT_004

- **Description**: Account deletion
- **Endpoint**: DELETE /api/accounts/:email
- **Validates**:
  - Account removal
  - Proper cleanup
  - Status codes (204 for success)

#### FEAT_ACCT_005

- **Description**: Duplicate account prevention
- **Endpoint**: POST /api/accounts
- **Validates**:
  - Unique email constraint
  - Conflict handling
  - Status codes (409 for conflict)

## Test Types Comparison

### Unit Tests

- ✅ Fast execution
- ✅ No setup required
- ✅ Isolated testing
- ✅ Predictable results
- ❌ Doesn't test real integrations

### Integration Tests

- ✅ Tests real interactions
- ✅ Catches integration issues
- ✅ Tests actual data flow
- ❌ Requires setup
- ❌ Slower execution

### Scenario Tests

- ✅ Tests complete workflows
- ✅ End-to-end validation
- ✅ Real user scenarios
- ❌ Complex setup
- ❌ Slower execution

## Best Practices

1. **Run Unit Tests First**

   - Start with unit tests during development
   - Quick feedback loop
   - Identify basic issues early

2. **Integration Tests for Critical Paths**

   - Run integration tests for key functionality
   - Verify system components work together
   - Test database interactions

3. **Scenario Tests for User Workflows**
   - Validate complete user journeys
   - Test real-world use cases
   - Final verification layer

## Adding New Tests

1. Choose appropriate test type based on what you're testing
2. Create new directory in corresponding test folder
3. Follow existing patterns for test structure
4. Include README.md explaining test purpose and setup
5. Update this main README if adding new test categories
6. When adding new features, assign a unique feature ID following the pattern:
   - `FEAT_[CATEGORY]_[NUMBER]`
   - Example: `FEAT_RIDE_REQ_005` for a new ride request feature

## Troubleshooting

### Unit Tests Failing

- Check browser console for errors
- Verify mock data structure
- Review test assertions

### Integration Tests Failing

- Ensure API server is running
- Verify database is initialized
- Check server logs for errors
- Confirm network connectivity

### Scenario Tests Failing

- Review all prerequisites
- Check system configuration
- Verify all components are running

### CLI Test Runner Issues

- Ensure script is executable (`chmod +x tests/cli-runner.js`)
- Verify API server is running for integration tests
- Check Node.js version (requires fetch API support)
- Review console output for specific test failures
