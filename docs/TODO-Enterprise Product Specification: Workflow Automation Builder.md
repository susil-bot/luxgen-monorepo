Enterprise Product Specification: Workflow Automation Builder
1. Screen Overview
Why This Screen Exists
The Workflow Automation Builder is the central interface where users design, configure, and manage automated workflows that respond to business events across the LuxGen platform. It eliminates manual, repetitive tasks by allowing users to create conditional logic flows that trigger actions based on learner behavior, commerce events, administrative tasks, and AI-driven insights.

What Business Problem It Solves
Operational Efficiency: Reduces manual work for course creators, admins, and support teams
Revenue Optimization: Automates upsell, cross-sell, and re-engagement campaigns
Learner Experience: Delivers personalized, timely communications and learning paths
Scalability: Enables teams to serve thousands of learners without proportional headcount growth
Compliance: Ensures consistent execution of business rules and certification workflows
What User Problem It Solves
Time Waste: Instructors spend hours on repetitive tasks (welcome emails, certificate generation, reminder sends)
Inconsistency: Manual processes lead to missed follow-ups and inconsistent learner experiences
Context Switching: Users jump between tools to accomplish multi-step workflows
Lack of Visibility: No clear understanding of what happens automatically vs. manually
Technical Barrier: Non-technical users need automation without writing code
Success Metrics
Primary: Number of active workflows per organization
Adoption: % of organizations with at least one published workflow
Efficiency: Hours saved per month (calculated from workflow run frequency)
Reliability: Workflow success rate (target: 99.5%+)
Engagement: Average workflow complexity (number of steps)
KPIs
Workflows created per month
Workflow run volume
Workflow error rate
Time to first workflow (onboarding metric)
Workflows per user type (Owner, Admin, Instructor)
Revenue attributed to automated workflows
Support ticket reduction from automation
2. Screen Metadata
Screen Name: Workflow Automation Builder

Business Domain: Automation

Screen Type: Visual Editor / Configuration Interface

Primary Persona: Admin, Owner

Secondary Persona: Instructor (view-only or limited editing), Operations Manager

Route: /automation/workflows/:workflowId/edit

Breadcrumb: Automation > Workflows > [Workflow Name] > Edit

Parent Screen: Workflow List (/automation/workflows)

Child Screens:

Workflow Run History (/automation/workflows/:workflowId/runs)
Workflow Analytics (/automation/workflows/:workflowId/analytics)
Workflow Version History (/automation/workflows/:workflowId/versions)
Workflow Settings (/automation/workflows/:workflowId/settings)
Related Screens:

Email Template Editor (/automation/templates/:templateId)
Agent Studio (/ai/agents/:agentId)
Marketplace Browse (/marketplace/automation)
Analytics Dashboard (/analytics/automation)
3. Purpose
Primary Goal
Enable non-technical users to create, test, and deploy multi-step automated workflows that respond to business events in real-time.

Secondary Goal
Provide visibility into workflow execution and performance
Allow iterative refinement based on analytics
Support collaboration (comments, versioning, templates)
Enable AI-assisted workflow optimization
Business Value
Cost Reduction: Automate manual tasks (estimated 10-40hours saved per workflow per month)
Revenue Growth: Automated upsell/cross-sell campaigns increase conversion by 15-25%
Retention: Automated engagement workflows reduce churn by 8-12%
Market Differentiation: Workflow automation is a premium feature commanding 30-50% pricing uplift
Customer Value
Time Savings: Instructors and admins reclaim hours weekly
Consistency: Every learner receives the same high-quality experience
Personalization: Automated workflows can be more sophisticated than manual efforts
Peace of Mind: Critical workflows run 24/7 without supervision
Operational Value
Audit Trail: Complete history of what happened, when, and why
Compliance: Automated workflows ensure regulatory requirements are met consistently
Scalability: Same team can support10x learner growth
Insight Generation: Workflow analytics reveal bottlenecks and opportunities
4. Entry Points
Primary Entry Points
Sidebar Navigation: Automation > Workflows section
Dashboard Shortcut: "Create Workflow" card on main dashboard
Contextual Prompt: "Automate this" button on Course Details, Product Details
Template Gallery: Select pre-built workflow template from marketplace
Secondary Entry Points
Global Search: Search for workflow by name, trigger, or action
Command Palette: Cmd+K → "Create Workflow" or "Edit Workflow"
Notification: "Workflow failed" notification → click to edit
Email Link: Weekly automation report → "View Workflow" CTA
Deep Link: Shared workflow link from colleague
Onboarding Wizard: Guided setup during first 7 days
Automation Entry Points
AI Suggestion: "We noticed you manually send welcome emails. Want to automate this?"
Workflow Failure Alert: Email/Slack notification with "Fix Workflow" link
Scheduled Review: Monthly prompt to review/optimize workflows
External Entry Points
API/Webhook: External system triggers workflow creation (e.g., Zapier integration)
Mobile App: "Create Workflow" from mobile automation tab
5. Exit Points
Primary Exit Points
Save & Close: Return to Workflow List
Publish Workflow: Activate workflow and return to list
Test Workflow: Open test panel (drawer) without leaving builder
View Analytics: Navigate to Workflow Analytics screen
Secondary Exit Points
Duplicate Workflow: Create copy and open in new builder instance
Archive Workflow: Deactivate and move to archived list
Delete Workflow: Confirm deletion and return to list
Share Workflow: Open share dialog, generate link
Export Workflow: Download JSON/YAML definition
View Runs: Navigate to Run History screen
Contextual Exit Points
Edit Email Template: Open template editor in new tab/modal
Configure AI Agent: Navigate to Agent Studio for selected AI task
Browse Marketplace: Find additional triggers/actions
View Related Workflows: Navigate to workflows with similar triggers
Settings: Open workflow-level settings (permissions, notifications)
Abandonment Exit Points
Unsaved Changes Warning: Prompt to save draft before leaving
Session Timeout: Auto-save draft, show recovery banner on return
6. User Stories
Happy Path Stories
As an Admin, I want to create a welcome email workflow for new learners so that every enrollment is acknowledged within 5 minutes.

As an Owner, I want to set up an abandoned cart recovery workflow so that we recover15-20% of lost revenue automatically.

As an Instructor, I want to automate certificate generation when learners complete my course so that I don't have to manually issue200+ certificates per month.

As an Operations Manager, I want to create a conditional workflow that routes enterprise learners to a dedicated onboarding path so that high-value customers receive white-glove treatment.

As an Admin, I want to duplicate an existing workflow and modify it for a new course so that I don't have to rebuild logic from scratch.

As an Owner, I want to view analytics on my workflows so that I can identify which automations drive the most revenue and engagement.

Edge Case Stories
As an Admin, I want to be warned when I'm about to publish a workflow with missing required fields so that I don't deploy a broken automation.

As an Instructor, I want to see a clear error message when my workflow fails due to a deleted email template so that I can fix it quickly.

As an Owner, I want to version my workflows so that I can roll back to a previous version if a new change causes problems.

As an Admin, I want to test my workflow with sample data before publishing so that I can verify it works correctly.

As an Operations Manager, I want to be notified when a workflow hasn't run in 30 days so that I can archive unused automations.

Failure Case Stories
As an Admin, I want to receive a Slack notification when my workflow fails 3 times in a row so that I can investigate and fix the issue before it impacts learners.

As an Owner, I want to see which learners were affected by a failed workflow run so that I can manually complete the intended action.

As an Instructor, I want to pause a workflow that's sending incorrect emails so that I can fix it without deleting the entire automation.

As an Admin, I want to be prevented from deleting a trigger that's used by5active workflows so that I don't accidentally break production automations.

As an Owner, I want to restore a deleted workflow from a30-day recycle bin so that I can recover from accidental deletions.

7. Primary Actions
Main CTA
Save Changes (Black button, always visible in sticky footer)
Publish Workflow (Primary action after save, enables workflow)
Secondary CTAs
Test Workflow (Purple outline button, opens test drawer)
Save as Draft (Auto-saves every 10 seconds, manual trigger available)
Discard Changes (Returns to last saved version)
Quick Actions (Toolbar)
Undo (Cmd+Z)
Redo (Cmd+Shift+Z)
Zoom In/Out (Canvas zoom controls)
Fit to Screen (Auto-zoom to show entire workflow)
Toggle Minimap (Show/hide workflow overview)
Add Comment (Annotate workflow for team collaboration)
Bulk Actions (When multiple nodes selected)
Delete Selected (Delete key)
Duplicate Selected (Cmd+D)
Group Selected (Create logical grouping)
Align Nodes (Auto-arrange for clarity)
Keyboard Shortcuts
Cmd+S
Save
Cmd+Enter
Publish
Cmd+T
Test Workflow
Cmd+K
Command Palette (search triggers/actions)
Space + Drag
Pan canvas
Cmd+Scroll
Zoom canvas
/
Quick add node (type to search)
Cmd+F
Find in workflow
Cmd+Shift+D
Duplicate workflow
Esc
Deselect all / Close panel
Context Menu Actions (Right-click on node)
Edit Node
Duplicate Node
Delete Node
Add Note
View Documentation
Copy Node ID (for debugging)
Disable Node (skip in execution without deleting)
8. Information Architecture
Page Hierarchy
┌─────────────────────────────────────────────────────────────────┐
│ Global Header (App-level, always visible)│
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Page Header                                                      │
│ - Breadcrumb                                                     │
│ - Workflow Title (Editable inline)                              │
│ - Status Badge (Draft / Live / Paused / Error)                  │
│ - Last Saved Timestamp                                           │
│ - Action Buttons (Test, Publish, Settings, Share)               │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────┬───────────────┐
│              │                                  │               │
│ Left Sidebar │ Canvas Area│ Right Panel   │
│              │                                  │ (Contextual)  │
│ - Search│ - Workflow Nodes│               │
│ - Triggers   │ - Connections                    │ When node│
│ - Logic│ - Zoom Controls                  │ selected:│
│ - Actions    │ - Minimap                        │ - Config Form │
│ - AI Tools│                                  │ - Validation  │
│              │                                  │ - Help Text   │
│ Collapsible  │ Infinite canvas with pan/zoom    │               │
│              │                                  │ When nothing  │
│              │                                  │ selected:     │
│              │                                  │ - Workflow    │
│              │                                  │   Settings│
│              │                                  │ - AI Suggest  │
│              │                                  │ - Activity│
│              │                                  │   Timeline    │
│              │                                  │               │
└──────────────┴──────────────────────────────────┴───────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Sticky Footer                                                    │
│ - Save Changes (Primary CTA)                                     │
│ - Unsaved Changes Indicator                                      │
│ - Workflow Validation Status                                     │
└─────────────────────────────────────────────────────────────────┘
Responsive Behavior
Desktop (1440px+)

Three-column layout: Sidebar (240px) | Canvas (flexible) | Panel (360px)
All elements visible simultaneously
Minimap visible by default
Laptop (1024-1439px)

Sidebar collapses to icons-only (64px), expands on hover
Panel remains visible but narrower (320px)
Minimap hidden by default, toggle available
Tablet (768-1023px)

Sidebar becomes overlay (triggered by hamburger menu)
Canvas takes full width
Right panel becomes bottom drawer (slides up when node selected)
Toolbar icons condense, some move to overflow menu
Mobile (375-767px)

Full-screen canvas view
Bottom navigation bar with key actions
Sidebar and panel are full-screen overlays
Node configuration opens as full-screen modal
Drag-to-connect becomes tap-to-select-then-tap-target
Minimap removed entirely
9. Wireframe Layout
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [←] Automation > Workflows > New Learner Onboarding        [Test] [•••] [Save]│
│                                                                                  │
│ ✏️ New Learner Onboarding                🟢 LiveLast saved: 2m ago │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬───────────────────────────────────────────────────┬──────────────┐
│              │                                                   │              │
│ 🔍 Search    │                                                   │ CONFIG PANEL │
│              │    ┌─────────────────────┐                        │              │
│ TRIGGERS     │    │ 🎯 NEW LEARNER      │                        │ Send Welcome │
│ ○ New Learner│    │    ENROLLMENT│                        │ Email        │
│ ○ New Sale│    │                     │                        │              │
│ ○ Course     │    │ Runs when learner   │                        │┌──────────┐ │
│   Complete   │    │ joins any course    │                        │ │Template: │ │
│              │    └──────────┬──────────┘                        │ │Onboarding│ │
│ LOGIC        │               │                                   │ │_Welcome│ │
│ ○ Condition│               ▼                                   │ └──────────┘ │
│ ○ Delay      │    ┌─────────────────────┐                        │              │
│ ○ Branch     │    │ ✉️ SEND WELCOME     │◄─── Selected│ Recipient:│
│              │    │    EMAIL            │                        │ {{learner.   │
│ ACTIONS      │    │                     │                        │  email}}     │
│ ○ Send Email│    │ Template:│                        │              │
│ ○ Assign     │    │ Onboarding_Welcome  │                        │☑ Track│
│   Course     │    └──────────┬──────────┘                        │   opens      │
│ ○ Generate   │               │                                   ││
│   Certificate│               ▼                                   │ [Preview]    │
│              │    ┌─────────────────────┐                        │              │
│ AI TOOLS│    │ ⏱️ DELAY│                        │ [Delete]     │
│ ○ AI Task    │    │    24 hours         │                        │              │
│ ○ Sentiment  │    │                     │                        │              │
│ ○ Recommend  │    └──────────┬──────────┘                        │              │
│              │               │                                   │              │
│ [+ Add Step] │               ▼                                   │              │
│              │    ┌─────────────────────┐                        │              │
││    │ 🤖 AI TASK          │                        │              │
│              │    │    Personalize Path │                        │              │
│              │    │                     │                        │              │
│              │    │ Agent: Curriculum   │                        │              │
│              │    │        Advisor│                        │              │
│              │    └─────────────────────┘                        │              │
│              │                                                   │              │
│              │  [Zoom: 100%]  [Fit]  [Minimap ☑]               │              │
│              │                                                   │              │
│              │  ┌─────────────────┐                             │              │
│              │  │ Minimap         │                             │              │
│              │  │ ┌─┐│                             │              │
│              │  │ │█│             │                             │              │
│              │  │ └┬┘             │                             │              │
│              │  │  █│                             │              │
│              │  │  █              │                             │              │
│              │  └─────────────────┘                             │              │
└──────────────┴───────────────────────────────────────────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Unsaved changes[Discard] [Save as Draft] [Save & Publish] │
└─────────────────────────────────────────────────────────────────────────────────┘
Detailed Component Placement
Top Header (Fixed,64px height)

Left: Back arrow, Breadcrumb navigation
Center: Workflow title (editable inline), Status badge
Right: Test button, More menu (•••), Primary action button
Left Sidebar (240px width, collapsible to64px)

Search bar at top
Categorized list of draggable elements
Accordion sections (Triggers, Logic, Actions, AI Tools)
Each item shows icon + label
Hover shows description tooltip
Drag-and-drop to canvas to add
Canvas Area (Flexible width, fills remaining space)

Infinite pan/zoom workspace
Grid background (subtle, helps with alignment)
Workflow nodes arranged vertically by default
Connectors show flow direction with arrows
Zoom controls in bottom-left (-,100%, +, Fit)
Minimap in bottom-right (toggleable)
Empty state shows "Drag a trigger to start" with visual guide
Right Panel (360px width, contextual)

Configuration form when node selected
Tabs: Configure | Test | History | Help
Form fields appropriate to node type
Validation errors inline
AI suggestions at bottom
Activity timeline when no node selected
Sticky Footer (Fixed, 56px height)

Left: Unsaved changes indicator with count
Center: Validation status (✓ Ready to publish |⚠️ 2 errors)
Right: Action buttons (Discard, Save Draft, Save & Publish)
10. Components
Navigation Components
Breadcrumb: Hierarchical navigation with separators
Back Button: Returns to workflow list
Sidebar Accordion: Collapsible sections for element categories
Input Components
Inline Title Editor: Click to edit workflow name
Search Bar: Filter available triggers/actions
Text Input: Single-line fields (email subject, delay duration)
Textarea: Multi-line fields (email body, conditions)
Dropdown Select: Choose from predefined options (templates, agents)
Autocomplete: Type-ahead for dynamic variables
Toggle Switch: Binary options (track opens, ignore unsubscribe)
Radio Buttons: Mutually exclusive choices (learner type)
Checkbox: Multiple selections (advanced settings)
Rich Text Editor: Email template editing (inline or modal)
Code Editor: Advanced users can edit JSON/expressions
Date Picker: Schedule workflow runs
Time Picker: Set specific execution times
Duration Picker: Delay intervals (hours, days, weeks)
Display Components
Status Badge: Visual indicator (Live, Draft, Paused, Error)
Timestamp: Relative time (2m ago) with tooltip showing absolute
Avatar: User who created/modified workflow
Icon: Contextual icons for each node type
Tooltip: Hover explanations for all elements
Help Text: Inline guidance below form fields
Validation Message: Error/warning/success feedback
Empty State: Visual guide when canvas is empty
Skeleton Loader: During initial load or heavy operations
Action Components
Primary Button: Main CTAs (Save, Publish)
Secondary Button: Supporting actions (Test, Discard)
Tertiary Button: Low-emphasis actions (Preview, Cancel)
Icon Button: Compact actions (zoom, settings, more menu)
Split Button: Primary action + dropdown for alternatives
Floating Action Button: Quick add node (mobile)
Data Display Components
Workflow Node Card: Visual representation of each step- Header: Icon + Title
Body: Key configuration summary
Footer: Status indicator- Connectors: Input/output ports
Connector Line: Bezier curves showing flow direction
Minimap: Bird's-eye view of entire workflow
Activity Timeline: Chronological list of workflow events
Run History Table: Past executions with status
Analytics Card: Key metrics (runs, success rate, avg duration)
Feedback Components
Toast Notification: Temporary success/error messages
Inline Alert: Persistent warnings within panel
Modal Dialog: Confirmation prompts (delete, discard)
Drawer: Slide-out panels (test results, settings)
Progress Bar: Long-running operations (publishing)
Loading Spinner: Inline loading states
Advanced Components
Command Palette: Cmd+K quick search for actions
Context Menu: Right-click options on nodes
AI Suggestion Card: Proactive optimization recommendations
Version Diff Viewer: Compare workflow versions
Comment Thread: Collaborative annotations
Zoom Controls: Pan, zoom, fit-to-screen
Grid Overlay: Optional alignment guide
Selection Box: Multi-select nodes by dragging
11. Data Model
Core Entities
Workflow
type Workflow {
  id: ID!
  organizationId: ID!
  name: String!
  description: String
  status: WorkflowStatus! # DRAFT, LIVE, PAUSED, ARCHIVED
  version: Int!
  createdBy: User!
  createdAt: DateTime!
  updatedAt: DateTime!
  publishedAt: DateTime
  publishedBy: User
  
  # Configuration
  trigger: WorkflowTrigger!
  steps: [WorkflowStep!]!
  settings: WorkflowSettings!
  
  # Metadata
  tags: [String!]
  category: WorkflowCategory # LEARNING, COMMERCE, ENGAGEMENT, ADMIN
  isTemplate: Boolean!
  parentTemplateId: ID
  
  # Analytics
  totalRuns: Int!
  successfulRuns: Int!
  failedRuns: Int!
  lastRunAt: DateTime
  averageDuration: Int # milliseconds
  
  # Relationships
  runs: [WorkflowRun!]! @connection
  versions: [WorkflowVersion!]! @connection
  comments: [Comment!]! @connection
}
WorkflowTrigger
type WorkflowTrigger {
  id: ID!
  type: TriggerType! # NEW_LEARNER, NEW_SALE, COURSE_COMPLETE, SCHEDULE, WEBHOOK
  config: JSON!
  
  # Filters
  conditions: [TriggerCondition!]
  
  # Examples:
  # NEW_LEARNER: { courseIds: [ID], tags: [String] }
  # SCHEDULE: { cron: "0 9 * * *", timezone: "America/New_York" }
  # WEBHOOK: { url: String, secret: String }
}
WorkflowStep
type WorkflowStep {
  id: ID!
  workflowId: ID!
  type: StepType! # ACTION, LOGIC, AI
  position: Int!
  
  # Configuration
  config: JSON!
  
  # Relationships
  parentStepId: ID # For branching logic
  nextStepId: ID
  
  # Examples:
  # SEND_EMAIL: { templateId, recipient, subject, body }
  # DELAY: { duration, unit }
  # CONDITION: { field, operator, value, trueStepId, falseStepId }
  # AI_TASK: { agentId, prompt, outputField }
}

enum StepType {
  # ActionsSEND_EMAIL
  ASSIGN_COURSE
  GENERATE_CERTIFICATE
  CREATE_TASK
  SEND_NOTIFICATION
  WEBHOOK
  
  # Logic
  CONDITION
  DELAY
  BRANCH
  LOOP
  
  # AI
  AI_TASK
  AI_SENTIMENT
  AI_RECOMMEND
  AI_GENERATE
}
WorkflowRun
type WorkflowRun {
  id: ID!
  workflowId: ID!
  workflowVersion: Int!
  
  status: RunStatus! # PENDING, RUNNING, SUCCESS, FAILED, CANCELLED
  startedAt: DateTime!
  completedAt: DateTime
  duration: Int # milliseconds
  
  # Context
  triggerId: ID
  triggerData: JSON! # Snapshot of data that triggered the run
  
  # Execution
  steps: [StepRun!]!
  
  # Results
  output: JSON
  error: Error
  
  # Relationships
  workflow: Workflow!
  triggeredBy: User # For manual runs
}
StepRun
type StepRun {
  id: ID!
  workflowRunId: ID!
  stepId: ID!
  
  status: RunStatus!
  startedAt: DateTime!
  completedAt: DateTime
  duration: Int
  
  input: JSON!
  output: JSON
  error: Error
  
  # Retries
  attemptNumber: Int!
  maxAttempts: Int!
}
Displayed Fields (Node Card)
Icon (based on step type)
Title (user-defined or default)
Key configuration summary (e.g., "Template: Onboarding_Welcome_v1")
Status indicator (when viewing run history)
Editable Fields (Right Panel)
All configuration fields specific to step type
Title/description
Conditions/filters
Variable mappings
Advanced settings
Computed Fields
totalRuns, successfulRuns, failedRuns (aggregated from WorkflowRun)
averageDuration (calculated from completed runs)
successRate (successfulRuns / totalRuns * 100)
lastModifiedBy (derived from audit log)
Hidden Fields (Not shown in UI, used internally)
organizationId (tenant isolation)
version (internal versioning for rollback)
deletedAt (soft delete timestamp)
archivedAt (archive timestamp)
Audit Fields (Shown in activity timeline)
createdAt, createdBy
updatedAt, updatedBy
publishedAt, publishedBy
archivedAt, archivedBy
12. GraphQL Mapping
Queries
# Get single workflow with all details
query GetWorkflow($id: ID!) {
  workflow(id: $id) {
    id
    name
    description
    status
    version
    trigger {
      id
      type
      config
      conditions {
        field
        operator
        value
      }
    }
    steps {
      id
      type
      position
      config
      parentStepId
      nextStepId
    }
    settings {
      notifications {
        onSuccess
        onFailure
        recipients}
      retryPolicy {
        maxAttempts
        backoffMultiplier
      }
    }
    createdBy {
      id
      name
      avatar
    }
    createdAt
    updatedAt
    publishedAt
    totalRuns
    successfulRuns
    failedRuns
    lastRunAt
    averageDuration}
}

# List workflows with filtering
query ListWorkflows(
  $organizationId: ID!
  $filter: WorkflowFilter
  $sort: WorkflowSort
  $pagination: PaginationInput!
) {
  workflows(
    organizationId: $organizationId
    filter: $filter
    sort: $sort
    pagination: $pagination
  ) {
    edges {
      node {
        id
        name
        status
        trigger {
          type}
        totalRuns
        successfulRuns
        lastRunAt
        updatedAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}

# Get available triggers/actions for sidebar
query GetWorkflowElements {
  workflowElements {
    triggers {
      type
      name
      description
      icon
      category
      configSchema}
    actions {
      type
      name
      description
      icon
      category
      configSchema
    }
    logic {
      type
      name
      description
      icon
      category
      configSchema
    }
  }
}

# Get workflow run history
query GetWorkflowRuns(
  $workflowId: ID!
  $pagination: PaginationInput!
) {
  workflowRuns(
    workflowId: $workflowId
    pagination: $pagination
  ) {
    edges {
      node {
        id
        status
        startedAt
        completedAt
        duration
        triggerData
        steps {
          id
          stepId
          status
          duration
          error {
            message
            code
          }
        }
      }
    }
    pageInfo {
      hasNextPage
    }
    totalCount
  }
}
Mutations
# Create new workflow
mutation CreateWorkflow($input: CreateWorkflowInput!) {
  createWorkflow(input: $input) {
    workflow {
      id
      name
      status}
    errors {
      field
      message
    }
  }
}

# Update workflow configuration
mutation UpdateWorkflow($id: ID!, $input: UpdateWorkflowInput!) {
  updateWorkflow(id: $id, input: $input) {
    workflow {
      id
      name
      version
      updatedAt
    }
    errors {
      field
      message
    }
  }
}

# Add step to workflow
mutation AddWorkflowStep($workflowId: ID!, $input: AddStepInput!) {
  addWorkflowStep(workflowId: $workflowId, input: $input) {
    step {
      id
      type
      position
      config
    }
    errors {
      field
      message
    }
  }
}

# Update step configuration
mutation UpdateWorkflowStep($id: ID!, $input: UpdateStepInput!) {
  updateWorkflowStep(id: $id, input: $input) {
    step {
      id
      config
    }
    errors {
      field
      message
    }
  }
}

# Delete step
mutation DeleteWorkflowStep($id: ID!) {
  deleteWorkflowStep(id: $id) {
    success
    workflowId}
}

# Publish workflow
mutation PublishWorkflow($id: ID!) {
  publishWorkflow(id: $id) {
    workflow {
      id
      status
      versionpublishedAt
      publishedBy {
        id
        name}
    }
    errors {
      message
    }
  }
}

# Pause workflow
mutation PauseWorkflow($id: ID!) {
  pauseWorkflow(id: $id) {
    workflow {
      id
      status
    }
  }
}

# Test workflow with sample data
mutation TestWorkflow($id: ID!, $testData: JSON!) {
  testWorkflow(id: $id, testData: $testData) {
    run {
      id
      status
      steps {
        id
        status
        output
        error {
          message}
      }
    }errors {
      message
    }
  }
}

# Duplicate workflow
mutation DuplicateWorkflow($id: ID!, $name: String!) {
  duplicateWorkflow(id: $id, name: $name) {
    workflow {
      id
      name
    }
  }
}

# Archive workflow
mutation ArchiveWorkflow($id: ID!) {
  archiveWorkflow(id: $id) {
    workflow {
      id
      status
      archivedAt
    }
  }
}
Subscriptions
# Real-time workflow run updates
subscription OnWorkflowRunUpdate($workflowId: ID!) {
  workflowRunUpdated(workflowId: $workflowId) {
    run {
      id
      status
      steps {
        id
        status
        duration}
    }
  }
}

# Real-time workflow edit notifications (collaborative editing)
subscription OnWorkflowEdited($workflowId: ID!) {
  workflowEdited(workflowId: $workflowId) {
    userId
    userName
    field
    timestamp}
}
Pagination Strategy
Cursor-based pagination for workflow runs (infinite scroll)
Offset-based pagination for workflow list (traditional pages)
Page size: Default 25, max 100
Prefetch: Load next page when user scrolls to80% of current page
Filtering
Status: Draft, Live, Paused, Archived
Trigger Type: New Learner, New Sale, Course Complete, etc.
Category: Learning, Commerce, Engagement, Admin
Created By: User ID
Date Range: Created/Updated between dates
Tags: Array of tag strings
Search: Full-text search on name and description
Sorting
Last Updated (default)
Name (A-Z, Z-A)
Total Runs (High-Low, Low-High)
Success Rate (High-Low, Low-High)
Created Date (Newest, Oldest)
Caching Strategy
Workflow Details: Cache for 5 minutes, invalidate on mutation
Workflow List: Cache for 1 minute, invalidate on create/delete
Run History: Cache for 30 seconds, invalidate on new run
Available Elements: Cache indefinitely (rarely changes)
Optimistic Updates
Add Step: Immediately show new step with loading state
Update Step Config: Update UI instantly, rollback on error
Reorder Steps: Drag-and-drop feels instant, sync in background
Rename Workflow: Inline edit updates immediately
Permissions (Field-level)
Owner/Admin: Full access to all fields
Instructor: Read-only for workflows created by others, full access to own
Learner: No access to this screen
Support: Read-only access for debugging
13. Business Rules
Workflow Lifecycle Rules
Draft Workflows

Cannot execute automatically
Can be edited freely without versioning
Do not appear in analytics
Can be tested with sample data
Auto-save every 10 seconds
Publishing Rules

Must have exactly one trigger
Must have at least one action
All required configuration fields must be filled
All email templates referenced must exist and be published
All AI agents referenced must be active
Cannot publish if validation errors exist
Creates a new version on each publish
Live Workflows

Execute automatically based on trigger
Cannot be edited directly (must pause first, or create new version)
Edits create a new draft version
Can be paused by Owner/Admin only
Appear in analytics and reporting
Paused Workflows

Do not execute automatically
Preserve all configuration
Can be resumed by Owner/Admin
Can be edited (creates new version on resume)
Runs triggered before pause complete execution
Archived Workflows

Do not execute
Read-only
Hidden from main list (accessible via filter)
Can be restored by Owner/Admin
Cannot be deleted for 30 days (compliance)
Permission Rules
Creation

Owner, Admin: Can create workflows
Instructor: Can create workflows scoped to their courses only
Learner: Cannot create workflows
Editing

Owner, Admin: Can edit any workflow
Instructor: Can edit workflows they created
Cannot edit live workflows (must pause first)
Deletion

Owner, Admin: Can delete draft workflows
Cannot delete live workflows (must archive first)
Archived workflows can be permanently deleted after 30 days
Deleting a workflow does not delete historical run data
Publishing

Owner, Admin: Can publish any workflow
Instructor: Can publish workflows they created (if org settings allow)
Publishing requires passing all validation checks
Execution Rules
Trigger Constraints

Workflows can only have one trigger
Triggers cannot be changed on live workflows
Trigger conditions are evaluated in real-time
Failed trigger evaluation logs error but doesn't create run
Step Execution

Steps execute sequentially unless branching logic is used
Failed steps halt workflow execution
Steps can be retried based on retry policy (max 3 attempts)
Delay steps do not block other workflows
AI steps have 60-second timeout by default
Concurrency

Multiple instances of same workflow can run simultaneously
No limit on concurrent runs per workflow
Rate limiting: Max 1000 runs per workflow per hour (prevents runaway)
If rate limit exceeded, runs queue and execute when capacity available
Data Rules
Variable Scope

Trigger data available to all steps
Step output available to subsequent steps only
Variables must be explicitly mapped between steps
Undefined variables render as empty string (not error)
Email Rules

Email templates must be published before use in workflows
Recipient must be a valid email address or variable resolving to one
Sending to unsubscribed users is blocked (unless override enabled)
Max 10,000 emails per workflow per day
AI Rules

AI agents must be active and accessible to workflow creator
AI steps consume credits from organization quota
If quota exhausted, step fails with clear error message
AI outputs are logged for audit purposes
Validation Rules
Structural Validation

No orphaned steps (all steps must be connected to trigger)
No circular dependencies
Branch conditions must have both true/false paths defined
Delay steps must have positive duration
Configuration Validation

Email steps must have recipient, subject, and body/template
AI steps must have agent and prompt
Condition steps must have valid comparison operator
Webhook steps must have valid URL
14. Validation Rules
Required Fields (Cannot publish without)
Workflow Level

name (1-100 characters, unique within organization)
trigger (exactly one, fully configured)
steps (at least one action step)
Trigger Level

type (must be valid TriggerType enum)
config (all required fields for trigger type)
Example: NEW_LEARNER trigger requires no additional config- Example: SCHEDULE trigger requires cron and timezone
Step Level

type (must be valid StepType enum)
config (all required fields for step type)
SEND_EMAIL: recipient, subject, body OR templateId
DELAY: duration, unit
CONDITION: field, operator, value, trueStepId, falseStepId
AI_TASK: agentId, prompt
Optional Fields
Workflow Level

description (0-500 characters, supports markdown)
tags (max 10 tags, each 1-30 characters)
category (defaults to LEARNING)
Step Level

title (custom name, defaults to step type)
description (notes for team collaboration)
Character Limits
Workflow name: 1-100 characters
Workflow description: 0-500 characters
Step title: 1-100 characters
Step description: 0-500 characters
Email subject: 1-200 characters
Email body: 1-50,000 characters
Tag: 1-30 characters
Variable name: 1-50 characters (alphanumeric + underscore)
Duplicate Checks
Workflow name: Must be unique within organization
Error: "A workflow with this name already exists"- Suggestion: Append " (Copy)" or " (2)" automatically
Step IDs: Must be unique within workflow (enforced at DB level)
Warnings (Non-blocking, but shown to user)
No delay between email steps: "Sending multiple emails without delay may trigger spam filters"
Long workflow (>10 steps): "Consider breaking this into multiple workflows for easier maintenance"
No error handling: "Add conditional logic to handle failures gracefully"
Unused variables: "Variable {{x}} is defined but never used"
AI step without fallback: "Consider adding a fallback action if AI step fails"
Confirmation Dialogs (Require explicit user action)
Publish workflow: "Publishing will activate this workflow. It will run automatically based on the trigger. Continue?"
Delete step: "Deleting this step will break the workflow. Are you sure?"
Discard changes: "You have unsaved changes. Discard them?"
Archive workflow: "Archiving will stop this workflow. You can restore it later. Continue?"
Delete workflow: "This will permanently delete the workflow and all run history. This cannot be undone. Type 'DELETE' to confirm."
Autosave Behavior
Trigger: Every 10 seconds if changes detected
Conflict Resolution: Last-write-wins (with warning if another user edited)
Visual Indicator: "Saving..." → "Saved 10s ago"
Failure Handling: If autosave fails, show persistent warning banner with "Retry" button
Draft Preservation: Drafts saved for 90 days, then auto-deleted
Real-time Validation (As user types/edits)
Email address format: Show error if invalid email in recipient field
Variable syntax: Highlight if variable syntax is incorrect (e.g., {learner.email} instead of {{learner.email}})
Cron expression: Validate and show next5 execution times
URL format: Validate webhook URLs
JSON syntax: Validate custom JSON configuration
Pre-publish Validation (Blocks publish if failed)
Structural checks

All steps connected to trigger (no orphans)
No circular dependencies
All branch paths defined
Configuration checks

All required fields filled
All referenced resources exist (templates, agents)
All variables resolve correctly
Permission checks

User has permission to publish
Organization has not exceeded workflow limit
All referenced resources are accessible
Business rule checks

Email sending limits not exceeded
AI credit quota available
No conflicting workflows (e.g., duplicate triggers)
Error Messages (Clear, actionable)
❌ Bad: "Invalid configuration"
✅ Good: "Email template'Welcome_v1' not found. Please select a different template or create this template first."

❌ Bad: "Step failed"
✅ Good: "Delay step requires a duration. Please enter a number of hours, days, or weeks."

❌ Bad: "Cannot publish"
✅ Good: "Cannot publish:2 errors found. Fix them to continue: (1) Email step missing recipient, (2) Condition step missing true path."
15. States
Loading States
Initial Load ┌─────────────────────────────────────┐ │ [Skeleton Header]│ │ │ │ [Skeleton Sidebar] [Skeleton Canvas]│ │ │ │ Loading workflow... │ └─────────────────────────────────────┘

Show skeleton UI for header, sidebar, canvas
Display "Loading workflow..." message
Animate skeleton to indicate progress
Timeout after 10 seconds with error message
Saving State Footer: "Saving..." [Spinner]

Show spinner next to "Saving..." text
Disable primary action buttons during save
On success: "Saved 10s ago"
On failure: "Failed to save. Retry?"
Publishing State Modal: ┌─────────────────────────────────────┐ │ Publishing workflow... │ │ [Progress bar: 60%] │ │ │ │ ✓ Validating configuration │ │ ✓ Checking permissions │ │ ⟳ Activating trigger...│ │ Notifying team... │ └─────────────────────────────────────┘

Show modal with progress bar
List steps being executed
Cannot be cancelled once started
On success: Close modal, show toast "Workflow published successfully"
On failure: Show error in modal with "Retry" button
Empty States
No Workflows (First Use) ┌─────────────────────────────────────┐ │ │ │ [Illustration]│ │ │ │ Automate your workflows │ │ Create your first workflow to│ │ save time on repetitive tasks. │ │ │ │[Create Workflow] │ │[Browse Templates] │ │ │ └─────────────────────────────────────┘

Show welcoming illustration
Clear headline and description
Primary CTA: Create Workflow
Secondary CTA: Browse Templates
Link to documentation
Empty Canvas (New Workflow) ┌─────────────────────────────────────┐ │ │ │ [Drag icon animation] │ │ │ │ Drag a trigger from the left │ │ sidebar to start building │ │ your workflow │ │ │ │ [Visual guide arrow←] │ │ │ └─────────────────────────────────────┘

Animated visual guide pointing to sidebar
Clear instruction text
Highlight "Triggers" section in sidebar
No Run History Right Panel: ┌─────────────────────────────────────┐ │ No runs yet │ │ │ │ This workflow hasn't run yet. │ │ Publish it to start tracking runs. │ │ │ │ [Test Workflow] │ └─────────────────────────────────────┘

Error States
Validation Error Right Panel (when step selected): ┌─────────────────────────────────────┐ │ Send Welcome Email │ │ │ │ Recipient: │ │ [ ]❌ │ │ ⚠️ Email address required│ │ │ │ Subject: │ │ [Welcome to LuxGen] ✓│ └─────────────────────────────────────┘

Inline error messages below fields
Red border on invalid fields
Error icon in footer: "2 errors prevent publishing"
Workflow Failed Toast notification: ┌─────────────────────────────────────┐ │ ❌ Workflow "New Learner Onboarding"│ │ failed │ │ │ │ 3 runs failed in the last hour.│ │ [View Details] [Pause Workflow] │ └─────────────────────────────────────┘

Persistent notification until dismissed
Clear description of failure
Actionable buttons
Network Error Banner (top of screen): ┌─────────────────────────────────────┐ │ ⚠️ Connection lost. Changes are│ │ saved locally and will sync when │ │ you're back online. │ │ [Retry Now] │ └─────────────────────────────────────┘

Non-blocking banner
Reassure user that data is safe
Provide manual retry option
Offline State
Banner:
┌─────────────────────────────────────┐
│ 📡 You're offline. You can view this│
│    workflow but cannot make changes.│
└─────────────────────────────────────┘
Canvas is read-only
All edit actions disabled
Auto-reconnect when online
Permission Denied State
Full screen:
┌─────────────────────────────────────┐
│                                     │
│         [Lock icon]                 │
│                                     │
│   You don't have permission         │
│   to edit this workflow             │
│                                     │
│   Contact the workflow owner or│
│   your admin to request access.     │
│                                     │
│   [Back to Workflows]               │
│                     │
└─────────────────────────────────────┘
Clear explanation
Suggest next steps
Provide exit action
Archived State
Banner:
┌─────────────────────────────────────┐
│ 📦 This workflow is archived and    │
│    won't run automatically.         │
│    [Restore] [Delete Permanently]   │
└─────────────────────────────────────┘
Canvas is read-only
Prominent restore action
Warning before permanent deletion
Read-Only State (Viewing published workflow)
Banner:
┌─────────────────────────────────────┐
│ 🔒 This workflow is live. To make│
│    changes, create a new version.   │
│    [Create New Version]             │
└─────────────────────────────────────┘
All fields disabled
Clear explanation
Provide action to create editable version
Success State
Publish Success Toast: ┌─────────────────────────────────────┐ │ ✅ Workflow published successfully │ │ │ │ "New Learner Onboarding" is now │ │ running automatically. │ │ [View Analytics] │ └─────────────────────────────────────┘

Auto-dismiss after 5 seconds
Provide next action
Test Success Right Panel: ┌─────────────────────────────────────┐ │ Test Results│ │ │ │ ✅ Workflow completed successfully │ │ │ │ Duration: 2.3s │ │ │ │ Steps: │ │ ✅ New Learner Enrollment (0.1s) │ │ ✅ Send Welcome Email (1.8s) │ │ ✅ Delay 24hours (simulated) │ │ ✅ AI Task (0.4s) │ │ │ │ [View Full Output] [Test Again] │ └─────────────────────────────────────┘

Partial Failure State
Some Runs Failed Toast: ┌─────────────────────────────────────┐ │⚠️ Workflow "New Learner Onboarding"│ │ has errors│ │ │ │ 3 of 50 runs failed today. │ │ Most common error: Email template │ │ not found. │ │ [View Failed Runs] [Pause Workflow] │ └─────────────────────────────────────┘

Skeleton State (During lazy loading)
Right Panel (loading step configuration):
┌─────────────────────────────────────┐
│ [████████████        ]              │
│                                     │
│ [████████    ]│
│ [█████████████████████]│
│                                     │
│ [████████    ]                      │
│ [█████████████████████]             │
└─────────────────────────────────────┘
Animated shimmer effect
Preserve layout structure
16. Filters
Search
Global Search (Top of sidebar) ┌─────────────────────────────────────┐ │ 🔍 Search triggers, actions, logic│ └─────────────────────────────────────┘

Real-time filtering as user types
Searches: trigger names, action names, descriptions, tags
Highlights matching text
Shows "No results" if no matches
Clears with X button or Esc key
Search Behavior

Minimum 2 characters to trigger search
Debounced (300ms delay)
Case-insensitive
Partial match (e.g., "email" matches "Send Email", "Email Template")
Keyboard navigation: Arrow keys to navigate results, Enter to select
Sort (On workflow list, not builder screen)
Not applicable to builder screen itself, but relevant for parent Workflow List screen.

Category Filter (Sidebar)
Accordion Sections ``` ▼ TRIGGERS (5) ○ New Learner ○ New Sale ○ Course Complete ○ Schedule ○ Webhook

▼ LOGIC (3) ○ Condition ○ Delay ○ Branch

▼ ACTIONS (8) ○ Send Email ○ Assign Course ○ Generate Certificate ...

▼ AI TOOLS (4) ○ AI Task ○ Sentiment Analysis ○ Recommendation ○ Generate Content ```

Collapsible sections (default: all expanded)
Count badge shows number of items in category
Click section header to collapse/expand
Persist collapse state in localStorage
Status Filter (Not on builder, but on workflow list)
Not applicable to builder screen.

Date Range Filter
Not applicable to builder screen (relevant for run history).

Tag Filter
Not applicable to builder screen (relevant for workflow list).

Custom Filters
AI Suggestions Toggle Right Panel (when no node selected): ┌─────────────────────────────────────┐ │ AI Suggestions │ │ [Toggle: ON] │ │ │ │ 💡 Add a delay between emails to │ │ improve deliverability │ │ [Apply] │ └─────────────────────────────────────┘

User can toggle AI suggestions on/off
Preference persists across sessions
Show Minimap Canvas Controls: [Zoom: 100%] [Fit] [Minimap ☑]

Checkbox to show/hide minimap
Preference persists across sessions
Saved Views
Not applicable to builder screen (relevant for workflow list).

17. Tables
Workflow Run History Table (Accessed from workflow list, not builder)
While the builder itself doesn't contain a table, the related "Run History" screen does. For completeness:

Columns

Status (icon + text)
Trigger (event that started run)
Started At (relative time with tooltip)
Duration (formatted:2.3s, 1m 45s)
Steps Completed (5/5, 3/5 with warning)
Actions (View Details, Retry, Cancel)
Sorting

Default: Started At (newest first)
Sortable: Started At, Duration, Status
Grouping

Group by Status (Success, Failed, Running)
Group by Date (Today, Yesterday, Last 7 Days)
Pinning

Not applicable (no pinned columns needed)
Bulk Select

Select multiple failed runs
Bulk actions: Retry Selected, Export Selected
Expandable Rows

Click row to expand and see step-by-step execution
Shows input/output for each step
Shows error details if failed
Pagination

Cursor-based (infinite scroll)
Load25 runs at a time
"Load More" button at bottom
CSV Export

Export all runs (or filtered subset) to CSV
Includes: Run ID, Status, Started At, Duration, Trigger Data, Error Message
18. Forms
Workflow Settings Form (Right panel when no node selected)
Field Groups

1. General Settings ``` Workflow Name [New Learner Onboarding ]

Description (optional) [Automatically send welcome emails and] [personalize learning paths for new ] [learners. ]

Category [Learning▾]

Tags [+ Add tag] ```

2. Notification Settings ``` Notify on success [Toggle: OFF]

Notify on failure [Toggle: ON]

Recipients [admin@luxgen.com ] [+ Add recipient]

Notification channels ☑ Email ☑ Slack ☐ Push notification ```

3. Retry Policy ``` Max retry attempts [3 ▾]

Backoff strategy [Exponential ▾]

Initial delay [30 seconds ▾] ```

4. Advanced Settings ☐ Allow concurrent runs ☐ Skip if already running ☐ Log detailed execution data

Step Configuration Form (Right panel when node selected)
Example: Send Email Step

Tabs: [Configure] [Test] [History] [Help]

Configure Tab ``` Template [Onboarding_Welcome_v1 ▾] [Preview Template]

Recipient [{{learner.email}} ] 💡 Use {{variable}} syntax

Subject [Welcome to LuxGen! ]

Body (if not using template) [ ] [ ] [ ]

▼ Advanced Settings☑ Track opens and clicks ☐ Ignore unsubscribe list Send from [noreply@luxgen.com ▾]

Reply-to [support@luxgen.com ] ```

Test Tab ``` Test this step with sample data

Sample recipient [test@example.com ]

[Send Test Email]

Last test: 2 minutes ago ✅ Success ```

History Tab ``` Recent runs of this step:

✅ 2 minutes ago - Sent to learner@example.com ✅ 5 minutes ago - Sent to another@example.com ❌ 10 minutes ago - Failed: Template not found ```

Help Tab ``` Send Email

This action sends an email using a predefined template or custom content.

Available variables:

{{learner.email}}
{{learner.name}}
{{learner.enrollmentDate}}
{{course.name}}
[View full documentation →] ```

Validation
Real-time Validation

Show error icon next to field immediately
Display error message below field
Red border on invalid field
On Blur Validation

Validate email format when user leaves field
Validate variable syntax
Check if referenced template exists
Pre-submit Validation

Cannot save if required fields empty
Show summary of all errors at top of form
Autosave
Autosave every 10 seconds if changes detected
Visual indicator: "Saving..." → "Saved 10s ago"
Autosave applies to entire workflow, not individual fields
Dependencies
Conditional Fields

If "Use template" is ON, hide "Body" field
If "Track opens" is ON, show "Tracking pixel settings"
If "Retry on failure" is ON, show "Max retries" field
Example: Condition Step ``` Field [learner.enrollmentDate ▾]

Operator [is within last▾]

Value [7 days ▾]

─────────────────────────────────────

If TRUE, then: [Send Email: Welcome_v1 ▾]

If FALSE, then: [Send Email: Re-engagement▾] ```

True/False paths only appear after condition is defined
Multi-step Wizard
Not applicable to workflow builder (entire workflow is the "wizard").

Draft Support
All changes auto-saved as draft
Draft persists until user publishes or discards
Draft visible only to creator (not shared)
Draft can be abandoned (auto-deleted after 90 days)
19. Notifications
Toast Notifications (Temporary, auto-dismiss)
Success ┌─────────────────────────────────────┐ │ ✅ Workflow saved successfully │ └─────────────────────────────────────┘

Duration: 3 seconds
Position: Bottom-right
Dismissible: Click X or auto-dismiss
Error ┌─────────────────────────────────────┐ │ ❌ Failed to save workflow │ │ Network error. Please try again. │ │ [Retry] │ └─────────────────────────────────────┘

Duration: 5 seconds (or until dismissed)
Position: Bottom-right
Dismissible: Click X
Warning ┌─────────────────────────────────────┐ │ ⚠️ This workflow hasn't run in 30│ │ days. Consider archiving it. │ │ [Archive] [Dismiss] │ └─────────────────────────────────────┘

Duration: 10 seconds
Position: Bottom-right
Dismissible: Click X or action button
Inline Notifications (Persistent within context)
Validation Error (Right panel) ┌─────────────────────────────────────┐ │ ⚠️ 2 errors prevent publishing│ │ │ │ • Email step missing recipient │ │ • Condition step missing false path │ │ │ │ [Fix Errors] │ └─────────────────────────────────────┘

Remains visible until errors fixed
Click "Fix Errors" to jump to first error
Info Banner (Top of canvas) ┌─────────────────────────────────────┐ │ 💡 New: AI can now suggest workflow │ │ optimizations. Enable in settings│ │ [Learn More] [X] │ └─────────────────────────────────────┘

Dismissible
Persists until user dismisses (stored in localStorage)
Email Notifications
Workflow Failed (Sent to workflow creator + configured recipients) ``` Subject: [LuxGen] Workflow "New Learner Onboarding" failed

Hi Admin,

Your workflow "New Learner Onboarding" failed3 times in the last hour.

Most recent error: Email template "Welcome_v1" not found.

[View Workflow] [View Failed Runs]

--- LuxGen Automation Platform ```

Weekly Workflow Report ``` Subject: [LuxGen] Your weekly workflow report

Hi Admin,

Here's how your workflows performed this week:

Active Workflows: 5 Total Runs: 1,234 Success Rate: 98.5% Hours Saved: ~42hours

Top Performing:

New Learner Onboarding - 500 runs, 100% success
Abandoned Cart Recovery - 234 runs, 95% success
Needs Attention: ⚠️ Certificate Generation - 15% failure rate

[View Full Report] ```

Push Notifications (Mobile app)
Workflow Failed 🚨 Workflow Failed "New Learner Onboarding" has errors. Tap to view details.

Workflow Published ✅ Workflow Published "New Learner Onboarding" is now live.

Slack Notifications (If Slack integration enabled)
Workflow Failed ``` :warning: Workflow Failed

New Learner Onboarding failed3 times in the last hour.

Error: Email template "Welcome_v1" not found.

<View Workflow> <Pause Workflow> ```

Workflow Milestone ``` :tada: Milestone Reached

New Learner Onboarding has run 1,000 times!

Success rate: 99.2% Hours saved: ~120 hours

<View Analytics> ```

Automation Alerts (Triggered by rules)
Unused Workflow Alert Toast: ┌─────────────────────────────────────┐ │ 💤 Workflow "Old Campaign" hasn't │ │ run in 30 days. Archive it? │ │ [Archive] [Keep Active] │ └─────────────────────────────────────┘

High Failure Rate Alert ``` Email: Subject: [Action Required] Workflow failure rate above threshold

Your workflow "Certificate Generation" has a 25% failure rate over the last 24 hours.

This exceeds your configured threshold of 10%.

[Investigate Now] [Pause Workflow] ```

AI Suggestions (Proactive, contextual)
Optimization Suggestion (Right panel) ┌─────────────────────────────────────┐ │ 💡 AI Suggestion │ │ │ │ Add a 2-hour delay between welcome│ │ email and first lesson reminder to │ │ improve engagement by 15%.│ │ │ │ Based on analysis of 1,234 learners.│ │ │ │ [Apply Suggestion] [Dismiss] │ └─────────────────────────────────────┘

Template Suggestion Toast: ┌─────────────────────────────────────┐ │ 💡 Similar workflows exist│ │ │ │ "Course Completion Workflow" has │ │ similar logic. Want to duplicate it?│ │ [View Template] [Dismiss] │ └─────────────────────────────────────┘

20. Activity Timeline
Location: Right panel when no node is selected

Purpose: Show chronological history of workflow changes and execution events

Events Recorded
Create 👤 Admin created this workflow 2hours ago

Update ✏️ Admin updated "Send Welcome Email" step 10 minutes ago

Publish 🚀 Admin published version2 5 minutes ago

Pause ⏸️ Owner paused this workflow Yesterday at 3:45 PM

Resume ▶️ Owner resumed this workflow Yesterday at 4:00 PM

Delete Step 🗑️ Admin deleted "Delay 24 hours" step 2 days ago

Automation Event ⚡ Workflow ran successfully 2 minutes ago Triggered by: New learner enrollment (learner@example.com) Duration: 2.3s [View Details]

Failure Event ❌ Workflow failed 5 minutes ago Error: Email template not found Triggered by: New learner enrollment (another@example.com) [View Details] [Retry]

AI Action 🤖 AI suggested optimization 1 hour ago "Add delay between emails to improve deliverability" [View Suggestion]

Comment 💬 Instructor commented 3 hours ago "Should we send a reminder after 48 hours instead of 24?" [View Thread]

Assignment 👥 Owner assigned Admin as collaborator Yesterday

Timeline UI
┌─────────────────────────────────────┐
│ Activity│
│                                     │
│ ⚡ Workflow ran successfully        │
│    2 minutes ago                    │
│    Triggered by: learner@example.com│
│[View Details]                   │
│                                     │
│ ✏️ Admin updated step              │
│    10 minutes ago                   │
│    Changed email template           │
│                                     │
│ 🚀 Admin published version 2│
│    1 hour ago                       │
│                                     │
│ 💬 Instructor commented            │
│    3 hours ago                      │
│    "Should we add a delay?"│
│    [View Thread]                    │
│                                     │
│👤 Admin created this workflow     │
│    2 days ago                       │
│                                     │
│ [Load More]                         │
└─────────────────────────────────────┘
Filtering
All Activity (default)
Edits Only (create, update, delete)
Runs Only (execution events)
Comments Only
AI Actions Only
Pagination
Load 20 events initially
"Load More" button to fetch next 20
Infinite scroll option
Grouping
Group by date: Today, Yesterday, Last 7 Days, Older
Visual separator between date groups
Interaction
Click event to see details (expands inline or opens drawer)
Hover to see full timestamp tooltip
Click user avatar to see profile
21. Permissions
Role Definitions
Owner

Full access to all workflows in organization
Can create, edit, publish, pause, archive, delete
Can manage workflow permissions
Can view all analytics
Can export workflow definitions
Admin

Full access to all workflows in organization
Can create, edit, publish, pause, archive
Cannot delete workflows (Owner only)
Can view all analytics
Can export workflow definitions
Manager

Can create workflows
Can edit workflows they created
Can edit workflows they're assigned to
Can view analytics for their workflows
Cannot delete workflows
Instructor

Can create workflows scoped to their courses
Can edit workflows they created
Can view workflows they're assigned to (read-only)
Can view analytics for their workflows
Cannot publish without approval (if org setting enabled)
Learner

No access to workflow builder
Cannot view workflows
Cannot create or edit workflows
Support

Read-only access to all workflows (for debugging)
Cannot edit, publish, or delete
Can view all analytics
Can export workflow definitions
Enterprise (Custom role for large orgs)

Configurable permissions per organization
Can restrict access to specific workflow categories
Can require approval workflow for publishing
System (Internal only)

Full access for automated tasks
Can create/edit/delete workflows programmatically
Used for AI automation and system maintenance
Permission Matrix
Action	Owner	Admin	Manager	Instructor	Learner	Support	Enterprise
View	✅ All	✅ All	✅ Own	✅ Own	❌	✅ All	🔧 Config
Create	✅	✅	✅	✅ Scoped	❌	❌	🔧 Config
Edit	✅ All	✅ All	✅ Own	✅ Own	❌	❌	🔧 Config
Publish	✅	✅	✅ Own	🔧 Approval	❌	❌	🔧 Config
Pause	✅ All	✅ All	✅ Own	✅ Own	❌	❌	🔧 Config
Archive	✅ All	✅ All	✅ Own	❌	❌	❌	🔧 Config
Delete	✅ All	❌	❌	❌	❌	❌	❌
Share	✅	✅	✅ Own	✅ Own	❌	❌	🔧 Config
Export	✅	✅	✅ Own	✅ Own	❌	✅	🔧 Config
View Analytics	✅ All	✅ All	✅ Own	✅ Own	❌	✅ All	🔧 Config
Manage Permissions	✅	✅	❌	❌	❌	❌	❌
🔧 = Configurable per organization

Field-Level Permissions
Workflow Settings

Owner/Admin: Can edit all settings
Manager/Instructor: Can edit general settings, cannot edit retry policy or advanced settings
Trigger Configuration

Owner/Admin: Can configure any trigger type
Instructor: Can only configure triggers scoped to their courses (e.g., NEW_LEARNER for their course)
Email Step

Owner/Admin: Can send from any email address
Manager/Instructor: Can only send from their own email or org default
AI Step

All roles: Can use AI if organization has credits
Credit consumption counted against organization quota
Approval Workflows (Enterprise feature)
Publishing Approval

If enabled, Instructors must request approval to publish
Approval request sent to Admin/Owner
Workflow remains in "Pending Approval" state
Admin/Owner can approve, reject, or request changes
Approval UI ``` Banner (Instructor view): ┌─────────────────────────────────────┐ │📋 Approval requested│ │ Waiting for Admin approval to│ │ publish this workflow. │ │ [Cancel Request] │ └─────────────────────────────────────┘

Banner (Admin view): ┌─────────────────────────────────────┐ │ 📋 Approval requested by Instructor │ │ Review and approve this workflow. │ │ [Review] [Approve] [Reject] │ └─────────────────────────────────────┘ ```

Permission Denied UI
Read-Only Mode Banner: ┌─────────────────────────────────────┐ │ 🔒 You have read-only access to this│ │ workflow. Contact the owner to │ │ request edit permission. │ │ [Request Access] │ └─────────────────────────────────────┘

All form fields disabled
Action buttons hidden
"Request Access" sends email to workflow owner
No Access Full screen: ┌─────────────────────────────────────┐ │ [Lock icon] │ │ │ │ You don't have permission │ │ to view this workflow│ │ │ │ Contact your admin if you believe │ │ this is an error. │ │ │ │ [Back to Workflows] │ └─────────────────────────────────────┘

22. Automation Hooks
Available Triggers
Learning Events

NEW_LEARNER_ENROLLMENT
When learner enrolls in any course or specific course
COURSE_COMPLETION
When learner completes a course
LESSON_COMPLETION
When learner completes a lesson
QUIZ_PASSED
When learner passes a quiz
QUIZ_FAILED
When learner fails a quiz
CERTIFICATE_EARNED
When learner earns a certificate
PROGRESS_MILESTONE
When learner reaches X% progress
Commerce Events

NEW_SALE
When a purchase is completed
CART_ABANDONED
When learner abandons cart for X minutes
SUBSCRIPTION_STARTED
When learner starts a subscription
SUBSCRIPTION_CANCELLED
When learner cancels subscription
SUBSCRIPTION_RENEWED
When subscription auto-renews
PAYMENT_FAILED
When payment fails
REFUND_ISSUED
When refund is processed
Engagement Events

USER_INACTIVE
When learner hasn't logged in for X days
LOW_ENGAGEMENT
When learner's engagement score drops below threshold
COMMENT_POSTED
When learner posts a comment
REVIEW_SUBMITTED
When learner submits a review
BADGE_EARNED
When learner earns a badge
Administrative Events

USER_CREATED
When new user account is created
USER_ROLE_CHANGED
When user role is updated
COURSE_PUBLISHED
When instructor publishes a course
COURSE_UPDATED
When course content is updated
BULK_IMPORT_COMPLETED
When CSV import finishes
Schedule-Based

SCHEDULE
Run at specific time/interval (cron expression)
RECURRING
Run daily/weekly/monthly
External Events

WEBHOOK
When external system sends webhook
API_TRIGGER
When API endpoint is called
ZAPIER_TRIGGER
When Zapier sends event
Conditions (Applied to triggers)
Filters

Course ID equals/contains
User role equals
User tag contains
Purchase amount greater than/less than
Enrollment date is within last X days
Custom field equals/contains
Example ``` Trigger: NEW_LEARNER_ENROLLMENT Conditions:

Course ID = "course_123"
User tag contains "enterprise"
Enrollment date is within last 24 hours ```
Actions (What workflows can do)
Communication

SEND_EMAIL
Send email using template or custom content
SEND_SMS
Send SMS (if Twilio integration enabled)
SEND_PUSH_NOTIFICATION
Send push to mobile app
POST_TO_SLACK
Post message to Slack channel
CREATE_NOTIFICATION
Create in-app notification
Learning

ASSIGN_COURSE
Enroll learner in course
UNENROLL_COURSE
Remove learner from course
GENERATE_CERTIFICATE
Create and send certificate
GRANT_ACCESS
Give access to locked content
REVOKE_ACCESS
Remove access to content
UPDATE_PROGRESS
Manually adjust progress
Commerce

ISSUE_COUPON
Generate and send discount code
PROCESS_REFUND
Initiate refund
UPDATE_SUBSCRIPTION
Change subscription plan
SEND_INVOICE
Generate and send invoice
Data

UPDATE_USER_FIELD
Modify user profile field
ADD_TAG
Add tag to user
REMOVE_TAG
Remove tag from user
LOG_EVENT
Record custom event for analytics
CREATE_TASK
Add task to user's to-do list
Integration

WEBHOOK
Send HTTP request to external URL
API_CALL
Call LuxGen API endpoint
ZAPIER_ACTION
Trigger Zapier workflow
UPDATE_CRM
Sync data to CRM (Salesforce, HubSpot)
AI

AI_TASK
Execute AI agent task
AI_SENTIMENT_ANALYSIS
Analyze sentiment of text
AI_RECOMMENDATION
Generate personalized recommendations
AI_CONTENT_GENERATION
Generate content (email, description)
Workflow Templates (Pre-built, marketplace)
Learning Templates

Welcome New Learners
Course Completion Congratulations
Certificate Generation
Progress Reminder
Re-engagement Campaign
Quiz Failure Support
Commerce Templates

Abandoned Cart Recovery
Upsell After Purchase
Subscription Renewal Reminder
Payment Failed Follow-up
Refund Confirmation
Engagement Templates

Weekly Progress Report
Milestone Celebration
Inactive User Re-engagement
Referral Program
Review Request
Administrative Templates

New User Onboarding
Instructor Approval Workflow
Course Review Process
Bulk User Import
Compliance Reporting
Webhooks (External systems triggering workflows)
Webhook URL Format POST https://api.luxgen.com/v1/webhooks/:workflowId/:secret

Payload Example json { "trigger": "external_event", "data": { "userId": "user_123", "eventType": "purchase", "amount": 99.99, "customField": "value" } }

Webhook Security

Secret token required (generated per workflow)
HMAC signature validation
IP whitelist (optional)
Rate limiting: 1000 requests per hour per workflow
Schedules (Time-based triggers)
Cron Expression Builder ┌─────────────────────────────────────┐ │ Run every:│ │ ○ Hour │ │ ● Day│ │ ○ Week │ │ ○ Month │ │ ○ Custom (cron expression) │ ││ │ At: │ │ [09:00] [AM▾] │ │ │ │ Timezone: │ │ [America/New_York ▾] │ │ │ │ Next5 runs: │ │ • Tomorrow at 9:00 AM │ │ • Wed, Jan 8 at 9:00 AM │ │ • Thu, Jan 9 at 9:00 AM │ │ • Fri, Jan 10 at 9:00 AM│ │ • Mon, Jan 13 at 9:00 AM │ └─────────────────────────────────────┘

AI Automation (Proactive workflow suggestions)
AI-Detected Opportunities

"You manually send welcome emails. Automate this?"
"Course completion rate dropped. Create re-engagement workflow?"
"High cart abandonment. Set up recovery workflow?"
AI-Generated Workflows

User describes goal in natural language
AI generates complete workflow
User reviews and publishes
Example ``` User: "Send a reminder email 3 days after enrollment if the learner hasn't started the course"

AI generates:

Trigger: NEW_LEARNER_ENROLLMENT
Delay: 3 days
Condition: If progress = 0%
Action: Send email "Start Your Course" ```
23. AI Opportunities
Copilot (Inline assistance)
Location: Right panel, always available

Features

Natural language workflow creation
Step-by-step guidance for complex workflows
Real-time suggestions as user builds
Contextual help based on current step
Example Interaction ``` User: "How do I send an email only to learners who haven't completed the course?"

Copilot: I'll help you set that up. You'll need:

A trigger (e.g., Course Enrollment)
A delay (e.g., 7 days)
A condition to check progress
An email action
Would you like me to add these steps for you? [Yes, Add Steps] [No, I'll Do It] ```

AI Summary (Workflow overview)
Location: Right panel header when no node selected

Purpose: Summarize workflow in plain English

Example ┌─────────────────────────────────────┐ │📝 AI Summary│ │ │ │ This workflow sends a welcome email │ │ to new learners immediately, then│ │ waits 24 hours before personalizing │ │ their learning path using AI. │ │ │ │ It runs automatically when anyone│ │ enrolls in any course. │ │ │ │ [Edit Summary] [Copy] │ └─────────────────────────────────────┘

AI Recommendations (Proactive optimization)
Location: Right panel when no node selected

Triggers

After workflow runs100+ times
When failure rate exceeds 5%
When engagement metrics are available
Example Recommendations ┌─────────────────────────────────────┐ │💡 AI Recommendations │ │ │ │ 1. Add a 2-hour delay between│ │ welcome email and first lesson │ │ reminder. This increased│ │ engagement by 15% in similar│ │ workflows. │ │ [Apply] [Dismiss] │ │ │ │ 2. Your email subject line has a │ │ low open rate (12%). Try: │ │ "Start your journey with LuxGen" │ │ (predicted 28% open rate)│ │ [Apply] [Dismiss] │ │ │ │ 3. Add A/B testing to compare two │ │ email templates. │ │ [Learn More] [Dismiss] │ └─────────────────────────────────────┘

AI Generation (Create workflow from description)
Location: Workflow creation modal

Flow

User describes goal in natural language
AI generates complete workflow
User reviews and edits
User publishes
Example ``` Modal: ┌─────────────────────────────────────┐ │ Create Workflow with AI │ │ │ │ Describe what you want to automate: │ │ │ │ [Send a welcome email when someone ]│ │ [enrolls, then remind them after 3 ]│ │ [days if they haven't started. ]│ │ │ │ [Generate Workflow] │ └─────────────────────────────────────┘

After generation: ┌─────────────────────────────────────┐ │✨ Workflow Generated│ │ │ │ I created a 4-step workflow:│ │ 1. Trigger: New Learner Enrollment │ │ 2. Action: Send Welcome Email │ │ 3. Delay: 3 days │ │ 4. Condition: If progress = 0% │ │ → Send Reminder Email │ │ │ │ [Edit Workflow] [Publish] │ └─────────────────────────────────────┘ ```

AI Chat (Conversational workflow editing)
Location: Bottom-right floating button (like Intercom)

Features

Ask questions about workflows
Request edits in natural language
Get explanations of complex logic
Troubleshoot errors
Example ``` User: "Why did this workflow fail?"

AI: The workflow failed because the email template "Welcome_v1" was deleted.

Would you like me to:

Update the workflow to use a different template
Show you how to restore the deleted template
Pause the workflow until you fix it
[Option 1] [Option 2] [Option 3] ```

AI Insights (Analytics-driven suggestions)
Location: Analytics screen (not builder)

Purpose: Identify patterns and opportunities

Example ``` 📊 AI Insights

• Workflows with delays between emails have 23% higher engagement than those without. • Your "Course Completion" workflow has a 95% success rate, but the "Certificate Generation" step takes 8 seconds on average. Consider optimizing the template.

• 15% of learners who receive your welcome email click the "Get Started" button within 1 hour. Consider adding a follow-up workflow for quick clickers. ```

AI Autofill (Smart defaults)
Location: Step configuration forms

Purpose: Pre-fill fields with intelligent defaults

Examples

Email subject: Auto-generate based on workflow purpose
Delay duration: Suggest optimal delay based on similar workflows
Condition values: Suggest common thresholds (e.g., "7 days", "50% progress")
Variable names: Auto-complete based on available data
UI Email Subject: [Welcome to {{course.name}}!✨ AI suggested]

AI Error Detection (Proactive issue identification)
Location: Canvas and right panel

Purpose: Warn user before publishing

Examples ``` ⚠️ Potential Issue Detected

This workflow sends3 emails within 1 hour. This may trigger spam filters and reduce deliverability.

Recommendation: Add delays between emails.

[Fix Automatically] [Ignore] ```

⚠️ Low Open Rate Predicted

Your email subject line "Update" has a 
predicted open rate of only 8%.

Try: "Your course progress update🎓"
Predicted open rate: 24%

[Use Suggestion] [Keep Original]
24. Analytics
Note: Full analytics live on a separate screen (/automation/workflows/:workflowId/analytics). This section describes analytics widgets shown in the builder.

Metrics (Shown in right panel when no node selected)
Overview Card ┌─────────────────────────────────────┐ │ 📊 Performance │ │ │ │ Total Runs: 1,234 │ │ Success Rate: 98.5% │ │ Avg Duration: 2.3s │ │ Last Run: 2 minutes ago │ │ │ │ [View Full Analytics →] │ └─────────────────────────────────────┘

Per-Step Metrics (When step selected) ┌─────────────────────────────────────┐ │ Send Welcome Email │ │ │ │ Executions: 1,234 │ │ Success: 1,220(98.9%) │ │ Failed: 14 (1.1%) │ │ Avg Duration: 1.8s │ │ │ │ Common Errors: │ │ • Template not found (8) │ │ • Invalid recipient (6) │ │ │ │ [View Details] │ └─────────────────────────────────────┘

Charts (On analytics screen, not builder)
Run Volume Over Time

Line chart showing runs per day/week/month
Color-coded by status (success, failed)
Success Rate Trend

Line chart showing success rate over time
Highlight anomalies (sudden drops)
Duration Distribution

Histogram showing distribution of execution times
Identify outliers (unusually slow runs)
Step Performance

Bar chart comparing avg duration per step
Identify bottlenecks
KPIs (Top of analytics screen)
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Runs   │ Success Rate │ Avg Duration │ Hours Saved  │
│ 1,234        │ 98.5%        │ 2.3s         │ ~42 hours    │
│ ↑ 15% vs LW  │ ↓ 0.5% vs LW │ → Same│ ↑ 20% vs LW  │
└──────────────┴──────────────┴──────────────┴──────────────┘
Trend Analysis
Anomaly Detection

AI flags unusual patterns (e.g., sudden spike in failures)
Alert: "Failure rate increased 10x in the last hour"
Seasonality

Identify patterns (e.g., more enrollments on Mondays)
Suggest: "Consider scheduling this workflow for Monday mornings"
Correlation

Identify relationships between variables
Insight: "Workflows with delays have 23% higher engagement"
Conversion Tracking (For commerce workflows)
Funnel Analysis ``` Abandoned Cart Recovery Workflow:

Cart Abandoned: 500 Email Sent: 485(97%) Email Opened: 145 (30%) Clicked Link: 58 (12%) Completed Purchase: 23 (5%)

Revenue Recovered: $2,415 ```

ROI Calculation ``` Hours Saved: 42 hours Cost Savings: $1,680(@ $40/hour)

Revenue Generated: $2,415 ROI: 144% ```

Revenue Attribution (For commerce workflows)
Workflow-Driven Revenue

Track purchases attributed to workflow actions
Compare to baseline (purchases without workflow)
Example ``` Upsell Workflow:

Purchases Attributed: 87 Total Revenue: $8,700 Avg Order Value: $100 Conversion Rate: 15%

vs. Baseline (no workflow): Conversion Rate: 8% Lift: +87.5% ```

Learning Analytics (For learning workflows)
Engagement Metrics

Course completion rate (learners who received workflow)
Time to first lesson (after welcome email)
Progress velocity (lessons per week)
Comparison ``` Learners with Welcome Workflow: Completion Rate: 65% Avg Time to First Lesson: 2.5 hours

Learners without Welcome Workflow: Completion Rate: 45% Avg Time to First Lesson: 8 hours

Improvement: +44% completion, 3.2x faster start ```

Automation Efficiency
Time Savings Calculation ``` Manual Time Per Action: 5 minutes Workflow Runs: 1,234 Total Time Saved: 102.8 hours

Equivalent Cost Savings: $4,112(@ $40/hour) ```

Error Reduction ``` Manual Error Rate: 2.5% Automated Error Rate: 1.1% Errors Prevented: 17

Estimated Cost Avoidance: $680 ```

Usage Metrics
Active Workflows: Number of live workflows Total Runs: Cumulative executions across all workflows Unique Triggers: Number of distinct events that triggered workflows Peak Usage: Time of day with most workflow activity

25. Mobile Adaptation
Phone (375px - 767px)
Layout Changes

Single-column layout
Sidebar becomes full-screen overlay (slide from left)
Right panel becomes bottom sheet (slide from bottom)
Canvas is full-screen
Sticky footer with primary actions
Navigation ``` ┌─────────────────────────────────────┐ │ [☰] New Learner Onboarding [•••] │← Header └─────────────────────────────────────┘

┌─────────────────────────────────────┐ │ │ │ Canvas (full screen) │ │ │ │ Nodes are larger, more touch- │ │ friendly (min44x44px) │ │ │ └─────────────────────────────────────┘

┌─────────────────────────────────────┐ │ [+ Add Step] [Test] [Save] │ ← Footer └─────────────────────────────────────┘ ```

Interaction Changes

Drag-and-drop: Replace with tap-to-select, then tap-to-place
Zoom: Pinch-to-zoom gestures
Pan: Two-finger drag
Connect nodes: Tap source, then tap target (no drag)
Edit node: Tap node to open bottom sheet with config form
Bottom Sheet (Node configuration) ┌─────────────────────────────────────┐ │ [Drag handle] │ │ │ │ Send Welcome Email │ │ │ │ Template: │ │ [Onboarding_Welcome_v1 ▾] │ │ │ │ Recipient: │ │ [{{learner.email}} ]│ │ │ │ [Delete] [Save] │ └─────────────────────────────────────┘

Swipe down to dismiss
Swipe up to expand to full screen
Large touch targets (min 44x44px)
Sidebar Overlay ┌─────────────────────────────────────┐ │ [X] Workflow Elements│ │ │ │ 🔍 Search │ │ │ │ TRIGGERS │ │ [Icon] New Learner │ │ [Icon] New Sale │ │ [Icon] Course Complete │ │ │ │ ACTIONS │ │ [Icon] Send Email│ │ [Icon] Assign Course │ │ │ └─────────────────────────────────────┘

Tap element to add to canvas (no drag)
Overlay dims background
Tap outside to close
Simplified Canvas

Nodes stack vertically by default
Connectors are straight lines (no bezier curves)
Minimap removed (not useful on small screen)
Zoom controls simplified: [−] [Fit] [+]
Tablet (768px - 1023px)
Layout

Two-column layout: Canvas + Right Panel
Sidebar becomes overlay (triggered by hamburger)
More screen real estate than phone, but still touch-optimized
Landscape Mode

Three-column layout possible: Sidebar (icon-only) | Canvas | Panel
Sidebar auto-collapses to icons, expands on tap
Canvas gets most space
Portrait Mode

Similar to phone, but right panel is persistent (not bottom sheet)
Right panel narrower (280px instead of 360px)
Touch Optimization (All mobile sizes)
Touch Targets

Minimum 44x44px for all interactive elements
Increase node size from 200x80px to 280x100px
Larger connector hit areas (16px wide invisible hit box)
Gestures

Tap: Select node
Double-tap: Edit node (open config)
Long-press: Show context menu
Pinch: Zoom canvas
Two-finger drag: Pan canvas
Swipe down: Dismiss bottom sheet
Swipe left: Delete node (with confirmation)
Scrolling

Canvas scrolls smoothly (no lag)
Momentum scrolling enabled
Snap to grid (optional, helps with alignment)
Offline Support
Read-Only Mode

View workflow structure
View node configuration
Cannot edit or save
Offline Editing (Future)

Edit workflow locally
Changes queued
Sync when back online
Conflict resolution if another user edited
Offline Indicator Banner: ┌─────────────────────────────────────┐ │📡 You're offline. Changes will sync│ │ when you reconnect. │ └─────────────────────────────────────┘

Mobile-Specific Features
Voice Input

Use device microphone to describe workflow
AI generates workflow from voice description
Useful for hands-free creation
Camera Integration

Scan QR code to open workflow
Take photo of whiteboard sketch, AI converts to workflow
Notifications

Push notifications for workflow failures
Tap notification to open workflow in app
Shortcuts

iOS Shortcuts integration (e.g., "Siri, pause my workflow")
Android Quick Settings tile (quick access to workflows)
Performance Optimization
Lazy Loading

Load workflow structure first
Load node details on demand
Load run history when user opens it
Image Optimization

Use SVG icons (scalable, small file size)
Lazy load avatars and images
Reduced Animations

Respect user's "Reduce Motion" preference
Simpler transitions on low-end devices
Battery Saving

Pause auto-refresh when app is in background
Reduce polling frequency on low battery
26. Accessibility
Keyboard Navigation
Tab Order

Header: Back button → Title → Actions (Test, More, Save)
Sidebar: Search → Trigger list → Logic list → Actions list
Canvas: First node → Second node → ... (in visual order)
Right Panel: Form fields (top to bottom)
Footer: Discard → Save Draft → Save & Publish
Keyboard Shortcuts

Tab / Shift+Tab
Navigate forward/backward
Enter
Activate button, open node config
Space
Select node, toggle checkbox
Escape
Close modal, deselect all, cancel action
Arrow Keys
Navigate between nodes on canvas
Delete
Delete selected node
Cmd+A
Select all nodes
Cmd+Z / Cmd+Shift+Z
Undo / Redo
Cmd+S
Save
Cmd+Enter
Publish
Cmd+K
Open command palette
/
Focus search (sidebar)
Focus Management

Visible focus indicator (2px purple outline)
Focus moves logically (left-to-right, top-to-bottom)
Focus trapped in modals (can't tab outside)
Focus restored after closing modal
Skip links: "Skip to canvas" "Skip to settings"
Screen Reader Support
Semantic HTML

Use <button> for buttons (not <div onclick>)
Use <nav> for navigation
Use <main> for main content
Use <aside> for sidebar and right panel
Use <form> for configuration forms
ARIA Labels ```html

<button aria-label="Go back to workflow list"> <i class="icon-arrow-left"></i> </button>

<h1 id="workflow-title">New Learner Onboarding</h1>

<div role="main" aria-label="Workflow canvas"> <div role="group" aria-labelledby="node-1-title"> <h3 id="node-1-title">New Learner Enrollment</h3> <p>Trigger: When learner enrolls in any course</p> </div> </div>

<div role="button" aria-label="Send Welcome Email step. Click to edit." aria-describedby="node-2-description" tabindex="0" > <h4>Send Welcome Email</h4> <p id="node-2-description">Template: Onboarding_Welcome_v1</p> </div>

<label for="email-recipient">Recipient</label> <input id="email-recipient" type="text" aria-required="true" aria-invalid="false" aria-describedby="email-recipient-help" /> <span id="email-recipient-help"> Use {{variable}} syntax to insert dynamic values </span>

<input id="email-subject" type="text" aria-required="true" aria-invalid="true" aria-describedby="email-subject-error" /> <span id="email-subject-error" role="alert"> Subject is required </span> ```

Live Regions ```html

<div aria-live="polite" aria-atomic="true"> Saved10 seconds ago </div>

<div aria-live="assertive" role="alert"> 2 errors prevent publishing </div>

<div aria-live="polite" role="status"> Workflow published successfully </div> ```

Screen Reader Announcements

"Workflow loaded.4 steps found."
"Step added: Send Welcome Email"
"Step deleted: Delay 24 hours"
"Saving workflow... Saved successfully."
"Publishing workflow... Published successfully."
"Error: Email template not found."
Color Contrast
WCAG AA Compliance (Minimum 4.5:1 for normal text)

Text on white: #2b2b2b (contrast: 12.6:1) ✅
Text on light gray: #2b2b2b on #f8f8f8 (contrast: 11.9:1) ✅
Purple on white: #7c3aed (contrast: 4.9:1) ✅
Gray text: #787878 on white (contrast: 4.6:1) ✅
Error red: #dc2626 on white (contrast: 5.9:1) ✅
WCAG AAA Compliance (Minimum 7:1 for normal text)

Headings and body text meet AAA
Small text (< 14px) meets AA minimum
Color Blind Friendly

Don't rely on color alone to convey information
Use icons + color (e.g., ✅ green, ❌ red)
Patterns/textures for charts
Labels on chart segments
Dark Mode

Inverted colors with same contrast ratios
Purple: #a78bfa (lighter shade for dark bg)
Text: #f5f5f5 on #1a1a1a
Focus Indicators
Visible Focus

2px solid purple outline (#7c3aed) -2px offset from element (breathing room)
Never outline: none without custom alternative
Focus Styles ```css button:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }

/ For nodes on canvas / .workflow-node:focus-visible { box-shadow: 0 0 0 3px #7c3aed; } ```

Focus Order

Logical, predictable order
Matches visual layout
No focus traps (except modals)
ARIA Roles and States
Roles

role="button"
Clickable nodes
role="navigation"
Sidebar
role="main"
Canvas area
role="complementary"
Right panel
role="dialog"
Modals
role="alert"
Error messages
role="status"
Success messages
States

aria-expanded="true|false"
Accordion sections
aria-selected="true|false"
Selected nodes
aria-disabled="true|false"
Disabled buttons
aria-hidden="true|false"
Hidden elements
aria-busy="true|false"
Loading states
aria-invalid="true|false"
Form validation
Properties

aria-label
Accessible name for icon buttons
aria-labelledby
Reference to label element
aria-describedby
Reference to description/help text
aria-required
Required form fields
aria-live
Live regions for dynamic content
Keyboard Shortcuts (Accessible)
Discoverable

Show shortcuts in tooltips
Shortcuts panel: ? key shows all shortcuts
Keyboard shortcut hints in menus
Customizable

Allow users to customize shortcuts
Avoid conflicts with browser/OS shortcuts
Provide alternatives for single-hand operation
Visual Indicators Button: [Save] Tooltip: "Save (Cmd+S)"

Alternative Text
Images

All icons have aria-label or adjacent text
Decorative images: aria-hidden="true"
Informative images: descriptive alt text
Charts

Provide data table alternative
Screen reader can read table row-by-row
Canvas Visualization

Provide text description of workflow structure
"This workflow has 4 steps:1. Trigger: New Learner Enrollment, 2. Action: Send Welcome Email, 3. Delay: 24 hours, 4. Action: AI Task"
27. Performance
Lazy Loading
Initial Load

Load workflow metadata first (name, status, trigger)
Load canvas structure (nodes, connections)
Defer: Run history, analytics, version history
On-Demand Loading

Load node configuration when user clicks node
Load run details when user opens run history
Load analytics charts when user switches to analytics tab
Code Splitting

Separate bundles for: Builder, Analytics, Run History
Load only what's needed for current view
Prefetch next likely view (e.g., analytics)
Pagination
Workflow List (Parent screen)

Load 25 workflows per page
Cursor-based pagination
Prefetch next page when user scrolls to80%
Run History

Load 25 runs per page
Infinite scroll
Virtual scrolling for 1000+ runs
Activity Timeline

Load 20 events initially
"Load More" button for older events
Infinite scroll option
Virtual Scrolling
Long Lists

Sidebar with 100+ triggers/actions
Run history with 1000+ runs
Activity timeline with 500+ events
Implementation

Render only visible items + buffer
Recycle DOM nodes as user scrolls
Maintain scroll position when data changes
Caching
Client-Side Cache

Workflow details: 5 minutes
Workflow list: 1 minute
Run history: 30 seconds
Available elements: Indefinite (rarely changes)
Cache Invalidation

Invalidate on mutation (create, update, delete)
Invalidate on publish (new version)
Manual refresh button
Service Worker

Cache static assets (JS, CSS, fonts, icons)
Cache API responses (with expiration)
Offline fallback (show cached version)
Background Refresh
Auto-Refresh

Run history: Poll every 30 seconds (if workflow is live)
Activity timeline: Poll every 60 seconds
Analytics: Poll every 5 minutes
Smart Polling

Only poll when tab is active
Pause polling when user is editing
Use WebSocket for real-time updates (if available)
Prefetching
Predictive Prefetch

User hovers over workflow in list → prefetch details
User opens node config → prefetch related templates/agents
User clicks "Test" → prefetch test data
Next-Page Prefetch

Prefetch analytics when user is on builder
Prefetch run history when user is on analytics
Optimistic Updates
Instant Feedback

Add node: Show immediately, sync in background
Update config: Update UI instantly, save in background
Reorder nodes: Drag feels instant, sync after drop
Rollback on Error

If save fails, revert to last known state
Show error message
Offer retry
Debouncing and Throttling
Debounce (Wait for user to stop typing)

Search input: 300ms debounce
Autosave: 10seconds debounce
Form validation: 500ms debounce
Throttle (Limit frequency of expensive operations)

Canvas pan/zoom: 16ms throttle (60fps)
Window resize: 200ms throttle
Scroll events: 100ms throttle
Image Optimization
Icons

Use SVG (scalable, small file size)
Inline critical icons (reduce HTTP requests)
Lazy load non-critical icons
Avatars

Use CDN with image optimization
Serve WebP with JPEG fallback
Lazy load avatars in activity timeline
Illustrations

Compress PNG/JPEG
Use SVG where possible
Lazy load below-the-fold illustrations
Bundle Optimization
Code Splitting

Separate bundles: Vendor, Builder, Analytics, Run History
Lazy load routes (don't load analytics until user navigates there)
Tree Shaking

Remove unused code
Import only what's needed (e.g., import { Button } not import *)
Minification

Minify JS, CSS
Remove console.logs in production
Compress with gzip/brotli
Database Optimization (Backend)
Indexes

Index on workflowId, organizationId, status, createdAt
Composite index on workflowId + status for filtered queries
Query Optimization

Use SELECT only needed fields (not SELECT *)
Paginate large result sets
Use database-level filtering (not in-memory)
Caching (Backend)

Redis cache for frequently accessed workflows
Cache workflow definitions (change infrequently)
Cache-aside pattern (check cache, then DB)
Monitoring
Performance Metrics

Time to First Byte (TTFB):< 200ms
First Contentful Paint (FCP): < 1.5s
Largest Contentful Paint (LCP): < 2.5s
Time to Interactive (TTI): < 3.5s
Cumulative Layout Shift (CLS): < 0.1
Real User Monitoring (RUM)

Track actual user load times
Identify slow pages/actions
Alert on performance regressions
Error Tracking

Log frontend errors (Sentry, Bugsnag)
Track failed API requests
Monitor workflow execution failures
28. Design System
Spacing
Base Unit:4px

Scale

xs: 4px (0.25rem)
sm: 8px (0.5rem)
md: 12px (0.75rem)
lg: 16px (1rem)
xl: 24px (1.5rem)
2xl: 32px (2rem)
3xl: 48px (3rem)
4xl: 64px (4rem)
Application

Padding: Use for internal spacing (inside components)
Margin: Use for external spacing (between components)
Gap: Use for spacing between flex/grid items
Examples

Button padding: md (12px) vertical, lg (16px) horizontal
Card padding: xl (24px)
Section margin: 2xl (32px)
Page margin: 3xl (48px)
Typography
Font Family

Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace: 'Fira Code', 'Courier New', monospace (for code)
Font Sizes

xs: 10px (0.625rem) - Captions, labels
sm: 12px (0.75rem) - Small text, metadata
base: 14px (0.875rem) - Body text (default)
lg: 16px (1rem) - Emphasized text
xl: 20px (1.25rem) - H3 headings
2xl: 24px (1.5rem) - H2 headings
3xl: 30px (1.875rem) - H1 headings
4xl: 36px (2.25rem) - Display headings
Font Weights

normal: 400 - Body text
medium: 500 - Emphasized text
semibold: 600 - Subheadings
bold: 700 - Headings, buttons
Line Heights

tight: 1.25- Headings
normal: 1.5 - Body text
relaxed: 1.75 - Long-form content
Letter Spacing

tight: -0.02em - Large headings
normal: 0 - Body text
wide: 0.05em - Uppercase labels
Text Colors

Primary: #2b2b2b (dark gray, high contrast)
Secondary: #787878 (medium gray, less emphasis)
Tertiary: #afafaf (light gray, metadata)
Accent: #7c3aed (purple, links, highlights)
Error: #dc2626 (red)
Success: #16a34a (green)
Warning: #ea580c (orange)
Icons
Icon Library: Font Awesome 5(or custom SVG icon set)

Icon Sizes

xs: 12px - Inline with small text
sm: 14px - Inline with body text
md: 16px - Default (buttons, labels)
lg: 20px - Emphasized actions
xl: 24px - Large buttons, headers
2xl: 32px - Empty states, illustrations
Icon Usage

Always pair with text label (or aria-label)
Use consistent icons for same actions (e.g., ✏️ for edit)
Align icons with text baseline
Icon Colors

Inherit text color by default
Use accent color for interactive icons
Use semantic colors for status (✅ green, ❌ red)
Buttons
Variants

Primary: Solid purple background, white text
Secondary: White background, purple border, purple text
Tertiary: Transparent background, purple text, no border
Danger: Solid red background, white text
Sizes

sm: 8px vertical, 12px horizontal, 12px text
md: 12px vertical, 16px horizontal, 14px text (default)
lg: 16px vertical, 24px horizontal, 16px text
States

Default: Purple #7c3aed
Hover: Darker purple #6d28d9
Active: Even darker #5b21b6
Disabled: Gray #e4e4e4, gray text #afafaf
Loading: Spinner, disabled interaction
Examples ```css / Primary Button / .btn-primary { background: #7c3aed; color: white; padding: 12px 16px; border-radius: 8px; font-weight: 600; }

/ Secondary Button / .btn-secondary { background: white; color: #7c3aed; border: 1px solid #7c3aed; padding: 12px 16px; border-radius: 8px; font-weight: 600; }

/ Tertiary Button / .btn-tertiary { background: transparent; color: #7c3aed; padding: 12px 16px; font-weight: 600; } ```

Cards
Structure

Border:1px solid #e4e4e4
Border radius: 8px
Padding: 16-24px (depending on content)
Background: White
Shadow: Optional, subtle (0 1px 3px rgba(0,0,0,0.1))
Variants

Default: White background, gray border
Highlighted: Purple border, light purple background #fbf5ff
Error: Red border, light red background #fef2f2
Example ```css .card { background: white; border: 1px solid #e4e4e4; border-radius: 8px; padding: 24px; }

.card-highlighted { border-color: #7c3aed; background: #fbf5ff; } ```

Tables
Structure

Header: Bold text, gray background #f8f8f8
Rows: White background, gray border #e4e4e4
Alternating rows: Light gray #fafafa (optional)
Hover: Slightly darker gray #f5f5f5
Typography

Header: 12px, uppercase, bold, letter-spacing: 0.05em
Body: 14px, normal weight
Padding

Cells: 12px vertical, 16px horizontal
Example ```css table { width: 100%; border-collapse: collapse; }

th { background: #f8f8f8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; text-align: left; }

td { padding: 12px 16px; border-top: 1px solid #e4e4e4; }

tr:hover { background: #f5f5f5; } ```

Charts
Colors

Primary: Purple #7c3aed
Secondary: Blue #3b82f6
Tertiary: Green #16a34a
Quaternary: Orange #ea580c
Quinary: Pink #ec4899
Chart Types

Line chart: Trend over time
Bar chart: Comparisons
Pie chart: Proportions (use sparingly)
Histogram: Distribution
Accessibility

Provide data table alternative
Use patterns/textures in addition to color
Label all axes and data points
Dialogs (Modals)
Structure

Overlay: Dark background rgba(0,0,0,0.5)
Modal: White background, centered, rounded corners (12px)
Max width: 600px
Padding: 24px
Header

Title: 20px, bold
Close button: Top-right, icon-only
Body

Scrollable if content exceeds viewport
Padding: 24px
Footer

Buttons aligned right
Primary action on right, secondary on left
Example ```css .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }

.modal { background: white; border-radius: 12px; max-width: 600px; padding: 24px; } ```

Empty States
Structure

Illustration or icon (large,64-128px)
Heading: 20px, bold
Description: 14px, gray text
Primary action button
Secondary action link (optional)
Tone

Friendly, helpful
Explain why it's empty
Suggest next action
Example ``` [Illustration]

No workflows yet

Create your first workflow to automate repetitive tasks and save time.

[Create Workflow] [Browse Templates] ```

Skeletons (Loading States)
Structure

Gray background #e4e4e4
Animated shimmer effect
Match layout of actual content
Example ```css .skeleton { background: linear-gradient( 90deg,

#e4e4e4 0%,
#f5f5f5 50%,
#e4e4e4 100%
  
); background-size: 200% 100%; animation: shimmer 1.5s infinite;
}

@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } } ```

Dark Mode
Colors

Background: #1a1a1a
Surface (cards): #2b2b2b
Text primary: #f5f5f5
Text secondary: #afafaf
Border: #3d3d3d
Accent: #a78bfa (lighter purple)
Toggle

Respect system preference by default
Allow manual override
Persist preference in localStorage
Implementation

Use CSS custom properties (variables)
Toggle class on <html> or <body>
Smooth transition between modes
Example ```css :root { --bg-primary: white; --text-primary: #2b2b2b; --accent: #7c3aed; }

[data-theme="dark"] { --bg-primary: #1a1a1a; --text-primary: #f5f5f5; --accent: #a78bfa; } ```

29. Edge Cases
Deleted Record
Scenario: User opens workflow that was deleted by another user

Behavior

Show error message: "This workflow has been deleted."
Offer to restore from recycle bin (if within 30 days)
Redirect to workflow list after 5 seconds
UI ┌─────────────────────────────────────┐ │ [Trash icon] │ │ │ │ This workflow has been deleted │ │ │ │ It was deleted by Admin on│ │ Jan 5, 2025 at 3:45 PM.│ │ │ │ [Restore Workflow] [Go to List] │ └─────────────────────────────────────┘

Duplicate Name
Scenario: User tries to save workflow with name that already exists

Behavior

Show inline error: "A workflow with this name already exists."
Suggest alternative: "New Learner Onboarding (2)"
Allow user to proceed with duplicate name (add warning)
UI ``` Workflow Name: [New Learner Onboarding ] ⚠️ A workflow with this name already exists.

Suggestion: "New Learner Onboarding (2)" [Use Suggestion] [Keep Original] ```

Permission Removed
Scenario: User is editing workflow, then permission is revoked by admin

Behavior

Show banner: "Your permission to edit this workflow was removed."
Save current changes as draft (user's personal copy)
Switch to read-only mode
Offer to duplicate workflow (if user wants to continue editing)
UI Banner: ┌─────────────────────────────────────┐ │🔒 Your permission to edit this │ │ workflow was removed. Your │ │ changes were saved as a draft. │ │ [View Draft] [Duplicate Workflow] │ └─────────────────────────────────────┘

Offline
Scenario: User loses internet connection while editing

Behavior

Show banner: "You're offline. Changes are saved locally."
Continue allowing edits (save to localStorage)
Queue changes for sync when back online
Warn user if they try to publish (requires online)
UI Banner: ┌─────────────────────────────────────┐ │ 📡 You're offline. Changes are saved│ │ locally and will sync when you're│ │ back online. │ │ [Retry Connection] │ └─────────────────────────────────────┘

Network Lost (During save)
Scenario: Network drops during save operation

Behavior

Show error: "Failed to save. Network error."
Keep unsaved changes in memory
Offer retry button
Auto-retry every 10 seconds (up to 3 times)
If all retries fail, save to localStorage
UI Toast: ┌─────────────────────────────────────┐ │ ❌ Failed to save │ │ Network error. Retrying... │ │ [Retry Now] [Save Locally] │ └─────────────────────────────────────┘

Concurrent Edits
Scenario: Two users edit same workflow simultaneously

Behavior

Detect conflict on save (compare version numbers)
Show diff of changes
Offer options:
Keep your changes (overwrite)
Keep their changes (discard yours)
Merge changes (manual resolution)
UI Modal: ┌─────────────────────────────────────┐ │ ⚠️ Conflict Detected │ │ │ │ Admin edited this workflow while│ │ you were working on it. │ │ │ │ Your changes:│ │ • Updated email subject │ │ │ │ Their changes: │ │ • Added delay step │ │ │ │ [Keep Mine] [Keep Theirs] [Merge] │ └─────────────────────────────────────┘

Expired Session
Scenario: User's session expires while editing

Behavior

Detect expired session on next API call
Show login modal (don't redirect away)
After re-login, restore editing state
Resume editing without losing changes
UI Modal: ┌─────────────────────────────────────┐ │ 🔒 Session Expired │ │ │ │ Please log in again to continue.│ │ Your changes are saved and will │ │ be restored after login. │ │ │ │ Email: │ │ [admin@luxgen.com ]│ │ │ │ Password: │ │ [•••••••••• ]│ │ │ │ [Log In]│ └─────────────────────────────────────┘

Automation Failure (During execution)
Scenario: Workflow fails during execution (e.g., email service down)

Behavior

Log error with full context
Retry based on retry policy (max 3 attempts)
If all retries fail, mark run as failed
Send notification to workflow creator
Show error in run history with actionable details
UI (Run history) ``` ❌ Failed 2minutes ago

Error: Email service unavailable (503) Attempted3 times

[View Details] [Retry Manually] [Pause Workflow] ```

Referenced Resource Deleted
Scenario: Email template used in workflow is deleted

Behavior

Workflow validation fails
Show error in right panel: "Email template 'Welcome_v1' not found."
Prevent publishing until fixed
Suggest alternatives: "Use a different template or restore the deleted one."
UI Right Panel: ┌─────────────────────────────────────┐ │ ⚠️ Configuration Error │ │ │ │ Email template "Welcome_v1" was│ │ deleted. Please select a different│ │ template. │ │ │ │ Template: │ │ [Select template▾] │ │ │ │ [Browse Templates] │ └─────────────────────────────────────┘

Circular Dependency
Scenario: User creates a loop (Step A → Step B → Step A)

Behavior

Detect cycle on save
Show error: "Circular dependency detected."
Highlight nodes involved in cycle (red border)
Prevent publishing until fixed
UI Toast: ┌─────────────────────────────────────┐ │ ❌ Circular dependency detected │ │ │ │ Steps2 and 4 create an infinite │ │ loop. Remove one of the connections.│ │ │ │ [View Details] │ └─────────────────────────────────────┘

Orphaned Step
Scenario: User deletes a step, leaving another step disconnected

Behavior

Detect orphaned step on save
Show warning: "Step 'Send Reminder' is not connected to the workflow."
Highlight orphaned step (orange border)
Offer to delete or connect it
UI Toast: ┌─────────────────────────────────────┐ │ ⚠️ Orphaned step detected │ │ │ │ "Send Reminder" is not connected to │ │ the workflow. Connect it or delete. │ │ │ │ [Connect] [Delete] │ └─────────────────────────────────────┘

Rate Limit Exceeded
Scenario: Workflow runs1000+ times per hour (rate limit)

Behavior

Queue additional runs
Show warning in workflow builder
Notify workflow creator
Suggest increasing rate limit (upgrade plan) or optimizing trigger
UI Banner: ┌─────────────────────────────────────┐ │ ⚠️ Rate limit reached │ │ │ │ This workflow hit the 1000 runs/hour│ │ limit. 23 runs are queued. │ │ │ │ [Upgrade Plan] [Optimize Trigger] │ └─────────────────────────────────────┘

Quota Exhausted (AI credits)
Scenario: Organization runs out of AI credits mid-execution

Behavior

AI step fails with clear error
Show error in run history: "AI credits exhausted."
Notify organization owner
Suggest purchasing more credits
UI ``` Run History: ❌ Failed 5 minutes ago

Error: AI credits exhausted Step: AI Task (Personalize Path)

[Purchase Credits] [View Usage] ```

Browser Crash / Tab Closed
Scenario: User closes tab or browser crashes during editing

Behavior

Auto-save to localStorage every 10 seconds
On next visit, show banner: "You have unsaved changes. Restore?"
Offer to restore or discard
UI Banner: ┌─────────────────────────────────────┐ │ 💾 Unsaved changes detected │ │ │ │ You have unsaved changes from│ │ 10 minutes ago. Restore them? │ │ │ │ [Restore] [Discard] │ └─────────────────────────────────────┘

30. Wireframe Blueprint
Complete Low-Fidelity Specification
This section provides a comprehensive, annotated wireframe specification that a UX designer can use to reproduce the screen in Figma without additional questions.

Layout Structure
Viewport: 1440px width (desktop), responsive down to 375px (mobile)

Grid: 12-column grid, 16px gutters

Layout Zones:

Global Header (64px fixed height)
Page Header (80px fixed height)
Left Sidebar (240px width, collapsible to 64px)
Canvas Area (flexible width, fills remaining space)
Right Panel (360px width, contextual)
Sticky Footer (56px fixed height)
Zone 1: Global Header (64px height)
Purpose: App-level navigation (not workflow-specific)

Components:

Left: LuxGen logo (32px height)
Center: Global search bar (400px width)
Right: Notifications (icon), Help (icon), User avatar (32px circle)
Note: This header is consistent across all screens in LuxGen. Not specific to workflow builder.

Zone 2: Page Header (80px height)
Layout: ┌────────────────────────────────────────────────────────────────┐ │ [←] Automation > Workflows > New Learner Onboarding │ │ │ │ ✏️ New Learner Onboarding 🟢 LiveLast saved: 2m ago │ │ [Test] [•••]│ └────────────────────────────────────────────────────────────────┘

Row1 (Top, 32px height):

Back Button (Left, 32x32px)- Icon: ← (arrow-left)
Color: #787878
Hover: #2b2b2b
Click: Navigate to /automation/workflows
Breadcrumb (Next to back button)
Text: "Automation > Workflows > New Learner Onboarding"
Font: 12px, #787878
Links: "Automation", "Workflows" are clickable
Current page: "New Learner Onboarding" is not clickable, #2b2b2b
Separator: > with8px margin on each side
Row 2 (Bottom, 48px height):

Workflow Title (Left, editable)

Icon: ✏️ (pencil,16px, #787878, shows on hover)
Text: "New Learner Onboarding"
Font: 20px, bold, #2b2b2b
Editable: Click to edit inline (becomes text input)
Max length: 100 characters
Status Badge (Next to title, 16px margin-left)
Text: "Live" (or "Draft", "Paused", "Error")
Background: #16a34a (green for Live)
Text color: White
Padding: 4px 8px
Border radius: 4px
Font: 12px, bold
Last Saved (Next to status, 16px margin-left)

Text: "Last saved: 2m ago"
Font: 12px, #afafaf
Tooltip: Shows absolute timestamp on hover
Test Button (Right side, 16px margin-right)
Text: "Test"
Style: Secondary button (white bg, purple border)
Size: Medium (12px vertical, 16px horizontal padding)
Icon: None
More Menu (Next to Test, 8px margin-left)
Icon: ••• (ellipsis-vertical, 16px)
Style: Icon button (transparent bg, gray icon)
Dropdown: Opens menu with options (Duplicate, Archive, Delete, Settings, Share)
Zone 3: Left Sidebar (240px width)
Purpose: Palette of draggable elements (triggers, logic, actions)

Layout: ┌─────────────────────────┐ │ 🔍 Search│ │ │ │▼ TRIGGERS (5) │ │ ○ New Learner │ │ ○ New Sale│ │ ○ Course Complete │ │ ○ Schedule│ │ ○ Webhook│ │ │ │ ▼ LOGIC (3) │ │ ○ Condition │ │ ○ Delay │ │ ○ Branch │ │ │ │ ▼ ACTIONS (8) │ │ ○ Send Email │ │ ○ Assign Course │ │ ○ Generate Certificate│ │ ○ Create Task │ │ ○ Send Notification │ │ ○ Webhook │ │ ○ Update User Field │ │ ○ Log Event│ │ │ │ ▼ AI TOOLS (4) │ │ ○ AI Task │ │ ○ Sentiment Analysis │ │ ○ Recommendation │ │ ○ Generate Content │ │ │ │ [+ Add Custom Step] │ └─────────────────────────┘

Components:

Search Bar (Top, 40px height):

Icon: 🔍 (search, 14px, #afafaf, left side inside input)
Input: Placeholder "Search triggers, actions, logic"
Width: 100% (with 16px padding on sides)
Border: 1px solid #e4e4e4
Border radius: 8px
Font: 14px, #2b2b2b
Accordion Sections:

Section Header:

Text: "TRIGGERS (5)" (uppercase, 12px, bold, #787878)
Icon: ▼ (chevron-down, 12px, rotates when collapsed)
Padding: 12px 16px
Background: Transparent
Hover: Light gray background #f8f8f8
Click: Collapse/expand section
Section Items:

Icon: ○ (circle, 16px, #7c3aed)
Text: "New Learner" (14px, #2b2b2b)
Padding: 8px 16px
Hover: Light purple background #fbf5ff
Draggable: Cursor changes to grab hand
Tooltip: Shows description on hover
Add Custom Step (Bottom):

Button: Tertiary style (transparent bg, purple text)
Text: "+ Add Custom Step"
Font: 14px, #7c3aed
Click: Opens modal to create custom step
Responsive Behavior:

Desktop (1440px+): Full width (240px), always visible
Laptop (1024-1439px): Collapses to icons-only (64px), expands on hover
Tablet/Mobile: Becomes full-screen overlay, triggered by hamburger menu
Zone 4: Canvas Area (Flexible width)
Purpose: Visual workflow editor with drag-and-drop nodes

Layout: ┌─────────────────────────────────────────────┐ │ │ │ ┌─────────────────────┐ │ │ │ 🎯 NEW LEARNER │ │ │ │ ENROLLMENT│ │ │ │ │ │ │ │ Runs when learner │ │ │ │ joins any course │ │ │ └──────────┬──────────┘ │ ││ │ │ ▼ │ │ ┌─────────────────────┐ │ │ │ ✉️ SEND WELCOME│◄─ Selected │ │ │ EMAIL │ │ │ │ │ │ │ │ Template: │ │ │ │ Onboarding_Welcome │ │ │ └──────────┬──────────┘ │ │ │ │ │ ▼ │ │ ┌─────────────────────┐ │ │ │ ⏱️ DELAY│ │ │ │ 24 hours │ │ │ └──────────┬──────────┘ │ │ │ │ │ ▼ │ │ ┌─────────────────────┐ │ │ │ 🤖 AI TASK │ │ │ │ Personalize Path │ │ │ │ │ │ │ │ Agent: Curriculum│ │ │ │ Advisor │ │ │ └─────────────────────┘ │ │ │ │ [Zoom: 100%] [Fit] [Minimap ☑] │ │ │ │┌─────────────────┐ │ │ │ Minimap │ │ │ │┌─┐ │ │ │ │ │█│ │ │ │ │ └┬┘ │ │ │ │ █│ │ │ │ █ │ │ │ └─────────────────┘ │ └─────────────────────────────────────────────┘

Background:

Color: #fafafa (light gray)
Grid: Optional, subtle dots (4px spacing, #e4e4e4)
Infinite canvas: Pan by dragging (Space + drag)
Workflow Node (Standard size: 280px width, 100px height):

Border: 2px solid #e4e4e4 (default), #7c3aed (selected), #dc2626 (error)
Border radius: 8px
Background: White (default), #fbf5ff (selected), #fef2f2 (error)
Shadow: 0 1px 3px rgba(0,0,0,0.1) (default), 0 4px 8px rgba(124,58,237,0.2) (selected)
Padding: 16px
Node Header:

Icon: 24px, left-aligned, #7c3aed
Title: 14px, bold, #2b2b2b, next to icon
Node Body:

Text: 12px, #787878
Summary of configuration (e.g., "Template: Onboarding_Welcome_v1")
Max2 lines, truncate with ellipsis
Node Footer (Optional):

Status indicator: Small dot (8px) + text (e.g., "✓ Success", "⚠️ Failed")
Connectors:

Style: Bezier curve (smooth, not straight)
Color: #7c3aed (default), #dc2626 (error path)
Width: 2px
Arrow: Triangle at end (8px)
Animated: Optional, dashed line moves to show flow direction
Interaction:

Click node: Select (purple border)
Double-click node: Open config in right panel
Drag node: Move on canvas
Drag from sidebar: Add new node
Right-click node: Show context menu
Drag connector port: Create connection between nodes
Zoom Controls (Bottom-left, 120px width, 40px height):

Minus button: Icon −, 32x32px, gray border
Zoom level: Text "100%", 40px width, centered
Plus button: Icon +, 32x32px, gray border
Fit button: Text "Fit", 60px width, gray border
Click: Zoom in/out or fit entire workflow to screen
Minimap (Bottom-right, 160px width, 120px height):

Border: 1px solid #e4e4e4
Background: White
Nodes: Simplified rectangles (8x4px each)
Viewport: Purple rectangle showing visible area
Draggable: Drag viewport to pan canvas
Toggle: Checkbox "Minimap ☑" above minimap
Empty State (When canvas is empty): ┌─────────────────────────────────────┐ │ │ │ [Drag icon animation] │ │ │ │ Drag a trigger from the left│ │ sidebar to start building│ │ your workflow │ │ │ │ [Visual guide arrow←] │ │ │ └─────────────────────────────────────┘

Illustration: Animated hand dragging an icon
Text: 16px, #787878, centered
Arrow: Pointing to sidebar
Zone 5: Right Panel (360px width, contextual)
Purpose: Configuration form for selected node, or workflow settings when no node selected

Layout (When node selected): ┌─────────────────────────────────────┐ │ [Configure] [Test] [History] [Help] │← Tabs ├─────────────────────────────────────┤ │ Send Welcome Email │ ← Node title │ │ │ Template │ │ [Onboarding_Welcome_v1 ▾] │ │ [Preview Template] │ │ │ │ Recipient │ │ [{{learner.email}} ]│ │ 💡 Use {{variable}} syntax│ │ │ │ Subject │ │ [Welcome to LuxGen!]│ │ │ │ Body (if not using template) │ │ [ ]│ │ [ ]│ │ [ ]│ │ │ │ ▼ Advanced Settings │ │ ☑ Track opens and clicks│ │ ☐ Ignore unsubscribe list│ │ │ │ Send from │ │ [noreply@luxgen.com ▾] │ │ │ │ Reply-to │ │ [support@luxgen.com ]│ │ │ ├─────────────────────────────────────┤ │ [Delete Step] [Save] │ ← Footer └─────────────────────────────────────┘

Tabs (Top, 40px height):

Configure: Default active tab
Test: Run this step with sample data
History: Recent executions of this step
Help: Documentation and examples
Style: Underline on active tab (2px, purple)
Font: 14px, #787878 (inactive), #7c3aed (active)
Node Title (Below tabs, 48px height):

Text: "Send Welcome Email" (16px, bold, #2b2b2b)
Icon: ✉️ (24px, left of text)
Form Fields:

Label: 12px, uppercase, #787878, margin-bottom 8px
Input: 40px height, 14px font, #2b2b2b, border 1px #e4e4e4, border-radius 8px
Dropdown: Same as input, with chevron-down icon on right
Textarea: 120px height (3 lines), resizable
Checkbox: 16x16px, purple when checked
Help Text: 12px, #afafaf, below field, icon💡 (12px)
Error Message: 12px, #dc2626, below field, icon ⚠️ (12px)
Advanced Settings (Collapsible):

Header: "▼ Advanced Settings" (14px, #787878, clickable)
Collapsed: Only header visible
Expanded: Shows additional fields
Animation: Smooth expand/collapse (200ms)
Footer (Bottom, 56px height):

Delete Button: Tertiary style, red text, left-aligned
Save Button: Primary style, right-aligned
Layout (When no node selected): ┌─────────────────────────────────────┐ │ Workflow Settings │ │ │ │ General │ │ Name: [New Learner Onboarding ]│ │ Description: [ ]│ │ Category: [Learning▾] │ │ Tags: [+ Add tag] │ │ │ │ Notifications │ │ Notify on success: [Toggle: OFF] │ │ Notify on failure: [Toggle: ON] │ │ Recipients: [admin@luxgen.com ]│ │ │ │ ─────────────────────────────────│ │ │ │ 💡 AI Suggestions│ │ │ │ Add a delay between emails to│ │ improve deliverability. │ │ [Apply] │ │ │ │ ───────────────────────────────── │ │ │ │ 📊 Performance │ │ │ │ Total Runs: 1,234 │ │ Success Rate: 98.5% │ │ Avg Duration: 2.3s │ │ Last Run: 2 minutes ago │ │ │ │ [View Full Analytics →] │ │ │ │ ───────────────────────────────── │ │ │ │ Activity │ │ │ │ ⚡ Workflow ran successfully │ │ 2 minutes ago │ │ │ │ ✏️ Admin updated step │ │ 10 minutes ago │ │ │ │ [Load More] │ └─────────────────────────────────────┘

Zone 6: Sticky Footer (56px height)
Purpose: Primary actions and status indicators

Layout: ┌────────────────────────────────────────────────────────────────┐ │ ⚠️ Unsaved changes (3)[Discard] [Save Draft] [Save] │ └────────────────────────────────────────────────────────────────┘

Left Side:

Unsaved Changes Indicator:
Icon: ⚠️ (16px, #ea580c)
Text: "Unsaved changes (3)" (14px, #2b2b2b)
Count: Number of unsaved edits
Hidden if no unsaved changes
Right Side:

Discard Button:

Style: Tertiary (transparent bg, gray text)
Text: "Discard"
Click: Confirm dialog, then revert to last saved state
Save Draft Button:

Style: Secondary (white bg, purple border)
Text: "Save Draft"
Click: Save without publishing
Save Button (or "Save & Publish" if draft):

Style: Primary (purple bg, white text)
Text: "Save" (if already live) or "Save & Publish" (if draft)
Click: Save and activate workflow
Disabled if validation errors exist
Validation Status (Center, optional):

Text: "✓ Ready to publish" (green) or "⚠️ 2 errors" (orange)
Font: 12px
Click: Opens validation error list
Responsive Breakpoints
Desktop (1440px+):

Three-column layout: Sidebar (240px) | Canvas (flexible) | Panel (360px)
All zones visible simultaneously
Laptop (1024-1439px):

Sidebar collapses to 64px (icons only), expands on hover
Panel remains visible (320px)
Canvas adjusts width
Tablet (768-1023px):

Sidebar becomes overlay (full-screen, slide from left)
Canvas full width
Panel becomes bottom drawer (slides up)
Mobile (375-767px):

Single-column layout
Sidebar: Full-screen overlay
Canvas: Full-screen
Panel: Full-screen modal (bottom sheet)
Footer: Simplified (only primary action visible)
Interaction Flows
Flow 1: Create Workflow from Scratch

User clicks "Create Workflow" from list
Opens builder with empty canvas
User drags "New Learner" trigger from sidebar to canvas
Trigger node appears on canvas
User drags "Send Email" action from sidebar to canvas
Action node appears below trigger
User connects trigger to action (drag from trigger's bottom port to action's top port)
Connector line appears
User clicks "Send Email" node
Right panel shows configuration form
User fills in template, recipient, subject
User clicks "Save" in footer
Workflow saved as draft
User clicks "Publish" in footer
Validation runs (all checks pass)
Modal shows "Publishing..." with progress
Workflow published, status changes to "Live"
Toast notification: "Workflow published successfully"
Flow 2: Edit Existing Workflow

User navigates to workflow from list
Builder loads with workflow structure
User clicks node to edit
Right panel shows configuration
User changes field value
Autosave indicator shows "Saving..."
After10 seconds, "Saved10s ago"
User continues editing
User clicks "Save" in footer to manually save
Changes saved immediately
Flow 3: Test Workflow

User clicks "Test" button in header
Drawer slides in from right
Form shows sample data inputs
User fills in test data (or uses defaults)
User clicks "Run Test"
Progress indicator shows "Running..."
Each step executes, showing real-time status
Test completes, shows results (success/failure per step)
User reviews output
User closes drawer, returns to editing
Annotations for Designer
Color Palette:

Primary Purple: #7c3aed
Dark Gray (text): #2b2b2b
Medium Gray (secondary text): #787878
Light Gray (tertiary text): #afafaf
Border Gray: #e4e4e4
Background Gray: #f8f8f8
White: #ffffff
Success Green: #16a34a
Error Red: #dc2626
Warning Orange: #ea580c
Typography:

Font Family: Inter (or system default)
Base Size: 14px
Headings: 16px (H3), 20px (H2), 24px (H1)
Small Text: 12px
Tiny Text: 10px
Spacing:

Base Unit: 4px
Common Values: 8px, 12px, 16px, 24px, 32px
Border Radius:

Small: 4px (badges)
Medium: 8px (buttons, inputs, cards)
Large: 12px (modals)
Shadows:

Subtle: 0 1px 3px rgba(0,0,0,0.1)
Medium: 0 4px 8px rgba(0,0,0,0.1)
Strong: 0 8px 16px rgba(0,0,0,0.15)
Animations:

Duration: 200ms (fast), 300ms (standard), 500ms (slow)
Easing: ease-in-out (default), ease-out (enter), ease-in (exit)
This completes the comprehensive wireframe blueprint. A designer can now recreate this screen in Figma with pixel-perfect accuracy and complete understanding of all interactions, states, and edge cases.