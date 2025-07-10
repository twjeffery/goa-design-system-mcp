/**
 * Enhanced search processor with advanced ranking and caching
 */
import { SemanticSearchEngine, QueryIntent, EnhancedSearchResult } from './semantic-search.js';
export interface SearchCacheEntry {
    query: string;
    results: EnhancedSearchResult[];
    timestamp: number;
    hitCount: number;
}
export interface SearchAnalytics {
    totalQueries: number;
    cacheHitRate: number;
    averageResultCount: number;
    popularQueries: Array<{
        query: string;
        count: number;
    }>;
    intentDistribution: Record<string, number>;
}
export interface RankingWeights {
    exactMatch: number;
    semanticSimilarity: number;
    contextRelevance: number;
    userIntentAlignment: number;
    freshnessScore: number;
    popularityBoost: number;
    typeRelevance: number;
}
export declare class EnhancedSearchProcessor {
    private semanticEngine;
    private searchCache;
    private queryAnalytics;
    private intentAnalytics;
    private maxCacheSize;
    private cacheExpiryMs;
    private defaultWeights;
    constructor(semanticEngine: SemanticSearchEngine);
    /**
     * Process search query with enhanced ranking and caching
     */
    processSearch(query: string, dataItems: Array<{
        name: string;
        content: any;
        type: string;
    }>, options?: {
        maxResults?: number;
        boostRecent?: boolean;
        customWeights?: Partial<RankingWeights>;
    }): Promise<{
        results: EnhancedSearchResult[];
        intent: QueryIntent;
        analytics: {
            cacheHit: boolean;
            processingTimeMs: number;
            resultCount: number;
        };
    }>;
    /**
     * Apply advanced ranking using multiple factors and weights
     */
    private applyAdvancedRanking;
    /**
     * Get popularity score based on query analytics
     */
    private getPopularityScore;
    /**
     * Calculate type relevance score for given intent
     */
    private getTypeRelevanceScore;
    /**
     * Apply recency boost to recently updated content
     */
    private applyRecencyBoost;
    /**
     * Enhance explanation with additional context
     */
    private enhanceExplanation;
    /**
     * Normalize query for consistent caching and analytics
     */
    private normalizeQuery;
    /**
     * Update query analytics for popularity tracking
     */
    private updateQueryAnalytics;
    /**
     * Update intent analytics for system insights
     */
    private updateIntentAnalytics;
    /**
     * Get cached search results
     */
    private getCachedResult;
    /**
     * Cache search results with LRU eviction
     */
    private cacheResults;
    /**
     * Get search analytics and insights
     */
    getAnalytics(): SearchAnalytics;
    /**
     * Clear cache and analytics (useful for testing or reset)
     */
    clearCache(): void;
    /**
     * Get query suggestions based on popular searches and intent
     */
    getQuerySuggestions(partialQuery: string, maxSuggestions?: number): string[];
    /**
     * Analyze query patterns for system optimization insights
     */
    analyzeQueryPatterns(): {
        commonTerms: Array<{
            term: string;
            frequency: number;
        }>;
        queryComplexity: {
            simple: number;
            medium: number;
            complex: number;
        };
        intentAccuracy: number;
        recommendedOptimizations: string[];
    };
}
//# sourceMappingURL=enhanced-search-processor.d.ts.map