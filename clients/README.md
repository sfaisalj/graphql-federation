# GraphQL Client Examples

This directory contains three different Angular applications demonstrating various approaches to GraphQL client implementation, each showcasing different trade-offs between complexity, features, and flexibility.

## 🚀 Quick Start

Each client connects to the mesh gateway running on `http://localhost:4000/graphql`.

```bash
# Start the mesh gateway first
cd ../mesh-gateway
npm run dev

# Then run any client
cd apollo/angular-apollo-client && npm start
cd graphql-request/angular-graphql-request && npm start  
cd urql/angular-urql-client && npm start
```

## 📊 Client Comparison

| Feature | Apollo Client | graphql-request | urql |
|---------|---------------|-----------------|------|
| **Bundle Size** | ~500KB | ~20KB | ~100KB |
| **Learning Curve** | High | Low | Medium |
| **Caching** | Advanced | None | Basic |
| **Real-time** | Subscriptions | No | Subscriptions |
| **Offline** | Yes | No | With exchanges |
| **Build Complexity** | High | None | Low |
| **TypeScript** | Codegen | Manual/Flexible | Codegen |

## 🏗️ Implementation Approaches

### 1. Apollo Client (`/apollo/`)
**Best for: Enterprise applications with complex state management**

- ✅ Advanced caching and state management
- ✅ Subscriptions and real-time updates  
- ✅ Extensive ecosystem and tooling
- ✅ Optimistic updates and error handling
- ❌ Large bundle size and complexity
- ❌ Requires build-time schema for optimal experience

```typescript
// Example usage
this.apollo.watchQuery({
  query: GET_ACCOUNTS,
  fetchPolicy: 'cache-first'
}).valueChanges.subscribe(result => {
  this.accounts = result.data.accounts;
});
```

### 2. graphql-request (`/graphql-request/`)
**Best for: Simple queries with maximum flexibility** ⭐ **RECOMMENDED**

- ✅ Minimal overhead (~20KB)
- ✅ No build-time schema requirements
- ✅ Runtime flexibility
- ✅ Easy to understand and debug
- ❌ No caching out of the box
- ❌ Manual optimizations required

```typescript
// Example usage
this.client.request(query, variables)
  .subscribe(result => {
    this.accounts = result.accounts;
  });
```

### 3. urql (`/urql/`)
**Best for: Modern apps wanting lightweight caching**

- ✅ Smaller than Apollo (~100KB)
- ✅ Flexible exchange system
- ✅ Built-in caching with normalization
- ✅ React-like hooks pattern (adapted for Angular)
- ❌ Smaller ecosystem than Apollo
- ❌ Less mature than Apollo

```typescript
// Example usage
this.urql.query(GET_ACCOUNTS)
  .subscribe(result => {
    if (result.data) {
      this.accounts = result.data.accounts;
    }
  });
```

## 🎯 Type Safety Approaches

All three clients can be enhanced with different typing strategies:

### Option 1: Runtime Schema Introspection + Codegen
**Strongest types, requires running server**

```bash
# In any client directory
node generate-types.js
```

- ✅ Generated from actual schema
- ✅ Catches breaking changes at build time
- ❌ Requires server to be running during build

### Option 2: Typed Query Builder Pattern ⭐ **RECOMMENDED**
**Best balance of type safety and flexibility**

```typescript
// Type-safe queries without schema dependency
const query = QueryFactory.getAccounts();
this.service.execute(query).subscribe(result => {
  // result.accounts is fully typed
});
```

- ✅ Strong TypeScript types at compile time
- ✅ No schema dependency
- ✅ Runtime flexibility for dynamic queries
- ✅ Easy to extend

### Option 3: Runtime Type Validation
**Runtime safety with Zod schemas**

```typescript
// Runtime validation with type inference
this.validatedService.getAccounts().subscribe(result => {
  // Validated at runtime, typed at compile time
});
```

- ✅ Catches API changes at runtime
- ✅ Self-documenting schemas
- ❌ Runtime overhead for validation

## 🏆 Recommendations

### For New Projects
**Use `graphql-request` with Typed Query Builder pattern**
- Location: `/graphql-request/angular-graphql-request/`
- Service: `typed-queries.service.ts`
- Why: Maximum flexibility with strong types, no build dependencies

### For Enterprise Applications
**Use Apollo Client with codegen**
- Location: `/apollo/angular-apollo-client/`
- Why: Advanced features, extensive ecosystem, battle-tested

### For Modern Lightweight Apps
**Use urql with exchanges**
- Location: `/urql/angular-urql-client/`  
- Why: Modern architecture, smaller than Apollo, good caching

## 🔧 Advanced Features

### Error Handling Patterns

```typescript
// Comprehensive error handling
this.graphqlService.getAccounts().subscribe({
  next: (result) => {
    // Handle success
    this.accounts.set(result.accounts);
  },
  error: (error) => {
    // Network errors
    console.error('Network error:', error);
    this.error.set('Failed to connect to server');
  }
});
```

### Dynamic Query Building

```typescript
// Build queries at runtime
const dynamicFields = ['id', 'name', 'email'];
const query = `
  query GetAccounts {
    accounts {
      ${dynamicFields.join('\n      ')}
    }
  }
`;
```

### Caching Strategies

| Client | Strategy | Implementation |
|--------|----------|----------------|
| **Apollo** | Normalized cache | Automatic with `InMemoryCache` |
| **graphql-request** | Manual caching | RxJS operators + storage |
| **urql** | Document cache | Built-in with cache exchange |

## 🔍 Performance Considerations

### Bundle Size Impact
- **Apollo**: Full-featured but large (~500KB)
- **graphql-request**: Minimal footprint (~20KB)
- **urql**: Balanced approach (~100KB)

### Network Optimization
- **Batching**: Apollo and urql support query batching
- **Deduplication**: All three can deduplicate identical queries
- **Caching**: Apollo > urql > graphql-request (manual)

## 🚢 Production Deployment

### Build Requirements
- **Apollo**: May require schema at build time for codegen
- **graphql-request**: No build dependencies
- **urql**: Minimal build requirements

### Runtime Configuration
```typescript
// Environment-based endpoint configuration
const GRAPHQL_ENDPOINT = environment.production 
  ? 'https://api.yourdomain.com/graphql'
  : 'http://localhost:4000/graphql';
```

## 🧪 Testing Strategies

### Mocking GraphQL Responses
```typescript
// Example test setup
const mockResponse = {
  accounts: [
    { id: '1', name: 'John Doe', email: 'john@example.com' }
  ]
};

// Mock the service
jest.spyOn(graphqlService, 'getAccounts')
  .mockReturnValue(of(mockResponse));
```

## 📚 Additional Resources

- [Apollo Client Documentation](https://www.apollographql.com/docs/angular/)
- [graphql-request Documentation](https://github.com/jasonkuhrt/graphql-request)
- [urql Documentation](https://formidable.com/open-source/urql/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

## 🤝 Contributing

When adding new client examples:
1. Follow the existing directory structure
2. Include comprehensive TypeScript types  
3. Add error handling examples
4. Update this README with comparisons
5. Include testing examples

---

**Need help choosing?** Start with `graphql-request` + Typed Query Builder for most use cases. Upgrade to Apollo when you need advanced caching, subscriptions, or offline support.