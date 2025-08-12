# GoA Design System Examples: Patterns and Organization

## Overview

This document captures high-level patterns, organizational insights, and design approach distinctions for building examples in the Government of Alberta Design System. It complements the component usage rules in `data/mandatory-ai-principles.json` with examples-specific knowledge about when and how to use different patterns.

## Examples Structure & Organization

### How Examples Are Built

Examples in the GoA Design System follow a specific structure:

- **Location**: `src/examples/` folder contains all example files
- **Structure**: Each example is a standalone React component using the `<Sandbox>` wrapper
- **Code snippets**: Examples include `<CodeSnippet>` components showing both React and Angular implementations
- **Routing**: `ExamplePageTemplate.tsx` dynamically imports examples by slug (e.g., `/examples/worker-dashboard-overview`)
- **Discovery**: Examples are fetched from a GitHub project board, not the filesystem directly

### Example Component Pattern

```tsx
export const ExampleName = () => {
  const { version } = useContext(LanguageVersionContext);
  
  return (
    <Sandbox fullWidth>
      {/* Angular Code Snippets */}
      <CodeSnippet lang="typescript" tags={["angular", "reactive"]} />
      
      {/* React Code Snippets */}
      <CodeSnippet lang="typescript" tags="react" />
      
      {/* Live Component Demo */}
      <GoabContainer>
        {/* Example implementation */}
      </GoabContainer>
    </Sandbox>
  );
};
```

### Testing Examples

To test a new example:
1. Create the file in `src/examples/your-example-name.tsx`
2. Start dev server: `npm run dev`
3. Navigate to: `http://localhost:5173/examples/your-example-name`
4. The example will load with basic header (may show loading states until added to GitHub project)

## Citizen vs Worker Design Patterns

### Critical Distinction

The GoA Design System serves two very different user types, requiring different design approaches:

#### A) Public Service (Citizen-facing)
**Primary User:** Citizens, public, external users
**Design Context:** Receiving government services

**Characteristics:**
- **Simplified UI** - One idea per page, minimal cognitive load
- **Accessibility-first** - WCAG 2.2 AA, grade 9 reading level
- **Mobile-optimized** - Citizens access on various devices
- **Self-service** - Citizens complete tasks independently
- **Clear guidance** - Extensive help text and examples
- **Low frequency use** - Designed for infrequent users

**Examples:**
- `public-form.tsx` - Citizen form pattern
- `ask-a-user-for-an-address.tsx` - Personal information collection
- `start-page.tsx` - Service entry point
- `question-page.tsx` - One question per page approach

#### B) Workspace (Worker-facing)
**Primary User:** Service workers, internal staff, business users
**Design Context:** Providing government services

**Characteristics:**
- **Information-dense** - Multiple data points visible simultaneously
- **Efficiency-focused** - Batch operations, shortcuts, filters
- **Desktop-optimized** - Workers typically use desktop workstations
- **Role-based** - Different permissions and workflows
- **Decision support** - Tools to help workers make accurate determinations
- **High frequency use** - Designed for daily use by trained users

**Examples:**
- `worker-dashboard-overview.tsx` - Worker daily overview
- `card-view-of-case-files.tsx` - Case management interface
- `display-user-information.tsx` - Worker viewing citizen details
- `review-and-action.tsx` - Worker processing applications

### When to Use Which Pattern

**Use Citizen Patterns When:**
- Building forms for public submission
- Creating self-service portals
- Designing informational pages for citizens
- Building confirmation and receipt pages

**Use Worker Patterns When:**
- Building administrative dashboards
- Creating case management interfaces
- Designing approval workflows
- Building data entry and processing tools

## Responsive Design Patterns

### Desktop Table → Mobile Card Transitions

A common pattern for worker interfaces is converting data tables to card views on mobile:

```tsx
const [isMobile, setIsMobile] = useState<boolean>(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// Desktop Table View
{!isMobile && (
  <GoabTable width="100%">
    {/* Table implementation */}
  </GoabTable>
)}

// Mobile Card View
{isMobile && (
  <GoabBlock direction="column" gap="m">
    {data.map((item) => (
      <GoabContainer key={item.id} accent="filled">
        {/* Card implementation */}
      </GoabContainer>
    ))}
  </GoabBlock>
)}
```

### Mobile Card Layout Patterns

For mobile cards, use `GoabGrid` with `minChildWidth="auto"` for responsive columns:

```tsx
<GoabContainer accent="filled">
  <GoabGrid minChildWidth="auto" gap="m">
    <GoabBlock direction="column" gap="xs">
      {/* Left column: Selection controls */}
    </GoabBlock>
    
    <GoabBlock direction="column" gap="xs">
      {/* Center column: Content */}
    </GoabBlock>
    
    <GoabBlock direction="column" gap="xs">
      {/* Right column: Actions */}
    </GoabBlock>
  </GoabGrid>
</GoabContainer>
```

## Worker-Specific Patterns

### Dashboard Overview Layouts

Worker dashboards typically include:

1. **Worker Context Header**
   - Name, role, department, employee ID
   - Quick actions (notifications, settings)

2. **Alert-Style Metrics**
   - Use `GoabCallout` for attention-grabbing stats
   - Color-coded by priority (emergency, important, information, success)

3. **Priority-Based Data Display**
   - Tables with sortable columns
   - Status badges with consistent color coding
   - Overdue highlighting with emergency callouts

4. **Bulk Operations**
   - Checkbox selection for multiple items
   - Dropdown assignment to team members
   - Bulk action buttons with clear labels

### Bulk Selection Pattern

```tsx
const [selectedItems, setSelectedItems] = useState<string[]>([]);

const handleSelection = (id: string, checked: boolean) => {
  setSelectedItems(prev => 
    checked 
      ? [...prev, id]
      : prev.filter(item => item !== id)
  );
};

// In table/card:
<GoabCheckbox
  name={`item-${item.id}`}
  checked={selectedItems.includes(item.id)}
  onChange={(e) => handleSelection(item.id, e.checked)}
/>

// Bulk actions UI:
{selectedItems.length > 0 && (
  <GoabContainer type="non-interactive" accent="thin">
    <GoabBlock direction="row" gap="m" alignment="center">
      <GoabText size="body-m">
        Assign {selectedItems.length} items to
      </GoabText>
      <GoabDropdown>
        {/* Team members */}
      </GoabDropdown>
      <GoabButton type="primary" size="compact">
        Assign
      </GoabButton>
    </GoabBlock>
  </GoabContainer>
)}
```

### Status and Priority Indicators

Use consistent badge types across worker interfaces:

```tsx
const getBadgeType = (priority: string) => {
  switch (priority) {
    case "high": return "emergency";
    case "medium": return "important";
    case "low": return "information";
    default: return "midtone";
  }
};

const getStatusBadgeType = (status: string) => {
  switch (status) {
    case "pending": return "important";
    case "in-progress": return "information";
    case "completed": return "success";
    default: return "midtone";
  }
};
```

### Overdue Item Highlighting

For overdue items, use `GoabCallout` components rather than custom styling:

```tsx
// Desktop table - conditional background
<tr style={{
  backgroundColor: item.daysOverdue > 0 ? "#FFF5F5" : undefined
}}>

// Mobile cards - use callout component
{item.daysOverdue > 0 && (
  <GoabCallout type="emergency" size="small" heading="Overdue">
    {item.daysOverdue} day{item.daysOverdue > 1 ? 's' : ''} overdue
  </GoabCallout>
)}
```

## Example Development Workflow

### Creating New Examples

1. **Identify the pattern type** - Citizen vs Worker
2. **Choose appropriate components** - Follow component-first approach
3. **Build responsive if needed** - Consider mobile experience
4. **Include code snippets** - Both React and Angular
5. **Test locally** - Use direct URL navigation
6. **Add to GitHub project** - For discovery in examples overview

### Best Practices for Examples

1. **Use realistic data** - Government-appropriate names, IDs, scenarios
2. **Show complete workflows** - Not just isolated components
3. **Include error states** - Show validation and feedback
4. **Demonstrate accessibility** - Proper labels, roles, navigation
5. **Follow spacing patterns** - Use GoA spacing tokens consistently

### Common Worker Example Types Needed

- **Dashboard overviews** - Daily task summaries
- **Case management** - Individual case handling
- **Bulk operations** - Multi-item processing
- **Approval workflows** - Review and decision processes
- **Data entry forms** - Complex form patterns
- **Search and filter** - Finding specific records
- **Reporting interfaces** - Data visualization and export

## Key Insights from Development

### What Works Well

- **GoabGrid for responsive layouts** - Better than custom flexbox
- **GoabCallout for important messaging** - More prominent than badges
- **GoabContainer accent="filled"** - Good for card-based layouts
- **Consistent badge patterns** - Helps users learn the system
- **Component composition** - Building complex UIs from simple components

### What to Avoid

- **Custom styling on GoA components** - Use only component props
- **Mock or placeholder components** - Always use real GoA components
- **Complex custom layouts** - Leverage GoA layout components
- **Inconsistent spacing** - Use GoA spacing tokens
- **Citizen patterns for worker tools** - Match the user context

### Lessons Learned

1. **Context matters** - Worker vs citizen requires different approaches
2. **Responsive is complex** - Plan for mobile early
3. **Bulk operations are common** - Workers need efficiency tools
4. **Status indication is critical** - Visual feedback for workflow states
5. **GoA components are powerful** - Most needs can be met with existing components

---

*This document should be updated as new patterns emerge and examples are developed. It serves as a living reference for maintaining consistency across the GoA Design System examples.*