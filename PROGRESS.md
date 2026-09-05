# RetroDev Synapse — Build Progress

Tracks implementation of [MANIFEST_PLAN_V6.md](../MANIFEST_PLAN_V6.md)
against this working directory (`retrodev-synapse/`). Check items as they
land; each has a status: `done`, `in progress`, `blocked (needs you)`.

## Phase 0 — Scaffold
- [x] Directory structure created (`.claude/agents`, `.github`, `dashboard`,
      `docs`, `src`, `qa`, `deploy/dev`, `deploy/uat`, `marketing`, `log`)
- [x] `PROGRESS.md` (this file)

## Phase 1 — Agent configs (`.claude/agents/*.md`)
- [x] `product-manager.md` — intake loop (v6 §2), locks PRD
- [x] `developer.md` — builds from PRD, asks PM when ambiguous (v6 §3)
- [x] `qa-tester.md` — resolve-until-done loop (v6 §4), visibility summaries,
      deadlock detection
- [x] `devops.md` — dev deploy, smoke tests, UAT deploy
- [x] `uat-coordinator.md` — UAT checklist, go/no-go to you
- [x] `social-expert.md` — drafts marketing, waits for publish approval

## Phase 2 — GitHub templates & workflows (local files, ready to push)
- [x] `.github/ISSUE_TEMPLATE/prd-intake.md`
- [x] `.github/ISSUE_TEMPLATE/uat-checklist.md`
- [x] `.github/workflows/ci.yml` — runs Vitest/Playwright on every PR
- [x] `.github/workflows/deploy-dev.yml` — auto Vercel preview on merge
- [x] `.github/workflows/deploy-uat.yml` — gated by required-reviewer
      environment (this is the UAT human checkpoint, enforced by GitHub
      itself, not custom code)

## Phase 3 — Retro dashboard skeleton
- [x] `dashboard/index.html` — Phaser 3 scene, 6 rooms laid out, one sprite
      per room, idle animation, sample "conversation bubble" wired to a
      mock event feed (no live backend yet)
- [x] Verified in-browser: Phaser initializes cleanly (WebGL, no console
      errors), all 6 rooms render, sprites idle-animate, bubbles/ticker/
      "waiting on you" banner all fire correctly from the mock feed
- [ ] Swap mock event feed for the real webhook relay (Phase 4)
- [ ] Real Kenney.nl sprite sheets (currently placeholder colored rectangles
      so the scene runs standalone with zero external assets/downloads)

## Phase 4 — Live wiring (blocked — needs accounts/credentials only you can create)
- [x] GitHub repository created and scaffold pushed —
      https://github.com/developerdaddy69-create/retro-dev (branch `main`)
- [x] GitHub Actions confirmed enabled — workflows run automatically on
      push. Caught and fixed a real YAML syntax bug in `deploy-uat.yml`
      (backslash line-continuation inside a `run: |` block broke GitHub's
      parser) — see commit `a4dcfd1`.
- [x] Vercel connected (team `retro-dev1`, project `retro-dev`) — confirmed
      LIVE at https://retro-dev-eight.vercel.app/dashboard/index.html via
      Vercel's own native GitHub integration (zero secrets needed for this
      part, auto-deploys every push to `main`)
- [x] Added `vercel.json` rewrite so the bare domain root serves the
      dashboard too, instead of 404ing
- [x] Simplified `deploy-dev.yml`: it no longer redeploys via the Vercel
      CLI (redundant with Vercel's native integration, and needed 3
      secrets we don't have). It now reacts to Vercel's own
      `deployment_status` webhook and only runs smoke tests against
      whatever URL Vercel just deployed.
- [ ] `CI` will keep failing (`npm ci` — no `package.json` yet) until real
      application code exists in `src/`. Expected, not a bug.
- [ ] `deploy-uat.yml` still needs `VERCEL_TOKEN` (CLI-based alias
      promotion, behind the required-reviewer gate) — separate from the
      dev flow above.
- [ ] Connect Vercel (free tier) to the repo for dev-preview deploys
- [ ] Set up the GitHub Environment "uat" with required reviewers (you)
- [ ] Deploy the webhook→WebSocket relay (Cloudflare Workers free tier) and
      point the dashboard at it instead of the mock feed
- [ ] Connect Buffer (free tier) for post-approval marketing scheduling

I cannot create GitHub/Vercel/Cloudflare/Buffer accounts or push to a remote
on your behalf — those need your login. Everything up to that boundary
(Phases 0-3) is being built now as local files you can review, then push
yourself, or ask me to push once you've created the empty repo and given me
the remote URL.

## Phase 5 — PRD v1: RetroDev Synapse is its own product
Locked PRD: [docs/PRD.v1.md](docs/PRD.v1.md) — single operator, real
deployed output, fully autonomous via Claude Code scheduled/cron sessions,
dashboard doubles as the submission UI.

- [x] Step 1: `api/submit-requirement.js` — Vercel serverless function that
      brokers dashboard submissions into a GitHub Issue via `GITHUB_TOKEN`
      (server-side env var only), guarded by a `SUBMIT_SECRET` header
- [x] Step 2: requirement-submission form added to `dashboard/index.html`
- [x] End-to-end verified LIVE: submitted a real test requirement through
      the deployed dashboard → correctly created
      [issue #1](https://github.com/developerdaddy69-create/retro-dev/issues/1)
      with the right title, body, and `prd`/`intake` labels. Debugged and
      fixed a fine-grained-PAT permission gap along the way (`Issues` scope
      needed to be "Read and write") — see chat history for the exact fix.
- [ ] Step 3: set up a Claude Code scheduled/cron task that polls open
      `prd`/pipeline issues and advances the next due agent step (PM
      answering, Developer building, QA testing, etc.)
- [ ] Step 4: swap the dashboard's mock event feed for real polling
      against GitHub's API (issues, PRs, deployments)

## Still open from Phase 4
- [ ] `deploy-uat.yml` needs `VERCEL_TOKEN` (CLI-based alias promotion,
      behind the required-reviewer gate)
- [ ] GitHub Environment `uat` with required reviewers (you) not yet
      confirmed set up
- [ ] Cloudflare Workers relay / Buffer — deferred per PRD v1 (cron polling
      instead of instant webhooks; marketing stays draft-only for now)

## Next up
Build Phase 5 Step 3 — the Claude Code scheduled task that actually
advances the pipeline (starting with: answer issue #1's intake as the
Product Manager would, since that's the first real item in the queue).
