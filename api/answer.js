// Posts the human's answer as a GitHub issue comment, guarded the same way
// as /api/submit-requirement.js (SUBMIT_SECRET header, GITHUB_TOKEN server
// side only). Does NOT remove the "awaiting-human" label itself -- that's
// the responsible agent's job on its next scheduled run, once it has
// actually re-read the answer and decided whether the checkpoint is truly
// resolved (see product-manager.md / uat-coordinator.md).

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

  const issueNumber = parseInt(req.body && req.body.issue_number, 10);
  const answer = (req.body && req.body.answer || '').toString().trim();
  if (!issueNumber || !answer) {
    res.status(400).json({ error: 'issue_number and answer are required' });
    return;
  }
  if (answer.length > MAX_LEN) {
    res.status(400).json({ error: `answer must be under ${MAX_LEN} characters` });
    return;
  }

  if (!process.env.GITHUB_TOKEN) {
    res.status(500).json({ error: 'Server misconfigured: GITHUB_TOKEN not set' });
    return;
  }

  const ghRes = await fetch(
    `https://api.github.com/repos/${REPO}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ body: answer }),
    }
  );

  if (!ghRes.ok) {
    res.status(502).json({ error: 'GitHub comment failed', detail: await ghRes.text() });
    return;
  }

  const comment = await ghRes.json();
  res.status(201).json({ comment_url: comment.html_url });
};
