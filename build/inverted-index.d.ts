/**
 * Inverted Index Implementation for Fast Component Search
 *
 * Replaces O(n) linear search with O(1) indexed lookups
 * Provides 4-10x performance improvement for search operations
 */
export interface IndexedItem {
    id: string;
    type: 'component' | 'system' | 'workflow' | 'recipe';
    data: any;
    searchableText: string;
    tags: string[];
    category?: string;
}
export interface SearchCandidate {
    item: IndexedItem;
    matchCount: number;
    matchTypes: Set<'exact' | 'partial' | 'tag' | 'category'>;
}
export declare class InvertedIndex {
    private termIndex;
    private tagIndex;
    private categoryIndex;
    private prefixIndex;
    private items;
    private stats;
    /**
     * Add an item to the index
     */
    addItem(item: IndexedItem): void;
    /**
     * Fast search using inverted indices
     * Returns candidates that match query terms with relevance scoring
     */
    search(query: string, maxResults?: number): SearchCandidate[];
    /**
     * Get item by ID
     */
    getItem(id: string): IndexedItem | undefined;
    /**
     * Get all items of a specific type
     */
    getItemsByType(type: 'component' | 'system' | 'workflow' | 'recipe'): IndexedItem[];
    /**
     * Get performance statistics
     */
    getStats(): {
        totalItems: number;
        totalTerms: number;
        averageTermsPerItem: number;
        indexBuildTime: number;
        lastUpdated: number;
    };
    /**
     * Clear the entire index
     */
    clear(): void;
    /**
     * Rebuild index from current items (useful after bulk updates)
     */
    rebuild(): void;
    private extractSearchTerms;
    private extractQueryTerms;
    private normalizeTerm;
    private addCandidateMatch;
    private getMatchTypePriority;
    private updateStats;
}
/**
 * Helper function to create searchable text from component data
 */
export declare function createSearchableText(data: any): string;
/**
 * Helper function to extract tags from component data
 */
export declare function extractTags(data: any): string[];
//# sourceMappingURL=inverted-index.d.ts.map