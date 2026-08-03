LuxGen Complete Sitemap
Visual Tree Structure
LuxGen Platform
│
├── 🏠 DASHBOARD
│   ├── Overview (Default landing)
│   ├── Quick Actions Widget
│   ├── Recent Activity Widget
│   ├── KPI Cards Widget
│   └── Shortcuts Widget
│
├── 📚 LEARNING
│   │
│   ├── Courses
│   │   ├── Course List(/learning/courses)
│   │   │   ├── [Filter Panel]
│   │   │   ├── [Sort Options]
│   │   │   └── [Bulk Actions Menu]
│   │   │
│   │   ├── Course Details (/learning/courses/:courseId)
│   │   │   ├── Overview Tab
│   │   │   ├── Curriculum Tab
│   │   │   ├── Students Tab
│   │   │   ├── Analytics Tab
│   │   │   ├── Settings Tab
│   │   │   ├── [Enroll Students Modal]
│   │   │   ├── [Preview Course Modal]
│   │   │   └── [Share Course Modal]
│   │   │
│   │   ├── Create Course (/learning/courses/new)
│   │   │   ├── Step 1: Basic Info
│   │   │   ├── Step 2: Curriculum Builder
│   │   │   ├── Step 3: Pricing & Access
│   │   │   ├── Step 4: Settings
│   │   │   ├── Step 5: Review & Publish
│   │   │   └── [Save Draft Modal]
│   │   │
│   │   └── Edit Course (/learning/courses/:courseId/edit)
│   │       └── [Same structure as Create]
│   │
│   ├── Lessons
│   │   ├── Lesson Editor (/learning/lessons/:lessonId/edit)
│   │   │   ├── Content Tab
│   │   │   ├── Resources Tab
│   │   │   ├── Quiz Tab
│   │   │   ├── Settings Tab
│   │   │   ├── [Rich Text Editor]
│   │   │   ├── [Video Upload Modal]
│   │   │├── [File Attachment Modal]
│   │   │   └── [AI Content Generator Modal]
│   │   │
│   │   └── Lesson Preview (/learning/lessons/:lessonId/preview)
│   │       └── [Learner View Simulation]
│   │
│   ├── Quizzes
│   │   ├── Quiz List (/learning/quizzes)
│   │├── Quiz Builder (/learning/quizzes/:quizId/edit)
│   │   │   ├── Questions Tab
│   │   │   ├── Settings Tab
│   │   │   ├── Results Tab
│   │   │   ├── [Add Question Modal]
│   │   │   ├── [Question Bank Modal]
│   │   │   └── [AI Question Generator Modal]
│   │   │
│   │   └── Quiz Results (/learning/quizzes/:quizId/results)
│   │       ├── [Individual Result Details Modal]
│   │       └── [Export Results Modal]
│   │
│   ├── Certificates
│   │   ├── Certificate List (/learning/certificates)
│   │   ├── Certificate Designer (/learning/certificates/:certId/edit)
│   │   │   ├── Design Tab
│   │   │   ├── Fields Tab
│   │   │   ├── Preview Tab
│   │   │   ├── [Template Gallery Modal]
│   │   │   └── [Variable Picker Modal]
│   │   │
│   │   └── Issued Certificates (/learning/certificates/issued)
│   │       ├── [Certificate Details Modal]
│   │       ├── [Revoke Certificate Modal]
│   │       └── [Bulk Issue Modal]
│   │
│   ├── Learning Paths
│   │   ├── Path List (/learning/paths)
│   │   ├── Path Builder (/learning/paths/:pathId/edit)
│   │   │   ├── Courses Tab
│   │   │   ├── Prerequisites Tab
│   │   │   ├── Settings Tab
│   │   │   └── [Add Course Modal]
│   │   │
│   │   └── Path Analytics (/learning/paths/:pathId/analytics)
│   │
│   ├── Assignments
│   │   ├── Assignment List (/learning/assignments)
│   │   ├── Create Assignment (/learning/assignments/new)
│   │   │   ├── [Assignment Type Selector]
│   │   │   ├── [Due Date Picker]
│   │   │   └── [Rubric Builder]
│   │   │
│   │   └── Grade Assignments (/learning/assignments/:assignmentId/grade)
│   │       ├── [Submission Details Modal]
│   │       ├── [Feedback Editor]
│   │       └── [Bulk Grading Modal]
│   │
│   └── Categories
│       ├── Category List (/learning/categories)
│       ├── [Create Category Modal]
│       ├── [Edit Category Modal]
│       └── [Delete Category Confirmation]
│
├── 🛒 COMMERCE
│   │
│   ├── Products
│   │   ├── Product List (/commerce/products)
│   │   │   ├── [Filter Panel]
│   │   │   ├── [Bulk Edit Modal]
│   │   │   └── [Import Products Modal]
│   │   │
│   │   ├── Product Details (/commerce/products/:productId)
│   │   │   ├── Overview Tab
│   │   │   ├── Pricing Tab
│   │   │   ├── Inventory Tab
│   │   │   ├── Analytics Tab
│   │   │   └── [Product Preview Modal]
│   │   │
│   │   └── Create/Edit Product (/commerce/products/:productId/edit)
│   │       ├── Basic Info
│   │       ├── Pricing & Plans
│   │       ├── Access Rules
│   │       ├── Upsells & Cross-sells
│   │       └── [Pricing Calculator]
│   │
│   ├── Orders
│   │   ├── Order List (/commerce/orders)
│   │   │   ├── [Filter by Status]
│   │   │   ├── [Date Range Picker]
│   │   │   └── [Export Orders Modal]
│   │   │
│   │   ├── Order Details (/commerce/orders/:orderId)
│   │   │   ├── Order Info
│   │   │   ├── Customer Info
│   │   │   ├── Payment Info
│   │   │   ├── Fulfillment Status
│   │   │   ├── [Refund Order Modal]
│   │   │├── [Resend Receipt Modal]
│   │   │   └── [Add Note Modal]
│   │   │
│   │   └── Abandoned Carts (/commerce/orders/abandoned)
│   │       ├── [Cart Details Modal]
│   │       └── [Send Recovery Email Modal]
│   │
│   ├── Coupons
│   │   ├── Coupon List (/commerce/coupons)
│   │   ├── Create Coupon (/commerce/coupons/new)
│   │   │   ├── Discount Type
│   │   │   ├── Conditions
│   │   │   ├── Usage Limits
│   │   │   ├── Validity Period
│   │   │   └── [Preview Coupon]
│   │   │
│   │   └── Coupon Analytics (/commerce/coupons/:couponId/analytics)
│   │
│   ├── Subscriptions
│   │   ├── Subscription List (/commerce/subscriptions)
│   │   │   ├── [Filter by Status]
│   │   │   └── [Bulk Actions Menu]
│   │   │
│   │   ├── Subscription Details (/commerce/subscriptions/:subId)
│   │   │   ├── Overview
│   │   │   ├── Payment History
│   │   │   ├── Usage
│   │   │   ├── [Cancel Subscription Modal]
│   │   │   ├── [Change Plan Modal]
│   │   │   └── [Update Payment Method Modal]
│   │   │
│   │   └── Subscription Plans (/commerce/subscriptions/plans)
│   │       ├── Plan List
│   │       ├── [Create Plan Modal]
│   │       └── [Edit Plan Modal]
│   │
│   ├── Payments
│   │   ├── Payment List (/commerce/payments)
│   │   ├── Payment Details (/commerce/payments/:paymentId)
│   │   │   ├── [Refund Payment Modal]
│   │   │   └── [Payment Receipt Modal]
│   │   │
│   │   └── Payment Settings (/commerce/payments/settings)
│   │       ├── Gateway Configuration
│   │       ├── Currency Settings
│   │       ├── Tax Settings
│   │       └── [Connect Stripe Modal]
│   │
│   ├── Invoices
│   │   ├── Invoice List (/commerce/invoices)
│   │   ├── Invoice Details (/commerce/invoices/:invoiceId)
│   │   │   ├── [Send Invoice Modal]
│   │   │   ├── [Mark as Paid Modal]
│   │   │   └── [Download PDF]
│   │   │
│   │   └── Create Invoice (/commerce/invoices/new)
│   │       ├── Customer Selection
│   │       ├── Line Items
│   │       ├── Payment Terms
│   │       └── [Preview Invoice]
│   │
│   └── Affiliates
│       ├── Affiliate List (/commerce/affiliates)
│       ├── Affiliate Details (/commerce/affiliates/:affiliateId)
│       │   ├── Performance Tab
│       │   ├── Commissions Tab
│       │   ├── Payouts Tab
│       │   └── [Approve Affiliate Modal]
│       │
│       └── Affiliate Settings (/commerce/affiliates/settings)
│           ├── Commission Rules
│           ├── Payout Schedule
│           └── [Cookie Duration Settings]
│
├── ⚡ AUTOMATION
│   │
│   ├── Workflows
│   │   ├── Workflow List (/automation/workflows)
│   │   │   ├── [Filter by Status]
│   │   │   ├── [Filter by Trigger Type]
│   │   │   └── [Template Gallery Modal]
│   │   │
│   │   ├── Workflow Builder (/automation/workflows/:workflowId/edit)
│   │   │   ├── Canvas Area
│   │   │   ├── Element Sidebar
│   │   │   ├── Config Panel
│   │   │   ├── [Test Workflow Drawer]
│   │   │   ├── [Workflow Settings Modal]
│   │   │├── [Save as Template Modal]
│   │   │   └── [Publish Confirmation Modal]
│   │   │
│   │   ├── Workflow Analytics (/automation/workflows/:workflowId/analytics)
│   │   │   ├── Performance Metrics
│   │   │   ├── Run Volume Chart
│   │   │   ├── Success Rate Trend
│   │   │   └── Step Performance
│   │   │
│   │   ├── Workflow Runs (/automation/workflows/:workflowId/runs)
│   │   │   ├── Run List
│   │   │   ├── [Run Details Modal]
│   │   │   ├── [Retry Run Modal]
│   │   │   └── [Export Runs]
│   │   │
│   │   └── Workflow Versions (/automation/workflows/:workflowId/versions)
│   │       ├── Version History
│   │       ├── [Version Diff Viewer]
│   │       └── [Restore Version Modal]
│   │
│   ├── Templates
│   │   ├── Email Templates (/automation/templates/email)
│   │   │   ├── Template List
│   │   │   ├── Template Editor (/automation/templates/email/:templateId/edit)
│   │   │   │   ├── Design Tab
│   │   │   │   ├── Content Tab
│   │   │   │   ├── Variables Tab
│   │   │   │   ├── Preview Tab
│   │   │   │   ├── [Rich Email Editor]
│   │   │   │   ├── [Variable Picker]
│   │   │   │   └── [Send Test Email Modal]
│   │   │   │
│   │   │   └── [Import Template Modal]
│   │   │
│   │   ├── SMS Templates (/automation/templates/sms)
│   │   │   ├── Template List
│   │   │   └── [Create/Edit SMS Template Modal]
│   │   │
│   │   └── Notification Templates (/automation/templates/notifications)
│   │       ├── Template List
│   │       └── [Create/Edit Notification Template Modal]
│   │
│   ├── Triggers
│   │   ├── Trigger List (/automation/triggers)
│   │   ├── Create Trigger (/automation/triggers/new)
│   │   │   ├── Trigger Type Selection
│   │   │   ├── Condition Builder
│   │   │   ├── Filter Configuration
│   │   │   └── [Test Trigger Modal]
│   │   │
│   │   └── Webhook Triggers (/automation/triggers/webhooks)
│   │       ├── Webhook List
│   │       ├── [Create Webhook Modal]
│   │       └── [Webhook Logs Modal]
│   │
│   ├── Schedules
│   │   ├── Schedule List (/automation/schedules)
│   │   ├── Create Schedule (/automation/schedules/new)
│   │   │   ├── [Cron Expression Builder]
│   │   │   ├── [Timezone Selector]
│   │   │   └── [Preview Next Runs]
│   │   │
│   │   └── Schedule History (/automation/schedules/:scheduleId/history)
│   │
│   └── Logs
│       ├── Execution Logs (/automation/logs)
│       │   ├── [Filter by Status]
│       │   ├── [Filter by Date]
│       │   ├── [Search Logs]
│       │   └── [Log Details Modal]
│       │
│       └── Error Logs (/automation/logs/errors)
│           ├── Error List
│           ├── [Error Details Modal]
│           └── [Mark as Resolved Modal]
│
├──🤖 AI (ARTIFICIAL INTELLIGENCE)
│   │
│   ├── Agents
│   │   ├── Agent Studio (/ai/agents)
│   │   │   ├── Agent List
│   │   │   ├── [Agent Type Gallery]
│   │   │   └── [Create Agent Modal]
│   │   │
│   │   ├── Agent Builder (/ai/agents/:agentId/edit)
│   │   │   ├── Configuration Tab
│   │   │   ├── Training Tab
│   │   │   ├── Prompts Tab
│   │   │├── Testing Tab
│   │   │   ├── [Prompt Editor]
│   │   │   ├── [Training Data Upload Modal]
│   │   │   └── [Test Agent Drawer]
│   │   │
│   │   ├── Agent Analytics (/ai/agents/:agentId/analytics)
│   │   │   ├── Usage Metrics
│   │   │   ├── Performance Stats
│   │   │   ├── Cost Analysis
│   │   │   └── [Export Report]
│   │   │
│   │   └── Agent Versions (/ai/agents/:agentId/versions)
│   │       ├── Version History
│   │       └── [Restore Version Modal]
│   │
│   ├── Copilot
│   │   ├── Copilot Chat (/ai/copilot)
│   │   │   ├── Chat Interface
│   │   │   ├── Conversation History
│   │   │├── [New Conversation]
│   │   │   └── [Export Chat Modal]
│   │   │
│   │   └── Copilot Settings (/ai/copilot/settings)
│   │       ├── Personality Configuration
│   │       ├── Knowledge Base
│   │       └── [Upload Documents Modal]
│   │
│   ├── Content Generation
│   │   ├── Generator Dashboard (/ai/generate)
│   │   ├── Course Generator (/ai/generate/course)
│   │   │   ├── Input Form
│   │   │   ├── Generation Progress
│   │   │   ├── Review & Edit
│   │   │   └── [Save as Course]
│   │   │
│   │   ├── Lesson Generator (/ai/generate/lesson)
│   │   ├── Quiz Generator (/ai/generate/quiz)
│   │├── Email Generator (/ai/generate/email)
│   │   └── Description Generator (/ai/generate/description)
│   │
│   ├── Recommendations
│   │   ├── Recommendation Engine (/ai/recommendations)
│   │   │   ├── Rules Configuration
│   │   │   ├── Algorithm Settings
│   │   │   └── [Preview Recommendations]
│   │   │
│   │   └── Recommendation Analytics (/ai/recommendations/analytics)
│   │       ├── Click-through Rate
│   │       ├── Conversion Rate
│   │       └── [A/B Test Results]
│   │
│   ├── Sentiment Analysis
│   │   ├── Analysis Dashboard (/ai/sentiment)
│   │   ├── [Analyze Text Modal]
│   │   └── [Sentiment Report Export]
│   │
│   └── AI Settings
│       ├── Model Configuration(/ai/settings/models)
│       ├── Credit Management(/ai/settings/credits)
│       │   ├── Usage Overview
│       │   ├── [Purchase Credits Modal]
│       │   └── [Usage Alerts Settings]
│       │
│       └── API Keys (/ai/settings/api-keys)
│           ├── Key List
│           ├── [Generate Key Modal]
│           └── [Revoke Key Confirmation]
│
├── 📊 ANALYTICS
│   │
│   ├── Dashboard
│   │   ├── Analytics Overview (/analytics)
│   │   ├── [Date Range Picker]
│   │├── [Comparison Mode Toggle]
│   │   └── [Export Dashboard Modal]
│   │
│   ├── Learning Analytics
│   │   ├── Course Analytics (/analytics/learning/courses)
│   │   │   ├── Enrollment Trends
│   │   │   ├── Completion Rates
│   │   │   ├── Engagement Metrics
│   │   │   └── [Detailed Course Report Modal]
│   │   │
│   │   ├── Learner Analytics (/analytics/learning/learners)
│   │   │   ├── Learner Progress
│   │   │   ├── Time Spent
│   │   │   ├── Performance
│   │   │   └── [Individual Learner Report Modal]
│   │   │
│   │   ├── Instructor Analytics (/analytics/learning/instructors)
│   │   │   ├── Course Performance
│   │   │   ├── Student Satisfaction
│   │   │   └── Revenue Attribution
│   │   │
│   │   └── Content Analytics (/analytics/learning/content)
│   │       ├── Lesson Engagement
│   │       ├── Drop-off Points
│   │       └── [Content Heatmap]
│   │
│   ├── Commerce Analytics
│   │   ├── Revenue Dashboard (/analytics/commerce/revenue)
│   │   │   ├── Revenue Trends
│   │   │   ├── Product Performance
│   │   │   ├── Cohort Analysis
│   │   │   └── [Revenue Forecast]
│   │   │
│   │   ├── Conversion Funnel (/analytics/commerce/funnel)
│   │   │   ├── Funnel Visualization
│   │   │   ├── Drop-off Analysis
│   │   │   └── [Segment Comparison]
│   │   │
│   │   ├── Customer Analytics (/analytics/commerce/customers)
│   │   │   ├── Lifetime Value
│   │   │   ├── Retention Rate
│   │   │   ├── Churn Analysis
│   │   │   └── [Customer Segmentation]
│   │   │
│   │   └── Product Analytics (/analytics/commerce/products)
│   │       ├── Sales by Product
│   │       ├── Pricing Analysis
│   │       └── [Bundle Performance]
│   │
│   ├── Automation Analytics
│   │   ├── Workflow Performance (/analytics/automation/workflows)
│   │   │   ├── Execution Volume
│   │   │   ├── Success Rates
│   │   │   ├── Time Savings
│   │   │   └── [Workflow Comparison]
│   │   │
│   │   └── Email Performance (/analytics/automation/emails)
│   │       ├── Open Rates
│   │       ├── Click Rates
│   │       ├── Conversion Rates
│   │       └── [Email Heatmap]
│   │
│   ├── AI Analytics
│   │   ├── AI Usage(/analytics/ai/usage)
│   │   │   ├── API Calls
│   │   │   ├── Token Consumption
│   │   │   ├── Cost Analysis
│   │   │   └── [Credit Burn Rate]
│   │   │
│   │   └── AI Performance (/analytics/ai/performance)
│   │       ├── Response Times
│   │       ├── Accuracy Metrics
│   │       └── [Model Comparison]
│   │
│   ├── Custom Reports
│   │   ├── Report Builder (/analytics/reports/builder)
│   │   │   ├── Data Source Selection
│   │   │   ├── Metric Configuration
│   │   │   ├── Visualization Designer
│   │   │   └── [Save Report Modal]
│   │   │
│   │   ├── Report List (/analytics/reports)
│   │   │   ├── [Schedule Report Modal]
│   │   │   └── [Share Report Modal]
│   │   │
│   │   └── Report Viewer (/analytics/reports/:reportId)
│   │       ├── [Export Options]
│   │       └── [Subscribe to Report]
│   │
│   └── Exports
│       ├── Export History (/analytics/exports)
│├── [Schedule Export Modal]
│       └── [Export Format Selector]
│
├── 🏪 MARKETPLACE
│   │
│   ├── Browse
│   │   ├── Marketplace Home(/marketplace)
│   │   │   ├── Featured Items
│   │   │   ├── Categories
│   │   │   ├── [Search & Filters]
│   │   │   └── [Sort Options]
│   │   │
│   │   ├── Category View (/marketplace/category/:categoryId)
│   │   │   └── [Filter Panel]
│   │   │
│   │   └── Search Results (/marketplace/search)
│   │       ├── Results List
│   │       └── [Advanced Filters]
│   │
│   ├── Item Details
│   │   ├── Course Template (/marketplace/courses/:itemId)
│   │   ├── Workflow Template (/marketplace/workflows/:itemId)
│   │   ├── Email Template (/marketplace/templates/:itemId)
│   │   ├── AI Agent(/marketplace/agents/:itemId)
│   │   │   ├── Overview Tab
│   │   │   ├── Reviews Tab
│   │   │   ├── Documentation Tab
│   │   │   ├── [Preview Modal]
│   │   │├── [Install Modal]
│   │   │   └── [Purchase Modal]
│   │   │
│   │   └── Integration (/marketplace/integrations/:itemId)
│   │       ├── Overview
│   │       ├── Setup Guide
│   │       ├── [Connect Integration Modal]
│   │       └── [API Key Configuration]
│   │
│   ├── My Items
│   │   ├── Installed Items (/marketplace/installed)
│   │   │   ├── [Update Available Badge]
│   │   │   ├── [Uninstall Modal]
│   │   │   └── [Configure Item Modal]
│   │   │
│   │   └── Purchases (/marketplace/purchases)
│   │       ├── Purchase History
│   │       └── [Receipt Modal]
│   │
│   ├── Publish
│   │   ├── Seller Dashboard (/marketplace/seller)
│   │   │   ├── Revenue Overview
│   │   │   ├── Sales Analytics
│   │   │   └── [Payout Settings]
│   │   │
│   │   ├── My Listings (/marketplace/seller/listings)
│   │   │   ├── [Create Listing Modal]
│   │   │   └── [Edit Listing Modal]
│   │   │
│   │   └── Publish Item (/marketplace/seller/publish)
│   │       ├── Item Type Selection
│   │       ├── Item Details Form
│   │       ├── Pricing Configuration
│   │       ├── Documentation Upload
│   │       └── [Submit for Review]
│   │
│   └── Reviews
│       ├── Leave Review (/marketplace/reviews/new)
│       │   ├── [Rating Selector]
│       │   └── [Review Form]
│       │
│       └── Review Management (/marketplace/reviews/manage)
│           ├── [Reply to Review Modal]
│           └── [Report Review Modal]
│
├──👥 USERS
│   │
│   ├── Learners
│   │   ├── Learner List (/users/learners)
│   │   │   ├── [Filter Panel]
│   │   │   ├── [Bulk Actions Menu]
│   │   │   ├── [Import Learners Modal]
│   │   │   └── [Export Learners]
│   │   │
│   │   ├── Learner Profile (/users/learners/:learnerId)
│   │   │   ├── Overview Tab
│   │   │   ├── Courses Tab
│   │   │   ├── Progress Tab
│   │   │   ├── Purchases Tab
│   │   │   ├── Activity Tab
│   │   │   ├── Notes Tab
│   │   │   ├── [Edit Profile Modal]
│   │   │   ├── [Enroll in Course Modal]
│   │   │├── [Send Message Modal]
│   │   │├── [Add Note Modal]
│   │   │   └── [Impersonate User Modal]
│   │   │
│   │   └── Create Learner (/users/learners/new)
│   │       ├── Basic Info
│   │       ├── Account Settings
│   │       ├── [Send Welcome Email Toggle]
│   │       └── [Assign to Group]
│   │
│   ├── Instructors
│   │   ├── Instructor List (/users/instructors)
│   │   │   ├── [Filter by Status]
│   │   │   └── [Invite Instructor Modal]
│   │   │
│   │   ├── Instructor Profile (/users/instructors/:instructorId)
│   │   │   ├── Overview Tab
│   │   │   ├── Courses Tab
│   │   │   ├── Students Tab
│   │   │   ├── Revenue Tab
│   │   │   ├── Reviews Tab
│   │   │   ├── [Edit Profile Modal]
│   │   │   └── [Payout Settings Modal]
│   │   │
│   │   └── Instructor Application (/users/instructors/apply)
│   │       ├── Application Form
│   │       ├── [Upload Documents]
│   │       └── [Submit Application]
│   │
│   ├── Admins
│   │   ├── Admin List (/users/admins)
│   │   │   ├── [Invite Admin Modal]
│   │   │   └── [Role Assignment]
│   │   │
│   │   └── Admin Profile (/users/admins/:adminId)
│   │       ├── Overview Tab
│   │       ├── Permissions Tab
│   │       ├── Activity Log Tab
│   │       └── [Edit Permissions Modal]
│   │
│   ├── Teams
│   │   ├── Team List (/users/teams)
│   │   │   ├── [Create Team Modal]
│   │   │   └── [Team Hierarchy View]
│   │   │
│   │   ├── Team Details (/users/teams/:teamId)
│   │   │   ├── Members Tab
│   │   │   ├── Courses Tab
│   │   │   ├── Analytics Tab
│   │   │   ├── [Add Member Modal]
│   │   │   ├── [Assign Course Modal]
│   │   │   └── [Team Settings Modal]
│   │   │
│   │   └── Team Hierarchy (/users/teams/hierarchy)
│   │       ├── Org Chart View
│   │       └── [Restructure Team Modal]
│   │
│   ├── Groups
│   │   ├── Group List (/users/groups)
│   │   │   ├── [Create Group Modal]
│   │   │   └── [Smart Group Builder]
│   │   │
│   │   ├── Group Details (/users/groups/:groupId)
│   │   │   ├── Members Tab
│   │   │   ├── Rules Tab
│   │   │   ├── [Add Members Modal]
│   │   │   └── [Edit Rules Modal]
│   │   │
│   │   └── Smart Groups (/users/groups/smart)
│   │       ├── Rule Builder
│   │       └── [Preview Members]
│   │
│   ├── Roles & Permissions
│   │   ├── Role List (/users/roles)
│   │   │   ├── [Create Role Modal]
│   │   │   └── [Clone Role Modal]
│   │   │
│   │   └── Role Editor (/users/roles/:roleId/edit)
│   │       ├── Permissions Matrix
│   │       ├── [Assign to Users]
│   │       └── [Permission Preview]
│   │
│   └── User Settings
│       ├── Profile Settings (/users/settings/profile)
│       ├── Security Settings (/users/settings/security)
│       │   ├── Password Change
│       │   ├── Two-Factor Auth
│       │   ├── [Enable2FA Modal]
│       │   └── [Backup Codes Modal]
│       │
│       ├── Notification Preferences (/users/settings/notifications)
│       │   ├── Email Notifications
│       │   ├── Push Notifications
│       │   └── SMS Notifications
│       │
│       └── Privacy Settings (/users/settings/privacy)
│           ├── Data Sharing
│           ├── [Download My Data]
│           └── [Delete Account Modal]
│
├── ⚙️ SETTINGS
│   │
│   ├── Organization
│   │   ├── General Settings (/settings/organization)
│   │   │   ├── Organization Info
│   │   │   ├── Branding
│   │   │   ├── [Upload Logo Modal]
│   │   │   └── [Color Picker]
│   │   │
│   │   ├── Billing(/settings/billing)
│   │   │   ├── Current Plan
│   │   │   ├── Usage Overview
│   │   │   ├── Payment Method
│   │   │   ├── Invoices
│   │   │   ├── [Upgrade Plan Modal]
│   │   │   ├── [Add Payment Method Modal]
│   │   │   ├── [Cancel Subscription Modal]
│   │   │   └── [Download Invoice]
│   │   │
│   │   ├── Domains (/settings/domains)
│   │   │   ├── Domain List
│   │   │   ├── [Add Domain Modal]
│   │   │   ├── [Verify Domain Modal]
│   │   │   └── [SSL Settings]
│   │   │
│   │   └── Legal (/settings/legal)
│   │       ├── Terms of Service
│   │       ├── Privacy Policy
│   │       ├── [Edit Terms Modal]
│   │       └── [GDPR Settings]
│   │
│   ├── Platform
│   │   ├── General(/settings/platform/general)
│   │   │   ├── Site Name
│   │   │   ├── Default Language
│   │   │   ├── Timezone
│   │   │   └── [Regional Settings]
│   │   │
│   │   ├── Appearance (/settings/platform/appearance)
│   │   │   ├── Theme Selection
│   │   │   ├── Custom CSS
│   │   │   ├── [Theme Customizer]
│   │   │   └── [Preview Theme Modal]
│   │   │
│   │   ├── Email(/settings/platform/email)
│   │   │   ├── SMTP Configuration
│   │   │   ├── Sender Settings
│   │   │   ├── [Test Email Modal]
│   │   │   └── [Email Logs]
│   │   │
│   │   ├── Storage (/settings/platform/storage)
│   │   │   ├── Storage Provider
│   │   │   ├── Usage Overview
│   │   │   ├── [Connect S3 Modal]
│   │   │   └── [CDN Settings]
│   │   │
│   │   └── Security (/settings/platform/security)
│   │       ├── SSL Configuration
│   │       ├── IP Whitelist
│   │       ├── [Add IP Modal]
│   │       └── [Security Audit Log]
│   │
│   ├── Learning
│   │   ├── Course Settings (/settings/learning/courses)
│   │   │   ├── Default Course Settings
│   │   │   ├── Enrollment Rules
│   │   │   └── [Certificate Templates]
│   │   │
│   │   ├── Gamification (/settings/learning/gamification)
│   │   │   ├── Points System
│   │   │   ├── Badges
│   │   │   ├── Leaderboards
│   │   │   ├── [Create Badge Modal]
│   │   │   └── [Points Rules Editor]
│   │   │
│   │   └── Progress Tracking (/settings/learning/progress)
│   │       ├── Completion Criteria
│   │       ├── Quiz Settings
│   │       └── [Reset Progress Rules]
│   │
│   ├── Commerce
│   │   ├── Store Settings (/settings/commerce/store)
│   │   │   ├── Currency
│   │   │   ├── Tax Configuration
│   │   │   └── [Tax Rate Calculator]
│   │   │
│   │   ├── Checkout (/settings/commerce/checkout)
│   │   │   ├── Checkout Fields
│   │   │   ├── Payment Gateways
│   │   │   ├── [Customize Checkout Modal]
│   │   │   └── [Test Payment Modal]
│   │   │
│   │   └── Shipping (/settings/commerce/shipping)
│   │       ├── Shipping Zones
│   │       ├── Shipping Rates
│   │       ├── [Add Zone Modal]
│   │       └── [Add Rate Modal]
│   │
│   ├── Integrations
│   │   ├── Integration List (/settings/integrations)
│   │   │   ├── Available Integrations
│   │   │   ├── Installed Integrations
│   │   │   └── [Browse Marketplace]
│   │   │
│   │   ├── API Keys (/settings/integrations/api-keys)
│   │   │   ├── Key List
│   │   │   ├── [Generate Key Modal]
│   │   │   ├── [Revoke Key Modal]
│   │   │   └── [API Documentation Link]
│   │   │
│   │   ├── Webhooks (/settings/integrations/webhooks)
│   │   │   ├── Webhook List
│   │   │   ├── [Create Webhook Modal]
│   │   │   └── [Webhook Logs]
│   │   │
│   │   └── OAuth Apps (/settings/integrations/oauth)
│   │       ├── App List
│   │       ├── [Create OAuth App Modal]
│   │       └── [Manage Scopes]
│   │
│   ├── Notifications
│   │   ├── Email Notifications (/settings/notifications/email)
│   │   │   ├── System Emails
│   │   │   ├── [Edit Email Template]
│   │   │   └── [Preview Email]
│   │   │
│   │   ├── Push Notifications (/settings/notifications/push)
│   │   │   ├── Push Configuration
│   │   │   └── [Test Push Modal]
│   │   │
│   │   └── SMS Notifications (/settings/notifications/sms)
│   │       ├── SMS Provider
│   │       ├── [Connect Twilio Modal]
│   │       └── [Test SMS Modal]
│   │
│   ├── Advanced
│   │   ├── Custom Code(/settings/advanced/code)
│   │   │   ├── Custom JavaScript
│   │   │   ├── Custom CSS
│   │   │   └── [Code Editor]
│   │   │
│   │   ├── Database (/settings/advanced/database)
│   │   │   ├── Backup Settings
│   │   │   ├── [Create Backup Modal]
│   │   │   └── [Restore Backup Modal]
│   │   │
│   │   ├── Import/Export (/settings/advanced/import-export)
│   │   │   ├── [Import Data Modal]
│   │   │├── [Export Data Modal]
│   │   │   └── [Migration Tools]
│   │   │
│   │   └── Developer Tools (/settings/advanced/developer)
│   │       ├── GraphQL Playground
│   │       ├── API Logs
│   │       └── [Webhook Tester]
│   │
│   └── Audit Log
│       └── Activity Log (/settings/audit-log)
│           ├── [Filter by User]
│           ├── [Filter by Action]
│           ├── [Date Range Picker]
│           └── [Export Log]
│
├── 📄 CONTENT
│   │
│   ├── Pages
│   │   ├── Page List (/content/pages)
│   │   │   └── [Create Page Modal]
│   │   │
│   │   └── Page Editor (/content/pages/:pageId/edit)
│   │       ├── [Visual Page Builder]
│   │       ├── [SEO Settings Panel]
│   │       └── [Preview Mode]
│   │
│   ├── Blog
│   │   ├── Post List (/content/blog)
│   │   │   ├── [Filter by Status]
│   │   │   └── [Create Post Modal]
│   │   │
│   │   ├── Post Editor (/content/blog/:postId/edit)
│   │   │   ├── [Rich Text Editor]
│   │   │   ├── [Featured Image Upload]
│   │   │   ├── [SEO Panel]
│   │   │   └── [Schedule Post Modal]
│   │   │
│   │   └── Categories (/content/blog/categories)
│   │       ├── [Create Category Modal]
│   │       └── [Edit Category Modal]
│   │
│   ├── Media Library
│   │   ├── Media Grid (/content/media)
│   │   │   ├── [Upload Files Modal]
│   │   │├── [Bulk Actions]
│   │   │   └── [Folder Organization]
│   │   │
│   │   └── Media Details (/content/media/:mediaId)
│   │       ├── [Edit Metadata Modal]
│   │       ├── [Replace File Modal]
│   │       └── [Usage Report]
│   │
│   ├── Menus
│   │   ├── Menu List (/content/menus)
│   │   │   └── [Create Menu Modal]
│   │   │
│   │   └── Menu Editor (/content/menus/:menuId/edit)
│   │       ├── [Drag-and-Drop Builder]
│   │       ├── [Add Menu Item Modal]
│   │       └── [Menu Preview]
│   │
│   └── Forms
│       ├── Form List (/content/forms)
│       │   └── [Create Form Modal]
│       │
│├── Form Builder (/content/forms/:formId/edit)
│       │   ├── [Field Palette]
│       │   ├── [Conditional Logic Builder]
│       │   └── [Form Settings]
│       │
│       └── Form Submissions (/content/forms/:formId/submissions)
│           ├── Submission List
│           ├── [Submission Details Modal]
│           └── [Export Submissions]
│
├──💬 COMMUNICATION
│   │
│   ├── Messages
│   │   ├── Inbox (/communication/messages)
│   │   │   ├── [Compose Message Modal]
│   │   │   ├── [Filter by Status]
│   │   │   └── [Search Messages]
│   │   │
│   │   ├── Message Thread (/communication/messages/:threadId)
│   │   │   ├── [Reply Editor]
│   │   │   ├── [Attach File Modal]
│   │   │   └── [Archive Thread]
│   │   │
│   │   └── Compose(/communication/messages/compose)
│   │       ├── Recipient Selection
│   │       ├── [Rich Text Editor]
│   │       └── [Schedule Send Modal]
│   │
│   ├── Announcements
│   │   ├── Announcement List (/communication/announcements)
│   │   │   └── [Create Announcement Modal]
│   │   │
│   │   └── Create Announcement (/communication/announcements/new)
│   │       ├── Content Editor
│   │       ├── Target Audience
│   │       ├── [Schedule Modal]
│   │       └── [Preview Announcement]
│   │
│   ├── Forums
│   │   ├── Forum List (/communication/forums)
│   │   │   └── [Create Forum Modal]
│   │   │
│   │├── Forum View (/communication/forums/:forumId)
│   │   │   ├── Thread List
│   │   │   ├── [Create Thread Modal]
│   │   │   └── [Forum Settings]
│   │   │
│   │   └── Thread View (/communication/forums/:forumId/threads/:threadId)
│   │       ├── Post List
│   │       ├── [Reply Editor]
│   │       ├── [Report Post Modal]
│   │       └── [Lock Thread Modal]
│   │
│   ├── Comments
│   │   ├── Comment Moderation (/communication/comments)
│   │   │   ├── [Filter by Status]
│   │   │   ├── [Bulk Approve]
│   │   │   └── [Bulk Delete]
│   │   │
│   │   └── Comment Details (/communication/comments/:commentId)
│   │       ├── [Approve Modal]
│   │       ├── [Reject Modal]
│   │       └── [Ban User Modal]
│   │
│   └── Live Chat
│       ├── Chat Dashboard(/communication/chat)
│       │   ├── Active Chats
│       │   ├── Queue
│       │   └── [Chat Settings]
│       │
│       └── Chat Window (/communication/chat/:chatId)
│           ├── Message History
│           ├── [Send Message]
│           ├── [Transfer Chat Modal]
│           └── [End Chat Modal]
│
├──📞 SUPPORT
│   │
│   ├── Tickets
│   │   ├── Ticket List (/support/tickets)
│   │   │├── [Filter by Status]
│   │   │   ├── [Filter by Priority]
│   │   │   └── [Create Ticket Modal]
│   │   │
│   │   ├── Ticket Details (/support/tickets/:ticketId)
│   │   │   ├── Ticket Info
│   │   │   ├── Conversation Thread
│   │   │   ├── [Reply Editor]
│   │   │   ├── [Change Status Modal]
│   │   │   ├── [Assign Agent Modal]
│   │   │├── [Add Internal Note Modal]
│   │   │   └── [Merge Tickets Modal]
│   │   │
│   │   └── Create Ticket (/support/tickets/new)
│   │       ├── Ticket Form
│   │       ├── [Attach Files]
│   │       └── [Suggested Articles]
│   │
│   ├── Knowledge Base
│   │   ├── Article List (/support/kb)
│   │   │   ├── [Search Articles]
│   │   │   └── [Create Article Modal]
│   │   │
│   │   ├── Article Editor (/support/kb/:articleId/edit)
│   │   │   ├── [Rich Text Editor]
│   │   │   ├── [SEO Settings]
│   │   │   └── [Related Articles]
│   │   │
│   │   └── Categories (/support/kb/categories)
│   │       ├── [Create Category Modal]
│   │       └── [Organize Categories]
│   │
│   ├── FAQs
│   │   ├── FAQ List (/support/faqs)
│   │   │   └── [Create FAQ Modal]
│   │   │
│   │   └── FAQ Editor (/support/faqs/:faqId/edit)
│   │       ├── Question & Answer
│   │       └── [Category Assignment]
│   │
│   └── Support Settings
│       ├── Business Hours (/support/settings/hours)
│       ├── SLA Configuration(/support/settings/sla)
│       │└── [Create SLA Rule Modal]
│       │
│       └── Canned Responses (/support/settings/responses)
│           ├── [Create Response Modal]
│           └── [Edit Response Modal]
│
├──🔔 NOTIFICATIONS
│   │
│   ├── Notification Center (/notifications)
│   │   ├── All Notifications
│   │   ├── Unread
│   │   ├── [Mark All as Read]
│   │   └── [Notification Settings]
│   │
│   └── Notification Details (/notifications/:notificationId)
│       ├── [Take Action]
│       └── [Dismiss]
│
├── 🔍 SEARCH
│   │
│   ├── Global Search (/search)
│   │   ├── All Results
│   │   ├── [Filter by Type]
│   │   └── [Advanced Search]
│   │
│   └── Search Results (/search/results)
│       ├── Results List
│       └── [Refine Search Panel]
│
├── 📱 MOBILE APP
│   │
│   ├── Mobile Dashboard
│   ├── Mobile Course Player
│   ├── Mobile Quiz Interface
│   ├── Mobile Profile
│   └── Mobile Settings
│
├──🔐 AUTHENTICATION
│   │
│   ├── Login (/login)
│   │   ├── Email/Password Form
│   │   ├── [Forgot Password Link]
│   │   ├── [SSO Options]
│   │   └── [Sign Up Link]
│   │
│   ├── Sign Up (/signup)
│   │   ├── Registration Form
│   │   ├── [Email Verification]
│   │   └── [Terms Acceptance]
│   │
│   ├── Forgot Password (/forgot-password)
│   │   ├── Email Form
│   │   └── [Reset Link Sent]
│   │
│├── Reset Password (/reset-password/:token)
│   │   └── New Password Form
│   │
│   ├── Email Verification (/verify-email/:token)
│   │   └── [Verification Status]
│   │
│   ├── Two-Factor Auth (/2fa)
│   │   ├── Code Entry
│   │   └── [Backup Code Option]
│   │
│   └── SSO Callback (/auth/callback/:provider)
│       └── [Processing SSO]
│
└── ❌ ERROR PAGES
    │
    ├── 404 Not Found (/404)
    │   ├── [Search]
    │   └── [Go Home]
    │
    ├── 403 Forbidden (/403)
    │   └── [Request Access]
    │
    ├── 500 Server Error (/500)
    │   └── [Report Issue]
    │
    └── Maintenance Mode(/maintenance)
        └── [Status Updates]
Sitemap Statistics
Total Screen Count: 487screens
Breakdown by Domain:

Domain	Screens	Modals	Wizards	Details Pages	Settings Pages
Dashboard	1	0	0	0	0
Learning	42	18	2	8	4
Commerce	38	22	1	12	3
Automation	28	15	1	4	2
AI	24	12	0	3	4
Analytics	31	8	1	6	0
Marketplace	22	14	1	6	1
Users	34	18	2	8	4
Settings	52	28	0	0	52
Content	24	16	2	2	0
Communication	18	12	1	3	1
Support	16	10	0	2	3
Notifications	2	2	0	1	1
Search	2	1	0	0	0
Mobile App	5	0	0	0	1
Authentication	7	3	0	0	0
Error Pages	4	1	0	0	0
Navigation Hierarchy
Primary Navigation (Always Visible)
┌─────────────────────────────────────────────┐
│ 🏠 Dashboard                                │
│ 📚 Learning                                 │
│ 🛒 Commerce                                 │
│⚡ Automation                               │
│ 🤖 AI                                       │
│ 📊 Analytics                                │
│ 🏪 Marketplace                              │
│👥 Users                                    │
│ ⚙️ Settings                                 │
└─────────────────────────────────────────────┘
Secondary Navigation (Contextual)
Appears in top bar or as tabs within each domain

Key User Flows
Flow 1: Create & Publish Course
Dashboard→ Learning 
    → Courses 
      → Create Course (Wizard)
        → Step 1: Basic Info
        → Step 2: Curriculum Builder
        → Step 3: Pricing
        → Step 4: Settings→ Step 5: Review & Publish
          → Course Details (Published)
Flow 2: Set Up Automation
Dashboard 
  → Automation 
    → Workflows 
      → Create Workflow
        → Workflow Builder→ Add Trigger
          → Add Actions→ Configure Steps
          → Test Workflow
          → Publish→ Workflow Runs (Monitor)
Flow 3: Manage Learner
Dashboard 
  → Users 
    → Learners 
      → Learner Profile
        → Enroll in Course (Modal)
        → View Progress
        → Send Message (Modal)
        → Add Note (Modal)
Flow 4: Analyze Performance
Dashboard 
  → Analytics 
    → Learning Analytics
      → Course Analytics
        → Detailed Course Report (Modal)
        → Export Report
Flow 5: Configure AI Agent
Dashboard 
  → AI 
    → Agents 
      → Agent Studio
        → Create Agent (Modal)
          → Agent Builder
            → Configuration Tab
            → Training Tab
            → Testing Tab
            → Publish Agent
Modal Inventory (Total: 231Modals)
Most Common Modals:

Create/Edit Item (87 instances)
Confirmation Dialogs (42 instances)
Detail Views (38 instances)
Settings Panels (32 instances)
Preview/Test Modals (32 instances)
Modal Patterns:

Create Modal: Quick creation form
Edit Modal: Inline editing without page navigation
Confirmation Modal: Destructive action confirmation
Details Modal: Quick view of item details
Settings Modal: Configuration panel
Preview Modal: Preview before publish
Test Modal: Test functionality
Upload Modal: File/media upload
Share Modal: Sharing options
Export Modal: Export data options
Wizard Inventory (Total: 14 Wizards)
Create Course Wizard (5 steps)
Create Workflow Wizard (implicit, canvas-based)
Onboarding Wizard (first-time user setup)
Import Data Wizard (3 steps)
Publish Item to Marketplace Wizard (4 steps)
Create Learning Path Wizard (3 steps)
Create AI Agent Wizard (4 steps)
Custom Report Builder Wizard (3 steps)
Team Setup Wizard (3 steps)
Payment Gateway Setup Wizard (4 steps)
Email Template Builder Wizard (3 steps)
Form Builder Wizard (2 steps)
Integration Setup Wizard (varies by integration)
Instructor Application Wizard (3 steps)
Settings Pages Inventory (Total: 52)
Organization Settings (8 pages) Platform Settings (10 pages) Learning Settings (6 pages) Commerce Settings (8 pages) Integration Settings (6 pages) Notification Settings (4 pages) Advanced Settings (6 pages) User Settings (4 pages)

Details Pages Inventory (Total: 51)
Course Details
Lesson Details
Quiz Details
Product Details
Order Details
Subscription Details
Workflow Details
Agent Details
Learner Profile
Instructor Profile
Admin Profile
Team Details
Group Details
Ticket Details
Article Details
Report Details
Certificate Details
Assignment Details
Forum Thread Details
Message Thread Details
Invoice Details
Payment Details
Coupon Details
Affiliate Details
Integration Details
Media Details
Page Details
Post Details
Form Submission Details
Notification Details
Run Details (Workflow)
Version Details
Review Details
Comment Details
Chat Details
Menu Details
Category Details
Role Details
Webhook Details
Schedule Details
Export Details
Backup Details
Log Entry Details
Alert Details
Announcement Details
Badge Details
Achievement Details
Payout Details
Refund Details
Transaction Details
Analytics Report Details
This complete sitemap represents the entire LuxGen platform with every screen, modal, wizard, details page, and settings page mapped in a hierarchical tree structure. Each node represents a distinct UI state that would require wireframing and implementation.