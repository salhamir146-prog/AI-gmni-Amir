// Cloudflare Pages Function — /api/memory
// Long-term memory backed by Cloudflare KV. Requires a KV namespace bound
// to this Pages project with the exact binding name: USER_MEMORY
//
// GET    /api/memory?uid=xxx     -> { memory: "..." }
// POST   /api/memory { uid, memory } -> overwrite stored memory
// DELETE /api/memory?uid=xxx     -> erase stored memory

export async function onRequestGet(context) {
  const { request, env } = context;
  const uid = new URL(request.url).searchParams.get('uid');
  if (!uid) return json({ error: 'شناسه کاربر (uid) ارسال نشده است.' }, 400);
  if (!env.USER_MEMORY) return json({ error: 'KV namespace با نام USER_MEMORY به این پروژه متصل نشده است.' }, 500);

  const memory = await env.USER_MEMORY.get(uid);
  return json({ memory: memory || '' }, 200);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  if (!body.uid) return json({ error: 'شناسه کاربر (uid) ارسال نشده است.' }, 400);
  if (!env.USER_MEMORY) return json({ error: 'KV namespace با نام USER_MEMORY به این پروژه متصل نشده است.' }, 500);

  const memory = (body.memory || '').toString().slice(0, 8000); // keep KV entries small & cheap
  await env.USER_MEMORY.put(body.uid, memory);
  return json({ ok: true, memory }, 200);
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const uid = new URL(request.url).searchParams.get('uid');
  if (!uid) return json({ error: 'شناسه کاربر (uid) ارسال نشده است.' }, 400);
  if (!env.USER_MEMORY) return json({ error: 'KV namespace با نام USER_MEMORY به این پروژه متصل نشده است.' }, 500);

  await env.USER_MEMORY.delete(uid);
  return json({ ok: true }, 200);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}
