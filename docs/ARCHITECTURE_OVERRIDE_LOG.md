# Architecture Override Log

> Version: 1.0
> Phase: Architecture Execution Layer Phase 4
> Purpose: Record all exceptions to canonical enforcement rules
> Authority: `/docs/ARCHITECTURE_EXECUTION_PROTOCOL.md` §3, §4

---

## Log Schema

Every override entry MUST include the following fields:

| Field | Required | Description |
|-------|----------|-------------|
| `timestamp` | YES | ISO 8601 datetime of override request |
| `module_name` | YES | Full file path of the module being excepted |
| `violation_type` | YES | One of: `duplication`, `canonical_bypass`, `similarity_breach`, `naming_pattern`, `experimental_import`, `other` |
| `justification` | YES | Detailed explanation of why the canonical path is insufficient |
| `proposed_by` | YES | GitHub username or identifier of requester |
| `approval_status` | YES | `pending`, `approved`, or `rejected` |
| `approved_by` | YES if approved | GitHub username of architecture maintainer who approved |
| `resolution_path` | YES | One of: `extend`, `compose`, `refactor`, `exception_granted` |
| `registry_update` | YES | Link or description of how `FEATURE_REGISTRY.md` was updated |
| `expiry_date` | NO | If applicable, when this override expires and must be re-reviewed |
| `notes` | NO | Any additional context |

---

## Log Entries

<!-- New entries are appended at the BOTTOM. Do not edit historical entries. -->

---

*No entries yet. Log initialized during Architecture Execution Layer Phase 4.*

---

## Template (Copy for new entries)

```markdown
### [YYYY-MM-DD] — [Short description]

| Field | Value |
|-------|-------|
| **timestamp** | `2026-05-29T09:00:00+08:00` |
| **module_name** | `src/path/to/Module.tsx` |
| **violation_type** | `duplication` |
| **justification** | [Why existing canonical cannot be used] |
| **proposed_by** | `@username` |
| **approval_status** | `pending` |
| **approved_by** | (to be filled if approved) |
| **resolution_path** | `exception_granted` |
| **registry_update** | [How registry was updated to reflect this override] |
| **expiry_date** | (optional) |
| **notes** | (optional) |
```

---

*Last updated: Architecture Execution Layer Phase 4*
