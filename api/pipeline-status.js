// Public, read-only. Lists open issues/PRs labeled "awaiting-human" so the
// dashboard can render a "REQUIRES YOUR CONFIRMATION" badge instead of you
// having to check GitHub directly. Also reports the single most-recently
// active open project/requirement + which stage it's in, so the dashboard
// can answer "is anyone working on anything right now, and what." No
// secret needed here (this only reads data that's already public on the
// repo) — mutations go through /api/answer.js and /api/run-agent-step.js
// instead, which are guarded.

const REPO = 'developerdaddy69-create/retro-dev';

function stageFor(labels) {
  const names = (labels || []).map((l) => (typeof l === 'string' ? l : l.name));
  if (names.includes('uat')) return 'UAT Review';
  if (names.includes('design')) return 'Design';
  if (names.includes('prd') || names.includes('intake')) return 'Requirement Intake (Product Manager)';
  return 'In Development';
}

module.exports = async (req, res) => {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  // Use the token if present (higher rate limit), but this works unauthenticated too.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const [awaitingRes, allOpenRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${REPO}/issues?state=open&labels=awaiting-human&per_page=20`, { headers }),
    fetch(`https://api.github.com/repos/${REPO}/issues?state=open&sort=updated&direction=desc&per_page=20`, { headers }),
  ]);

  if (!awaitingRes.ok) {
    res.status(502).json({ error: 'GitHub API failed', detail: await awaitingRes.text() });
    return;
  }

  const issues = await awaitingRes.json();
  const pending = issues.map((i) => ({
    number: i.number,
    title: i.title,
    url: i.html_url,
    is_pull_request: Boolean(i.pull_request),
    updated_at: i.updated_at,
    // Last ~400 chars of the body as a preview snippet for the bubble/badge.
    snippet: (i.body || '').slice(-400),
  }));

  let current = null;
  if (allOpenRes.ok) {
    const allOpen = (await allOpenRes.json()).filter((i) => !i.pull_request);
    if (allOpen.length) {
      const top = allOpen[0];
      const names = (top.labels || []).map((l) => l.name);
      current = {
        number: top.number,
        title: top.title,
        url: top.html_url,
        stage: stageFor(top.labels),
        awaiting_human: names.includes('awaiting-human'),
        updated_at: top.updated_at,
      };
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ pending, current });
};
