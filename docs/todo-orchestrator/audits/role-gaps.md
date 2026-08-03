# Role / org settings gaps — `T-E0-06`

> Source window: `docs/TODO-role.md` **L270–L350** (Module 1.1 Org Dashboard + start of 1.2 Org Profile)  
> Nav / IA: `packages/ui/src/Layout/DefaultNavigation.tsx` + `apps/web/lib/organization-sections.ts`  
> Pages: `apps/web/pages/organization/**`, `apps/web/pages/settings/**`  
> Date: 2026-08-03 · Product code: **none**

Status: `wired` · `partial` · `missing`

**Note:** AC asks for gap rows across **dashboard / profile / tenants / users / roles / security / SSO / SCIM**. Module specs for tenants→SCIM start after L350; those rows use module outline + live routes (same pattern as `sitemap-gaps.md`).

---

## Summary

| Area | Status | Shipped surface | Gap vs TODO |
| --- | --- | --- | --- |
| Org dashboard (1.1) | missing | `/organization` redirects to users — **no KPI dashboard** | `OrganizationDashboard` GraphQL + KPI/alerts/charts |
| Org profile (1.2) | partial | `/settings/general` (+ branding) persists tenant name/regional | Not under `/organization`; legal/business fields incomplete |
| Tenants (2.x) | partial | Super-admin **nav tenant switch** only | No tenant list / create wizard / details pages |
| Users (4.1–4.2) | wired | `/organization/users` — list, activate/suspend, pending | Invite wizard / bulk SCIM-style flows incomplete |
| Roles (4.3) | partial | `/organization/roles` — system roles + custom role create | Permission matrix “coming soon”; not full TODO matrix |
| Security (5.x) | partial | `/organization/security` hub + activity/domains/store shells | Score/MFA policies/login history not live |
| SSO (6.1) | missing | `/organization/security/saml` **disabled form** (planned) | No live IdP config API |
| SCIM (7.1) | missing | `/organization/security/scim` **requires SAML** stub | No endpoints/token |

---

## Org dashboard (1.1, L272–L336)

| Capability | Status | Evidence |
| --- | --- | --- |
| Route `/organization` overview | missing | `organization/index.tsx` → redirect `/organization/users` |
| KPI cards (tenants, security score, API health, users, automation, AI credits) | missing | — |
| Alerts / activity / revenue widgets | missing | — |
| `OrganizationDashboard` GraphQL | missing | No matching root field found in web queries |

→ `T-ROLE-01`

---

## Org profile (1.2, L337+)

| Capability | Status | Evidence |
| --- | --- | --- |
| Edit org identity | partial | `settings/general.tsx` → `patchTenantGeneral` (name, email, timezone, currency) |
| Branding assets | partial | `settings/branding.tsx` |
| Legal / business units / contacts (TODO wireframe) | missing | — |
| Profile under Organization IA | missing | Lives in **Settings**, not Organization sections |

→ `T-ROLE-02` (persist remaining fields + optional org IA link)

---

## Tenants (2.1–2.3)

| Capability | Status | Evidence |
| --- | --- | --- |
| Tenant list admin UI | missing | No `pages/**/tenants*` |
| Create tenant wizard | missing | — |
| Tenant details / lifecycle | missing | API `tenant` schema exists; no admin CRUD UI |
| Switch context | partial | `SuperAdminTenantSwitchProvider` in NavBar |

→ `T-ROLE-03`

---

## Users (4.1–4.2)

| Capability | Status | Evidence |
| --- | --- | --- |
| User list + status tabs | wired | `organization/users.tsx` + `GET_USERS` / pending |
| Activate / suspend | wired | Mutations on same page |
| Invite flow | partial | Pending/requests tabs; full invite wizard TBD |
| Nav | wired | People → Users |

→ `T-ROLE-04` (incremental — invite + matrix)

---

## Roles & permissions (4.3)

| Capability | Status | Evidence |
| --- | --- | --- |
| System roles list | partial | `organization/roles.tsx` |
| Custom roles create | partial | `GET_CUSTOM_ROLES` / `CREATE_CUSTOM_ROLE` |
| Permission matrix | missing | UI copy: custom roles “coming soon” / incomplete matrix |

→ `T-ROLE-04`

---

## Security center (5.x)

| Capability | Status | Evidence |
| --- | --- | --- |
| Security hub | partial | `organization/security/index.tsx` + section badges |
| Login / activity history | partial | `security/activity.tsx` uses **SAMPLE_LOGS** (not live) |
| Domains | planned | `security/domains.tsx` shell |
| MFA policies dashboard | missing | User-level hints only on overview |
| Security score | missing | — |

→ `T-ROLE-06`

---

## SSO (6.1)

| Capability | Status | Evidence |
| --- | --- | --- |
| SAML config page | missing | `security/saml.tsx` — disabled inputs, Planned badge |
| Live IdP save / metadata | missing | No GraphQL/REST wiring on page |
| `organization-sections` status | planned | `status: 'planned'` |

→ `T-ROLE-07` (split API→UI)

---

## SCIM (7.1)

| Capability | Status | Evidence |
| --- | --- | --- |
| SCIM page | missing | `security/scim.tsx` — blocked on SAML stub |
| Token / endpoint / sync logs | missing | — |
| `organization-sections` status | planned | `status: 'planned'` |

→ `T-ROLE-08` (split API→UI)

---

## Nav map (People + Administration)

| Nav item | Href | Role TODO area |
| --- | --- | --- |
| Users | `/organization/users` | Users |
| Roles | `/organization/roles` | Roles |
| Teams | `/organization/groups` | Groups (out of AC focus) |
| Security | `/organization/security` | Security / SSO / SCIM |
| Billing | `/organization/billing` | Billing (not in AC list) |
| Profile / Settings | `/profile`, `/settings` | Org profile adjacent |

**No** sidebar entry for Organization Dashboard or Tenant admin list.

---

## Recommended enqueue order

| Task | Why |
| --- | --- |
| `T-ROLE-01` | Org dashboard KPIs — largest empty vs Module 1.1 |
| `T-ROLE-02` | Finish/profile org identity persist |
| `T-ROLE-04` | Users invite + roles matrix slice |
| `T-ROLE-06` | Replace sample activity; MFA/security score |
| `T-ROLE-03` | Superadmin tenant list/wizard |
| `T-ROLE-07` / `08` | SSO then SCIM — split schema/UI |

Do **not** invent demo KPI numbers on dashboard stubs.

---

## Acceptance check (`T-E0-06`)

- [x] Gap table for org **dashboard**, **profile**, **tenants**, **users**, **roles**, **security**, **SSO**, **SCIM**  
- [x] No product code changes  
