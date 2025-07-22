# GoA Design System MCP - AI Instructions

## Project Overview

**Experimental MCP server** for the Government of Alberta Design System that provides AI assistance for building government web services. The system contains 71+ real implementation recipes with working code examples and serves as both an educational resource and code generation assistant.

## Project Status & Team Context

- **Experimental phase** - All features are being tested and refined
- **Small team usage** - Currently used by core team, expanding to other teams soon
- **Active development** - Data management processes and workflows still evolving
- **Recent team sharing** - Just shared with broader team who are excited about it

## Architecture & Servers

**Dual Server Setup** (may be over-engineered from previous optimization):
- `src/optimized-server.ts` - Performance-focused server with inverted index search
- `src/server.ts` - Original server with experimental design expert functions
- `src/optimized-data-manager.ts` - Fast search with inverted index (4-10x performance improvement)
- `src/inverted-index.ts` - Search optimization system

**Data Structure:**
- `data/recipes/` - 71+ real implementation patterns with working code snippets and design guidance
- `data/components/` - GoA component definitions and usage patterns
- `docs/` - Workflow documentation (JSON files)

## Core Philosophy

**Recipe-Based Implementation**: Every recipe contains:
- Real working code examples
- Design guidance and best practices
- Component usage patterns with bestPracticeStandards metadata
- Cross-framework compatibility (React, Angular, Vue via web components)

**Component Compliance**: All examples use:
- Only documented GoA component properties (no custom styling)
- WCAG AA accessibility standards
- Government of Alberta digital service standards

## Framework Support

**Web Components Foundation**: 
- Built on web components for framework agnostic usage
- React and Angular wrappers work identically
- Vue compatibility through native web component support
- Import pattern: `import { GoaComponentName } from '@abgov/react-components'`

## Component Enhancement System

**Dual Purpose AI Features**:
1. **Educational** - Automatically extracts GoA components from questions and provides import statements, key props, and usage guidance
2. **Code Generation** - Assists in actual component implementation and code building

**Auto-Enhancement**: Both servers automatically append component information to responses when GoA components are detected.

## Experimental Design Expert Functions

Located in `server.ts` (experimental features):
- `designReview()` - Reviews designs for GoA compliance
- `accessibilityAudit()` - WCAG compliance checking  
- `governanceCheck()` - Project governance analysis
- `recommendPatterns()` - Suggests appropriate patterns
- `teamOnboarding()` - Team education workflows

## Data Management

**Current State**: Evolving processes
- Started with manual data entry
- Added automation scripts in `scripts/` folder
- No formal update workflow yet
- Mix of manual and automated maintenance

**Available Scripts:**
- `npm run sync` - Recipe synchronization
- `npm run map-components` - Component mapping
- `npm run update-components` - Component updates
- `npm run full-sync` - Complete sync workflow

## Testing & Validation

**Available Commands:**
- `npm run build` - TypeScript compilation (catches type errors)
- `npm test` - Runs server in test mode
- `npm run dev` - Development mode with tsx
- `npm run watch` - TypeScript watch mode

**No separate lint/typecheck commands** - validation happens through TypeScript compilation.

## Best Practice Standards (Phase 1 Implementation)

**Metadata Structure** in recipes:
- `sizeTag`: "interaction" | "task" | "page" | "service"
- `bestPracticeCategory`: "content-layout" | "feedback-and-alerts" | "inputs-and-actions" | "public-form" | "structure-and-navigation" | "technical"
- `componentCompliance`: Validation flags for proper GoA usage
- `qualityStandards`: Layout, content, accessibility, UX guidelines

## User Types & Patterns

**Citizen vs Worker Design Patterns:**
- **Citizen**: One question per page, clear progress, plain language (grade 9 reading level)
- **Worker**: Information density, batch operations, efficiency-focused dashboards
- **Both**: Universal accessibility and government branding requirements

## Key Implementation Rules

**Always Required:**
- Use `GoaOneColumnLayout` for government page structure
- Wrap form inputs with `GoaFormItem` for accessibility
- Include `GoaMicrositeHeader` and `GoaAppHeader` for branding
- Follow WCAG 2.2 AA standards

**Component Usage:**
- Never use custom CSS styling beyond built-in component properties
- Use GoA spacing tokens instead of custom margins/padding
- Import from `@abgov/react-components` or equivalent framework package

## Session Documentation

**Development Log Maintenance**: After completing any significant changes to the MCP server (new features, file reorganization, architecture changes, bug fixes), update `DEVELOPMENT_LOG.md` with:
- Session date and overview of changes
- What was built/modified
- Impact on the system
- Files affected
- Any new capabilities or workflows added

## Development Notes

- **Development history**: See `DEVELOPMENT_LOG.md`
- **Performance optimization**: May be overkill for current small team scale
- **Schema compliance**: Recipe data follows `recipe-schema.json` structure
- **AI workflow procedures**: See `docs/` folder for specialized workflows