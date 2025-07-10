import { readFile, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { InvertedIndex, createSearchableText, extractTags } from "./inverted-index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
// Helper function to safely get error messages
const getErrorMessage = (error) => {
    return error instanceof Error ? error.message : String(error);
};
export class OptimizedDataManager {
    index = new InvertedIndex();
    initialized = false;
    masterIndex = null;
    // Performance tracking
    performanceStats = {
        totalSearches: 0,
        averageSearchTime: 0,
        cacheHits: 0,
        indexingTime: 0
    };
    async initialize() {
        if (this.initialized)
            return;
        const startTime = performance.now();
        process.stderr.write(`Starting optimized data loading with inverted index...\n`);
        try {
            await this.loadAllData();
            this.initialized = true;
            const totalTime = performance.now() - startTime;
            this.performanceStats.indexingTime = totalTime;
            const stats = this.index.getStats();
            process.stderr.write(`Optimized data manager initialized successfully\n`);
            process.stderr.write(`Indexed ${stats.totalItems} items with ${stats.totalTerms} unique terms in ${totalTime.toFixed(2)}ms\n`);
            process.stderr.write(`Average terms per item: ${stats.averageTermsPerItem.toFixed(1)}\n`);
        }
        catch (error) {
            process.stderr.write(`Failed to initialize optimized data manager: ${error}\n`);
            throw error;
        }
    }
    /**
     * Fast search using inverted index - replaces linear O(n) search with O(1) lookups
     */
    async search(query, options = {}) {
        const startTime = performance.now();
        this.performanceStats.totalSearches++;
        if (!query.trim()) {
            return [];
        }
        try {
            // Use inverted index for fast candidate retrieval
            const candidates = this.index.search(query, options.maxResults || 20);
            // Apply filters
            let filteredCandidates = candidates;
            if (options.type) {
                filteredCandidates = filteredCandidates.filter(c => c.item.type === options.type);
            }
            if (options.category) {
                filteredCandidates = filteredCandidates.filter(c => c.item.category?.toLowerCase() === options.category?.toLowerCase());
            }
            if (options.tags && options.tags.length > 0) {
                filteredCandidates = filteredCandidates.filter(c => options.tags.some(tag => c.item.tags.some(itemTag => itemTag.toLowerCase().includes(tag.toLowerCase()))));
            }
            // Convert to SearchResult format with enhanced scoring
            const results = filteredCandidates.map(candidate => this.candidateToSearchResult(candidate, query));
            const searchTime = performance.now() - startTime;
            this.updatePerformanceStats(searchTime);
            process.stderr.write(`Fast search completed in ${searchTime.toFixed(2)}ms, found ${results.length} results\n`);
            return results;
        }
        catch (error) {
            process.stderr.write(`Search error: ${error}\n`);
            return [];
        }
    }
    /**
     * Get specific item by ID (O(1) lookup)
     */
    getItem(id) {
        const item = this.index.getItem(id);
        return item ? item.data : null;
    }
    /**
     * Get all items of a specific type
     */
    getItemsByType(type) {
        return this.index.getItemsByType(type).map(item => item.data);
    }
    /**
     * Get performance and indexing statistics
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            indexStats: this.index.getStats(),
            memoryUsage: this.estimateMemoryUsage()
        };
    }
    async loadAllData() {
        const dataDir = join(__dirname, "../data");
        const docsDir = join(__dirname, "../docs");
        // Load master index
        try {
            const indexPath = join(dataDir, "index.json");
            const indexData = await readFile(indexPath, "utf8");
            this.masterIndex = JSON.parse(indexData);
            process.stderr.write(`Master index loaded\n`);
        }
        catch (error) {
            process.stderr.write(`Master index not found or invalid\n`);
        }
        // Load and index system files
        const systemFiles = ["layout.json", "system-setup.json"];
        for (const fileName of systemFiles) {
            try {
                const filePath = join(dataDir, fileName);
                const fileData = await readFile(filePath, "utf8");
                const parsed = JSON.parse(fileData);
                const indexedItem = {
                    id: fileName.replace(".json", ""),
                    type: 'system',
                    data: parsed,
                    searchableText: createSearchableText(parsed),
                    tags: extractTags(parsed),
                    category: parsed.category
                };
                this.index.addItem(indexedItem);
                process.stderr.write(`Indexed system file: ${fileName}\n`);
            }
            catch (error) {
                process.stderr.write(`Could not load ${fileName}: ${getErrorMessage(error)}\n`);
            }
        }
        // Load and index workflow files from docs directory
        try {
            const files = await readdir(docsDir);
            for (const file of files) {
                if (file.endsWith(".json")) {
                    try {
                        const filePath = join(docsDir, file);
                        const data = await readFile(filePath, "utf8");
                        const workflowData = JSON.parse(data);
                        const indexedItem = {
                            id: file.replace(".json", ""),
                            type: 'workflow',
                            data: workflowData,
                            searchableText: createSearchableText(workflowData),
                            tags: extractTags(workflowData),
                            category: workflowData.category
                        };
                        this.index.addItem(indexedItem);
                        process.stderr.write(`Indexed workflow: ${file}\n`);
                    }
                    catch (error) {
                        process.stderr.write(`Could not load workflow file ${file}: ${getErrorMessage(error)}\n`);
                    }
                }
            }
        }
        catch (error) {
            process.stderr.write(`Could not read docs directory: ${getErrorMessage(error)}\n`);
        }
        // Load and index all component files
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
                        const componentName = componentData.componentName ||
                            file.replace("_consumer.json", "").replace(".json", "");
                        const indexedItem = {
                            id: componentName.toLowerCase(),
                            type: 'component',
                            data: componentData,
                            searchableText: createSearchableText(componentData),
                            tags: extractTags(componentData),
                            category: componentData.category
                        };
                        this.index.addItem(indexedItem);
                    }
                    catch (error) {
                        process.stderr.write(`Could not load component file ${file}: ${getErrorMessage(error)}\n`);
                    }
                }
            }
            process.stderr.write(`Indexed ${files.filter(f => f.endsWith('.json')).length} component files\n`);
        }
        catch (error) {
            process.stderr.write(`Could not read components directory: ${getErrorMessage(error)}\n`);
        }
    }
    candidateToSearchResult(candidate, query) {
        const baseScore = candidate.matchCount * 10;
        // Boost score based on match types
        let matchTypeBoost = 0;
        const matchTypes = [];
        candidate.matchTypes.forEach(type => {
            matchTypes.push(type);
            switch (type) {
                case 'exact':
                    matchTypeBoost += 20;
                    break;
                case 'tag':
                    matchTypeBoost += 10;
                    break;
                case 'category':
                    matchTypeBoost += 5;
                    break;
                case 'partial':
                    matchTypeBoost += 2;
                    break;
            }
        });
        const finalScore = baseScore + matchTypeBoost;
        // Generate reason explanation
        const reason = this.generateMatchReason(candidate, query);
        return {
            type: candidate.item.type,
            name: candidate.item.id,
            content: candidate.item.data,
            score: finalScore,
            reason,
            matchTypes
        };
    }
    generateMatchReason(candidate, query) {
        const reasons = [];
        if (candidate.matchTypes.has('exact')) {
            reasons.push("Exact term match");
        }
        if (candidate.matchTypes.has('tag')) {
            reasons.push("Tag match");
        }
        if (candidate.matchTypes.has('category')) {
            reasons.push("Category match");
        }
        if (candidate.matchTypes.has('partial')) {
            reasons.push("Partial match");
        }
        return reasons.join(", ") || "General match";
    }
    updatePerformanceStats(searchTime) {
        const totalTime = this.performanceStats.averageSearchTime * (this.performanceStats.totalSearches - 1) + searchTime;
        this.performanceStats.averageSearchTime = totalTime / this.performanceStats.totalSearches;
    }
    estimateMemoryUsage() {
        const stats = this.index.getStats();
        // Rough estimation based on index size
        const estimatedBytes = stats.totalItems * 1000 + stats.totalTerms * 50;
        const estimatedMB = estimatedBytes / (1024 * 1024);
        // Compare to original linear approach
        const originalEstimatedMB = stats.totalItems * 5; // Assume 5MB per component with full text search
        const savings = Math.round(((originalEstimatedMB - estimatedMB) / originalEstimatedMB) * 100);
        return {
            estimated: `${estimatedMB.toFixed(1)}MB`,
            comparison: `${savings}% less than linear search approach`
        };
    }
}
//# sourceMappingURL=optimized-data-manager.js.map