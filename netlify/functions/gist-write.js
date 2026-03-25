/**
 * gist-write.js — 将 Chronicle 数据写入 GitHub Gist
 */
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Gist-ID',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Gist-ID',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: '仅支持 POST' }) };
  }

  const gistId = event.headers['x-gist-id'] || event.headers['X-Gist-ID'];
  if (!gistId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 Gist ID' }) };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: '服务器未配置 GITHUB_TOKEN' }) };
  }

  try {
    const { data } = JSON.parse(event.body);
    if (!data) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '请求体缺少 data 字段' }) };
    }

    const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'chronicle-cloud'
      },
      body: JSON.stringify({
        files: {
          'chronicle-data.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      return { statusCode: resp.status, headers, body: JSON.stringify({ error: `GitHub API: ${err}` }) };
    }

    const result = await resp.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, updatedAt: result.updated_at, gistId: result.id })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
