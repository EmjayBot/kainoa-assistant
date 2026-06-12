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

  let status = 0, body = '';
  try {
    const r = await fetch(discourseUrl, { headers });
    status = r.status;
    body = await r.text();
  } catch (e) {
    status = 500;
    body = e.message;
  }

  const debug = {
    query: q,
    discourse_status: status,
    key_present: !!env.DISCOURSE_API_KEY,
    user_used: headers['Api-Username'],
    body_first_400_chars: body.slice(0, 400)
  };

  const html = `<pre>${JSON.stringify(debug, null, 2)}</pre>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}