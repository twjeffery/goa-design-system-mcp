/**
 * Enhanced GoA Design System Server with semantic search and optimization
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { SemanticSearchEngine } from './semantic-search.js';
import { EnhancedSearchProcessor } from './enhanced-search-processor.js';
import { OptimizedDataManager } from './optimized-data-manager.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
export class EnhancedGoADesignSystemServer {
    dataManager;
    semanticEngine;
    searchProcessor;
    initialized = false;
    constructor() {
        const dataDir = join(__dirname, "../data");
        const docsDir = join(__dirname, "../docs");
        this.dataManager = new OptimizedDataManager(dataDir, docsDir);
        this.semanticEngine = new SemanticSearchEngine({
            enableFuzzyMatching: true,
            enableQueryExpansion: true,
            enableIntentDetection: true,
            similarityThreshold: 0.3
        });
        this.searchProcessor = new EnhancedSearchProcessor(this.semanticEngine);
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            await this.dataManager.initialize();
            this.initialized = true;
            const stats = this.dataManager.getMemoryStats();
            console.error("✅ Enhanced GoA Design System server initialized");
            console.error(`📊 Memory usage: ${stats.memoryUsageMB.toFixed(2)}MB`);
            console.error(`🗂️ Index size: ${(stats.totalIndexSize / 1024).toFixed(2)}KB`);
        }
        catch (error) {
            console.error("❌ Failed to initialize enhanced server:", error);
            throw error;
        }
    }
    /**
     * Enhanced project knowledge search with semantic understanding
     */
    async projectKnowledgeSearch(args) {
        const { query, max_text_results = 8, max_image_results = 2 } = args;
        try {
            // Fast initial search using indices
            const candidates = this.dataManager.fastSearch(query);
            // Convert indexed components to full data items for semantic search
            const dataItems = await this.loadCandidateData(candidates);
            // Enhanced search with semantic understanding
            const searchResult = await this.searchProcessor.processSearch(query, dataItems, {
                maxResults: max_text_results,
                boostRecent: true
            });
            // Apply GoA-specific business logic
            const enhancedResults = await this.applyGoABusinessLogic(searchResult.results, query, searchResult.intent);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            query,
                            intent: {
                                type: searchResult.intent.type,
                                confidence: searchResult.intent.confidence,
                                suggestedTools: searchResult.intent.suggestedTools
                            },
                            performance: {
                                processingTimeMs: searchResult.analytics.processingTimeMs,
                                cacheHit: searchResult.analytics.cacheHit,
                                resultCount: searchResult.analytics.resultCount
                            },
                            totalSearched: {
                                components: this.dataManager.getAllByType('component').length,
                                systemFiles: this.dataManager.getAllByType('system').length,
                                workflows: this.dataManager.getAllByType('workflow').length
                            },
                            results: enhancedResults.slice(0, max_text_results).map(result => ({
                                type: result.type,
                                name: result.name,
                                score: Math.round(result.score * 100) / 100,
                                explanation: result.explanation,
                                relevanceFactors: {
                                    exactMatch: result.relevanceFactors.exactMatch,
                                    semanticSimilarity: Math.round(result.relevanceFactors.semanticSimilarity * 100) / 100,
                                    contextRelevance: Math.round(result.relevanceFactors.contextRelevance * 100) / 100,
                                    intentAlignment: Math.round(result.relevanceFactors.userIntentAlignment * 100) / 100
                                },
                                summary: result.content.summary ||
                                    result.content.methodologyName ||
                                    result.content.purpose ||
                                    "No summary available",
                                // Include full content for workflows and mandatory principles
                                ...(result.type === "workflow" ||
                                    result.name === "mandatory-principles" ||
                                    result.score > 80
                                    ? { fullContent: result.content }
                                    : {}),
                                ...(result.type === "component"
                                    ? {
                                        category: result.content.category,
                                        tags: result.content.tags,
                                        commonUse: result.content.commonUse,
                                        status: result.content.status
                                    }
                                    : {}),
                                ...(result.type === "system"
                                    ? {
                                        purpose: result.content.purpose,
                                    }
                                    : {})
                            })),
                            suggestions: enhancedResults.length === 0 ?
                                this.dataManager.getSearchSuggestions(query, 3) :
                                [],
                            searchTip: enhancedResults.length === 0
                                ? `No matches found for "${query}". Try terms like "form", "layout", "button", "figma", or "design conversion".`
                                : undefined,
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            console.error("Search error:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "Search failed",
                            message: error instanceof Error ? error.message : "Unknown error",
                            suggestions: this.dataManager.getSearchSuggestions(query, 3)
                        }, null, 2)
                    }
                ]
            };
        }
    }
    /**
     * Load full data for candidate components
     */
    async loadCandidateData(candidates) {
        const dataItems = [];
        for (const candidate of candidates) {
            try {
                const fullContent = await this.dataManager.loadComponent(candidate.name, candidate.type);
                dataItems.push({
                    name: candidate.name,
                    content: fullContent,
                    type: candidate.type
                });
            }
            catch (error) {
                console.error(`Failed to load candidate ${candidate.name}:`, error);
            }
        }
        return dataItems;
    }
    /**
     * Apply GoA-specific business logic and priorities
     */
    async applyGoABusinessLogic(results, query, intent) {
        const queryLower = query.toLowerCase();
        const enhancedResults = [...results];
        // Enhanced detection for build/code requests
        const buildKeywords = [
            "build", "create", "make", "generate", "code", "implement",
            "develop", "convert", "design", "page", "component", "build this"
        ];
        const frameworkKeywords = ["react", "angular"];
        const isBuildRequest = buildKeywords.some(keyword => queryLower.includes(keyword));
        const hasFramework = frameworkKeywords.some(keyword => queryLower.includes(keyword));
        // ALWAYS include system setup for build requests with HIGHEST priority
        if (isBuildRequest || hasFramework) {
            try {
                const systemSetup = await this.dataManager.loadComponent("system-setup", "system");
                // Insert at the beginning with maximum priority
                enhancedResults.unshift({
                    type: "system",
                    name: "mandatory-principles",
                    content: systemSetup,
                    score: 150,
                    explanation: "Mandatory GoA development principles for all build requests",
                    relevanceFactors: {
                        exactMatch: true,
                        semanticSimilarity: 1.0,
                        contextRelevance: 2.0,
                        userIntentAlignment: 1.0,
                        freshnessScore: 1.0
                    }
                });
            }
            catch (error) {
                console.error("Failed to load system setup:", error);
            }
        }
        // Enhanced Figma/design conversion detection
        const figmaKeywords = [
            "figma", "design", "convert", "build this", "build in", "react", "angular",
            "prototype", "mockup", "wireframe", "turn this into", "code this design",
            "build this page", "create this", "make this", "implement this"
        ];
        const isFigmaQuery = figmaKeywords.some(keyword => queryLower.includes(keyword));
        // Prioritize workflow documentation for Figma queries
        if (isFigmaQuery) {
            try {
                const workflow = await this.dataManager.loadComponent("figma-to-code-workflow", "workflow");
                // Check if workflow matches triggers
                if (workflow.triggers?.some((trigger) => queryLower.includes(trigger.toLowerCase())) || (isBuildRequest && hasFramework)) {
                    enhancedResults.unshift({
                        type: "workflow",
                        name: "figma-to-code-workflow",
                        content: workflow,
                        score: 120,
                        explanation: "Figma conversion workflow detected",
                        relevanceFactors: {
                            exactMatch: false,
                            semanticSimilarity: 0.9,
                            contextRelevance: 2.0,
                            userIntentAlignment: 1.0,
                            freshnessScore: 1.0
                        }
                    });
                }
            }
            catch (error) {
                console.error("Failed to load figma workflow:", error);
            }
        }
        // Sort by score and apply final ranking
        return enhancedResults.sort((a, b) => b.score - a.score);
    }
    /**
     * Enhanced component search with better filtering
     */
    async searchComponents(args) {
        const { query, category, tags, limit = 10 } = args;
        try {
            const filters = {};
            if (category)
                filters.categories = [category];
            if (tags && tags.length > 0)
                filters.tags = tags;
            filters.types = ['component']; // Only search components
            const candidates = this.dataManager.fastSearch(query, filters);
            const dataItems = await this.loadCandidateData(candidates);
            const searchResult = await this.searchProcessor.processSearch(query, dataItems, { maxResults: limit });
            const results = searchResult.results.map(result => ({
                name: result.name,
                score: Math.round(result.score * 100) / 100,
                summary: result.content.summary,
                category: result.content.category,
                tags: result.content.tags,
                status: result.content.status,
                commonUse: result.content.commonUse || result.content.designGuidance?.when?.[0],
                explanation: result.explanation
            }));
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            query,
                            filters: { category, tags },
                            intent: {
                                type: searchResult.intent.type,
                                confidence: searchResult.intent.confidence
                            },
                            performance: {
                                processingTimeMs: searchResult.analytics.processingTimeMs,
                                cacheHit: searchResult.analytics.cacheHit
                            },
                            resultsCount: results.length,
                            totalComponents: this.dataManager.getAllByType('component').length,
                            results,
                            suggestions: results.length === 0 ?
                                this.dataManager.getSearchSuggestions(query, 3) :
                                [],
                            searchTip: results.length === 0
                                ? `No components found for "${query}". Try broader terms like "form", "layout", "button", or "navigation".`
                                : undefined,
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            console.error("Component search error:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "Component search failed",
                            message: error instanceof Error ? error.message : "Unknown error"
                        }, null, 2)
                    }
                ]
            };
        }
    }
    /**
     * Enhanced component details with performance tracking
     */
    async getComponentDetails(args) {
        const { componentName, framework } = args;
        try {
            let component = await this.dataManager.loadComponent(componentName, 'component');
            // Try alternative lookups if not found
            if (!component) {
                const suggestions = this.dataManager.getSearchSuggestions(componentName, 5);
                throw new Error(`Component '${componentName}' not found. ` +
                    (suggestions.length > 0
                        ? `Did you mean: ${suggestions.join(", ")}?`
                        : "Use search_components to find available components."));
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
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "Component not found",
                            message: error instanceof Error ? error.message : "Unknown error",
                            suggestions: this.dataManager.getSearchSuggestions(componentName, 5)
                        }, null, 2)
                    }
                ]
            };
        }
    }
    /**
     * Enhanced usage patterns with semantic matching
     */
    async getUsagePatterns(args) {
        const { scenario, components } = args;
        try {
            // Search for patterns using semantic search
            const query = `${scenario} ${components?.join(' ') || ''}`;
            const candidates = this.dataManager.fastSearch(query);
            // Load master index for patterns
            const indexCandidates = candidates.filter(c => c.name.includes('index'));
            let patterns = [];
            if (indexCandidates.length > 0) {
                const indexData = await this.dataManager.loadComponent(indexCandidates[0].name, indexCandidates[0].type);
                patterns = indexData?.usagePatterns?.["common-combinations"] || [];
            }
            const matchingPatterns = patterns.filter((pattern) => {
                // Enhanced pattern matching with semantic similarity
                const patternText = `${pattern.description} ${pattern.useCase} ${pattern.name}`.toLowerCase();
                const scenarioLower = scenario.toLowerCase();
                const similarity = this.semanticEngine.calculateSemanticSimilarity(scenarioLower, { text: patternText });
                return similarity > 0.3 || // Semantic match
                    patternText.includes(scenarioLower) || // Direct match
                    (components && components.some((comp) => pattern.components?.some((patternComp) => patternComp.toLowerCase().includes(comp.toLowerCase()))));
            });
            // Load layout and setup guidance
            const layoutGuidance = await this.dataManager.loadComponent("layout", "system");
            const setupGuidance = await this.dataManager.loadComponent("system-setup", "system");
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            scenario,
                            searchComponents: components,
                            matchingPatterns,
                            totalPatterns: patterns.length,
                            layoutGuidance: layoutGuidance?.summary || "See layout.json for page structure guidance",
                            setupGuidance: setupGuidance?.summary || "See system-setup.json for installation instructions",
                            relatedSystemFiles: {
                                layout: layoutGuidance ? "Available" : "Not loaded",
                                setup: setupGuidance ? "Available" : "Not loaded",
                            },
                            recommendations: this.generatePatternRecommendations(scenario, matchingPatterns)
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "Pattern search failed",
                            message: error instanceof Error ? error.message : "Unknown error"
                        }, null, 2)
                    }
                ]
            };
        }
    }
    /**
     * Generate intelligent pattern recommendations
     */
    generatePatternRecommendations(scenario, patterns) {
        const recommendations = [];
        if (patterns.length === 0) {
            recommendations.push("Consider starting with basic form components: FormItem, Input, Button");
            recommendations.push("Use Container component for grouping related elements");
            recommendations.push("Apply OneColumnLayout for page structure");
        }
        else if (patterns.length === 1) {
            recommendations.push(`Perfect match found for ${scenario}`);
            recommendations.push("Consider variations of this pattern for different use cases");
        }
        else {
            recommendations.push(`Multiple patterns available for ${scenario}`);
            recommendations.push("Choose based on complexity and specific requirements");
            recommendations.push("Start with the simplest pattern and enhance as needed");
        }
        return recommendations;
    }
    /**
     * Enhanced feedback collection with analytics
     */
    async collectFeedback(args) {
        const { componentName, feedbackType, description, userTeam } = args;
        const feedback = {
            timestamp: new Date().toISOString(),
            componentName,
            feedbackType,
            description,
            userTeam: userTeam || "Unknown",
            id: Math.random().toString(36).substr(2, 9),
            serverInfo: {
                totalComponents: this.dataManager.getAllByType('component').length,
                componentExists: this.dataManager.getAllByType('component').some(c => c.name === componentName),
                searchAnalytics: this.searchProcessor.getAnalytics()
            },
        };
        console.error("📝 Enhanced feedback collected:", JSON.stringify(feedback, null, 2));
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
                            ? `Component '${componentName}' found in system`
                            : `Component '${componentName}' not found - this feedback will help us identify gaps`,
                        systemInsights: {
                            totalQueries: feedback.serverInfo.searchAnalytics.totalQueries,
                            cacheHitRate: Math.round(feedback.serverInfo.searchAnalytics.cacheHitRate * 100),
                            popularQueries: feedback.serverInfo.searchAnalytics.popularQueries.slice(0, 3)
                        }
                    }, null, 2),
                },
            ],
        };
    }
    /**
     * Get system analytics and performance metrics
     */
    async getSystemAnalytics() {
        const memoryStats = this.dataManager.getMemoryStats();
        const searchAnalytics = this.searchProcessor.getAnalytics();
        const queryPatterns = this.searchProcessor.analyzeQueryPatterns();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        memory: {
                            usageMB: Math.round(memoryStats.memoryUsageMB * 100) / 100,
                            indexSizeKB: Math.round(memoryStats.totalIndexSize / 1024 * 100) / 100,
                            cacheSizeKB: Math.round(memoryStats.loadedComponentsSize / 1024 * 100) / 100,
                            cacheHitRate: Math.round(memoryStats.cacheHitRate * 100)
                        },
                        search: {
                            totalQueries: searchAnalytics.totalQueries,
                            cacheHitRate: Math.round(searchAnalytics.cacheHitRate * 100),
                            averageResults: Math.round(searchAnalytics.averageResultCount * 100) / 100,
                            intentDistribution: searchAnalytics.intentDistribution
                        },
                        patterns: {
                            commonTerms: queryPatterns.commonTerms.slice(0, 10),
                            queryComplexity: queryPatterns.queryComplexity,
                            recommendations: queryPatterns.recommendedOptimizations
                        },
                        performance: {
                            componentsIndexed: this.dataManager.getAllByType('component').length,
                            systemFilesIndexed: this.dataManager.getAllByType('system').length,
                            workflowsIndexed: this.dataManager.getAllByType('workflow').length
                        }
                    }, null, 2)
                }
            ]
        };
    }
    /**
     * Optimize system performance
     */
    async optimizeSystem() {
        const optimizationResult = this.dataManager.optimizeMemory();
        this.searchProcessor.clearCache();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        status: "optimization_complete",
                        freedBytes: optimizationResult.freedBytes,
                        actions: optimizationResult.actionsPerformed,
                        newMemoryStats: this.dataManager.getMemoryStats()
                    }, null, 2)
                }
            ]
        };
    }
}
//# sourceMappingURL=enhanced-server.js.map