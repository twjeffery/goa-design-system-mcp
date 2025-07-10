export interface SearchResult {
    type: 'component' | 'system' | 'workflow';
    name: string;
    content: any;
    score: number;
    reason: string;
    matchTypes: string[];
}
export interface SearchOptions {
    maxResults?: number;
    category?: string;
    tags?: string[];
    type?: 'component' | 'system' | 'workflow';
}
export declare class OptimizedDataManager {
    private index;
    private initialized;
    private masterIndex;
    private performanceStats;
    initialize(): Promise<void>;
    /**
     * Fast search using inverted index - replaces linear O(n) search with O(1) lookups
     */
    search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
    /**
     * Get specific item by ID (O(1) lookup)
     */
    getItem(id: string): any | null;
    /**
     * Get all items of a specific type
     */
    getItemsByType(type: 'component' | 'system' | 'workflow'): any[];
    /**
     * Get performance and indexing statistics
     */
    getPerformanceStats(): {
        indexStats: {
            totalItems: number;
            totalTerms: number;
            averageTermsPerItem: number;
            indexBuildTime: number;
            lastUpdated: number;
        };
        memoryUsage: {
            estimated: string;
            comparison: string;
        };
        totalSearches: number;
        averageSearchTime: number;
        cacheHits: number;
        indexingTime: number;
    };
    private loadAllData;
    private candidateToSearchResult;
    private generateMatchReason;
    private updatePerformanceStats;
    private estimateMemoryUsage;
}
//# sourceMappingURL=optimized-data-manager.d.ts.map