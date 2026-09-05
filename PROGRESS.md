# RetroDev Synapse — Build Progress

Tracks implementation of [MANIFEST_PLAN_V6.md](../MANIFEST_PLAN_V6.md)
against this working directory (`retrodev-synapse/`). Check items as they
land; each has a status: `done`, `in progress`, `blocked (needs you)`.

## Phase 0 — Scaffold
- [x] Directory structure created (`.claude/agents`, `.github`, `dashboard`,
      `docs`, `src`, `qa`, `deploy/dev`, `deploy/uat`, `marketing`, `log`)
- [x] `PROGRESS.md` (this file)

## Phase 1 — Agent configs (`.claude/agents/*.md`)
- [x] `product-manager.md` — intake loop (v6 §2), locks PRD, hands off to
      Designer (not straight to Developer)
- [x] `designer.md` — **new role, added 2026-09-05.** Turns the locked PRD
      into a visual + animation design spec in the Dribbble "3D Website"
      style (https://dribbble.com/tags/3d-website — immersive 3D/WebGL or
      Spline hero, GSAP/Framer Motion scroll-triggered animation,
      glassmorphism/depth, real micro-interactions). Same
      loop-until-explicitly-approved pattern as PM's intake and UAT's
      sign-off — this is now a 4th hard human checkpoint: the Developer
      may not start the visual build before `design_approved` fires.
- [x] `developer.md` — builds from the locked PRD **and** the
      human-approved `docs/DESIGN.v{n}.md`, asks PM (PRD) or Designer
      (design) when ambiguous, implements the named animation
      library for real rather than a static approximation
- [x] `qa-tester.md` — resolve-until-done loop (v6 §4), visibility summaries,
      deadlock detection
- [x] `devops.md` — dev deploy, smoke tests, UAT deploy
- [x] `uat-coordinator.md` — UAT checklist, go/no-go to you
- [x] `social-expert.md` — drafts marketing, waits for publish approval

## Phase 2 — GitHub templates & workflows (local files, ready to push)
- [x] `.github/ISSUE_TEMPLATE/prd-intake.md`
- [x] `.github/ISSUE_TEMPLATE/design-brief.md` — mirrors prd-intake's
      loop-until-approved pattern for the Designer's checkpoint
- [x] `.github/ISSUE_TEMPLATE/uat-checklist.md`
- [x] `design` label created on the live repo (teal `14b8a6`), alongside
      the existing `prd`/`intake`/`uat`/`awaiting-human` labels
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
- [x] Swap mock event feed for the real webhook relay (Phase 4)
- [x] Real Kenney.nl sprite sheets — cropped 6 character sprites + 3
      floor/furniture tiles from the CC0 "Tiny Dungeon" pack directly out of
      `Tilemap/tilemap.png` (the numbered `tile_NNNN.png` files don't map
      1:1 to grid position, so cropped by pixel math instead). Wired into
      `dashboard/index.html` via `preload()`/`this.add.image()`, replacing
      every placeholder rectangle/circle. Tiled floor texture + a desk/
      dresser prop per room. Verified live on Vercel, no console errors —
- [x] Open-plan office redesign: removed the six separate room boxes in
      favor of one shared floor, so agents visibly cross paths near each
      other's desks instead of pacing alone. Each agent has a desk with a
      procedurally-drawn pixel-art laptop (Kenney's pack has none) and a
      chair. `setWorking(key, working)` drives a real working/relaxing
      state machine: any real pipeline event for a room seats that agent
      at their desk with a small typing bob for 20s (auto-refreshed by
      further events); otherwise they free-roam the whole floor and
      occasionally pause for a drawn teacup ("tea break"). Verified live:
      triggering a test event visibly walks the agent to their desk.
- [x] Real office layout: split the floor into a distinct WORK ZONE (desk
      rows, green tint) and BREAK ROOM (coffee machine + benches, blue
      tint) with an aisle divider between them. "Relaxing" now specifically
      means walking over to the break room to mingle/have a coffee, not
      roaming the whole floor — desks stay empty until a real event seats
      that agent back at their own desk. Coffee machine + bench sprites are
      procedurally drawn (Kenney's pack has neither). Verified live:
      default state clusters everyone in the break room; triggering an
      event visibly walks that one agent back to their desk while the
      rest stay on break.
      see [dashboard/assets/CREDITS.md](dashboard/assets/CREDITS.md).
- [x] Added the 7th room, **Design Studio** (agent: Designer, character:
      Dara), matching the new `designer.md` role. Re-downloaded Kenney's
      Tiny Dungeon pack (the raw `tilemap.png` had been cleaned up after
      the first cropping pass) just to crop Dara's sprite — re-fetched the
      CC0 zip via the same `kenney.nl/assets/tiny-dungeon` page, cropped,
      then deleted the zip again. Work zone regridded to 4+3 desks (was
      3+3) to fit the new desk; `roomFor()` in `api/pipeline-events.js` now
      maps the `design` label to `design_studio`. Created the `design`
      label on the live repo and `.github/ISSUE_TEMPLATE/design-brief.md`.

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
- [x] Step 3: scheduled task `retrodev-pipeline-advancer` built, but
      **disabled** — it hung in "Running" forever on both attempts because
      an unattended run can't answer its own permission prompt (Bash/git/
      curl approval). Pivoted per your decision 2026-09-05: **I act as
      the next-due agent role live, in conversation, when you ask** —
      not truly unattended, but reliable, and avoids the scheduled-task
      permission deadlock. Revisit true autonomy later if it's worth
      another supervised-approval attempt.
- [x] Confirmation-badge loop verified end-to-end for real: PM posted
      real questions on issue #1 → you answered via the dashboard badge
      ("agreed"/"tesssssstttt") → I read the reply, closed out the issue
      (it was just the connectivity test), cleared the `awaiting-human`
      label → badge disappeared from the dashboard. Full loop works.
- [x] Step 4: `api/pipeline-events.js` turns GitHub's public repo activity
      feed (issue opens/closes/comments/labels, pushes, PR events) into
      room bubbles + ticker text. Verified live: real activity from
      issue #1 renders correctly on the dashboard, no mock data left
      anywhere (bubbles, ticker, waiting banner, confirmation badge all
      real now).

## Live run log (Phase 5)
- Issue #1 ("debug test") closed 2026-09-05 after confirming it was only
  the connectivity test.
- Issue #2 opened 2026-09-05 — real requirement (photo-studio booking
  site), currently sitting at PM intake, `prd`/`intake` labels, no
  `awaiting-human` yet (PM hasn't drafted round-1 questions).

## Step 5 — Real automation via the UI, not Claude Code (2026-09-05)
You explicitly did not want the pipeline depending on me acting live or on
Claude Code scheduled tasks (which deadlocked earlier — see Step 3 above).
Chose **"UI button, pay-per-click"** over a timer-based cron or continuing
to have me act live.

- [x] `api/run-agent-step.js` — new serverless function, guarded by the
      same `SUBMIT_SECRET` header as the other POST endpoints. Finds the
      single most-blocking open issue (priority order `prd` → `design` →
      `uat`, first one NOT already labeled `awaiting-human`), builds the
      full issue+comments thread as context, and calls the **Anthropic API
      directly** (forced tool-use for structured output) with a condensed
      version of that role's protocol from `.claude/agents/*.md`. Executes
      the model's decision for real: posts the comment, adds/removes
      labels, and — only on an explicit lock/approval — writes the final
      doc (`docs/PRD.v1.md` / `docs/DESIGN.v1.md`) via GitHub's Contents
      API.
- [x] Scope is deliberately the three GitHub-thread/conversation-driven
      roles (Product Manager, Designer, UAT Coordinator) — these read and
      decide over an issue thread, which a stateless API call handles
      well. Developer/DevOps (real code changes, CI, deploys) are **not**
      automated by this button — that needs a checked-out repo and a
      build/test pipeline, not a single API call. Flagged as a follow-up,
      not attempted here.
- [x] Dashboard: new "PIPELINE AUTOMATION" panel with a **Run Next
      Pipeline Step** button (reuses the same locally-saved operator
      secret as the submit box). One click = one real, billed Anthropic
      API call — deliberately not on a timer, so cost stays bounded to
      what you actually trigger. Result also plays as a real scene event
      (the matching agent's room animates) via `retrodevPlayEvent`.
- [ ] **Needs you to add `ANTHROPIC_API_KEY` in Vercel's project env vars**
      before the button will work (separate from `GITHUB_TOKEN` /
      `SUBMIT_SECRET`, which are already set). I cannot create or paste
      this key for you — Anthropic API keys are a credential, same rule as
      the GitHub PAT incident earlier this session. Get one from
      https://console.anthropic.com, add it in Vercel, then the button is
      live immediately (no redeploy needed for env var changes to take
      effect on the next function invocation).
- [ ] Model id defaults to `claude-sonnet-4-5-20250929`, overridable via
      an `ANTHROPIC_MODEL` env var if that id ever 404s against the live
      API.

## Still open from Phase 4
- [ ] `deploy-uat.yml` needs `VERCEL_TOKEN` (CLI-based alias promotion,
      behind the required-reviewer gate)
- [ ] GitHub Environment `uat` with required reviewers (you) not yet
      confirmed set up
- [ ] Cloudflare Workers relay / Buffer — deferred per PRD v1 (cron polling
      instead of instant webhooks; marketing stays draft-only for now)

## Next up
Waiting on you to add `ANTHROPIC_API_KEY` in Vercel, then click **Run Next
Pipeline Step** on the dashboard to run the Product Manager's first real
intake pass on issue #2 — no live conversation with me required for that
step anymore.
