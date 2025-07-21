/**
 * Enhanced semantic search capabilities for GoA Design System MCP
 */
export class SemanticSearchEngine {
    componentEmbeddings = new Map();
    conceptMappings = new Map();
    intentPatterns = new Map();
    config;
    constructor(config) {
        this.config = config;
        this.initializeConceptMappings();
        this.initializeIntentPatterns();
    }
    /**
     * Initialize semantic concept mappings for better query understanding
     */
    initializeConceptMappings() {
        // UI Element Synonyms
        this.conceptMappings.set('button', [
            'btn', 'click', 'action', 'submit', 'cta', 'call-to-action',
            'primary button', 'secondary button', 'link button'
        ]);
        this.conceptMappings.set('input', [
            'textbox', 'field', 'form field', 'text input', 'entry',
            'form control', 'input field', 'text field'
        ]);
        this.conceptMappings.set('dropdown', [
            'select', 'picker', 'chooser', 'menu', 'options', 'selection',
            'combo box', 'listbox'
        ]);
        this.conceptMappings.set('modal', [
            'dialog', 'popup', 'overlay', 'lightbox', 'window', 'panel'
        ]);
        // Layout Concepts
        this.conceptMappings.set('layout', [
            'structure', 'grid', 'organization', 'arrangement', 'framework',
            'page structure', 'content layout', 'responsive layout'
        ]);
        this.conceptMappings.set('container', [
            'wrapper', 'box', 'card', 'panel', 'section', 'grouping',
            'content area', 'widget'
        ]);
        // Status and Feedback
        this.conceptMappings.set('notification', [
            'alert', 'message', 'banner', 'toast', 'feedback', 'status',
            'warning', 'error', 'success message'
        ]);
        this.conceptMappings.set('callout', [
            'highlight', 'attention', 'emphasis', 'important', 'notice',
            'info box', 'alert box'
        ]);
        // Navigation
        this.conceptMappings.set('navigation', [
            'nav', 'menu', 'breadcrumb', 'link', 'routing', 'wayfinding',
            'site navigation', 'page navigation'
        ]);
        // Government-specific terms
        this.conceptMappings.set('government', [
            'official', 'alberta', 'goa', 'public service', 'civic',
            'government service', 'official website'
        ]);
        // Form-related concepts
        this.conceptMappings.set('form', [
            'application', 'submission', 'registration', 'questionnaire',
            'data entry', 'user input', 'form validation'
        ]);
        // Design conversion concepts
        this.conceptMappings.set('figma', [
            'design', 'mockup', 'wireframe', 'prototype', 'visual design',
            'design file', 'design handoff', 'design system'
        ]);
    }
    /**
     * Initialize intent detection patterns
     */
    initializeIntentPatterns() {
        this.intentPatterns.set('component_search', [
            /\b(find|search|look for|need|want|use)\s+\w+\s+(component|button|input|form)\b/i,
            /\bhow to\s+(create|build|use|implement)\s+\w+/i,
            /\bwhat\s+(component|element)\s+(for|to)\b/i
        ]);
        this.intentPatterns.set('implementation_guidance', [
            /\b(how to|how do I|best practice|implement|integrate|setup)\b/i,
            /\b(example|sample|code|snippet|pattern)\b/i,
            /\b(react|angular|framework|install|configure)\b/i
        ]);
        this.intentPatterns.set('workflow_request', [
            /\b(figma|design|convert|build|workflow|process)\b/i,
            /\b(design to code|figma to react|mockup|wireframe)\b/i,
            /\b(build this|create this|implement this)\b/i
        ]);
        this.intentPatterns.set('troubleshooting', [
            /\b(error|problem|issue|not working|broken|fix)\b/i,
            /\b(why|troubleshoot|debug|solve|help)\b/i
        ]);
    }
    /**
     * Detect user intent from query
     */
    detectIntent(query) {
        const queryLower = query.toLowerCase();
        const intents = [];
        for (const [intentType, patterns] of this.intentPatterns) {
            let confidence = 0;
            for (const pattern of patterns) {
                if (pattern.test(queryLower)) {
                    confidence += 0.3;
                }
            }
            if (confidence > 0) {
                intents.push({ type: intentType, confidence: Math.min(confidence, 1.0) });
            }
        }
        // Sort by confidence and return highest
        intents.sort((a, b) => b.confidence - a.confidence);
        const primaryIntent = intents[0] || { type: 'component_search', confidence: 0.5 };
        return {
            type: primaryIntent.type,
            confidence: primaryIntent.confidence,
            suggestedTools: this.getSuggestedTools(primaryIntent.type),
            contextBoosts: this.getContextBoosts(primaryIntent.type)
        };
    }
    getSuggestedTools(intentType) {
        const toolMap = {
            'component_search': ['search_components', 'get_component_details'],
            'implementation_guidance': ['project_knowledge_search', 'get_usage_patterns'],
            'workflow_request': ['project_knowledge_search'],
            'troubleshooting': ['project_knowledge_search', 'give_feedback']
        };
        return toolMap[intentType] || ['project_knowledge_search'];
    }
    getContextBoosts(intentType) {
        const boostMap = {
            'component_search': {
                'component': 1.5,
                'api': 1.3,
                'usage': 1.2
            },
            'implementation_guidance': {
                'example': 1.5,
                'installation': 1.4,
                'setup': 1.3,
                'pattern': 1.2
            },
            'workflow_request': {
                'workflow': 2.0,
                'figma': 1.8,
                'conversion': 1.5
            },
            'troubleshooting': {
                'troubleshooting': 1.8,
                'error': 1.5,
                'common': 1.3
            }
        };
        return boostMap[intentType] || {};
    }
    /**
     * Expand query with synonyms and related concepts
     */
    expandQuery(originalQuery) {
        const queryTerms = originalQuery.toLowerCase().split(/\s+/);
        const expandedTerms = new Set([originalQuery]);
        // Add original terms
        queryTerms.forEach(term => expandedTerms.add(term));
        // Add synonyms and related concepts
        for (const [concept, synonyms] of this.conceptMappings) {
            if (queryTerms.some(term => term.includes(concept) ||
                synonyms.some(synonym => term.includes(synonym.toLowerCase())))) {
                synonyms.forEach(synonym => expandedTerms.add(synonym));
                expandedTerms.add(concept);
            }
        }
        return Array.from(expandedTerms);
    }
    /**
     * Calculate semantic similarity between query and content
     */
    calculateSemanticSimilarity(query, content) {
        const expandedQuery = this.expandQuery(query);
        const contentText = this.extractTextContent(content).toLowerCase();
        let matches = 0;
        let totalTerms = expandedQuery.length;
        for (const term of expandedQuery) {
            if (contentText.includes(term.toLowerCase())) {
                matches++;
            }
        }
        return matches / totalTerms;
    }
    /**
     * Calculate fuzzy string similarity
     */
    calculateFuzzySimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Extract searchable text content from component data
     */
    extractTextContent(content) {
        const textParts = [];
        if (typeof content === 'string') {
            return content;
        }
        if (typeof content === 'object' && content !== null) {
            // Extract key fields for searching
            const searchableFields = [
                'componentName', 'summary', 'description', 'purpose',
                'commonUse', 'tags', 'aiTags', 'category', 'methodologyName',
                'triggers', 'usage'
            ];
            for (const field of searchableFields) {
                if (content[field]) {
                    if (Array.isArray(content[field])) {
                        textParts.push(...content[field].map((item) => String(item)));
                    }
                    else {
                        textParts.push(String(content[field]));
                    }
                }
            }
            // Recursively extract from nested objects
            for (const [key, value] of Object.entries(content)) {
                if (typeof value === 'object' && !searchableFields.includes(key)) {
                    textParts.push(this.extractTextContent(value));
                }
            }
        }
        return textParts.join(' ');
    }
    /**
     * Enhanced search with semantic understanding
     */
    enhancedSearch(query, dataItems, intent) {
        const results = [];
        const expandedQuery = this.expandQuery(query);
        for (const item of dataItems) {
            const relevanceFactors = this.calculateRelevanceFactors(query, expandedQuery, item, intent);
            const finalScore = this.calculateFinalScore(relevanceFactors, intent);
            if (finalScore > this.config.similarityThreshold) {
                results.push({
                    id: `${item.type}-${item.name}`,
                    type: item.type,
                    name: item.name,
                    content: item.content,
                    score: finalScore,
                    relevanceFactors,
                    explanation: this.generateExplanation(relevanceFactors, intent)
                });
            }
        }
        return results.sort((a, b) => b.score - a.score);
    }
    calculateRelevanceFactors(originalQuery, expandedQuery, item, intent) {
        const contentText = this.extractTextContent(item.content);
        // Exact match detection
        const exactMatch = item.name.toLowerCase() === originalQuery.toLowerCase() ||
            expandedQuery.some(term => item.name.toLowerCase().includes(term.toLowerCase()));
        // Semantic similarity
        const semanticSimilarity = this.calculateSemanticSimilarity(originalQuery, item.content);
        // Context relevance based on intent
        let contextRelevance = 0;
        for (const [context, boost] of Object.entries(intent.contextBoosts)) {
            if (contentText.toLowerCase().includes(context.toLowerCase())) {
                contextRelevance += boost;
            }
        }
        contextRelevance = Math.min(contextRelevance, 2.0); // Cap at 2x boost
        // User intent alignment
        const userIntentAlignment = this.calculateIntentAlignment(item, intent);
        // Freshness score (could be based on lastUpdated field)
        const freshnessScore = item.content.lastUpdated ?
            this.calculateFreshnessScore(item.content.lastUpdated) : 0.5;
        return {
            exactMatch,
            semanticSimilarity,
            contextRelevance,
            userIntentAlignment,
            freshnessScore
        };
    }
    calculateIntentAlignment(item, intent) {
        const typeAlignmentMap = {
            'component_search': {
                'component': 1.0,
                'system': 0.3,
                'workflow': 0.2
            },
            'implementation_guidance': {
                'component': 0.8,
                'system': 1.0,
                'workflow': 0.9
            },
            'workflow_request': {
                'workflow': 1.0,
                'system': 0.7,
                'component': 0.3
            },
            'troubleshooting': {
                'component': 0.8,
                'system': 0.9,
                'workflow': 0.5
            }
        };
        return typeAlignmentMap[intent.type]?.[item.type] || 0.5;
    }
    calculateFreshnessScore(lastUpdated) {
        try {
            const updateDate = new Date(lastUpdated);
            const now = new Date();
            const daysSinceUpdate = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
            // Fresh content (< 30 days) gets full score
            if (daysSinceUpdate < 30)
                return 1.0;
            // Content older than 365 days gets minimum score
            if (daysSinceUpdate > 365)
                return 0.1;
            // Linear decay in between
            return 1.0 - (daysSinceUpdate - 30) / 335 * 0.9;
        }
        catch {
            return 0.5; // Default for invalid dates
        }
    }
    calculateFinalScore(factors, intent) {
        let score = 0;
        // Base semantic similarity
        score += factors.semanticSimilarity * 40;
        // Exact match bonus
        if (factors.exactMatch) {
            score += 30;
        }
        // Context relevance boost
        score += factors.contextRelevance * 20;
        // Intent alignment
        score += factors.userIntentAlignment * 15;
        // Freshness factor
        score += factors.freshnessScore * 5;
        // Intent confidence multiplier
        score *= (0.7 + intent.confidence * 0.3);
        return Math.min(score, 100); // Cap at 100
    }
    generateExplanation(factors, intent) {
        const explanations = [];
        if (factors.exactMatch) {
            explanations.push("Exact name match");
        }
        if (factors.semanticSimilarity > 0.7) {
            explanations.push("High semantic relevance");
        }
        if (factors.contextRelevance > 1.0) {
            explanations.push("Strong context alignment");
        }
        if (factors.userIntentAlignment > 0.8) {
            explanations.push(`Matches ${intent.type.replace('_', ' ')} intent`);
        }
        return explanations.length > 0 ?
            explanations.join(", ") :
            "General relevance match";
    }
}
//# sourceMappingURL=semantic-search.js.map