# GoA Design System Code Examples & Recipes Library Specification

## Overview

A comprehensive library of reusable code examples and recipes that demonstrate **best practice implementations** of the Government of Alberta Design System. These examples serve as the authoritative reference for proper component usage, layout patterns, content design, accessibility standards, and user experience guidelines across both citizen-facing public services and worker-facing internal applications.

## Goals

### Primary Objectives
- Provide **best practice reference implementations** using only valid GoA Design System components
- Deliver copy-paste ready code examples for common government service patterns
- Establish the **gold standard** for design system usage across layout, content, spacing, accessibility, and UX
- Reduce time spent on component integration and pattern discovery
- Ensure consistent, accessible implementations across teams
- Support both React and Angular implementations seamlessly

### Pain Points Addressed
- Developers reinventing patterns instead of reusing proven solutions
- Inconsistent implementations across teams
- Accessibility issues from improper component usage
- Time spent figuring out component combinations
- Lack of context on when to use which components
- Confusion between public-facing vs internal workspace patterns
- **Misuse of design system components** through invalid properties or custom styling attempts

## Core Principles

### Component Compliance Requirements
**CRITICAL**: All examples must demonstrate proper GoA Design System usage:

- **Valid Properties Only**: Examples use exclusively documented component properties
- **No Custom Styling**: Components cannot and should not be styled beyond their built-in properties
- **Authentic Component Usage**: Examples reflect genuine, supported component capabilities
- **Design System Integrity**: Maintain consistency with established component behaviors

### Best Practice Standards
These examples represent the **definitive reference** for:

- **Layout Patterns**: Proper spacing, alignment, and visual hierarchy
- **Content Design**: Clear, accessible copy and information architecture  
- **Accessibility Implementation**: WCAG compliance and inclusive design practices
- **Design Pattern Usage**: When and how to apply specific UI patterns
- **User Experience Guidelines**: Task flows, progressive disclosure, and user guidance
- **Component Integration**: How components work together effectively
- **Design Usage Guidelines**: Visual consistency and brand adherence

## Content Strategy

### Pattern Categories

#### Public Forms (Citizen-facing)
**Focus: Accessibility, clear communication, guided tasks**
**Best Practice Areas**: Progressive disclosure, "one idea per page", accessible form design

- Government service applications following established UX patterns
- Progressive disclosure implementations using proper component states
- Multi-step processes with consistent navigation and validation
- Public-facing accessibility patterns (WCAG 2.2 AA compliance)
- Clear citizen journey workflows with proper wayfinding
- Error handling using design system feedback components
- Success confirmation patterns with appropriate messaging

**Example Implementations:**
- License applications with proper form validation
- Permit requests using multi-step component patterns
- Benefit applications with accessible input combinations
- Service registrations following content design guidelines

#### Workspace Forms (Worker/Internal)
**Focus: Productivity, efficiency, data-dense interfaces**
**Best Practice Areas**: Information density, workflow efficiency, data presentation

- Administrative dashboards using proper layout components
- Data entry interfaces optimizing component combinations
- Bulk operations with appropriate action patterns
- Complex data management using table and form components
- Internal navigation following established information architecture
- Worker-focused efficiency patterns with proper component states
- System integration patterns maintaining design consistency

**Example Implementations:**
- Case management systems with proper data organization
- Data processing interfaces using optimal component layouts
- Reporting tools with accessible data presentation
- Administrative workflows with clear task progression

#### Common Form Patterns
**Best Practice Areas**: Component integration, state management, accessibility

- Data display patterns using appropriate components
- Navigation workflows with proper wayfinding
- Multi-step implementations with consistent progression
- Error handling using design system feedback patterns
- Loading states with appropriate component behaviors
- Accessibility implementations following WCAG guidelines

### Tagging System (v1 - Expandable)

#### Size Tags
- **Interaction**: Single component best practices
- **Task**: Complete user task implementations
- **Page**: Full page layout standards
- **Service**: Multi-page service flow patterns

#### User Goal Tags
- **Ask a user for...**: Data collection best practices
- **Help a user to...**: User guidance and assistance patterns

#### Category Tags
- **Content layout**: Information organization standards
- **Feedback and alerts**: Status communication patterns
- **Inputs and actions**: User input best practices
- **Public form**: Citizen-facing form standards
- **Structure and navigation**: Page organization guidelines
- **Technical**: Implementation best practices

*Note: Tags function as flexible filters - examples can have multiple tags*

## Technical Architecture

### Framework Support
- **Primary Frameworks**: React and Angular
- **Code Organization**: Framework-specific example files (following existing `.tsx` pattern)
- **Framework Switching**: Leverage existing site-wide framework switcher
- **Testing Environment**: Integration with existing StackBlitz templates

### Example Structure

#### Code Format Standards
```typescript
// Angular Example - Using only valid GoA component properties
<goab-form-item 
  label="Provide more detail" 
  helpText="Do not include personal or financial information, like your National Insurance number or credit card details.">
  <goab-text-area 
    name="program" 
    (onChange)="textOnChange($event)" 
    width="100%" 
    [rows]="6" 
    [maxCount]="500" 
    countBy="word">
  </goab-text-area>
</goab-form-item>
```

#### Example Metadata Requirements
- **Title and Description**: Clear identification of the pattern
- **Best Practice Context**: What standards this example demonstrates
- **Tags**: Size, User Goal, Category classifications
- **Framework Variants**: React and Angular implementations
- **Component Usage Notes**: Why specific properties were chosen
- **Related Examples**: Logical workflow connections
- **WCAG Guideline References**: Accessibility compliance details
- **Usage Guidelines**: When and how to apply this pattern

### Recipe Philosophy
**"Best practice ingredients with expert guidance"**

- **Authoritative**: Represents the definitive way to implement patterns
- **Valid**: Uses only supported component properties and behaviors
- **Modular**: Components can be mixed and matched following design principles
- **Contextual**: Clear guidance on when and why to use specific approaches
- **Production-ready**: Meets highest standards for accessibility, UX, and design consistency
- **Reference Quality**: What teams should aspire to match in their implementations

## Integration Requirements

### MCP Server Integration

#### Search Capabilities
- **Tag-based Search**: Filter by Size, User Goal, Category tags
- **Semantic Search**: Natural language queries ("best practice citizen application", "accessible form validation")
- **Related Examples**: Suggest logical next steps in user workflows
- **Component-based Discovery**: Show best practice examples featuring specific components
- **Best Practice Lookup**: Find authoritative implementations for specific patterns

#### Code Generation
- **Standards-Compliant Scaffolding**: Generate code using only valid component properties
- **Best Practice Templates**: Scaffold implementations following established guidelines
- **Framework Translation**: Convert examples between React and Angular while maintaining standards
- **Pattern Suggestions**: Recommend appropriate patterns based on user context

### Website Integration

#### Component Pages
- Display **best practice examples** on individual component pages
- Show proper usage patterns and property combinations
- Example: Checkbox component page shows optimal multi-selection implementations

#### Search Experience - Best Practice Focus
1. User searches "citizen application form best practices"
2. Results show authoritative implementations and related patterns
3. User selects desired example with confidence it represents proper usage
4. Framework-specific code displayed following design system standards
5. Integration with StackBlitz templates for testing valid implementations

## Content Governance

### Quality Assurance Standards

#### Component Validation
- **Property Verification**: All component properties must be documented and valid
- **No Custom Styling**: Zero tolerance for styling attempts outside component capabilities  
- **Behavioral Consistency**: Components used according to their designed purpose
- **Integration Standards**: Component combinations follow established patterns

#### Best Practice Verification
- **Design Review**: Patterns meet visual design standards
- **Accessibility Audit**: Examples demonstrate proper WCAG implementation
- **Content Standards**: Copy and messaging follow content design guidelines
- **UX Validation**: Interaction patterns support optimal user experience

### Maintenance & Updates
- **Primary Responsibility**: Design system team ensures standard compliance
- **Community Contributions**: GitHub contributions reviewed for standard adherence
- **Tracking**: GitHub backlog with quality gates (not-published → standards review → available)
- **Approval Process**: Designer review → developer validation → standards compliance → publication

### Versioning Strategy
- **Component Alignment**: Examples updated when underlying components evolve
- **Standards Evolution**: Examples refined as best practices mature
- **Quality Gates**: All changes verified against design system standards
- **Backwards Compatibility**: Maintain stability while improving standards

## Success Metrics (Future Development)

### Quality Indicators
- Reduction in component misuse across team implementations
- Increased consistency in design system applications
- Improved accessibility compliance rates
- Faster implementation times using standard patterns

### Usage Metrics
- Example access patterns and most-referenced standards
- Developer feedback on pattern clarity and usefulness
- Implementation consistency across teams
- Time-to-implementation for common patterns

## Implementation Phases

### Phase 1: Standards Foundation
- Establish example structure emphasizing best practice compliance
- Create initial set of high-priority standard implementations
- Implement search functionality with best practice filtering
- Integrate with existing framework switcher maintaining quality

### Phase 2: Standards Enhancement
- Expand library with comprehensive best practice coverage
- Implement semantic search for pattern discovery
- Add MCP server code generation following standards
- Develop workflow suggestions based on proven patterns

### Phase 3: Standards Optimization
- Implement quality metrics and compliance tracking
- Refine examples based on real-world usage patterns
- Expand accessibility documentation and validation
- Enhance community contribution with quality gates

## File Structure

```
examples/
├── public-forms/
│   ├── applications/          # Best practice citizen applications
│   ├── registrations/         # Standard registration patterns
│   └── submissions/           # Optimal submission workflows
├── workspace-forms/
│   ├── dashboards/           # Internal dashboard standards
│   ├── data-entry/           # Worker interface best practices
│   └── admin-tools/          # Administrative pattern standards
├── common-patterns/
│   ├── navigation/           # Navigation best practices
│   ├── feedback/            # Standard feedback implementations
│   └── data-display/        # Data presentation standards
└── standards/
    ├── component-usage.json    # Valid property references
    ├── best-practices.json     # Pattern standard definitions
    ├── accessibility.json      # WCAG implementation guide
    └── quality-gates.json      # Compliance requirements
```

## Next Steps

1. **Validate Standards Framework**: Confirm this specification meets quality and compliance requirements
2. **Establish Quality Gates**: Define specific criteria for best practice compliance
3. **Create Standards Templates**: Develop format for documenting best practice rationale
4. **Audit Existing Components**: Catalog all valid properties and usage patterns
5. **Develop Reference Examples**: Create initial set of gold standard implementations
6. **Implement Compliance Validation**: Build checks for component property validation
7. **Test Standards Integration**: Validate MCP server understanding of best practices
8. **Launch Reference Library**: Deploy initial examples as authoritative standards
9. **Gather Implementation Feedback**: Monitor how teams apply these standards
10. **Iterate Standards**: Refine based on real-world application and component evolution

---

This specification establishes a comprehensive foundation for building an authoritative code examples library that serves as both practical recipes and the definitive reference for proper GoA Design System usage. Every example represents best practice implementation using valid components and properties, ensuring teams have reliable, standards-compliant patterns to follow.