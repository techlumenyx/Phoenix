# PROJECT BLUEPRINT: CHRISTIAN LISTINGS PLATFORM

You are an expert enterprise software architect and senior full-stack engineer. We are building **Christian Listings**, a high-performance community platform designed for faith communities and diaspora audiences, enabling event discovery, job recruitment, and peer-to-peer marketplace trading.

Your goal is to build this application strictly adhering to the technical architecture, service boundaries, and feature roadmap outlined below.

---

## 1. TECH STACK & SYSTEM ARCHITECTURE

```
                  [ Vite + React SPA Client ]
                              │ (GraphQL / WebSockets)
                              ▼
                     [ Apollo Router / Gateway ]
                              │ (Federated Subgraphs)
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Identity & Orgs │  │  Events Module  │  │  Jobs & Market  │
│    Service      │  │    Service      │  │     Service     │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────┐       │       ┌────────────┘
                      ▼       ▼       ▼
                [ Shared MongoDB Atlas Cluster ]
                (Distinct Databases per Service)
```

### Frontend Ecosystem
* **Framework:** React SPA built with **Vite** (TypeScript optimized).
* **Styling:** **Tailwind CSS** for a clean, modern, and highly scannable UI.
* **State & Data Fetching:** **Apollo Client** for declarative GraphQL data fetching, caching, and mutations.
* **Local State Management:** **Zustand** for lightweight, global client-side UI states (e.g., modals, active filters, regional settings).
* **Authentication:** **Firebase Auth** handling the client token lifecycle.

### Backend & API Gateway
* **Architecture:** Distributed **Microservices Engine** (Max 3-4 target services).
* **Runtime:** **Node.js** (TypeScript) using Express/Fastify.
* **API Protocol:** **GraphQL Federation (Apollo Federation / Router)**. A central gateway stitches the subgraphs together into a single unified schema endpoint for the client.
* **Media Storage:** **Cloudinary** for automated image compression, optimization, and CDN delivery.

### Database Layer
* **Infrastructure:** A single **MongoDB Cluster**.
* **Isolation Strategy:** Logical separation. Each microservice connects to its own **distinct database instance** within the cluster to prevent cross-service database coupling.

---

## 2. MICROSERVICES DOMAIN BOUNDARIES

To avoid distributed monolith traps, schemas must extend entities cleanly across subgraphs via `@key` directives.

### Service 1: Identity & Profiles Service (`subgraph-identity`)
* **Responsibilities:** Firebase UID resolution, user profiles, organisation setups, verification states, and follow graphs.
* **Core Entities:** `User`, `Organisation`, `FollowRelationship`, `VerificationRequest`.

### Service 2: Community Events Service (`subgraph-events`)
* **Responsibilities:** Event creation, scheduling mechanics, recursive rules, and RSVP logic.
* **Core Entities:** `Event`, `RSVP`, `EventTemplate`.
* **Federation Link:** Extends `Organisation` from Identity to assign host fields.

### Service 3: Jobs & Marketplace Service (`subgraph-classifieds`)
* **Responsibilities:** Professional opportunities, applications, peer-to-peer item listings, internal messaging threads, and currency estimations.
* **Core Entities:** `JobListing`, `JobApplication`, `MarketplaceItem`, `ChatThread`, `Message`.
* **Federation Link:** Extends `User` (for buyers/sellers) and `Organisation` (for recruiters).

### Service 4: Administration & Analytics Service (`subgraph-admin`)
* **Responsibilities:** Platform moderation queues, audit logs, automated flagging evaluations, global metrics calculations, and system rule injection.
* **Core Entities:** `ModerationReport`, `AuditLog`, `SystemFlagRule`.

---

## 3. CORE DOMAIN DATA SCHEMAS (GRAPHQL REFERENCE)

```graphql
# Subgraph: Identity
type User @key(fields: "id") {
  id: ID!
  firebaseUid: String!
  email: String!
  name: String!
  region: String!
  isVerified: Boolean!
  savedItems: SavedHub!
}

type Organisation @key(fields: "id") {
  id: ID!
  name: String!
  logoUrl: String
  region: String!
  isVerified: Boolean!
  verificationTier: VerificationTier!
  followerCount: Int!
}

# Subgraph: Events (Extends Organisation)
extend type Organisation @key(fields: "id") {
  id: ID! @external
  events: [Event!]!
}

type Event @key(fields: "id") {
  id: ID!
  title: String!
  description: String!
  category: EventCategory!
  date: String!
  location: LocationInput!
  hosts: [Organisation!]!
  rsvpCount: Int!
  capacityLimit: Int
  waitlist: [User!]!
}

# Subgraph: Classifieds (Extends User & Organisation)
type JobListing @key(fields: "id") {
  id: ID!
  title: String!
  organisation: Organisation! @provides(fields: "name isVerified")
  roleType: RoleType!
  skillsRequired: [String!]!
  applicationDeadline: String!
  externalApplyUrl: String
}

type MarketplaceItem @key(fields: "id") {
  id: ID!
  title: String!
  seller: User!
  price: Float!
  currency: String!
  condition: ItemCondition!
  status: ListingStatus!
  isDonation: Boolean!
}
```

---

## 4. SYSTEM BOUNDARY RULES & CONSTRAINTS

* **Regional Architecture:** Filter scopes operate broadly at the **Country/State level**. All content queries must intercept the user's header/session region parameter to weight relevant streams first.
* **Data Integrity Rule:** Microservices cannot query another service's database collections directly. Inter-service data assembly must happen exclusively through **GraphQL Federation resolutions** or asynchronous message passing.
* **Asynchronous Content Safety:** Whenever listings or accounts get flags, they automatically pipe into the `subgraph-admin` queue. Content that hits 3 independent user flags triggers an immediate status alteration to `PENDING_REVIEW` on its origin service database.
* **Currency Conversion Strategy:** For early iterations, stub out an asynchronous helper class `CurrencyConverter` inside the Classifieds service that reads mock JSON conversion configurations. This will safely map incoming cross-border item calculations on client requests without mutating base document prices.

---

## 5. DEVELOPMENT ROADMAP

When assisting me in building features, prioritize them strictly based on their classification category:

| Phase | Module Focus | Included Features |
| :--- | :--- | :--- |
| **Phase 1: Basic (MVP)** | Foundational Infrastructure | Intelligent Home Feed, Universal Search, Region Personalisation, Event Creation & RSVP Funnel, External Job Applies, Marketplace Listings & Compression Engine, Verification Approval Queues, Audit Logs. |
| **Phase 2: Standard** | Engagement & Scale Engine | Org Follow Systems, Saved Item Hubs, Ticket URL Routing, In-Platform Job Application Pipelines, Candidate Trackers, Buyer-Seller Messaging, Counter-Offer Workflows, AI Fake Listing Deflections. |

---

**Instruction for AI Coding Agent:** When I ask you to generate components, endpoints, or schema designs, always check which microservice domain the context belongs to and structure your responses cleanly according to these design specifications.


## DELIVERABLE FEATURES
Home & Discovery
The home portal is the first thing every user sees after logging in. It is engineered to surface the most relevant content from all modules in a single, personalised stream - reducing friction and increasing engagement from the first visit.

Feature
What It Does
Category
Intelligent Home Feed
Content stream pulling from Events, Jobs, Marketplace, and Org updates - weighted by the user's region.
Basic
Universal Smart Search
A single search bar queries all content types simultaneously - events, jobs, listings, and organisations. Results are grouped, filterable by type, region, date, and category.
Basic
Region Selector & Personalisation
Users select their home region on sign-up. The feed, currency defaults, and event relevance are all tuned to this preference. Easily changed at any time from home page.
Basic
Highlights & Featured Strip
A curated carousel at the top of the feed - maintained by admins - showcasing promoted events, top organisations, and platform announcements. Premium placement available when paid.
Basic
Verified Badge System
A trust indicator displayed on all verified users and organisation profiles. Built into every content card shown in the feed for instant credibility signalling.
Basic
Profile System (Member & Org)
Personal profiles showing activity and verification status.
Basic
Follow & Unfollow Organisations
Users follow orgs they care about. Posts from those orgs appear prioritised in their feed. Follow counts are shown publicly to signal community reach.
Standard
Saved Items Hub
A dedicated 'Saved' section aggregating bookmarked events, jobs, and marketplace listings in one place - no need to hunt across modules.
Standard
Trending & Popular Events Signals
Social proof indicators (view count, RSVP count) displayed on event cards to drive FOMO-based engagement and increase click-through.
Standard




Events Module
The highest-priority and highest-traffic module. Designed to be the go-to destination for faith community event discovery - from Sunday services to charity fundraisers to regional conferences.

Feature
What It Does
Category
Event Creation & Publishing
Rich event creation form: title, description, category (Worship / Welfare / Charity / Community / Conference), date, time, duration, physical or virtual location, and region tag. Published instantly on submission.
Basic
Event Listing & Discovery Page
Browsable grid/list/carousel of all events with thumbnail, date, category badge, and RSVP count. Filterable by region, category, date range, and organisation.
Basic
Three-Stage RSVP Funnel
Interested (soft signal) → Saved (bookmarked, no commitment) → Confirmed RSVP (firm attendance). Each stage triggers different visibility and notification rules - maximising soft engagement before asking for commitment.
Basic
Event Detail Page
Full-page view with event description, organiser profile card, map/virtual link, RSVP breakdown, attendee count, and share button. SEO-friendly public URL.
Basic
Capacity Limit & Waitlist Engine
Organisers set a maximum attendee count. Once full, users join a waitlist automatically promoted when a confirmed RSVP drops out.
Basic
Event Categories & Smart Filters
Category taxonomy (Worship, Welfare, Charity, Youth, Conference, Cultural) with filter chips on the discovery page. Filter combinations are deep-linkable.
Basic
RSVP Confirmation & Reminder Emails
Automated transactional emails sent on RSVP confirmation, with a follow-up reminder 24 hours before the event. Org-branded where applicable.
Basic
Event Sharing & Social Distribution
One-click share to WhatsApp, X, Facebook, and copy-link. Generates a rich preview card (OG tags) for link previews on social platforms.
Basic
Promoted / Featured Event Placement
Organisations pay to boost their event into the featured strip on the home feed and the top of the Events page for their region. Clearly labelled as promoted (pay to remove label)
Basic
Recurring Event Scheduling
Organisers set weekly or monthly repeat cadences. Each occurrence is individually listed but grouped under a series banner. RSVP to all or individual dates.
Standard
Free & Ticketed Event Support
Events marked as free require no additional setup. Ticketed events link to an external payment URL (Eventbrite, Stripe, etc.) - no in-platform payment required at this stage.
Standard
Event Photo Gallery
Organisers upload up to 10 photos to the event listing. After the event, a post-event recap gallery can be added for community memory and social sharing.
Standard
Event Templates
Frequently run events (weekly service, monthly prayer meeting) can be saved as reusable templates - reducing creation time to under 60 seconds.
Standard
Co-Host & Collaborative Events
Two or more verified organisations can co-post an event, with both appearing as hosts on the listing. Useful for inter-church and charity partnerships.
Standard





Job Listings Module
Connecting people seeking purposeful, mission-aligned work with charities, NGOs, churches, and social enterprises. Built for the full spectrum - from paid positions to volunteer roles and short-term internships.

Feature
What It Does
Category
Job Listing Creation
Organisations post roles with: title, description, responsibilities, role type (Paid / Volunteer / Internship), location (Physical / Remote / Hybrid), region tag, salary range (optional), and application deadline.
Basic
Job Discovery & Browsing
Searchable, filterable directory of all active listings. Filters: role type, region, category, skill tags, remote-only toggle. Sort by newest, deadline, or relevance.
Basic
Skill-Based Tagging & Filtering
Organisations tag roles with required skills (e.g. Counselling, Accounting, Driving Licence, Social Media, Project Management). Candidates filter by skill match - improving relevance.
Basic
External Apply Redirect
The Apply button redirects candidates to the organisation's own application form or email - zero platform complexity, full org control. Identical to the LinkedIn/Indeed model.
Basic
Auto-Archive on Deadline
Listings automatically move to an archived state when their application deadline passes - keeping the board clean without manual admin. Orgs receive a reminder 48 hours before.
Basic
Organisation Profile on Listings
Each listing displays the posting org's name, verified badge, and a clickable link to their full Christian Listings profile - giving candidates context and confidence before applying.
Basic
Promoted Job Pinning
Organisations pay to pin a role at the top of the job board for their region for a defined period. Ideal for urgent or high-priority hires.
Basic
Download data from applications
Organisations can download the data in a CSV Format.
Basic
Org Applicant Dashboard
Verified orgs see all applications per listing in a sortable table. Mark candidates as Shortlisted, Under Review, or Rejected.
Standard
Save Jobs to Profile
Candidates bookmark any listing to their profile's Saved Jobs tab. Saved jobs are easily revisited and removed. No sign-up required to browse, but sign-up required to save.
Standard
In-Platform Application Form
Candidates apply directly within Christian Listings - name, email, cover note, and CV upload. Orgs receive applications in their dashboard without needing an external form.
Standard
Application Status Tracker
Candidates see a live status column per application: Submitted → Under Review → Outcome. Orgs update statuses from their dashboard - simple, transparent, trusted.
Standard
Job Alert Notifications
Candidates save a keyword + region combination as a job alert. When a matching listing is posted, they receive an email instantly. Increases return visits.
Standard
Faith-Alignment Tags
Roles tagged as 'Open to All' or 'Faith Background Preferred' - giving candidates clarity upfront. Reduces application friction and mismatched expectations.
Standard





Marketplace Module
A peer-to-peer community marketplace inspired by Facebook Marketplace and OLX, built for a faith and diaspora audience. Christian Listings facilitates discovery and connection - all payments and logistics remain between buyer and seller.

Feature
What It Does
Category
Listing Creation
Sellers post items with: title, description, condition (New / Like New / Good / Fair), price, category, region, and general location (area, not precise address). Listing status: Available / Reserved / Sold.
Basic
Photo Upload (up to 8 images)
Sellers upload up to 8 product photos per listing. Images are automatically compressed and optimised for fast loading on mobile networks - critical for the target audience.
Basic
Category & Condition Filters
Browse by category (Electronics, Clothing, Books, Furniture, Food, Baby & Kids, Charity Items, Other) and condition. Combined filters with region selection narrow results instantly.
Basic
Charity Donation Listings
Sellers mark a listing as a free donation to someone in need. Donation listings receive a special badge, appear in a dedicated 'Community Gives' section, and are prioritised in the home feed.
Basic
Seller Verification Badge
Sellers who have completed identity verification display a badge on their listings - building trust in a community marketplace where personal accountability matters.
Basic
Content Reporting on Listings
Any user can report a listing as spam, fraudulent, or inappropriate. Reports are queued for admin review. Three reports trigger automatic temporary suspension pending review.
Basic
Live Currency Conversion Display
Prices are shown in the seller's regional currency. Buyers from other regions see an automatic conversion estimate powered by a live exchange rate feed. Labelled as an estimate - not a quoted price.
Basic
Social Links on Seller Profile
Verified sellers can link their WhatsApp, Instagram, or Facebook on their marketplace profile - giving buyers additional ways to connect and verify the seller's identity.
Basic
Promoted Listing Boost
Sellers pay to feature their listing at the top of the relevant category and in the home feed for a defined period. Clearly labelled as promoted.
Basic
Buyer-Seller Messaging Thread
Interested buyers click 'Contact Seller' to open a private in-platform messaging thread. The platform facilitates the initial connection; all negotiation, payment, and delivery happen directly between parties.
Standard
Offer / Negotiate Flow
Buyers can submit a price offer directly from the listing page. Sellers accept, decline, or counter from their dashboard. Negotiation history is stored in the message thread.
Standard
Video Upload Support
Sellers add up to 1 short video (max 15-30 seconds) per listing - showing condition, size, or demonstration. Video is transcoded and delivered via CDN for smooth playback.
Standard
Saved Search Alerts
Users save a search query (e.g. 'baby clothes Lagos') and receive an email notification when a new matching listing is posted. Drives repeat visits.
Standard
Wishlist / Wanted Ads
Users post a 'Wanted' listing describing what they're looking for. Sellers who have that item can respond directly. Reverses the discovery model - demand drives supply.
Standard


Organisation User Dashboard
The command centre for every verified organisation on Christian Listings - churches, charities, and NGOs. Designed to make community management effortless, even for non-technical staff.

Feature
What It Does
Category
Org Profile Management
Edit organisation name, description, logo, contact details, social links, and regional tags. Changes reflect instantly across all associated listings and the public org profile page.
Basic
Unified Listing Dashboard
A single view of all active events, job listings, and marketplace items posted by the organisation. Filter by status (active, archived, pending approval), module, or date.
Basic
Information Board Management
Post, edit, and delete announcements, prayer requests, and community updates directly from the dashboard. Posts appear on the org's public profile and in followers' feeds.
Basic
Notification Centre
In-dashboard inbox for org-level alerts: new followers, RSVP milestones, job application received, listing reported, verification status updates.
Basic
Post Templates Library
Orgs save frequently-used event and job listing structures as reusable templates. Pre-filled fields, standard categories, and description starters - dramatically reduces repeat posting time.
Standard
Follower Overview
See total follower count and growth over time. Understand which posts drove the most new follows. Simple, honest metrics with no unnecessary complexity.
Standard
Team Member Access
Org admins invite team members to co-manage the dashboard. Role permissions: Admin (full access) or Editor (create/edit posts, no account settings). Up to 5 team members on Recommended tier.
Standard
Event RSVP Analytics
Per-event breakdown: Interested count, Saved count, Confirmed RSVPs, attendance rate (if check-in is used), and a day-by-day RSVP trend chart.
Standard
Job Application Management
Sortable table of all applicants per listing. Status management (Shortlist / Reject / Pending). Notes per applicant. CSV export for HR handover.
Standard
Promoted Placement Manager
Self-serve promotion tool: choose a listing, select duration, see the estimated reach, and confirm. Payment via Razorpay. Active promotions shown with remaining time and performance stats.
Standard


Admin Console & Moderation Portal
The operational backbone of the platform - giving trusted administrators complete visibility and control over content, users, organisations, promotions, and platform presentation.

Feature
What It Does
Category
Moderation Dashboard
Central command view: reported content queue, pending org verifications, flagged listings, and recent admin actions. Priority-sorted so the most urgent items surface first.
Basic
Content Moderation Actions
Admins can Approve (dismiss report), Warn (send formal notice to poster), Remove (take content down), Suspend (temporary restriction), or Ban (permanent removal). All actions are one-click.
Basic
Organisation Verification Workflow
Review submitted registration documents, approve or reject with a reason, and trigger the verified badge issuance. Rejection reasons are templated for consistency and sent to the org automatically.
Basic
Audit Log
Every admin action is recorded with: action type, content affected, admin identity, timestamp, and reason given. Immutable. Exportable. Essential for accountability and dispute resolution.
Basic
Platform Analytics Overview
Top-level metrics: total users, new sign-ups (daily/weekly/monthly), active events, RSVP volume, job listing activity, marketplace listing count, and moderation action rates.
Basic
Charity & NGO Verification Tier
A separate, enhanced verification pathway for charities and NGOs - requiring charity registration number validation (UK: Charity Commission API; International: document review). Org receives a distinct 'Registered Charity' badge on their profile.
Standard
User Account Management
Search, view, and manage any user account: see activity history, apply restrictions, reset verification status, or permanently remove. Identity details visible only to admins.
Standard
Appeals Queue
Users whose content is removed or account suspended may file one appeal per incident. Appeals appear in a dedicated queue, reviewed by a senior admin with full context shown.
Standard
Automated Flagging Rules Engine
Configurable rule sets that automatically flag content meeting risk thresholds: repeated reports, suspicious pricing, banned keywords, duplicate listings. Flagged items enter the moderation queue without waiting for user reports.
Standard
Promoted Placement Management
Admins view all active and past promoted listings. Set pricing per placement type, approve or reject promotion requests, and manually feature content in the highlights strip.
Standard
AI-Assisted Fake Listing Detection
The platform analyses new listings against patterns associated with fraudulent or misleading posts (stock photos, price outliers, duplicate descriptions, suspicious contact details) and auto-raises a flag for admin review. Reduces manual scanning workload by an estimated 60–70%.
Standard

Ad-Sense Integration
The Platform shall include integration with an external advertising service to enable display of third-party advertisements across designated placements within the Platform. The specific ad network provider will be confirmed with the Client prior to commencement of this workstream.
