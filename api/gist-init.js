export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const githubToken = process.env.GITHUB_TOKEN;

  try {
    const resp = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'Chronicle',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Chronicle Cloud Sync',
        public: false,
        files: {
          'chronicle.json': {
            content: '{}'
          }
        }
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`GitHub API ${resp.status}: ${errText}`);
    }

    const data = await resp.json();
    return res.status(200).json({ gistId: data.id });
  } catch (err) {
    console.error('gist-init error:', err);
    return res.status(500).json({ error: err.message });
  }
}
