import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const openai = createOpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse();
}