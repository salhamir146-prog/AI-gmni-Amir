// Cloudflare Pages Function — /api/video
// Veo video generation is asynchronous: POST starts a long-running operation,
// GET ?op=<operation-name> polls it until done.

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) return json({ error: 'کلید API تعریف نشده است.' }, 500);

    const model = body.model || 'veo-3.1-generate-preview';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:predictLongRunning?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt: body.prompt }] }),
    });
    const data = await response.json();
    if (!response.ok) return json({ error: data.error || { message: `خطای Veo API (کد ${response.status})` } }, response.status);
    return json(data, 200); // { name: "operations/xxxx", ... }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) return json({ error: 'کلید API تعریف نشده است.' }, 500);

    const opName = new URL(request.url).searchParams.get('op');
    if (!opName) return json({ error: 'شناسه عملیات (op) ارسال نشده است.' }, 400);

    const url = `https://generativelanguage.googleapis.com/v1beta/${opName}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) return json({ error: data.error || { message: `خطای بررسی وضعیت (کد ${response.status})` } }, response.status);
    return json(data, 200); // { done: bool, response: {...} }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}
