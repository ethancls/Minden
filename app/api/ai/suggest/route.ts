import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { OpenAI } from 'openai';
import { getMany } from '@/lib/settings';

// Note: this is not a real AI suggestion, just a placeholder for the demo

const positive = [
  'Looks good!',
  'Great job!',
  'Keep it up!',
  'Awesome!',
  'Nice work!',
];

const negative = [
  'Needs improvement.',
  'Could be better.',
  'Not great.',
  'Try again.',
  'Almost there.',
];

async function getOpenAI() {
  const { OPENAI_API_KEY } = await getMany(['OPENAI_API_KEY']);
  if (OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }
  return null;
}

async function getSystemPrompt(locale: string) {
  await import(`../../../../messages/${locale}.json`);
  return `You are an expert in cybersecurity and act as a virtual assistant for the Minden honeypot system. Your goal is to provide helpful and concise advice to users based on the logs they provide. You must answer in the language of the user, which is ${locale}. The user will provide a JSON object with logs, and you should return a short suggestion (1-2 sentences) in a JSON object like { suggestion: "..." }. The suggestion should be friendly and easy to understand for someone who is not a security expert. For example, if you see a lot of logs from a single IP address, you could suggest blocking it. If you see a lot of logs for a specific service, you could suggest disabling it if it is not needed.`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const { logs, locale } = await req.json();
  if (!logs) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const openaiClient = await getOpenAI();
  if (openaiClient) {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: await getSystemPrompt(locale) },
        { role: 'user', content: JSON.stringify(logs) },
      ],
      response_format: { type: 'json_object' },
    });
    const suggestion = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(suggestion);
  } else {
    // Fallback to random suggestion if no OpenAI key
    const suggestion = Math.random() > 0.5 ? positive[Math.floor(Math.random() * positive.length)] : negative[Math.floor(Math.random() * negative.length)];
    return NextResponse.json({ suggestion });
  }
}


