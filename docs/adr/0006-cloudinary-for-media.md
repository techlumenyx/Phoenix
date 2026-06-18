# ADR 0006 — Cloudinary for Media Storage and Delivery

**Status:** Accepted

## Context

The platform needs image uploads for: marketplace item photos (up to 8), event banners, and organisation logos. Requirements:
- Automatic compression and resizing
- Fast CDN delivery globally
- Simple upload API that doesn't require managing S3 policies or CloudFront distributions

Options: AWS S3 + CloudFront, Firebase Storage, Cloudinary, Uploadcare.

## Decision

Use **Cloudinary** for all media uploads, transformation, and CDN delivery.

The Cloudinary client (`cloudinaryClient`) is initialised once in `@christian-listings/utils/src/cloudinary/cloudinary-client.ts` and imported by `subgraph-classifieds` and `subgraph-events`. The web app never calls Cloudinary directly — all uploads go through GraphQL mutations.

## Consequences

**Positive:**
- Cloudinary's transformation pipeline (resize, compress, format conversion to WebP/AVIF) is handled at delivery time via URL parameters — no pre-processing needed on upload.
- Free tier covers MVP traffic comfortably.
- Single SDK import in `libs/utils` — credentials are not scattered across services.
- Upload returns a CDN URL immediately — stored in MongoDB as a plain string.

**Negative:**
- Cloudinary is an external SaaS dependency. Outages affect image uploads but not the rest of the platform (images still serve from CDN cache).
- Uploading through a GraphQL mutation adds latency vs. direct-to-Cloudinary upload from the browser. For Phase 2, consider Cloudinary's signed upload preset to allow direct browser uploads.
- Costs scale with transformations and bandwidth. Monitor Cloudinary usage as the marketplace grows.
