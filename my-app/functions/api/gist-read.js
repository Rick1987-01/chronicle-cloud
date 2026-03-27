export async function onRequestGet(context) {
  const gistId = context.request.headers.get('X-Gist-ID');
  const githubToken = context.env.GITHUB_TOKEN; // 环境变量，稍后在后台设置

  if (!gistId) {
    return new Response(JSON.stringify({ error: 'Missing Gist ID' }), { status: 400 });
  }

  try {
    const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'Cloudflare-Pages-Function'
      }
    });

    if (!resp.ok) throw new Error('GitHub API error');

    const gistData = await resp.json();
    const content = gistData.files['chronicle.json'].content;

    return new Response(JSON.stringify({ data: JSON.parse(content) }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}