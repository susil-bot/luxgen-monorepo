# Project — Ongoing Iteration & Creator Workflow Planning

> **Type:** Business Requirements & Feature Discovery  
> **Date:** 2026-06-20  
> **Status:** Requirements draft — not implemented  
> **Scope:** New **Project** area in LuxGen for content creators, teachers, and trainers to plan work in iterations, track priority, and align goals via configurable workflows

Related: [PERSONA_PAGES.md](../docs/PERSONA_PAGES.md) · [BUSINESS_TECH_TRANSLATION.md](../docs/BUSINESS_TECH_TRANSLATION.md) · [automations skill](../skills/automation/SKILL.md) · GitHub Projects–style board (reference UI)

---

## 1. Executive summary

| Item                | Detail                                                                                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product name**    | **Project** (top-level nav) → **Ongoing iteration** (default sub-view)                                                                                                                                                                              |
| **Problem**         | Creators plan courses, videos, modules, and campaigns in spreadsheets or external tools (Notion, Trello, GitHub Projects). LuxGen has **learner** journeys and **automation** triggers but no **creator planning** surface tied to courses/content. |
| **Solution**        | Iteration-based project board with kanban columns, a **priority** insight block, and a **Workflow** builder so each creator role can define how they plan, track, and get reminded about content work.                                              |
| **Primary users**   | Digital content creator, teacher/instructor, personal development trainer (and tenant admins who oversee them)                                                                                                                                      |
| **Not the same as** | `/automations` (runtime trigger→action on learners) — Project is **planning & delivery tracking** for humans creating content                                                                                                                       |
| **Reference UX**    | GitHub Projects: Current iteration / Next iteration tabs, columns Backlog → Done, filters, workflow templates                                                                                                                                       |

---

## 2. Business problem

### 2.1 Current state (LuxGen)

| Capability                      | Exists?          | Gap                                           |
| ------------------------------- | ---------------- | --------------------------------------------- |
| Publish courses (`/courses`)    | Yes              | No sprint/iteration planning                  |
| Learner progress (`/customers`) | Yes (Sprint 1)   | Creator-side “did I finish module 3?” missing |
| Automations (`/automations`)    | Yes              | Event-driven ops, not content calendars       |
| Analytics                       | Yes (Pro)        | Retrospective metrics, not forward planning   |
| Agent Studio                    | Yes (Enterprise) | Code changes, not content production boards   |

### 2.2 User pain

1. **Scattered planning** — “What am I shipping this week?” lives outside LuxGen.
2. **No iteration rhythm** — No shared **current** vs **next** iteration view for a team.
3. **Priority blindness** — Hard to see who owns what, start/end dates, and blockers in one place.
4. **Role mismatch** — A YouTuber’s workflow ≠ a corporate trainer’s workflow; one-size admin UI does not fit.
5. **No reminders tied to plan** — Deadlines on content pieces are not linked to LuxGen notifications or automations.

### 2.3 Business opportunity

| Outcome               | Value                                                                            |
| --------------------- | -------------------------------------------------------------------------------- |
| **Retention**         | Creators stay in LuxGen for plan + publish + teach                               |
| **Upsell**            | Pro/Business gate: iterations, workflows, reminders                              |
| **Differentiation**   | “LMS + creator project hub” vs pure course hosts                                 |
| **Automation bridge** | Planned item “Course published” can later trigger existing `USER_ENROLLED` flows |

---

## 3. Target personas

| Persona                          | Goals                                                                           | Typical cards on board                                                     |
| -------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Digital content creator**      | Script, record, edit, publish videos/modules; batch content for social + course | “Outline ep. 12”, “Record B-roll”, “Upload to module 4”, “Thumbnail + SEO” |
| **Teacher / instructor**         | Lesson plans, assessments, office hours, term schedule                          | “Week 5 slides”, “Quiz bank”, “Grade batch”, “Parent email”                |
| **Personal development trainer** | Cohorts, worksheets, live sessions, certification milestones                    | “Cohort 3 kickoff”, “Workbook PDF”, “Live Q&A”, “Certificate template”     |
| **Tenant admin (secondary)**     | Visibility across creators; capacity planning                                   | Read-only or assign across team                                            |

All personas share: **iterations**, **status columns**, **assignee**, **dates**, **priority**, optional **link to course/product**.

---

## 4. Navigation & information architecture

### 4.1 Sidebar (proposed)

```
Project                          ← new top-level section (Pro+ suggested)
├── Ongoing iteration            ← default landing (/project or /project/iteration/current)
├── Next iteration               ← (/project/iteration/next)
├── Priority                     ← (/project/priority) — filtered card wall
├── All items                    ← backlog across iterations (optional Phase 2)
└── My workflows                 ← (/project/workflows) — saved workflow templates
```

**Menu label:** `Project`  
**Default sub-menu:** `Ongoing iteration` (matches GitHub “Current iteration” tab)

### 4.2 Views (tabs within Project)

| Tab                     | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| **Ongoing iteration**   | Active time-box (e.g. 2 weeks); kanban for `@current` |
| **Next iteration**      | Planned work for `@next`; same column layout          |
| **Prioritized backlog** | Cross-iteration queue sorted by priority (Phase 2)    |
| **Roadmap**             | Timeline by start/end (Phase 3)                       |
| **In review**           | Filter: status = In review (shortcut view)            |
| **My items**            | Filter: assignee = current user                       |

---

## 5. Functional requirements

### 5.1 Iteration model

| ID       | Requirement                                                                              | Priority |
| -------- | ---------------------------------------------------------------------------------------- | -------- |
| BR-IT-01 | System supports at least two iteration scopes: **Current (ongoing)** and **Next**        | Must     |
| BR-IT-02 | Each iteration has: name, start date, end date, goal summary (optional)                  | Must     |
| BR-IT-03 | Only one iteration marked **current** per project/tenant workspace at a time             | Must     |
| BR-IT-04 | User can move a card from Next → Current iteration (drag or action)                      | Must     |
| BR-IT-05 | When current iteration ends, admin can **roll over** incomplete cards to next or backlog | Should   |
| BR-IT-06 | Iteration displays aggregate **estimate** (story points or hours) per column             | Should   |

### 5.2 Kanban board — columns (both iterations)

Same five columns on **Ongoing iteration** and **Next iteration** boards:

| Column          | Color (iOS token) | Meaning                     | Card enters when…           |
| --------------- | ----------------- | --------------------------- | --------------------------- |
| **Backlog**     | Green             | Not started; idea captured  | Created default             |
| **Ready**       | Blue              | Defined; ready to pick up   | User moves or workflow rule |
| **In progress** | Orange            | Active work                 | Assignee starts             |
| **In review**   | Purple            | Awaiting review/approval    | Submitted for review        |
| **Done**        | Red/Orange        | Complete for this iteration | Accepted / published        |

| ID       | Requirement                                                                                                                 | Priority |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| BR-KB-01 | Board shows five columns with counts (e.g. `0/3`) and column estimate total                                                 | Must     |
| BR-KB-02 | User can **add item** inline in any column (+ Add item)                                                                     | Must     |
| BR-KB-03 | User can **drag-and-drop** cards between columns                                                                            | Must     |
| BR-KB-04 | Card move updates status and `updatedAt`; audit optional                                                                    | Must     |
| BR-KB-05 | Quick create from bottom bar: **Create new issue**, **Create draft**, **Add from repository** (link existing course/module) | Should   |
| BR-KB-06 | Filter bar supports `iteration:@current`, `iteration:@next`, assignee, label, priority                                      | Must     |
| BR-KB-07 | Empty columns show helper text (match reference: “This item hasn’t been started”)                                           | Should   |

### 5.3 Project card (work item)

| Field         | Type                         | Required | Notes                        |
| ------------- | ---------------------------- | -------- | ---------------------------- |
| Title         | string                       | Yes      |                              |
| Description   | markdown                     | No       |                              |
| Status        | enum                         | Yes      | Maps to column               |
| Iteration     | current \| next \| backlog   | Yes      |                              |
| Priority      | P0–P3 or High/Med/Low        | No       | Drives priority block sort   |
| Assignee      | User                         | No       |                              |
| Start date    | date                         | No       |                              |
| End date      | date                         | No       | Due date; feeds reminders    |
| Estimate      | number                       | No       | Points or hours              |
| Labels        | string[]                     | No       | e.g. `video`, `assessment`   |
| Linked entity | Course / Product / Module ID | No       | Deep link to LuxGen entity   |
| Reminder      | datetime                     | No       | Notification before end date |
| Created by    | User                         | Auto     |                              |

| ID       | Requirement                                                      | Priority |
| -------- | ---------------------------------------------------------------- | -------- |
| BR-CD-01 | Click card opens detail drawer/page with all fields editable     | Must     |
| BR-CD-02 | Overdue cards (past end date, not Done) show visual indicator    | Must     |
| BR-CD-03 | Card can link to `/courses/[id]` or future module when published | Should   |
| BR-CD-04 | Deleting card requires confirm; soft-delete preferred            | Should   |

### 5.4 Priority block

Dedicated view or collapsible panel showing **priority metrics** as **cards** (not just a list).

| ID       | Requirement                                                                                 | Priority |
| -------- | ------------------------------------------------------------------------------------------- | -------- |
| BR-PR-01 | **Priority block** displays work items sorted by priority, then end date                    | Must     |
| BR-PR-02 | Filters: assignee, status, iteration, date range, label, priority tier                      | Must     |
| BR-PR-03 | Each card shows: title, assignee avatar, start date, end date, status badge, priority badge | Must     |
| BR-PR-04 | Metrics header: count by priority, overdue count, unassigned count                          | Should   |
| BR-PR-05 | Toggle layouts: compact list vs card grid                                                   | Could    |
| BR-PR-06 | Export filtered set to CSV (Phase 2)                                                        | Could    |

**Card format (wireframe):**

```
┌─────────────────────────────┐
│ [P1] Record Module 3 video  │
│ 👤 Ada Lovelace             │
│ 📅 Start Mar 1 → End Mar 8  │
│ ● In progress               │
└─────────────────────────────┘
```

### 5.5 Workflow button & creator workflows

**Workflow** (in this doc) = **planning template** for how a creator runs iterations — **not** `/automations` runtime rules.

| ID       | Requirement                                                                                           | Priority |
| -------- | ----------------------------------------------------------------------------------------------------- | -------- |
| BR-WF-01 | **Workflows** button (header, badge count) opens workflow gallery + create                            | Must     |
| BR-WF-02 | User can **create new workflow** from template or blank                                               | Must     |
| BR-WF-03 | Workflow defines: name, persona type, default columns, optional stage checklist per column            | Must     |
| BR-WF-04 | Preset templates ship for: **Digital content creator**, **Teacher**, **Personal development trainer** | Must     |
| BR-WF-05 | Workflow can define **default reminders** (e.g. 2 days before end date)                               | Should   |
| BR-WF-06 | Workflow can define **required fields** before moving to Done (e.g. “Link to published course”)       | Should   |
| BR-WF-07 | Applying a workflow to a project sets default labels/checklists on new cards                          | Should   |
| BR-WF-08 | Workflow analytics: completion rate per stage, avg cycle time (Phase 2)                               | Could    |

#### Preset workflow examples

**Digital content creator**

| Stage       | Checklist items                    |
| ----------- | ---------------------------------- |
| Backlog     | Idea validated, audience fit       |
| Ready       | Outline approved, assets listed    |
| In progress | Recorded, edited                   |
| In review   | QA watch-through                   |
| Done        | Published + linked to store/module |

**Teacher**

| Stage       | Checklist items                    |
| ----------- | ---------------------------------- |
| Ready       | Learning objectives written        |
| In progress | Slides + activities built          |
| In review   | Peer or admin review               |
| Done        | Live in course + learners notified |

**Personal development trainer**

| Stage       | Checklist items                    |
| ----------- | ---------------------------------- |
| Ready       | Cohort date set                    |
| In progress | Materials uploaded                 |
| In review   | Compliance check                   |
| Done        | Cohort live + certificate rule set |

### 5.6 Reminders & notifications

| ID       | Requirement                                                                              | Priority |
| -------- | ---------------------------------------------------------------------------------------- | -------- |
| BR-RM-01 | Reminder fires via existing notification channel (email / in-app)                        | Should   |
| BR-RM-02 | Optional: on Done, emit automation event `CONTENT_PLAN_ITEM_DONE` for future automations | Could    |
| BR-RM-03 | Daily digest: “3 items due this week” on Project home                                    | Could    |

---

## 6. Non-functional requirements

| ID     | Requirement                                                                         |
| ------ | ----------------------------------------------------------------------------------- |
| NFR-01 | Tenant-scoped: all projects/cards isolated by `tenantId`                            |
| NFR-02 | Role-based: creators edit own/team items; learners **no access** to Project         |
| NFR-03 | iOS design tokens + `AppLayout` — [ios-design SKILL](../skills/ios-design/SKILL.md) |
| NFR-04 | Real-time optional Phase 2 (GraphQL subscriptions or polling)                       |
| NFR-05 | Mobile read-only Phase 3 (Expo)                                                     |
| NFR-06 | Plan gate: **Pro+** for Project (recommended)                                       |

---

## 7. Differentiation: Project vs Automations vs Courses

|             | **Project**               | **Automations** (`/automations`) | **Courses** (`/courses`) |
| ----------- | ------------------------- | -------------------------------- | ------------------------ |
| **Purpose** | Plan & track creator work | Run triggers on learner events   | Deliver learning content |
| **User**    | Creator, teacher, trainer | Admin, operator                  | Admin + learner          |
| **Unit**    | Card / work item          | Rule + run                       | Course, module           |
| **Time**    | Iteration, due dates      | Event-driven                     | Term, enrollment         |
| **Output**  | Done card + optional link | Email, webhook, enroll           | Published course         |

---

## 8. Proposed data model (high level)

```
ProjectWorkspace (per tenant or per team)
├── Iteration { id, name, startDate, endDate, scope: CURRENT | NEXT, goal }
├── ProjectItem { id, title, status, iterationId, priority, assigneeId, dates, estimate, labels, linkedCourseId, workflowId }
├── ProjectWorkflow { id, name, personaType, columnConfig, checklists, reminderRules }
└── ProjectActivity (audit: moved, assigned, commented)
```

GraphQL domain: `project` (new) — follow [graphql SKILL](../skills/graphql/SKILL.md).

---

## 9. UI reference mapping (screenshot)

| Reference element           | LuxGen implementation                                   |
| --------------------------- | ------------------------------------------------------- |
| Current iteration tab       | **Ongoing iteration**                                   |
| Next iteration tab          | **Next iteration**                                      |
| Prioritized backlog         | Phase 2 tab                                             |
| Columns Backlog → Done      | Same five columns × two boards                          |
| `iteration:@current` filter | Filter bar preset                                       |
| Workflows (7) button        | **Workflows** — creator templates, not automation count |
| Add item / Create issue     | Quick create + link to course                           |
| Estimate per column         | Sum of card estimates                                   |

---

## 10. Phased delivery

| Phase        | Scope                                                                               | PR theme                         |
| ------------ | ----------------------------------------------------------------------------------- | -------------------------------- |
| **P1 — MVP** | Nav, ongoing + next boards, CRUD cards, drag status, priority block (basic filters) | `feat/project-iteration-board`   |
| **P2**       | Workflows (3 presets + custom), reminders, link to course                           | `feat/project-creator-workflows` |
| **P3**       | Roadmap view, rollover, analytics, automation bridge event                          | `feat/project-roadmap-analytics` |

### MVP acceptance criteria

1. Creator opens **Project → Ongoing iteration** and sees five columns.
2. Creator adds card, assigns self, sets end date, moves Ready → In progress → Done.
3. **Next iteration** board holds planned cards; user moves one to current.
4. **Priority block** filters by assignee and shows start/end on cards.
5. Tenant admin on Pro plan can access; learner role receives 403.

---

## 11. Success metrics

| Metric                                               | Target (6 mo post-launch)  |
| ---------------------------------------------------- | -------------------------- |
| Weekly active creators using Project                 | 40% of Pro tenants         |
| Cards marked Done per iteration                      | ≥5 avg per active creator  |
| Workflow template adoption                           | 60% use a preset vs blank  |
| Reduction in external tool mentions (support/survey) | Qualitative                |
| Upgrade attribution “Project”                        | Track in billing analytics |

---

## 12. Open questions

1. **Scope:** One project workspace per tenant, or per **team/group**?
2. **GitHub sync:** Import/export with GitHub Projects for dev-heavy tenants?
3. **AI:** Agent suggests card breakdown from course outline (Agent Studio tie-in)?
4. **Naming:** Keep **Project** or brand as **Creator Studio** / **Content Plan**?
5. **Free tier:** Read-only board vs hard gate?

---

## 13. Decision log

| Date       | Decision                                                             | Owner               |
| ---------- | -------------------------------------------------------------------- | ------------------- |
| 2026-06-20 | BR document created from product request + GitHub Projects reference | Product/Engineering |
| 2026-06-20 | Separate from `/automations` — planning vs runtime                   | Architecture        |
| 2026-06-20 | Two iteration boards (ongoing + next) for MVP                        | Product             |

---

## 14. Related implementation (when approved)

| Area         | Path / action                                                               |
| ------------ | --------------------------------------------------------------------------- |
| Sidebar      | `skills/sidebar/SKILL.md` — add Project section                             |
| Pages        | `apps/web/pages/project/`                                                   |
| GraphQL      | `apps/api/src/schema/project/`                                              |
| DB           | `packages/db/src/project-item.ts`, `iteration.ts`, `project-workflow.ts`    |
| Personas     | Update [PERSONA_PAGES.md](../docs/PERSONA_PAGES.md) — Creator persona       |
| Business map | Update [BUSINESS_TECH_TRANSLATION.md](../docs/BUSINESS_TECH_TRANSLATION.md) |

_Update status when MVP PR opens._
