import { readFile, readdir, writeFile, access } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
// Helper function to safely get error messages
const getErrorMessage = (error) => {
    return error instanceof Error ? error.message : String(error);
};
export class GoADesignSystemServer {
    components = new Map();
    systemFiles = new Map();
    workflows = new Map(); // NEW: Add workflows storage
    masterIndex = null;
    initialized = false;
    async initialize() {
        if (this.initialized)
            return;
        try {
            await this.loadAllData();
            this.initialized = true;
            process.stderr.write(`GoA Design System data loaded successfully\n`);
            process.stderr.write(`Loaded ${this.components.size} components, ${this.systemFiles.size} system files, and ${this.workflows.size} workflows\n`);
        }
        catch (error) {
            process.stderr.write(`Failed to load component data: ${error}\n`);
            throw error;
        }
    }
    async loadAllData() {
        const dataDir = join(__dirname, "../data");
        const docsDir = join(__dirname, "../docs"); // NEW: Add docs directory
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
        // Load system files (layout.json, system-setup.json, etc.)
        const systemFiles = ["layout.json", "system-setup.json", "design-principles.json", "anti-patterns.json"];
        for (const fileName of systemFiles) {
            try {
                const filePath = join(dataDir, fileName);
                const fileData = await readFile(filePath, "utf8");
                const parsed = JSON.parse(fileData);
                this.systemFiles.set(fileName.replace(".json", ""), parsed);
                process.stderr.write(`Loaded ${fileName}\n`);
            }
            catch (error) {
                process.stderr.write(`Could not load ${fileName}: ${getErrorMessage(error)}\n`);
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
                        process.stderr.write(`Loaded workflow: ${file}\n`);
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
                        const componentName = componentData.componentName ||
                            file.replace("_consumer.json", "").replace(".json", "");
                        this.components.set(componentName, componentData);
                    }
                    catch (error) {
                        process.stderr.write(`Could not load component file ${file}: ${getErrorMessage(error)}\n`);
                    }
                }
            }
        }
        catch (error) {
            process.stderr.write(`Could not read components directory: ${getErrorMessage(error)}\n`);
        }
    }
    // UPDATED: Enhanced project_knowledge_search function
    async projectKnowledgeSearch(args) {
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
        // Design expert query detection
        const designExpertKeywords = [
            "review",
            "audit",
            "compliance",
            "accessibility",
            "governance",
            "anti-pattern",
            "best practice",
            "principles",
            "guidance",
            "expert",
            "onboarding",
            "team",
            "recommend",
            "pattern",
            "wcag",
            "citizen vs worker",
            "user type"
        ];
        const frameworkKeywords = ["react", "angular"];
        const isBuildRequest = buildKeywords.some((keyword) => queryLower.includes(keyword));
        const hasFramework = frameworkKeywords.some((keyword) => queryLower.includes(keyword));
        const isDesignExpertQuery = designExpertKeywords.some((keyword) => queryLower.includes(keyword));
        // If this is a design expert query, prioritize design principles and anti-patterns
        if (isDesignExpertQuery) {
            const designPrinciples = this.systemFiles.get("design-principles");
            const antiPatterns = this.systemFiles.get("anti-patterns");
            if (designPrinciples) {
                results.push({
                    type: "system",
                    name: "design-principles",
                    content: designPrinciples,
                    score: 160, // HIGHEST priority for design expert queries
                    reason: "Design principles and decision frameworks for expert guidance",
                });
            }
            if (antiPatterns) {
                results.push({
                    type: "system",
                    name: "anti-patterns",
                    content: antiPatterns,
                    score: 155, // Very high priority for design expert queries
                    reason: "Anti-patterns detection and prevention guidance",
                });
            }
        }
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
        const isFigmaQuery = figmaKeywords.some((keyword) => queryLower.includes(keyword));
        // If it's a Figma query, prioritize workflow documentation
        if (isFigmaQuery) {
            for (const [name, workflow] of this.workflows) {
                // More flexible trigger matching
                if (workflow.triggers?.some((trigger) => queryLower.includes(trigger.toLowerCase())) ||
                    // Also match if it's clearly a build request with framework
                    (isBuildRequest && hasFramework)) {
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
            if (component.tags?.some((tag) => tag.toLowerCase().includes(queryLower))) {
                score += 6;
            }
            // Search in AI tags
            if (component.aiTags?.some((tag) => tag.toLowerCase().includes(queryLower))) {
                score += 5;
            }
            // Search in description and purpose
            if (component.description?.toLowerCase().includes(queryLower) ||
                component.purpose?.toLowerCase().includes(queryLower)) {
                score += 4;
            }
            // Search in usage examples and installation
            if (component.installation) {
                const installationText = JSON.stringify(component.installation).toLowerCase();
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
            if (name.toLowerCase().includes(queryLower) ||
                systemFile.summary?.toLowerCase().includes(queryLower) ||
                systemFile.purpose?.toLowerCase().includes(queryLower)) {
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
                if (name.toLowerCase().includes(queryLower) ||
                    workflow.summary?.toLowerCase().includes(queryLower) ||
                    workflow.methodologyName?.toLowerCase().includes(queryLower)) {
                    score += 6;
                }
                // Search in workflow triggers and keywords
                if (workflow.triggers?.some((trigger) => trigger.toLowerCase().includes(queryLower))) {
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
                    text: JSON.stringify({
                        query,
                        resultsCount: sortedResults.length,
                        totalSearched: {
                            components: this.components.size,
                            systemFiles: this.systemFiles.size,
                            workflows: this.workflows.size,
                        },
                        figmaWorkflowDetected: isFigmaQuery,
                        buildRequestDetected: isBuildRequest,
                        designExpertQueryDetected: isDesignExpertQuery,
                        results: sortedResults.map((result) => ({
                            type: result.type,
                            name: result.name,
                            score: result.score,
                            reason: result.reason,
                            summary: result.content.summary ||
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
                        searchTip: sortedResults.length === 0
                            ? `No matches found for "${query}". Try terms like "form", "layout", "button", "figma", or "design conversion".`
                            : undefined,
                    }, null, 2),
                },
            ],
        };
    }
    async searchComponents(args) {
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
            if (component.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))) {
                score += 6;
            }
            // Search in description
            if (component.description?.toLowerCase().includes(query.toLowerCase())) {
                score += 4;
            }
            // Search in usage patterns and examples
            if (component.installation) {
                const installationText = JSON.stringify(component.installation).toLowerCase();
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
                if (!component.tags?.some((tag) => tags.includes(tag))) {
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
                    text: JSON.stringify({
                        query,
                        resultsCount: sortedResults.length,
                        totalComponents: this.components.size,
                        results: sortedResults,
                        searchTip: sortedResults.length === 0
                            ? `No components found for "${query}". Try broader terms like "form", "layout", "button", or "navigation".`
                            : undefined,
                    }, null, 2),
                },
            ],
        };
    }
    async getComponentDetails(args) {
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
                    if (key.toLowerCase() === variation ||
                        key.replace(/[-_]/g, "").toLowerCase() === variation) {
                        component = comp;
                        break;
                    }
                }
                if (component)
                    break;
            }
        }
        if (!component) {
            // Provide helpful suggestions
            const suggestions = Array.from(this.components.keys())
                .filter((name) => name.toLowerCase().includes(componentName.toLowerCase().slice(0, 3)))
                .slice(0, 5);
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
    async getUsagePatterns(args) {
        const { scenario, components } = args;
        // Look for patterns in the master index
        const patterns = this.masterIndex?.usagePatterns?.["common-combinations"] || [];
        const matchingPatterns = patterns.filter((pattern) => {
            // Search by scenario description
            if (pattern.description?.toLowerCase().includes(scenario.toLowerCase()) ||
                pattern.useCase?.toLowerCase().includes(scenario.toLowerCase()) ||
                pattern.name?.toLowerCase().includes(scenario.toLowerCase())) {
                return true;
            }
            // Search by specific components
            if (components && components.length > 0) {
                return components.some((comp) => pattern.components?.some((patternComp) => patternComp.toLowerCase().includes(comp.toLowerCase())));
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
                    text: JSON.stringify({
                        scenario,
                        matchingPatterns,
                        totalPatterns: patterns.length,
                        layoutGuidance: layoutGuidance?.summary ||
                            "See layout.json for page structure guidance",
                        setupGuidance: setupGuidance?.summary ||
                            "See system-setup.json for installation instructions",
                        relatedSystemFiles: {
                            layout: layoutGuidance ? "Available" : "Not loaded",
                            setup: setupGuidance ? "Available" : "Not loaded",
                        },
                    }, null, 2),
                },
            ],
        };
    }
    async giveFeedback(args) {
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
        // Store feedback persistently
        try {
            await this.storeFeedback(feedback);
            process.stderr.write(`Feedback collected and stored: ${feedback.id}\n`);
        }
        catch (error) {
            process.stderr.write(`Error storing feedback: ${getErrorMessage(error)}\n`);
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        status: "success",
                        message: "Feedback collected successfully! Thank you for helping improve the GoA Design System.",
                        feedbackId: feedback.id,
                        nextSteps: "The design system team will review your feedback and may reach out for clarification.",
                        component: this.components.has(componentName)
                            ? `Component '${componentName}' found in system`
                            : `Component '${componentName}' not found - this feedback will help us identify gaps`,
                    }, null, 2),
                },
            ],
        };
    }
    async storeFeedback(feedback) {
        const feedbackFile = join(__dirname, "../feedback-log.json");
        try {
            // Check if file exists
            await access(feedbackFile);
            // File exists, read current content
            const existingData = await readFile(feedbackFile, "utf8");
            const feedbackLog = JSON.parse(existingData);
            // Add new feedback
            feedbackLog.feedback.push(feedback);
            feedbackLog.totalFeedback = feedbackLog.feedback.length;
            feedbackLog.lastUpdated = new Date().toISOString();
            // Write back to file
            await writeFile(feedbackFile, JSON.stringify(feedbackLog, null, 2));
        }
        catch (error) {
            // File doesn't exist, create new one
            const newFeedbackLog = {
                version: "1.0",
                created: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                totalFeedback: 1,
                feedback: [feedback]
            };
            await writeFile(feedbackFile, JSON.stringify(newFeedbackLog, null, 2));
        }
    }
    async getFeedback(args) {
        const { limit = 10, componentName, feedbackType, unread = false } = args;
        const feedbackFile = join(__dirname, "../feedback-log.json");
        try {
            await access(feedbackFile);
            const data = await readFile(feedbackFile, "utf8");
            const feedbackLog = JSON.parse(data);
            let filteredFeedback = feedbackLog.feedback || [];
            // Filter by component if specified
            if (componentName) {
                filteredFeedback = filteredFeedback.filter((f) => f.componentName?.toLowerCase().includes(componentName.toLowerCase()));
            }
            // Filter by type if specified
            if (feedbackType) {
                filteredFeedback = filteredFeedback.filter((f) => f.feedbackType === feedbackType);
            }
            // Sort by timestamp (newest first) and limit
            const sortedFeedback = filteredFeedback
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, limit);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            totalFeedback: feedbackLog.totalFeedback || 0,
                            filteredCount: filteredFeedback.length,
                            showing: sortedFeedback.length,
                            filters: { componentName, feedbackType, limit },
                            lastUpdated: feedbackLog.lastUpdated,
                            feedback: sortedFeedback,
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
                            status: "error",
                            message: "No feedback file found. Submit some feedback first using give_feedback.",
                            error: getErrorMessage(error)
                        }, null, 2),
                    },
                ],
            };
        }
    }
    async getFeedbackSummary(args) {
        const feedbackFile = join(__dirname, "../feedback-log.json");
        try {
            await access(feedbackFile);
            const data = await readFile(feedbackFile, "utf8");
            const feedbackLog = JSON.parse(data);
            const feedback = feedbackLog.feedback || [];
            // Analyze feedback patterns
            const componentCounts = {};
            const typeCounts = {};
            const teamCounts = {};
            const recentFeedback = feedback.filter((f) => {
                const feedbackDate = new Date(f.timestamp);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return feedbackDate > sevenDaysAgo;
            });
            feedback.forEach((f) => {
                componentCounts[f.componentName] = (componentCounts[f.componentName] || 0) + 1;
                typeCounts[f.feedbackType] = (typeCounts[f.feedbackType] || 0) + 1;
                teamCounts[f.userTeam] = (teamCounts[f.userTeam] || 0) + 1;
            });
            // Sort by count
            const topComponents = Object.entries(componentCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);
            const topTypes = Object.entries(typeCounts)
                .sort(([, a], [, b]) => b - a);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            totalFeedback: feedback.length,
                            recentFeedback: recentFeedback.length,
                            created: feedbackLog.created,
                            lastUpdated: feedbackLog.lastUpdated,
                            topComponents: topComponents.map(([name, count]) => ({ component: name, count })),
                            feedbackTypes: topTypes.map(([type, count]) => ({ type, count })),
                            activeTeams: Object.keys(teamCounts).length,
                            teamBreakdown: teamCounts
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
                            status: "error",
                            message: "No feedback file found. Submit some feedback first using give_feedback.",
                            error: getErrorMessage(error)
                        }, null, 2),
                    },
                ],
            };
        }
    }
    // NEW: Design Expert Functions
    async designReview(args) {
        const { designDescription, framework, userType = "citizen", components = [] } = args;
        // Note: This function reviews existing designs with guidance and recommendations.
        // Layout and component structure are "recommended" for reviews but "critical" for new implementations.
        const reviewResults = {
            timestamp: new Date().toISOString(),
            designDescription,
            framework,
            userType,
            components,
            compliance: {
                goaStandards: [],
                accessibility: [],
                userExperience: [],
                technicalImplementation: []
            },
            recommendations: [],
            risks: [],
            antiPatternsDetected: [],
            score: 0
        };
        // Load anti-patterns database for detection
        const antiPatterns = this.systemFiles.get("anti-patterns");
        const designPrinciples = this.systemFiles.get("design-principles");
        // GoA Standards Review
        const goaStandardChecks = [
            {
                check: "OneColumnLayout Usage",
                passed: designDescription.toLowerCase().includes("layout") ||
                    designDescription.toLowerCase().includes("page structure"),
                message: "Consider using GoabOneColumnLayout for consistent government page structure (critical for new implementations)",
                critical: false // Not critical for design review, but critical for generation
            },
            {
                check: "Government Branding",
                passed: designDescription.toLowerCase().includes("header") ||
                    designDescription.toLowerCase().includes("goa") ||
                    components.some((comp) => comp.toLowerCase().includes("header")),
                message: "Pages should include GoabMicrositeHeader and GoabAppHeader for consistent branding",
                critical: true
            },
            {
                check: "Component-First Approach",
                passed: components.length > 0 || designDescription.toLowerCase().includes("component"),
                message: "Consider using existing GoA components rather than custom implementations (critical for new implementations)",
                critical: false // Not critical for design review, but critical for generation
            }
        ];
        reviewResults.compliance.goaStandards = goaStandardChecks;
        // Accessibility Review
        const accessibilityChecks = [
            {
                check: "Form Labels",
                passed: !designDescription.toLowerCase().includes("form") ||
                    designDescription.toLowerCase().includes("label") ||
                    components.some((comp) => comp.toLowerCase().includes("formitem")),
                message: "All form inputs must be wrapped with GoabFormItem for proper labeling",
                wcagLevel: "AA"
            },
            {
                check: "Color Contrast",
                passed: true, // GoA components handle this automatically
                message: "GoA components provide WCAG 2.2 AA compliant contrast ratios",
                wcagLevel: "AA"
            },
            {
                check: "Keyboard Navigation",
                passed: true, // GoA components handle this automatically
                message: "GoA components support full keyboard navigation",
                wcagLevel: "AA"
            }
        ];
        reviewResults.compliance.accessibility = accessibilityChecks;
        // User Experience Review (Citizen vs Worker patterns)
        const uxChecks = userType === "citizen" ? [
            {
                check: "One Question Per Page",
                passed: designDescription.toLowerCase().includes("one question") ||
                    designDescription.toLowerCase().includes("single question"),
                message: "Citizen-facing forms should present one question per page for cognitive load reduction",
                userType: "citizen"
            },
            {
                check: "Clear Progress Indication",
                passed: designDescription.toLowerCase().includes("progress") ||
                    components.some((comp) => comp.toLowerCase().includes("progress")),
                message: "Multi-step citizen processes should show clear progress indicators",
                userType: "citizen"
            },
            {
                check: "Plain Language",
                passed: designDescription.toLowerCase().includes("plain") ||
                    designDescription.toLowerCase().includes("simple"),
                message: "Use plain language appropriate for grade 9 reading level",
                userType: "citizen"
            }
        ] : [
            {
                check: "Information Density",
                passed: designDescription.toLowerCase().includes("table") ||
                    designDescription.toLowerCase().includes("dashboard") ||
                    designDescription.toLowerCase().includes("overview"),
                message: "Worker interfaces can display more information density for efficiency",
                userType: "worker"
            },
            {
                check: "Batch Operations",
                passed: designDescription.toLowerCase().includes("batch") ||
                    designDescription.toLowerCase().includes("multiple") ||
                    components.some((comp) => comp.toLowerCase().includes("checkbox")),
                message: "Worker tools should support bulk operations where appropriate",
                userType: "worker"
            }
        ];
        reviewResults.compliance.userExperience = uxChecks;
        // Technical Implementation Review
        const techChecks = [
            {
                check: "Framework Consistency",
                passed: framework === "react" || framework === "angular",
                message: framework ? `${framework} is supported` : "Specify React or Angular for proper implementation guidance",
                severity: framework ? "info" : "warning"
            },
            {
                check: "Component Import Strategy",
                passed: components.length > 0,
                message: "List specific components for import optimization guidance",
                severity: components.length > 0 ? "info" : "warning"
            }
        ];
        reviewResults.compliance.technicalImplementation = techChecks;
        // Anti-pattern Detection
        if (antiPatterns?.detectionRules) {
            const detectedAntiPatterns = [];
            // Check design anti-patterns
            for (const pattern of antiPatterns.detectionRules.designAntiPatterns || []) {
                let detected = false;
                let detectionReason = "";
                if (pattern.id === "custom-over-goa") {
                    detected = components.some((comp) => comp.toLowerCase().includes("custom"));
                    detectionReason = "Custom components detected - consider GoA alternatives for new implementations";
                }
                else if (pattern.id === "wrong-user-pattern") {
                    if (userType === "citizen" && (designDescription.toLowerCase().includes("dashboard") ||
                        designDescription.toLowerCase().includes("bulk") ||
                        designDescription.toLowerCase().includes("table"))) {
                        detected = true;
                        detectionReason = "Dashboard/bulk operation patterns detected for citizen interface";
                    }
                    else if (userType === "worker" && (designDescription.toLowerCase().includes("one question") ||
                        designDescription.toLowerCase().includes("simple form"))) {
                        detected = true;
                        detectionReason = "Simplified citizen patterns detected for worker interface";
                    }
                }
                else if (pattern.id === "layout-inconsistency") {
                    detected = !designDescription.toLowerCase().includes("onecolumnlayout") &&
                        !components.some((comp) => comp.toLowerCase().includes("layout"));
                    detectionReason = "Missing GoabOneColumnLayout - recommended for consistency (critical for new implementations)";
                }
                if (detected) {
                    detectedAntiPatterns.push({
                        id: pattern.id,
                        name: pattern.name,
                        severity: pattern.severity,
                        reason: detectionReason,
                        impact: pattern.impact,
                        solution: pattern.solution
                    });
                }
            }
            // Check technical anti-patterns
            for (const pattern of antiPatterns.detectionRules.technicalAntiPatterns || []) {
                let detected = false;
                let detectionReason = "";
                if (pattern.id === "framework-mixing") {
                    // This would require actual code analysis, so we'll check description
                    detected = designDescription.toLowerCase().includes("react") &&
                        designDescription.toLowerCase().includes("angular");
                    detectionReason = "Multiple frameworks mentioned in description";
                }
                else if (pattern.id === "custom-styling") {
                    detected = designDescription.toLowerCase().includes("custom css") ||
                        designDescription.toLowerCase().includes("override");
                    detectionReason = "Custom styling mentioned in description";
                }
                if (detected) {
                    detectedAntiPatterns.push({
                        id: pattern.id,
                        name: pattern.name,
                        severity: pattern.severity,
                        reason: detectionReason,
                        impact: pattern.impact,
                        solution: pattern.solution
                    });
                }
            }
            reviewResults.antiPatternsDetected = detectedAntiPatterns;
        }
        // Generate recommendations
        const allChecks = [
            ...goaStandardChecks,
            ...accessibilityChecks,
            ...uxChecks,
            ...techChecks
        ];
        const failedChecks = allChecks.filter(check => !check.passed);
        reviewResults.recommendations = [
            ...failedChecks.map((check) => ({
                type: check.critical ? "critical" : "improvement",
                message: check.message,
                category: check.wcagLevel ? "accessibility" : check.userType ? "user-experience" : "implementation"
            })),
            ...reviewResults.antiPatternsDetected.map((antiPattern) => ({
                type: antiPattern.severity === "critical" ? "critical" : antiPattern.severity === "high" ? "critical" : "improvement",
                message: `Anti-pattern detected: ${antiPattern.name} - ${antiPattern.solution.immediate}`,
                category: "anti-pattern",
                antiPatternId: antiPattern.id
            }))
        ];
        // Calculate score (0-100)
        const totalChecks = allChecks.length;
        const passedChecks = allChecks.filter(check => check.passed).length;
        reviewResults.score = Math.round((passedChecks / totalChecks) * 100);
        // Identify risks
        const criticalFailures = failedChecks.filter((check) => check.critical);
        reviewResults.risks = criticalFailures.map((check) => ({
            level: "high",
            description: check.message,
            impact: "May not meet government service standards"
        }));
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(reviewResults, null, 2)
                }
            ]
        };
    }
    async recommendPatterns(args) {
        const { scenario, userType = "citizen", complexity = "medium", dataType = "form" } = args;
        const recommendations = {
            timestamp: new Date().toISOString(),
            scenario,
            userType,
            complexity,
            dataType,
            primaryPattern: null,
            alternativePatterns: [],
            requiredComponents: [],
            layoutStructure: null,
            implementationNotes: []
        };
        // Find matching recipes/patterns
        const matchingRecipes = [];
        for (const [name, recipe] of this.workflows) {
            if (recipe.triggers?.some((trigger) => scenario.toLowerCase().includes(trigger.toLowerCase()))) {
                matchingRecipes.push({ name, recipe });
            }
        }
        // Search through component data for relevant patterns
        const relevantComponents = [];
        for (const [name, component] of this.components) {
            if (component.commonUse?.some((use) => scenario.toLowerCase().includes(use.toLowerCase())) || component.aiTags?.some((tag) => scenario.toLowerCase().includes(tag.toLowerCase()))) {
                relevantComponents.push({ name, component });
            }
        }
        // Generate recommendations based on user type and scenario
        if (userType === "citizen") {
            if (scenario.toLowerCase().includes("form") || dataType === "form") {
                recommendations.primaryPattern = {
                    name: "Citizen Form Pattern",
                    description: "One question per page with clear progress indication",
                    components: ["GoabOneColumnLayout", "GoabFormItem", "GoabInput", "GoabButton"],
                    layout: "Question page with single focus"
                };
            }
            else if (scenario.toLowerCase().includes("information") || scenario.toLowerCase().includes("display")) {
                recommendations.primaryPattern = {
                    name: "Information Display Pattern",
                    description: "Clear, scannable information presentation",
                    components: ["GoabOneColumnLayout", "GoabContainer", "GoabText", "GoabCallout"],
                    layout: "Content-focused with clear hierarchy"
                };
            }
        }
        else if (userType === "worker") {
            if (scenario.toLowerCase().includes("dashboard") || scenario.toLowerCase().includes("overview")) {
                recommendations.primaryPattern = {
                    name: "Worker Dashboard Pattern",
                    description: "Information-dense interface with bulk operations",
                    components: ["GoabOneColumnLayout", "GoabTable", "GoabCheckbox", "GoabDropdown", "GoabBadge"],
                    layout: "Multi-column with actionable data"
                };
            }
            else if (scenario.toLowerCase().includes("case") || scenario.toLowerCase().includes("management")) {
                recommendations.primaryPattern = {
                    name: "Case Management Pattern",
                    description: "Detailed view with actions and status tracking",
                    components: ["GoabOneColumnLayout", "GoabTabs", "GoabContainer", "GoabButton", "GoabBadge"],
                    layout: "Tabbed interface with contextual actions"
                };
            }
        }
        // Add layout structure guidance
        recommendations.layoutStructure = {
            required: "GoabOneColumnLayout",
            header: "GoabMicrositeHeader + GoabAppHeader",
            content: "GoabPageBlock with appropriate components",
            footer: "GoabAppFooter",
            spacing: "Use component margins (mb, mt, ml, mr) over GoabSpacer when possible"
        };
        // Add implementation notes
        recommendations.implementationNotes = [
            "Always use GoabOneColumnLayout for government pages",
            "Wrap form inputs with GoabFormItem for accessibility",
            "Use GoA spacing tokens for consistent layout",
            "Consider mobile-first responsive design",
            userType === "citizen" ? "Optimize for infrequent users" : "Optimize for efficiency and bulk operations"
        ];
        // Include matching recipes if found
        if (matchingRecipes.length > 0) {
            recommendations.alternativePatterns = matchingRecipes.map(recipe => ({
                name: recipe.name,
                description: recipe.recipe.summary || recipe.recipe.methodologyName,
                source: "existing-recipe"
            }));
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(recommendations, null, 2)
                }
            ]
        };
    }
    async accessibilityAudit(args) {
        const { designDescription, components = [], framework } = args;
        const auditResults = {
            timestamp: new Date().toISOString(),
            designDescription,
            components,
            framework,
            wcagLevel: "AA",
            compliance: {
                level: "unknown",
                score: 0,
                passedChecks: 0,
                totalChecks: 0
            },
            checks: [],
            recommendations: [],
            governmentRequirements: []
        };
        // WCAG 2.2 AA Compliance Checks
        const wcagChecks = [
            {
                criterion: "1.1.1 Non-text Content",
                status: "pass",
                message: "GoA components provide alt text for images and meaningful labels",
                automatic: true
            },
            {
                criterion: "1.3.1 Info and Relationships",
                status: designDescription.toLowerCase().includes("form") &&
                    components.some((comp) => comp.toLowerCase().includes("formitem")) ? "pass" : "review",
                message: "Form inputs must use GoabFormItem for proper labeling relationship",
                automatic: false
            },
            {
                criterion: "1.4.3 Contrast (Minimum)",
                status: "pass",
                message: "GoA components meet WCAG 2.2 AA contrast requirements",
                automatic: true
            },
            {
                criterion: "1.4.10 Reflow",
                status: "pass",
                message: "GoA components support responsive design and 320px viewport",
                automatic: true
            },
            {
                criterion: "2.1.1 Keyboard",
                status: "pass",
                message: "GoA components are fully keyboard accessible",
                automatic: true
            },
            {
                criterion: "2.1.4 Character Key Shortcuts",
                status: "pass",
                message: "GoA components handle keyboard shortcuts appropriately",
                automatic: true
            },
            {
                criterion: "2.4.3 Focus Order",
                status: "pass",
                message: "GoA components maintain logical focus order",
                automatic: true
            },
            {
                criterion: "3.1.1 Language of Page",
                status: "review",
                message: "Ensure HTML lang attribute is set (not handled by components)",
                automatic: false
            },
            {
                criterion: "3.2.1 On Focus",
                status: "pass",
                message: "GoA components don't cause unexpected context changes",
                automatic: true
            },
            {
                criterion: "4.1.1 Parsing",
                status: "pass",
                message: "GoA components generate valid HTML",
                automatic: true
            },
            {
                criterion: "4.1.2 Name, Role, Value",
                status: "pass",
                message: "GoA components provide appropriate ARIA attributes",
                automatic: true
            }
        ];
        auditResults.checks = wcagChecks;
        // Government-specific requirements
        const governmentChecks = [
            {
                requirement: "Plain Language",
                status: "review",
                message: "Content should be written at grade 9 reading level",
                reference: "Treasury Board Web Standards"
            },
            {
                requirement: "Official Languages",
                status: "review",
                message: "Consider French translation requirements for federal content",
                reference: "Official Languages Act"
            },
            {
                requirement: "Mobile-First Design",
                status: "pass",
                message: "GoA components are mobile-responsive by default",
                reference: "Government of Canada Digital Standards"
            }
        ];
        auditResults.governmentRequirements = governmentChecks;
        // Calculate compliance score
        const passedChecks = wcagChecks.filter(check => check.status === "pass").length;
        const totalChecks = wcagChecks.length;
        auditResults.compliance.score = Math.round((passedChecks / totalChecks) * 100);
        auditResults.compliance.passedChecks = passedChecks;
        auditResults.compliance.totalChecks = totalChecks;
        auditResults.compliance.level = auditResults.compliance.score >= 95 ? "excellent" :
            auditResults.compliance.score >= 80 ? "good" :
                auditResults.compliance.score >= 60 ? "fair" : "needs-improvement";
        // Generate recommendations
        const failedChecks = wcagChecks.filter(check => check.status === "fail");
        const reviewChecks = wcagChecks.filter(check => check.status === "review");
        auditResults.recommendations = [
            ...failedChecks.map(check => ({
                priority: "high",
                type: "compliance-issue",
                message: check.message,
                criterion: check.criterion
            })),
            ...reviewChecks.map(check => ({
                priority: "medium",
                type: "manual-review",
                message: check.message,
                criterion: check.criterion
            }))
        ];
        // Add GoA-specific recommendations
        if (!designDescription.toLowerCase().includes("layout")) {
            auditResults.recommendations.push({
                priority: "high",
                type: "goa-standard",
                message: "Use GoabOneColumnLayout for consistent government page structure",
                criterion: "GoA Layout Standards"
            });
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(auditResults, null, 2)
                }
            ]
        };
    }
    async governanceCheck(args) {
        const { projectName, components = [], framework, teamSize = 1 } = args;
        const governanceResults = {
            timestamp: new Date().toISOString(),
            projectName,
            components,
            framework,
            teamSize,
            compliance: {
                designSystemUsage: 0,
                standardsCompliance: 0,
                maintenanceRisk: "low",
                overallScore: 0
            },
            findings: [],
            recommendations: [],
            riskAssessment: []
        };
        // Design System Usage Analysis
        const dsUsageChecks = [
            {
                check: "Component Library Usage",
                passed: components.length > 0,
                message: "Project should use GoA components rather than custom implementations",
                weight: 20
            },
            {
                check: "Layout Consistency",
                passed: components.some((comp) => comp.toLowerCase().includes("layout")),
                message: "Use GoabOneColumnLayout for consistent government page structure",
                weight: 15
            },
            {
                check: "Form Standards",
                passed: !components.some((comp) => comp.toLowerCase().includes("input")) ||
                    components.some((comp) => comp.toLowerCase().includes("formitem")),
                message: "Form inputs must be wrapped with GoabFormItem",
                weight: 10
            },
            {
                check: "Navigation Standards",
                passed: !components.some((comp) => comp.toLowerCase().includes("link")) ||
                    components.some((comp) => comp.toLowerCase().includes("header")),
                message: "Include proper navigation structure with GoabAppHeader",
                weight: 10
            }
        ];
        // Calculate design system usage score
        const dsUsageScore = dsUsageChecks.reduce((score, check) => {
            return score + (check.passed ? check.weight : 0);
        }, 0);
        governanceResults.compliance.designSystemUsage = Math.min(100, dsUsageScore);
        // Standards Compliance
        const standardsChecks = [
            {
                check: "Framework Consistency",
                passed: framework === "react" || framework === "angular",
                message: "Use supported frameworks (React or Angular)",
                impact: "medium"
            },
            {
                check: "Government Branding",
                passed: components.some((comp) => comp.toLowerCase().includes("header") || comp.toLowerCase().includes("footer")),
                message: "Include GoabMicrositeHeader and GoabAppFooter for government branding",
                impact: "high"
            },
            {
                check: "Accessibility Standards",
                passed: !components.some((comp) => comp.toLowerCase().includes("custom")),
                message: "Avoid custom components that may not meet WCAG 2.2 AA standards",
                impact: "high"
            }
        ];
        governanceResults.compliance.standardsCompliance = Math.round((standardsChecks.filter(check => check.passed).length / standardsChecks.length) * 100);
        // Maintenance Risk Assessment
        const customComponents = components.filter((comp) => comp.toLowerCase().includes("custom"));
        const complexComponents = components.filter((comp) => comp.toLowerCase().includes("table") || comp.toLowerCase().includes("form"));
        let maintenanceRisk = "low";
        if (customComponents.length > 2 || teamSize < 2) {
            maintenanceRisk = "high";
        }
        else if (customComponents.length > 0 || complexComponents.length > 5) {
            maintenanceRisk = "medium";
        }
        governanceResults.compliance.maintenanceRisk = maintenanceRisk;
        // Overall Score
        governanceResults.compliance.overallScore = Math.round((governanceResults.compliance.designSystemUsage +
            governanceResults.compliance.standardsCompliance) / 2);
        // Generate findings
        const failedChecks = [...dsUsageChecks, ...standardsChecks].filter(check => !check.passed);
        governanceResults.findings = failedChecks.map((check) => ({
            type: "compliance-gap",
            message: check.message,
            impact: check.impact || "medium",
            recommendation: "Use GoA Design System components"
        }));
        // Risk Assessment
        if (maintenanceRisk === "high") {
            governanceResults.riskAssessment.push({
                risk: "High Maintenance Burden",
                description: "Too many custom components or insufficient team size",
                mitigation: "Reduce custom components, increase team size, or add design system expertise"
            });
        }
        if (governanceResults.compliance.overallScore < 70) {
            governanceResults.riskAssessment.push({
                risk: "Design System Compliance",
                description: "Low adherence to GoA Design System standards",
                mitigation: "Increase use of GoA components and follow established patterns"
            });
        }
        // Generate recommendations
        governanceResults.recommendations = [
            {
                priority: "high",
                category: "design-system",
                message: "Increase usage of GoA components to improve consistency and reduce maintenance",
                actionItems: [
                    "Audit current custom components",
                    "Replace with GoA equivalents where possible",
                    "Document any unavoidable custom components"
                ]
            },
            {
                priority: "medium",
                category: "team-process",
                message: "Establish design system review process",
                actionItems: [
                    "Add design system expert to team",
                    "Include GoA compliance in code review",
                    "Set up automated component usage tracking"
                ]
            }
        ];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(governanceResults, null, 2)
                }
            ]
        };
    }
    async teamOnboarding(args) {
        const { teamType = "development", experience = "beginner", projectType = "citizen-service", framework } = args;
        const onboardingPlan = {
            timestamp: new Date().toISOString(),
            teamType,
            experience,
            projectType,
            framework,
            learningPath: [],
            keyResources: [],
            practiceExercises: [],
            checkpoints: [],
            support: []
        };
        // Customize learning path based on team type and experience
        if (teamType === "development") {
            if (experience === "beginner") {
                onboardingPlan.learningPath = [
                    {
                        phase: "Foundation",
                        duration: "Week 1-2",
                        topics: [
                            "GoA Design System principles",
                            "Component library overview",
                            "Setup and installation",
                            "Basic layout patterns"
                        ]
                    },
                    {
                        phase: "Implementation",
                        duration: "Week 3-4",
                        topics: [
                            "Form patterns and validation",
                            "Navigation and layout",
                            "Accessibility requirements",
                            "Framework-specific implementation"
                        ]
                    },
                    {
                        phase: "Advanced",
                        duration: "Week 5-6",
                        topics: [
                            "Complex component combinations",
                            "Custom styling guidelines",
                            "Performance optimization",
                            "Testing strategies"
                        ]
                    }
                ];
            }
            else {
                onboardingPlan.learningPath = [
                    {
                        phase: "Quick Start",
                        duration: "Week 1",
                        topics: [
                            "GoA vs other design systems",
                            "Government-specific requirements",
                            "Advanced component patterns",
                            "Migration strategies"
                        ]
                    }
                ];
            }
        }
        else if (teamType === "design") {
            onboardingPlan.learningPath = [
                {
                    phase: "Design Principles",
                    duration: "Week 1",
                    topics: [
                        "Government service design principles",
                        "Citizen vs Worker patterns",
                        "Accessibility requirements",
                        "Content and UX guidelines"
                    ]
                },
                {
                    phase: "Component Usage",
                    duration: "Week 2",
                    topics: [
                        "When to use which components",
                        "Layout and spacing guidelines",
                        "Color and typography system",
                        "Icon and imagery standards"
                    ]
                }
            ];
        }
        // Key Resources
        onboardingPlan.keyResources = [
            {
                name: "GoA Design System Documentation",
                url: "https://design.alberta.ca",
                type: "primary",
                description: "Official component library and guidelines"
            },
            {
                name: "Component Examples",
                location: "data/recipes/",
                type: "examples",
                description: "71 real-world implementation patterns"
            },
            {
                name: "Government Service Standards",
                type: "standards",
                description: "Accessibility, branding, and compliance requirements"
            }
        ];
        // Practice Exercises
        if (projectType === "citizen-service") {
            onboardingPlan.practiceExercises = [
                {
                    name: "Simple Form",
                    description: "Build a citizen registration form with validation",
                    components: ["GoabFormItem", "GoabInput", "GoabButton"],
                    difficulty: "beginner"
                },
                {
                    name: "Multi-step Process",
                    description: "Create a multi-page application with progress tracking",
                    components: ["GoabFormStepper", "GoabContainer", "GoabButton"],
                    difficulty: "intermediate"
                }
            ];
        }
        else if (projectType === "worker-tool") {
            onboardingPlan.practiceExercises = [
                {
                    name: "Dashboard Interface",
                    description: "Build a worker dashboard with data tables and actions",
                    components: ["GoabTable", "GoabCheckbox", "GoabBadge", "GoabDropdown"],
                    difficulty: "intermediate"
                },
                {
                    name: "Case Management",
                    description: "Create a case review interface with tabs and actions",
                    components: ["GoabTabs", "GoabContainer", "GoabButton", "GoabCallout"],
                    difficulty: "advanced"
                }
            ];
        }
        // Checkpoints
        onboardingPlan.checkpoints = [
            {
                milestone: "Component Setup",
                criteria: "Successfully install and import GoA components",
                timeframe: "End of Week 1"
            },
            {
                milestone: "First Implementation",
                criteria: "Build a functional page using GoA components",
                timeframe: "End of Week 2"
            },
            {
                milestone: "Pattern Mastery",
                criteria: "Implement appropriate patterns for user type",
                timeframe: "End of Week 4"
            }
        ];
        // Support Resources
        onboardingPlan.support = [
            {
                type: "documentation",
                resource: "Built-in MCP assistance",
                description: "Ask questions about components and patterns"
            },
            {
                type: "community",
                resource: "GoA Design System Team",
                description: "Feedback and guidance from the design system team"
            },
            {
                type: "examples",
                resource: "Recipe Library",
                description: "71 implementation patterns for common scenarios"
            }
        ];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(onboardingPlan, null, 2)
                }
            ]
        };
    }
}
//# sourceMappingURL=server.js.map