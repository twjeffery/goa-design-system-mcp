import { OptimizedDataManager, SearchOptions } from "./optimized-data-manager.js";

// Helper function to safely get error messages
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

// Helper interfaces for component extraction
interface ComponentSummary {
  name: string;
  description: string;
  importPath: string;
  keyProps: string[];
  usage: string;
}

interface ComponentExtractionResult {
  components: ComponentSummary[];
  formattedSummary: string;
}

export class OptimizedGoADesignSystemServer {
  private dataManager = new OptimizedDataManager();
  private initialized = false;

  // Helper function to extract GoA components from code or design descriptions
  private extractGoAComponents(text: string): string[] {
    const componentPatterns = [
      /Goa[A-Z][a-zA-Z]*/g,          // GoaFormItem, GoaInput, etc.
      /goa-[a-z-]+/g,                // goa-form-item, goa-input, etc.
      /@abgov\/.*components/g        // @abgov/react-components imports
    ];
    
    const foundComponents = new Set<string>();
    
    for (const pattern of componentPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Normalize component names
          if (match.startsWith('Goa')) {
            foundComponents.add(match);
          } else if (match.startsWith('goa-')) {
            // Convert kebab-case to PascalCase
            const pascalCase = 'Goa' + match.slice(4).split('-').map(part => 
              part.charAt(0).toUpperCase() + part.slice(1)
            ).join('');
            foundComponents.add(pascalCase);
          }
        });
      }
    }
    
    return Array.from(foundComponents);
  }

  // Helper function to get component description and usage info
  private getComponentDescription(componentName: string): ComponentSummary | null {
    // Try to find component data using optimized data manager
    const componentKey = componentName.toLowerCase().replace('goa', '');
    let componentData = this.dataManager.getItem(componentKey);
    
    // Try alternative lookups
    if (!componentData) {
      const variations = [
        componentName.toLowerCase(),
        componentName.replace(/([A-Z])/g, "-$1").toLowerCase().slice(1),
        componentName.replace('Goa', '').toLowerCase()
      ];
      
      for (const variation of variations) {
        componentData = this.dataManager.getItem(variation);
        if (componentData) break;
      }
    }
    
    if (!componentData) {
      // Return basic info for unknown components
      return {
        name: componentName,
        description: "GoA Design System component",
        importPath: `import { ${componentName} } from '@abgov/react-components'`,
        keyProps: [],
        usage: "Refer to GoA Design System documentation for usage details"
      };
    }
    
    // Extract key information from component data
    const keyProps = [];
    if (componentData.playgroundExamples?.basic?.interactiveProps) {
      keyProps.push(...componentData.playgroundExamples.basic.interactiveProps
        .slice(0, 4) // Limit to top 4 props
        .map((prop: any) => prop.name));
    }
    
    const usage = componentData.summary || 
                 componentData.commonUse?.[0] || 
                 componentData.criticalImplementationNotes?.quickDecisionMatrix ||
                 "Standard GoA component usage";
    
    return {
      name: componentName,
      description: componentData.summary || `${componentName} component from GoA Design System`,
      importPath: `import { ${componentName} } from '@abgov/react-components'`,
      keyProps,
      usage: typeof usage === 'string' ? usage : JSON.stringify(usage, null, 2)
    };
  }

  // Helper function to extract and describe all components in text
  private extractAndDescribeComponents(text: string, designContent?: string): ComponentExtractionResult {
    const allText = `${text} ${designContent || ''}`;
    const componentNames = this.extractGoAComponents(allText);
    
    const components = componentNames
      .map(name => this.getComponentDescription(name))
      .filter(comp => comp !== null) as ComponentSummary[];
    
    if (components.length === 0) {
      return {
        components: [],
        formattedSummary: ""
      };
    }
    
    const formattedSummary = `\n\n## GoA Components Used\n\n` +
      components.map(comp => {
        const propsText = comp.keyProps.length > 0 
          ? `\n  - **Key props**: \`${comp.keyProps.join('`, `')}\``
          : '';
        
        return `- **${comp.name}**: ${comp.description}\n` +
               `  - **Import**: \`${comp.importPath}\`${propsText}\n` +
               `  - **Usage**: ${comp.usage}`;
      }).join('\n\n');
    
    return {
      components,
      formattedSummary
    };
  }

  // Helper function to enhance response with component information
  private enhanceResponseWithComponents(response: string, code?: string, design?: string): string {
    const componentInfo = this.extractAndDescribeComponents(code || '', design);
    
    if (componentInfo.components.length > 0) {
      return response + componentInfo.formattedSummary;
    }
    
    return response;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await this.dataManager.initialize();
      this.initialized = true;
      
      const stats = this.dataManager.getPerformanceStats();
      // Log to stderr for debugging (not JSON output)
      process.stderr.write(`Optimized GoA Design System server initialized\n`);
      process.stderr.write(`Performance: ${stats.indexingTime.toFixed(2)}ms indexing, ${stats.memoryUsage.estimated} memory usage\n`);
      process.stderr.write(`Optimization: ${stats.memoryUsage.comparison}\n`);
      
    } catch (error) {
      process.stderr.write(`Failed to initialize optimized server: ${error}\n`);
      throw error;
    }
  }

  // UPDATED: Enhanced project_knowledge_search with inverted index
  async projectKnowledgeSearch(args: any) {
    const { query, max_text_results = 8, max_image_results = 2 } = args;
    const queryLower = query.toLowerCase();

    // Enhanced detection for build/code requests (preserved from original)
    const buildKeywords = [
      "build", "create", "make", "generate", "code", "implement", 
      "develop", "convert", "design", "page", "component", "build this"
    ];

    const frameworkKeywords = ["react", "angular"];
    const isBuildRequest = buildKeywords.some(keyword => queryLower.includes(keyword));
    const hasFramework = frameworkKeywords.some(keyword => queryLower.includes(keyword));

    // Enhanced Figma/design conversion detection (preserved from original)
    const figmaKeywords = [
      "figma", "design", "convert", "build this", "build in", "react", "angular",
      "prototype", "mockup", "wireframe", "turn this into", "code this design",
      "build this page", "create this", "make this", "implement this"
    ];
    const isFigmaQuery = figmaKeywords.some(keyword => queryLower.includes(keyword));

    try {
      // Use optimized search for fast results
      const searchResults = await this.dataManager.search(query, { 
        maxResults: max_text_results 
      });

      // Maintain original business logic for GoA priorities
      const prioritizedResults = [];

      // If this is ANY build request, ALWAYS include system setup with mandatory principles
      if (isBuildRequest || hasFramework) {
        const systemSetup = this.dataManager.getItem("mandatory-ai-principles");
        if (systemSetup) {
          prioritizedResults.push({
            type: "system",
            name: "mandatory-principles",
            content: systemSetup,
            score: 150, // HIGHEST priority - mandatory principles
            reason: "Mandatory GoA development principles for all build requests",
            matchTypes: ["mandatory"]
          });
        }
      }

      // If it's a Figma query, prioritize workflow documentation
      if (isFigmaQuery) {
        const workflowResults = await this.dataManager.search(query, { 
          type: 'workflow', 
          maxResults: 3 
        });
        
        workflowResults.forEach(result => {
          prioritizedResults.push({
            ...result,
            score: result.score + 120, // Very high priority for workflow matches
            reason: "Figma conversion workflow detected"
          });
        });
      }

      // Add the search results from optimized search
      prioritizedResults.push(...searchResults.map(result => ({
        type: result.type,
        name: result.name,
        content: result.content,
        score: result.score,
        reason: result.reason,
        matchTypes: result.matchTypes
      })));

      // Sort by score and limit results
      const sortedResults = prioritizedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, max_text_results);

      // Get performance stats
      const performanceStats = this.dataManager.getPerformanceStats();

      // Enhance response with component information if it's a build request
      const baseResponse = JSON.stringify({
        query,
        resultsCount: sortedResults.length,
        performance: {
          searchTime: `${performanceStats.averageSearchTime.toFixed(2)}ms average`,
          totalSearches: performanceStats.totalSearches,
          memoryUsage: performanceStats.memoryUsage.estimated,
          optimization: performanceStats.memoryUsage.comparison
        },
        searchMetadata: {
          figmaWorkflowDetected: isFigmaQuery,
          buildRequestDetected: isBuildRequest,
          indexStats: performanceStats.indexStats
        },
        results: sortedResults.map(result => ({
          type: result.type,
          name: result.name,
          score: result.score,
          reason: result.reason,
          matchTypes: result.matchTypes,
          summary: result.content.summary || 
                  result.content.methodologyName || 
                  "No summary available",
          // Include full content for workflows and mandatory principles
          ...(result.type === "workflow" || result.name === "mandatory-principles"
            ? { fullContent: result.content }
            : {}),
          ...(result.type === "component"
            ? {
                category: result.content.category,
                tags: result.content.tags,
                commonUse: result.content.commonUse,
              }
            : {}),
          ...(result.type === "system"
            ? {
                purpose: result.content.purpose,
              }
            : {})
        })),
        searchTip: sortedResults.length === 0
          ? `No matches found for "${query}". Try terms like "form", "layout", "button", "figma", or "design conversion".`
          : undefined,
      }, null, 2);

      // Add component information for build/design requests
      const enhancedResponse = (isBuildRequest || isFigmaQuery) 
        ? this.enhanceResponseWithComponents(baseResponse, query)
        : baseResponse;

      return {
        content: [
          {
            type: "text",
            text: enhancedResponse,
          },
        ],
      };
    } catch (error) {
      process.stderr.write(`Optimized search error: ${error}\n`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Search failed",
              message: getErrorMessage(error),
              fallback: "Try a simpler search term"
            }, null, 2)
          }
        ]
      };
    }
  }

  // UPDATED: Optimized component search
  async searchComponents(args: any) {
    const { query, category, tags, limit = 10 } = args;

    try {
      const searchOptions: SearchOptions = {
        maxResults: limit,
        type: 'component'
      };

      if (category) {
        searchOptions.category = category;
      }

      if (tags && tags.length > 0) {
        searchOptions.tags = tags;
      }

      const results = await this.dataManager.search(query, searchOptions);
      const performanceStats = this.dataManager.getPerformanceStats();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              query,
              resultsCount: results.length,
              performance: {
                searchTime: `${performanceStats.averageSearchTime.toFixed(2)}ms average`,
                totalSearches: performanceStats.totalSearches
              },
              results: results.map(result => ({
                name: result.name,
                score: result.score,
                summary: result.content.summary,
                category: result.content.category,
                tags: result.content.tags,
                status: result.content.status,
                commonUse: result.content.commonUse || result.content.designGuidance?.when?.[0],
                reason: result.reason,
                matchTypes: result.matchTypes
              })),
              searchTip: results.length === 0
                ? `No components found for "${query}". Try broader terms like "form", "layout", "button", or "navigation".`
                : undefined,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      process.stderr.write(`Component search error: ${error}\n`);
      throw new Error(`Component search failed: ${getErrorMessage(error)}`);
    }
  }

  // UPDATED: Optimized component details with fast lookup
  async getComponentDetails(args: any) {
    const { componentName, framework } = args;

    try {
      // Fast O(1) lookup by ID
      let component = this.dataManager.getItem(componentName.toLowerCase());
      
      // Try alternative lookups if not found (preserved original logic)
      if (!component) {
        const variations = [
          componentName.toLowerCase(),
          componentName.replace(/[-_]/g, ""),
          componentName.replace(/([A-Z])/g, "-$1").toLowerCase().slice(1),
        ];

        for (const variation of variations) {
          // Search for similar names using optimized search
          const searchResults = await this.dataManager.search(variation, { 
            type: 'component', 
            maxResults: 5 
          });
          
          // Find exact matches in search results
          const exactMatch = searchResults.find(result => 
            result.name.toLowerCase() === variation ||
            result.name.replace(/[-_]/g, "").toLowerCase() === variation
          );
          
          if (exactMatch) {
            component = exactMatch.content;
            break;
          }
        }
      }

      if (!component) {
        // Provide helpful suggestions using optimized search
        const suggestions = await this.dataManager.search(
          componentName.toLowerCase().slice(0, 3), 
          { type: 'component', maxResults: 5 }
        );

        throw new Error(
          `Component '${componentName}' not found. ` +
          (suggestions.length > 0
            ? `Did you mean: ${suggestions.map(s => s.name).join(", ")}?`
            : "Use search_components to find available components.")
        );
      }

      // If framework is specified, focus on that framework's examples (preserved original logic)
      let focusedComponent = { ...component };
      if (framework && component.installation?.[framework]) {
        focusedComponent.focusedFramework = framework;
        focusedComponent.focusedExamples = component.installation[framework];
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(focusedComponent, null, 2),
          },
        ],
      };
    } catch (error) {
      process.stderr.write(`Component details error: ${error}\n`);
      throw error;
    }
  }

  // UPDATED: Optimized usage patterns search
  async getUsagePatterns(args: any) {
    const { scenario, components } = args;

    try {
      // Search for patterns in system documentation
      const systemResults = await this.dataManager.search(scenario, { 
        type: 'system', 
        maxResults: 3 
      });

      // Search for matching components if specified
      let componentResults = [];
      if (components && components.length > 0) {
        for (const comp of components) {
          const compResults = await this.dataManager.search(comp, { 
            type: 'component', 
            maxResults: 2 
          });
          componentResults.push(...compResults);
        }
      }

      // Get layout and setup guidance
      const layoutGuidance = this.dataManager.getItem("layout");
      const setupGuidance = this.dataManager.getItem("installation-guide");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              scenario,
              systemMatches: systemResults.map(result => ({
                name: result.name,
                score: result.score,
                reason: result.reason,
                content: result.content
              })),
              componentMatches: componentResults.map(result => ({
                name: result.name,
                score: result.score,
                summary: result.content.summary,
                commonUse: result.content.commonUse
              })),
              layoutGuidance: layoutGuidance?.summary || "See layout.json for page structure guidance",
              setupGuidance: setupGuidance?.summary || "See installation-guide.json for installation instructions",
              relatedSystemFiles: {
                layout: layoutGuidance ? "Available" : "Not loaded",
                setup: setupGuidance ? "Available" : "Not loaded",
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      process.stderr.write(`Usage patterns error: ${error}\n`);
      throw new Error(`Usage patterns search failed: ${getErrorMessage(error)}`);
    }
  }

  // Preserved original feedback collection (no optimization needed)
  async giveFeedback(args: any) {
    const { componentName, feedbackType, description, userTeam } = args;

    // Generate feedback record
    const feedback = {
      timestamp: new Date().toISOString(),
      componentName,
      feedbackType,
      description,
      userTeam: userTeam || "Unknown",
      id: Math.random().toString(36).substr(2, 9),
      serverInfo: {
        optimizedServer: true,
        componentExists: this.dataManager.getItem(componentName.toLowerCase()) !== null,
        performanceStats: this.dataManager.getPerformanceStats()
      },
    };

    // Log feedback (in production, this would go to a database/file)
    process.stderr.write(`Feedback collected: ${JSON.stringify(feedback, null, 2)}\n`);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: "Feedback collected successfully! Thank you for helping improve the GoA Design System.",
            feedbackId: feedback.id,
            nextSteps: "The design system team will review your feedback and may reach out for clarification.",
            component: feedback.serverInfo.componentExists
              ? `Component '${componentName}' found in optimized system`
              : `Component '${componentName}' not found - this feedback will help us identify gaps`,
          }, null, 2),
        },
      ],
    };
  }
}