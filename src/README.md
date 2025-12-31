# Plugin Source (Template)

This directory contains the original Payload plugin template code.

**Current status:** Template/placeholder - not the content model.

The actual content model implementation lives in `/dev`:
- `/dev/collections/` - Pages, PageVariants, Experiments, Leads, AnalyticsEvents, ReusableBlocks
- `/dev/utils/` - Block resolution, variant assignment, visitor ID, experiment stats
- `/dev/validators/` - Field and page-level validation
- `/dev/endpoints/` - Resolved page API endpoints
- `/dev/components/` - Admin dashboard components

When plugin extraction happens, code from `/dev` will be moved here following the Payload plugin architecture pattern.
