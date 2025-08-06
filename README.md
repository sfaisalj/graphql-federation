# GraphQL Fusion with ChilliCream HotChocolate

A distributed GraphQL architecture using HotChocolate Fusion, consisting of multiple independent GraphQL services federated through a gateway.

## Architecture

```
┌─────────────────────┐
│  Fusion Gateway     │  ← Main GraphQL endpoint
│  (Port 5159/5001)   │
└─────────┬───────────┘
          │
          ├── Accounts Service (Port 4001)
          └── Reviews Service (Port 4002)
```

## Services

### 1. Accounts Service
- **Path**: `accounts/AccountsService/`
- **Port**: 4001
- **GraphQL Endpoint**: `http://localhost:4001/graphql`
- **Schema**: Account type with id, name, email fields

### 2. Reviews Service  
- **Path**: `reviews/ReviewsService/`
- **Port**: 4002
- **GraphQL Endpoint**: `http://localhost:4002/graphql`
- **Schema**: Review type with id, body, accountId fields

### 3. Fusion Gateway
- **Path**: `gateway/`
- **Port**: 5159 (local) / 5001 (Docker)
- **GraphQL Endpoint**: `http://localhost:5159/graphql`
- **Purpose**: Federates accounts and reviews services

## Running the Project

### Option 1: Docker Compose (Recommended)

1. **Start all services with Docker:**
   ```bash
   docker-compose up --build
   ```

2. **Access the unified GraphQL endpoint:**
   ```
   http://localhost:5001/graphql
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

1. **Start Accounts Service:**
   ```bash
   cd accounts/AccountsService
   dotnet run
   # Running on http://localhost:4001
   ```

2. **Start Reviews Service:**
   ```bash
   cd reviews/ReviewsService  
   dotnet run
   # Running on http://localhost:4002
   ```

3. **Start Fusion Gateway:**
   ```bash
   cd gateway
   dotnet run
   # Running on http://localhost:5159
   ```

## Sample Queries

### Query Accounts
```graphql
{
  accounts {
    id
    name
    email
  }
}
```

### Query Specific Account
```graphql
{
  accountById(id: "1") {
    id
    name
    email
  }
}
```

### Query Reviews
```graphql
{
  reviews {
    id
    body
    accountId
  }
}
```

### Query Reviews by Account
```graphql
{
  reviewsByAccountId(accountId: "1") {
    id
    body
    accountId
  }
}
```

## Testing Services

### Test Individual Services

**Accounts Service:**
```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ accounts { id name email } }"}'
```

**Reviews Service:**
```bash
curl -X POST http://localhost:4002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ reviews { id body accountId } }"}'
```

**Fusion Gateway:**
```bash
curl -X POST http://localhost:5159/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ accounts { id name email } }"}'
```

## Updating Fusion Subgraphs

### Prerequisites
Install the HotChocolate Fusion CLI:
```bash
dotnet tool install -g HotChocolate.Fusion.CommandLine
```

### Creating a New Fusion Configuration (.fgp) from Scratch

Use the Fusion CLI to automatically generate a fusion configuration from running subgraphs:

1. **Start all subgraph services:**
   ```bash
   # Terminal 1 - Start accounts service
   cd accounts/AccountsService
   dotnet run
   
   # Terminal 2 - Start reviews service  
   cd reviews/ReviewsService
   dotnet run
   ```

2. **Create subgraph packages:**
   ```bash
   cd gateway
   
   # Create accounts subgraph package
   fusion subgraph pack \
     --package-file accounts.fsp \
     --schema-file http://localhost:4001/graphql \
     --config-file accounts.json
   
   # Create reviews subgraph package
   fusion subgraph pack \
     --package-file reviews.fsp \
     --schema-file http://localhost:4002/graphql \
     --config-file reviews.json
   ```

3. **Compose fusion configuration:**
   ```bash
   fusion compose \
     --package accounts.fsp \
     --package reviews.fsp \
     --output gateway.fgp
   ```

4. **Manually create subgraph configuration files:**
   
   Create `accounts.json`:
   ```json
   {
     "subgraph": "accounts",
     "http": { "baseAddress": "http://localhost:4001/graphql" }
   }
   ```
   
   Create `reviews.json`:
   ```json
   {
     "subgraph": "reviews", 
     "http": { "baseAddress": "http://localhost:4002/graphql" }
   }
   ```

### Steps to Update Existing Fusion Configuration

1. **Update Subgraph Schema or Data:**
   - Modify the GraphQL types, resolvers, or data in either service
   - Test the individual service to ensure it works

2. **Regenerate Fusion Configuration (Recommended):**
   ```bash
   # Ensure services are running
   # Recreate subgraph packages
   fusion subgraph pack --package-file accounts.fsp --schema-file http://localhost:4001/graphql --config-file accounts.json
   fusion subgraph pack --package-file reviews.fsp --schema-file http://localhost:4002/graphql --config-file reviews.json
   
   # Recompose fusion configuration
   fusion compose --package accounts.fsp --package reviews.fsp --output gateway.fgp
   ```

3. **Or Manually Update Configuration:**
   - Edit `gateway/gateway.fgp`
   - Update type definitions, resolvers, or transport locations as needed

4. **Restart Gateway Service:**
   ```bash
   # For Docker
   docker-compose restart gateway
   
   # For Local Development  
   # Stop and restart the gateway service
   cd gateway
   dotnet run
   ```

### Fusion Configuration File Structure

The `gateway.fgp` file defines:

- **Schema Definition**: Main GraphQL schema with query type
- **Transport Configuration**: HTTP endpoints for each subgraph
- **Type Definitions**: Federated types with their source subgraphs
- **Resolvers**: How to fetch data from subgraphs

Example configuration:
```graphql
schema
  @fusion(version: 1)
  @transport(subgraph: "accounts", location: "http://localhost:4001/graphql", kind: "HTTP")
  @transport(subgraph: "reviews", location: "http://localhost:4002/graphql", kind: "HTTP") {
  query: Query
}

type Query {
  accounts: [Account!]!
    @resolver(subgraph: "accounts", select: "{ accounts }")
}

type Account
  @source(subgraph: "accounts") {
  id: String!
  name: String!
  email: String!
}
```

## Development Notes

### Adding New Subgraphs

1. Create a new GraphQL service project
2. Add transport configuration to `gateway.fgp`
3. Define types and resolvers in the fusion configuration
4. Update Docker Compose if needed

### Port Configuration

- **Development**: Services use random ports (5159, etc.)
- **Docker**: Services use fixed ports (4001, 4002, 5001)
- **Docker Internal**: Services communicate via service names

### Dependencies

Each service requires:
- .NET 8.0 SDK
- HotChocolate.AspNetCore (for individual services)
- HotChocolate.Fusion (for gateway)

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Check if ports 4001, 4002, 5001, 5159 are available
2. **Service Discovery**: Ensure all dependent services are running before starting gateway
3. **Docker Network**: Services must be on the same Docker network to communicate

### Logs

Check individual service logs:
```bash
# Docker logs
docker logs graphql-fusion-gateway-1
docker logs graphql-fusion-accounts-service-1
docker logs graphql-fusion-reviews-service-1

# Local development logs appear in terminal
```

### Validation

Verify each service independently before testing the gateway:
1. Test accounts service GraphQL endpoint
2. Test reviews service GraphQL endpoint  
3. Test fusion gateway federated queries

## Contributing

When adding new features:
1. Update the relevant subgraph service
2. Update fusion configuration if schema changes
3. Update this README with new queries/endpoints
4. Test both individual services and federated queries
