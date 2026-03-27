export async function onRequestPost(context) {
  const gistId = context.request.headers.get('X-Gist-ID');
  const githubToken = context.env.GITHUB_TOKEN;
  const body = await context.request.json();

  if (!gistId || !body.data) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  try {
    const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'Cloudflare-Pages-Function',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'chronicle.json': {
            content: JSON.stringify(body.data, null, 2)
          }
        }
      })
    });

    if (!resp.ok) throw new Error('Failed to update Gist');

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}