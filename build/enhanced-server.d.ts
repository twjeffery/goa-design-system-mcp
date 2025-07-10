/**
 * Enhanced GoA Design System Server with semantic search and optimization
 */
export declare class EnhancedGoADesignSystemServer {
    private dataManager;
    private semanticEngine;
    private searchProcessor;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    /**
     * Enhanced project knowledge search with semantic understanding
     */
    projectKnowledgeSearch(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Load full data for candidate components
     */
    private loadCandidateData;
    /**
     * Apply GoA-specific business logic and priorities
     */
    private applyGoABusinessLogic;
    /**
     * Enhanced component search with better filtering
     */
    searchComponents(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Enhanced component details with performance tracking
     */
    getComponentDetails(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Enhanced usage patterns with semantic matching
     */
    getUsagePatterns(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Generate intelligent pattern recommendations
     */
    private generatePatternRecommendations;
    /**
     * Enhanced feedback collection with analytics
     */
    collectFeedback(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Get system analytics and performance metrics
     */
    getSystemAnalytics(): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Optimize system performance
     */
    optimizeSystem(): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
}
//# sourceMappingURL=enhanced-server.d.ts.map