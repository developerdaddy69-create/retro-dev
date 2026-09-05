// Public, read-only. Lists open issues/PRs labeled "awaiting-human" so the
// dashboard can render a "REQUIRES YOUR CONFIRMATION" badge instead of you
// having to check GitHub directly. No secret needed here (this only reads
// data that's already public on the repo) — mutations go through
// /api/answer.js instead, which is guarded.

const REPO = 'developerdaddy69-create/retro-dev';

module.exports = async (req, res) => {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  // Use the token if present (higher rate limit), but this works unauthenticated too.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const ghRes = await fetch(
    `https://api.github.com/repos/${REPO}/issues?state=open&labels=awaiting-human&per_page=20`,
    { headers }
  );

  if (!ghRes.ok) {
    res.status(502).json({ error: 'GitHub API failed', detail: await ghRes.text() });
    return;
  }

  const issues = await ghRes.json();
  const pending = issues.map((i) => ({
    number: i.number,
    title: i.title,
    url: i.html_url,
    is_pull_request: Boolean(i.pull_request),
    updated_at: i.updated_at,
    // Last ~400 chars of the body as a preview snippet for the bubble/badge.
    snippet: (i.body || '').slice(-400),
  }));

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ pending });
};
