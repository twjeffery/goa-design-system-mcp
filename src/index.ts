#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { OptimizedGoADesignSystemServer } from "./optimized-server.js";

async function main() {
  const server = new Server(
    {
      name: "goa-design-system-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const goaServer = new OptimizedGoADesignSystemServer();
  await goaServer.initialize();

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "project_knowledge_search",
          description:
            "PRIMARY SEARCH: Search all GoA Design System knowledge including components, workflows (like Figma-to-code), layout patterns, system setup, and implementation methodologies. Use this for any GoA Design System question.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "Search query for any GoA Design System information: components, workflows, figma conversion, layout patterns, setup guides, etc.",
              },
              max_text_results: {
                type: "number",
                description: "Maximum number of text results to return",
                default: 8,
              },
              max_image_results: {
                type: "number",
                description: "Maximum number of image results to return",
                default: 2,
              },
            },
            required: ["query"],
          },
        },
        {
          name: "search_components",
          description:
            "SPECIALIZED: Search only GoA components by name or functionality. Use project_knowledge_search for broader queries.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Component-specific search query",
              },
              category: {
                type: "string",
                description: "Filter by category",
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
                description:
                  "Maximum number of results to return (default: 10)",
                default: 10,
              },
            },
            required: ["query"],
          },
        },
        {
          name: "get_component_details",
          description:
            "SPECIALIZED: Get complete details for a specific GoA component after you know its exact name",
          inputSchema: {
            type: "object",
            properties: {
              componentName: {
                type: "string",
                description:
                  'Exact component name (e.g., "button", "input", "modal")',
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
          description:
            "SPECIALIZED: Get usage patterns for specific scenarios. Use project_knowledge_search for workflow information.",
          inputSchema: {
            type: "object",
            properties: {
              scenario: {
                type: "string",
                description:
                  'Specific implementation scenario (e.g., "form layout", "data table")',
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
          description:
            "Collect feedback about component usage or missing information",
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
        case "project_knowledge_search":
          return await goaServer.projectKnowledgeSearch(args);

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
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
      };
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`Optimized GoA Design System MCP Server running on stdio\n`);
}

main().catch((error) => {
  process.stderr.write(`Server failed to start: ${error}\n`);
  process.exit(1);
});
