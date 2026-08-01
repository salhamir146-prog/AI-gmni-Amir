// Cloudflare Pages Function — /api/agnes
// این فایل درخواست ساده فرانت‌اند (شامل prompt) را دریافت می‌کند و به Agnes می‌فرستد

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const apiKey = env.AGNES_API_KEY;
    if (!apiKey) {
      return json({ 
        error: 'کلید Agnes API در پنل کلودفلر تعریف نشده است. لطفاً AGNES_API_KEY را در Environment Variables قرار دهید.' 
      }, 500);
    }

    // Agnes AI از فرمت OpenAI استفاده می‌کند
    const url = 'https://agnes-ai.com/v1/images/generations';

    // دریافت مستقیم پرامپت از فرانت‌اند (که دکمه شما می‌فرستد)
    const promptText = body.prompt;

    if (!promptText || !promptText.trim()) {
      return json({ error: 'لطفاً متن توصیف تصویر را وارد کنید.' }, 400);
    }

    // ساخت بدنه‌ی درخواست استاندارد OpenAI
    const upstreamBody = {
      model: 'imagen-4.0', // یا مدل دیگر Agnes
      prompt: promptText,
      n: body.n || 1,
      size: body.size || '1024x1024',
      response_format: 'url'
    };

    // ارسال به Agnes
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(upstreamBody),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return json({ 
        error: data.error || { message: `خطای Agnes API (کد ${response.status})` } 
      }, response.status);
    }

    return json(data, 200);

  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { 
    status, 
    headers: { 'Content-Type': 'application/json' } 
  });
}
