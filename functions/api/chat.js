// Cloudflare Pages Function — /api/chat
// Proxies generateContent calls to the Gemini API and keeps GEMINI_API_KEY server-side.
// Also wraps raw PCM audio (from TTS models) into a playable WAV file.

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return json({ error: 'کلید API در پنل کلودفلر تعریف نشده است. لطفاً GEMINI_API_KEY را در Environment Variables قرار دهید.' }, 500);
    }

    const model = body.model || 'gemini-flash-latest';
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

    // If this was an audio (TTS) request, the model returns raw PCM (audio/L16;rate=...).
    // Wrap it in a WAV header so it plays directly in an <audio> tag.
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
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

// ---- PCM -> WAV (16-bit mono) ----
function pcmBase64ToWavBase64(base64Pcm, sampleRate) {
  const pcmBytes = base64ToUint8Array(base64Pcm);
  const wavBuffer = buildWavHeader(pcmBytes.length, sampleRate) ;
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
  view.setUint16(20, 1, true); // PCM
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
// اضافه کردن این بخش برای هماهنگی با سیستم Wrangler
export default {
  async fetch(request, env, ctx) {
    // اگر تابع شما onRequestPost است، نام آن را در پایین تغییر دهید
    if (typeof onRequest === 'function') {
      return onRequest({ request, env, ctx, params: {}, data: {} });
    } else if (typeof onRequestPost === 'function') {
      return onRequestPost({ request, env, ctx, params: {}, data: {} });
    }
    return new Response("Not Found", { status: 404 });
  }
};
