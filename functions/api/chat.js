// Cloudflare Worker — /api/chat
// Supports Gemini (text & image) and Groq (Llama & DeepSeek)

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return json({ error: 'Method Not Allowed' }, 405);
    }

    try {
      const body = await request.json();
      const modelId = body.model || 'gemini-3.6-flash';

      // 1. Check if it's a Groq model
      const groqModels = [
        'llama-3.3-70b-versatile', 
        'llama-3.1-8b-instant', 
        'deepseek-r1-distill-llama-70b'
      ];

      if (groqModels.includes(modelId)) {
        return await handleGroq(body, env);
      }

      // 2. Handle Gemini models (Text & Gemini-Image)
      return await handleGemini(body, env);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

// --- GROQ HANDLER ---
async function handleGroq(body, env) {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    return json({ error: 'کلید API Groq در پنل کلودفلر تعریف نشده است.' }, 500);
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  // Convert Gemini format to Groq OpenAI format
  const messages = body.contents.map(msg => ({
    role: msg.role,
    content: msg.parts[0]?.text || ''
  }));

  // Add system instruction if exists
  if (body.systemInstruction) {
    messages.unshift({
      role: 'system',
      content: body.systemInstruction.parts[0].text
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: body.model,
      messages: messages,
      temperature: body.generationConfig?.temperature || 1.0,
      max_tokens: body.generationConfig?.maxOutputTokens || 2048,
      top_p: body.generationConfig?.topP || 0.95
    })
  });

  const data = await response.json();
  if (!response.ok) {
    return json({ error: data.error || { message: `خطای Groq API (کد ${response.status})` } }, response.status);
  }

  // Transform Groq response to Gemini-like structure for the frontend
  return json({
    candidates: [{
      content: {
        parts: [{ text: data.choices[0]?.message?.content || '' }]
      }
    }]
  }, 200);
}

// --- GEMINI HANDLER ---
async function handleGemini(body, env) {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'کلید API Gemini در پنل کلودفلر تعریف نشده است.' }, 500);
  }

  const model = body.model || 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const upstreamBody = {
    contents: body.contents,
    systemInstruction: body.systemInstruction,
    generationConfig: body.generationConfig,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(upstreamBody),
  });

  const data = await response.json();
  if (!response.ok) {
    return json({ error: data.error || { message: `خطای Gemini API (کد ${response.status})` } }, response.status);
  }

  // Handle Audio TTS (PCM -> WAV)
  const wantsAudio = body.generationConfig?.responseModalities?.includes('AUDIO');
  if (wantsAudio) {
    const parts = data.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/L16')) {
          const rateMatch = /rate=(\d+)/.exec(part.inlineData.mimeType);
          const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
          part.inlineData.data = pcmBase64ToWavBase64(part.inlineData.data, sampleRate);
          part.inlineData.mimeType = 'audio/wav';
        }
      }
    }
  }

  return json(data, 200);
}

// --- PCM -> WAV Helper ---
function pcmBase64ToWavBase64(base64Pcm, sampleRate) {
  const pcmBytes = base64ToUint8Array(base64Pcm);
  const wavBuffer = buildWavHeader(pcmBytes.length, sampleRate);
  const wavBytes = new Uint8Array(wavBuffer.byteLength + pcmBytes.length);
  wavBytes.set(new Uint8Array(wavBuffer), 0);
  wavBytes.set(pcmBytes, wavBuffer.byteLength);
  return uint8ArrayToBase64(wavBytes);
}

function buildWavHeader(dataLength, sampleRate) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  writeStr(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  return buffer;
}

function writeStr(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
