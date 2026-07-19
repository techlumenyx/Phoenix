# Christian Listings End-to-End Test Plan

Last updated: 19 July 2026
Companion workbook: `outputs/e2e-testing/E2E-TEST-TRACKER.xlsx`

## 1. Purpose

This plan defines repeatable end-to-end validation for the Christian Listings public portal, member portal, organisation portal, admin portal, GraphQL gateway, four subgraphs, and their MongoDB persistence. The Markdown file is the stable specification. The Excel workbook records test runs, executions, defects, evidence, and database verification.

## 2. Test boundary

| Surface | Local URL | Persistence owner |
|---|---|---|
| Christian Listings | `http://localhost:3000` | Federated through Gateway |
| Admin portal | `http://localhost:3001` | Federated through Gateway |
| Gateway | `http://localhost:4000` | None |
| Identity subgraph | `http://localhost:4001` | `cl_identity` |
| Events subgraph | `http://localhost:4002` | `cl_events` |
| Classifieds subgraph | `http://localhost:4003` | `cl_classifieds` |
| Admin subgraph | `http://localhost:4004` | `cl_admin` |

Run the local application stack with `npm run dev:all`. MongoDB is external and must be configured through `MONGO_URI`.

## 3. Tracking identifiers

- Test run: `RUN-YYYY-MM-DD-NN`
- Execution: `EXEC-NNNN`
- Defect: `BUG-NNNN`
- DB check: `DB-NNNN`
- Flow prefixes: `AUTH`, `DISC`, `EVT`, `JOB`, `MKT`, `MSG`, `MEM`, `ORG`, `NOT`, `MOD`, `VER`, `ADM`, `SYS`

Never reuse an identifier. A retest receives a new Execution ID and references the previous execution.

## 4. Entry criteria

- `.env` contains working MongoDB, Firebase, internal-service, and browser configuration.
- `npm run gateway:compose` has been run after schema changes.
- `npm run dev:all` starts all seven application targets.
- Health endpoints respond successfully.
- Seed data or named test records exist.
- The tester has the required member, organisation-role, reviewer, moderator, auditor, content-manager, and support accounts.

## 5. Exit criteria

- All P0 and P1 flow variants have passed on the target environment.
- Every persistence-changing execution has a completed DB check.
- No open P0 defects exist.
- P1 defects are closed or explicitly accepted by the release owner.
- Failed fixes have a linked retest execution.
- Cross-service effects, notifications, authorization boundaries, and audit records are verified.

## 6. Status and severity

Execution statuses: `Not Run`, `In Progress`, `Passed`, `Failed`, `Blocked`, `Partially Passed`, `Not Applicable`.

DB statuses: `Pending`, `Passed`, `Failed`, `Blocked`, `Not Applicable`.

Defect severity:

- **P0:** security compromise, data loss/corruption, authentication unavailable, or platform unusable.
- **P1:** core flow broken with no reasonable workaround or incorrect authorization/persistence.
- **P2:** incorrect behaviour with a practical workaround.
- **P3:** visual, content, accessibility, or low-impact defect.

## 7. Inline database verification protocol

Database validation is part of the flow, not a separate testing phase.

1. Before a mutating flow, record the relevant user, organisation, event, job, listing, case, or request identifier in the execution row.
2. Complete the UI steps and capture the GraphQL request/correlation ID where available.
3. Record the expected database assertion in the linked `DB Checks` row.
4. Ask for validation using the Flow ID and record identifiers, for example: `Validate DB for EVT-003, event <id>, member <uid>, execution EXEC-0012`.
5. Validate only the owning database/model. Cross-service flows receive one DB-check row per owning service.
6. Store a sanitized summary in `Actual DB Result`; never paste tokens, verification document URLs, private applications, or credentials.
7. Mark the execution Passed only when required UI, API, and DB results all pass.

### DB validation evidence format

```text
Database: cl_events
Model: Rsvp
Lookup: eventId=<id>, userFirebaseUid=<uid>
Expected: one ACTIVE registration for the selected occurrence
Actual: one ACTIVE registration; updatedAt=<timestamp>
Related checks: event attendee/waitlist counts consistent
Result: Passed
```

## 8. Flow catalogue

The companion workbook contains one executable row for every flow below and pre-created DB checks for persistence-changing flows.

### Authentication and onboarding

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| AUTH-001 | Member sign-up | P0 | Firebase user and CL member are created once | `cl_identity` / User: Firebase UID, email, defaults |
| AUTH-002 | Member sign-in and sign-out | P0 | Session starts and is cleared without losing public access | None |
| AUTH-003 | Protected action sign-in return | P0 | User returns to the original event/job/listing action | None |
| AUTH-004 | Region onboarding | P1 | Region persists and changes discovery content | `cl_identity` / User: region |
| AUTH-005 | Preference onboarding | P1 | Selected categories/interests persist | `cl_identity` / User: interests/preferences |
| AUTH-006 | Organisation sign-up and membership | P0 | Organisation and owner membership are created atomically | `cl_identity` / Organisation and User membership |
| AUTH-007 | Organisation route authorization | P0 | Non-members and insufficient roles are rejected | Confirm no unauthorized mutation |
| AUTH-008 | Admin sign-in and RBAC | P0 | Only active admin principals reach role-permitted routes | `cl_identity` / Admin: active status and roles |

### Discovery and navigation

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| DISC-001 | Region-aware home | P1 | Active regional/global content appears in correct order | Read-only source records |
| DISC-002 | Global search | P0 | Events, jobs, listings, and organisations are grouped correctly | Read-only source records |
| DISC-003 | Search filters and independent pagination | P1 | Filters and cursors affect only the selected result type | None |
| DISC-004 | Public navigation and breadcrumbs | P2 | Routes and three-level breadcrumbs resolve correctly | None |
| DISC-005 | Unknown route | P2 | Accessible not-found state is shown | None |

### Events

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| EVT-001 | Browse and filter events | P0 | Category, type, date, and region filters return published events | Read-only Event query |
| EVT-002 | Event detail | P0 | Details, organiser, series, capacity, sharing, and upcoming dates render | Read-only Event/EventSeries |
| EVT-003 | Register for one event occurrence | P0 | Confirmation appears and registration persists once | `cl_events` / Rsvp; Event counts |
| EVT-004 | Capacity and waitlist transition | P0 | Full event creates waitlist entry and correct position | `cl_events` / Rsvp stage; Event counts |
| EVT-005 | Cancel RSVP | P0 | RSVP is cancelled and next eligible waitlisted member is promoted | `cl_events` / Rsvp transitions |
| EVT-006 | Save and unsave event | P1 | Saved state appears in Saved Items Hub and is reversible | `cl_events` / Rsvp SAVED stage |
| EVT-007 | Organisation creates an event | P0 | Authorized organisation event is published with correct ownership | `cl_events` / Event |
| EVT-008 | Organisation edits one occurrence | P0 | Only selected occurrence changes | `cl_events` / Event; EventSeries unchanged |
| EVT-009 | Create weekly/monthly recurring series | P0 | Rule and bounded occurrences are generated | `cl_events` / EventSeries and Events |
| EVT-010 | Edit/cancel this-and-future series scope | P0 | Historical occurrences remain; future scope changes consistently | `cl_events` / EventSeries and Events |
| EVT-011 | RSVP to all future occurrences | P1 | Series response applies to future dates with occurrence overrides | `cl_events` / SeriesRsvp and Rsvp |
| EVT-012 | Organisation event authorization | P0 | Another organisation cannot modify the event | Confirm Event unchanged |

### Jobs and applications

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| JOB-001 | Browse and filter jobs | P0 | Role, work style, skill, salary, and region filters work | Read-only JobListing |
| JOB-002 | Job detail | P0 | Job, organisation, breadcrumb, and apply state render | Read-only JobListing |
| JOB-003 | Signed-out Apply redirect | P0 | Sign-in returns applicant to internal form | None |
| JOB-004 | Submit job application | P0 | Valid application persists and confirmation is shown | `cl_classifieds` / JobApplication |
| JOB-005 | Duplicate and expired application protection | P0 | Duplicate/expired submissions are rejected without extra rows | JobApplication count unchanged |
| JOB-006 | Member application dashboard | P1 | Current application and employer status are displayed | Read-only JobApplication |
| JOB-007 | Organisation creates/updates job | P0 | Authorized changes persist with correct organisation ownership | `cl_classifieds` / JobListing |
| JOB-008 | Applicant review lifecycle | P0 | Review, shortlist, hire, and reject transitions persist | `cl_classifieds` / JobApplication status/history |
| JOB-009 | Applicant CSV export | P1 | Export contains current organisation applications only | Compare export with JobApplication query |
| JOB-010 | Job authorization boundary | P0 | Other organisations cannot access applicants or mutate job | Records remain unchanged |

### Marketplace and saved classifieds

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| MKT-001 | Browse and filter listings | P0 | Category, condition, location, and price filters work | Read-only MarketplaceItem |
| MKT-002 | Listing detail and visibility | P0 | Active listing is visible; hidden/removed item is not publicly bypassed | Read-only MarketplaceItem status |
| MKT-003 | Organisation creates listing | P0 | Listing persists with correct ownership and active state | `cl_classifieds` / MarketplaceItem |
| MKT-004 | Edit and availability lifecycle | P0 | Available, reserved, sold, and restored states persist | MarketplaceItem status/version |
| MKT-005 | Delete listing | P0 | Authorized deletion removes/hides listing consistently | MarketplaceItem deletion/status |
| MKT-006 | Save and unsave listing | P1 | Saved hub updates without duplicate records | `cl_classifieds` / SavedClassified |
| MKT-007 | Save and unsave job | P1 | Saved job state is reversible | `cl_classifieds` / SavedClassified |
| MKT-008 | Submit listing report | P0 | Neutral acknowledgement appears and durable report is created | `cl_admin` / ModerationReport and ModerationCase |
| MKT-009 | Three-distinct-reporter threshold | P0 | Listing becomes pending review after third distinct reporter | `cl_admin` case/report count; `cl_classifieds` item status |

### Buyer-seller messaging

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| MSG-001 | Start conversation from listing | P0 | One participant thread opens for listing and seller | `cl_classifieds` / MessageThread |
| MSG-002 | Send and receive message | P0 | Message persists once and appears to both participants | Message and MessageThread latest metadata |
| MSG-003 | Unread/read lifecycle | P1 | Recipient unread count increments and clears on open | MessageThread participant read state |
| MSG-004 | Archive conversation | P1 | Archive affects requesting participant without deleting evidence | MessageThread participant archive state |
| MSG-005 | Messaging authorization | P0 | Non-participant cannot read or post to thread | Message count unchanged |

### Member profile, saved items, and follows

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| MEM-001 | Edit member profile | P1 | Name, region, bio, interests, avatar URL, and social links persist | `cl_identity` / User |
| MEM-002 | Profile privacy controls | P0 | Field audiences are enforced in federated presentation | User privacy settings; read as another actor |
| MEM-003 | Saved Items Hub | P1 | Saved events, jobs, and listings are grouped and removable | Rsvp/SavedClassified cross-check |
| MEM-004 | Follow/unfollow organisation | P1 | State and counter update atomically without duplicates/drift | `cl_identity` / FollowRelationship and Organisation count |
| MEM-005 | Following list and feed | P1 | Active followed-organisation content appears; inactive content does not | Read-only FollowRelationship/source records |

### Organisation lifecycle, settings, and team

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| ORG-001 | Organisation identity onboarding | P0 | Identity/contact data persists under owner membership | `cl_identity` / Organisation and User |
| ORG-002 | Organisation overview | P1 | Live counts and creation entry points match owned records | Cross-service read-only counts |
| ORG-003 | Update contact/social/logo URL settings | P1 | Authorized settings persist and preview correctly | `cl_identity` / Organisation |
| ORG-004 | Deactivate and restore organisation | P0 | Public profile/content visibility follows reversible lifecycle | Organisation active/deactivation fields |
| ORG-005 | Public organisation profile | P0 | Identity, contacts, events, jobs, and listings respect visibility | Cross-service read-only records |
| ORG-006 | Invite team member | P0 | Seven-day scoped invitation is created once | `cl_identity` / OrgInvite |
| ORG-007 | Existing/new account accepts invite | P0 | Membership and scoped roles persist; invite becomes accepted | OrgInvite and User membership |
| ORG-008 | Resend/revoke invitation | P1 | Expiry/token state changes safely without duplicate membership | OrgInvite lifecycle |
| ORG-009 | Change team roles | P0 | New permissions apply server-side | User organisation membership roles |
| ORG-010 | Remove team member | P0 | Membership is removed while authored content remains | User membership; domain content retained |
| ORG-011 | Organisation role matrix | P0 | Each role can perform only supported event/job/listing/settings actions | Confirm unauthorized records unchanged |

### Organisation notifications and verification

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| NOT-001 | Organisation notification inbox | P1 | Follower, RSVP, report, and verification notices persist | OrganisationNotification in owning service |
| NOT-002 | Read/unread filters | P1 | Read state survives refresh and filters accurately | Notification readAt/read state |
| VER-001 | Submit verification | P0 | Versioned pending submission with SLA is created | `cl_identity` Organisation status; `cl_admin` VerificationSubmission |
| VER-002 | Resubmit requested information | P0 | New version is created; history remains immutable | VerificationSubmission versions |
| VER-003 | Reviewer assignment/document access | P0 | Assignment persists and every document open is audited | VerificationSubmission and AuditEvent |
| VER-004 | Approve verification | P0 | Canonical badge/tier and organisation notification update | Identity Organisation; admin review/audit; notification |
| VER-005 | Reject/request information | P0 | Decision reason, state, and notification persist | Identity/admin/notification cross-check |
| VER-006 | Verification authorization | P0 | Auditor/support roles cannot open protected documents | No document-access AuditEvent |

### Moderation and admin operations

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| MOD-001 | Moderation queue and assignment | P0 | Case filters, assignment, notification, and optimistic version work | ModerationCase/AdminNotification/AuditEvent |
| MOD-002 | Add internal moderation note | P1 | Note is internal, bounded, and audited | CaseNote and AuditEvent |
| MOD-003 | Dismiss or warn case | P0 | Listing is restored where valid and seller receives safe notice | Admin case/command/audit; item; notification |
| MOD-004 | Remove listing | P0 | Listing remains unavailable and action is audited | Admin case/command/audit; MarketplaceItem |
| MOD-005 | Concurrent moderation decision | P0 | Stale second reviewer is rejected; canonical action occurs once | One completed AdminCommand; one resolution |
| MOD-006 | Partial command reconciliation | P0 | Partial failure is detected, alerted, and reconciled idempotently | AdminCommand state; case and audit consistency |
| ADM-001 | Operational dashboard | P1 | Queue/SLA/throughput values match source workflow data | Aggregate cross-check |
| ADM-002 | Entity directories and restricted data access | P0 | Search works; private access requires role/purpose and audit | AuditEvent for privileged read |
| ADM-003 | Warn/suspend/reactivate account | P0 | Canonical account state and session revocation behave safely | Identity User/Organisation and AuditEvent |
| ADM-004 | Recurring-event admin action scope | P0 | Occurrence versus series action affects intended records only | Events/EventSeries and AuditEvent |
| ADM-005 | Audit explorer and export | P0 | Filters work; bounded CSV is generated, protected, and expires | AuditEvent and AuditExport |
| ADM-006 | Versioned templates | P1 | New version activates while history remains | AdminTemplate versions/active uniqueness |
| ADM-007 | Featured placement lifecycle | P1 | Schedule, rank, region, pause, duplicate, and preview work | FeaturedPlacement |
| ADM-008 | Saved admin views and notifications | P1 | Personal filters and persistent read state work | SavedAdminView/AdminNotification |
| ADM-009 | System health | P1 | Dependencies, version, latency, and reconciliation state are read-only | Read-only health/reconciliation count |

### System and security

| ID | Flow | Priority | Expected result | DB validation |
|---|---|---:|---|---|
| SYS-001 | Internal service authentication | P0 | Missing/incorrect service key is rejected | No domain/admin record created |
| SYS-002 | Request ID propagation | P1 | Correlation ID crosses gateway/subgraphs and reaches audit records | AuditEvent requestId |
| SYS-003 | Production security headers and origin policy | P0 | CSP/frame/origin policies reject unapproved embedding/origins | None |
| SYS-004 | Admin mutation throttling | P1 | Excess mutations receive bounded 429 response | No excess mutation records |
| SYS-005 | Audit export restart recovery | P1 | Pending job resumes or expires safely after restart | AuditExport state/content |

## 9. Required variants for every flow

Apply these variants when relevant and record each as a separate execution:

- Happy path.
- Signed-out actor.
- Wrong role, organisation, or participant.
- Duplicate submission/retry.
- Empty, loading, and API error state.
- Stale/concurrent update.
- Mobile viewport and keyboard-only use.
- Refresh/deep-link persistence.
- Boundary values: capacity, deadlines, lengths, pagination, and recurrence caps.
- Cross-service partial failure for admin-mediated actions.

## 10. Evidence rules

- Use paths or links, not embedded secrets.
- Capture UI screenshot/video for visual defects.
- Capture operation name, response code, sanitized error, and request ID for API defects.
- Capture only relevant IDs and field summaries for DB evidence.
- Never place Firebase tokens, service keys, raw verification URLs, CV/application bodies, or private contact data in the workbook.

## 11. Defect lifecycle

`New → Triaged → In Progress → Ready for Retest → Resolved → Closed`

Use `Reopened`, `Blocked`, `Duplicate`, or `Won't Fix` only with a reason. A defect is closed only after a linked retest execution passes. Fix commit and build/version belong in the Defects sheet.

## 12. Deferred/non-testable scope

Do not report absence of these explicitly deferred features as defects: password reset, email verification experience, job alerts, marketplace offers/counteroffers, event/job templates, public member profiles, information board, transactional email, wanted ads, and saved searches.

## 13. Defects resolved during initial E2E testing

These defects were found after this tracker was created. `Closed` means the corrected flow was subsequently observed working; `Ready for Retest` means the code fix is present but the complete linked flow still needs a formal retest and inline DB validation where applicable. The Excel Defects sheet contains full reproduction, evidence, root-cause, and resolution details.

| Defect ID | Flow ID | Severity | Status | Summary | Resolution / evidence |
|---|---|---:|---|---|---|
| BUG-0001 | EVT-001 | P0 | Closed | Events, Jobs, and Marketplace landing pages entered repeated render/query cycles | Stabilised Apollo variables and empty preference references; commit `54ad9af`; Events retest passed |
| BUG-0002 | DISC-001 | P2 | Ready for Retest | Spotlight and Events at a Glance used hardcoded content | Replaced static cards with published event/job/listing discovery and deterministic selection |
| BUG-0003 | DISC-001 | P1 | Closed | Homepage failed to compile because `SpotlightSection` could not be resolved | Added `HomepageSpotlightSection` and corrected the import |
| BUG-0004 | DISC-001 | P1 | Ready for Retest | Selecting a location with no exact matches left discovery sections blank | Regional results now fall back to global active content while retaining regional priority |
| BUG-0005 | DISC-002 | P1 | Closed | The `me` operation queried a `regionCode` field absent from the federated `User` contract | Aligned identity schema, resolver, generated types, and consuming operation |
| BUG-0006 | DISC-002 | P0 | Closed | Discovery failed when a seeded marketplace seller reference returned a null non-nullable `User.id` | Removed the unused seller selection from discovery and hardened federated reference identity mapping |
| BUG-0007 | DISC-004 | P2 | Closed | Job detail and member profile content rendered beneath the fixed navbar | Added the shared fixed-header top offset to affected public routes |
| BUG-0008 | MEM-003 | P2 | Ready for Retest | Saved Items Hub existed but had no discoverable navigation entry | Added Dashboard and Saved Items actions to desktop and mobile user menus |
| BUG-0009 | ORG-005 | P0 | Closed | Organisation profile failed on non-null `Organisation.marketplaceListings` | Merged job and marketplace federation resolvers for `Organisation`; resolver regression test added |
| BUG-0010 | ORG-005 | P1 | Ready for Retest | Public pages exposed raw GraphQL and backend error messages | Added a user-safe error mapper and replaced raw error rendering across public/member flows |
| BUG-0011 | ORG-005 | P2 | Ready for Retest | Contact/social capsules displayed GraphQL metadata as `__typename` | Social-link rendering now allowlists supported network fields |
| BUG-0012 | JOB-006 | P2 | Ready for Retest | Dashboard and member subpages rendered beneath the fixed navbar | Added consistent top spacing to Dashboard, Applications, Saved Items, Following, and Messages |
| BUG-0013 | JOB-004 | P0 | Closed | Job application deep link repeatedly requested the organisation URL and produced service-worker 404s | Development startup unregisters stale workers once and Webpack serves SPA history fallbacks; user retest passed |
| BUG-0014 | JOB-004 | P1 | Ready for Retest | Job detail retained Apply to Job after a successful submission | Added `myJobApplication` state to the detail query and render an Application Submitted state |
| BUG-0015 | JOB-006 | P0 | Ready for Retest | `me.jobApplications` returned empty despite a persisted application | Federated User lookups now use `firebaseUid`; resolver regression coverage added |
| BUG-0016 | JOB-006 | P0 | Ready for Retest | Application history failed because `JobListing.title` completed as null | `JobApplication.listing` now hydrates the local listing before GraphQL completion |
| BUG-0017 | JOB-006 | P2 | Ready for Retest | Members could not review their submitted application response | Added submitted fields and an accessible read-only response modal to My Applications |
| BUG-0018 | ORG-003 | P2 | Ready for Retest | Organisation Social Connection add action was inert | Linked the control to anchored social settings and made existing social capsules actionable |
| BUG-0019 | MSG-002 | P1 | Ready for Retest | Organisation overview omitted marketplace buyer messages | Added a live seller conversation panel with unread, loading, empty, error, and inbox states |
| BUG-0020 | NOT-001 | P2 | Ready for Retest | View All Notifications did nothing | Connected the overview footer to `/org/notifications` |
| BUG-0021 | EVT-009 | P1 | Ready for Retest | Recurring-event form allowed a rule that ended before its first occurrence | Added event-weekday defaults, schedule-aware minimum dates, inline validation, and regression tests |
| BUG-0022 | ORG-002 | P2 | Ready for Retest | Events, Listings, and Jobs manager pages lacked local create forms | Reused the wired forms below each manager table with automatic post-create refetch |
