// exploreKaro Multi-Provider & Multi-Key Intelligent Cascade Service
// Features:
// 1. Google Gemini (Multi-Key Pool with auto-failover on 429/403)
// 2. xAI Grok (Direct official API fallback)
// 3. Groq & OpenRouter integrations
// 4. Built-in Local NLP Safety Net (guarantees zero-downtime during live judging demos)

const parseGeminiKeys = () => {
  const multi = import.meta.env.VITE_GEMINI_API_KEYS || '';
  const single = import.meta.env.VITE_GEMINI_API_KEY || '';
  const combined = multi ? multi.split(',') : (single ? [single] : []);
  return combined.map(k => k.trim()).filter(Boolean);
};

const GEMINI_KEYS = parseGeminiKeys();
const XAI_KEY = (import.meta.env.VITE_XAI_API_KEY || '').trim();
const GROQ_KEY = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
const OPENROUTER_KEY = (import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();

let activeGeminiKeyIndex = 0;

function getNextGeminiKey() {
  if (GEMINI_KEYS.length === 0) return null;
  const key = GEMINI_KEYS[activeGeminiKeyIndex % GEMINI_KEYS.length];
  return { key, index: (activeGeminiKeyIndex % GEMINI_KEYS.length) + 1 };
}

function rotateGeminiKey() {
  if (GEMINI_KEYS.length > 1) {
    activeGeminiKeyIndex = (activeGeminiKeyIndex + 1) % GEMINI_KEYS.length;
    console.log(`[exploreKaro AI] Rotated to Gemini Key Pool #${activeGeminiKeyIndex + 1}`);
  }
}

// 1. Google Gemini with Multi-Key Pool
async function callGeminiCascade(prompt) {
  if (GEMINI_KEYS.length === 0) return null;

  const maxAttempts = GEMINI_KEYS.length;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const current = getNextGeminiKey();
    if (!current) break;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${current.key}`;
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal
      });

      if (!response.ok) {
        const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${current.key}`;
        response = await fetch(fallbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: controller.signal
        });
      }

      clearTimeout(timeout);

      if (response.status === 429 || response.status === 403) {
        console.warn(`[exploreKaro AI] Gemini Key #${current.index} quota/rate limited (${response.status}). Switching keys...`);
        rotateGeminiKey();
        continue;
      }

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            text,
            providerBadge: GEMINI_KEYS.length > 1 
              ? `Google Gemini (Key Pool #${current.index}/${GEMINI_KEYS.length})` 
              : 'Google Gemini 2.5 Flash'
          };
        }
      }
    } catch (err) {
      console.warn(`[exploreKaro AI] Gemini Key #${current.index} request error:`, err.message);
      rotateGeminiKey();
    }
  }

  return null;
}

// 2. xAI (Grok-2) Direct API Fallback
async function callXaiFallback(prompt) {
  if (!XAI_KEY) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 350
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    if (!res.ok) {
      // Try grok-beta if grok-2-latest fails
      const fallbackRes = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_KEY}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 350
        })
      });
      if (!fallbackRes.ok) return null;
      const data = await fallbackRes.json();
      return {
        text: data.choices?.[0]?.message?.content,
        providerBadge: 'xAI Grok (Realtime Intelligence)'
      };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (text) {
      return {
        text,
        providerBadge: 'xAI Grok-2 (Live Intelligence)'
      };
    }
    return null;
  } catch (err) {
    console.warn('[exploreKaro AI] xAI Grok call failed:', err.message);
    return null;
  }
}

// 3. Groq Fallback
async function callGroqFallback(prompt) {
  if (!GROQ_KEY) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 350
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content,
      providerBadge: 'Groq Llama 3.3 (High Speed)'
    };
  } catch {
    return null;
  }
}

// 4. OpenRouter Fallback
async function callOpenRouterFallback(prompt) {
  if (!OPENROUTER_KEY) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content,
      providerBadge: 'OpenRouter Free Model'
    };
  } catch {
    return null;
  }
}

// Main Concierge Handler: Cascades across Gemini Key Pool -> xAI Grok -> Groq -> OpenRouter -> Local
export async function askGeminiConcierge(userQuery, cityName, places) {
  const placesContext = places.slice(0, 8).map(p => 
    `- ${p.name} (${p.category}): Safety ${p.safetyScore}/10, Cleanliness ${p.cleanlinessScore}/10, Cost ${p.priceLevel} (${p.estimatedCost}), Best Time: ${p.bestTime}`
  ).join('\n');

  const systemPrompt = `You are exploreKaro's intelligent AI Urban Concierge for ${cityName}, India.
A traveler has the following request: "${userQuery}".
Here are current known places in this precinct:
${placesContext}

Provide a crisp, actionable, 3-4 sentence response:
1. Recommend the 1 or 2 best specific spots addressing their exact criteria (prioritizing safety, cleanliness, and value).
2. Give one practical safety or travel tip for exploring ${cityName} today (e.g. peak hour advice, transit tip, or well-lit walking corridors).
Keep your tone warm, insightful, and local-expert. Avoid generic fluff.`;

  // Tier 1: Try Gemini Key Pool (with auto-rotation)
  const geminiResult = await callGeminiCascade(systemPrompt);
  if (geminiResult) return geminiResult;

  // Tier 2: Try xAI Grok-2 (if available)
  const xaiResult = await callXaiFallback(systemPrompt);
  if (xaiResult) return xaiResult;

  // Tier 3: Try Groq if key provided
  const groqResult = await callGroqFallback(systemPrompt);
  if (groqResult) return groqResult;

  // Tier 4: Try OpenRouter if key provided
  const openRouterResult = await callOpenRouterFallback(systemPrompt);
  if (openRouterResult) return openRouterResult;

  // Tier 5: Fallback to Local Semantic NLP Engine
  return null;
}

// Lore Generator Cascade
export async function generateGeminiPlaceLore(placeName, cityName, category) {
  const prompt = `Write a captivating 2-sentence historical and cultural lore for "${placeName}" in ${cityName} (${category}). Include one fascinating historical fact or tradition that makes it unique. Keep it inspiring and vivid for an audio guide.`;
  const res = await callGeminiCascade(prompt) || await callXaiFallback(prompt);
  return res ? res.text : null;
}
