# apps/cli — Learner CLI Tool

**Owner:** Developer 9 (CLI / Local Engineering Environment)
**Tech:** Node.js, TypeScript
**Binary:** `engsim`

---

## Purpose

The local engineering environment for learners. Learners use the CLI to:
- Authenticate with the platform
- Download and initialize a task in their local environment
- Run tests locally before submitting
- Submit their code for grading
- Check grading status
- Retrieve grading results

---

## Target Learner Flow

```
engsim login
→ engsim init <attemptId>
→ (Learner modifies code in their editor)
→ engsim test
→ engsim submit
→ engsim status
→ engsim result
```

---

## Commands

| Command | Description | Phase |
|---|---|---|
| `engsim login` | Authenticate with the platform, store device token | MVP |
| `engsim init <attemptId>` | Download task environment to local folder | MVP |
| `engsim test` | Run public tests locally (Docker) | MVP |
| `engsim submit` | Submit the learner's changes for grading | MVP |
| `engsim status` | Check the grading status of the last submission | MVP |
| `engsim result` | Fetch and display the grading result | MVP |
| `engsim help` | Show help | MVP |
| `engsim version` | Show CLI version | MVP |

---

## Structure

```
apps/cli/src/
├── index.ts           # CLI entry point (commander or similar)
├── commands/
│   ├── login.ts
│   ├── init.ts
│   ├── test.ts
│   ├── submit.ts
│   ├── status.ts
│   └── result.ts
├── auth/
│   └── deviceToken.ts  # Store and retrieve device token
├── api/
│   └── client.ts       # API client (calls apps/api)
└── types.ts
```

---

## Authentication

- `engsim login` opens a browser-based Supabase Auth flow.
- On completion, a device token is issued by the API and stored locally.
- Token stored at: `~/.engsim/config.json` (config directory, not the task directory).
- Device token is scoped to the learner and their device.
- Token is sent as `Authorization: Bearer <token>` on all API calls.

---

## Task Directory

When a learner runs `engsim init <attemptId>`, the CLI creates:

```
./<task-slug>/
├── README.md          # Task instructions
├── docker-compose.yml # Reference system
└── src/               # Files the learner can modify
    └── ...
```

**The CLI only accesses files within this task folder.**

---

## Submission

`engsim submit` creates a unified diff (patch) of changes relative to the original task state and POSTs it to:

```
POST /v1/attempts/:id/submissions
```

The CLI does NOT upload the entire project — only the patch.

---

## Error Messages

All error messages must be:
- Human-readable
- Actionable ("Run `engsim login` first")
- No stack traces shown to the learner (log to file for debugging)

---

## Dependencies

| Package | Usage |
|---|---|
| `packages/contracts` | API request/response types |
| `apps/api` | All API calls |
| Docker (local) | `engsim test` — run public tests locally |

---

## Privacy Requirements (CRITICAL)

The CLI must NOT:
- Collect raw keystrokes
- Read terminal history
- Record the screen
- Read files outside the task directory
- Store or transmit learner secrets (passwords, SSH keys, env vars)
- Read unrelated machine files

The CLI ONLY transmits:
- The submission patch (diff of task directory changes)
- The device token (for auth)

---

## What This Developer Must NOT Implement

- Any server-side logic (belongs to `apps/api`)
- Grading logic (belongs to `packages/evaluator`)
- AI features (belongs to `packages/ai`)
- Content authoring (belongs to `packages/content`)
- Multi-task workspaces [FUTURE]
- Proctored mode (AI-off enforcement) [FUTURE — Phase 5]
- Screen recording [NEVER]
- Keystroke logging [NEVER]

---

## Testing Requirements

- E2E tests using a real API in test mode.
- Test each command's happy path and common error paths.
- Test that the CLI only accesses the task directory.
- Test token storage and retrieval.
- CI must run CLI tests without a real Docker engine (mock Docker where needed).
