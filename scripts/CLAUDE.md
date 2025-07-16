# Recipe Sync Tool for Claude

## When User Says: "sync examples with code" or similar

Execute this process step-by-step:

### Step 1: Run Sync Script
```bash
cd /Users/tom/Projects/Design-system/goa-design-system-mcp
node scripts/sync-recipes.js
```

**What it does:** Compares TSX example files with recipe JSON files, updates timestamps, syncs code examples

### Step 2: Rebuild MCP Server
```bash
npm run build
```

**What it does:** Recompiles TypeScript files so server can read updated recipes

### Step 3: Test (Optional)
```bash
node scripts/test-recipe-queries.js
```

**Note:** If test fails with module not found error, ensure the import path in test-recipe-queries.js points to `../build/optimized-data-manager.js` (compiled files are in build/, not dist/)

**What it does:** Validates that recipes are properly indexed and searchable

### Step 4: Report to User
Tell them:
- How many recipes were updated/up-to-date
- Any new recipe files that need manual completion
- Any validation errors found
- Reminder that MCP server needs restart if running

## Additional Available Scripts

### Validate Recipes Only
```bash
node scripts/validate-recipes.js
```

### Full Sync + Test Process
```bash
./scripts/full-sync.sh
```

## What Sync Does vs Doesn't Do

### ✅ Automatically Updates:
- `lastModified` timestamps
- `linesOfCode` counts  
- `codeExamples.react.complete` with full TSX
- Basic component detection

### ⚠️ Still Needs Manual Work:
- Recipe metadata (name, summary, category)
- Service context (use cases, government flows)
- Component roles and purposes
- Design patterns and accessibility notes
- Related recipes and tags

## Expected File Locations

- **Examples:** `/Users/tom/Projects/Design-system/ui-components-docs/src/examples/*.tsx`
- **Recipes:** `/Users/tom/Projects/Design-system/goa-design-system-mcp/data/recipes/*.json`
- **Schema:** `/Users/tom/Projects/Design-system/goa-design-system-mcp/recipe-schema.json`

## Error Handling

If sync fails:
1. Check that both directories exist
2. Verify example files are valid TSX
3. Check recipe JSON syntax
4. Ensure file permissions are correct

## This is a Tool

Claude should use this as a standard tool when user requests example/recipe synchronization. Always run from the MCP directory and report results clearly.