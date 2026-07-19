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

The Cloudinary client (`cloudinaryClient`) is initialised once in `@christian-listings/utils`. Identity, events, classifieds, and admin own their respective media assets. Browser uploads use authenticated, service-owned streaming endpoints; the browser never calls Cloudinary directly and binary data does not pass through Apollo Router.

Each owning database stores a `MediaAsset` record containing Cloudinary identifiers, purpose, owner, uploader, dimensions, duration, size, delivery URL/reference, and lifecycle status. Public images and videos use CDN delivery. CVs and verification documents are stored as private assets and exposed only as short-lived downloads after GraphQL authorization.

## Consequences

**Positive:**
- Cloudinary's transformation pipeline (resize, compress, format conversion to WebP/AVIF) is handled at delivery time via URL parameters — no pre-processing needed on upload.
- Free tier covers MVP traffic comfortably.
- Single SDK import in `libs/utils` — credentials are not scattered across services.
- Uploads return delivery data immediately while retaining Cloudinary asset identifiers for lifecycle management.

**Negative:**
- Cloudinary is an external SaaS dependency. Outages affect image uploads but not the rest of the platform (images still serve from CDN cache).
- Uploading through service endpoints adds backend bandwidth compared with signed direct uploads, but keeps credentials, authorization and file policy enforcement server-side.
- Costs scale with transformations and bandwidth. Monitor Cloudinary usage as the marketplace grows.
