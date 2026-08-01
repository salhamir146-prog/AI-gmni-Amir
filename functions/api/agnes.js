export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    // کلید API را از محیط دریافت کن
    const apiKey = env.AGNES_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'کلید AGNES_API_KEY تعریف نشده است' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // آدرس درست Agnes
    const url = 'https://agnes-ai.com/v1/images/generations';

    // پرامپت را از دکمه جدید دریافت کن
    const promptText = body.prompt;

    if (!promptText) {
      return new Response(JSON.stringify({ error: 'متن پرامپت خالی است' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // درخواست استاندارد OpenAI به Agnes
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'imagen-4.0', // یا هر مدلی که Agnes دارد
        prompt: promptText,
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      })
    });

    const data = await response.json();

    // اگر خطا بود برگردان
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error || 'خطای ناشناخته Agnes' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // اگر موفق بود، داده را برگردان
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
