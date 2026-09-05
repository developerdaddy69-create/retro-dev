# PRD v1 — RetroDev Synapse: Autonomous Requirement-to-Deployment Pipeline

**Status: LOCKED.** Intake complete (2 rounds), no open questions remaining.

## Requirement (as given)

"We are making an autonomous AI agent application where we give a
requirement and it does the thing for me" — i.e. the product **is** the
RetroDev Synapse pipeline itself: submit a requirement, the pipeline
autonomously builds/tests/deploys/markets it, visualized live on the retro
dashboard.

## Locked decisions (from intake rounds 1–2)

| Question | Decision |
|---|---|
| Who uses it | Single operator (you) only — no auth/multi-tenancy in v1 |
| What gets produced | Real, deployed software (not just a plan/demo) |
| Autonomy level | Fully autonomous end-to-end once triggered, except the 3 hard checkpoints (PRD lock, UAT sign-off, publish approval) |
| Execution engine | Claude Code scheduled/cron sessions — no separate Anthropic API billing; a session wakes on an interval, advances whichever pipeline step is due, goes back to sleep |
| Primary UI | The retro Phaser dashboard itself, extended with a requirement-submission form — one app for both input and live viewing |

## Acceptance criteria (v1)

1. From the dashboard, you can type a requirement into a form and submit it.
2. Submission creates a `PRD: <feature>` GitHub Issue (using the existing
   `prd-intake` template) with the Product Manager's restatement + round-1
   clarifying questions — via a Vercel serverless function brokering the
   GitHub API call (so no token is ever exposed client-side).
3. A Claude Code scheduled task wakes on an interval, inspects repo/issue
   state, and advances whichever agent step is next due (PM answering
   once you reply, Developer building, QA testing, DevOps deploying, UAT
   checklist, Social Expert drafting), posting updates back to GitHub.
4. The dashboard visualizes every real event (not the mock feed) by
   polling GitHub's API/webhook relay for issue/PR/deployment activity.
5. The pipeline correctly pauses at all 3 hard checkpoints and only
   resumes after your explicit input in the relevant GitHub thread.
6. At least one real, trivial requirement runs successfully end-to-end
   through to a UAT deployment. Marketing output remains a draft only in
   v1 (no Buffer connection required yet — that's explicitly out of
   scope below).

## Out of scope for v1

- Multi-user accounts, public signup, billing.
- Anthropic-API-key-based instant webhook reactions (deferred — cron
  polling is the free-tier-compatible choice for now; revisit if latency
  becomes a real problem).
- Automated marketing publishing (Buffer connection) — copy drafting only.
- Real Kenney.nl sprite art (placeholder rectangles remain acceptable).

## Immediate next build steps (Developer)

1. Add `api/submit-requirement.js` (Vercel serverless function) that
   receives `{requirement}` from the dashboard form and opens the GitHub
   issue via the GitHub REST API, using a `GITHUB_TOKEN` stored as a
   Vercel environment variable (server-side only).
2. Add the requirement-submission form to `dashboard/index.html`.
3. Set up a Claude Code scheduled task (cron) that polls the repo's open
   `prd`/pipeline issues and advances the next due step.
4. Swap the dashboard's mock event feed for real polling against GitHub's
   API (issues, PRs, deployments).
