#!/usr/bin/env node

/**
 * Recipe Sync Script
 * 
 * Synchronizes recipe JSON files with their corresponding TSX examples
 * - Checks for file modifications
 * - Updates lastModified timestamps
 * - Validates recipe JSON against schema
 * - Reports sync status
 */

import { readFile, writeFile, stat, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const EXAMPLES_DIR = join(PROJECT_ROOT, '../ui-components-docs/src/examples');
const RECIPES_DIR = join(PROJECT_ROOT, 'data/recipes');
const SCHEMA_FILE = join(PROJECT_ROOT, 'recipe-schema.json');

class RecipeSync {
  constructor() {
    this.schema = null;
    this.syncResults = {
      updated: [],
      errors: [],
      upToDate: [],
      missing: []
    };
  }

  async loadSchema() {
    try {
      const schemaData = await readFile(SCHEMA_FILE, 'utf8');
      this.schema = JSON.parse(schemaData);
      console.log('✓ Recipe schema loaded');
    } catch (error) {
      console.error('✗ Failed to load recipe schema:', error.message);
      process.exit(1);
    }
  }

  async findExampleFiles() {
    try {
      const files = await readdir(EXAMPLES_DIR);
      return files.filter(file => file.endsWith('.tsx'));
    } catch (error) {
      console.error('✗ Failed to read examples directory:', error.message);
      return [];
    }
  }

  async findRecipeFiles() {
    try {
      const files = await readdir(RECIPES_DIR);
      return files.filter(file => file.endsWith('.json') && file !== 'README.md');
    } catch (error) {
      console.error('✗ Failed to read recipes directory:', error.message);
      return [];
    }
  }

  async checkFileModification(exampleFile, recipeFile) {
    try {
      const examplePath = join(EXAMPLES_DIR, exampleFile);
      const recipePath = join(RECIPES_DIR, recipeFile);
      
      const [exampleStats, recipeStats] = await Promise.all([
        stat(examplePath),
        stat(recipePath).catch(() => null)
      ]);

      if (!recipeStats) {
        return { needsSync: true, reason: 'Recipe file missing' };
      }

      if (exampleStats.mtime > recipeStats.mtime) {
        return { needsSync: true, reason: 'Example file is newer' };
      }

      return { needsSync: false, reason: 'Up to date' };
    } catch (error) {
      return { needsSync: true, reason: `Error checking files: ${error.message}` };
    }
  }

  async extractComponentsFromExample(exampleContent) {
    // Simple regex-based extraction - could be enhanced with AST parsing
    const componentMatches = exampleContent.match(/Goab\\w+/g) || [];
    const uniqueComponents = [...new Set(componentMatches)];
    
    return uniqueComponents.map(name => ({
      name,
      role: 'component', // Would need more sophisticated analysis
      purpose: 'Extracted from example file',
      props: {}
    }));
  }

  async updateRecipeFromExample(exampleFile, recipeFile) {
    try {
      const examplePath = join(EXAMPLES_DIR, exampleFile);
      const recipePath = join(RECIPES_DIR, recipeFile);
      
      // Read example file
      const exampleContent = await readFile(examplePath, 'utf8');
      const exampleStats = await stat(examplePath);
      
      // Read existing recipe or create new one
      let recipe;
      try {
        const recipeContent = await readFile(recipePath, 'utf8');
        recipe = JSON.parse(recipeContent);
      } catch (error) {
        // Create new recipe structure
        const recipeId = exampleFile.replace('.tsx', '');
        recipe = {
          metadataSchemaVersion: '2.1.0-ai-context',
          audience: 'ai-systems-helping-consumer-developers',
          recipeId,
          recipeName: this.generateRecipeName(recipeId),
          category: 'form-pattern', // Default - should be manually set
          summary: 'Generated from example file',
          serviceContext: {
            useCases: ['To be defined'],
            governmentFlows: ['To be defined'],
            userType: 'citizen'
          },
          components: [],
          codeReference: {
            filePath: `src/examples/${exampleFile}`,
            lastModified: exampleStats.mtime.toISOString(),
            linesOfCode: exampleContent.split('\\n').length
          },
          implementation: {
            react: {
              dependencies: ['@abgov/react-components', 'react']
            }
          },
          codeExamples: {
            react: {
              complete: exampleContent
            }
          },
          tags: [],
          status: 'draft',
          lastUpdated: new Date().toISOString()
        };
      }

      // Update timestamps and code
      recipe.codeReference.lastModified = exampleStats.mtime.toISOString();
      recipe.codeReference.linesOfCode = exampleContent.split('\\n').length;
      recipe.lastUpdated = new Date().toISOString();
      
      // Extract components (basic implementation)
      if (!recipe.components || recipe.components.length === 0) {
        recipe.components = await this.extractComponentsFromExample(exampleContent);
      }

      // Write updated recipe
      await writeFile(recipePath, JSON.stringify(recipe, null, 2));
      
      return { success: true, message: 'Recipe updated successfully' };
    } catch (error) {
      return { success: false, message: `Failed to update recipe: ${error.message}` };
    }
  }

  generateRecipeName(recipeId) {
    return recipeId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async validateRecipe(recipeFile) {
    try {
      const recipePath = join(RECIPES_DIR, recipeFile);
      const recipeContent = await readFile(recipePath, 'utf8');
      const recipe = JSON.parse(recipeContent);
      
      // Basic validation - could be enhanced with JSON schema validation
      const requiredFields = ['recipeId', 'recipeName', 'category', 'summary'];
      const missingFields = requiredFields.filter(field => !recipe[field]);
      
      if (missingFields.length > 0) {
        return { valid: false, errors: [`Missing required fields: ${missingFields.join(', ')}`] };
      }

      return { valid: true, errors: [] };
    } catch (error) {
      return { valid: false, errors: [`Invalid JSON: ${error.message}`] };
    }
  }

  async sync() {
    console.log('🔄 Starting recipe sync...');
    
    await this.loadSchema();
    
    const exampleFiles = await this.findExampleFiles();
    const recipeFiles = await this.findRecipeFiles();
    
    console.log(`📁 Found ${exampleFiles.length} example files`);
    console.log(`📋 Found ${recipeFiles.length} recipe files`);
    
    // Check each example file for corresponding recipe
    for (const exampleFile of exampleFiles) {
      const recipeFile = exampleFile.replace('.tsx', '.json');
      const { needsSync, reason } = await this.checkFileModification(exampleFile, recipeFile);
      
      if (needsSync) {
        if (reason === 'Recipe file missing') {
          this.syncResults.missing.push({ exampleFile, recipeFile });
          console.log(`⚠️  ${recipeFile} missing - needs manual creation`);
        } else {
          console.log(`⚡ Syncing ${exampleFile} -> ${recipeFile} (${reason})`);
          
          const result = await this.updateRecipeFromExample(exampleFile, recipeFile);
          
          if (result.success) {
            this.syncResults.updated.push({ exampleFile, recipeFile });
            console.log(`✓ Updated ${recipeFile}`);
          } else {
            this.syncResults.errors.push({ exampleFile, recipeFile, error: result.message });
            console.log(`✗ Failed to update ${recipeFile}: ${result.message}`);
          }
        }
      } else {
        this.syncResults.upToDate.push({ exampleFile, recipeFile });
        console.log(`✓ ${recipeFile} is up to date`);
      }
    }

    // Validate all recipe files
    console.log('\\n🔍 Validating recipe files...');
    for (const recipeFile of recipeFiles) {
      const validation = await this.validateRecipe(recipeFile);
      if (!validation.valid) {
        console.log(`⚠️  ${recipeFile}: ${validation.errors.join(', ')}`);
      }
    }

    // Report results
    this.printSyncResults();
  }

  printSyncResults() {
    console.log('\\n📊 Sync Results:');
    console.log(`✓ Updated: ${this.syncResults.updated.length}`);
    console.log(`✓ Up to date: ${this.syncResults.upToDate.length}`);
    console.log(`⚠️  Missing recipes: ${this.syncResults.missing.length}`);
    console.log(`✗ Errors: ${this.syncResults.errors.length}`);
    
    if (this.syncResults.missing.length > 0) {
      console.log('\\n⚠️  Missing Recipe Files (need manual creation):');
      this.syncResults.missing.forEach(missing => {
        console.log(`  ${missing.exampleFile} -> ${missing.recipeFile}`);
      });
    }
    
    if (this.syncResults.errors.length > 0) {
      console.log('\\n❌ Errors:');
      this.syncResults.errors.forEach(error => {
        console.log(`  ${error.exampleFile} -> ${error.recipeFile}: ${error.error}`);
      });
    }
  }
}

// Run the sync
const sync = new RecipeSync();
sync.sync().catch(error => {
  console.error('💥 Sync failed:', error);
  process.exit(1);
});