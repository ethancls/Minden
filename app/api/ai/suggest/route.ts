import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'en', mode = 'ideas' } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Local stub when no key is set
      return NextResponse.json({
        suggestions: [
          `Improve clarity by shortening sentences and adding a source.`,
          `Look for references on Wikipedia or scholar for: ${text.slice(0, 80)}...`,
          `Add a catchy title in ${language === 'fr' ? 'français' : 'English'}.`
        ],
      });
    }

    const prompt = `You are an assistant that helps craft short, intriguing knowledge pills (2-5 sentences). Mode: ${mode}. User text: ${text}. Reply in ${language === 'fr' ? 'French' : 'English'}. Provide 3 bullet suggestions and 3 credible sources if applicable.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You help users write concise, cited facts.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      const msg = await resp.text();
      return NextResponse.json({ error: 'AI_PROVIDER_ERROR', detail: msg }, { status: 502 });
    }
    const data = await resp.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ suggestions: content.split('\n').filter(Boolean) });
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', detail: e?.message }, { status: 500 });
  }
}

