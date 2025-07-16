#!/bin/bash

# Full Recipe Sync Script
# Syncs examples with recipes, rebuilds server, and tests

set -e  # Exit on any error

echo "🔄 Starting full recipe sync process..."
echo ""

# Step 1: Sync recipes
echo "📋 Step 1: Syncing recipes with examples..."
node scripts/sync-recipes.js

echo ""

# Step 2: Rebuild server
echo "🔨 Step 2: Rebuilding MCP server..."
npm run build

echo ""

# Step 3: Test recipes (optional)
echo "🧪 Step 3: Testing recipe queries..."
node scripts/test-recipe-queries.js

echo ""
echo "✅ Full sync process completed!"
echo "💡 If MCP server is running, restart it to pick up changes"