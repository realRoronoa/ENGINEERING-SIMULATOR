# Privacy Policy (Engineering)

**This is an engineering privacy policy for internal development guidance.**
It defines what data the system collects, why, and what it explicitly does not collect.

---

## Data We Collect

The following data is collected to operate the learning platform:

| Data | Purpose | Retention |
|---|---|---|
| Learner account (email, name) | Authentication and identity | Until account deletion |
| Skill states and mastery | Personalized task selection | Indefinitely (learning record) |
| Attempt records | Grading and evidence | 2 years |
| Submission code | Grading (run in Docker, not stored raw) | Submission patch stored; deleted after evaluation |
| Evaluation results | Learner feedback and evidence | 2 years |
| Evidence events | Mastery model updates | 2 years |
| Hint events | Learning analytics | 1 year |
| Viva answers | Reasoning grading | 1 year |
| Transfer task results | Learning outcome measurement | 2 years |
| Mentor conversation | Personalized help | 90 days |
| Weekly reports | Learner progress | 1 year |
| AI call logs (anonymized) | Quality and cost monitoring | 90 days |
| Flags and disputes | Content quality | 1 year |

---

## Data We Explicitly Do NOT Collect

> These must never be collected, stored, or transmitted by any part of the system.

| Prohibited Data | Notes |
|---|---|
| **Raw keystrokes** | The CLI must not intercept or log individual keystrokes. |
| **Full terminal history** | The CLI does not read or transmit the learner's shell history. |
| **Screen recordings** | No screen capture of any kind. |
| **Learner secrets** | Passwords, API keys, SSH keys, environment variables from the learner's machine. |
| **Unrelated machine files** | The CLI accesses only the task directory, nothing else. |
| **Full mentor transcripts beyond retention window** | Mentor conversations are deleted after 90 days. |
| **Other learners' data** | Strictly scoped by RLS. |
| **Browsing history** | Not collected. |
| **Camera or microphone data** | Not collected (viva is text-based). |
| **IP address beyond rate limiting** | IP used only for rate limiting; not stored in learning records. |

---

## Data Minimization Principles

1. Collect only what is necessary for learning and evaluation.
2. Do not enrich learner data with third-party sources.
3. Do not share learner data with third parties beyond the LLM API (anonymized context only).
4. Do not use learner data for advertising or profiling outside the learning context.

---

## LLM Data Handling

When learner context is sent to the AI (mentor, viva, rubric grading):

- Use the learner's opaque UUID — never name, email, or institution.
- Send only the minimum context required for the task (fact sheet + learner answer).
- Do NOT send raw submission code to the LLM for correctness judgment.
- Data sent to OpenAI is governed by the OpenAI API data processing agreement.

---

## CLI Data Handling

The CLI must:

- Store the device token locally in `~/.engsim/config` only.
- Read only files within the task directory (`~/.engsim/tasks/<task-id>/`).
- Transmit only the submission patch (diff) to the API.
- Not transmit any other files from the learner's machine.

---

## Data Retention Schedule

| Data Type | Retention |
|---|---|
| Learner account | Until deletion request |
| Skill states | Indefinite (core record) |
| Attempts + submissions | 2 years |
| Evaluations + evidence | 2 years |
| Mentor conversations | 90 days |
| AI call logs | 90 days |
| Hint events | 1 year |
| Viva records | 1 year |
| Flags / disputes | 1 year |
| Weekly reports | 1 year |
| Raw submission patches | Deleted after evaluation stored |

---

## Learner Rights [FUTURE — Phase 3]

- Learners may request export of their learning record.
- Learners may request deletion of their account and data.
- Deletion purges all personal data within 30 days.
- Learning aggregate statistics (anonymized) may be retained for research.

---

## Engineering Responsibilities

Every developer must:

- Not add new data collection without updating this document.
- Not log learner PII in server logs.
- Not transmit prohibited data types from CLI.
- Not store full mentor transcripts beyond the retention window.
- Not send learner identifiers unnecessarily to external APIs.
