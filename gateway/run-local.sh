#!/bin/bash

echo "Starting GraphQL Fusion Gateway locally..."
echo "Make sure accounts and reviews services are running on ports 4001 and 4002"

# Generate fusion configuration
echo "Generating fusion configuration..."
sh ./generate-fusion-config.sh

if [ $? -ne 0 ]; then
  echo "Failed to generate fusion configuration. Make sure services are running."
  exit 1
fi

# Start the gateway
echo "Starting gateway on port 5001..."
dotnet run