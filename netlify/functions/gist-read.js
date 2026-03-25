/**
 * gist-read.js — 从 GitHub Gist 读取 Chronicle 数据
 * 环境变量: GITHUB_TOKEN (在 Netlify 后台设置)
 */
exports.handler = async (event) => {
  // CORS 预检
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Gist-ID',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Gist-ID',
    'Content-Type': 'application/json'
  };

  // 从请求头或查询参数获取 Gist ID
  const gistId = event.headers['x-gist-id'] || event.headers['X-Gist-ID'] || event.queryStringParameters?.id;
  if (!gistId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 Gist ID (请在 X-Gist-ID 请求头中传入)' }) };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: '服务器未配置 GITHUB_TOKEN' }) };
  }

  try {
    const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'chronicle-cloud'
      }
    });

    if (resp.status === 404) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Gist 不存在，请检查 ID 是否正确' }) };
    }
    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: resp.status, headers, body: JSON.stringify({ error: `GitHub API 错误: ${errText}` }) };
    }

    const gist = await resp.json();
    const dataFile = gist.files?.['chronicle-data.json'];
    if (!dataFile) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Gist 中未找到 chronicle-data.json 文件' }) };
    }

    const content = JSON.parse(dataFile.content || '{}');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: content,
        updatedAt: gist.updated_at,
        gistId: gist.id
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
