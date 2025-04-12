import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Function to get secret from AWS Secrets Manager
async function getSecret(secretName: string): Promise<string> {
  try {
    // Create a Secrets Manager client with explicit credentials configuration
    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1', // Use the region from environment variable or default to us-east-1
      // In a production environment, you would rely on the Lambda function's IAM role
      // For local development, you might need to provide credentials explicitly
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
    
    // Create the GetSecretValueCommand
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });
    
    // Execute the command to get the secret
    const response = await client.send(command);
    
    // Return the secret value
    if (response.SecretString) {
      return response.SecretString;
    } else {
      throw new Error('Secret value is not a string');
    }
  } catch (error: any) {
    console.error('Error retrieving secret:', error);
    
    // Provide more detailed error information for credential issues
    if (error.name === 'CredentialsProviderError') {
      throw new Error(
        'AWS credentials not found. When deployed to Amplify, ensure the Lambda function has an IAM role with secretsmanager:GetSecretValue permissions. ' +
        'For local development, set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.'
      );
    }
    
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    console.log("Chat with Secrets Manager API request received:", req.method, req.url);
    
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };
    
    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    const { messages } = await req.json();
    console.log("Messages received:", JSON.stringify(messages).substring(0, 100) + "...");
    
    try {
      // Get the OpenAI API key from Secrets Manager
      // Replace 'openai-api-key' with your actual secret name in Secrets Manager
      console.log("Retrieving API key from Secrets Manager...");
      const apiKey = await getSecret('openai-api-key');
      console.log("API key retrieved successfully");
      
      // Create OpenAI client with the API key from Secrets Manager
      console.log("Creating OpenAI client...");
      const openai = createOpenAI({
        apiKey,
      });
      console.log("OpenAI client created successfully");
      
      // Make a non-streaming request to OpenAI
      console.log("Making non-streaming request to OpenAI...");
      
      // Use generateText for non-streaming response
      const result = await generateText({
        model: openai('gpt-4o'),
        messages,
      });
      
      console.log("OpenAI response received successfully");
      
      // Return the response
      return new Response(
        JSON.stringify({
          message: result.text || "No response from OpenAI",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers,
        }
      );
    } catch (openaiError: any) {
      console.error("Error with OpenAI API or Secrets Manager:", openaiError);
      return new Response(
        JSON.stringify({
          error: "API error: " + (openaiError.message || 'Unknown error'),
          stack: openaiError.stack,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers,
        }
      );
    }
  } catch (error: any) {
    console.error("General error in chat with Secrets Manager API route:", error);
    return new Response(
      JSON.stringify({ 
        error: "General error: " + (error.message || 'Unknown error occurred'),
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
