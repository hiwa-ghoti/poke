/**
 * Optional Cloudflare Worker proxy for browser AI calls (CORS-safe).
 * Deploy: wrangler deploy
 * Request: POST /chat  { provider, model, apiKey, prompt }
 */
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return json({ error: 'POST only' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid json' }, 400);
    }

    const { provider = 'gemini', model, apiKey, prompt } = body || {};
    if (!apiKey || !prompt) return json({ error: 'apiKey and prompt required' }, 400);

    try {
      const text = provider === 'openai'
        ? await openAi(prompt, apiKey, model)
        : await gemini(prompt, apiKey, model);
      return json({ text });
    } catch (err) {
      return json({ error: String(err.message || err) }, 502);
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

async function gemini(prompt, apiKey, model) {
  const m = model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4 }
    })
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
}

async function openAi(prompt, apiKey, model) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'You are a Pokémon Champions coach. Prefer Japanese replies.' },
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}
