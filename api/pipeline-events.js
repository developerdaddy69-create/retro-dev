// Public, read-only. Turns GitHub's public repo activity feed into a small
// list of {ts, room, text} entries the dashboard can animate for real,
// replacing the old scripted mock sequence. No secret needed (public data).

const REPO = 'developerdaddy69-create/retro-dev';
const OWNER = 'developerdaddy69-create';

// Coarse label -> room mapping. Refined as more pipeline stages come online;
// for now most activity is intake (planning_deck) since that's the only
// stage actually in use.
function roomFor(labels) {
  const names = (labels || []).map((l) => (typeof l === 'string' ? l : l.name));
  if (names.includes('uat')) return 'uat_lounge';
  if (names.includes('design')) return 'design_studio';
  if (names.includes('prd') || names.includes('intake')) return 'planning_deck';
  return 'code_vault';
}

module.exports = async (req, res) => {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const ghRes = await fetch(`https://api.github.com/repos/${REPO}/events?per_page=30`, { headers });
  if (!ghRes.ok) {
    res.status(502).json({ error: 'GitHub API failed', detail: await ghRes.text() });
    return;
  }
  const events = await ghRes.json();

  const mapped = events.map((e) => {
    const actorIsHuman = e.actor && e.actor.login === OWNER;
    const who = actorIsHuman ? 'You' : 'Agent';
    switch (e.type) {
      case 'IssuesEvent': {
        const issue = e.payload.issue || {};
        const room = roomFor(issue.labels);
        if (e.payload.action === 'opened') return { ts: e.created_at, room: 'planning_deck', text: `New requirement: #${issue.number}` };
        if (e.payload.action === 'closed') return { ts: e.created_at, room, text: `Closed #${issue.number}` };
        if (e.payload.action === 'labeled' && e.payload.label && e.payload.label.name === 'awaiting-human') {
          return { ts: e.created_at, room, text: `#${issue.number} needs your confirmation` };
        }
        if (e.payload.action === 'unlabeled' && e.payload.label && e.payload.label.name === 'awaiting-human') {
          return { ts: e.created_at, room, text: `#${issue.number} confirmed, moving on` };
        }
        return null;
      }
      case 'IssueCommentEvent': {
        const issue = e.payload.issue || {};
        const room = roomFor(issue.labels);
        const snippet = (e.payload.comment.body || '').slice(0, 60);
        return { ts: e.created_at, room, text: `${who} on #${issue.number}: ${snippet}` };
      }
      case 'PushEvent': {
        const commits = e.payload.commits || [];
        const last = commits[commits.length - 1];
        return { ts: e.created_at, room: 'code_vault', text: `Push: ${last ? last.message.slice(0, 60) : ''}` };
      }
      case 'PullRequestEvent': {
        const pr = e.payload.pull_request || {};
        return { ts: e.created_at, room: 'broadcast_studio', text: `PR ${e.payload.action}: ${pr.title || ''}`.slice(0, 70) };
      }
      default:
        return null;
    }
  }).filter(Boolean);

  // Oldest first so the dashboard can play them in chronological order.
  mapped.reverse();

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ events: mapped.slice(-20) });
};
