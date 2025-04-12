import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const client = new SecretsManagerClient({ region: 'ap-northeast-1' });

async function getSecret(secret_name: string) {
  const command = new GetSecretValueCommand({ SecretId: secret_name});
  const response = await client.send(command);
  return response.SecretString;
}

export async function POST(req: Request) {
  try {
    const secret_name = "openai-api-key";

    const secret = await getSecret(secret_name);

    const parsedSecret = secret ? JSON.parse(secret) : {};
    const OPENAI_API_KEY = parsedSecret[secret_name] ?? '';

    const { messages } = await req.json();

    const openai = createOpenAI({
      apiKey: OPENAI_API_KEY,
    });

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
  
}