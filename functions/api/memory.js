export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // مدیریت درخواست‌های Preflight CORS
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1️⃣ دریافت حافظه (GET)
    if (request.method === "GET") {
      if (!uid || !env.MEMORY_KV) {
        return new Response(JSON.stringify({ memory: "" }), { headers: corsHeaders });
      }
      const memory = (await env.MEMORY_KV.get(uid)) || "";
      return new Response(JSON.stringify({ memory }), { headers: corsHeaders });
    }

    // 2️⃣ ذخیره حافظه (POST)
    if (request.method === "POST") {
      const body = await request.json();
      if (body.uid && body.memory !== undefined && env.MEMORY_KV) {
        await env.MEMORY_KV.put(body.uid, body.memory);
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // 3️⃣ حذف حافظه (DELETE)
    if (request.method === "DELETE") {
      if (uid && env.MEMORY_KV) {
        await env.MEMORY_KV.delete(uid);
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
