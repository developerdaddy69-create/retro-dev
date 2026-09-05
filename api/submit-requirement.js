// Vercel serverless function (Node.js runtime, no framework/build step needed).
//
// Brokers requirement submissions from the dashboard into a GitHub Issue,
// so the GitHub token never has to live in client-side JS. Requires two
// Vercel environment variables (Project Settings -> Environment Variables,
// server-side only, never exposed to the browser):
//   GITHUB_TOKEN    - a fine-grained PAT with "Issues: write" on this repo
//   SUBMIT_SECRET   - a shared secret only you and the dashboard form know,
//                     so this public endpoint can't be used by strangers to
//                     spam-create issues in your repo (single-operator app,
//                     see PRD v1 §"Locked decisions").

const REPO = 'developerdaddy69-create/retro-dev';
const MAX_LEN = 4000;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  const secret = req.headers['x-retro-secret'];
  if (!process.env.SUBMIT_SECRET || secret !== process.env.SUBMIT_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const requirement = (req.body && req.body.requirement || '').toString().trim();
  if (!requirement) {
    res.status(400).json({ error: 'requirement is required' });
    return;
  }
  if (requirement.length > MAX_LEN) {
    res.status(400).json({ error: `requirement must be under ${MAX_LEN} characters` });
    return;
  }

  const titleSeed = requirement.split('\n')[0].slice(0, 60);
  const title = `PRD: ${titleSeed}${titleSeed.length === 60 ? '...' : ''}`;

  const body = [
    '## Requirement (as given)',
    '',
    requirement,
    '',
    '## PM\'s restatement',
    '',
    '_Pending — the scheduled Product Manager agent run will fill this in._',
    '',
    '## Clarifying questions — round 1',
    '',
    '_Pending — the scheduled Product Manager agent run will draft these on',
    'its next wake-up._',
    '',
    '## Developer clarification questions',
    '',
    '## Status',
    '',
    '- [ ] PRD locked (`docs/PRD.v{n}.md` written, `prd_ready` emitted)',
  ].join('\n');

  if (!process.env.GITHUB_TOKEN) {
    res.status(500).json({ error: 'Server misconfigured: GITHUB_TOKEN not set' });
    return;
  }

  const ghRes = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ title, body, labels: ['prd', 'intake'] }),
  });

  if (!ghRes.ok) {
    const detail = await ghRes.text();
    res.status(502).json({ error: 'GitHub issue creation failed', detail });
    return;
  }

  const issue = await ghRes.json();
  res.status(201).json({ issue_url: issue.html_url, issue_number: issue.number });
};
