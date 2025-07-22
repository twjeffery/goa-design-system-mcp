#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Read the component-recipe mapping
const mapping = JSON.parse(readFileSync('./scripts/component-recipe-mapping.json', 'utf8'));
const { componentToRecipes, recipeDetails } = mapping;

const componentsDir = './data/components';
const componentFiles = readdirSync(componentsDir).filter(file => file.endsWith('.json'));

console.log('🔄 Updating component files with recipe references...\n');

let updatedCount = 0;

for (const file of componentFiles) {
  try {
    const filePath = join(componentsDir, file);
    const componentData = JSON.parse(readFileSync(filePath, 'utf8'));
    
    // Extract component name from filename (remove _consumer.json)
    const componentName = file.replace('_consumer.json', '').replace('.json', '');
    
    // Check if this component has any recipes
    const relevantRecipes = componentToRecipes[componentName] || [];
    
    if (relevantRecipes.length > 0) {
      console.log(`📝 Updating ${componentName}: Found ${relevantRecipes.length} relevant recipes`);
      
      // Create the examples section
      const examplesSection = {
        relatedRecipes: relevantRecipes.map(recipeId => {
          const recipe = recipeDetails[recipeId];
          return {
            id: recipeId,
            title: recipe.title,
            description: recipe.description,
            useCase: `${recipe.category} pattern for ${recipe.userType} workflows`,
            difficulty: recipe.difficulty,
            tags: recipe.tags.slice(0, 3), // Keep only first 3 tags
            category: recipe.category
          };
        }).sort((a, b) => {
          // Sort by difficulty: beginner, intermediate, advanced
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        }),
        quickReference: {
          basicUsage: "See playgroundExamples for component API usage",
          advancedPatterns: `See relatedRecipes for ${componentName} in realistic scenarios`
        }
      };
      
      // Add the examples section to the component
      componentData.examples = examplesSection;
      
      // Write back to file
      writeFileSync(filePath, JSON.stringify(componentData, null, 2));
      
      updatedCount++;
      
      // Log details
      relevantRecipes.forEach(recipeId => {
        const recipe = recipeDetails[recipeId];
        console.log(`  - ${recipeId}: ${recipe.title} (${recipe.difficulty})`);
      });
      
    } else {
      console.log(`⚪ ${componentName}: No recipes found`);
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${file}:`, error.message);
  }
}

console.log(`\n✅ Update complete!`);
console.log(`📊 Summary:`);
console.log(`- ${componentFiles.length} component files processed`);
console.log(`- ${updatedCount} components updated with recipe references`);
console.log(`- ${componentFiles.length - updatedCount} components had no related recipes`);

// Create a summary report
const summaryReport = {
  totalComponents: componentFiles.length,
  updatedComponents: updatedCount,
  componentsWithRecipes: Object.keys(componentToRecipes).length,
  totalRecipes: Object.keys(recipeDetails).length,
  averageRecipesPerComponent: Math.round(
    Object.values(componentToRecipes).reduce((sum, recipes) => sum + recipes.length, 0) / 
    Object.keys(componentToRecipes).length
  ),
  updatedAt: new Date().toISOString()
};

writeFileSync('./scripts/component-update-summary.json', JSON.stringify(summaryReport, null, 2));
console.log(`\n📄 Summary report saved to ./scripts/component-update-summary.json`);