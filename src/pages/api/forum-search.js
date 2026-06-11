export async function GET({ url }) {
  const q = url.searchParams.get('q') || '';
  const forumUrl = `https://forum.theeastpacific.com/search.json?q=${encodeURIComponent(q)}`;
  
  try {
    const res = await fetch(forumUrl, {
      headers: { 'User-Agent': 'Kainoa-Bot/1.0' }
    });
    const data = await res.json();
    
    return new Response(JSON.stringify({
      topics: (data.topics || []).slice(0, 5).map(t => ({
        title: t.title,
        url: `https://forum.theeastpacific.com/t/${t.slug}/${t.id}`,
        excerpt: (t.excerpt || '').replace(/<[^>]*>/g, '')
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, topics: [] }), { status: 500 });
  }
}