import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const secret_name = "openai-api-key";

  const client = new SecretsManagerClient({
    region: "ap-northeast-1", // Change to your region
  });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
      })
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }

  const secret = response.SecretString;

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
}