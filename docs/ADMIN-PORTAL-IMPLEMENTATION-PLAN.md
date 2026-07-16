# Christian Listings Admin Portal — Product and Implementation Plan

Last updated: 15 July 2026

Status: Active implementation plan

Scope: `apps/cl-admin`, `apps/subgraph-admin`, and the admin-only contracts required in the identity, events, and classifieds subgraphs.

## Implementation progress

Stage 0 foundation was implemented on 15 July 2026:

- dedicated `Admin` identity model with active/disabled status and platform roles;
- `adminMe` identity query validating the Firebase admin claim against the active MongoDB record;
- shared server-side platform-admin role guard;
- mandatory admin-claim enforcement across the admin subgraph context;
- idempotent provisioning/reactivation and deprovisioning command;
- admin Firebase and Apollo clients with bearer token and request ID propagation;
- protected login, unauthorised state, responsive application shell, route structure, and access context;
- a separate Jira-inspired admin visual foundation with no public CL theme/component dependency.

Stage 1 marketplace moderation was implemented on 15 July 2026:

- durable, deduplicated marketplace reports and grouped moderation cases in `cl_admin`;
- reporter rate limiting, reason normalization, case priority, assignment, staff notes, and append-only audit events;
- automatic `PENDING_REVIEW` visibility after three distinct reports, without exposing report details to sellers;
- Jira-style moderation queue and case workspace with role-filtered controls and redacted reporter identities for auditors;
- internal authenticated commands for dismiss, warn, and soft removal, with listing-state restoration where appropriate;
- persistent organisation notifications for review and decision outcomes.

Stage 2 organisation verification was implemented on 15 July 2026:

- versioned verification submissions with a three-day SLA, resubmission history, secure URL validation, and reviewer assignment;
- reviewer-only document access with an audit event for every privileged document open;
- approve, reject, and needs-information decisions with templated starting reasons and explicit trust-tier selection;
- authenticated identity-service commands that update the canonical badge/status and create persistent organisation notifications;
- a dedicated verification queue and review workspace with role-scoped read and decision access.

Stage 3 dashboard, directories, and account operations was implemented on 15 July 2026:

- live operational dashboard counts for moderation, verification SLA pressure, and seven-day throughput;
- searchable, paginated directories for users, organisations, events, jobs, and marketplace listings;
- audited warning, suspension, and reactivation actions, including Firebase disablement and session revocation for suspended users;
- role-scoped private identity access with mandatory purpose capture and audit history;
- recurring-event cancellation/restoration with explicit occurrence-versus-series scope and organisation notification.

Stage 4 audit, templates, and curation was implemented on 15 July 2026:

- a filterable append-only audit explorer with actor roles, result, route, request, IP, and user-agent context for new privileged operations;
- permission-controlled asynchronous CSV exports limited to 31 days and 10,000 rows, protected against spreadsheet formulas, watermarked with requester details, and expired after 24 hours;
- a versioned reason/message template library with locale, public language, internal guidance, active-version control, and history;
- regional/global featured placements with canonical target validation, schedules, rank-conflict prevention, pause/resume, reorder, duplicate, and desktop/mobile preview;
- personal saved queue views and persistent assignment, SLA, escalation, and failed-action notifications with read/unread state;
- a read-only system health workspace covering subgraphs, MongoDB, Firebase, media/email configuration, version, and check latency.

Stage 5 launch hardening was implemented on 15 July 2026:

- production Router configuration disables introspection, Sandbox, and detailed subgraph errors;
- strict admin origin checks, security headers, mutation throttling, stack-trace suppression, and hardened static hosting headers;
- durable moderation command records and automatic restart/partial-failure reconciliation, surfaced in System Health;
- restart-safe audit export processing and expired-job cleanup;
- keyboard route focus, skip navigation, notification Escape handling, visible focus, and reduced-motion support;
- scoped backup/restore scripts, release and incident guidance, and a realistic operator acceptance checklist;
- deterministic role, rate-limit, concurrency, export, verification, and intake coverage plus index-backed operational queues.

Provision or update an administrator with:

```powershell
$env:ADMIN_INITIAL_PASSWORD='<minimum 12 characters for a new Firebase user>'
npm run admin:provision -- --email admin@example.com --name "Admin Name" --roles SUPER_ADMIN
```

Disable an administrator and revoke their sessions with:

```powershell
npm run admin:provision -- --email admin@example.com --disable
```

`MONGO_URI` and `FIREBASE_SERVICE_ACCOUNT_JSON` must be present for both commands. The initial-password variable is required only when the Firebase user does not exist. Standard Stage 6 appeals is the next feature slice after operator sign-off.

## 1. Purpose

The admin portal is the operational workspace for Christian Listings staff. It must let a trusted team review risk, verify organisations, manage platform entities, curate discovery surfaces, investigate incidents, and leave a complete audit trail.

The portal must not look or behave like the public Christian Listings site. The public site is warm, editorial, and community-facing. Admin should be a compact, neutral, work-oriented application similar in spirit to Jira: persistent navigation, information-dense tables, explicit status, keyboard-friendly controls, predictable drawers, and clear work queues.

The first delivery remains Phase 1 / Basic. Standard-tier capabilities are planned so the data model does not block them, but they should not be implemented before the Basic admin workflows are complete and signed off.

## 2. Outcomes and launch definition

Admin Phase 1 is launch-ready when authorised staff can:

1. Sign in through a dedicated admin-only route and be rejected if the Firebase account does not carry an admin claim.
2. See a reliable dashboard of pending moderation, verification, and platform activity.
3. Receive every marketplace report submitted from the CL application as a durable moderation case.
4. Review the reported content and relevant actor/context without switching to the database.
5. dismiss, warn, remove, temporarily suspend, or permanently ban where the selected entity supports that action.
6. Review organisation verification submissions, approve or reject them with a reason, and update the CL organisation notification centre.
7. Search and inspect users, organisations, events, jobs, and marketplace listings.
8. View an immutable audit trail of every sensitive admin action and export it.
9. Operate safely with role-based permissions, confirmation steps, reason requirements, and server-side enforcement.
10. Use a responsive, accessible interface with useful loading, empty, error, and stale-data states.

## 3. Repository audit and current baseline

### Admin frontend: `apps/cl-admin`

Current state:

- React 18, TypeScript, Webpack 5, Tailwind CSS; served on port 3001.
- The application contains one placeholder component with inline styles.
- Firebase initialisation is commented out and exports `null`.
- There is no Apollo Client, auth state, router, route protection, layout, generated operations, design system, or feature page structure.
- The existing test checks only the scaffold.

Conclusion: treat this as a new application built inside the existing Nx project, not as an extension of a functioning admin UI.

### Admin backend: `apps/subgraph-admin`

Current state:

- Fastify + Apollo Server subgraph on port 4004 using `cl_admin` through `createMongoConnection`.
- Authentication is mandatory at the HTTP layer, and `/health` is correctly exempt.
- The GraphQL schema sketches moderation reports, verification items, audit logs, rules, and platform stats.
- `resolvers` is currently empty and there are no Mongoose models.
- The schema does not yet enforce `accountType: admin`; a valid non-admin Firebase token can currently reach GraphQL execution.
- Several schema types conflict with the source-of-truth models in other subgraphs. For example, organisation verification state lives in identity, while the admin schema independently models a verification queue item.

Conclusion: retain the admin service as the owner of operational workflow data, but replace the placeholder schema with contracts aligned to service ownership.

### Identity and admin identity gaps

- Architecture documentation says admins are manually provisioned into an `admins` collection in `cl_identity` with an `accountType: admin` custom claim.
- No Admin Mongoose model, admin query, or provisioning script currently exists.
- The shared User model contains a `super_admin` role even though the ADR says platform admins are a separate account type. This needs consolidation before admin RBAC is implemented.

Decision: follow ADR 0008. Platform administrators are separate admin principals, not community users with an elevated user role. Add a dedicated admin model and provisioning workflow; do not reuse organisation roles.

### Existing CL handoffs that need admin intervention

| CL workflow | Current state | Required admin workflow | Priority |
|---|---|---|---:|
| Marketplace listing report | `reportListing` increments `flagCount` and notifies the organisation, but creates no `cl_admin` report record | Create a durable report/case, deduplicate abuse, aggregate reports, prioritise the queue, review and resolve | P0 |
| Three-report threshold | `PENDING_REVIEW` exists on listing status, but the report resolver does not set it and public item-by-ID reads are not consistently status-gated | At threshold, hide content pending review; allow admin restore/remove; prevent public status bypass | P0 |
| Organisation verification submission | Identity stores document URLs and moves status to `PENDING_REVIEW`; documents are currently deferred | Queue identity submissions, show documents/metadata, approve/reject with reason/tier, notify organisation | P0 after upload is available; build the workflow contract now |
| Organisation verification updates | Organisation notifications already support `VERIFICATION_UPDATE` | Admin decision must create/update the notification and preserve read/unread state | P0 |
| Organisation self-deactivation | Organisation can hide and restore itself; no admin action required normally | Show lifecycle state; allow override only for policy enforcement; distinguish voluntary deactivation from admin suspension | P1 |
| Listing-reported organisation notification | Notification is generated at report time with the reporter's free-text reason | Replace with a neutral acknowledgement; do not expose reporter identity or unreviewed sensitive text | P0 |
| Events, jobs, organisations, users | No public report entry points yet | Provide admin content explorer now; add report sources later without changing case model | P1 |
| Buyer–seller messages | Messaging exists; no report/block/escalation workflow | Add message/thread reporting and restricted evidence access in Standard phase | Future |
| Member profile/privacy | Member editing exists | Admin access should be purpose-limited; private fields visible only when necessary for an investigation | P1 |
| Job applications | Applicant data and statuses exist | Admin should not routinely view application contents; expose only during a documented safety/support incident | P1 restricted |
| Recurring events | Series and occurrences exist | Admin action must declare occurrence-only versus entire-series scope | P1 |
| Saved items/follows/RSVPs | User engagement state exists | Aggregate analytics only; no routine per-user surveillance | P1 analytics |
| Highlights/featured content | Blueprint says admin curated; no backend exists | Add manual curation, ordering, scheduling, and regional placement | P1 Basic |
| Promotions | Models contain promoted fields but no full operational workflow | View/expire/manual feature in P1; pricing, payment and approval workflow in Standard | P1/Future |
| Information board | Not implemented in CL | Defer admin moderation until organisation/public feature exists | Future dependency |
| Transactional emails | Not implemented | Add template catalogue, delivery log and retry visibility when provider is selected | Future dependency |

## 4. Product principles

1. **Queue first.** The landing experience answers “what needs attention now?” rather than showing decorative charts.
2. **Context before action.** Every decision surface shows content, owner, report history, prior actions, and policy guidance together.
3. **Safe by default.** Destructive actions require a reason, confirmation, and appropriate permission. High-risk actions are never optimistic UI updates.
4. **One source of truth.** Domain records remain in their owning subgraphs. Admin stores workflow and audit data, not duplicate content documents.
5. **Trace everything sensitive.** Actions, actor, target, before/after state, reason, request ID, and timestamp are immutable audit data.
6. **Protect private data.** The interface reveals only the minimum information needed for the current role and case.
7. **Fast repetitive work.** Saved views, filters, bulk-safe actions, keyboard focus, and detail drawers minimise navigation.
8. **Explain automation.** Automated flags show which rule fired and why. Automation may hide pending review but cannot permanently ban without a human decision.

## 5. Admin roles and permissions

Use dedicated platform roles stored on the Admin document and mirrored in Firebase custom claims.

| Role | Intended access |
|---|---|
| `SUPER_ADMIN` | Full access, admin provisioning, roles, system settings, permanent bans and policy configuration |
| `TRUST_SAFETY` | Moderation queues, cases, warnings, removals, temporary suspensions and appeals |
| `VERIFICATION_REVIEWER` | Organisation verification queue, document review, approve/reject, verification templates |
| `CONTENT_MANAGER` | Content explorer, highlights, featured placements, announcements and non-punitive content actions |
| `SUPPORT_AGENT` | User/org lookup, support notes, limited account actions; no private verification documents by default |
| `ANALYST` | Read-only dashboards, aggregate analytics and exports with personal data minimised |
| `AUDITOR` | Read-only cases and immutable audit trail; no operational mutations |

Rules:

- A staff member may hold multiple roles.
- Permissions are resolved server-side; hiding a button is not authorization.
- Permanent bans, admin-role changes, audit exports with personal data, and destructive bulk actions require `SUPER_ADMIN`.
- Verification documents are limited to `VERIFICATION_REVIEWER` and `SUPER_ADMIN`.
- Support agents need an explicit case reference to reveal protected fields.
- Require recent authentication for permanent bans, admin management, and security settings.
- Phase 1 may launch with `SUPER_ADMIN`, `TRUST_SAFETY`, `VERIFICATION_REVIEWER`, and read-only `ANALYST`; the schema should support the complete matrix.

## 6. Information architecture and route map

### Application shell

- `/login` — dedicated staff sign-in.
- `/unauthorised` — valid Firebase account without admin access.
- Authenticated shell — left sidebar, top search/command area, notifications, current admin menu.
- Global command/search palette — jump to case, user, organisation, event, job, listing, or admin page.

### Work

- `/` or `/overview` — operations overview and “My work”.
- `/moderation` — combined moderation queue.
- `/moderation/:caseId` — full case workspace; route-backed so work can be linked and resumed.
- `/verifications` — organisation verification queue.
- `/verifications/:requestId` — verification review workspace.
- `/appeals` — Standard phase; reserve navigation and data model, hide until enabled.

### Directory

- `/users` and `/users/:id`
- `/organisations` and `/organisations/:id`
- `/content/events` and `/content/events/:id`
- `/content/jobs` and `/content/jobs/:id`
- `/content/listings` and `/content/listings/:id`
- `/messages/:threadId` — restricted investigation view, only after reporting is implemented.

### Platform

- `/curation/highlights` — featured strip entries, rank, region and schedule.
- `/promotions` — active/expired placements and manual controls; full approvals later.
- `/analytics` — platform health and module activity.
- `/audit` — immutable action log and export.
- `/templates` — warning, rejection, suspension and notification reason templates.
- `/rules` — automated flag rules; Standard phase.
- `/settings` — portal defaults, retention references and feature configuration.
- `/admins` — staff accounts and roles; `SUPER_ADMIN` only.
- `/system` — service health, queue/provider status, failed jobs and deployment version; read-only operations surface.

Navigation should display count badges only for actionable queues. Sidebar items are permission-filtered, but direct routes still enforce server authorization.

## 7. Core user flows

### 7.1 Admin authentication and session flow

1. Staff signs in with Firebase email/password initially; SSO/MFA can be added without changing application authorization.
2. Client reads the ID-token claim and requires `accountType: admin`.
3. Client calls `adminMe`; backend independently validates the claim and active Admin record.
4. Disabled, unprovisioned, or non-admin accounts are signed out and sent to `/unauthorised` without exposing portal data.
5. Successful login restores the intended admin route.
6. Token refresh, expiry, and revocation produce a clear session-expired state and clear the Apollo cache.
7. All admin GraphQL operations carry a request ID for audit correlation.

Before building the UI, implement:

- `Admin` model in identity (`firebaseUid`, `email`, `name`, `roles`, `status`, `lastLoginAt`, timestamps).
- Idempotent CLI provisioning/deprovisioning script using Firebase Admin SDK and `cl_identity`.
- `adminMe` query and backend authorization helpers.
- A resolver guard in every admin operation; mandatory Firebase authentication alone is insufficient.

### 7.2 Operations overview

The home page should prioritise work:

- Assigned to me, unassigned, approaching SLA, and overdue cases.
- Pending verifications with oldest age.
- Reports by severity and module.
- Automated threshold actions awaiting review.
- Recent sensitive admin actions.
- Platform trend cards: new users, active events, active jobs, available listings, RSVPs, applications, report rate, verification turnaround.
- Service health and failed background work summary.

Metrics need a time range and comparison period. Counts must link to the filtered underlying list. Avoid vanity metrics without an operational next step.

### 7.3 Listing report and moderation case

Submission:

1. Signed-in CL member reports a listing using a controlled reason code plus optional details.
2. Classifieds validates that the listing exists and prevents the owner from reporting their own content.
3. A durable report is created in `cl_admin` with reporter ID, target reference, reason code, redacted detail, source, and timestamp.
4. Rate limits and a reporter/target deduplication window prevent repeated submissions.
5. The report is grouped into an open case for the same target; raw reports remain immutable child records.
6. At three distinct credible reporters, classifieds moves the listing to `PENDING_REVIEW`. Public collection and detail queries hide it, while its owner and admins can still inspect it.
7. The listing owner receives a neutral “listing is under review” notification only when the threshold/action changes visibility, not every time somebody reports it.

Review workspace:

- Header: severity, status, age/SLA, assignee, report count, target state.
- Content preview with “open public page” and a snapshot captured when the case opened.
- Owner summary and prior moderation history.
- Reporter summary with identities protected from the owner.
- Timeline of reports, flags, notes, assignments, and actions.
- Internal notes and @mentions; never shown to the content owner.
- Policy/reason template selector.
- Actions: dismiss/restore, warn, remove, suspend owner temporarily, ban owner, escalate.

Resolution:

- Dismiss restores the previous valid listing status if it was auto-hidden.
- Warn leaves content visible unless the reviewer explicitly keeps it hidden.
- Remove sets a moderation removal state; do not hard-delete content needed for appeal/audit.
- Suspend and ban apply to the actor/account, not merely the listing. Duration is mandatory for suspension.
- Each action creates an immutable audit event and an owner notification. If outbound email is enabled later, delivery is tracked separately.
- A resolved case records resolution code, public-facing reason, internal note, resolver, and timestamp.

### 7.4 Organisation verification

1. Organisation submits required metadata and documents through identity; status becomes `PENDING_REVIEW`.
2. Admin queue reads the identity-owned submission and maintains an admin workflow projection for assignment, SLA, notes, and decision history.
3. Reviewer sees organisation identity, official details, registration number, region, account history, duplicate indicators, submitted documents, and prior attempts.
4. Reviewer may request more information, approve, or reject. Approval requires a verification tier; rejection/request-more-info requires a templated reason plus optional detail.
5. Identity updates the canonical `verificationStatus` and `verificationTier`.
6. Organisation receives a persistent `VERIFICATION_UPDATE` notification linked to settings/onboarding.
7. Approved cards and profiles display the derived badge. Rejected organisations retain their profile but can correct and resubmit unless blocked by policy.
8. Decision and document access are audited separately.

Required status model:

`PENDING_SUBMISSION → PENDING_REVIEW → NEEDS_INFORMATION | VERIFIED | REJECTED`

Resubmission returns `NEEDS_INFORMATION` or `REJECTED` to `PENDING_REVIEW` while retaining attempt history. Do not overwrite previous review evidence.

Document upload remains dependent on the separate Cloudinary feature. The admin review UI can be built against URL metadata and mock documents, but production approval must not launch until secure upload, signed access, file scanning, and retention policy are defined.

### 7.5 User and organisation management

Search by exact ID, email, name, region, status, verification state, creation date, or risk state. Detail pages use tabs for overview, owned content, activity summary, cases/actions, and audit.

Supported Phase 1/P1 actions:

- Warn account.
- Temporarily restrict creation or interaction capabilities.
- Suspend/reactivate account.
- Permanently ban (`SUPER_ADMIN`).
- Reset organisation verification to review when evidence becomes invalid.
- Distinguish voluntary organisation deactivation from policy suspension.
- End all sessions/revoke Firebase refresh tokens for account security incidents.

Do not hard-delete operational records from the normal UI. Privacy deletion requests need a separate, logged erasure workflow that anonymises where retention permits.

### 7.6 Content explorer

Provide consistent searchable tables for events, event series/occurrences, jobs, and listings. Each supports owner, region, status, date, promoted state, report count, and last update filters.

- Event moderation must specify one occurrence or the entire recurring series.
- Job pages show deadline and archived state, but application bodies remain hidden unless an authorised investigation explicitly opens them.
- Listing pages show price, donation state, seller, flag count, status, and promotion state.
- Direct preview must accurately represent whether the public site can currently see the content.

### 7.7 Audit log

Every sensitive read or write should create or correlate with an audit event. At minimum record:

- immutable ID and timestamp;
- admin ID, roles at action time, IP/user-agent where policy permits;
- action type and target type/ID;
- case/request ID;
- reason code and supplied explanation;
- redacted before/after state;
- request/correlation ID and result (`SUCCESS` or `FAILED`);
- originating UI route or system automation.

Audit records are append-only. Application resolvers expose no update/delete operation. CSV export is permission-controlled, date-limited, watermarked with requester details, and itself audited.

### 7.8 Curation and highlights

The Basic blueprint requires an admin-maintained highlights strip. Admins should be able to:

- select an event, job, listing, organisation, or platform announcement;
- target global or selected regions;
- set start/end time, rank, label, image/alt text, and destination;
- preview desktop/mobile cards;
- schedule, pause, reorder, expire, and duplicate entries;
- prevent overlapping rank conflicts and broken targets;
- see who changed a placement and when.

Manual feature placement is not the same as paid promotion. Store `placementSource: EDITORIAL | PROMOTION` so paid workflows can be added later without corrupting editorial curation.

### 7.9 Generic operational features worth including

These features are useful for a platform of this type and should be included without copying public-site concerns:

- **Saved queue views:** personal filters such as “unassigned high priority” or “my verification queue”.
- **Assignment and SLA:** owner, due time, escalation status, and workload view.
- **Internal notes and mentions:** staff-only collaboration attached to a case or entity.
- **Reason/template library:** consistent warning, rejection, removal and suspension language with version history.
- **Admin notifications:** assignments, mentions, approaching SLA, escalations, and failed actions; persistent read/unread state.
- **System status:** subgraph health, background jobs, email/media provider state, last successful scheduled task, version/commit identifier.
- **Feature flags/config:** view runtime flags and safe settings; production mutation rights limited to `SUPER_ADMIN` and always audited.
- **Data export centre:** async export status, expiry, requester, filters and audit; never generate unbounded browser-side exports.
- **Retention/privacy tools:** legal hold marker, erasure request tracking, and data-access log.
- **Support timeline:** compact view of previous cases and staff contacts without exposing unrelated private content.
- **Bulk actions:** Phase 1 only permits low-risk bulk assignment/tagging. Bulk removal, suspension, or ban remains disabled until dual-control is designed.

## 8. Visual and interaction design direction

### Character

Use a neutral, structured enterprise workspace rather than the CL brand presentation. “Jira-like” means compact and task-oriented, not a visual clone.

- Sans-serif UI throughout; no public-site serif display headings.
- Dense but readable information hierarchy.
- Cool neutral surfaces, restrained blue primary action, semantic status colours.
- Square-to-small-radius controls; avoid large rounded marketing cards.
- Tables, split views, drawers, tabs, badges, inline filters, and compact forms.
- Minimal illustration and decoration.

### Proposed foundations

| Token | Direction |
|---|---|
| Page background | cool grey, approximately `#F7F8FA` |
| Navigation | deep navy/charcoal, approximately `#172B4D` |
| Surface | white |
| Border | cool grey, approximately `#DFE1E6` |
| Primary | accessible blue, approximately `#0C66E4` |
| Text | dark slate, approximately `#172B4D` |
| Muted text | slate grey, approximately `#626F86` |
| Success | green used only for approved/resolved states |
| Warning | amber for SLA/needs-attention states |
| Danger | red for destructive actions and policy risk |
| Spacing | 4px base scale; 8/12px control gaps; 16/24px sections |
| Radius | 3–6px controls, 8px panels; pills only for statuses/counts |
| Density | 36–40px table rows by default, with comfortable density option later |

Final colours must be checked for WCAG AA contrast; these values are design direction, not a substitute for a token audit.

### Shell layout

- 240px collapsible left navigation with grouped sections.
- 48–56px top bar with breadcrumbs, command search, admin alerts, help, and account menu.
- Main content uses full available width with a sensible maximum only for forms.
- List pages use sticky filter/action bar and sticky table header.
- Case pages use a two-column workspace: primary evidence/timeline plus sticky action/context rail.
- Detail drawers may support quick triage, but any state that must be linked, refreshed, or resumed gets its own route.

### Required component set

- App shell, sidebar, top bar, breadcrumbs, command palette.
- Data table with sorting, pagination, column visibility, selection, loading skeleton and empty/error states.
- Filter bar with URL-synchronised filters and saved views.
- Status badge and severity indicator.
- KPI/metric card with comparison and destination.
- Timeline/audit event.
- Assignee picker and SLA indicator.
- Detail drawer and route-backed case workspace.
- Confirmation dialog with reason and optional typed confirmation for high-risk actions.
- Toasts for transient outcomes; inline banners for persistent/stale/degraded state.
- Tabs, pagination, export job status, document viewer, redaction indicator.

### Responsive and accessibility behaviour

- Desktop is primary because this is an operations tool, but tablet remains fully functional.
- On narrow screens, sidebar collapses, tables become horizontally scrollable or priority-column lists, and action rails move below content.
- Do not permit permanent ban, admin-role changes, or verification-document review on layouts too narrow to show required context; present an explicit “complete on desktop” message if necessary.
- All queue work is keyboard reachable with visible focus.
- Drawers/dialogs trap focus, support Escape, and restore focus.
- Status is never communicated by colour alone.
- Tables use semantic headers/captions and announce sort changes.
- Charts always include accessible summaries and underlying data links.
- Respect reduced motion; use animation only to clarify state transitions.

## 9. Technical architecture

### 9.1 Service ownership

| Data | Owning service/database | Admin responsibility |
|---|---|---|
| Admin principal | identity / `cl_identity` | Provisioning, active state and roles |
| Users and organisations | identity / `cl_identity` | Query federated entity; issue authorised domain commands |
| Verification canonical status/doc metadata | identity / `cl_identity` | Review workflow references it; decision command updates identity |
| Events, series and RSVPs | events / `cl_events` | Query/preview; issue moderation command with occurrence/series scope |
| Jobs, applications, listings and messages | classifieds / `cl_classifieds` | Query/preview; issue content/account-safe commands |
| Reports, cases, assignments, notes | admin / `cl_admin` | Canonical workflow owner |
| Audit events | admin / `cl_admin` | Append-only owner |
| Templates, flag rules, placements | admin / `cl_admin` initially | Operational/configuration owner; references domain targets |

Subgraphs must never import another app's `src` or Mongoose models. Cross-service reads are federated. Cross-service state changes use explicit admin-only commands in the owning subgraph or a documented internal service call. Do not let the admin frontend directly coordinate multi-step destructive operations because a partial failure could create an unaudited or inconsistent outcome.

### 9.2 Command and consistency pattern

For Phase 1:

1. Admin client calls a command mutation owned by `subgraph-admin`, such as `resolveModerationCase`.
2. Admin service validates role, case state, reason, and idempotency key.
3. Admin service calls a narrow internal command endpoint/mutation on the owning subgraph using service authentication and correlation ID.
4. Owning subgraph validates the command, updates canonical domain state, and returns before/after version information.
5. Admin service appends the action/audit event and resolves the case.
6. If step 3 succeeds but audit persistence fails, record an outbox/reconciliation item and alert operations; never silently report success.

For Phase 2, replace direct internal calls with an outbox/message-bus workflow. Preserve command names, idempotency keys, correlation IDs, and action state so the migration does not change UI contracts.

### 9.3 Proposed admin persistence models

`ModerationReport`

- target type/ID and owning service;
- reporter Firebase UID or user ID;
- controlled reason code and redacted details;
- source (`USER_REPORT`, `SYSTEM_RULE`, `ADMIN_FLAG`);
- evidence snapshot reference;
- reporter/target dedupe key;
- created timestamp; immutable after ingestion.

`ModerationCase`

- target reference, severity, priority, status;
- report IDs/count and rule flags;
- assignee, tags, SLA due time;
- target status before auto-action;
- resolution and timestamps;
- optimistic concurrency/version field.

`CaseNote`

- case ID, author admin ID, body, mentions, created/edited metadata;
- edit history retained; soft deletion only with audit event.

`AdminAction`

- case/request ID, target, action, reason code/detail;
- requested/executed/failed state;
- idempotency/correlation IDs;
- canonical before/after state and failure detail.

`AuditEvent`

- append-only security and operational record described in section 7.7.

`VerificationReview`

- organisation ID and submission attempt/version;
- assignment/SLA, reviewer, notes, decision, reason, tier;
- identity command result and timestamps;
- document-access events remain separate audit entries.

`AdminTemplate`

- type, title, public message, internal guidance, locale, version, active state.

`FeaturedPlacement`

- target reference or announcement content;
- region scope, rank, schedule, status, source, label and creative metadata.

`SavedAdminView` and `AdminNotification`

- owner admin, module, filters/preferences;
- notification type, target route, read timestamp and dedupe key.

Indexes must support status/priority/SLA queues, target case lookup, assignee workload, audit time ranges, and dedupe/idempotency uniqueness.

### 9.4 GraphQL contract direction

Replace offset-like list patterns with cursor connections and structured filters. Core operations should include:

- `adminMe`
- `adminOverview(range, region)`
- `moderationCases(filter, sort, first, after)`
- `moderationCase(id)`
- `assignModerationCase`, `addCaseNote`, `resolveModerationCase`
- `verificationReviews(filter, sort, first, after)`
- `verificationReview(id)`, `assignVerificationReview`, `decideVerification`
- `adminUsers`, `adminUser`, `adminOrganisations`, `adminOrganisation`
- `adminEvents`, `adminJobs`, `adminMarketplaceItems`
- `auditEvents(filter, first, after)`, `requestAuditExport`
- `featuredPlacements`, `create/update/pause/reorderFeaturedPlacement`
- `adminNotifications`, `markAdminNotificationRead`
- `adminTemplates` and template mutations

Use typed action inputs rather than strings:

- target union/reference;
- reason code plus bounded detail;
- action enum;
- suspension expiry when relevant;
- recurring-event scope when relevant;
- expected entity/case version;
- client-generated idempotency key.

After every `.graphql` edit, run repository codegen and supergraph composition as required by project instructions.

### 9.5 Frontend structure

Recommended feature-oriented structure:

```text
apps/cl-admin/src/
  app/
    App.tsx
    router.tsx
    providers.tsx
  auth/
  apollo/
  components/
    layout/
    data-table/
    feedback/
    forms/
  features/
    overview/
    moderation/
    verification/
    directory/
    curation/
    analytics/
    audit/
    settings/
  graphql/
  generated/
  hooks/
  lib/
  store/
  styles/
```

Implementation choices:

- React Router for route-backed lists, details and drawers.
- Apollo Client with Firebase token link, correlation header, typed generated operations, explicit pagination policies, and error handling.
- Zustand only for local shell/session preferences; server data remains in Apollo.
- URL is the source of truth for filters, sort, page cursor where practical, selected saved view, and detail route.
- Build a small admin token/component layer in `cl-admin`; do not import public CL components or copy public theme tokens.
- Avoid adding a heavy component framework until the core table, dialog, form, and accessibility needs have been evaluated. If one is selected, wrap it behind admin components.

### 9.6 Security, privacy and abuse controls

- Validate `accountType: admin`, active Admin record, and granular permission on every resolver.
- Never trust role information supplied by the client.
- Provision admins manually; no public sign-up or invite link in Phase 1.
- Require MFA before production launch if supported by the selected Firebase plan; otherwise document this launch risk.
- Apply short session/re-auth policy for high-risk operations.
- Rate-limit admin mutations and report intake separately.
- Use controlled report/reason codes; sanitise all free text.
- Verification document URLs must be signed, short-lived, non-indexable, and never written to application logs.
- Redact tokens, contact details, document URLs and application bodies from errors/audits.
- Add CSP, frame protection, strict CORS for the actual admin hosting domain, and production-disabled GraphQL introspection/sandbox where appropriate.
- Do not expose reporter identity to reported users/organisations.
- Separate internal note from public-facing reason in every action.
- Revoke sessions when an admin is disabled or privileges change.
- Record privileged reads of verification documents and restricted personal data.

### 9.7 Observability and reliability

- Propagate `x-request-id` through Router and subgraphs; surface it in error UI for support.
- Structured logs include service, operation, admin ID, case ID, action ID and correlation ID without sensitive content.
- Metrics: queue depth/age, action success/failure, resolution time, verification turnaround, report rate, auto-hide count, false-positive restore rate and export failures.
- Alerts: unresolved command reconciliation, queue SLA breach, health failure, repeated provider failure, audit persistence failure.
- Health page distinguishes live service health from business dependencies such as MongoDB, Firebase, Cloudinary and transactional email.
- Background jobs use idempotency, retry with backoff, dead-letter/reconciliation visibility, and manual safe retry.

## 10. Delivery plan

### Stage 0 — Contract cleanup and foundations (P0)

1. Resolve admin identity architecture: dedicated Admin model, roles, provisioning script and `adminMe`.
2. Add shared admin authorization helpers and tests; reject valid non-admin tokens.
3. Initialise admin Firebase and Apollo clients, session store, providers, router and protected shell.
4. Establish admin-only design tokens and core accessible components.
5. Replace conflicting placeholder admin schema types with source-aligned contracts.
6. Add request/correlation ID handling.

Exit criteria: provisioned admin can sign in and reach an empty protected shell; non-admin accounts cannot execute any admin query.

### Stage 1 — Marketplace moderation vertical slice (P0)

1. Implement report/case/action/audit Mongoose models in `cl_admin`.
2. Wire `reportListing` to durable report intake and deduplication.
3. Enforce three-distinct-report threshold and consistent public visibility.
4. Build moderation queue, filters, detail workspace, assignment, notes and actions.
5. Add classifieds internal moderation commands with idempotency and tests.
6. Add neutral organisation notifications and owner-facing decision notices.
7. Implement append-only audit timeline.

Exit criteria: report submission through the CL UI reaches admin, can be actioned end-to-end, updates the canonical listing state, notifies the owner appropriately, and leaves a complete audit record.

### Stage 2 — Organisation verification (P0/Basic)

1. Finalise secure verification upload dependency and submission versioning.
2. Build queue, review workspace, document access audit, assignment and SLA.
3. Add identity decision command, tier selection, needs-information path and resubmission history.
4. Connect persistent CL verification notifications.
5. Add templated reasons and reviewer tests.

Exit criteria: a submitted organisation can be approved/rejected/requested for more information, the badge/status updates correctly, and the organisation sees the result.

### Stage 3 — Dashboard, directories and account operations (Basic/P1)

1. Build operational overview from real queue/analytics data.
2. Add searchable user, organisation, event, job and listing directories.
3. Add safe account warning/suspension/reactivation and session revocation.
4. Add recurring-event scope handling.
5. Add role-scoped private-data access and access auditing.

Exit criteria: staff can investigate platform entities and apply supported actions without database access.

### Stage 4 — Audit, templates and curation (Basic/P1)

1. Complete audit explorer and async export.
2. Add versioned reason/message templates.
3. Implement regional/scheduled highlights and featured placement management.
4. Add admin notification centre, saved views and workload indicators.
5. Add read-only system health page.

Exit criteria: all Basic blueprint admin capabilities—including audit export, analytics overview, and highlights curation—are operational.

### Stage 5 — Hardening and launch readiness

1. Accessibility audit and keyboard workflow testing.
2. Security review, role matrix tests, sensitive-data/log review and Firebase admin revocation test.
3. Cross-subgraph integration, concurrency, idempotency, retry and reconciliation tests.
4. Performance test large queues and directory searches; validate indexes.
5. Production CORS/CSP, error monitoring, backup/restore and runbooks.
6. Seed deterministic admin/report/verification data for local testing.
7. Admin operator acceptance test with realistic cases.

Exit criteria: production configuration is hardened, partial cross-service failures reconcile safely, recovery procedures are tested, automated release gates pass, and operators sign off the acceptance checklist.

### Stage 6 — Appeals and senior review (Standard)

1. Add appeal submission for supported moderation and account decisions with bounded evidence and abuse controls.
2. Build a dedicated queue, assignment/SLA, original-decision context, and conflict-safe senior review.
3. Enforce reviewer separation where practical and require senior permissions for uphold/modify/overturn.
4. Update canonical content/account state, notify the appellant, and retain the complete append-only history.

### Stage 7 — Automated safety rules (Standard)

1. Add versioned, testable rules with region/content scope, dry-run mode, thresholds, and human-readable explanations.
2. Generate signals and reversible pending-review actions; automation cannot permanently ban.
3. Add rule performance, false-positive restoration, override, rollback, and audit reporting.

### Stage 8 — Message and thread reporting (Standard)

1. Add participant report/block entry points and immutable, minimised evidence snapshots.
2. Restrict message evidence access to an assigned safety case with purpose and access auditing.
3. Support thread/user actions, escalation, retention, redaction, and participant-safe notifications without general staff surveillance.

### Stage 9 — Advanced accounts and privacy operations (Standard)

1. Add privacy request intake for access, correction, deletion, restriction, and export.
2. Build identity verification, approval, legal-hold/retention checks, fulfilment jobs, delivery expiry, and audit history.
3. Add advanced account investigation and recovery controls with recent authentication and least-privilege access.

### Stage 10 — AI-assisted listing risk signals (Standard)

1. Introduce advisory, explainable signals behind feature flags and shadow evaluation.
2. Require human decisions for enforcement and prohibit autonomous permanent action.
3. Measure precision, false positives, regional/language bias, reviewer overrides, model version, and rollback readiness.

### Stage 11 — Expanded report sources (Standard)

1. Extend the common report/case contract to events, jobs, organisations, and users.
2. Add source-owned visibility/action commands, evidence snapshots, deduplication, thresholds, and notifications.
3. Preserve target-specific action scope, including recurring event occurrence versus series.

### Stage 12 — Information-board moderation (dependency-gated Standard)

Implement reporting, queue filters, evidence, and canonical actions only after the public information-board feature and ownership model exist.

### Stage 13 — Transactional email operations (Standard)

1. Add a versioned email template catalogue with preview, test-send, locale, and approval controls.
2. Store provider message IDs and redacted delivery events; expose status, bounce/complaint suppression, and bounded search.
3. Add idempotent retry, backoff, dead-letter visibility, and safe operator retry after an email provider is selected.

Explicitly deferred from the approved Standard scope: promotion pricing/payments and enhanced charity registry integrations.

## 11. Testing strategy

### Backend

- Unit tests for every permission/action/status transition.
- Resolver tests for unauthenticated, wrong account type, inactive admin and insufficient role.
- Model/index tests for report dedupe, one open case per target, idempotent action commands and append-only audit.
- Contract tests for admin-to-owning-subgraph commands.
- Integration tests covering report → threshold hide → review → restore/remove.
- Verification submission → decision → identity badge → organisation notification integration test.
- Concurrent reviewer test using expected version to prevent double resolution.
- Failure-injection tests for domain update success plus audit failure/reconciliation.

### Frontend

- Route protection and session expiry tests.
- Queue filter URL/pagination tests.
- Permission-driven action rendering plus server-denial handling.
- Loading, empty, error, stale, partial-data and retry states.
- Confirmation/reason validation and focus restoration.
- Accessibility tests for navigation, tables, drawers, dialogs, status and charts.
- E2E smoke paths for login, moderation, verification, audit and curation.

### Release gates

- `nx affected --target=lint`
- relevant unit/integration tests
- production builds for `cl-admin` and affected subgraphs
- GraphQL codegen and supergraph composition after schema changes
- no unresolved schema composition warnings
- no P0 accessibility/security defects

## 12. Initial backlog and implementation order

| Order | Epic | Dependency | Tier |
|---:|---|---|---|
| 1 | Admin identity, provisioning and RBAC | Firebase/identity decision | Basic foundation |
| 2 | Admin app shell and design system | Epic 1 | Basic foundation |
| 3 | Report ingestion and moderation models | Admin auth | Basic |
| 4 | Marketplace status/visibility safety | Report ingestion | Basic launch blocker |
| 5 | Moderation queue and case workspace | Epics 2–4 | Basic |
| 6 | Admin actions, notifications and immutable audit | Moderation workspace | Basic |
| 7 | Verification workflow contracts/UI | Secure document upload | Basic |
| 8 | Operations overview and analytics | Real workflow data | Basic |
| 9 | Entity directories and safe account controls | RBAC/audit | P1 |
| 10 | Highlights/featured curation | Domain target queries | Basic |
| 11 | Templates, saved views and admin notifications | Core queues | P1 |
| 12 | System health, exports and launch hardening | Operational services | P1 |

Do not begin with charts or generic CRUD pages. The first complete vertical slice should be marketplace reporting because the CL UI already creates this expectation and the current backend does not deliver a real admin case.

## 13. Decisions required before implementation

These decisions should be confirmed during Stage 0; reasonable defaults are provided so work can proceed.

| Decision | Recommended default |
|---|---|
| Initial staff roles | `SUPER_ADMIN`, `TRUST_SAFETY`, `VERIFICATION_REVIEWER`, read-only `ANALYST` |
| Admin provisioning | CLI-only, no self-service; separate admin principal per ADR 0008 |
| Admin login | Firebase email/password initially; require MFA before public production operations if available |
| Report reasons | Spam, fraud/scam, prohibited item, misleading information, harassment/hate, duplicate, other |
| Auto-hide threshold | Three distinct authenticated reporters; reversible `PENDING_REVIEW` action |
| Case SLA | Critical 1h, high 4h, normal 24h, verification 2 business days; make configurable later |
| Removal semantics | Soft moderation removal, never hard delete from the standard action UI |
| Suspension periods | 24 hours, 7 days, 30 days or custom end time |
| Verification outcomes | Verified, needs information, rejected; tier required for approval |
| Admin UI density | Compact desktop-first with responsive tablet support |
| Audit retention | Indefinite by default until legal/privacy policy defines a bounded period |
| Report owner notification | Only at visibility/action transitions; neutral wording, no reporter identity/raw free text |
| Cross-service Phase 1 command | Service-authenticated internal command plus idempotency/outbox reconciliation |

## 14. Definition of done for each admin feature

A feature is complete only when:

- server authorization and negative permission tests exist;
- source-of-truth ownership is respected;
- success, failure, concurrency and retry behaviour are defined;
- sensitive actions create audit events;
- CL-facing status/notification changes are wired end-to-end;
- loading, empty, error, stale and permission-denied states are implemented;
- keyboard and screen-reader behaviour is verified;
- URL/deep-link behaviour works for lists and detail workspaces;
- codegen/composition/build/lint/tests pass as applicable;
- local seed data covers the workflow;
- the implementation inventory and runbook are updated.

## 15. Explicit non-goals for the first admin increment

- Re-skinning or reusing the public CL layout.
- Paid promotion checkout or pricing management.
- AI-based automated enforcement.
- Appeals before the underlying moderation action model is stable.
- Full buyer–seller message surveillance.
- Direct database editing from the UI.
- Hard deletion as a routine moderation action.
- Admin self-registration.
- Building Standard-tier workflows before the end-to-end marketplace moderation and organisation verification Basic flows are signed off.
