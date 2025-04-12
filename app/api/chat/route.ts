import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { secret } from '@aws-amplify/backend';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const openai = createOpenAI({
    apiKey: secret("OPENAI_API_KEY").toString(),
  });

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse();
}