# GoA Design System Expert Guide

⚠️ **Experimental Feature - First Version**

This is the first experimental version of the GoA Design System expert capabilities. While functional, expect rough edges and evolving features as we explore AI-assisted design system guidance. We're actively learning what works best for government service teams.

## Overview

The enhanced GoA Design System MCP server now includes experimental design expert capabilities that help teams make better design decisions, ensure compliance, and avoid common pitfalls. This is an early iteration focused on rapid prototyping and validation of AI-assisted design guidance.

## New Design Expert Functions (Experimental)

### 1. `design_review` - Comprehensive Design Review

**Status: Experimental** - Performs a thorough review of designs for GoA compliance, accessibility, and user experience standards.

**When to use:**
- Before starting implementation of new features
- During design system compliance audits
- When onboarding new team members
- Before major release milestones

**Note:** Results should be validated by human design system experts, especially for critical compliance decisions.

**Parameters:**
- `designDescription` (required): Description of the design or interface being reviewed
- `framework` (optional): Implementation framework (react/angular)
- `userType` (optional): Target user type (citizen/worker, default: citizen)
- `components` (optional): List of GoA components being used

**Example:**
```json
{
  "designDescription": "A citizen registration form with email, name, and address fields",
  "framework": "react",
  "userType": "citizen",
  "components": ["GoabFormItem", "GoabInput", "GoabButton"]
}
```

**Returns:**
- Compliance scores for GoA standards, accessibility, UX, and technical implementation
- Specific recommendations for improvement
- Anti-pattern detection results
- Risk assessment with impact analysis

### 2. `recommend_patterns` - Pattern Recommendations

**Status: Experimental** - Get recommended component patterns and layouts for specific scenarios.

**When to use:**
- Team is unsure which components to use
- Multiple design approaches are being considered
- Need to optimize for specific user type
- Want to ensure government service best practices

**Note:** Recommendations are based on existing patterns and principles but should be tested with real users and validated by experienced designers.

**Parameters:**
- `scenario` (required): Specific use case or scenario description
- `userType` (optional): Target user type (citizen/worker, default: citizen)
- `complexity` (optional): Interface complexity level (simple/medium/complex, default: medium)
- `dataType` (optional): Primary data interaction type (form/display/navigation/dashboard, default: form)

**Returns:**
- Primary recommended pattern with component list
- Alternative patterns from recipe library
- Layout structure guidance
- Implementation notes specific to user type

### 3. `accessibility_audit` - WCAG 2.2 AA Compliance Audit

**Status: Experimental** - Comprehensive accessibility audit with government compliance checking.

**When to use:**
- Before public release of citizen-facing services
- During compliance review periods
- When adding new interaction patterns
- After significant design changes

**Important:** This is an automated assessment. Always follow up with manual testing using real assistive technologies and users with disabilities.

**Parameters:**
- `designDescription` (required): Description of the interface to audit
- `components` (optional): List of components being used
- `framework` (optional): Implementation framework (react/angular)

**Returns:**
- WCAG 2.2 AA compliance score and level
- Detailed checks for each criterion
- Government-specific requirements assessment
- Prioritized recommendations for fixes

### 4. `governance_check` - Project Governance Review

**Status: Experimental** - Project governance review for design system compliance and maintenance risk assessment.

**When to use:**
- Project using many custom components
- Team lacks design system expertise
- Multiple teams working on related projects
- Long-term maintenance concerns

**Parameters:**
- `projectName` (required): Name of the project being reviewed
- `components` (optional): List of components used in the project
- `framework` (optional): Primary framework being used (react/angular)
- `teamSize` (optional): Size of the development team (default: 1)

**Returns:**
- Design system usage score
- Standards compliance assessment
- Maintenance risk evaluation
- Specific findings and action items

### 5. `team_onboarding` - Customized Team Onboarding

**Status: Experimental** - Generate customized onboarding plan for teams adopting the GoA Design System.

**When to use:**
- New teams starting with GoA Design System
- Teams switching from other design systems
- Upskilling existing teams
- Establishing team processes

**Parameters:**
- `teamType` (optional): Type of team (development/design/product/qa, default: development)
- `experience` (optional): Experience level (beginner/intermediate/advanced, default: beginner)
- `projectType` (optional): Project type (citizen-service/worker-tool/both, default: citizen-service)
- `framework` (optional): Primary framework (react/angular)

**Returns:**
- Customized learning path with phases and timelines
- Practice exercises tailored to project type
- Key resources and documentation
- Checkpoints and success criteria

## Enhanced Search Capabilities (Experimental)

The `project_knowledge_search` function now automatically detects design expert queries and prioritizes relevant resources. This detection is experimental and may not catch all relevant queries.

**Design Expert Keywords Detected:**
- review, audit, compliance, accessibility, governance
- anti-pattern, best practice, principles, guidance
- expert, onboarding, team, recommend, pattern
- wcag, citizen vs worker, user type

## Known Limitations

As this is the first experimental version, please be aware of these limitations:

1. **Not a replacement for human expertise** - Use as guidance, not final authority
2. **Limited context understanding** - Works best with detailed descriptions
3. **Pattern recommendations may not fit all edge cases** - Always validate with user research
4. **Anti-pattern detection is basic** - May miss subtle issues or flag false positives
5. **Accessibility audit is automated only** - Manual testing still required
6. **Learning and improving** - The system will evolve based on team feedback

## How to Provide Feedback

Since this is experimental, your feedback is crucial for improvement:

1. Use the `collect_feedback` function to report issues or gaps
2. Let us know what works well and what doesn't
3. Share specific examples where the guidance was helpful or misleading
4. Suggest additional features or improvements

## Best Practices for Experimental Use

1. **Start with low-risk scenarios** - Use for exploration and learning, not critical decisions
2. **Always validate recommendations** - Test with real users and experienced designers
3. **Combine with existing processes** - Don't replace your current quality gates, supplement them
4. **Document your experience** - Help us improve by sharing what you learn
5. **Expect changes** - Features and recommendations may evolve rapidly

## Getting Help

For issues with the experimental features:

1. Try rephrasing your query with more detail
2. Use the `collect_feedback` function to report problems
3. Consult with human design system experts for critical decisions
4. Check the existing recipe library for proven patterns

## What's Next

This experimental version helps us learn:
- Which design guidance is most valuable to teams
- How AI can best assist design system adoption
- What additional features would be most helpful
- How to improve accuracy and usefulness

Your feedback will directly influence the development of these features. Thank you for being an early adopter and helping us build better design system tools for government service teams!

---

**Remember:** This is an experimental tool for rapid prototyping and concept validation. For production government services, always follow established design system processes and consult with accessibility and design experts.