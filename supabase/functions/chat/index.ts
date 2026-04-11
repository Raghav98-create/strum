import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are a friendly assistant for Strum, a guitar lesson booking service.

About Strum:
- Instructor: Alex, 15 years of playing experience, 8 years of teaching
- Lessons are one-on-one, tailored to the student's pace
- Beginner lessons: $45/session — open chords, basic strumming, first songs, no experience needed
- Intermediate lessons: $55/session — barre chords, fingerpicking, music theory, genre exploration
- Advanced lessons: $65/session — soloing, improvisation, composition, performance coaching
- Students book by filling out the booking form on this page (name, email, phone, lesson type, preferred date/time)
- Alex responds within 24 hours to confirm the slot

Your role:
- Answer questions about lessons, pricing, and what to expect
- Help visitors figure out which lesson level suits them
- Encourage them to fill out the booking form
- Keep replies concise, warm, and encouraging
- Do not make up information not listed above`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? 'Sorry, I could not get a response.';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Chat function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
