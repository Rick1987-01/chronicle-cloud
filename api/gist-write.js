export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gist-ID');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gistId = req.headers['x-gist-id'];
  const githubToken = process.env.GITHUB_TOKEN;

  if (!gistId || !req.body?.data) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'Chronicle',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'chronicle.json': {
            content: JSON.stringify(req.body.data, null, 2)
          }
        }
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`GitHub API ${resp.status}: ${errText}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('gist-write error:', err);
    return res.status(500).json({ error: err.message });
  }
}
