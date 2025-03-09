#!/bin/bash

# Script to run all API tests
echo "MCP API Testing Suite"
echo "====================="
echo

# Create a results directory for test outputs
mkdir -p ./test-results
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")

echo "Running Filesystem API tests..."
echo "------------------------------"
node test-filesystem-api.js | tee "./test-results/filesystem-test-${timestamp}.log"
echo

echo "Running Brave Search API tests..."
echo "--------------------------------"
node test-brave-search-api.js | tee "./test-results/brave-search-test-${timestamp}.log"
echo

echo "All tests completed. Results saved to ./test-results"
