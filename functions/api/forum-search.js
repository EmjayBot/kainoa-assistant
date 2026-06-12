export async function onRequest(context) {
  const { request, env } = context;
  const q = new URL(request.url).searchParams.get('q') || 'test';
  const url = `https://forum.theeastpacific.com/search.json?q=${encodeURIComponent(q)}`;

  const headers = {
    'Api-Key': env.DISCOURSE_API_KEY,
    'Api-Username': env.DISCOURSE_API_USER || 'Kainoa-search',
    'User-Agent': 'KainoaBot/1.0'
  };

  const r = await fetch(url, { headers });
  const body = await r.text();

  console.log(JSON.stringify({
    forum: 'TEP',
    query: q,
    status: r.status,
    key_present: !!env.DISCOURSE_API_KEY,
    body_start: body.slice(0,200)
  }));

  return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
}