# packages/shared — Shared Utilities

**Owner:** All Developers
**Tech:** TypeScript

---

## Purpose

A central location for shared utility functions, constants, and helpers that are used across multiple packages or apps, but do not belong in `packages/contracts` (which is strictly for types).

---

## What Belongs Here

- Generic helper functions (e.g., date formatting, string manipulation)
- Shared constants (e.g., standard regex patterns, configuration defaults)
- Custom errors that span multiple domains

## What Does NOT Belong Here

- Shared interfaces and types (these belong in `packages/contracts`)
- Domain-specific business logic (belongs in respective packages)
- Database access code (belongs in `packages/database`)
- React components (belongs in `apps/web`)

---

## Guidelines

- Keep utilities pure and stateless whenever possible.
- Avoid adding heavy third-party dependencies here, as they will bloat all consumers.
- Ensure thorough unit testing for all exported utilities.
