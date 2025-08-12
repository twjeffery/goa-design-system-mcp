# GoA Design System MCP - AI Instructions

## Project Overview

**V1 AI assistant** for the Government of Alberta Design System that provides comprehensive AI assistance for building government web services. The system contains 72 real implementation examples with working code and serves as both an educational resource and development assistance tool for two main audiences: product teams using the design system and design system teams maintaining it.

## Project Status & Team Context

- **V1 release** - A comprehensive knowledge base for the Government of Alberta Design System
- **Dual audience approach** - Serves both product teams (consumers) and design system teams (maintainers)
- **Active usage** - Core team using extensively, expanding to broader team adoption
- **Comprehensive documentation** - README files tailored for each audience with tool listings and examples

## Architecture & MCP Tools

**Integrated Tool Structure** with 13 specialized MCP tools:

### **Core Knowledge & Search (4 tools)**

- `project_knowledge_search` - Primary search across all GoA Design System knowledge
- `search_components` - Component search by name/functionality with filtering
- `get_component_details` - Complete component details by exact name
- `get_usage_patterns` - Usage patterns for specific scenarios

### **Design Expert Capabilities (5 tools)**

- `design_review` - Comprehensive design review for GoA compliance and accessibility
- `recommend_patterns` - Component patterns and layouts for specific scenarios
- `accessibility_audit` - WCAG 2.2 AA accessibility audit with government compliance
- `governance_check` - Project governance review and maintenance risk assessment
- `team_onboarding` - Customized onboarding plans for teams adopting GoA Design System

### **Feedback & Community Management (3 tools)**

- `give_feedback` - Submit feedback about component usage or missing information
- `get_feedback` - Review and filter submitted feedback (for maintainers)
- `get_feedback_summary` - Analytics and summary of collected feedback (for maintainers)

### **Supporting Files**

- `src/optimized-server.ts` - Performance-focused server with inverted index search
- `src/server.ts` - Design expert functions and feedback management
- `src/optimized-data-manager.ts` - Fast search implementation
- `src/inverted-index.ts` - Search optimization system

**Data Structure:**

- `data/examples/` - 72 real implementation patterns with working code snippets and design guidance
- `data/components/` - 35 GoA component definitions and usage patterns
- `data/index.json` - Master catalog of all design system knowledge
- `data/mandatory-ai-principles.json` - Critical AI implementation rules
- `component-schema.json` - Schema for validating component definition files
- `docs/` - Documentation including usage examples, AI workflows, and team guidance

## Dual Audience Approach

### **Product Teams (Design System Consumers)**

- **README.md** - Main documentation focused on service teams using GoA components
- **Use cases:** Quick code generation, form design, contextual support, design feedback, troubleshooting
- **Tools available:** 9 tools (excludes maintainer feedback tools)

### **Design System Teams (Design System Maintainers)**

- **README-design-system-team.md** - Internal team documentation for maintaining consistency
- **Use cases:** Knowledge management, cross-functional expertise, community support, pattern consistency
- **Tools available:** 10 tools (excludes governance_check and team_onboarding)

## Core Philosophy

**Example-Based Implementation**: Every example contains:

- Real working code snippets with proper GoA component usage
- Design guidance and accessibility best practices
- Component usage patterns with government service context
- Cross-framework compatibility (React, Angular, Web Components)

**Component Compliance**: All examples use:

- Only documented GoA component properties (no custom styling)
- WCAG 2.2 AA accessibility standards
- Government of Alberta digital service standards
- Proper semantic structure and government branding

## Framework Support

**Web Components Foundation**:

- Built on web components for framework agnostic usage
- React and Angular wrappers work identically
- Vue compatibility through native web component support
- Import pattern: `import { GoaComponentName } from '@abgov/react-components'`

**Component Prefixes:**

- React: `Goab` prefix (e.g., `GoabButton`, `GoabInput`)
- Angular: `goab-` prefix (e.g., `<goab-button>`, `<goab-input>`)
- Web Components: `goa-` prefix (e.g., `<goa-button>`, `<goa-input>`)

## Critical AI Implementation Rules

**Mandatory Principles** (from `data/mandatory-ai-principles.json`):

- **Real components only** - Never create mock components, always use actual imports
- **Mandatory page structure** - Always use `GoaOneColumnLayout` as root for government pages
- **Component-first approach** - Search for GoA components before creating custom implementations
- **No custom styling** - Use only documented component props, never custom CSS
- **Valid properties only** - Check component documentation before using any property
- **Design system icons** - Use component icon properties, never emojis
- **Proper spacing** - Use component margin props (mb, mr, mt, ml) instead of custom spacing

## User Types & Service Patterns

**Citizen vs Worker Design Patterns:**

- **Citizen Services**: One question per page, clear progress, plain language (grade 9 reading level)
- **Worker Tools**: Information density, batch operations, efficiency-focused dashboards
- **Both**: Universal accessibility and government branding requirements

**Government Service Context:**

- Examples organized by citizen-facing vs worker-facing patterns
- Real Alberta government service scenarios and workflows
- Accessibility and compliance guidance built into all patterns

## Component Schema & Validation

**Schema System:**

- `component-schema.json` - Comprehensive schema for validating all component definition files
- **Required fields:** metadataSchemaVersion, audience, componentName, customElement, summary
- **Validation support:** Props, events, slots, usage patterns, accessibility guidance
- **Framework coverage:** React, Angular, Web Component implementation details

## Data Management & File Organization

**Current Structure:**

- **Clean documentation** - Organized docs/ folder with audience-specific files
- **Consistent terminology** - "Examples" used throughout (not "recipes")
- **Updated counts** - 35 components, 72 examples accurately reflected
- **Schema compliance** - Component files validated against formal schema
- **No redundant files** - Removed outdated index-old.json and empty documentation

**Available Scripts:**

- `npm run build` - TypeScript compilation and build process
- `npm run start` - Start the MCP server
- `npm run dev` - Development mode with tsx
- `npm run test` - Run server in test mode

## Documentation Structure

### **Main Documentation**

- **README.md** - Product teams documentation with use cases and tool examples
- **README-design-system-team.md** - Design system team internal documentation
- **CLAUDE.md** - AI instructions (this file)
- **DEVELOPMENT_LOG.md** - Session history and architectural changes

### **Specialized Documentation**

- **docs/mcp-usage-examples.md** - Comprehensive usage examples by team type
- **docs/ai-recipe-sync-workflow.md** - AI workflow for syncing examples with code
- **docs/design-expert-guide.md** - Experimental design expert features guide
- **docs/examples-patterns.md** - Implementation guide for building GoA examples
- **docs/figma-to-code-instructions.md** - AI instructions for design-to-code conversion
- **docs/recipes-library-specification.md** - Technical specification for examples library

## MCP Server Integration

**Primary Server:**

```json
{
  "goa-design-system": {
    "command": "node",
    "args": ["path/to/goa-design-system-mcp/dist/index.js"]
  }
}
```

**Companion Integration:**

- **figma-dev-mode-mcp-server** - For Figma design-to-code workflows
- Works together to provide complete design-to-development pipelines

## Key Implementation Standards

**Always Required:**

- Use `GoaOneColumnLayout` for all government page structures
- Wrap form inputs with `GoaFormItem` for proper accessibility and labeling
- Include `GoaMicrositeHeader` and `GoaAppHeader` for government branding
- Follow WCAG 2.2 AA standards in all implementations

**Component Usage Standards:**

- Import real components: `import { GoabButton, GoabInput } from '@abgov/react-components'`
- Use GoA spacing tokens through component props (mb, mr, mt, ml)
- Validate all props against component documentation before use
- Apply proper semantic structure with `GoabText` component for all text content

## Development & Maintenance

**Session Documentation**: Update `DEVELOPMENT_LOG.md` after significant changes including:

- Architecture modifications or new tool implementations
- Documentation reorganization or terminology updates
- New capabilities, workflows, or audience-specific features
- File structure changes or schema updates

**Quality Assurance:**

- TypeScript compilation catches type errors
- Component schema validates definition files
- Mandatory AI principles ensure proper implementation
- Dual audience approach maintains relevance for all users

## Tool Usage Philosophy

**For AI Assistants:**

- Automatically select appropriate tools based on user questions
- Users ask naturally - MCP handles technical tool selection
- Provide comprehensive, contextual responses using multiple tools when helpful
- Always validate component usage against documented standards
- Apply mandatory AI principles to all code generation and guidance
