#!/bin/bash

# Wait for services to be available in Docker network
echo "Waiting for services to be ready..."
sleep 10

# Check if accounts service is available
echo "Checking accounts service availability..."
timeout 60 bash -c 'until curl -s http://accounts-service:4001/graphql > /dev/null 2>&1; do sleep 2; done'
if [ $? -eq 124 ]; then
  echo "Timeout waiting for accounts service"
  exit 1
fi

# Check if reviews service is available
echo "Checking reviews service availability..."
timeout 60 bash -c 'until curl -s http://reviews-service:4002/graphql > /dev/null 2>&1; do sleep 2; done'
if [ $? -eq 124 ]; then
  echo "Timeout waiting for reviews service"
  exit 1
fi

echo "Creating subgraph configurations..."

# Clean up any existing config
rm -rf .fusion 2>/dev/null

# Initialize fusion project
mkdir -p .fusion/subgraphs

# Create accounts subgraph configuration
mkdir -p .fusion/subgraphs/accounts
cat > .fusion/subgraphs/accounts/subgraph-config.json << 'EOF'
{
  "subgraph": "accounts",
  "http": {
    "baseAddress": "http://accounts-service:4001/graphql"
  }
}
EOF

# Create reviews subgraph configuration
mkdir -p .fusion/subgraphs/reviews  
cat > .fusion/subgraphs/reviews/subgraph-config.json << 'EOF'
{
  "subgraph": "reviews", 
  "http": {
    "baseAddress": "http://reviews-service:4002/graphql"
  }
}
EOF

echo "Downloading SDL schemas from running services..."

# Download SDL schema from accounts service using introspection query
curl -X POST http://accounts-service:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query IntrospectionQuery { __schema { queryType { name } mutationType { name } subscriptionType { name } types { ...FullType } directives { name description locations args { ...InputValue } } } } fragment FullType on __Type { kind name description fields(includeDeprecated: true) { name description args { ...InputValue } type { ...TypeRef } isDeprecated deprecationReason } inputFields { ...InputValue } interfaces { ...TypeRef } enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason } possibleTypes { ...TypeRef } } fragment InputValue on __InputValue { name description type { ...TypeRef } defaultValue } fragment TypeRef on __Type { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } } } }"}' \
  -o .fusion/subgraphs/accounts/introspection.json

# Convert introspection result to SDL for accounts service
node -e "
const fs = require('fs');
const introspection = JSON.parse(fs.readFileSync('.fusion/subgraphs/accounts/introspection.json', 'utf8'));

function typeToString(type) {
  if (type.kind === 'NON_NULL') {
    return typeToString(type.ofType) + '!';
  }
  if (type.kind === 'LIST') {
    return '[' + typeToString(type.ofType) + ']';
  }
  return type.name;
}

let sdl = '';
const schema = introspection.data.__schema;

// Process Query type
const queryType = schema.types.find(t => t.name === 'Query');
if (queryType) {
  sdl += 'type Query {\\n';
  queryType.fields.forEach(field => {
    const args = field.args.length > 0 
      ? '(' + field.args.map(arg => \`\${arg.name}: \${typeToString(arg.type)}\`).join(', ') + ')'
      : '';
    sdl += \`  \${field.name}\${args}: \${typeToString(field.type)}\\n\`;
  });
  sdl += '}\\n\\n';
}

// Process custom types (skip built-in types)
schema.types.forEach(type => {
  if (type.name.startsWith('__') || ['String', 'Int', 'Float', 'Boolean', 'ID'].includes(type.name) || type.name === 'Query') return;
  
  if (type.kind === 'OBJECT') {
    sdl += \`type \${type.name} {\\n\`;
    type.fields.forEach(field => {
      sdl += \`  \${field.name}: \${typeToString(field.type)}\\n\`;
    });
    sdl += '}\\n\\n';
  }
});

fs.writeFileSync('.fusion/subgraphs/accounts/schema.graphql', sdl);
"

# Download SDL schema from reviews service using introspection query
curl -X POST http://reviews-service:4002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query IntrospectionQuery { __schema { queryType { name } mutationType { name } subscriptionType { name } types { ...FullType } directives { name description locations args { ...InputValue } } } } fragment FullType on __Type { kind name description fields(includeDeprecated: true) { name description args { ...InputValue } type { ...TypeRef } isDeprecated deprecationReason } inputFields { ...InputValue } interfaces { ...TypeRef } enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason } possibleTypes { ...TypeRef } } fragment InputValue on __InputValue { name description type { ...TypeRef } defaultValue } fragment TypeRef on __Type { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } } } }"}' \
  -o .fusion/subgraphs/reviews/introspection.json

# Convert introspection result to SDL for reviews service  
node -e "
const fs = require('fs');
const introspection = JSON.parse(fs.readFileSync('.fusion/subgraphs/reviews/introspection.json', 'utf8'));

function typeToString(type) {
  if (type.kind === 'NON_NULL') {
    return typeToString(type.ofType) + '!';
  }
  if (type.kind === 'LIST') {
    return '[' + typeToString(type.ofType) + ']';
  }
  return type.name;
}

let sdl = '';
const schema = introspection.data.__schema;

// Process Query type
const queryType = schema.types.find(t => t.name === 'Query');
if (queryType) {
  sdl += 'type Query {\\n';
  queryType.fields.forEach(field => {
    const args = field.args.length > 0 
      ? '(' + field.args.map(arg => \`\${arg.name}: \${typeToString(arg.type)}\`).join(', ') + ')'
      : '';
    sdl += \`  \${field.name}\${args}: \${typeToString(field.type)}\\n\`;
  });
  sdl += '}\\n\\n';
}

// Process custom types (skip built-in types)
schema.types.forEach(type => {
  if (type.name.startsWith('__') || ['String', 'Int', 'Float', 'Boolean', 'ID'].includes(type.name) || type.name === 'Query') return;
  
  if (type.kind === 'OBJECT') {
    sdl += \`type \${type.name} {\\n\`;
    type.fields.forEach(field => {
      sdl += \`  \${field.name}: \${typeToString(field.type)}\\n\`;
    });
    sdl += '}\\n\\n';
  }
});

fs.writeFileSync('.fusion/subgraphs/reviews/schema.graphql', sdl);
"

echo "SDL schemas generated from introspection data"

echo "Creating subgraph packages..."

# Pack accounts subgraph
fusion subgraph pack \
  --schema-file .fusion/subgraphs/accounts/schema.graphql \
  --config-file .fusion/subgraphs/accounts/subgraph-config.json \
  --package-file .fusion/subgraphs/accounts/accounts.fsp

# Pack reviews subgraph  
fusion subgraph pack \
  --schema-file .fusion/subgraphs/reviews/schema.graphql \
  --config-file .fusion/subgraphs/reviews/subgraph-config.json \
  --package-file .fusion/subgraphs/reviews/reviews.fsp

echo "Composing fusion gateway..."

# Remove existing gateway configuration
rm -f ./gateway.docker.fgp

# Compose the fusion gateway
fusion compose \
  --package-file ./gateway.docker.fgp \
  --subgraph-package-file .fusion/subgraphs/accounts/accounts.fsp \
  --subgraph-package-file .fusion/subgraphs/reviews/reviews.fsp

echo "Docker fusion configuration generated successfully!"