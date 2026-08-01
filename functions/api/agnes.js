// =========================================================
// 🚀 Cloudflare Pages Function for Agnes AI (/api/agnes)
// =========================================================
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const prompt = body.prompt;

    // خواندن کلید API ایگنس از Environment Variables کلودفلر
    const AGNES_KEY = env.AGNES_API_KEY || env.AGNES_KEY || env.GEMINI_API_KEY;

    if (!AGNES_KEY) {
      return new Response(JSON.stringify({ error: 'کلید API در کلودفلر یافت نشد! لطفا در تنظیمات کلودفلر AGNES_API_KEY را ست کنید.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🎯 ارسال مستقیم درخواست به endpoint رسمی Agnes AI (نه گوگل!)
    const response = await fetch('https://agnes-ai.com/api/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGNES_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: `خطای سرور کلودفلر: ${err.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
