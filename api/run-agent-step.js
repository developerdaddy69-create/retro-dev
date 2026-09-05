// POST, guarded by the same x-retro-secret header as submit-requirement.js
// and answer.js. Triggered by the dashboard's "RUN NEXT PIPELINE STEP"
// button -- this is the real, non-Claude-Code automation path: it calls
// the Anthropic API directly (needs its own ANTHROPIC_API_KEY, separate
// from GITHUB_TOKEN) to act as whichever agent role is next due, then
// writes the result back to GitHub for real. One click = one pipeline
// step, so cost is bounded to what the operator actually triggers.
//
// Scope (v1): the three GitHub-thread/conversation-driven roles --
// Product Manager (prd/intake), Designer (design), UAT Coordinator (uat).
// These read/discuss/decide over an issue thread, which this function can
// fully automate. The Developer/DevOps roles (writing real application
// code, running CI, deploying) are NOT automated here -- that needs a full
// checked-out repo + test/build pipeline, not a single stateless API call,
// and is a larger follow-up if you want it.

const REPO = 'developerdaddy69-create/retro-dev';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';

const STAGE_ORDER = ['prd', 'design', 'uat']; // earliest pipeline stage first

const ROLE_PROMPTS = {
  prd: {
    role: 'Product Manager',
    system: `You are the Product Manager for the RetroDev Synapse pipeline, acting autonomously via API (not Claude Code).
Turn the raw requirement into a locked PRD, never letting ambiguity pass silently.

Protocol:
- If this is the first pass (body still says "Pending"), write your restatement of the requirement plus a numbered list of clarifying questions (scope, target users, must-have vs nice-to-have, constraints, acceptance criteria) as your comment. Add the "awaiting-human" label (you're now waiting on them) -- do NOT add "awaiting-human" to add_labels if it is already on the issue.
- If the human has answered in the most recent comments: re-read their answers. If anything is still ambiguous or a new question arises, post another round of questions as your comment and keep "awaiting-human" in add_labels.
- Only if you have zero open questions after the human's answers: your comment should say the PRD is locked, put "awaiting-human" in remove_labels, and use write_file to create docs/PRD.v1.md with the final PRD (requirement restatement, scope, acceptance criteria).
- Never invent a human answer that was never given. Never lock a PRD you still have doubts about.`,
  },
  design: {
    role: 'Designer',
    system: `You are the Product Designer for the RetroDev Synapse pipeline, acting autonomously via API (not Claude Code).
Every design must follow the Dribbble "3D Website" tag style (https://dribbble.com/tags/3d-website): an immersive 3D/WebGL or Spline hero, scroll-triggered animation (GSAP ScrollTrigger or Framer Motion) on every major section, real hover micro-interactions, a depth-driven visual language (glassmorphism, layered z-depth), and named easing/library choices -- never a flat static description.

Protocol:
- If this is the first pass, write a design draft covering page/section structure, palette + typography, the animation spec per section (naming the concrete library/approach), and open design questions, as your comment. Add "awaiting-human" to add_labels.
- If the human has given feedback in the most recent comments and it's not an unambiguous "approved": revise and post the update as your comment, keeping "awaiting-human" in add_labels.
- Only on the human's EXPLICIT approval (e.g. "approved", "go ahead", "looks good, build it" -- never silence or an unrelated reply): your comment should confirm the design is locked, put "awaiting-human" in remove_labels, and use write_file to create docs/DESIGN.v1.md with the final spec.
- Never treat anything short of explicit approval as a green light.`,
  },
  uat: {
    role: 'UAT Coordinator',
    system: `You are the UAT Coordinator for the RetroDev Synapse pipeline, acting autonomously via API (not Claude Code).
You run the UAT checklist against the PRD's acceptance criteria and require an explicit human go/no-go before marketing starts.

Protocol:
- Work through the checklist in the issue body/comments. If items are unchecked, post your findings for those items as your comment (what you verified, pass/fail with concrete detail).
- Once every item is verified passing: your comment should say UAT is ready for review and ask the human for explicit go/no-go. Add "awaiting-human" to add_labels.
- Only on the human's EXPLICIT approval: your comment should confirm UAT sign-off, put "awaiting-human" in remove_labels.
- Never treat a fully-ticked checklist as authorization on its own -- the human's explicit go/no-go is required.`,
  },
};

async function gh(path, token, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...opts.headers,
    },
  });
  return res;
}

async function findNextIssue(token) {
  const res = await gh(`/repos/${REPO}/issues?state=open&per_page=50`, token);
  if (!res.ok) throw new Error(`GitHub list issues failed: ${await res.text()}`);
  const issues = (await res.json()).filter((i) => !i.pull_request);

  for (const stage of STAGE_ORDER) {
    const candidates = issues
      .filter((i) => i.labels.some((l) => l.name === stage))
      .filter((i) => !i.labels.some((l) => l.name === 'awaiting-human'))
      .sort((a, b) => a.number - b.number);
    if (candidates.length) return { issue: candidates[0], stage };
  }
  return null;
}

async function callClaude(apiKey, system, userText) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: userText }],
      tools: [{
        name: 'pipeline_action',
        description: 'Record the single next action to take on this GitHub issue thread.',
        input_schema: {
          type: 'object',
          properties: {
            comment: { type: 'string', description: 'Markdown comment to post to the issue thread.' },
            add_labels: { type: 'array', items: { type: 'string' } },
            remove_labels: { type: 'array', items: { type: 'string' } },
            write_file: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                content: { type: 'string' },
                commit_message: { type: 'string' },
              },
            },
            summary: { type: 'string', description: 'One-sentence human-readable summary for the dashboard UI.' },
          },
          required: ['comment', 'summary'],
        },
      }],
      tool_choice: { type: 'tool', name: 'pipeline_action' },
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  const toolUse = (data.content || []).find((b) => b.type === 'tool_use');
  if (!toolUse) throw new Error('Model did not return a pipeline_action tool call');
  return toolUse.input;
}

async function writeFile(token, path, content, message) {
  const getRes = await gh(`/repos/${REPO}/contents/${path}`, token);
  const sha = getRes.ok ? (await getRes.json()).sha : undefined;
  const putRes = await gh(`/repos/${REPO}/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: 'main',
      ...(sha ? { sha } : {}),
    }),
  });
  if (!putRes.ok) throw new Error(`GitHub write ${path} failed: ${await putRes.text()}`);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (req.headers['x-retro-secret'] !== process.env.SUBMIT_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const githubToken = process.env.GITHUB_TOKEN;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!githubToken) { res.status(500).json({ error: 'GITHUB_TOKEN not configured' }); return; }
  if (!anthropicKey) { res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured -- add it in Vercel project settings' }); return; }

  try {
    const next = await findNextIssue(githubToken);
    if (!next) {
      res.status(200).json({ ok: true, action_taken: false, summary: 'Nothing to do -- every open thread is already waiting on you, or there is no active work.' });
      return;
    }
    const { issue, stage } = next;
    const rolePrompt = ROLE_PROMPTS[stage];

    const commentsRes = await gh(`/repos/${REPO}/issues/${issue.number}/comments`, githubToken);
    const comments = commentsRes.ok ? await commentsRes.json() : [];
    const threadText = [
      `Issue #${issue.number}: ${issue.title}`,
      `Labels: ${issue.labels.map((l) => l.name).join(', ')}`,
      '--- BODY ---',
      issue.body || '(empty)',
      '--- COMMENTS (chronological) ---',
      comments.map((c) => `[${c.user.login} @ ${c.created_at}]\n${c.body}`).join('\n\n') || '(no comments yet)',
    ].join('\n\n');

    const action = await callClaude(anthropicKey, rolePrompt.system, threadText);

    await gh(`/repos/${REPO}/issues/${issue.number}/comments`, githubToken, {
      method: 'POST',
      body: JSON.stringify({ body: action.comment }),
    });

    if (action.add_labels && action.add_labels.length) {
      await gh(`/repos/${REPO}/issues/${issue.number}/labels`, githubToken, {
        method: 'POST',
        body: JSON.stringify({ labels: action.add_labels }),
      });
    }
    if (action.remove_labels && action.remove_labels.length) {
      for (const label of action.remove_labels) {
        await gh(`/repos/${REPO}/issues/${issue.number}/labels/${encodeURIComponent(label)}`, githubToken, { method: 'DELETE' });
      }
    }
    if (action.write_file && action.write_file.path && action.write_file.content) {
      await writeFile(githubToken, action.write_file.path, action.write_file.content, action.write_file.commit_message || `${rolePrompt.role}: ${action.summary}`);
    }

    res.status(200).json({
      ok: true,
      action_taken: true,
      role: rolePrompt.role,
      issue_number: issue.number,
      issue_url: issue.html_url,
      summary: action.summary,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
