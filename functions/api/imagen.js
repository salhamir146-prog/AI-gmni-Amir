// Cloudflare Pages Function — /api/imagen
// Uses dedicated IMAGEN_API_KEY and supports imagen-3.0-generate-001/002

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const apiKey = env.IMAGEN_API_KEY;
    if (!apiKey) {
      return json({ error: 'کلید اختصاصی تولید تصویر (IMAGEN_API_KEY) تعریف نشده است.' }, 500);
    }

    const model = body.model || 'imagen-3.0-generate-001';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:predict?key=${apiKey}`;

    const upstreamBody = {
      instances: [{ prompt: body.prompt }],
      parameters: {
        sampleCount: Math.min(Math.max(parseInt(body.sampleCount, 10) || 1, 1), 4),
        aspectRatio: body.aspectRatio || '1:1',
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upstreamBody),
    });

    const data = await response.json();
    if (!response.ok) {
      return json({ error: data.error || { message: `خطای Imagen API (کد ${response.status})` } }, response.status);
    }
    return json(data, 200);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}
