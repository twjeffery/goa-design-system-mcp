import { OptimizedDataManager, SearchOptions } from "./optimized-data-manager.js";

// Helper function to safely get error messages
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export class OptimizedGoADesignSystemServer {
  private dataManager = new OptimizedDataManager();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      await this.dataManager.initialize();
      this.initialized = true;
      
      const stats = this.dataManager.getPerformanceStats();
      console.error("✅ Optimized GoA Design System server initialized");
      console.error(`🚀 Performance: ${stats.indexingTime.toFixed(2)}ms indexing, ${stats.memoryUsage.estimated} memory usage`);
      console.error(`📈 Optimization: ${stats.memoryUsage.comparison}`);
      
    } catch (error) {
      console.error("❌ Failed to initialize optimized server:", error);
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
        const systemSetup = this.dataManager.getItem("system-setup");
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

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
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
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("❌ Optimized search error:", error);
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
      console.error("❌ Component search error:", error);
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
      console.error("❌ Component details error:", error);
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
      const setupGuidance = this.dataManager.getItem("system-setup");

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
              setupGuidance: setupGuidance?.summary || "See system-setup.json for installation instructions",
              relatedSystemFiles: {
                layout: layoutGuidance ? "Available" : "Not loaded",
                setup: setupGuidance ? "Available" : "Not loaded",
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("❌ Usage patterns error:", error);
      throw new Error(`Usage patterns search failed: ${getErrorMessage(error)}`);
    }
  }

  // Preserved original feedback collection (no optimization needed)
  async collectFeedback(args: any) {
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
    console.error("📝 Feedback collected:", JSON.stringify(feedback, null, 2));

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