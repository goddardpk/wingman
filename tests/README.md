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

### Unit Tests

```bash
# No setup required, just open in browser:
open tests/unit-tests/ride-requests/index.html
```

### Integration Tests

```bash
# 1. Initialize database
npm run init-db

# 2. Start API server
npm run api

# 3. Open tests in browser
open tests/integration-tests/ride-requests/index.html
```

### Scenario Tests

```bash
# Open specific scenario
open tests/scenarios/[scenario-name]/index.html
```

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
