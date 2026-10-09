// exploreKaro Gemini AI Service
// Seamlessly connects real-time Gemini LLM intelligence with smart fallback

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export async function askGeminiConcierge(userQuery, cityName, places) {
  if (!API_KEY) {
    return null; // Will trigger graceful local NLP fallback
  }

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

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Try gemini-2.5-flash, fallback to gemini-1.5-flash
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        }),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      // Fallback model
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        }
      );
    }

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn('Gemini API call returned non-200, falling back to local NLP.');
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err) {
    console.warn('Gemini API fetch error:', err.message);
    return null;
  }
}

export async function generateGeminiPlaceLore(placeName, cityName, category) {
  if (!API_KEY) return null;

  const prompt = `Write a captivating 2-sentence historical and cultural lore for "${placeName}" in ${cityName} (${category}). Include one fascinating historical fact or tradition that makes it unique. Keep it inspiring and vivid for an audio guide.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);
    if (!response.ok) return null;

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}
