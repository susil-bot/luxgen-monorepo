LuxGen Search Architecture - Complete Wireframe Specification
1. Search System Overview
Purpose
The LuxGen search system is a unified, AI-powered discovery layer that spans all platform content. It provides multiple entry points and search modalities to help users find courses, learners, workflows, orders, content, and settings instantly.

Search Types
Global Search
Universal search across all content types
Command Palette
Keyboard-driven action launcher
AI Search
Natural language conversational search
Contextual Search
Domain-specific search within sections
Saved Searches
Bookmarked search queries with notifications
Advanced Search
Complex multi-filter queries
Key Principles
Speed: Results appear in<200ms
Intelligence: AI understands intent, not just keywords
Context: Search knows where you are and what you're doing
Memory: Learns from your search patterns
Action: Search results are actionable, not just links
2. Global Search
Entry Points
1. Header Search Bar (Always visible) ┌─────────────────────────────────────────────────────────────┐ │ LuxGen [🔍 Search anything... Cmd+K] 🔔👤 Admin │ └─────────────────────────────────────────────────────────────┘

Location: Top center of global header Width: 400px (desktop), expands to 600px on focus Placeholder: "Search anything...⌘K" Icon: 🔍 (left side,16px, #afafaf) Shortcut Badge: "⌘K" (right side, subtle gray badge)

Global Search Overlay (Activated State)
Trigger:

Click search bar
Press Cmd+K (Mac) or Ctrl+K (Windows)
Press / (quick access)
Layout: ┌─────────────────────────────────────────────────────────────────────┐ │ [Dark Overlay60%] │ │ │ │ ┌───────────────────────────────────────────────────────────────┐ │ │ │ 🔍 [Search anything...........................] [✕]│ │ │ │ │ │ │ │ ┌─────────────────┬──────────────────────────────────────────┐│ │ │ │ │ FILTERS │ RESULTS ││ │ │ │ │ │ ││ │ │ │ │ All Types│ 🎓 New Learner Onboarding ││ │ │ │ │ Courses │ Course • Learning ││ │ │ │ │ Learners │ 234 enrolled • 89% completion ││ │ │ │ │ Workflows │ [View] [Edit]││ │ │ │ │ Orders │ ││ │ │ │ │ Products │⚡ Welcome Email Workflow││ │ │ │ │ Users │ Automation • Live││ │ │ │ │ Settings │ 1,234 runs • 98.5% success││ │ │ │ │ │ [View] [Edit] ││ │ │ │ │ RECENT│ ││ │ │ │ │ • Marketing... │ 👤 John Smith││ │ │ │ │ • Course Ana... │ Learner • Active ││ │ │ │ │ │ Enrolled in 3 courses ││ │ │ │ │ SAVED│ [View Profile] [Message] ││ │ │ │ │⭐ High-value.. │ ││ │ │ │ │⭐ Failed wor.. │🛒 Order #12345 ││ │ │ │ │ │ $299.00 • Completed││ │ │ │ │ │ Jan 5, 2025││ │ │ │ │ │ [View Details]││ │ │ │ │ │ ││ │ │ │ │ │ ⚙️ Email Settings││ │ │ │ │ │ Settings • Platform ││ │ │ │ │ │ Configure SMTP and sender ││ │ │ │ │ │ [Go to Settings] ││ │ │ │ └─────────────────┴──────────────────────────────────────────┘│ │ │ │ │ │ │ │ 💡 AI Suggestion: Try "courses with low completion rate" │ │ │ │ │ │ │ │ [Tab] Navigate • [↵] Open • [⌘↵] Open in new tab • [Esc] Close│ │ │ └───────────────────────────────────────────────────────────────┘ │ │ │ └─────────────────────────────────────────────────────────────────────┘

Component Specifications
Search Input
Height: 56px
Border: 2px solid #7c3aed (purple, focused state)
Border Radius: 12px (top only, connected to results)
Font Size: 16px
Padding: 16px 48px 16px 48px (icon left, close right)
Background: White
Shadow: 0 8px 24px rgba(0,0,0,0.15)
Filter Sidebar (Left)
Width: 200px
Background: #f8f8f8
Border Right: 1px solid #e4e4e4
Padding: 16px
Filter Categories: ``` ALL TYPES (default selected) ├── Courses (23) ├── Learners (156) ├── Workflows (12) ├── Orders (89) ├── Products (34) ├── Users (203) ├── Content (45) └── Settings (8)

RECENT (Last 10 searches) ├── "Marketing automation" ├── "Course analytics" └── ...

SAVED (Starred searches) ├── ⭐ High-value customers ├── ⭐ Failed workflows └── [+ Save this search] ```

Interaction:

Click category to filter results
Show result count in parentheses
Highlight selected filter with purple background
Recent searches show timestamp on hover
Saved searches show notification badge if new results
Results Panel (Right)
Width: Flexible (fills remaining space)
Max Height: 500px
Scroll: Vertical scroll if more than 6 results
Background: White
Padding: 16px
Result Card Structure: ┌──────────────────────────────────────────────┐ │ [Icon] Title[Actions]│ │ Type • Status│ │ Metadata line (enrollment, date, etc) │ └──────────────────────────────────────────────┘

Result Card Specs:

Height: 80px
Padding: 12px
Border Bottom: 1px solid #e4e4e4
Hover: Light purple background #fbf5ff
Selected (keyboard nav): Purple border left3px
Icon (Left, 32x32px):

Course: 🎓
Learner: 👤
Workflow: ⚡
Order: 🛒
Product: 📦
Settings: ⚙️
Content: 📄
Title:

Font: 14px, bold, #2b2b2b
Truncate with ellipsis after 60 characters
Highlight matching text with yellow background
Metadata Line1:

Font: 12px, #787878
Format: "Type • Status"
Example: "Course • Published" or "Automation • Live"
Metadata Line 2:

Font: 12px, #afafaf
Context-specific info
Examples:
Course: "234 enrolled • 89% completion"
Workflow: "1,234 runs • 98.5% success"
Learner: "Enrolled in 3 courses"
Order: "$299.00 • Jan 5, 2025"
Action Buttons (Right side):

Primary: [View] or [Open]
Secondary: [Edit] or context-specific action
Button style: Small, tertiary (transparent bg, purple text)
Show on hover or always visible (mobile)
AI Suggestion Bar (Bottom)
Height: 40px
Background: #fbf5ff (light purple)
Icon: 💡 (16px, left)
Text: "Try 'courses with low completion rate'" (14px, purple)
Clickable: Clicking replaces search query
Dismissible: X button on right
Keyboard Shortcuts Footer
Height: 32px
Background: #f8f8f8
Font: 11px, #afafaf
Format: "[Tab] Navigate • [↵] Open • [⌘↵] Open in new tab • [Esc] Close"
Search States
Empty State (No query)
┌───────────────────────────────────────────────┐
│ 🔍 [Search anything...][✕] │
│                                               │
│ ┌───────────┬─────────────────────────────────┐
│ │ RECENT│                │
│ │           │  Start typing to search...      │
│ │ • Market..│                                 │
│ │ • Course..│  Or try:│
│ │           │  • "courses with low completion"│
│ │ SAVED     │  • "learners enrolled this week"│
│ │ ⭐ High...│  • "failed workflows"            │
│ │           │  • "orders over $1000"          │
│ └───────────┴─────────────────────────────────┘
└───────────────────────────────────────────────┘
Loading State (Searching)
┌───────────────────────────────────────────────┐
│ 🔍 [marketing automation.............][✕] │
│                                               │
│ ┌───────────┬─────────────────────────────────┐
│ │ FILTERS   │                                 │
│ │           │  [Spinner] Searching...         │
│ │ All Types │                                 │
│ │           │                                 │
│ └───────────┴─────────────────────────────────┘
└───────────────────────────────────────────────┘
No Results State
┌───────────────────────────────────────────────┐
│ 🔍 [asdfghjkl........................]   [✕] │
│                                               │
│ ┌───────────┬─────────────────────────────────┐
│ │ FILTERS   │                                 │
│ │           │  No results found               │
│ │ All Types │                                 │
│ │ Courses   │  Try:                           │
│ │ Learners  │  • Check your spelling│
│ │           │  • Use different keywords       │
│ │           │  • Remove filters               │
│ │           │  • Try AI Search for natural    │
│ │           │language queries             │
│ ││                                 │
│ ││  [Switch to AI Search]          │
│ └───────────┴─────────────────────────────────┘
└───────────────────────────────────────────────┘
Error State
┌───────────────────────────────────────────────┐
│ 🔍 [marketing automation.............]   [✕] │
│                                               │
│ ┌───────────┬─────────────────────────────────┐
│ │ FILTERS   │                                 │
│ │           │⚠️ Search temporarily unavailable│
│ │ All Types │                                 │
│ │           │  We're having trouble connecting│
│ │           │  to the search service.         │
│ │           │                                 │
│ │           │  [Retry] [Report Issue]         │
│ └───────────┴─────────────────────────────────┘
└───────────────────────────────────────────────┘
Search Result Types
1. Course Result
┌──────────────────────────────────────────────┐
│ 🎓 Advanced Marketing Automation    [View] [Edit]│
│    Course • Published│
│    234 enrolled • 89% completion •4.8★│
└──────────────────────────────────────────────┘
2. Learner Result
┌──────────────────────────────────────────────┐
│ 👤 John Smith                  [View] [Message]│
│    Learner • Active                          │
│    Enrolled in 3 courses • Last active2h ago│
└──────────────────────────────────────────────┘
3. Workflow Result
┌──────────────────────────────────────────────┐
│ ⚡ Welcome Email Workflow        [View] [Edit]│
│    Automation • Live                         │
│    1,234 runs • 98.5% success • Last run 5m│
└──────────────────────────────────────────────┘
4. Order Result
┌──────────────────────────────────────────────┐
│ 🛒 Order #12345                      [View]│
│    Order • Completed                         │
│    $299.00 • John Smith • Jan 5, 2025        │
└──────────────────────────────────────────────┘
5. Product Result
┌──────────────────────────────────────────────┐
│ 📦 Pro Subscription Plan[View] [Edit]│
│    Product • Active│
│    $99/month • 156 active subscribers│
└──────────────────────────────────────────────┘
6. Settings Result
┌──────────────────────────────────────────────┐
│ ⚙️ Email Settings                [Open]   │
│    Settings • Platform│
│    Configure SMTP server and sender address│
└──────────────────────────────────────────────┘
7. Content Result (Page/Post)
┌──────────────────────────────────────────────┐
│ 📄 Getting Started Guide         [View] [Edit]│
│    Page • Published                          │
│    Last edited 2 days ago by Admin│
└──────────────────────────────────────────────┘
Search Ranking Algorithm
Factors (in order of priority):

Exact match
Title exactly matches query (weight: 100)
Prefix match
Title starts with query (weight: 80)
Word match
All query words in title (weight: 60)
Partial match
Some query words in title (weight: 40)
Description match
Query in description (weight: 20)
Recency
Recently created/updated (weight: 10)
Popularity
View count, enrollment, usage (weight: 5)
User history
Previously accessed by user (weight: 15)
Boosting:

Items user created: +20points
Items user recently viewed: +10 points
Items in current domain: +5 points
Filtering:

Respect user permissions (hide inaccessible items)
Archived items appear at bottom with [Archived] badge
Deleted items excluded
3. Command Palette
Purpose
Keyboard-driven action launcher for power users. Execute actions without leaving keyboard.

Entry Points
Press Cmd+K or Ctrl+K anywhere
Type > in global search to switch to command mode
Click "Commands" tab in search overlay
Command Palette Interface
┌─────────────────────────────────────────────────────────────────┐
│                [Dark Overlay 60%]                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ > [Type a command or search.....................] [✕]      ││
│  │                                                             ││
│  │ SUGGESTED ACTIONS                           ││
│  │                                                             ││
│  │ ⚡ Create new courseCmd+N     ││
│  │ 📊 View analytics dashboardCmd+D     ││
│  │ 👤 Go to learnersCmd+L     ││
│  │ ⚙️ Open settings                                  Cmd+,     ││
│  │                                                             ││
│  │ RECENT COMMANDS                                             ││
│  │                                                             ││
│  │ ⚡ Create workflow││
│  │ 📧 Send email to learners││
│  │ 📥 Export orders                            ││
│  │                                             ││
│  │ QUICK NAVIGATION││
│  │                                                             ││
│  │🏠 DashboardCmd+H     ││
│  │ 📚 LearningCmd+1     ││
│  │🛒 CommerceCmd+2     ││
│  │ ⚡ Automation                                     Cmd+3     ││
│  └─────────────────────────────────────────────────────────────┘│
││
└─────────────────────────────────────────────────────────────────┘
Command Categories
1. Create Actions
> create

Results:
⚡ Create new course
⚡ Create workflow
⚡ Create product
⚡ Create learner
⚡ Create announcement
⚡ Create coupon
⚡ Create AI agent
⚡ Create email template
2. Navigation Commands
> go to

Results:
🏠 Go to Dashboard
📚 Go to Courses
👤 Go to Learners
⚡ Go to Workflows
🛒 Go to Orders
📊 Go to Analytics
⚙️ Go to Settings
3. View Commands
> view

Results:
📊 View analytics dashboard
📈 View revenue report
👥 View active learners
⚠️ View failed workflows
🎓 View course analytics
4. Export Commands
> export

Results:
📥 Export learners to CSV
📥 Export orders to CSV
📥 Export analytics report
📥 Export workflow runs
5. Settings Commands
> settings

Results:
⚙️ Open platform settings
⚙️ Open billing settings
⚙️ Open email settings
⚙️ Open security settings
⚙️ Open integration settings
6. Help Commands
> help

Results:
❓ Open documentation
❓ Contact support
❓ View keyboard shortcuts
❓ Watch tutorial videos
❓ Join community forum
Command Structure
Format: [Icon] [Action] [Target] [Shortcut]

Examples:

⚡ Create new course → Opens course creation wizard
📊 View analytics dashboard → Navigates to analytics
👤 Go to learners → Navigates to learner list
📥 Export orders to CSV → Opens export modal
Command Execution:

Press Enter to execute
Some commands open modals (Create, Export)
Some commands navigate to pages (Go to, View)
Some commands perform actions (Send, Delete)
Command Palette States
Empty State (No query)
┌─────────────────────────────────────────────┐
│ > [Type a command or search...][✕] │
│                │
│ SUGGESTED ACTIONS                           │
│ ⚡ Create new courseCmd+N   │
│ 📊 View analytics dashboard         Cmd+D   │
│ 👤 Go to learners                   Cmd+L   │
│                             │
│ RECENT COMMANDS                             │
│ ⚡ Create workflow                │
│ 📧 Send email to learners                   │
│                                             │
│ TIP: Type ">" for commands, "/" for search │
└─────────────────────────────────────────────┘
Filtered Results
┌─────────────────────────────────────────────┐
│ > [create course......................][✕]│
│                                             │
│ COMMANDS (2)│
│ ⚡ Create new course                Cmd+N   │
│ ⚡ Create course from template              │
│                                             │
│ RECENT (1)                                  │
│🎓 Advanced Marketing Automation            │
│    Course • Published                       │
└─────────────────────────────────────────────┘
No Results
┌─────────────────────────────────────────────┐
│ > [delete everything................][✕]│
│                                             │
│ No commands found                           │
│                                             │
│ Try:│
│ • "create" - Create new items│
│ • "go to" - Navigate to pages               │
│ • "view" - View reports and analytics       │
│ • "export" - Export data                    │
│                             │
│ [View all commands]                         │
└─────────────────────────────────────────────┘
Command Palette Keyboard Navigation
Shortcuts:

Cmd+K or Ctrl+K
Open command palette
Esc
Close command palette
↑ ↓
Navigate results
Enter
Execute selected command
Cmd+Enter
Execute in new tab (if applicable)
Tab
Switch between search and command mode
Backspace (empty input) - Clear mode (remove >)
4. AI Search
Purpose
Natural language conversational search powered by AI. Understands intent, not just keywords.

Entry Points
Click "AI Search" button in global search
Type ? in global search to switch to AI mode
Voice command: "Hey LuxGen, find..."
AI Search Interface
┌─────────────────────────────────────────────────────────────────┐
│                     [Dark Overlay 60%]                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🤖 [Ask me anything in plain English...........] 🎤   [✕]││
│  │                                                             ││
│  │┌───────────────────────────────────────────────────────────┤│
│  │ │                ││
│  │ │ You: Show me courses with low completion rates          ││
│  │ │                                                           ││
│  │ │ AI: I found 5 courses with completion rates below 50%:││
│  │ │                                           ││
│  │ │ 🎓 Introduction to Python││
│  │ │42% completion • 156 enrolled                ││
│  │ │Common drop-off: Lesson 3 (Functions)                ││
│  │ │    [View Course] [View Analytics] [Create Workflow]     ││
│  │ │                                                           ││
│  │ │ 🎓 Advanced JavaScript││
│  │ │    38% completion • 89 enrolled                          ││
│  │ │    Common drop-off: Lesson 5 (Async/Await)              ││
│  │ │    [View Course] [View Analytics]││
│  │ │                                                           ││
│  │ │ 🎓 Data Science Fundamentals                             ││
│  │ │    45% completion • 203 enrolled                         ││
│  │ │    Common drop-off: Lesson 7 (Statistics)               ││
│  │ │    [View Course] [View Analytics]                       ││
│  │ │                                                           ││
│  │ │ 💡 Suggestion: Create a re-engagement workflow for││
│  │ │    learners who haven't logged in for 7 days?           ││
│  │ │    [Create Workflow]                                     ││
│  │ │                                                           ││
│  │ │ Would you like me to:                                    ││
│  │ │ • Show engagement metrics for these courses││
│  │ │ • Find similar courses with high completion              ││
│  │ │ • Create a report comparing these courses                ││
│  │ │                                                           ││
│  │ └───────────────────────────────────────────────────────────┤│
│  │                                                ││
│  │ [Type your follow-up question or click a suggestion...]    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
AI Search Features
1. Natural Language Understanding
Supported Queries:

"Show me courses with low completion rates"
"Who are my highest spending customers?"
"Which workflows failed in the last 24 hours?"
"Find learners who enrolled this week but haven't started"
"What are my best-selling products?"
"Show me revenue for January"
"Which instructors have the highest ratings?"
"Find orders over $1000 from last month"
2. Conversational Context
AI remembers conversation history:

You: Show me courses with low completion rates

AI: [Shows 5 courses]

You: Which one has the most enrollments?

AI: "Introduction to Python" has the most enrollments with 156 learners, despite its42% completion rate.[View Course]
3. Actionable Suggestions
AI proactively suggests next steps:

Create workflow
Send email
Export report
View analytics
Compare items
4. Multi-step Queries
AI can handle complex multi-step requests:

You: Show me learners who enrolled in "Marketing101" 
     in the last 30 days but haven't completed lesson 1

AI: I found 23 learners matching your criteria:[List of learners]Would you like me to:
    • Send them a reminder email
    • Create an automated follow-up workflow
    • Export this list to CSV
5. Data Aggregation
AI can aggregate and analyze data:

You: What's my average order value this month?

AI: Your average order value for January2025 is $247.50
    This is15% higher than last month ($215.00)
    
    Top contributing products:
    • Pro Subscription: $99/mo (45 orders)
    • Course Bundle: $299(23 orders)
    • Enterprise Plan: $499/mo (12 orders)
    
    [View Revenue Report] [View Orders]
AI Search Conversation UI
Message Bubble (User): ┌─────────────────────────────────────────┐ │ Show me courses with low completion │ │ rates │ └─────────────────────────────────────────┘

Background: #7c3aed (purple)
Text: White
Border Radius: 12px
Padding: 12px 16px
Max Width: 70%
Align: Right
Message Bubble (AI): ┌─────────────────────────────────────────┐ │ 🤖 I found 5 courses with completion │ │ rates below 50%: │ │ │ │ [Result cards] │ │ │ │ 💡 Suggestion: Create a workflow? │ │ [Create Workflow] │ └─────────────────────────────────────────┘

Background: #f8f8f8 (light gray)
Text: #2b2b2b
Border Radius: 12px
Padding: 12px 16px
Max Width: 85%
Align: Left
Typing Indicator: ┌─────────────────────────────────────────┐ │🤖 AI is thinking... │ │ [Animated dots:●●●]│ └─────────────────────────────────────────┘

Suggested Follow-ups (Chips below AI message): [Show engagement metrics] [Find similar courses] [Create report]

Style: Small pill buttons
Background: White
Border: 1px solid #e4e4e4
Hover: Purple border
Click: Sends as new query
AI Search Voice Input
Activation:

Click microphone icon 🎤 in search bar
Say "Hey LuxGen" (if enabled)
Voice Recording UI: ┌─────────────────────────────────────────┐ │ 🎤Listening...│ │ │ │ [Waveform animation] │ │ │ │ "Show me courses with..."│ │ │ │ [Stop] [Cancel] │ └─────────────────────────────────────────┘

Voice Processing: ┌─────────────────────────────────────────┐ │ 🎤 Processing... │ │ │ │ [Spinner] │ │ │ │ Converting speech to text... │ └─────────────────────────────────────────┘

Transcription Confirmation: ┌─────────────────────────────────────────┐ │ Did you say:│ │ "Show me courses with low completion │ │ rates" │ │ │ │ [Yes, search] [No, try again] │ └─────────────────────────────────────────┘

5. Saved Searches
Purpose
Bookmark complex searches and get notified when new results appear.

Saved Search List
Location: Left sidebar in global search, or dedicated page /search/saved

┌─────────────────────────────────────────────────────────────────┐
│ Saved Searches                                    [+ New Search] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ⭐ High-value customers[•••]│
│    Orders > $1000 • Last 30 days                3 new │
│    Created Jan 1, 2025 • Notify: Daily│
│    [View Results] [Edit] [Delete]                               │
│                                                                 │
│ ⭐ Failed workflows                                        [•••]│
│    Status: Failed • Last 24 hours                         0 new │
│    Created Dec 15, 2024 • Notify: Immediately│
│    [View Results] [Edit] [Delete]                               │
│                                                                 │
│ ⭐ Inactive learners                                       [•••]│
│    No activity > 14 days • Enrolled in any course         12 new│
│    Created Jan 3, 2025 • Notify: Weekly                         │
│    [View Results] [Edit] [Delete]                               │
│                                                                 │
│ ⭐ Low completion courses[•••]│
│    Completion rate < 50% • Active courses1 new │
│    Created Dec 20, 2024 • Notify: Weekly│
│    [View Results] [Edit] [Delete]                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
Create Saved Search Modal
Trigger: Click "Save this search" in search results

┌─────────────────────────────────────────────────────────────────┐
│ Save Search[✕] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Name *│
│ [High-value customers...................................]│
│                                                                 │
│ Description (optional)                                          │
│ [Track customers who place orders over $1000...........]       │
│ [...................................................]       │
│                                                                 │
│ Search Query│
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Type: Orders││
│ │ Filters:││
│ │ • Amount > $1000                                            ││
│ │ • Date: Last 30 days                                        ││
│ │ • Status: Completed                                         ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Notifications│
│ ☑ Notify me when new results appear                            │
│                                                                 │
│ Frequency                                       │
│ ○ Immediately│
│ ● Daily digest (9:00 AM)                                        │
│ ○ Weekly digest (Monday9:00 AM)                                │
│ ○ Never                                                         │
│                                                                 │
│ Notification channels                                           │
│ ☑ Email                                                         │
│ ☑ Push notification                                             │
│ ☐ Slack                                                         │
│                                                 │
│ Privacy│
│ ● Private (only you can see this)                              │
│ ○ Shared (visible to team members)                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                    [Cancel] [Save Search]       │
└─────────────────────────────────────────────────────────────────┘
Saved Search Notification
Email Notification: ``` Subject: [LuxGen] 3 new results for "High-value customers"

Hi Admin,

Your saved search "High-value customers" has3 new results:

Order #12456 - $1,250.00 - John Smith - Jan 15, 2025
Order #12457 - $1,500.00 - Jane Doe - Jan 16, 2025
Order #12458 - $1,100.00 - Bob Johnson - Jan 16, 2025
[View All Results] [Manage This Search]

--- You're receiving this because you created a saved search with daily notifications. [Unsubscribe] [Update Preferences] ```

In-App Notification: ┌─────────────────────────────────────────┐ │ 🔔 3 new results for "High-value│ │ customers" │ │ │ │ • Order #12456 - $1,250.00 │ │ • Order #12457 - $1,500.00 │ │ • Order #12458 - $1,100.00 │ │ │ │ [View Results] [Dismiss] │ └─────────────────────────────────────────┘

6. Advanced Search / Filters
Purpose
Complex multi-filter queries for power users who need precise control.

Advanced Search Interface
Location: Click "Advanced" in global search, or dedicated page /search/advanced

┌─────────────────────────────────────────────────────────────────┐
│ Advanced Search                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Search in│
│ [All types▾]                                                   │
│                                                                 │
│ Keywords│
│ [marketing automation...................................]       │
│ ○ Match all words● Match any word   ○ Exact phrase          │
│                                                                 │
│┌─────────────────────────────────────────────────────────────┐│
│ │ FILTERS                                                     ││
│ │                ││
│ │ Date Range                                                  ││
│ │ From: [Jan 1, 2025 ▾]To: [Jan 31, 2025 ▾]                ││
│ │ ○ Created● Updated   ○ Published││
│ │                                                             ││
│ │ Status││
│ │ ☑ Active   ☑ Draft☐ Archived☐ Deleted               ││
│ │                                                             ││
│ │ Created by││
│ │ [Select user ▾]                                             ││
│ │                                                             ││
│ │ Tags                                                        ││
│ │ [Select tags ▾]                                             ││
│ │                                                             ││
│ │ [+ Add filter]││
│ │                                                             ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ TYPE-SPECIFIC FILTERS (Course)││
│ │                                                             ││
│ │ Enrollment                                  ││
│ │ Min: [0....]  Max: [1000....]                ││
│ │                                                             ││
│ │ Completion Rate                                             ││
│ │ Min: [0%...]  Max: [100%...]││
│ │                                                             ││
│ │ Price                                       ││
│ │ ○ Free   ○ Paid   ● Any││
│ │ Range: $[0....] to $[999....]                               ││
│ │                                                             ││
│ │ Instructor                                                  ││
│ │ [Select instructor ▾]                                       ││
│ │                                                             ││
│ │ Category                                                    ││
│ │ [Select category ▾]                                         ││
│ │                                                             ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Sort by│
│ [Relevance ▾]  [Descending ▾]                │
│                                                                 │
│ Results per page                                                │
│○ 10   ● 25   ○ 50   ○ 100                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Reset] [Save as Search] [Search]│
└─────────────────────────────────────────────────────────────────┘
Filter Builder
Dynamic Filters (Change based on content type):

Course Filters:

Enrollment (min/max)
Completion rate (min/max)
Price (free/paid, range)
Duration (hours)
Difficulty (beginner/intermediate/advanced)
Language
Instructor
Category
Rating (min/max stars)
Learner Filters:

Enrollment date (range)
Last active (range)
Courses enrolled (min/max)
Courses completed (min/max)
Total spent (min/max)
Tags
Team
Role
Order Filters:

Order date (range)
Amount (min/max)
Status (pending/completed/refunded)
Payment method
Customer
Product
Coupon used
Workflow Filters:

Trigger type
Status (live/paused/draft)
Success rate (min/max %)
Total runs (min/max)
Last run (date range)
Created by
Filter Chips (Active Filters Display)
Location: Above search results

┌─────────────────────────────────────────────────────────────────┐
│ Active Filters:                                                 │
│ [Type: Course ✕] [Status: Active ✕] [Enrollment: 100-500 ✕]│
│ [Completion: < 50% ✕] [Created: Last 30 days ✕]│
│                                                                 │
│ [Clear all filters]                                             │
└─────────────────────────────────────────────────────────────────┘
Chip Style:

Background: #fbf5ff (light purple)
Border: 1px solid #7c3aed
Text: #7c3aed
Close icon: ✕ (clickable, removes filter)
Padding: 6px 12px
Border Radius: 16px
7. Recent Searches
Purpose
Quick access to previous searches. Automatically tracked.

Recent Search List
Location:

Left sidebar in global search
Dropdown below search bar (on focus)
┌─────────────────────────────────────────┐
│ RECENT                                  │
││
│ 🕐 marketing automation                 │
│    2minutes ago •12 results│
│    [Search again] [✕]                   │
│                                         │
│ 🕐 course analytics                     │
│    1 hour ago • 5 results               │
│    [Search again] [✕]                   │
│                                         │
│ 🕐 failed workflows                     │
│    Yesterday • 3 results                │
│    [Search again] [✕]                   │
│                                         │
│ 🕐 learners enrolled this week          │
│    2 days ago • 45 results              │
│    [Search again] [✕]                   │
│                                         │
│ [Clear history]                         │
└─────────────────────────────────────────┘
Recent Search Features
Auto-tracking:

Tracks last 20 searches
Stores query, filters, result count, timestamp
Syncs across devices (cloud storage)
Privacy:

User can clear individual searches
User can clear all history
User can disable tracking (Settings > Privacy)
Smart Deduplication:

Same query multiple times = update timestamp
Don't show duplicate consecutive searches
8. Pinned Searches
Purpose
Pin frequently-used searches to top of search list for instant access.

Pinned Search List
Location: Top of left sidebar in global search

┌─────────────────────────────────────────┐
│ PINNED                                  │
│                                         │
│ 📌 Active learners                      │
│    Status: Active • Last 7 days         │
│    [Search] [Unpin]                     │
│                                         │
│ 📌 Today's orders                       │
│    Date: Today • Status: Completed      │
│    [Search] [Unpin]                     │
│                                         │
│ 📌 High-priority tickets                │
│    Priority: High • Status: Open        │
│    [Search] [Unpin]                     │
│                                         │
└─────────────────────────────────────────┘
Pin/Unpin Actions
Pin Search:

Click pin icon 📌 next to search result
Or click "Pin this search" in search dropdown menu
Unpin Search:

Click unpin icon in pinned list
Or click "Unpin" button
Max Pinned Searches: 5 (to prevent clutter)

9. Search Analytics
Purpose
Track search performance and user behavior to improve search quality.

Search Analytics Dashboard
Location: /analytics/search (Admin only)

┌─────────────────────────────────────────────────────────────────┐
│ Search Analytics                              [Last 30 days ▾] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│┌────────────┬────────────┬────────────┬────────────┐│
│ │ Total│ Avg Results│ Zero Results│ Click-through│        │
│ │ Searches   │ per Search │ Rate        │ Rate         │        │
│ │12,456     │ 8.3        │ 12%         │ 67%          │        │
│ │↑ 15%      │ → Same│ ↓ 3%        │ ↑ 5%         │        │
│ └────────────┴────────────┴────────────┴────────────┘          │
│                                                                 │
│ Top Searches (Last 30 days)                                     │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Query│ Count │ Avg Results │ CTR       ││
│ ├─────────────────────────────────────────────────────────────┤│
│ │ course analytics         │ 234   │ 12│ 78%       ││
│ │ marketing automation     │ 189   │ 8           │ 65%       ││
│ │ learners enrolled        │ 156   │ 45          │ 82%       ││
│ │ failed workflows         │ 134   │ 3           │ 91%       ││
│ │ revenue report│ 98    │ 5           │ 73%       ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Zero Result Queries (Need attention)                            │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Query                    │ Count │ Suggested Fix││
│ ├─────────────────────────────────────────────────────────────┤│
│ │ corse analytics          │ 23    │ Typo: "course analytics" ││
│ │ student list             │ 18    │ Alias: "learner list"    ││
│ │ payment settings         │ 12    │ Missing: Add to index    ││
│ │ bulk email│ 9     │ Feature: Not available││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Search Performance Over Time                                    │
│ [Line chart: Searches per day]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
10. Search Settings
Location
/settings/search or Settings > Platform > Search

┌─────────────────────────────────────────────────────────────────┐
│ Search Settings                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ General│
│                                                                 │
│ Enable search                                                   │
│ ☑ Global search│
│ ☑ Command palette                                               │
│ ☑ AI search│
│                                                                 │
│ Default search mode                                             │
│ ● Global search                                                 │
│ ○ Command palette                                               │
│ ○ AI search                                                     │
│                                                                 │
│ Search behavior│
│ ☑ Track search history                                          │
│ ☑ Show recent searches                                          │
│ ☑ Show suggested searches                                       │
│ ☑ Enable voice search                                           │
│                                                                 │
│ Results per page                                                │
│ [25▾]                                                          │
│                                                                 │
│─────────────────────────────────────────────────────────────   │
│                                                                 │
│ AI Search│
│                                                                 │
│ AI model                                                        │
│ [GPT-4 ▾]│
│                                                                 │
│ Conversation history│
│ ● Keep for session│
│ ○ Keep for 24 hours                                             │
│ ○ Keep for 7 days                                               │
│ ○ Keep forever                                                  │
│                                                                 │
│ AI suggestions                                                  │
│☑ Show proactive suggestions                                    │
│ ☑ Show follow-up questions│
│ ☑ Show actionable recommendations                               │
│                                                                 │
│ ─────────────────────────────────────────────────────────────   │
│                                                                 │
│ Privacy│
│                                                                 │
│ Search data retention│
│ ○ 30 days                                                       │
│ ● 90 days                                                       │
│ ○ 1 year                                                        │
│ ○ Forever                                                       │
│                                                                 │
│☐ Share search data with LuxGen to improve search quality      │
│                                                                 │
│ [Clear all search history]                                      │
│                                                 │
├─────────────────────────────────────────────────────────────────┤
│                [Cancel] [Save Changes]│
└─────────────────────────────────────────────────────────────────┘
11. Mobile Search Experience
Mobile Global Search
Compact Header (375px width): ┌─────────────────────────────────────┐ │ [☰] [🔍] LuxGen [🔔] [👤] │ └─────────────────────────────────────┘

Search Icon Tap → Full-screen search: ┌─────────────────────────────────────┐ │ [←] [Search............] [✕]│ ├─────────────────────────────────────┤ │ │ │ RECENT│ │ 🕐 marketing automation │ │ 🕐 course analytics │ │ │ │ SUGGESTED │ │ • Courses with low completion │ │ • Learners enrolled this week │ │ │ └─────────────────────────────────────┘

Search Results (Full-screen): ┌─────────────────────────────────────┐ │ [←] [marketing automation.] [✕] │ ├─────────────────────────────────────┤ │ │ │ Filters: [All▾] [Sort▾]│ │ │ │ 🎓 Marketing Automation │ │ Course • Published│ │ 234 enrolled • 89% completion │ │ [View →] │ │ │ │ ⚡ Marketing Email Workflow│ │ Automation • Live │ │ 1,234 runs • 98.5% success │ │ [View →] │ │ │ │ 📄 Marketing Guide │ │ Page • Published │ │ Last edited2 days ago │ │ [View →] │ │ │ └─────────────────────────────────────┘

Mobile Command Palette
Simplified (No left sidebar): ┌─────────────────────────────────────┐ │ [←] > [Type command......][✕] │ ├─────────────────────────────────────┤ │ │ │ SUGGESTED │ │ ⚡ Create course │ │ 📊 View analytics │ │ 👤 Go to learners│ │ │ │ RECENT │ │ ⚡ Create workflow │ │ 📧 Send email │ │ │ └─────────────────────────────────────┘

Mobile AI Search
Voice-first (Prominent mic button): ┌─────────────────────────────────────┐ │ [←]🤖 [Ask anything.....] 🎤 [✕] │ ├─────────────────────────────────────┤ │ │ │ You: Show me courses with low │ │ completion rates │ │ │ │ AI: I found 5 courses...│ │ │ │ 🎓 Intro to Python │ │ 42% completion │ │ [View] │ │ │ │ 🎓 Advanced JavaScript│ │ 38% completion │ │ [View] │ │ │ │ 💡 Create re-engagement │ │ workflow?│ │ [Create] │ │ │ │ [Suggested follow-ups] │ │ [Show metrics] [Find similar] │ │ │ └─────────────────────────────────────┘

12. Search Performance Optimization
Indexing Strategy
Real-time Indexing:

Index new content immediately on creation
Update index on edit (debounced 5 seconds)
Remove from index on delete
Indexed Fields:

Title (weight: 100)
Description (weight: 50)
Tags (weight: 30)
Category (weight: 20)
Content body (weight: 10)
Metadata (weight: 5)
Index Size: ~500MB for 100,000 items

Caching Strategy
Search Results Cache:

Cache query results for 5 minutes
Cache key: search:{query}:{filters}:{user_id}
Invalidate on content update
Autocomplete Cache:

Cache suggestions for 1 hour
Cache key: autocomplete:{prefix}
Pre-generate for common prefixes
Performance Targets
Search latency: <200ms (p95)
Autocomplete latency: <50ms (p95)
Index update latency: <1second
Throughput: 1000 searches/second
13. Search Accessibility
Keyboard Navigation
Global Search:

Cmd+K / Ctrl+K
Open search
Esc
Close search
↑ ↓
Navigate results
Enter
Open result
Cmd+Enter
Open in new tab
Tab
Switch between filters and results
/
Quick focus search
Command Palette:

Same as global search
> prefix for command mode
? prefix for AI search mode
Screen Reader Support:

All results have aria-labels
Live region announces result count
Keyboard focus visible (purple outline)
ARIA Labels
<div role="search" aria-label="Global search">
  <input
    type="search" 
    aria-label="Search anything"
    aria-describedby="search-help"
  />
  <div id="search-help" class="sr-only">
    Type to search across all content. Use filters to narrow results.
  </div>
</div>

<div role="listbox" aria-label="Search results">
  <div role="option" aria-label="Course: Marketing Automation, 234 enrolled">
    ...
  </div>
</div>

<div aria-live="polite" aria-atomic="true">
  Found 12 results for "marketing automation"
</div>
14. Search Error Handling
Network Error
┌─────────────────────────────────────┐
│ ⚠️ Search temporarily unavailable   │
│                                     │
│ We're having trouble connecting.    │
│ Please try again in a moment.       │
│                                     │
│ [Retry] [Report Issue]              │
└─────────────────────────────────────┘
Timeout Error
┌─────────────────────────────────────┐
│ ⚠️ Search is taking longer than     │
│    expected                         │
│                                     │
│ This might be due to heavy load.    │
│ Try simplifying your query.         │
│                                     │
│ [Retry] [Simplify Search]           │
└─────────────────────────────────────┘
Permission Error
┌─────────────────────────────────────┐
│ 🔒 Some results are hidden│
│                                     │
│ You don't have permission to view│
│ all results for this search.        │
│                                     │
│ Showing8 of 15 results             │
│                                     │
│ [Request Access]│
└─────────────────────────────────────┘
This comprehensive search architecture specification provides a complete blueprint for implementing a world-class search experience in LuxGen, with multiple search modalities, AI-powered intelligence, and enterprise-grade features like saved searches and advanced filtering