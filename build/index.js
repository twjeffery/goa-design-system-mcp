#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { GoADesignSystemServer } from "./server.js";
async function main() {
    const server = new Server({
        name: "goa-design-system-mcp",
        version: "1.0.0",
    }, {
        capabilities: {
            tools: {},
        },
    });
    const goaServer = new GoADesignSystemServer();
    await goaServer.initialize();
    // Handle tool listing
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: "search_components",
                    description: "Search GoA Design System components by name, use case, or functionality",
                    inputSchema: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "Search query (component name, use case, or functionality)",
                            },
                            category: {
                                type: "string",
                                description: "Filter by category (forms, navigation, layout, etc.)",
                                enum: [
                                    "forms",
                                    "navigation",
                                    "layout",
                                    "feedback",
                                    "data-display",
                                    "overlay",
                                    "specialized",
                                ],
                            },
                            tags: {
                                type: "array",
                                items: { type: "string" },
                                description: "Filter by specific tags",
                            },
                            limit: {
                                type: "number",
                                description: "Maximum number of results to return (default: 10)",
                                default: 10,
                            },
                        },
                        required: ["query"],
                    },
                },
                {
                    name: "get_component_details",
                    description: "Get complete details for a specific GoA component",
                    inputSchema: {
                        type: "object",
                        properties: {
                            componentName: {
                                type: "string",
                                description: 'Name of the component (e.g., "button", "input", "modal")',
                            },
                            framework: {
                                type: "string",
                                description: "Get framework-specific examples",
                                enum: ["react", "angular", "svelte", "web-component"],
                            },
                        },
                        required: ["componentName"],
                    },
                },
                {
                    name: "get_usage_patterns",
                    description: "Get common usage patterns and component combinations",
                    inputSchema: {
                        type: "object",
                        properties: {
                            scenario: {
                                type: "string",
                                description: 'Usage scenario (e.g., "form layout", "data table", "user profile")',
                            },
                            components: {
                                type: "array",
                                items: { type: "string" },
                                description: "Specific components to find patterns for",
                            },
                        },
                        required: ["scenario"],
                    },
                },
                {
                    name: "collect_feedback",
                    description: "Collect feedback about component usage or missing information",
                    inputSchema: {
                        type: "object",
                        properties: {
                            componentName: {
                                type: "string",
                                description: "Component the feedback relates to",
                            },
                            feedbackType: {
                                type: "string",
                                description: "Type of feedback",
                                enum: [
                                    "missing_example",
                                    "unclear_documentation",
                                    "bug_report",
                                    "feature_request",
                                    "usage_question",
                                ],
                            },
                            description: {
                                type: "string",
                                description: "Detailed feedback description",
                            },
                            userTeam: {
                                type: "string",
                                description: "Team providing the feedback (optional)",
                            },
                        },
                        required: ["componentName", "feedbackType", "description"],
                    },
                },
            ],
        };
    });
    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            switch (name) {
                case "search_components":
                    return await goaServer.searchComponents(args);
                case "get_component_details":
                    return await goaServer.getComponentDetails(args);
                case "get_usage_patterns":
                    return await goaServer.getUsagePatterns(args);
                case "collect_feedback":
                    return await goaServer.collectFeedback(args);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                    },
                ],
            };
        }
    });
    // Start the server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 GoA Design System MCP Server running on stdio");
}
main().catch((error) => {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map