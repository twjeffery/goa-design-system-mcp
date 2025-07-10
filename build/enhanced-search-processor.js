/**
 * Enhanced search processor with advanced ranking and caching
 */
export class EnhancedSearchProcessor {
    semanticEngine;
    searchCache = new Map();
    queryAnalytics = new Map();
    intentAnalytics = new Map();
    maxCacheSize = 100;
    cacheExpiryMs = 1000 * 60 * 30; // 30 minutes
    defaultWeights = {
        exactMatch: 0.25,
        semanticSimilarity: 0.20,
        contextRelevance: 0.20,
        userIntentAlignment: 0.15,
        freshnessScore: 0.10,
        popularityBoost: 0.05,
        typeRelevance: 0.05
    };
    constructor(semanticEngine) {
        this.semanticEngine = semanticEngine;
    }
    /**
     * Process search query with enhanced ranking and caching
     */
    async processSearch(query, dataItems, options = {}) {
        const startTime = Date.now();
        const normalizedQuery = this.normalizeQuery(query);
        // Track query analytics
        this.updateQueryAnalytics(normalizedQuery);
        // Check cache first
        const cachedResult = this.getCachedResult(normalizedQuery);
        if (cachedResult) {
            return {
                results: cachedResult.results.slice(0, options.maxResults || 8),
                intent: this.semanticEngine.detectIntent(query),
                analytics: {
                    cacheHit: true,
                    processingTimeMs: Date.now() - startTime,
                    resultCount: cachedResult.results.length
                }
            };
        }
        // Detect user intent
        const intent = this.semanticEngine.detectIntent(query);
        this.updateIntentAnalytics(intent.type);
        // Enhanced search with semantic understanding
        let results = this.semanticEngine.enhancedSearch(query, dataItems, intent);
        // Apply additional ranking factors
        results = this.applyAdvancedRanking(results, query, intent, options.customWeights);
        // Apply recency boost if requested
        if (options.boostRecent) {
            results = this.applyRecencyBoost(results);
        }
        // Cache results
        this.cacheResults(normalizedQuery, results);
        const finalResults = results.slice(0, options.maxResults || 8);
        return {
            results: finalResults,
            intent,
            analytics: {
                cacheHit: false,
                processingTimeMs: Date.now() - startTime,
                resultCount: results.length
            }
        };
    }
    /**
     * Apply advanced ranking using multiple factors and weights
     */
    applyAdvancedRanking(results, query, intent, customWeights) {
        const weights = { ...this.defaultWeights, ...customWeights };
        return results.map(result => {
            const popularity = this.getPopularityScore(result.name);
            const typeRelevance = this.getTypeRelevanceScore(result.type, intent);
            // Calculate weighted score
            const weightedScore = (result.relevanceFactors.exactMatch ? weights.exactMatch * 100 : 0) +
                (result.relevanceFactors.semanticSimilarity * weights.semanticSimilarity * 100) +
                (result.relevanceFactors.contextRelevance * weights.contextRelevance * 50) +
                (result.relevanceFactors.userIntentAlignment * weights.userIntentAlignment * 100) +
                (result.relevanceFactors.freshnessScore * weights.freshnessScore * 100) +
                (popularity * weights.popularityBoost * 100) +
                (typeRelevance * weights.typeRelevance * 100);
            return {
                ...result,
                score: weightedScore,
                explanation: this.enhanceExplanation(result.explanation, {
                    popularity,
                    typeRelevance,
                    intentConfidence: intent.confidence
                })
            };
        }).sort((a, b) => b.score - a.score);
    }
    /**
     * Get popularity score based on query analytics
     */
    getPopularityScore(itemName) {
        const queries = Array.from(this.queryAnalytics.entries());
        const totalQueries = queries.reduce((sum, [, count]) => sum + count, 0);
        if (totalQueries === 0)
            return 0.5;
        // Find queries that reference this item
        const relevantQueries = queries.filter(([query]) => query.toLowerCase().includes(itemName.toLowerCase()) ||
            itemName.toLowerCase().includes(query.toLowerCase()));
        const relevantCount = relevantQueries.reduce((sum, [, count]) => sum + count, 0);
        return Math.min(relevantCount / totalQueries * 10, 1.0);
    }
    /**
     * Calculate type relevance score for given intent
     */
    getTypeRelevanceScore(itemType, intent) {
        const typeRelevanceMap = {
            'component_search': {
                'component': 1.0,
                'system': 0.3,
                'workflow': 0.2
            },
            'implementation_guidance': {
                'system': 1.0,
                'component': 0.8,
                'workflow': 0.7
            },
            'workflow_request': {
                'workflow': 1.0,
                'system': 0.6,
                'component': 0.3
            },
            'troubleshooting': {
                'component': 0.9,
                'system': 0.8,
                'workflow': 0.4
            }
        };
        return typeRelevanceMap[intent.type]?.[itemType] || 0.5;
    }
    /**
     * Apply recency boost to recently updated content
     */
    applyRecencyBoost(results) {
        return results.map(result => {
            const recencyMultiplier = 1 + (result.relevanceFactors.freshnessScore * 0.2);
            return {
                ...result,
                score: result.score * recencyMultiplier
            };
        });
    }
    /**
     * Enhance explanation with additional context
     */
    enhanceExplanation(baseExplanation, factors) {
        const additionalFactors = [];
        if (factors.popularity > 0.7) {
            additionalFactors.push("Popular choice");
        }
        if (factors.typeRelevance > 0.8) {
            additionalFactors.push("Strong type match");
        }
        if (factors.intentConfidence > 0.8) {
            additionalFactors.push("High intent confidence");
        }
        if (additionalFactors.length > 0) {
            return `${baseExplanation}; ${additionalFactors.join(", ")}`;
        }
        return baseExplanation;
    }
    /**
     * Normalize query for consistent caching and analytics
     */
    normalizeQuery(query) {
        return query.toLowerCase().trim().replace(/\s+/g, ' ');
    }
    /**
     * Update query analytics for popularity tracking
     */
    updateQueryAnalytics(query) {
        const current = this.queryAnalytics.get(query) || 0;
        this.queryAnalytics.set(query, current + 1);
    }
    /**
     * Update intent analytics for system insights
     */
    updateIntentAnalytics(intentType) {
        const current = this.intentAnalytics.get(intentType) || 0;
        this.intentAnalytics.set(intentType, current + 1);
    }
    /**
     * Get cached search results
     */
    getCachedResult(query) {
        const cached = this.searchCache.get(query);
        if (!cached)
            return null;
        // Check if cache entry is expired
        if (Date.now() - cached.timestamp > this.cacheExpiryMs) {
            this.searchCache.delete(query);
            return null;
        }
        // Update hit count
        cached.hitCount++;
        return cached;
    }
    /**
     * Cache search results with LRU eviction
     */
    cacheResults(query, results) {
        // Implement LRU eviction if cache is full
        if (this.searchCache.size >= this.maxCacheSize) {
            const oldestEntry = Array.from(this.searchCache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
            if (oldestEntry) {
                this.searchCache.delete(oldestEntry[0]);
            }
        }
        this.searchCache.set(query, {
            query,
            results,
            timestamp: Date.now(),
            hitCount: 0
        });
    }
    /**
     * Get search analytics and insights
     */
    getAnalytics() {
        const totalQueries = Array.from(this.queryAnalytics.values())
            .reduce((sum, count) => sum + count, 0);
        const cacheHits = Array.from(this.searchCache.values())
            .reduce((sum, entry) => sum + entry.hitCount, 0);
        const cacheHitRate = totalQueries > 0 ? cacheHits / totalQueries : 0;
        const averageResultCount = Array.from(this.searchCache.values())
            .reduce((sum, entry) => sum + entry.results.length, 0) /
            Math.max(this.searchCache.size, 1);
        const popularQueries = Array.from(this.queryAnalytics.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([query, count]) => ({ query, count }));
        const intentDistribution = Object.fromEntries(this.intentAnalytics.entries());
        return {
            totalQueries,
            cacheHitRate,
            averageResultCount,
            popularQueries,
            intentDistribution
        };
    }
    /**
     * Clear cache and analytics (useful for testing or reset)
     */
    clearCache() {
        this.searchCache.clear();
        this.queryAnalytics.clear();
        this.intentAnalytics.clear();
    }
    /**
     * Get query suggestions based on popular searches and intent
     */
    getQuerySuggestions(partialQuery, maxSuggestions = 5) {
        const partial = partialQuery.toLowerCase();
        // Find queries that start with or contain the partial query
        const matchingQueries = Array.from(this.queryAnalytics.entries())
            .filter(([query]) => query.toLowerCase().includes(partial) ||
            this.semanticEngine.calculateFuzzySimilarity(query.toLowerCase(), partial) > 0.6)
            .sort(([, a], [, b]) => b - a)
            .slice(0, maxSuggestions)
            .map(([query]) => query);
        return matchingQueries;
    }
    /**
     * Analyze query patterns for system optimization insights
     */
    analyzeQueryPatterns() {
        const allQueries = Array.from(this.queryAnalytics.keys());
        const termFrequency = new Map();
        // Extract terms and calculate frequency
        allQueries.forEach(query => {
            const terms = query.split(/\s+/);
            terms.forEach(term => {
                if (term.length > 2) { // Ignore very short terms
                    const current = termFrequency.get(term) || 0;
                    termFrequency.set(term, current + 1);
                }
            });
        });
        const commonTerms = Array.from(termFrequency.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 20)
            .map(([term, frequency]) => ({ term, frequency }));
        // Analyze query complexity
        const queryComplexity = {
            simple: 0,
            medium: 0,
            complex: 0
        };
        allQueries.forEach(query => {
            const wordCount = query.split(/\s+/).length;
            if (wordCount <= 2) {
                queryComplexity.simple++;
            }
            else if (wordCount <= 5) {
                queryComplexity.medium++;
            }
            else {
                queryComplexity.complex++;
            }
        });
        // Calculate intent accuracy based on results relevance
        const totalIntents = Array.from(this.intentAnalytics.values())
            .reduce((sum, count) => sum + count, 0);
        const intentAccuracy = totalIntents > 0 ? 0.85 : 0; // Placeholder - would need user feedback
        // Generate optimization recommendations
        const recommendedOptimizations = [];
        if (queryComplexity.complex > queryComplexity.simple) {
            recommendedOptimizations.push("Consider query simplification suggestions");
        }
        if (this.searchCache.size < this.maxCacheSize * 0.3) {
            recommendedOptimizations.push("Cache utilization is low - consider adjusting cache parameters");
        }
        if (commonTerms.length > 0 && commonTerms[0].frequency > totalIntents * 0.3) {
            recommendedOptimizations.push(`High frequency term "${commonTerms[0].term}" suggests need for dedicated search path`);
        }
        return {
            commonTerms,
            queryComplexity,
            intentAccuracy,
            recommendedOptimizations
        };
    }
}
//# sourceMappingURL=enhanced-search-processor.js.map