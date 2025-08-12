# GoA Design System AI Assistant

> **v1 AI assistant** for building Alberta Government digital services with the GoA Design System

A comprehensive AI knowledge base that helps service teams design, develop, and implement government digital services using GoA Design System components effectively.

## What Can You Ask?

### **Quick Code Generation**

- _"Generate a user registration form using GoA form patterns"_
- _"Create code for testing this layout concept"_
- _"Build a working prototype of this service flow"_
- _"Convert this design into testable GoA components"_

### **Form Design & Development**

- _"Help me design a business application form using GoA patterns"_
- _"Show me proper validation patterns for government forms"_
- _"How should I structure a multi-section form?"_
- _"What's the GoA pattern for collecting sensitive information?"_

### **Contextual Design System Support**

- _"I need to collect permit applications - what patterns exist?"_
- _"Show me relevant examples for building a citizen dashboard"_
- _"What GoA components work best for case management interfaces?"_
- _"Help me understand which layout patterns fit my service context"_

### **Design Feedback & Guidance**

- _"Review this Figma design - what GoA components should I use?"_
- _"I need to solve [specific service problem] - what patterns exist?"_
- _"Suggest design system approaches for this user workflow"_
- _"What accessibility considerations apply to this interface?"_

### **Designer-to-Developer Handoff**

- _"Generate a complete component spec for this design"_
- _"Give my developer starting code and implementation guidance"_
- _"Map this design to specific GoA components and examples"_
- _"Create a technical brief for implementing this service flow"_

### **Learning & Onboarding**

- _"I'm new to GoA - show me the essential patterns for [role]"_
- _"How do GoA components work together in government services?"_
- _"What are the key differences between React and Angular implementation?"_
- _"Help me understand government service design patterns"_

### **Quality Assurance & Standards**

- _"Review my implementation - am I using components correctly?"_
- _"Check this design for accessibility compliance"_
- _"Identify any anti-patterns in my component usage"_
- _"Validate this against GoA standards and best practices"_

### **Troubleshooting & Problem Solving**

- _"Why isn't this component integration working?"_
- _"Debug this layout issue with GoA components"_
- _"Help me fix this accessibility problem"_
- _"Suggest alternatives when standard patterns don't fit"_

### **Team Collaboration**

- _"Generate examples to explain this technical concept to stakeholders"_
- _"Create a component usage guide for our service team"_
- _"Help translate design decisions into developer language"_
- _"Show working examples for user testing sessions"_

---

## Available MCP Tools

### **Core Knowledge & Search**
- **`project_knowledge_search`** - Primary search across all GoA Design System knowledge (components, workflows, patterns, setup guides)
  - *Example:* _"Find all information about form validation patterns"_
  - *Example:* _"Search for citizen dashboard layout examples"_

- **`search_components`** - Search components by name or functionality with category filtering
  - *Example:* _"Show me all form-related components"_
  - *Example:* _"Find components for data display"_

- **`get_component_details`** - Get complete details for a specific component by exact name
  - *Example:* _"Get complete details for the Button component"_
  - *Example:* _"Show me everything about the Input component"_

- **`get_usage_patterns`** - Get usage patterns for specific implementation scenarios
  - *Example:* _"Show me patterns for building data tables"_
  - *Example:* _"Get usage patterns for multi-step forms"_

### **Design Expert Assistance**
- **`design_review`** - Comprehensive design review for GoA compliance, accessibility, and UX standards
  - *Example:* _"Review this registration form design for accessibility compliance"_
  - *Example:* _"Evaluate this dashboard layout against GoA standards"_

- **`recommend_patterns`** - Get recommended component patterns and layouts for specific scenarios
  - *Example:* _"Recommend components for a permit application workflow"_
  - *Example:* _"Suggest patterns for a citizen notification center"_

- **`accessibility_audit`** - WCAG 2.2 AA accessibility audit with government compliance checking
  - *Example:* _"Audit this form interface for WCAG compliance"_
  - *Example:* _"Check this data table for accessibility issues"_

- **`governance_process`** - Guide teams through GoA Design System governance process and identify compliance risks
  - *Example:* _"Review our project approach for design system compliance"_
  - *Example:* _"What's the proper process for requesting new components?"_

- **`team_onboarding`** - Get personalized onboarding guidance for teams new to the GoA Design System
  - *Example:* _"I just joined as a new designer, help me get started using the design system"_
  - *Example:* _"Our development team is new to GoA components, what should we learn first?"_

### **Feedback & Community**
- **`give_feedback`** - Submit feedback about component usage or missing information
  - *Example:* _"Report that the Dropdown component documentation is unclear"_
  - *Example:* _"Suggest adding a file upload example for government forms"_

*Your AI tool will automatically choose the right tool based on your questions - just ask naturally and the MCP will handle the technical details.*

---

## Real-World Examples

### **Service Team Designer**

**Context:** _"I need to design a permit renewal flow that works for both first-time and returning users"_

**Get:** Relevant examples from similar Alberta services, component recommendations, accessibility guidance, and implementation patterns specific to permit workflows.

### **Frontend Developer**

**Context:** _"Convert this dashboard design to React"_ + Figma design + service context

**Get:** Working React code using proper GoA components, implementation guidance, and patterns that match your specific service needs.

### **Product Manager**

**Context:** _"Prototype a citizen notification center for stakeholder review"_

**Get:** Quick working prototype with real components for testing user flows and gathering authentic feedback from stakeholders.

### **QA Specialist**

**Context:** _"Review this form implementation for government compliance"_

**Get:** Detailed analysis of accessibility, component usage, validation patterns, and alignment with government service standards.

---

## Setup Guide

### Prerequisites

- **Node.js 16+**
- **MCP-compatible AI tool** (Claude, Cursor, ChatGPT, GitHub Copilot, etc.)

### MCP Server Setup

1. **Clone and Install**

   ```bash
   git clone [repository-url]
   cd goa-design-system-mcp
   npm install
   npm run build
   ```

2. **Start the MCP Server**

   ```bash
   npm run start
   ```

3. **Configure Your AI Tool**

   Add MCP server configuration to your AI tool's settings:

   ```json
   {
     "mcpServers": {
       "goa-design-system": {
         "command": "node",
         "args": ["path/to/goa-design-system-mcp/dist/index.js"]
       }
     }
   }
   ```

4. **Verify Setup**
   Ask your AI: _"What GoA components are available for building forms?"_

---

## Who This Helps

### **Service Team Developers**

- Learn GoA component implementation patterns through working examples
- Get contextual guidance for your specific service requirements
- Convert designs to proper GoA component usage quickly
- Understand accessibility and government compliance requirements

### **Service Team Designers**

- Explore what's possible with existing GoA components
- Get component recommendations for your service scenarios
- Validate design decisions against government service patterns
- Create designs that translate smoothly to development

### **Product Managers**

- Generate working prototypes for user testing and stakeholder demos
- Understand technical feasibility within GoA Design System constraints
- Communicate feature concepts using real component examples
- Test service flows with interactive, accessible interfaces

### **QA Teams**

- Understand expected component behaviors for testing scenarios
- Validate accessibility compliance in realistic contexts
- Review implementations against government service standards
- Test component interactions and edge cases

---

## What's Included

### **Component Coverage**

- **35 Components:** Complete GoA component library with implementation guidance
- **72 Service Examples:** Comprehensive patterns for government service scenarios
- **Framework Support:** React, Angular, and Web Components
- **Complete API Documentation:** Props, states, accessibility, implementation examples

### **Service Context**

- **Government Service Patterns:** Citizen-facing and worker-facing examples
- **Accessibility Guidance:** WCAG compliance built into all recommendations
- **Implementation Best Practices:** Anti-patterns, common mistakes, proper usage
- **Cross-Framework Support:** Consistent guidance across React, Angular, Web Components

---

## Additional Resources

- **[GoA Design System Documentation](https://design.alberta.ca)**
- **[GitHub Repository](https://github.com/GovAlta/ui-components)**
- **[React Sandbox](https://stackblitz.com/~/github.com/GovAlta/ui-components-react-sandbox)**
- **[Angular Sandbox](https://stackblitz.com/~/github.com/GovAlta/ui-components-angular-sandbox)**

---

**Ready to build better government digital services?** Set up the MCP server and start asking questions!

---

_This AI assistant provides guidance and code generation for building with the GoA Design System. Generated code is intended for development, prototyping, and production use in Alberta Government digital services._
