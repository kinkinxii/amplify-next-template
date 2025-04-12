import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { secret } from '@aws-amplify/backend';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log("Request received:", req.method, req.url);
    
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*', // In production, restrict this to your domain
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
    
    console.log("Environment variables:", {
      OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
    
    // Try streaming first, but catch any errors and fall back to non-streaming
    try {
      console.log("Attempting to use streaming...");
      
      const openai = createOpenAI({
        apiKey: secret("OPENAI_API_KEY").toString(), // Resolve secret to string
      });
      
      console.log("OpenAI client created");
      
      const result = streamText({
        model: openai('gpt-4o'),
        messages,
      });
      
      console.log("Stream created, returning response");
      
      // Add CORS headers to the response
      const response = result.toDataStreamResponse();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    } catch (streamError: any) {
      // If streaming fails, log the error and fall back to non-streaming
      console.error("Streaming failed, falling back to non-streaming:", streamError);
      
      return new Response(
        JSON.stringify({
          message: "This is a fallback non-streaming response from the chat API",
          receivedMessages: messages.length,
          timestamp: new Date().toISOString(),
          streamingError: streamError.message || 'Unknown streaming error',
        }),
        {
          status: 200,
          headers,
        }
      );
    }
  } catch (error: any) {
    console.error("Error in chat API route:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      stack: error.stack
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
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
