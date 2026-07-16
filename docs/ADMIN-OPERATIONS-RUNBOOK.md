# Admin Operations Runbook

Last updated: 15 July 2026

## Release gate

Before deploying the admin portal:

1. Run `npm run codegen` and compose the supergraph after schema changes.
2. Run affected lint, test, and production build targets.
3. Confirm `ADMIN_ALLOWED_ORIGINS`, `INTERNAL_SERVICE_KEY`, Firebase Admin, MongoDB, and internal service URLs are configured.
4. Confirm the production Router uses `router.production.yaml`; introspection, Sandbox, and subgraph error details must remain disabled.
5. Provision a least-privilege test admin and complete the operator acceptance checklist below.

## Monitoring and alert response

The System Health page is the first operational check. Treat these as launch alerts:

- **Command reconciliation DOWN:** a canonical service accepted an action but the admin workflow did not finish. The background reconciler retries every minute. Do not repeat the moderation action. Escalate if it remains unresolved for five minutes.
- **Subgraph DOWN:** verify its `/health` endpoint, container status, MongoDB access, and recent deployment logs. Use the request ID from the UI when tracing a failed action.
- **Audit export failure:** retry only after checking MongoDB capacity and admin-service logs. Exports are limited to 31 days and 10,000 rows.
- **Verification SLA or moderation backlog:** reassign work through the queue; do not modify workflow collections directly.

Logs must never contain Firebase tokens, verification URLs, contact details, job applications, or raw service credentials. Operational errors should use request/correlation IDs.

## Backup

MongoDB Atlas production deployments should use managed continuous backups. Before a risky admin release or migration, take an additional scoped dump:

```powershell
npm run admin:backup
```

The script creates a compressed `cl_admin` dump and SHA-256 checksum under `backups/`, which is gitignored. Copy the encrypted artifact to the approved restricted backup location and apply the organisation retention policy.

## Restore drill

Restore into a non-production cluster first and verify the checksum. Extract the archive, then run:

```powershell
powershell -ExecutionPolicy Bypass -File tools/scripts/restore-admin.ps1 `
  -BackupDirectory C:\path\to\extracted-dump `
  -ConfirmRestore RESTORE-cl_admin
```

After restoration, validate queue counts, open a moderation case, inspect an audit timeline, and request a bounded audit export. Production restore requires an incident owner and a maintenance window.

## Rollback

Roll back application images to the last known-good immutable tag. Do not roll back MongoDB documents unless the incident owner confirms a data migration caused corruption. Cross-service command records and audit events are append-only operational evidence and must be retained.

## Admin operator acceptance checklist

- Sign-in rejects a normal community account and a disabled admin.
- Each staff role sees only its permitted routes and server actions.
- Submit three distinct marketplace reports; confirm reversible pending-review visibility.
- Assign and resolve a case; confirm canonical listing state, organisation notification, and audit event.
- Attempt a stale second resolution and confirm it is rejected.
- Review verification documents with a reviewer account and confirm access is audited.
- Confirm an auditor cannot open verification documents or mutate operational records.
- Create, activate, and review template history.
- Schedule, pause, preview, and reorder a regional placement.
- Request and download a bounded audit export.
- Verify keyboard navigation, visible focus, Escape dismissal, responsive tables, and reduced-motion behaviour.
- Confirm System Health reports all required dependencies and no unresolved reconciliation commands.
