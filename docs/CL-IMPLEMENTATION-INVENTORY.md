# Christian Listings — Implementation and Design Inventory

Last updated: 14 July 2026

This document tracks the Christian Listings member and organisation portal only. The admin application is intentionally out of scope for the current implementation cycle.

Status key:

- **Implemented** — page exists and its primary CL workflow is wired to live GraphQL/backend data.
- **Partial** — usable foundation exists, but one or more launch behaviours are deferred or incomplete.
- **Not implemented** — no complete user-facing workflow exists yet.
- **Deferred** — intentionally postponed by product decision.

Add Figma links in the Design column as they become available.

## Public discovery pages

| Area | Page / route | Status | Design | Notes |
|---|---|---:|---|---|
| Home | `/` | Implemented |  | Region-aware featured content with live global-search previews and full-results handoff. |
| Global search | `/search` | Implemented |  | Shareable search across events, jobs, marketplace and organisations with grouped/type views, module filters and independent cursor pagination. |
| Events home | `/events` | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-7145&m=dev) | Live content and search navigation. |
| All events | `/events/all` | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-8948&m=dev) | Search and filters for category, type, date and region. |
| Event details | `/events/:id` | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-9888&m=dev) | RSVP stages, capacity/waitlist, organiser details and sharing. |
| Jobs home | `/jobs` | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-10634&m=dev) | Live featured jobs and search. |
| All jobs | `/jobs/all` | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-11318&m=dev) | Search and filters for role type, work style, skills, region and salary. |
| Job details | `/jobs/:id` | Implemented | Screenshot reference: `ss/job-description.png` | Three-level breadcrumb and internal Apply flow. |
| Marketplace home | `/marketplace` | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-1324&m=dev) | Live featured listings and Community Gives. |
| All listings | `/marketplace/all` | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-5690&m=dev) | Search and category, condition, location and price filters. |
| Listing details | `/marketplace/:id` | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-6703&m=dev) | Seller details and listing report workflow. |
| Not found | `*` | Implemented |  | Public 404 fallback. |

## Authentication and member onboarding
[Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-23462&m=dev)
| Page / component | Route | Status | Design | Notes |
|---|---|---:|---|---|
| Member sign in / sign up | `/signin`, `/signup` | Implemented |  | Firebase authentication with GraphQL user creation. |
| Sign-in modal | Shared component | Implemented |  | Used for protected actions without losing navigation context. |
| Region onboarding | `/onboarding/region` | Implemented |  | Stores the member's discovery region. |
| Preference onboarding | `/onboarding/preferences` | Implemented |  | Stores discovery preferences. |
| Protected-route handling | Shared component | Implemented |  | Redirects signed-out members and restores the intended destination. |
| Password reset | — | Deferred |  | Explicitly skipped for the current cycle. |
| Email verification experience | — | Deferred |  | Explicitly skipped for the current cycle. |

## Member portal

| Page / feature | Route | Status | Design | Notes |
|---|---|---:|---|---|
| Member dashboard | `/dashboard` | Implemented |  | Links only to active CL workflows. |
| Member profile and privacy | `/profile` | Implemented |  | Persisted editing for name, region, bio, interests, avatar URL and social links. Audience controls and per-field visibility are enforced on federated member presentation; direct avatar file upload remains deferred. |
| Internal job application | `/jobs/:id/apply` | Implemented |  | Authentication redirect, duplicate prevention and backend persistence included. CV upload is deferred. |
| My applications | `/dashboard/applications` | Implemented |  | Displays job, organisation and live application status. |
| Public member profile | — | Deferred |  | Not required for launch; deferred until community networking or reputation features need it. |

## Organisation onboarding

| Page / component | Route | Status | Design | Notes |
|---|---|---:|---|---|
| Organisation authentication | `/org/signup` | Implemented |  | Organisation account sign-in/sign-up. |
| Organisation identity | `/org/onboarding/identity` | Implemented |  | Captures organisation identity details. |
| Organisation verification | `/org/onboarding/verification` | Partial |  | Organisation record and claims are wired; document upload and admin approval remain deferred/out of current scope. |
| Organisation success | `/org/onboarding/success` | Implemented |  | Completion handoff into the protected organisation portal. |
| Organisation route protection | Shared component | Implemented |  | Requires a signed-in organisation member and validates organisation membership. |

## Organisation portal

| Page / feature | Route | Status | Design | Notes |
|---|---|---:|---|---|
| Overview | `/org` | Implemented |  | Live organisation data and creation entry points. Mock marketplace messages are not shown. | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-12939&m=dev)
| Events manager | `/org/events` | Implemented |  | Displays organisation events. Backend create/update/delete authorization is enforced. | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-13538&m=dev)
| Listings manager | `/org/listings` | Implemented |  | Organisation-scoped listings with role-authorised editing, availability/reserved/sold controls, deletion confirmation and responsive states. |[Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-14107&m=dev)
| Hiring and jobs | `/org/jobs` | Implemented |  | Job listings and live applicant inbox. | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-20857&m=dev)
| Applicant review drawer | `/org/jobs` component | Implemented |  | Review, shortlist, hire and reject actions. |
| Applicant CSV export | `/org/jobs` component | Implemented |  | Downloads current organisation application data. |
| Notification centre | `/org/notifications` | Implemented |  | Persistent new-follower, RSVP-milestone, listing-report and verification-update notifications with filters and read/unread controls. |
| Organisation settings | `/org/settings` | Implemented |  | Profile, contact details, social links, logo URL preview/removal, and reversible deactivation persist with role authorization. Direct logo file upload remains part of the deferred Cloudinary feature. | [Figma] (https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-20857&m=dev)
| Public organisation profile | `/organisations/:id` | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-15455&m=dev) | Live organisation identity, contact/social links, events, jobs and marketplace listings. Deactivated profiles are hidden. |
| Information board | — | Not implemented |  | Phase 1 announcements, prayer requests and community updates. |

## Implemented shared components

| Component | Status | Design |
|---|---:|---|
| Main navbar and footer | Implemented |  |
| Organisation dashboard layout/sidebar | Implemented |  |
| Event card | Implemented |  |
| Job card | Implemented |  |
| Marketplace card | Implemented |  |
| Registration confirmation popover | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-16660&m=dev) |
| Report listing popover | Implemented | [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-16699&m=dev) |
| Loading, error and empty states | Partial | Shared accessible states cover global search, public directories, profile and settings; remaining legacy pages need adoption. |
| Toast/notification system | Implemented | Root-level accessible toast provider used by profile, settings and team workflows. |
| Shared confirmation dialog | Implemented | Keyboard-accessible destructive confirmation used by team removal. |
| Pagination component | Implemented | Shared load-more control used by cursor-paginated global search. |
| Accessible mobile filters/drawer | Implemented | Events, jobs and marketplace directories use a keyboard-dismissible mobile drawer. |

## Phase 1 work still required or deferred

| Feature | Status | Design needed? | Notes |
|---|---:|---:|---|
| Marketplace photo uploads and compression | Deferred | Yes, for uploader states | Cloudinary was explicitly postponed. |
| Event cover/gallery uploads | Deferred | Yes, for uploader states | Cloudinary was explicitly postponed. |
| CV upload | Deferred | Yes, for upload/progress/error states | Application data works without CV files. |
| Organisation logo file upload and verification documents | Deferred | Yes | Logo URL management is implemented; Cloudinary file upload and admin approval remain intentionally postponed. |
| RSVP confirmation and reminder emails | Not implemented | Email templates | Requires transactional email provider and scheduling. |
| Job deadline auto-archive/reminder | Deferred | No | Explicitly skipped; expired jobs still reject applications. |
| Public organisation profiles | Implemented | No | Event and job organiser links now open the live profile. |
| Public member profiles | Deferred | Yes | Not required for launch; explicitly deferred. |
| Information board management | Not implemented | Yes | Organisation posts and public feed presentation required. |
| Full notification centre | Implemented | No | Organisation inbox persists follower, RSVP, report and verification activity with read/unread state. |
| Marketplace moderation processing | Deferred | Admin design later | CL report submission exists; admin queue is out of scope. |
| Production transactional emails | Not implemented | Email templates | Includes auth, RSVP and deadline messages. |

## Phase 2 implementation order and design links

Implement one feature at a time. Fill in desktop, mobile and component-state links before implementation when possible.

### 1. Saved Items Hub

Status: **Implemented**

- Saved hub — Desktop: Implemented at `/dashboard/saved`
- Saved hub — Mobile: Responsive layout implemented from existing CL patterns
- Saved event state: Implemented through the event RSVP `SAVED` stage
- Saved job state: Implemented
- Saved listing state: Implemented
- Empty state: Implemented
- Remove confirmation: Direct reversible removal; confirmation intentionally omitted

### 2. Organisation Follow System

Status: **Implemented**

- Public organisation profile — Desktop: Implemented from supplied Figma
- Public organisation profile — Mobile: Responsive layout implemented
- Follow/unfollow states: Implemented with authentication return flow
- Following list: Implemented at `/dashboard/following`
- Follower list: Follower count implemented; individual public follower directory omitted for member privacy
- Following feed: Implemented for active events, jobs and marketplace listings

### 3. Buyer–Seller Messaging

Status: **Implemented**

- Start conversation: Implemented from marketplace listing details
- Member inbox — Desktop: Implemented at `/dashboard/messages`
- Member inbox — Mobile: Responsive thread list/conversation navigation implemented
- Seller inbox — Desktop: [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-14616&m=dev)
- Conversation — Desktop: Implemented with polling, unread state and archive action
- Conversation — Mobile: Implemented
- Empty/loading/error states: Implemented

### 4. Marketplace Offers and Counteroffers

Status: **Not implemented**

- Make offer popover:
- Offer sent confirmation:
- Seller offer view:
- Counteroffer:
- Accepted state:
- Declined state:
- Offer history:

### 5. Job Alerts

Status: **Not implemented**

- Create alert:
- Alert confirmation:
- Manage alerts:
- Email template:

### 6. Recurring Events

Status: **Implemented**

- Event recurrence fields: Weekly/monthly rules, intervals, selected weekdays, monthly day, timezone, count/date ending rules, 12-month horizon and 100-occurrence cap.
- Series details: Event detail pages identify the series and expose upcoming occurrence navigation.
- Manage occurrences: Organisation managers can edit one occurrence, this-and-future, or the future series; cancellation supports the same scopes while retaining history.
- RSVP to series/occurrence decision: Members can respond to one occurrence or all future dates; capacity and waitlists are calculated independently per occurrence and individual overrides are preserved.

### 7. Event and Job Templates

Status: **Not implemented**

- Template library:
- Save as template:
- Create from template:
- Edit/delete confirmation:

### 8. Organisation Team and Roles

Status: **Implemented**

- Team list: Implemented at `/org/team`
- Invite member: [Figma](https://www.figma.com/design/Gj7fCzq27sJU0gUhlRrAbY/Christian-Listings?node-id=6-16750&m=dev)
- Role selection: Multiple scoped roles supported
- Pending invitation: Copy link, seven-day expiry, revoke and resend implemented
- Remove member confirmation: Implemented; authored content is retained

### 9. Organisation Posts and Feed

Status: **Not implemented**

- Create announcement:
- Create prayer request:
- Create community update:
- Edit/delete post:
- Organisation profile feed:
- Home feed card:

### 10. Saved Searches, Wanted Ads and Marketplace Video

Status: **Not implemented**

- Saved search creation/management:
- Wanted-ad creation/details:
- Marketplace video uploader/player:

## Design handoff checklist

For each new page or flow, provide:

- Desktop Figma node.
- Mobile Figma node.
- Default, loading, empty, error and success states.
- Modal/popover/drawer nodes.
- Expected click behaviour and redirects.
- Authentication requirement.
- Role/permission requirement.
- Confirmation and destructive-action behaviour.
- Any copy that must be exact.
