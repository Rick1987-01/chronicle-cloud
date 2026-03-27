export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gist-ID');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const gistId = req.headers['x-gist-id'];
  const githubToken = process.env.GITHUB_TOKEN;

  if (!gistId) {
    return res.status(400).json({ error: 'Missing Gist ID' });
  }

  try {
    const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'Chronicle'
      }
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ error: 'GitHub API error' });
    }

    const gistData = await resp.json();
    const file = gistData.files['chronicle.json'];
    if (!file) {
      return res.status(404).json({ error: 'chronicle.json not found in Gist' });
    }

    const content = JSON.parse(file.content);
    return res.status(200).json({ data: content });
  } catch (err) {
    console.error('gist-read error:', err);
    return res.status(500).json({ error: err.message });
  }
}
