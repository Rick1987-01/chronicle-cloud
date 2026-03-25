/**
 * gist-init.js — 首次使用时创建一个私有 Gist
 */
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: '仅支持 POST' }) };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: '服务器未配置 GITHUB_TOKEN' }) };
  }

  try {
    const resp = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'chronicle-cloud'
      },
      body: JSON.stringify({
        description: 'Chronicle 云端数据备份',
        public: false,
        files: {
          'chronicle-data.json': {
            content: JSON.stringify({
              tasks: [],
              groups: [],
              version: 2,
              createdAt: new Date().toISOString()
            }, null, 2)
          }
        }
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: resp.status, headers, body: JSON.stringify({ error: `GitHub API: ${errText}` }) };
    }

    const gist = await resp.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        gistId: gist.id,
        url: gist.html_url
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
