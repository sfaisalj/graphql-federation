#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Generate types from running GraphQL endpoint
const generateTypes = async () => {
  try {
    console.log('🔍 Introspecting GraphQL schema...');
    
    // Install graphql-codegen if not present
    try {
      require('@graphql-codegen/cli');
    } catch (e) {
      console.log('📦 Installing GraphQL Code Generator...');
      execSync('npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations', { stdio: 'inherit' });
    }

    // Create codegen config
    const config = {
      schema: 'http://localhost:4000/graphql',
      documents: 'src/**/*.{ts,tsx}',
      generates: {
        'src/app/generated/types.ts': {
          plugins: ['typescript', 'typescript-operations']
        }
      },
      config: {
        skipTypename: false,
        withHooks: false,
        withHOC: false,
        withComponent: false
      }
    };

    fs.writeFileSync('codegen.yml', require('yaml').stringify(config));
    
    // Generate types
    execSync('npx graphql-codegen --config codegen.yml', { stdio: 'inherit' });
    
    console.log('✅ Types generated successfully!');
    console.log('📁 Check src/app/generated/types.ts');
    
  } catch (error) {
    console.error('❌ Failed to generate types:', error.message);
    console.log('💡 Make sure your GraphQL server is running on http://localhost:4000/graphql');
  }
};

generateTypes();