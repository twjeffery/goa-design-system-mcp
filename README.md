# GoA Design System AI Assistant

> **Experimental AI-powered prototyping tool** for rapidly building Alberta Government service prototypes with the GoA Design System

⚠️ **This is an experimental project** — expect rough edges and evolving features as we explore AI-assisted government service prototyping.

Accelerate your prototyping and user testing workflow. Get instant help building interactive, coded prototypes using GoA Design System components — perfect for testing concepts with real users quickly.

## 🚀 Quick Start

**Get up and running in 3 steps:**

1. **Launch in GitHub Codespaces**

   ```
   Click "Code" → "Codespaces" → "Create codespace"
   ```

2. **Start the MCP Server**

   ```bash
   npm run start
   ```

3. **Configure Claude Desktop** (see [setup guide](#claude-desktop-setup)) (or other tools that can integrate into an MCP)

That's it! Start asking Claude questions like _"Build me a user registration form"_ or _"How do I create a dashboard layout?"_

---

## 🎯 What Can You Ask?

### **🏗️ Complete Application Building**

- _"Build this design for me in React"_ (paste Figma screenshot + optional JSON export)
- _"Prototype a business registration application with all the forms"_
- _"Build a citizen portal dashboard prototype with user profile, services, and notifications"_
- _"Generate a multi-step application prototype with progress tracking"_

### **📋 Forms & Data Collection**

- _"Build a user registration form prototype with validation"_
- _"Prototype a complex application form with multiple sections"_
- _"Design a survey form prototype with conditional logic"_
- _"Build an address collection form prototype with postal code validation"_
- _"Generate a file upload form prototype with document requirements"_

### **📊 Data Display & Management**

- _"Show me how to prototype a data table with pagination and search"_
- _"Build a user management interface prototype with edit/delete actions"_
- _"Prototype a dashboard with statistics cards and recent activity"_
- _"Design a document library prototype with filtering and sorting"_
- _"Build a notification center prototype with read/unread states"_

### **🎨 Layout & Navigation**

- _"Help me prototype a dashboard layout with sidebar navigation"_
- _"Prototype a service landing page with call-to-action sections"_
- _"Design a multi-tab interface prototype for application status"_
- _"Build a responsive layout prototype that works on mobile and desktop"_
- _"Generate a progress workflow prototype with step indicators"_

### **🔧 Component Integration**

- _"What GoA components should I use for user authentication?"_
- _"How do I combine containers and blocks for a complex layout?"_
- _"Show me patterns for progressive disclosure in forms"_
- _"What's the best way to handle form validation and error states?"_
- _"How do I build accessible dropdown menus with search?"_

### **🎨 Figma-to-Code Conversion**

- _"Convert this Figma design to React prototype using GoA components"_ (attach design image)
- _"Turn this wireframe into coded prototype with Angular"_
- _"Build this dashboard mockup as an interactive prototype"_
- _"Generate accessible prototype code that matches this design system comp"_

---

## 💡 Real-World Examples

### **Scenario: Product Manager needs a user registration flow**

**Ask:** _"Build a complete user registration prototype with email verification and profile setup"_

**Get:** Rapid coded prototype with React/Angular components — perfect for user testing sessions and stakeholder demos.

### **Scenario: Developer converting Figma designs**

**Ask:** _"Convert this dashboard design to prototype code"_ + attach Figma screenshot + JSON export

**Get:** Interactive prototype that matches your design using GoA components. Great for testing user flows and gathering feedback.

### **Scenario: Designer exploring component patterns**

**Ask:** _"What are the best GoA component combinations for an admin interface prototype?"_

**Get:** Comprehensive guidance on layout patterns and component hierarchies to quickly build admin interface prototypes for user testing.

---

## ⚙️ Setup Guide

### Prerequisites

- **Node.js 16+**
- **Claude Desktop App** ([download here](https://claude.ai/download))
- **GitHub account**

### Claude Desktop Setup

1. **Open Claude Desktop Configuration**

   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add the MCP Server Configuration**

   ```json
   {
     "mcpServers": {
       "goa-design-system": {
         "command": "node",
         "args": ["path/to/your/goa-design-system-mcp/dist/index.js"],
         "env": {}
       }
     }
   }
   ```

3. **Replace `path/to/your/`** with your actual codespace or local directory path

4. **Restart Claude Desktop**

### Verifying Setup

Ask Claude: _"What GoA components are available for building forms?"_

If you get detailed component information, you're all set! 🎉

---

## 🎯 Who This Helps

### **👩‍💻 Developers**

- Rapidly prototype complex component combinations for user testing
- Learn GoA Design System implementation patterns through examples
- Convert designs to testable prototypes quickly
- Understand accessibility requirements for government services

### **👨‍🎨 Designers**

- Explore what's possible with existing GoA components
- Get component recommendations for prototype scenarios
- Validate design decisions with interactive prototypes
- Test user flows with real coded interfaces

### **📋 Product Managers**

- Rapidly prototype ideas for user testing and stakeholder demos
- Understand what's technically feasible with current components
- Test user flows with interactive, clickable prototypes
- Communicate feature concepts using real component examples

### **🧪 QA Teams**

- Understand expected component behaviors for testing scenarios
- Prototype edge cases and error states
- Test accessibility features in realistic user scenarios
- Explore component interactions before full development

---

## 🛠️ Technical Details

### **Component Coverage**

- **34 Components:** Forms, navigation, data display, layout, feedback
- **71 Pattern Examples:** Comprehensive implementation patterns for government services
- **2 System Docs:** Setup guides, layout patterns
- **Complete API:** Props, states, accessibility, examples

### **Framework Support**

- **React:** Full component library with TypeScript support
- **Angular:** Complete wrapper components with proper integration
- **Web Components:** Core implementation for any framework

### **AI Optimizations**

- Structured metadata for accurate component recommendations
- 71 comprehensive usage patterns for government service scenarios
- Implementation examples optimized for rapid iteration
- Government service context analysis for citizen/worker workflows
- Accessibility guidance built into prototype suggestions

---

## 🔄 Development Status

**⚠️ Experimental Status:** This is an early-stage experiment in AI-assisted government service prototyping. Features and capabilities are actively evolving.

**Current:** Local MCP server setup (you run it on your machine)  
**Coming Soon:** Hosted version for easier team access and collaboration

**Feedback Welcome:** We're learning what works best for government service teams — share your experience!

---

## 📚 Additional Resources

- **[GoA Design System Documentation](https://design.alberta.ca)**
- **[GitHub Repository](https://github.com/GovAlta/ui-components)**
- **[React Stackblitz Template](https://stackblitz.com/~/github.com/GovAlta/ui-components-react-sandbox)**
- **[Angular Stackblitz Template](https://stackblitz.com/~/github.com/GovAlta/ui-components-angular-sandbox)**

---

---

**Ready to accelerate your government service prototyping?** Start with the [Quick Start](#-quick-start) guide above! 🚀

---

_This is an experimental tool for rapid prototyping and user testing. Generated code is intended for prototype and concept validation purposes._
