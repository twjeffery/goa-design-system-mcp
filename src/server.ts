import { readFile, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper function to safely get error messages
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export class GoADesignSystemServer {
  private components: Map<string, any> = new Map();
  private systemFiles: Map<string, any> = new Map();
  private workflows: Map<string, any> = new Map(); // NEW: Add workflows storage
  private masterIndex: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      await this.loadAllData();
      this.initialized = true;
      console.error("✅ GoA Design System data loaded successfully");
      console.error(
        `📊 Loaded ${this.components.size} components, ${this.systemFiles.size} system files, and ${this.workflows.size} workflows`
      );
    } catch (error) {
      console.error("❌ Failed to load component data:", error);
      throw error;
    }
  }

  private async loadAllData() {
    const dataDir = join(__dirname, "../data");
    const docsDir = join(__dirname, "../docs"); // NEW: Add docs directory

    // Load master index
    try {
      const indexPath = join(dataDir, "index.json");
      const indexData = await readFile(indexPath, "utf8");
      this.masterIndex = JSON.parse(indexData);
      console.error("📋 Master index loaded");
    } catch (error) {
      console.error("⚠️  Master index not found or invalid");
    }

    // Load system files (layout.json, system-setup.json, etc.)
    const systemFiles = ["layout.json", "system-setup.json"];
    for (const fileName of systemFiles) {
      try {
        const filePath = join(dataDir, fileName);
        const fileData = await readFile(filePath, "utf8");
        const parsed = JSON.parse(fileData);
        this.systemFiles.set(fileName.replace(".json", ""), parsed);
        console.error(`📄 Loaded ${fileName}`);
      } catch (error) {
        console.error(
          `⚠️  Could not load ${fileName}:`,
          getErrorMessage(error)
        );
      }
    }

    // NEW: Load workflow files from docs directory
    try {
      const files = await readdir(docsDir);

      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const filePath = join(docsDir, file);
            const data = await readFile(filePath, "utf8");
            const workflowData = JSON.parse(data);

            const workflowName = file.replace(".json", "");
            this.workflows.set(workflowName, workflowData);
            console.error(`📄 Loaded workflow: ${file}`);
          } catch (error) {
            console.error(
              `⚠️  Could not load workflow file ${file}:`,
              getErrorMessage(error)
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "⚠️  Could not read docs directory:",
        getErrorMessage(error)
      );
    }

    // Load all component files from components subdirectory
    try {
      const componentsDir = join(dataDir, "components");
      const files = await readdir(componentsDir);

      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const filePath = join(componentsDir, file);
            const data = await readFile(filePath, "utf8");
            const componentData = JSON.parse(data);

            // Use the componentName from the JSON, or derive from filename
            const componentName =
              componentData.componentName ||
              file.replace("_consumer.json", "").replace(".json", "");

            this.components.set(componentName, componentData);
          } catch (error) {
            console.error(
              `⚠️  Could not load component file ${file}:`,
              getErrorMessage(error)
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "⚠️  Could not read components directory:",
        getErrorMessage(error)
      );
    }
  }

  // UPDATED: Enhanced project_knowledge_search function
  async projectKnowledgeSearch(args: any) {
    const { query, max_text_results = 8, max_image_results = 2 } = args;
    const results = [];
    const queryLower = query.toLowerCase();

    // Enhanced detection for build/code requests
    const buildKeywords = [
      "build",
      "create",
      "make",
      "generate",
      "code",
      "implement",
      "develop",
      "convert",
      "design",
      "page",
      "component",
      "build this",
    ];

    const frameworkKeywords = ["react", "angular"];

    const isBuildRequest = buildKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );

    const hasFramework = frameworkKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );

    // If this is ANY build request, ALWAYS include system setup with mandatory principles
    if (isBuildRequest || hasFramework) {
      const systemSetup = this.systemFiles.get("system-setup");
      if (systemSetup) {
        results.push({
          type: "system",
          name: "mandatory-principles",
          content: systemSetup,
          score: 150, // HIGHEST priority - mandatory principles
          reason: "Mandatory GoA development principles for all build requests",
        });
      }
    }

    // Enhanced Figma/design conversion detection
    const figmaKeywords = [
      "figma",
      "design",
      "convert",
      "build this",
      "build in",
      "react",
      "angular",
      "prototype",
      "mockup",
      "wireframe",
      "turn this into",
      "code this design",
      "build this page",
      "create this",
      "make this",
      "implement this",
    ];

    const isFigmaQuery = figmaKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );

    // If it's a Figma query, prioritize workflow documentation
    if (isFigmaQuery) {
      for (const [name, workflow] of this.workflows) {
        // More flexible trigger matching
        if (
          workflow.triggers?.some((trigger: string) =>
            queryLower.includes(trigger.toLowerCase())
          ) ||
          // Also match if it's clearly a build request with framework
          (isBuildRequest && hasFramework)
        ) {
          results.push({
            type: "workflow",
            name,
            content: workflow,
            score: 120, // Very high priority for workflow matches
            reason: "Figma conversion workflow detected",
          });
        }
      }
    }

    // Search through components
    for (const [name, component] of this.components) {
      let score = 0;

      // Search in component name
      if (name.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Search in summary
      if (component.summary?.toLowerCase().includes(queryLower)) {
        score += 8;
      }

      // Search in tags
      if (
        component.tags?.some((tag: string) =>
          tag.toLowerCase().includes(queryLower)
        )
      ) {
        score += 6;
      }

      // Search in AI tags
      if (
        component.aiTags?.some((tag: string) =>
          tag.toLowerCase().includes(queryLower)
        )
      ) {
        score += 5;
      }

      // Search in description and purpose
      if (
        component.description?.toLowerCase().includes(queryLower) ||
        component.purpose?.toLowerCase().includes(queryLower)
      ) {
        score += 4;
      }

      // Search in usage examples and installation
      if (component.installation) {
        const installationText = JSON.stringify(
          component.installation
        ).toLowerCase();
        if (installationText.includes(queryLower)) {
          score += 3;
        }
      }

      if (score > 0) {
        results.push({
          type: "component",
          name,
          content: component,
          score,
          reason: "Component match",
        });
      }
    }

    // Search through system files
    for (const [name, systemFile] of this.systemFiles) {
      let score = 0;

      if (
        name.toLowerCase().includes(queryLower) ||
        systemFile.summary?.toLowerCase().includes(queryLower) ||
        systemFile.purpose?.toLowerCase().includes(queryLower)
      ) {
        score += 7;
      }

      // Search in system file content
      const systemContent = JSON.stringify(systemFile).toLowerCase();
      if (systemContent.includes(queryLower)) {
        score += 3;
      }

      if (score > 0) {
        results.push({
          type: "system",
          name,
          content: systemFile,
          score,
          reason: "System file match",
        });
      }
    }

    // Search through workflows (if not already included from Figma detection)
    if (!isFigmaQuery) {
      for (const [name, workflow] of this.workflows) {
        let score = 0;

        if (
          name.toLowerCase().includes(queryLower) ||
          workflow.summary?.toLowerCase().includes(queryLower) ||
          workflow.methodologyName?.toLowerCase().includes(queryLower)
        ) {
          score += 6;
        }

        // Search in workflow triggers and keywords
        if (
          workflow.triggers?.some((trigger: string) =>
            trigger.toLowerCase().includes(queryLower)
          )
        ) {
          score += 8;
        }

        if (score > 0) {
          results.push({
            type: "workflow",
            name,
            content: workflow,
            score,
            reason: "Workflow match",
          });
        }
      }
    }

    // Sort by score and limit results
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, max_text_results);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query,
              resultsCount: sortedResults.length,
              totalSearched: {
                components: this.components.size,
                systemFiles: this.systemFiles.size,
                workflows: this.workflows.size,
              },
              figmaWorkflowDetected: isFigmaQuery,
              buildRequestDetected: isBuildRequest,
              results: sortedResults.map((result) => ({
                type: result.type,
                name: result.name,
                score: result.score,
                reason: result.reason,
                summary:
                  result.content.summary ||
                  result.content.methodologyName ||
                  "No summary available",
                // Include full content for workflows and mandatory principles
                ...(result.type === "workflow" ||
                result.name === "mandatory-principles"
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
                  : {}),
              })),
              searchTip:
                sortedResults.length === 0
                  ? `No matches found for "${query}". Try terms like "form", "layout", "button", "figma", or "design conversion".`
                  : undefined,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async searchComponents(args: any) {
    const { query, category, tags, limit = 10 } = args;
    const results = [];

    // Search through all components
    for (const [name, component] of this.components) {
      let score = 0;

      // Search in component name
      if (name.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }

      // Search in summary
      if (component.summary?.toLowerCase().includes(query.toLowerCase())) {
        score += 8;
      }

      // Search in tags
      if (
        component.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
      ) {
        score += 6;
      }

      // Search in description
      if (component.description?.toLowerCase().includes(query.toLowerCase())) {
        score += 4;
      }

      // Search in usage patterns and examples
      if (component.installation) {
        const installationText = JSON.stringify(
          component.installation
        ).toLowerCase();
        if (installationText.includes(query.toLowerCase())) {
          score += 3;
        }
      }

      // Filter by category
      if (category && component.category !== category) {
        score = 0;
      }

      // Filter by tags
      if (tags && tags.length > 0) {
        if (!component.tags?.some((tag: string) => tags.includes(tag))) {
          score = 0;
        }
      }

      if (score > 0) {
        results.push({
          name,
          score,
          summary: component.summary,
          category: component.category,
          tags: component.tags,
          status: component.status,
          commonUse: component.commonUse || component.designGuidance?.when?.[0],
        });
      }
    }

    // Sort by score and limit results
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query,
              resultsCount: sortedResults.length,
              totalComponents: this.components.size,
              results: sortedResults,
              searchTip:
                sortedResults.length === 0
                  ? `No components found for "${query}". Try broader terms like "form", "layout", "button", or "navigation".`
                  : undefined,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async getComponentDetails(args: any) {
    const { componentName, framework } = args;
    let component = this.components.get(componentName);

    // Try alternative lookups if not found
    if (!component) {
      // Try with different naming variations
      const variations = [
        componentName.toLowerCase(),
        componentName.replace(/[-_]/g, ""),
        componentName
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()
          .slice(1),
      ];

      for (const variation of variations) {
        for (const [key, comp] of this.components) {
          if (
            key.toLowerCase() === variation ||
            key.replace(/[-_]/g, "").toLowerCase() === variation
          ) {
            component = comp;
            break;
          }
        }
        if (component) break;
      }
    }

    if (!component) {
      // Provide helpful suggestions
      const suggestions = Array.from(this.components.keys())
        .filter((name) =>
          name.toLowerCase().includes(componentName.toLowerCase().slice(0, 3))
        )
        .slice(0, 5);

      throw new Error(
        `Component '${componentName}' not found. ` +
          (suggestions.length > 0
            ? `Did you mean: ${suggestions.join(", ")}?`
            : "Use search_components to find available components.")
      );
    }

    // If framework is specified, focus on that framework's examples
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
  }

  async getUsagePatterns(args: any) {
    const { scenario, components } = args;

    // Look for patterns in the master index
    const patterns =
      this.masterIndex?.usagePatterns?.["common-combinations"] || [];

    const matchingPatterns = patterns.filter((pattern: any) => {
      // Search by scenario description
      if (
        pattern.description?.toLowerCase().includes(scenario.toLowerCase()) ||
        pattern.useCase?.toLowerCase().includes(scenario.toLowerCase()) ||
        pattern.name?.toLowerCase().includes(scenario.toLowerCase())
      ) {
        return true;
      }

      // Search by specific components
      if (components && components.length > 0) {
        return components.some((comp: string) =>
          pattern.components?.some((patternComp: string) =>
            patternComp.toLowerCase().includes(comp.toLowerCase())
          )
        );
      }

      return false;
    });

    // Also include layout guidance if available
    const layoutGuidance = this.systemFiles.get("layout");
    const setupGuidance = this.systemFiles.get("system-setup");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              scenario,
              matchingPatterns,
              totalPatterns: patterns.length,
              layoutGuidance:
                layoutGuidance?.summary ||
                "See layout.json for page structure guidance",
              setupGuidance:
                setupGuidance?.summary ||
                "See system-setup.json for installation instructions",
              relatedSystemFiles: {
                layout: layoutGuidance ? "Available" : "Not loaded",
                setup: setupGuidance ? "Available" : "Not loaded",
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

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
        totalComponents: this.components.size,
        componentExists: this.components.has(componentName),
      },
    };

    // Log feedback (in production, this would go to a database/file)
    console.error("📝 Feedback collected:", JSON.stringify(feedback, null, 2));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              message:
                "Feedback collected successfully! Thank you for helping improve the GoA Design System.",
              feedbackId: feedback.id,
              nextSteps:
                "The design system team will review your feedback and may reach out for clarification.",
              component: this.components.has(componentName)
                ? `Component '${componentName}' found in system`
                : `Component '${componentName}' not found - this feedback will help us identify gaps`,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
