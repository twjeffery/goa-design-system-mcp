#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const recipesDir = './data/recipes';
const componentsDir = './data/components';

// Read all recipe files and extract component usage
console.log('🔍 Mapping recipes to components...\n');

const componentToRecipes = {};
const recipeDetails = {};

// Get all recipe files
const recipeFiles = readdirSync(recipesDir).filter(file => file.endsWith('.json'));

console.log(`Found ${recipeFiles.length} recipe files`);

// Process each recipe file
for (const file of recipeFiles) {
  try {
    const filePath = join(recipesDir, file);
    const recipeData = JSON.parse(readFileSync(filePath, 'utf8'));
    
    const recipeId = file.replace('.json', '');
    
    // Store recipe details
    recipeDetails[recipeId] = {
      id: recipeId,
      title: recipeData.title || recipeId,
      description: recipeData.description || '',
      category: recipeData.category || '',
      tags: recipeData.tags || [],
      difficulty: recipeData.difficulty || 'intermediate',
      userType: recipeData.government_service_context ? 
        (recipeData.government_service_context.citizen_flows?.applicable && 
         recipeData.government_service_context.worker_flows?.applicable ? 'both' :
         recipeData.government_service_context.citizen_flows?.applicable ? 'citizen' : 'worker')
        : 'both'
    };
    
    // Extract component names from the implementation code
    const components = new Set();
    
    // Check React code
    if (recipeData.implementation?.react?.code) {
      const reactCode = recipeData.implementation.react.code;
      const goabMatches = reactCode.match(/Goab[A-Z][a-zA-Z]+/g);
      if (goabMatches) {
        goabMatches.forEach(comp => components.add(comp));
      }
    }
    
    // Check Angular code
    if (recipeData.implementation?.angular?.code) {
      const angularCode = recipeData.implementation.angular.code;
      const goabMatches = angularCode.match(/goab-[a-z-]+/g);
      if (goabMatches) {
        goabMatches.forEach(comp => {
          // Convert goab-button to GoabButton
          const componentName = 'Goab' + comp.replace('goab-', '').split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
          components.add(componentName);
        });
      }
    }
    
    // Check component analysis section
    if (recipeData.component_analysis?.primary_components) {
      recipeData.component_analysis.primary_components.forEach(comp => {
        if (comp.name && comp.name.startsWith('Goab')) {
          components.add(comp.name);
        }
      });
    }
    
    // Map each component to this recipe
    components.forEach(component => {
      const componentKey = component.toLowerCase().replace('goab', '');
      
      if (!componentToRecipes[componentKey]) {
        componentToRecipes[componentKey] = [];
      }
      
      componentToRecipes[componentKey].push(recipeId);
    });
    
    console.log(`✅ ${recipeId}: Found ${components.size} components`);
    
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

// Sort results and create final mapping
const sortedComponents = Object.keys(componentToRecipes).sort();

console.log('\n📊 Component to Recipe Mapping:');
console.log('================================');

sortedComponents.forEach(component => {
  console.log(`\n${component}:`);
  componentToRecipes[component].forEach(recipeId => {
    const recipe = recipeDetails[recipeId];
    console.log(`  - ${recipeId} (${recipe.title})`);
  });
});

// Save the mapping for use in component updates
const mapping = {
  componentToRecipes,
  recipeDetails,
  generatedAt: new Date().toISOString()
};

writeFileSync('./scripts/component-recipe-mapping.json', JSON.stringify(mapping, null, 2));

console.log('\n✅ Mapping saved to ./scripts/component-recipe-mapping.json');
console.log(`\n📈 Summary:`);
console.log(`- ${Object.keys(recipeDetails).length} recipes processed`);
console.log(`- ${sortedComponents.length} components mapped`);
console.log(`- Average ${Math.round(Object.values(componentToRecipes).reduce((sum, recipes) => sum + recipes.length, 0) / sortedComponents.length)} recipes per component`);