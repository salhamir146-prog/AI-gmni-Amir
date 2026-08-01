export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // گرفتن کلید از محیط کلودفلر
    const apiKey = env.AGNES_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'کلید AGNES_API_KEY در متغیرهای محیطی کلودفلر تنظیم نشده است.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const prompt = body.prompt;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'توضیحات عکس (Prompt) ارسال نشده است.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ارسال درخواست به ای‌پی‌آی Agnes AI
    const response = await fetch('https://api.agnes-ai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || data.message || 'خطا در دریافت تصویر از Agnes AI';
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: response.status || 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'خطای سرور: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
