export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        
        // Read GEMINI_API_KEY securely from Cloudflare Environment Variables
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ 
                error: 'کلید API در پنل کلودفلر تعریف نشده است. لطفاً GEMINI_API_KEY را در Environment Variables قرار دهید.' 
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const model = body.model || 'gemini-3.6-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: body.contents,
                systemInstruction: body.systemInstruction
            })
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
