// Cloudflare Pages Function — /api/agnes
// این فایل درخواست‌های فرانت‌اند (که ممکن است شامل ساختار Gemini باشد) را گرفته،
// آنها را به فرمت استاندارد OpenAI (که Agnes AI می‌فهمد) تبدیل می‌کند.

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

    // Agnes AI از فرمت OpenAI برای تولید تصویر استفاده می‌کند
    const url = 'https://agnes-ai.com/v1/images/generations';

    // --- پردازش هوشمند ورودی ---
    // ممکن است فرانت‌اند (دکمه شما) ساختار Gemini (با contents) بفرستد،
    // یا ممکن است در حالت عادی فقط { prompt } بفرستد.
    // ما اینجا هوشمندانه پرامپت را استخراج می‌کنیم.
    
    let promptText = '';

    // حالت 1: اگر فرانت‌اند با ساختار Gemini (دکمه‌ی جدید شما) فرستاده باشد
    if (body.contents && Array.isArray(body.contents)) {
      // تمام متن‌های کاربر را با هم ترکیب می‌کنیم
      promptText = body.contents
        .filter(c => c.role === 'user')
        .flatMap(c => c.parts || [])
        .filter(p => p.text)
        .map(p => p.text)
        .join(' ');
    } 
    // حالت 2: اگر فرانت‌اند مستقیم پرامپت فرستاده باشد (مثل حالت عادی)
    else if (body.prompt) {
      promptText = body.prompt;
    } 
    // حالت 3: اگر هیچکدام نبود، فال‌بک به متن خالی
    else {
      return json({ error: 'هیچ متنی برای ساخت تصویر پیدا نشد.' }, 400);
    }

    // اگر پرامپت خالی بود، خطا بده
    if (!promptText.trim()) {
      return json({ error: 'لطفاً متن توصیف تصویر را وارد کنید.' }, 400);
    }

    // --- ساخت بدنه‌ی درخواست استاندارد OpenAI برای Agnes ---
    const upstreamBody = {
      model: 'imagen-4.0', // یا هر مدل تصویری که Agnes پشتیبانی می‌کند (می‌توانید عوض کنید)
      prompt: promptText,
      n: body.n || 1,        // تعداد تصاویر (پیش‌فرض 1)
      size: body.size || '1024x1024', // سایز تصویر
      response_format: 'url' // یا می‌توانید بگذارید 'b64_json' باشد اگر کد فرانت‌اندتان پشتیبانی می‌کند
    };

    // --- ارسال درخواست به Agnes ---
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(upstreamBody),
    });

    const data = await response.json();
    
    // اگر خطا بود، به فرانت‌اند برگردان
    if (!response.ok) {
      return json({ 
        error: data.error || { message: `خطای Agnes API (کد ${response.status})` } 
      }, response.status);
    }

    // موفقیت: داده را به همان شکلی که هست به فرانت‌اند برگردان
    return json(data, 200);

  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

// تابع کمکی برای تولید پاسخ JSON
function json(obj, status) {
  return new Response(JSON.stringify(obj), { 
    status, 
    headers: { 'Content-Type': 'application/json' } 
  });
}
