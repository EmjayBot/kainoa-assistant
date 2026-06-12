export async function onRequest(context) {
  const url = new URL(context.request.url);
  const q = url.searchParams.get('q') || '';

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });
  }

  try {
    const res = await fetch(
      `https://forum.theeastpacific.com/search.json?q=${encodeURIComponent(q)}&include_blurbs=true`,
      {
        headers: {
          'Api-Key': context.env.DISCOURSE_API_KEY,
          'Api-Username': context.env.DISCOURSE_API_USERNAME,
          'Accept': 'application/json',
        }
      }
    );

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ posts: [], topics: [], error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}