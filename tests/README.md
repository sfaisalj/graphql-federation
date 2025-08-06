# GraphQL Fusion Integration Tests

This folder contains integration tests for the GraphQL Fusion project, testing both individual services and the federated gateway.

## Test Structure

### DirectServiceTests.cs
Tests individual GraphQL services directly:
- **Accounts Service** (Port 4001) - Tests account queries and edge cases
- **Reviews Service** (Port 4002) - Tests review queries and filtering

### GraphQLGatewayTests.cs
Tests the federated GraphQL gateway:
- **Federated Queries** - Tests queries that combine data from multiple services
- **Gateway Functionality** - Tests the fusion layer behavior
- **Error Handling** - Tests invalid queries and error responses

## Running Tests

### Prerequisites
Ensure Docker containers are running:
```bash
docker-compose up -d
```

Wait for all services to be healthy:
```bash
docker ps
# All containers should show "Up" status
```

### Run All Tests
```bash
cd tests/GraphQLFusion.IntegrationTests
dotnet test
```

### Run Specific Test Classes
```bash
# Test individual services only
dotnet test --filter "DirectServiceTests"

# Test gateway functionality only  
dotnet test --filter "GraphQLGatewayTests"
```

### Run with Verbose Output
```bash
dotnet test --logger "console;verbosity=detailed"
```

## Test Categories

### ✅ Individual Service Tests (DirectServiceTests)
- `AccountsService_GetAllAccounts_ShouldReturnThreeAccounts`
- `AccountsService_GetAccountById_ShouldReturnSpecificAccount`
- `AccountsService_GetNonExistentAccount_ShouldReturnNull`
- `ReviewsService_GetAllReviews_ShouldReturnFiveReviews`
- `ReviewsService_GetReviewsByAccountId_ShouldReturnAccountSpecificReviews`
- `ReviewsService_GetReviewsForNonExistentAccount_ShouldReturnEmptyArray`

### 🔄 Gateway Tests (GraphQLGatewayTests)
- `GetAccounts_ShouldReturnAllAccounts`
- `GetAccountById_ShouldReturnSpecificAccount`
- `GetReviews_ShouldReturnAllReviews`
- `GetReviewsByAccountId_ShouldReturnAccountSpecificReviews`
- `GetMultipleQueries_ShouldReturnBothAccountsAndReviews`
- `InvalidQuery_ShouldReturnErrors`

## Test Data

### Sample Accounts
```json
[
  {"id": "1", "name": "John Doe", "email": "john@example.com"},
  {"id": "2", "name": "Jane Smith", "email": "jane@example.com"},
  {"id": "3", "name": "Bob Johnson", "email": "bob@example.com"}
]
```

### Sample Reviews
```json
[
  {"id": "1", "body": "Great product! Highly recommended.", "accountId": "1"},
  {"id": "2", "body": "Good quality but could be better.", "accountId": "1"},
  {"id": "3", "body": "Amazing service and fast delivery.", "accountId": "2"},
  {"id": "4", "body": "Not satisfied with the purchase.", "accountId": "2"},
  {"id": "5", "body": "Excellent value for money!", "accountId": "3"}
]
```

## Configuration

### Service Endpoints
- **Accounts Service**: `http://localhost:4001/graphql`
- **Reviews Service**: `http://localhost:4002/graphql`
- **Gateway Service**: `http://localhost:5001/graphql`

### Test Dependencies
- **xUnit** - Test framework
- **FluentAssertions** - Assertion library
- **Microsoft.AspNetCore.Mvc.Testing** - Integration testing utilities

## Troubleshooting

### Services Not Responding
1. Check Docker containers are running: `docker ps`
2. Check individual services:
   ```bash
   curl http://localhost:4001/graphql -d '{"query":"{ accounts { id } }"}'
   curl http://localhost:4002/graphql -d '{"query":"{ reviews { id } }"}'
   ```
3. Restart containers if needed: `docker-compose restart`

### Gateway Issues
1. Check gateway logs: `docker logs graphql-fusion-gateway-1`
2. Verify fusion configuration is correct
3. Ensure subgraph services are accessible from gateway container

### Test Failures
1. Verify test data matches expected values
2. Check service endpoints are accessible
3. Review error messages for GraphQL schema issues

## Adding New Tests

### For Individual Services
1. Add test methods to `DirectServiceTests.cs`
2. Use direct HTTP calls to service endpoints
3. Test both success and error scenarios

### For Gateway Functionality
1. Add test methods to `GraphQLGatewayTests.cs`
2. Use federated queries that span multiple services
3. Test cross-service data relationships

### Test Naming Convention
- `ServiceName_Action_ExpectedResult`
- Example: `AccountsService_GetAccountById_ShouldReturnSpecificAccount`

## Continuous Integration

Tests can be automated in CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Run Integration Tests
  run: |
    docker-compose up -d
    sleep 30  # Wait for services to be ready
    cd tests/GraphQLFusion.IntegrationTests  
    dotnet test --logger "trx" --results-directory ./TestResults
```