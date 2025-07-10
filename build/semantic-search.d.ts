/**
 * Enhanced semantic search capabilities for GoA Design System MCP
 */
export interface SemanticSearchConfig {
    enableFuzzyMatching: boolean;
    enableQueryExpansion: boolean;
    enableIntentDetection: boolean;
    similarityThreshold: number;
}
export interface QueryIntent {
    type: 'component_search' | 'implementation_guidance' | 'workflow_request' | 'troubleshooting';
    confidence: number;
    suggestedTools: string[];
    contextBoosts: Record<string, number>;
}
export interface EnhancedSearchResult {
    id: string;
    type: string;
    name: string;
    content: any;
    score: number;
    relevanceFactors: {
        exactMatch: boolean;
        semanticSimilarity: number;
        contextRelevance: number;
        userIntentAlignment: number;
        freshnessScore: number;
    };
    explanation: string;
}
export declare class SemanticSearchEngine {
    private componentEmbeddings;
    private conceptMappings;
    private intentPatterns;
    private config;
    constructor(config: SemanticSearchConfig);
    /**
     * Initialize semantic concept mappings for better query understanding
     */
    private initializeConceptMappings;
    /**
     * Initialize intent detection patterns
     */
    private initializeIntentPatterns;
    /**
     * Detect user intent from query
     */
    detectIntent(query: string): QueryIntent;
    private getSuggestedTools;
    private getContextBoosts;
    /**
     * Expand query with synonyms and related concepts
     */
    expandQuery(originalQuery: string): string[];
    /**
     * Calculate semantic similarity between query and content
     */
    calculateSemanticSimilarity(query: string, content: any): number;
    /**
     * Calculate fuzzy string similarity
     */
    calculateFuzzySimilarity(str1: string, str2: string): number;
    private levenshteinDistance;
    /**
     * Extract searchable text content from component data
     */
    private extractTextContent;
    /**
     * Enhanced search with semantic understanding
     */
    enhancedSearch(query: string, dataItems: Array<{
        name: string;
        content: any;
        type: string;
    }>, intent: QueryIntent): EnhancedSearchResult[];
    private calculateRelevanceFactors;
    private calculateIntentAlignment;
    private calculateFreshnessScore;
    private calculateFinalScore;
    private generateExplanation;
}
//# sourceMappingURL=semantic-search.d.ts.map