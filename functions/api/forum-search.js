export async function onRequest(context) {
  const url = new URL(context.request.url);
  const q = url.searchParams.get('q') || '';

  const keySet = !!context.env.DISCOURSE_API_KEY;
  const userSet = !!context.env.DISCOURSE_API_USERNAME;
  const username = context.env.DISCOURSE_API_USERNAME || 'NOT SET';

  let discourseStatus = null;
  let discourseBody = null;

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
    discourseStatus = res.status;
    discourseBody = await res.text();
  } catch (err) {
    discourseBody = err.message;
  }

  const debug = `
KEY SET: ${keySet}
USER SET: ${userSet}
USERNAME: ${username}
DISCOURSE STATUS: ${discourseStatus}
DISCOURSE BODY: ${discourseBody}
  `.trim();

  return new Response(debug, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
