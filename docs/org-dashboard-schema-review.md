# Org Dashboard — UI vs Schema Review

> Generated: 2026-06-27  
> Scope: `/org/*` routes vs the 4 GraphQL subgraph schemas  
> Legend: ✅ Present & mapped · ⚠️ Present but mismatched · ❌ Missing from schema · 🔒 Standard-tier (deferred)

---

## 1. OrgOverviewPage — Profile Header

| UI Field | Schema Field | Status |
|---|---|---|
| Organisation name | `Organisation.name` | ✅ |
| Logo | `Organisation.logoUrl` | ✅ |
| isVerified badge | `Organisation.isVerified` | ✅ |
| Tagline (italic quote) | ❌ No `tagline` field — schema only has `description` | ❌ |
| Follower count | `Organisation.followerCount` | ✅ |
| Listings count (hardcoded 650) | ❌ No aggregate count on `Organisation` | ❌ |
| Website URL | `Organisation.websiteUrl` | ✅ |
| Social link pills (WhatsApp, Instagram) | `Organisation.socialLinks` | ✅ |
| "Our Mission" text | `Organisation.description` | ✅ |
| `verificationTier` | `Organisation.verificationTier` (NONE/STANDARD/CHARITY/NGO) | ✅ in schema, not shown in UI |

**Action needed:** Either add `tagline: String` to `Organisation` in identity schema, or reuse `description` as the tagline and drop the separate field. Also need an aggregate `listingCount` or compute it client-side.

---

## 2. OrgOverviewPage — Analytics at a Glance

| UI Metric | Schema Field | Status |
|---|---|---|
| Total Views | ❌ Not in any schema | ❌ |
| Total Clicks | ❌ Not in any schema | ❌ |
| CTR | ❌ Not in any schema | ❌ |
| Engagement | ❌ Not in any schema | ❌ |
| Listings count | ❌ Not in any schema | ❌ |

`subgraph-admin` has `platformStats` (platform-wide totals) but nothing org-scoped. No `viewCount`, `clickCount`, or analytics model exists anywhere.

**Action needed:** Add an `orgStats(organisationId: ID!): OrgStats` query to `subgraph-admin` with fields: `totalViews`, `totalClicks`, `ctr`, `engagementRate`, `listingCount`.

---

## 3. OrgOverviewPage — ListingsManager Tabs

### All Listings tab
| UI Field | Schema Field | Status |
|---|---|---|
| Event title, date | `Event.title`, `Event.date` | ✅ |
| Job title, location | `JobListing.title`, `JobListing.workLocation` | ✅ |
| Marketplace title | `MarketplaceItem.title` | ✅ |
| Type badge (EVENT/JOB/LISTING) | derived from query type | ✅ |
| Views | ❌ Not in any schema | ❌ |
| RSVPs count | `Event.rsvpCount` | ✅ |
| Applications count | ❌ No `applicationCount` on `JobListing` | ❌ |
| Enquiries count | ❌ Not in any schema | ❌ |

### Events tab
| UI Field | Schema Field | Status |
|---|---|---|
| title | `Event.title` | ✅ |
| date | `Event.date` | ✅ |
| venue / city | `Event.location.city`, `Event.location.type` | ✅ |
| category | `Event.category: EventCategory` | ✅ |
| views | ❌ Not in schema | ❌ |
| rsvpTotal | `Event.rsvpCount` | ✅ |
| confirmed count | `Event.confirmedCount` | ✅ |

### Jobs tab
| UI Field | Schema Field | Status |
|---|---|---|
| title | `JobListing.title` | ✅ |
| location | `JobListing.workLocation` | ✅ |
| deadline | `JobListing.applicationDeadline` | ✅ |
| roleType badge | `JobListing.roleType` | ✅ |
| views | ❌ Not in schema | ❌ |
| applications count | ❌ No `applicationCount` on `JobListing` | ❌ |

### Marketplace tab
| UI Field | Schema Field | Status |
|---|---|---|
| title | `MarketplaceItem.title` | ✅ |
| condition badge | `MarketplaceItem.condition` | ✅ |
| price | `MarketplaceItem.price` + `currency` | ✅ |
| isDonation tag | `MarketplaceItem.isDonation` | ✅ |
| location (e.g. "London, UK") | ❌ `MarketplaceItem` has only `region`, no `location`/`area` field | ❌ |
| views | ❌ Not in schema | ❌ |
| enquiries count | ❌ Not in schema | ❌ |

---

## 4. OrgOverviewPage — NotificationCentre

| UI Element | Schema | Status |
|---|---|---|
| Notification list (type, time, context) | ❌ No `Notification` type in any schema | ❌ |
| "5 New" unread count | ❌ Not in schema | ❌ |

**Action needed:** Add `Notification` type and queries to identity or a new notifications subgraph.

---

## 5. OrgOverviewPage — MarketplaceMessages

| UI Element | Schema | Status |
|---|---|---|
| Thread list (avatar, name, preview, time) | ❌ No `ChatThread` or `Message` type in schema | ❌ |
| Unread dot | ❌ Not in schema | ❌ |

Blueprint mentions `ChatThread` and `Message` as entities in `subgraph-classifieds` but they were **not added to the GraphQL schema**. Standard-tier feature.

---

## 6. OrgOverviewPage — CreateEventForm

| UI Field | Schema Field | Status |
|---|---|---|
| title | `CreateEventInput.title` | ✅ |
| category pills (9 options) | `CreateEventInput.category: EventCategory` (7 values) | ⚠️ |
| description | `CreateEventInput.description` | ✅ |
| date | `CreateEventInput.date: DateTime` | ✅ |
| time | Combined into `DateTime` | ✅ |
| endDate | `CreateEventInput.endDate` | ❌ No end time field in UI |
| location type (IN_PERSON / ONLINE / HYBRID) | `EventLocationInput.type: LocationType` (PHYSICAL / VIRTUAL / HYBRID) | ⚠️ |
| address | `EventLocationInput.address` | ✅ |
| virtual link | `EventLocationInput.virtualLink` | ✅ |
| region | `CreateEventInput.region` | ✅ |
| media gallery (up to 10 images) | `CreateEventInput.imageUrl: String` (single!) | ⚠️ |
| embed video URL | ❌ No `videoUrl` or `embedUrl` in schema | ❌ |
| capacityLimit | `CreateEventInput.capacityLimit` | ✅ |
| "Enable automatic waitlist" toggle | ❌ No `enableWaitlist` boolean in schema | ❌ |
| "This is a Ticket Event" checkbox | `CreateEventInput.externalTicketUrl` | ⚠️ needs wiring |
| "Send Email Notifications" checkbox | ❌ Not in schema | ❌ |
| isRecurring | `CreateEventInput.isRecurring` | ❌ No toggle in UI |

**Category mismatch:**
- UI: Worship & Prayer, Bible Study & Theology, Community & Social, Conferences & Seminars, Youth & Young Adults, Music & Arts, Charity & Welfare, Cultural & Heritage, Other
- Schema: `WORSHIP`, `WELFARE`, `CHARITY`, `COMMUNITY`, `CONFERENCE`, `CULTURAL`, `YOUTH`
- Missing in schema: `BIBLE_STUDY`, `MUSIC`, `OTHER`

**LocationType mismatch:**
- UI uses `IN_PERSON` / `ONLINE` — Schema uses `PHYSICAL` / `VIRTUAL`

---

## 7. OrgOverviewPage — CreateListingForm

| UI Field | Schema Field | Status |
|---|---|---|
| title | `CreateMarketplaceItemInput.title` | ✅ |
| category (8 pills) | `CreateMarketplaceItemInput.category: MarketplaceCategory` (8 values) | ✅ Perfect match |
| condition (New/Like New/Good/Fair) | `ItemCondition: NEW, LIKE_NEW, GOOD, FAIR` | ✅ |
| description | `CreateMarketplaceItemInput.description` | ✅ |
| price | `CreateMarketplaceItemInput.price: Float!` | ✅ |
| currency dropdown | `CreateMarketplaceItemInput.currency: String!` | ✅ |
| isDonation toggle | `CreateMarketplaceItemInput.isDonation: Boolean!` | ✅ |
| general location (area/neighbourhood) | ❌ Schema has only `region: String!`, no `location`/`area` field | ❌ |
| region | `CreateMarketplaceItemInput.region: String!` | ✅ |
| photo upload (up to 8) | `CreateMarketplaceItemInput.imageUrls: [String!]!` | ✅ |

Best-mapped form of all three — only the granular location field is missing from schema.

---

## 8. OrgOverviewPage — CreateJobsForm

| UI Field | Schema Field | Status |
|---|---|---|
| title | `CreateJobListingInput.title` | ✅ |
| roleType (Paid/Volunteer/Internship) | `RoleType: PAID, VOLUNTEER, INTERNSHIP` | ✅ |
| workLocation (Physical/Remote/Hybrid) | `WorkLocation: PHYSICAL, REMOTE, HYBRID` | ✅ |
| city input (for non-remote) | ❌ `JobListing` has no `city`/`address` field, only `workLocation` enum + `region` | ❌ |
| description | `CreateJobListingInput.description` | ✅ |
| responsibilities textarea | ❌ No `responsibilities` field in `JobListing` or `CreateJobListingInput` | ❌ |
| skillsRequired pills + custom | `CreateJobListingInput.skillsRequired: [String!]!` | ✅ |
| applicationDeadline | `CreateJobListingInput.applicationDeadline: DateTime!` | ✅ |
| region | `CreateJobListingInput.region: String!` | ✅ |
| salary min/max | `SalaryRangeInput.min`, `SalaryRangeInput.max` | ✅ |
| salary currency | `SalaryRangeInput.currency: String!` | ❌ No currency selector in UI |
| externalApplyUrl | `CreateJobListingInput.externalApplyUrl` | ✅ |
| faithAlignmentTag | `FaithAlignmentTag: OPEN_TO_ALL, FAITH_BACKGROUND_PREFERRED` | ✅ |

---

## 9. OrgEventsPage

| UI Column | Schema Field | Status |
|---|---|---|
| Event title (2 lines) | `Event.title` | ✅ |
| Location subtitle | `Event.location.city + type` | ✅ |
| Type (category) | `Event.category: EventCategory` | ✅ |
| Frequency ("Recurring") | `Event.isRecurring: Boolean` | ✅ |
| Date | `Event.date: DateTime` | ✅ |
| Views | ❌ Not in schema | ❌ |
| Capacity | `Event.capacityLimit: Int` | ✅ |
| RSVPs | `Event.rsvpCount: Int` | ✅ |

**Tabs:**
- Active Events → `events(organisationId, status: PUBLISHED)` ✅
- Draft Events → `events(organisationId, status: DRAFT)` ✅
- Recurring Events → `events(organisationId, isRecurring: true)` — ⚠️ `isRecurring` filter not exposed in `events()` query args

---

## 10. OrgListingsPage

| UI Column | Schema Field | Status |
|---|---|---|
| Title (2 lines) | `MarketplaceItem.title` | ✅ |
| Location subtitle | ❌ No location/area field on `MarketplaceItem` | ❌ |
| Type (category) | `MarketplaceItem.category` | ✅ |
| Price | `MarketplaceItem.price + currency` | ✅ |
| Date (createdAt) | `MarketplaceItem.createdAt` | ✅ |
| Views | ❌ Not in schema | ❌ |
| Status ("FOR SALE") | `MarketplaceItem.status: ListingStatus` | ⚠️ |
| Offers count | ❌ Not in schema | ❌ |

**Status mismatch:** UI shows "FOR SALE" — schema has `AVAILABLE / RESERVED / SOLD / PENDING_REVIEW`.  
**Tabs:** Active/Draft — no `DRAFT` value in `ListingStatus` enum.

---

## 11. OrgJobsPage

### Applications tab

| UI Column | Schema Field | Status |
|---|---|---|
| Candidate name | `JobApplication.applicant.name` (via User) | ✅ |
| Email | `JobApplication.applicant.email` | ✅ |
| Applied for (job title) | `JobApplication.listing.title` | ✅ |
| Application date | `JobApplication.createdAt` | ✅ |
| Experience ("3.5 Years") | ❌ No `experience` field on `User` or `JobApplication` | ❌ |
| "View Resume" link | ❌ No resume upload in schema | ❌ |
| "View CV" link | ❌ No CV upload in schema | ❌ |
| Status dropdown | `JobApplication.status: ApplicationStatus` | ⚠️ |

**Status mismatch:**
- UI shows: Under Review, Shortlisted, **Hired**, Rejected  
- Schema: `SUBMITTED, UNDER_REVIEW, SHORTLISTED, REJECTED, WITHDRAWN`  
- `HIRED` does not exist in schema. `SUBMITTED` and `WITHDRAWN` not shown in UI.

**Missing query:** No `orgApplications(organisationId: ID!)` query. Schema only exposes `User.jobApplications` — can't fetch all applications for an org's listings without adding a new query.

### Active Listings / Draft Listings tabs
- No content built yet
- Schema has `JobStatus: ACTIVE, ARCHIVED, CLOSED` — no `DRAFT` status

---

## 12. OrgSettingsPage

### Profile Details
| UI Field | Schema Field | Status |
|---|---|---|
| Display Name | `UpdateOrganisationInput.name` | ✅ |
| Region | `UpdateOrganisationInput.region` | ✅ |
| About Us | `UpdateOrganisationInput.description` | ✅ |
| Social links | `UpdateOrganisationInput.socialLinks: SocialLinksInput` | ✅ |
| Website URL | `UpdateOrganisationInput.websiteUrl` | ✅ |
| Logo/avatar | `UpdateOrganisationInput.logoUrl` | ✅ |

### Account & Access
| UI Field | Schema Field | Status |
|---|---|---|
| Email (read-only) | `User.email` | ✅ |
| Password change | Firebase Auth (client-side) | ✅ |
| Deactivate org | ❌ No `deactivateOrganisation` mutation | ❌ |
| Delete permanently | ❌ No `deleteOrganisation` mutation | ❌ |

### Team & Role Management
| UI Element | Schema | Status |
|---|---|---|
| Team member list (name, role, status) | ❌ No `TeamMember` type in schema | 🔒 |
| Role dropdown (ADMIN/EDITOR/HIRING/MARKETPLACE) | ❌ Not in schema | 🔒 |
| Invite Member | ❌ No `inviteTeamMember` mutation | 🔒 |

**Blueprint tier: Standard.** UI is ahead of schema here.

### Site Preferences
| UI Field | Schema Field | Status |
|---|---|---|
| Region | `User.region` | ✅ |
| Currency preference | ❌ Not in schema | ❌ |
| Time Zone | ❌ Not in schema | ❌ |
| Email notification toggles | ❌ Not in schema | ❌ |

---

## Summary — Schema Gaps to Fix Before Wiring

### Must fix (will break on wiring)

| # | Gap | Fix |
|---|---|---|
| 1 | `EventCategory` missing: `BIBLE_STUDY`, `MUSIC`, `OTHER` | Add to enum in `events.graphql` |
| 2 | `LocationType` mismatch: UI `IN_PERSON`/`ONLINE` vs schema `PHYSICAL`/`VIRTUAL` | Align UI enum values to match schema |
| 3 | `ApplicationStatus` missing `HIRED` | Add `HIRED` to enum or rename to `OFFERED` in `classifieds.graphql` |
| 4 | `JobApplication` has no `experience`, `resumeUrl`, `cvUrl` | Add fields or remove columns from UI |
| 5 | No `orgApplications` query | Add `orgJobApplications(organisationId: ID!): [JobApplication!]!` to classifieds queries |
| 6 | `MarketplaceItem` has no `location`/`area` field | Add `area: String` or remove from UI/form |
| 7 | `CreateEventInput.imageUrl` is single string, UI allows up to 10 | Change to `imageUrls: [String!]` |
| 8 | `JobListing` has no `responsibilities` field | Add `responsibilities: String` to `JobListing` and `CreateJobListingInput` |
| 9 | Salary `SalaryRangeInput` requires `currency` but UI has no currency field | Add currency selector to `CreateJobsForm` |

### Should add (features partially built in UI)

| # | Gap | Fix |
|---|---|---|
| 10 | No `viewCount` on `Event`, `JobListing`, `MarketplaceItem` | Add `viewCount: Int!` to each type |
| 11 | No org-level analytics | Add `orgStats(organisationId: ID!): OrgStats` to `subgraph-admin` |
| 12 | No `Notification` type | Add `Notification` type + queries to identity or new subgraph |
| 13 | No `tagline` on `Organisation` | Add `tagline: String` to `Organisation` and update inputs |
| 14 | No `listingCount` on `Organisation` | Add computed/resolved field or derived count |
| 15 | `isRecurring` filter missing from `events()` query args | Add `isRecurring: Boolean` filter param |
| 16 | `EventStatus` + `ListingStatus` + `JobStatus` have no `DRAFT` | Add `DRAFT` value to each enum |
| 17 | `enquiryCount`/`offersCount` on `MarketplaceItem` | Add `enquiryCount: Int!` field |
| 18 | `applicationCount` on `JobListing` | Add resolved `applicationCount: Int!` field |
| 19 | No `deactivateOrganisation`/`deleteOrganisation` mutations | Add to identity schema |

### Standard-tier (deferred — do not implement yet)

| # | Gap |
|---|---|
| 20 | `ChatThread` + `Message` types (MarketplaceMessages UI built, no schema) |
| 21 | Team member management (TeamMember type, roles, invite mutation) |
| 22 | Currency/timezone preference on User/Organisation |
| 23 | Email notification preferences model |
| 24 | Resume/CV upload on JobApplication |

---

## Is the Approach Good?

**Yes — mock-first UI is the right call for Phase 1.** Design and UX can be validated fast without waiting for resolvers. The structure is solid.

**Three things to tighten up:**

1. **Enum alignment first, everything else second.** Items #1–3 in the "must fix" list are pure string mismatches that will cause GraphQL type errors the moment you wire anything. Fix the enums in the schema files (5-minute job) before touching Apollo Client.

2. **The analytics gap is the biggest architectural risk.** Analytics (views, clicks, CTR) affects 3 pages (Overview, Events, Listings, Jobs) and there is zero schema support for it. Decide now: per-entity counters (`viewCount` field on each type, incremented on query) vs. a separate analytics store queried in `subgraph-admin`. The per-entity counter approach is simpler for Phase 1.

3. **`MarketplaceItem` is missing `location`/`area`.** Both the Listings page and `CreateListingForm` surface it prominently. Since the blueprint says "general location (area, not precise address)", just add `area: String` to the type and input — single line change.
