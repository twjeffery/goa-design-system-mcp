#!/usr/bin/env node

/**
 * Recipe Query Test Script
 * 
 * Tests the context server's ability to query and search recipes
 * - Tests recipe indexing
 * - Tests search functionality
 * - Tests filtering by user type and category
 * - Validates recipe data structure
 */

import { OptimizedDataManager } from '../build/optimized-data-manager.js';

async function testRecipeQueries() {
  console.log('🧪 Testing Recipe Queries...\n');
  
  // Initialize the data manager
  const dataManager = new OptimizedDataManager();
  
  try {
    await dataManager.initialize();
    console.log('✓ Data manager initialized\n');
  } catch (error) {
    console.error('✗ Failed to initialize data manager:', error.message);
    process.exit(1);
  }

  // Test 1: Get all recipes
  console.log('📋 Test 1: Get all recipes');
  try {
    const allRecipes = dataManager.getItemsByType('recipe');
    console.log(`✓ Found ${allRecipes.length} recipes`);
    
    allRecipes.forEach(recipe => {
      console.log(`  - ${recipe.recipeName} (${recipe.category})`);
    });
    console.log();
  } catch (error) {
    console.error('✗ Failed to get recipes:', error.message);
  }

  // Test 2: Search for specific recipes
  console.log('🔍 Test 2: Search for recipes');
  const searchQueries = [
    'birthday',
    'layout',
    'destructive',
    'form',
    'citizen',
    'worker'
  ];

  for (const query of searchQueries) {
    try {
      const results = await dataManager.search(query, { type: 'recipe', maxResults: 5 });
      console.log(`✓ Search "${query}": ${results.length} results`);
      
      results.forEach(result => {
        console.log(`  - ${result.content.recipeName} (score: ${result.score})`);
      });
    } catch (error) {
      console.error(`✗ Search "${query}" failed:`, error.message);
    }
  }
  console.log();

  // Test 3: Filter by user type
  console.log('👥 Test 3: Filter by user type');
  try {
    const citizenRecipes = dataManager.getRecipesByUserType('citizen');
    const workerRecipes = dataManager.getRecipesByUserType('worker');
    const bothRecipes = dataManager.getRecipesByUserType('both');
    
    console.log(`✓ Citizen recipes: ${citizenRecipes.length}`);
    citizenRecipes.forEach(recipe => {
      console.log(`  - ${recipe.recipeName}`);
    });
    
    console.log(`✓ Worker recipes: ${workerRecipes.length}`);
    workerRecipes.forEach(recipe => {
      console.log(`  - ${recipe.recipeName}`);
    });
    
    console.log(`✓ Both user types: ${bothRecipes.length}`);
    bothRecipes.forEach(recipe => {
      console.log(`  - ${recipe.recipeName}`);
    });
    console.log();
  } catch (error) {
    console.error('✗ Failed to filter by user type:', error.message);
  }

  // Test 4: Filter by category
  console.log('📂 Test 4: Filter by category');
  try {
    const categories = ['form-pattern', 'layout-pattern', 'interaction-pattern'];
    
    for (const category of categories) {
      const recipes = dataManager.getRecipesByCategory(category);
      console.log(`✓ ${category}: ${recipes.length} recipes`);
      
      recipes.forEach(recipe => {
        console.log(`  - ${recipe.recipeName}`);
      });
    }
    console.log();
  } catch (error) {
    console.error('✗ Failed to filter by category:', error.message);
  }

  // Test 5: Find recipes using specific components
  console.log('🧩 Test 5: Find recipes using components');
  try {
    const components = ['GoabFormItem', 'GoabButton', 'GoabModal', 'GoabInput'];
    
    for (const component of components) {
      const recipes = dataManager.getRecipesUsingComponent(component);
      console.log(`✓ Recipes using ${component}: ${recipes.length}`);
      
      recipes.forEach(recipe => {
        console.log(`  - ${recipe.recipeName}`);
      });
    }
    console.log();
  } catch (error) {
    console.error('✗ Failed to find recipes by component:', error.message);
  }

  // Test 6: Validate recipe data structure
  console.log('🔍 Test 6: Validate recipe data structure');
  try {
    const allRecipes = dataManager.getItemsByType('recipe');
    let validRecipes = 0;
    let invalidRecipes = 0;
    
    const requiredFields = [
      'recipeId', 'recipeName', 'category', 'summary',
      'serviceContext', 'components', 'codeReference',
      'implementation', 'codeExamples'
    ];
    
    allRecipes.forEach(recipe => {
      const missingFields = requiredFields.filter(field => !recipe[field]);
      
      if (missingFields.length === 0) {
        validRecipes++;
        console.log(`✓ ${recipe.recipeName}: Valid`);
      } else {
        invalidRecipes++;
        console.log(`✗ ${recipe.recipeName}: Missing ${missingFields.join(', ')}`);
      }
    });
    
    console.log(`\n📊 Validation Summary:`);
    console.log(`✓ Valid recipes: ${validRecipes}`);
    console.log(`✗ Invalid recipes: ${invalidRecipes}`);
    
  } catch (error) {
    console.error('✗ Failed to validate recipes:', error.message);
  }

  // Test 7: Performance stats
  console.log('\n⚡ Performance Stats');
  try {
    const stats = dataManager.getPerformanceStats();
    console.log(`✓ Total indexed items: ${stats.indexStats.totalItems}`);
    console.log(`✓ Total search terms: ${stats.indexStats.totalTerms}`);
    console.log(`✓ Average terms per item: ${stats.indexStats.averageTermsPerItem.toFixed(1)}`);
    console.log(`✓ Indexing time: ${stats.indexingTime.toFixed(2)}ms`);
    console.log(`✓ Memory usage: ${stats.memoryUsage.estimated}`);
  } catch (error) {
    console.error('✗ Failed to get performance stats:', error.message);
  }

  console.log('\n🎉 Recipe query tests completed!');
}

// Run the tests
testRecipeQueries().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});