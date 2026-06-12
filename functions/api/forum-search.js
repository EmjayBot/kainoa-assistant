export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || 'test';

  const discourseUrl = `https://forum.thenorthpacific.org/search.json?q=${encodeURIComponent(q)}`;

  const headers = {
    'Api-Key': env.DISCOURSE_API_KEY,
    'Api-Username': env.DISCOURSE_API_USER || 'Kainoa-search',
    'User-Agent': 'KainoaBot/1.0'
  };

  let resp, text, status;
  try {
    resp = await fetch(discourseUrl, { headers });
    status = resp.status;
    text = await resp.text();
  } catch (e) {
    status = 500;
    text = e.message;
  }

  return new Response(JSON.stringify({
    query: q,
    discourse_status: status,
    discourse_url: discourseUrl,
    key_present: !!env.DISCOURSE_API_KEY,
    user_used: headers['Api-Username'],
    body_preview: text.slice(0, 500)
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}