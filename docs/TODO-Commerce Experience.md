LuxGen Commerce Experience - Complete Wireframe Specification
1. Commerce Overview
Purpose
The LuxGen Commerce module is a complete e-commerce platform for selling courses, subscriptions, bundles, and digital products. It handles the entire customer journey from product discovery to checkout, payment processing, order fulfillment, and revenue analytics.

Key Features
Product Management
Courses, bundles, subscriptions, one-time products
Flexible Pricing
One-time, recurring, tiered, usage-based
Smart Checkout
Optimized conversion, upsells, abandoned cart recovery
Payment Processing
Stripe, PayPal, multiple currencies
Order Management
Fulfillment, refunds, invoicing
Customer Insights
LTV, cohort analysis, segmentation
Revenue Analytics
Real-time dashboards, forecasting, reporting
2. Products
Product List Screen
Route: /commerce/products

┌─────────────────────────────────────────────────────────────────────────────┐
│ Commerce > Products                         [+ Create Product] [Import] [•••]│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊QUICK STATS                                                [Last 30 days]│
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────┤
│ Total│ Active       │ Total        │ Avg Price    │ Top Seller│
│ Products     │ Products     │ Revenue      │              │                  │
│ 47│ 42           │ $127,450     │ $89│ Pro Subscription │
│ ↑ 3new│ ↑ 2 new      │ ↑23%        │ → Same│ 234 sales│
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ [🔍 Search products...][All Types▾] [All Status ▾] [Sort: Best selling ▾]│
├─────────────────────────────────────────────────────────────────────────────┤
│                │
│ ☐📦 Pro Subscription Plan$99/mo[Edit] [•••]│
│    Subscription • Active • Recurring monthly                │
│    234 active subscribers • $23,166 MRR • 8% churn                          │
│    [View Analytics] [View Subscribers]│
│                                                                              │
│ ☐🎓 Marketing Automation Course$299      [Edit] [•••]│
│    Course • Active • One-time payment│
│    456 sales • $136,344 total revenue • 4.8★ (89reviews)                  │
│    [View Analytics] [View Customers]                                        │
│                                                                              │
│ ☐📚 Complete Course Bundle                           $499      [Edit] [•••]│
│    Bundle • Active • One-time payment                                       │
│    Includes: 5 courses • 89 sales • $44,411 revenue│
│    [View Bundle Contents] [View Analytics]                                  │
│                                                                              │
│ ☐🎓 Advanced JavaScript$199      [Edit] [•••]│
│    Course • Active • One-time payment                                       │
│    234 sales • $46,566 revenue • 4.6★ (45 reviews)                          │
│    [View Analytics] [View Customers]                                        │
│                                                                              │
│ ☐ 💼 Enterprise Plan                                  $499/mo   [Edit] [•••]│
│    Subscription • Active • Recurring monthly                                │
│    12 active subscribers • $5,988 MRR • Custom features                     │
│    [View Analytics] [View Subscribers]                                      │
│                                                                              │
│ ☐ 🎓 Data Science Fundamentals                        $249      [Edit] [•••]│
│    Course • Draft • One-time payment                                        │
│    Not yet published • 0 sales                                              │
│    [Publish] [Preview]                                                      │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Showing 1-6 of 47 products                      [←] [1] [2] [3] ... [8] [→]│
└─────────────────────────────────────────────────────────────────────────────┘
Product List Components
Header Actions
Create Product
Primary CTA (purple button)
Import
Bulk import from CSV
More Menu (•••):
Export products
Bulk edit
Archive selected
Product settings
Quick Stats Cards
Total Products
Count with trend
Active Products
Published and available
Total Revenue
Last 30 days with % change
Avg Price
Mean product price
Top Seller
Best performing product
Filters & Search
Search
Real-time search by name, SKU, description
Type Filter:
All types
Courses
Subscriptions
Bundles
Digital products
Status Filter:
All status
Active
Draft
Archived
Sort Options:
Best selling
Highest revenue
Newest
Name (A-Z)
Price (low-high)
Price (high-low)
Product Card Structure
☐ [Icon] [Product Name]    [Price][Edit] [•••]
   [Type] • [Status] • [Pricing Model]
   [Key Metrics Line]
   [Action Links]
Components:

Checkbox
Bulk selection
Icon
Product type (📦 subscription, 🎓 course, 📚 bundle)
Name
Product title (bold, 16px)
Price
Display price (right-aligned, bold)
Edit Button
Quick edit (secondary style)
More Menu (•••):
View details
Duplicate
Archive
Delete
View on store
Metadata Line:

Type • Status • Pricing model
Font: 12px, gray
Badges for status (green=active, gray=draft, orange=archived)
Metrics Line (varies by type):

Course: Sales count, revenue, rating
Subscription: Active subscribers, MRR, churn rate
Bundle: Included items, sales, revenue
Action Links:

View Analytics
View Customers/Subscribers
View Bundle Contents (bundles only)
Publish (drafts only)
Create/Edit Product Screen
Route: /commerce/products/new or /commerce/products/:id/edit

┌─────────────────────────────────────────────────────────────────────────────┐
│← Products > Create Product                      [Preview] [Save Draft] [Publish]│
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────────────────────────────┐
│ STEPS│                                                  │
││                                                  │
│●1. Basic Info          │ BASIC INFORMATION                                │
│ ○ 2. Pricing             │                                  │
│ ○ 3. Content Access│ Product Name *│
│ ○ 4. Checkout Settings   │ [Marketing Automation Masterclass...............]│
│ ○ 5. Review              │                                                  │
│                          │ Short Description                │
│                          │ [Learn to automate your marketing with AI-powered]│
│                          │ [workflows and save20+ hours per week...........]│
│                          │ [................................................]│
│                          │160/200 characters                               │
│                          │                                                  │
│                          │ Full Description                                 │
│                          │ [Rich Text Editor                │
│                          │  - Formatting toolbar                            │
│                          │  - Insert images, videos         │
│                          │  - Embed content]                                │
│                          │                                                  │
│                          │ Product Type *                                   │
│                          │ ● Course                                         │
│                          │ ○ Subscription                │
│                          │ ○ Bundle                                         │
│                          │ ○ Digital Product                                │
│                          │                                                  │
│                          │ Category│
│                          │ [Marketing▾]                                    │
│                          │                                                  │
│                          │ Tags                                             │
│                          │ [automation] [marketing] [ai] [+ Add tag]        │
│                          │                                                  │
│                          │ Featured Image                                   │
│                          │ ┌────────────────────┐                           │
│                          │ │[Upload Image]    │                           │
│                          │ │  or drag & drop    │                           │
│                          │ │  1200x630px (PNG)  │                           │
│                          │ └────────────────────┘                           │
│                          │ Recommended: 1200x630px, max 2MB                 │
│                          │                                                  │
│                          │ Gallery Images (optional)                        │
│                          │ [+ Add images]                                   │
│                          │                                                  │
│                          │ Video Preview (optional)                         │
│                          │ [YouTube URL...................................]│
│                          │ or [Upload Video]                                │
│                          │                                                  │
│                          │[Cancel] [Next Step]│
└──────────────────────────┴──────────────────────────────────────────────────┘
Step2: Pricing
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ STEPS                    │                                                  │
│                          │                                                  │
│ ✓ 1. Basic Info          │ PRICING                          │
│ ● 2. Pricing             │                                                  │
│ ○ 3. Content Access      │ Pricing Model *                                │
│ ○ 4. Checkout Settings   │● One-time payment│
│ ○ 5. Review              │ ○ Recurring subscription                         │
│                          │ ○ Payment plan (installments)                    │
│                          │ ○ Free                           │
│                          │                                  │
│                          │ Price *                                          │
│                          │ $ [299.00]                                       │
│                          │                                                  │
│                          │ Compare at Price (optional)                      │
│                          │ $ [399.00]                                       │
│                          │ Show "Save $100" badge on product page│
│                          │                                                  │
│                          │ Currency                         │
│                          │ [USD ($)▾]                                      │
│                          │                                                  │
│                          │ ☑ Charge tax on this product│
│                          │   Tax rate: [10% ▾] (based on customer location) │
│                          │                                                  │
│                          │ ─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ PRICING TIERS (optional)                         │
│                          │ Offer different prices based on purchase quantity│
│                          │                                                  │
│                          │ ☐ Enable tiered pricing                          │
│                          │                                                  │
│                          │ ─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ COUPONS & DISCOUNTS                              │
│                          │                                                  │
│                          │ ☑ Allow coupons on this product                  │
│                          │ ☐ Exclude from site-wide sales                   │
│                          │                                                  │
│                          │ ─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ AFFILIATE COMMISSION                             │
│                          │                                  │
│                          │ ☑ Enable affiliate commissions                   │
│                          │   Commission rate: [20%] of sale price│
│                          │                                                  │
│                          │[← Back] [Cancel] [Next]│
└──────────────────────────┴──────────────────────────────────────────────────┘
Step 3: Content Access
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ STEPS                    │                                                  │
│                          │                                                  │
│ ✓ 1. Basic Info          │ CONTENT ACCESS                                   │
│ ✓ 2. Pricing             │                                                  │
│ ● 3. Content Access      │ What does the customer get access to?            │
│ ○ 4. Checkout Settings   │                                                  │
│ ○ 5. Review              │ ● Grant access to course│
│                          │   [Select course▾]                              │
│                          │   Selected: Marketing Automation Course│
│                          │                                                  │
│                          │ Access Duration│
│                          │ ● Lifetime access                                │
│                          │ ○ Limited time access│
│                          │   Duration: [___] [Days▾]                       │
│                          │                                                  │
│                          │ ☑ Send welcome email on purchase │
│                          │   Template: [Welcome to Course▾]                │
│                          │                                                  │
│                          │ ☑ Trigger automation workflow    │
│                          │   Workflow: [New Course Purchase ▾]              │
│                          │                                                  │
│                          │ ─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ ADDITIONAL CONTENT (optional)                    │
│                          │                                                  │
│                          │ Downloadable Files                               │
│                          │ [+ Add file]                                     │
│                          │                                                  │
│                          │ Bonus Resources                                  │
│                          │ ☐ Grant access to community forum               │
│                          │ ☐ Include1-on-1 coaching session│
│                          │ ☐ Add to exclusive Slack channel                 │
│                          │                                                  │
│                          │ ─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ CERTIFICATES│
│                          │                                                  │
│                          │ ☑ Issue certificate on course completion         │
│                          │   Template: [Course Completion Certificate ▾]    │
│                          │                                                  │
│                          │                [← Back] [Cancel] [Next]  │
└──────────────────────────┴──────────────────────────────────────────────────┘
Step 4: Checkout Settings
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ STEPS                    │                                                  │
│                          │                                                  │
│ ✓ 1. Basic Info          │ CHECKOUT SETTINGS│
│ ✓ 2. Pricing             │                                                  │
│ ✓ 3. Content Access      │ PURCHASE BUTTON│
│ ● 4. Checkout Settings   │                                                  │
│ ○ 5. Review              │ Button Text                      │
│                          │ [Buy Now]│
│                          │                                                  │
│                          │ Button Color                                     │
│                          │ [#7c3aed] 🎨│
│                          │                                                  │
│                          │─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ UPSELLS                          │
│                          │                                  │
│                          │ ☑ Offer upsell after purchase                    │
│                          │   Upsell product: [Advanced Course Bundle ▾]     │
│                          │   Discount: [20%] off                            │
│                          │   Headline: [Upgrade to the full bundle and save]│
│                          │                                                  │
│                          │ ☐ Offer order bump at checkout                   │
│                          │   Add-on: [_________________]                    │
│                          │                                                  │
│                          │ ─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ CHECKOUT FIELDS│
│                          │                                                  │
│                          │ Required fields:                                 │
│                          │ ☑ Email address                                  │
│                          │ ☑ Full name                                      │
│                          │ ☐ Phone number                                   │
│                          │ ☐ Company name                                   │
│                          │ ☐ Billing address                                │
│                          │                                                  │
│                          │ Custom fields:                                   │
│                          │ [+ Add custom field]                             │
│                          │                                                  │
│                          │ ─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ PAYMENT OPTIONS                                  │
│                          │                                                  │
│                          │ Accepted payment methods:                        │
│                          │ ☑ Credit/Debit Card (Stripe)                     │
│                          │ ☑ PayPal                                │
│                          │ ☐ Apple Pay                                      │
│                          │ ☐ Google Pay                                     │
│                          │ ☐ Bank Transfer (manual)                         │
│                          │                                                  │
│                          │        [← Back] [Cancel] [Next]  │
└──────────────────────────┴──────────────────────────────────────────────────┘
Step 5: Review & Publish
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ STEPS                    │                                                  │
│                          │                                                  │
│ ✓ 1. Basic Info          │ REVIEW & PUBLISH                                 │
│ ✓ 2. Pricing             │                                                  │
│ ✓ 3. Content Access      │ Review your product before publishing            │
│ ✓ 4. Checkout Settings   │                                                  │
│ ● 5. Review              │ ┌────────────────────────────────────────────────┐│
│                          │ │ PRODUCT PREVIEW││
│                          │ │││
│                          │ │ [Product Image]││
│                          │ │                                                ││
│                          │ │ Marketing Automation Masterclass               ││
│                          │ │ $299                                           ││
│                          │ │                                                ││
│                          │ │ Learn to automate your marketing with          ││
│                          │ │ AI-powered workflows and save 20+ hours/week   ││
│                          │ │                                                ││
│                          │ │ [Buy Now]                                      ││
│                          │ └────────────────────────────────────────────────┘│
│                          │                                                  │
│                          │ ✓ Basic information complete│
│                          │ ✓ Pricing configured│
│                          │ ✓ Content access set up│
│                          │ ✓ Checkout settings configured                   │
│                          │                                                  │
│                          │ ⚠️ RECOMMENDATIONS                               │
│                          │ • Add at least 3 gallery images                │
│                          │ • Record a video preview (increases conversion)  │
│                          │ • Set up an upsell offer                         │
│                          │                                                  │
│                          │ ─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ VISIBILITY│
│                          │                                                  │
│                          │ ● Publish immediately                            │
│                          │ ○ Schedule for later                             │
│                          │   Date: [__________] Time: [______]│
│                          │                                                  │
│                          │ ☑ Add to store homepage│
│                          │ ☐ Feature on landing page                        │
│                          │ ☑ Enable in marketplace                          │
│                          │                                  │
│                          │ ─────────────────────────────────────────────    │
│                          │                                                  │
│                          │ SEO SETTINGS│
│                          │                                                  │
│                          │ Meta Title (60chars)                            │
│                          │ [Marketing Automation Masterclass | LuxGen]      │
│                          │                                                  │
│                          │ Meta Description (160 chars)                     │
│                          │ [Learn marketing automation with AI. Save 20+│
│                          │  hours per week. Enroll now!]                    │
│                          │                                                  │
│                          │ URL Slug                │
│                          │ luxgen.com/products/[marketing-automation]       │
│                          │                                                  │
│                          │                [← Back] [Save Draft] [Publish]  │
└──────────────────────────┴──────────────────────────────────────────────────┘
3. Bundles
Bundle Builder Screen
Route: /commerce/bundles/new

┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Products > Create Bundle                       [Preview] [Save Draft] [Publish]│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ BUNDLE INFORMATION│
│                                                                              │
│ Bundle Name *                                                                │
│ [Complete Marketing Mastery Bundle...........................]│
│                                                                              │
│ Description│
│ [Get all5 marketing courses at 40% off. Master every aspect of modern│
│  marketing from automation to analytics.]│
│                                                                              │
│ Bundle Image│
│ [Upload Image]                                                               │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ BUNDLE CONTENTS                                                              │
│                                                                              │
│ [+ Add Product]                                                              │
│                                                                              │
│┌──────────────────────────────────────────────────────────────────────────┐│
│ │ 1. 🎓 Marketing Automation Course$299    [Remove]  ││
│ │    234 enrolled • 4.8★││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│┌──────────────────────────────────────────────────────────────────────────┐│
│ │ 2. 🎓 Social Media Marketing                           $199    [Remove]  ││
│ │    456 enrolled • 4.6★                                                   ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ 3. 🎓 Email Marketing Mastery                          $149    [Remove]  ││
│ │    189 enrolled • 4.7★                                                   ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ 4. 🎓 Content Marketing Strategy                       $179    [Remove]  ││
│ │    312 enrolled • 4.5★                                                   ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ 5. 🎓 Marketing Analytics                              $129    [Remove]  ││
│ │    267 enrolled • 4.6★                                                   ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ PRICING│
│                                                                              │
│ Individual Product Total: $955│
│                                                                              │
│ Bundle Price *                                                               │
│ $ [499.00]                                                                   │
│                                                                              │
│ 💡Savings: $456 (48% off) - Great value!│
│                                                                              │
│ ☑ Show "Save $456" badge on product page                                    │
│ ☑ Display individual product prices for comparison                          │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ BUNDLE OPTIONS                                                               │
│                                                                              │
│ Access Type                                                  │
│● Grant immediate access to all products                                    │
│ ○ Release products on a schedule (drip content)                             │
│                                                                              │
│☑ Allow customers to purchase individual products separately                │
│ ☑ Offer bundle upgrade to customers who own some products                   │
│   Discount: [Proportional to products owned]                                │
│                                                                              │
│                [Cancel] [Save Draft] [Publish] │
└─────────────────────────────────────────────────────────────────────────────┘
Bundle Upgrade Offer (Smart Pricing)
Context: Customer already owns2 of 5 products in bundle

┌─────────────────────────────────────────────────────────────────────────────┐
│ 💡 UPGRADE TO COMPLETE BUNDLE                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                              │
│ You already own:                                                             │
│✓ Marketing Automation Course ($299)                                        │
│ ✓ Social Media Marketing ($199)                                             │
│                                                                              │
│ Get the remaining 3 courses:                                                 │
│ • Email Marketing Mastery ($149)                │
│ • Content Marketing Strategy ($179)                                          │
│ • Marketing Analytics ($129)                                                 │
│                                                                              │
│ Regular price: $457                                                          │
│ Your upgrade price: $199(56% off!)│
│                                                                              │
│ [Upgrade to Bundle]                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
4. Orders
Order List Screen
Route: /commerce/orders

┌─────────────────────────────────────────────────────────────────────────────┐
│ Commerce > Orders                                [Export] [Filters] [•••]│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 QUICK STATS                                                [Last 30 days]│
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────┤
│ Total│ Completed    │ Total        │ Avg Order│ Refund Rate│
│ Orders       │ Orders       │ Revenue      │ Value│                │
│ 1,234        │ 1,189        │ $127,450     │ $103│ 2.3%             │
│ ↑ 15%        │ ↑ 14%        │ ↑ 23%        │ ↑ 8%         │ ↓ 0.5%           │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ [🔍 Search orders, customers...] [All Status ▾] [Last 30 days ▾] [Export▾]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│☐ #12456John Smith$299.00  ✓ Completed  [View]  │
│    Marketing Automation Course • Jan 16, 20253:45 PM                       │
│    💳Visa ••••4242 • Stripe • No refunds                                   │
│                                                                              │
│ ☐ #12455  Jane Doe                           $499.00  ✓ Completed  [View]  │
│    Complete Course Bundle • Jan 16, 2025 2:30 PM                            │
│    💳 Mastercard ••••5555 • Stripe • No refunds                             │
│                                                                              │
│ ☐ #12454  Bob Johnson                        $99.00⏳ Pending   [View]  │
│    Pro Subscription (Monthly) • Jan 16, 2025 1:15 PM│
│    💳 PayPal • Payment processing│
│                                                                              │
│ ☐ #12453  Alice Williams                     $299.00  ❌ Failed[View]  │
│    Marketing Automation Course • Jan 16, 2025 12:00 PM                      │
│    💳 Visa ••••1234 • Card declined • [Retry Payment]                       │
│                                                                              │
│ ☐ #12452  Charlie Brown                      $199.00  ↩️ Refunded  [View]  │
│    Advanced JavaScript • Jan 15, 2025 11:30 AM                              │
│    💳 Visa ••••9876 • Refunded $199.00 on Jan 16│
│                                                                              │
│ ☐ #12451  David Lee                          $1,250.00 ✓ Completed [View]  │
│    Enterprise Plan +3Courses • Jan 15, 2025 10:00 AM                      │
│    💳 Amex ••••8888 • Stripe • High-value order│
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Showing 1-6 of 1,234 orders                   [←] [1] [2] [3] ... [206] [→]│
└─────────────────────────────────────────────────────────────────────────────┘
Order Details Screen
Route: /commerce/orders/:orderId

┌─────────────────────────────────────────────────────────────────────────────┐
│← Orders > Order #12456                    [Print] [Refund] [Resend] [•••]  │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬────────────────────────────────────────────┐
│ ORDER DETAILS                  │ CUSTOMER│
│                                │                                            │
│ Order #12456                   │ 👤 John Smith                              │
│ ✓ Completed                    │    john.smith@example.com                  │
│ Jan 16, 2025 3:45 PM           │    +1 (555) 123-4567                       │
│                                │                                            │
│ Payment Method│    Customer since: Jan 2024                │
│ 💳 Visa ••••4242               │    Total orders: 3                         │
│ Stripe                         │    Lifetime value: $847│
│                                │                                            │
│ Transaction ID                 │    [View Profile] [Send Message]│
│ ch_3abc123def456               │                                            │
│                                │────────────────────────────────────────────│
│ IP Address                     │ BILLING ADDRESS                            │
│ 192.168.1.1                    │                                            │
│ San Francisco, CA, USA│ John Smith                                 │
│                                │ 123 Market Street, Apt 4B                  │
├────────────────────────────────┤ San Francisco, CA 94102│
│ ORDER ITEMS                    │ United States                              │
│                                │                                            │
│🎓 Marketing Automation Course │────────────────────────────────────────────│
│    $299.00                     │ TIMELINE                                   │
│    Access granted✓            │                                            │
│                                │✓ Order placed                             │
│ Subtotal          $299.00      │   Jan 16, 2025 3:45 PM                     │
│ Tax (10%)          $29.90│                                            │
│ Total             $328.90      │✓ Payment received│
│                                │   Jan 16, 2025 3:45 PM                     │
│ Paid$328.90      │   Stripe • ch_3abc123def456                │
│ Refunded           $0.00       │                                            │
│ Balance            $0.00       │ ✓ Access granted                           │
│                                │   Jan 16, 2025 3:46 PM                     │
├────────────────────────────────┤   Enrollment confirmed                     │
│ ACTIONS│                                            │
│                                │ ✓ Welcome email sent                       │
│ [Issue Refund]                 │   Jan 16, 2025 3:46 PM                     │
│ [Resend Receipt]               │   Template: Course Welcome                 │
│ [Add Note]                     │                                            │
│ [Download Invoice]             │ ✓ Workflow triggered│
│                                │   Jan 16, 2025 3:46 PM                     │
├────────────────────────────────┤   New Course Purchase Automation│
│ INTERNAL NOTES                 │                                            │
│                                │────────────────────────────────────────────│
│ [Add a note...]│ AUTOMATION│
│                                │                                            │
│ 📝 Admin • Jan 16, 3:50 PM     │ ✓ Welcome workflow completed│
│    Customer requested invoice│ ✓ Added to email sequence                  │
│    [Reply] [Edit] [Delete]     │ ✓ Tagged as "New Customer"                │
│                                │ ✓ Synced to CRM                            │
└────────────────────────────────┴────────────────────────────────────────────┘
Refund Order Modal
┌─────────────────────────────────────────────────────────────────────────────┐
│ Issue Refund - Order #12456                                            [✕]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Refund Amount                │
│ ● Full refund ($328.90)                                                      │
│ ○ Partial refund                │
│   Amount: $ [____.__]                                                        │
│                                                                              │
│ Reason *│
│ [Customer requested▾]                                                       │
│ Options:                                                                     │
│ • Customer requested│
│ • Duplicate charge│
│ • Fraudulent│
│ • Product not as described                                                   │
│ • Other                                                                      │
│                                                              │
│ Internal Note (optional)                                                     │
│ [Customer not satisfied with course content...................]             │
│                                                                              │
│ ☑ Revoke course access                                                       │
│ ☑ Send refund confirmation email to customer                                │
│ ☐ Add customer to "Do Not Refund" list (prevents future purchases)          │
│                                                                              │
│⚠️ This action cannot be undone. The refund will be processed immediately.  │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                [Cancel] [Issue Refund]│
└─────────────────────────────────────────────────────────────────────────────┘
5. Customers
Customer List Screen
Route: /commerce/customers

┌─────────────────────────────────────────────────────────────────────────────┐
│ Commerce > Customers                          [+ Add Customer] [Export] [•••]│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 CUSTOMER METRICS[Last 30 days]│
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────┤
│ Total        │ New│ Avg Customer │ Repeat│ Churn Rate       │
│ Customers    │ Customers    │ LTV          │ Purchase %   │                  │
│ 2,456        │ 234          │ $487│ 34%          │ 5.2%             │
│ ↑ 12%        │ ↑ 23%        │ ↑ 15%        │ ↑ 3%         │ ↓ 1.2%           │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ [🔍 Search customers...] [All Segments ▾] [All Tags ▾] [Sort: LTV High ▾]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ☐👤 John Smith                    $8473 orders⭐ VIP     [View] [•••]  │
│    john.smith@example.com • Customer since Jan 2024                          │
│    Last purchase: 2 days ago • Pro Subscription (Active)                     │
│    Tags: [high-value] [marketing]                                            │
│                                                                              │
│ ☐ 👤 Jane Doe                      $499  1 order   🆕 New     [View] [•••]  │
│    jane.doe@example.com • Customer since Jan 2025                            │
│    Last purchase: 1 day ago • Complete Course Bundle                │
│    Tags: [new-customer] [bundle-buyer]                                       │
│                                                                              │
│ ☐ 👤 Bob Johnson                   $1,250 5 orders ⭐ VIP     [View] [•••]  │
│    bob.johnson@example.com • Customer since Dec 2023                         │
│    Last purchase: 1 week ago • Enterprise Plan (Active)                      │
│    Tags: [high-value] [enterprise] [power-user]                              │
│                                                                              │
│ ☐ 👤 Alice Williams                $99   1 order   ⚠️ At Risk [View] [•••]  │
│    alice.williams@example.com • Customer since Dec 2024                      │
│    Last purchase: 45 days ago • No recent activity                           │
│    Tags: [at-risk] [single-purchase]                                         │
│                                                                              │
│ ☐ 👤 Charlie Brown                 $00 orders  🛒 Abandoned [View] [•••]│
│    charlie.brown@example.com • Signed up Jan 2025                            │
│    Abandoned cart: Marketing Course ($299) • 3 days ago                      │
│    Tags: [abandoned-cart] [prospect]                                         │
│                                                                              │
│ ☐ 👤 David Lee                     $2,340 12 orders 💎 Elite[View] [•••]  │
│    david.lee@example.com • Customer since Mar 2023│
│    Last purchase: Yesterday • Multiple subscriptions (Active)                │
│    Tags: [elite] [power-user] [advocate]                                     │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Showing 1-6 of 2,456 customers                [←] [1] [2] [3] ... [410] [→] │
└─────────────────────────────────────────────────────────────────────────────┘
Customer Profile Screen
Route: /commerce/customers/:customerId

┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Customers > John Smith              [Send Email] [Add Note] [Edit] [•••]  │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬────────────────────────────────────────────┐
│ CUSTOMER OVERVIEW│ LIFETIME VALUE                             │
│                                │                                            │
│ 👤 John Smith                  │ $847                                       │
│    john.smith@example.com      │↑ 23% vs avg ($487)                        │
│    +1 (555) 123-4567           │                                            │
│                                │ [LTV Trend Chart - Last 12 months]         │
│ Customer since: Jan 2024       │                                            │
│ Last active: 2 hours ago       │────────────────────────────────────────────│
│                                │ QUICK STATS│
│ Status: ⭐ VIP Customer│                                            │
│                                │ Total Orders: 3                            │
│ Tags:                          │ Avg Order Value: $282│
│ [high-value] [marketing]       │ Last Purchase: 2 days ago                │
│ [+ Add tag]                    │ Active Subscriptions: 1│
│                                │ Courses Owned: 2                           │
├────────────────────────────────┤ Refund Rate: 0%│
│ [Orders] [Subscriptions]│                                            │
│ [Courses] [Activity]           │────────────────────────────────────────────│
│                                │                            │
├────────────────────────────────┤                │
│ ORDERS (3)                     │                                            │
│                                │                                            │
│ #12456 • $299 • Jan 16, 2025│                                            │
│ Marketing Automation Course    │                                            │
│✓ Completed                    │                                            │
│ [View Order]                   │                                            │
│                                │                                            │
│ #11234 • $449 • Dec 2024│                                            │
│ Pro Subscription (Annual)      │                                            │
│ ✓ Completed • Renews Dec 2025  │                                            │
│ [View Order]                   │                                            │
│                                │                                            │
│ #10123 • $99 • Jan 2024        │                                            │
│ Pro Subscription (Monthly)     │                                            │
│ ✓ Completed • Cancelled│                                            │
│ [View Order]                   │                                            │
│                                │                                            │
├────────────────────────────────┤                                            │
│ ACTIVE SUBSCRIPTIONS (1)       │                                            │
│                                │                                            │
│💼 Pro Subscription (Annual)   │                                            │
│    $449/year                   │                                            │
│    Next billing: Dec 15, 2025  │                                            │
│    [Manage]│                                            │
│                                │                                            │
├────────────────────────────────┤                                            │
│ COURSES OWNED (2)              │                                            │
│                                │                                            │
│ 🎓 Marketing Automation        │                                            │
│    Progress: 67% (12/18)│                                            │
│    Last accessed: 2 hours ago  │                                            │
│                                │                                            │
│ 🎓 Social Media Marketing      │                                            │
│    Progress: 100% (15/15)      │                                            │
│    Completed: Jan 2024│                                            │
│    Certificate issued✓        │                                            │
│                                │                                            │
├────────────────────────────────┤                                            │
│ RECENT ACTIVITY                │                                            │
│                                │                                            │
│ 🎓 Completed Lesson12│                                            │
│    2 hours ago                 │                                            │
│                                │                                            │
│ 🛒 Purchased course│                                            │
│    2 days ago                  │                                            │
│                                │                                            │
│ 📧Opened email                │                                            │
│    3 days ago                  │                                            │
│    "New Course Available"      │                                            │
│                                │                                            │
│ 🎓 Started new course          │                                            │
│    2 days ago                  │                                            │
│                                │                                            │
└────────────────────────────────┴────────────────────────────────────────────┘
Customer Segmentation
Route: /commerce/customers/segments

┌─────────────────────────────────────────────────────────────────────────────┐
│ Customer Segments[+ Create Segment] [•••]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│💎 Elite Customers (47)[View]│
│    LTV > $2,000 • 10+ orders • Active subscription                          │
│    Avg LTV: $3,245• Total value: $152,515│
│    [Send Campaign] [Export]                                                  │
│                                                                              │
│⭐ VIP Customers (234)                                             [View]    │
│    LTV > $500 • 3+ orders • Last purchase < 90 days                         │
│    Avg LTV: $847 • Total value: $198,198                                    │
│    [Send Campaign] [Export]                                                  │
│                                                                              │
│ 🆕 New Customers (456)                                             [View]    │
│    Customer since < 30 days • 1 order                                        │
│    Avg LTV: $187 • Total value: $85,272│
│    [Send Campaign] [Export]                                                  │
│                                                                              │
│ ⚠️ At Risk (189)                                                   [View]    │
│    Last purchase > 60 days • No active subscription│
│    Avg LTV: $234 • Potential lost value: $44,226                            │
│    [Send Win-back Campaign] [Export]                                         │
│                                                                              │
│ 🛒 Abandoned Cart (312)                                            [View]    │
│    Cart abandoned < 7 days • No purchase│
│    Potential value: $93,288• Avg cart: $299│
│    [Send Recovery Email] [Export]                                            │
│                                                                              │
│ 💤 Churned (567)                                                   [View]    │
│    Last purchase > 180 days • No active subscription                        │
│    Lost value: $133,029 • Avg previous LTV: $234│
│    [Send Re-engagement Campaign] [Export]                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
6. Coupons
Coupon List Screen
Route: /commerce/coupons

┌─────────────────────────────────────────────────────────────────────────────┐
│ Commerce > Coupons                                [+ Create Coupon] [•••]│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 COUPON PERFORMANCE[Last 30 days]│
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────┤
│ Active│ Total        │ Total        │ Avg Discount │ Redemption       │
│ Coupons      │ Redemptions  │ Discounts    │              │ Rate             │
│ 12│ 456          │ $34,567      │ $76│ 23%              │
│ → Same│ ↑ 34%        │ ↑ 45%        │ ↑ 12%        │ ↑ 5%             │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ [🔍 Search coupons...] [All Types ▾] [Active▾] [Sort: Redemptions▾]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ☐ WELCOME2020% off  234 uses✓ Active  [Edit]    │
│    Percentage discount • Applies to all products│
│    Valid: Jan 1- Dec 31, 2025• Unlimited uses                             │
│    Revenue impact: -$12,345 • Conversion lift: +15%                         │
│    [View Analytics] [Duplicate] [Deactivate]│
│                                                                              │
│ ☐ SAVE100$100 off  89 uses   ✓ Active  [Edit]   │
│    Fixed amount • Min purchase: $500│
│    Valid: Jan 1 - Jan 31, 2025 •500 uses remaining│
│    Revenue impact: -$8,900 • Avg order value: $687                          │
│    [View Analytics] [Duplicate] [Deactivate]                                 │
│                                                                              │
│ ☐ BUNDLE50                           50% off  45 uses   ✓ Active  [Edit]    │
│    Percentage discount • Applies to: Complete Course Bundle                  │
│    Valid: Jan 15 - Jan 31, 2025 • 55 uses remaining                         │
│    Revenue impact: -$11,225 • Bundle sales: +67%                            │
│    [View Analytics] [Duplicate] [Deactivate]                                 │
│                                                                              │
│ ☐ FLASH24                            30% off  12 uses   ⏰ Expiring [Edit]   │
│    Percentage discount • All products                                        │
│    Valid: Jan 16 - Jan 17, 2025 • Expires in 6 hours                        │
│    Revenue impact: -$2,145 • Urgency-driven sales: 12│
│    [View Analytics] [Extend] [Deactivate]                                    │
│                                                                              │
│ ☐ HOLIDAY2024                        25% off  567 uses  ❌ Expired [View]    │
│    Percentage discount • All products                                        │
│    Valid: Dec 1 - Dec 31, 2024 • Fully redeemed                             │
│    Revenue impact: -$42,525 • Conversion lift: +34%                         │
│    [View Analytics] [Duplicate]│
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Showing 1-5 of 12 coupons[←] [1] [2] [3] [→]     │
└─────────────────────────────────────────────────────────────────────────────┘
Create Coupon Modal
┌─────────────────────────────────────────────────────────────────────────────┐
│ Create Coupon                                                          [✕]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Coupon Code *│
│ [WELCOME20]                                                                  │
│☑ Auto-generate code│
│                                                                              │
│ Discount Type *                                                              │
│ ● Percentage discount                                                        │
│ ○ Fixed amount discount│
│ ○ Free shipping                                                              │
│ ○ Buy X Get Y                                                                │
│                                                                              │
│ Discount Value *                                                             │
│ [20] %                                                                       │
│                                                              │
│─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│ Applies To                                                   │
│ ● All products                                                               │
│ ○ Specific products                                                          │
│   [Select products▾]                                                        │
│ ○ Specific collections│
│   [Select collections ▾]                                                     │
│                                                                              │
│─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│ Minimum Requirements│
│ ○ No minimum                                                                 │
│ ● Minimum purchase amount                                                    │
│   $ [50.00]                                                                  │
│ ○ Minimum quantity of items                                                  │
│   [___] items                                                                │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│ Customer Eligibility                                                         │
│ ● Everyone                                                                   │
│ ○ Specific customer segments                                                 │
│   [Select segments ▾]                                                        │
│ ○ Specific customers│
│   [Select customers ▾]                                                       │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│ Usage Limits                                                                 │
│☑ Limit number of times this coupon can be used in total│
│   [100] uses                                                                 │
│                                                              │
│☑ Limit to one use per customer                                             │
│                                                                              │
│─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│ Active Dates│
│ Start date: [Jan 1, 2025 ▾]                                                 │
│ End date: [Dec 31, 2025 ▾]                                                  │
│☐ No end date                                                                │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│[Cancel] [Create Coupon]│
└─────────────────────────────────────────────────────────────────────────────┘
7. Payments & Subscriptions
Payment Settings Screen
Route: /commerce/payments/settings

┌─────────────────────────────────────────────────────────────────────────────┐
│ Commerce > Payment Settings                                    [Save Changes]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ PAYMENT GATEWAYS                                                             │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ ☑ Stripe                                             ✓ Connected  [Edit]││
│ │   Process credit cards, Apple Pay, Google Pay                ││
│ │   Account: acct_1abc123def456                                            ││
│ │   Test mode: ☐ Enabled                                                   ││
│ │   [View Dashboard] [Disconnect]││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ ☑ PayPal                                             ✓ Connected  [Edit] ││
│ │   Accept PayPal payments││
│ │   Account: merchant@luxgen.com                                           ││
│ │   Sandbox mode: ☐ Enabled                ││
│ │   [View Dashboard] [Disconnect]                                          ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ ☐ Apple Pay                                          ⚠️ Not Set Up [Setup]││
│ │   Enable one-tap checkout for iOS users││
│ │   Requires: Stripe or compatible gateway││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ ☐ Google Pay                                         ⚠️ Not Set Up [Setup]││
│ │   Enable one-tap checkout for Android users                              ││
│ │   Requires: Stripe or compatible gateway                                 ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ [+ Add Payment Gateway]                                                      │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│ CURRENCY SETTINGS                                                            │
│                                                                              │
│ Default Currency                                                             │
│ [USD ($) ▾]                                                                │
│                                                                              │
│☑ Enable multi-currency support                                             │
│   Accepted currencies:                                                       │
│   [USD] [EUR] [GBP] [CAD] [AUD] [+ Add]                                     │
│                                                                              │
│ Currency conversion│
│ ● Use live exchange rates (updated daily)                                   │
│ ○ Use fixed exchange rates                                                   │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│ TAX SETTINGS                                                                 │
│                                                                              │
│ ☑ Charge tax on products                                                     │
│                                                                              │
│ Tax calculation                                                              │
│ ● Automatic (based on customer location)                                    │
│ ○ Manual (fixed rate)                                                        │
│   Rate: [10] %                                                               │
│                                                                              │
│ Tax ID collection│
│ ☑ Collect tax ID from customers (for B2B)                                   │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│ INVOICE SETTINGS                                                             │
│                                                                              │
│ ☑ Automatically generate invoices                                            │
│☑ Email invoices to customers                                                │
│                                                                              │
│ Invoice prefix                                                               │
│ [INV-]                                                                       │
│                                                                              │
│ Next invoice number                                                          │
│ [1000]│
│                                                                              │
│ Invoice footer text                                                          │
│ [Thank you for your business!.............................]│
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                  [Cancel] [Save Changes]     │
└─────────────────────────────────────────────────────────────────────────────┘
Subscription Management Screen
Route: /commerce/subscriptions

┌─────────────────────────────────────────────────────────────────────────────┐
│ Commerce > Subscriptions                              [+ Create Plan] [•••]  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 SUBSCRIPTION METRICS[Last 30 days]│
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────┤
│ Active│ New│ MRR          │ Churn Rate   │ Avg LTV          │
│ Subscribers│ Subscribers  │              │              │                  │
│ 1,234        │ 89           │ $98,765      │ 3.2%         │ $1,247│
│ ↑ 7%         │ ↑ 12%        │ ↑ 15%        │ ↓ 0.8%       │ ↑ 23%            │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ [Plans] [Subscribers] [Cancellations] [Analytics]                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ SUBSCRIPTION PLANS                                                           │
│                                                                              │
│💼 Pro Plan (Monthly)                        $99/mo456 active[Edit]   │
│    Monthly billing •7-day free trial                │
│    MRR: $45,144• Churn: 2.8% • Avg lifetime:18months                     │
│    [View Subscribers] [View Analytics]                                       │
│                                                                              │
│ 💼 Pro Plan (Annual)                         $999/yr   234 active  [Edit]   │
│    Annual billing • Save 16% • 14-day free trial                            │
│    ARR: $233,766 • Churn: 1.2% • Avg lifetime: 2.5 years                    │
│    [View Subscribers] [View Analytics]                                       │
│                                                                              │
│ 💎 Enterprise Plan                $499/mo   12 active   [Edit]   │
│    Monthly billing • Custom features • Dedicated support                     │
│    MRR: $5,988 • Churn: 0% • Avg lifetime: 3+ years                         │
│    [View Subscribers] [View Analytics]                                       │
│                                                                              │
│ 🎓 Course Access Pass                        $49/mo    532 active  [Edit]   │
│    Monthly billing • Access to all courses                                   │
│    MRR: $26,068 • Churn: 4.5% • Avg lifetime: 14 months                     │
│    [View Subscribers] [View Analytics]                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
8. Revenue Analytics
Revenue Dashboard
Route: /commerce/revenue

┌─────────────────────────────────────────────────────────────────────────────┐
│ Commerce > Revenue Analytics[Last 30 days ▾] [Export]│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 💰 KEY METRICS                                                               │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────┤
│ Total│ MRR          │ One-time     │ Avg Order│ Revenue per      │
│ Revenue      │              │ Sales        │ Value        │ Customer│
│ $127,450     │ $98,765      │ $28,685      │ $103│ $52│
│ ↑ 23%        │ ↑ 15%        │ ↑ 45%        │ ↑ 8%         │ ↑ 12%            │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ REVENUE TREND                                                                │
│                                                                              │
│ [Line Chart: Revenue over time]                                             │
│ - Total Revenue (purple line)                                                │
│ - MRR (green line)                                                           │
│ - One-time Sales (blue line)                                                 │
│                                                                              │
│ Jan 1────────────────────────────────────────────────────────── Jan 30│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬────────────────────────────────────────────┐
│ REVENUE BY PRODUCT│ REVENUE BY CHANNEL                │
│                                ││
│ [Pie Chart]│ [Bar Chart]                                │
│                │                                            │
│🎓Courses        45% $57,352│ Direct$76,470(60%)│
│ 💼 Subscriptions  38% $48,431  │ Organic Search$38,235 (30%)         │
│ 📚 Bundles        12% $15,294  │ Social Media         $7,647 (6%)           │
│ 📦 Other5% $6,372   │ Email$3,823 (3%)           │
│                                │ Affiliate$1,275 (1%)           │
│                                │                                            │
└────────────────────────────────┴────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ TOP PERFORMING PRODUCTS                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. 💼 Pro Subscription (Annual)          $45,144  234 sales↑ 23%  [View]  │
│    Avg sale: $193• Conversion rate: 15%│
│                                                                              │
│ 2. 🎓 Marketing Automation Course        $28,685  96 sales   ↑ 34%  [View]  │
│    Avg sale: $299 • Conversion rate: 12%                                    │
│                                                                              │
│ 3. 📚 Complete Course Bundle             $22,455  45 sales   ↑ 67%  [View]  │
│    Avg sale: $499 • Conversion rate: 8%                                     │
│                                                                              │
│ 4. 💼 Pro Subscription (Monthly)         $18,963  192 sales  ↑ 12%  [View]  │
│    Avg sale: $99 • Conversion rate: 18%                                     │
│                                                                              │
│ 5. 🎓 Advanced JavaScript$12,234  61 sales   ↑ 8%   [View]  │
│    Avg sale: $199 • Conversion rate: 10%                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬────────────────────────────────────────────┐
│ REVENUE FORECAST│ COHORT ANALYSIS                            │
│                                │                                            │
│ [Forecast Chart]               │ [Cohort Retention Heatmap]                │
│                                │                                            │
│ Next 30 days:│ Month 0Month 1  Month 2  Month 3        │
│ Projected: $145,000            │ Jan 24   100%     85%      78%     72%     │
│ Conservative: $120,000         │ Feb 24   100%     87%      80%     75%     │
│ Optimistic: $165,000           │ Mar 24   100%     89%      82%     77%     │
│                │ Apr 24   100%     91%      85%     80%     │
│ Based on:                      │                                            │
│ • Historical trends│💡 Retention improving month-over-month    │
│ • Seasonal patterns            │                                            │
│ • Active campaigns             │                                            │
│                │                                            │
└────────────────────────────────┴────────────────────────────────────────────┘
9. Conversion Funnels
Funnel Analytics Screen
Route: /commerce/funnels

┌─────────────────────────────────────────────────────────────────────────────┐
│ Commerce > Conversion Funnels                         [Last 30 days ▾] [•••] │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PURCHASE FUNNEL                                                              │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Product View12,456 visitors (100%) │  │
│ │ ████████████████████████████████████████████████████████████████████│  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│↓ 45% drop-off                                      │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Add to Cart                                      6,851 visitors (55%)  │  │
│ │ ███████████████████████████████████████                │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│↓ 32% drop-off                                      │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Checkout Started4,659 visitors (37%)  │  │
│ │ ████████████████████████████│  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                          ↓ 18% drop-off                                      │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Payment Info Entered3,820 visitors (31%)  │  │
│ │ ███████████████████████                                                │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                          ↓ 8% drop-off                                       │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Purchase Completed                               3,515 visitors (28%)  │  │
│ │ █████████████████████                │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                              │
│ Overall Conversion Rate: 28.2% (↑ 3.5% vs last period)                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬────────────────────────────────────────────┐
│ DROP-OFF ANALYSIS│ OPTIMIZATION OPPORTUNITIES                 │
│                                │                                            │
│ Highest drop-off points:       │ 💡 Product View → Add to Cart (45%)        │
│                │    • Add video demo│
│1. Product View → Cart (45%)   │    • Show social proof                     │
│    Top reasons:                │    • Highlight key benefits                │
│    • Price concerns (34%)      │    Potential lift: +12% conversion         │
│    • Need more info (28%)      │                                            │
│    • Comparing options (23%)   │💡 Checkout → Payment (18%)                │
│    [View Heatmaps]             │    • Simplify checkout form│
│                                │    • Add trust badges                      │
│ 2. Checkout → Payment (18%)    │    • Offer guest checkout                │
│    Top reasons:                │    Potential lift: +8% conversion          │
│    • Unexpected costs (42%)    │                                            │
│    • Complex form (31%)        │ 💡 Payment → Complete (8%)                 │
│    • No guest checkout (18%)   │    • Reduce payment errors                 │
│    [View Session Replays]      │    • Add more payment options│
│                                │    • Show security badges                  │
│ 3. Payment → Complete (8%)     │    Potential lift: +4% conversion          │
│    Top reasons:                │                                            │
│    • Payment errors (56%)      │ [Run A/B Tests] [View Recommendations]     │
│    • Second thoughts (29%)     │                                            │
│    • Technical issues (15%)    │                                            │
│    [View Error Logs]           │                                            │
│                                │                                            │
└────────────────────────────────┴────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ FUNNEL COMPARISON                                                            │
│                                                                              │
│ [Segmented Funnel Chart]                                │
│                                                                              │
│ New Customers:23% conversion (↑ 2%)                                  │
│ Returning Customers:  45% conversion (↑ 5%)                                  │
│ Mobile Users:         19% conversion (↓ 1%)                                  │
│ Desktop Users:        34% conversion (↑ 4%)                                  │
│                                                                              │
│💡 Mobile conversion significantly lower - prioritize mobile optimization│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
10. Upsells & Cross-sells
Upsell Configuration Screen
Route: /commerce/products/:id/upsells

┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Marketing Automation Course > Upsells                [Save Changes] │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ UPSELL STRATEGY│
│                                                                              │
│ ☑ Enable upsells for this product                                           │
│                                                                              │
│ Upsell Timing│
│ ● Show immediately after purchase (one-click upsell)                         │
│ ○ Show on thank you page                │
│ ○ Send via email 24 hours after purchase                                    │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ PRIMARY UPSELL                                                               │
│                                                                              │
│ Product                                                      │
│ [Complete Course Bundle ▾]                                                   │
│                                                                              │
│ Upsell Price                                                 │
│● Special discount price                                     │
│   $ [399] (20% off regular $499)                                             │
│ ○ Regular price ($499)                                                       │
│                                                                              │
│ Headline│
│ [Complete Your Marketing Education!...........................]              │
│                                                                              │
│ Description                                                                  │
│ [You just purchased Marketing Automation. Upgrade to the complete bundle│
│  and get4 more courses for just $399(save $200)!]                         │
│                                                                              │
│ Call-to-Action Button│
│ [Yes, Upgrade My Order!]                                                     │
│                                                                              │
│ Decline Button                                                               │
│ [No thanks, I'll stick with my purchase]                                     │
│                                                                              │
│┌────────────────────────────────────────────────────────────────────────┐  │
│ │ PREVIEW                                                │  │
│ ││  │
│ │🎉 Wait! Special One-Time Offer                │  │
│ │                                                                        │  │
│ │ Complete Your Marketing Education!                                     │  │
│ │                                                                        │  │
│ │ You just purchased Marketing Automation. Upgrade to the complete       │  │
│ │ bundle and get 4 more courses for just $399 (save $200)!              │  │
│ │                                                                        │  │
│ │✓ Email Marketing Mastery ($149value)                                │  │
│ │ ✓ Social Media Marketing ($199 value)                                 │  │
│ │ ✓ Content Marketing Strategy ($179 value)                             │  │
│ │ ✓ Marketing Analytics ($129 value)                                    │  │
│ │                                                                        │  │
│ │ Regular Price: $655│  │
│ │ Bundle Price: $499                                                     │  │
│ │ Your Upgrade Price: $399(You save $256!)                             │  │
│ │                                                                        │  │
│ │ [Yes, Upgrade My Order!]                                               │  │
│ │                                                                        │  │
│ │ [No thanks, I'll stick with my purchase]                               │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ SECONDARY UPSELL (if primary declined)                                       │
│                                                                              │
│ ☑ Offer secondary upsell                                                     │
│                                                                              │
│ Product                                                                      │
│ [Email Marketing Mastery ▾]                │
│                                                                              │
│ Upsell Price                                                                 │
│ $ [119] (20% off regular $149)                                               │
│                                                                              │
│ Headline                                                                     │
│ [Add Email Marketing to Your Skills!...........................]             │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ CROSS-SELL RECOMMENDATIONS                                                   │
│                                                                              │
│ ☑ Show "Customers also bought" on product page                              │
│                                                                              │
│ Recommended Products (drag to reorder):                                      │
│ 1. 🎓 Email Marketing Mastery ($149)[Remove]    │
│ 2. 🎓 Social Media Marketing ($199)                              [Remove]    │
│ 3. 📚 Complete Course Bundle ($499)                              [Remove]    │
│                                                                              │
│ [+ Add Product]│
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ ORDER BUMP (at checkout)                                                     │
│                                                                              │
│ ☑ Offer order bump at checkout                                              │
│                                                                              │
│ Product                                                                      │
│ [1-on-1 Coaching Session ▾]                                                  │
│                                                                              │
│ Price│
│ $ [99] (add to order)                                                        │
│                                                                              │
│ Checkbox Label                                                               │
│ [☐ Yes! Add1-on-1 coaching session for $99 (limited availability)]         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ PERFORMANCE                                                  │
│                                                                              │
│ Primary Upsell:│
│ • Shown: 234 times│
│ • Accepted: 67times (28.6% conversion)│
│ • Revenue: $26,733│
│                                                                              │
│ Secondary Upsell:│
│ • Shown: 167 times                                                           │
│ • Accepted: 34 times (20.4% conversion)                                      │
│ • Revenue: $4,046│
│                                                                              │
│ Order Bump:                                                                  │
│ • Shown: 234 times                                                           │
│ • Accepted: 45 times (19.2% conversion)                                      │
│ • Revenue: $4,455                                                            │
│                                                                              │
│ Total Upsell Revenue: $35,234(↑ 23% vs last period)                        │
│                                                                              │
│ [View Detailed Analytics]                                                    │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│[Cancel] [Save Changes]     │
└─────────────────────────────────────────────────────────────────────────────┘
This comprehensive commerce wireframe specification provides a complete blueprint for building a world-class e-commerce system within LuxGen, covering products, bundles, orders, customers, coupons, payments, subscriptions, revenue analytics, conversion funnels, and upsell strategies.