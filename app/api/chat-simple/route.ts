import { createOpenAI } from '@ai-sdk/openai';

// Allow responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log("Simple chat API request received:", req.method, req.url);
    
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
    console.log("Messages received in simple API:", JSON.stringify(messages).substring(0, 100) + "...");
    
    console.log("Environment variables:", {
      OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
    
    // Instead of streaming, return a simple response
    // This is just for testing if the 403 issue is related to streaming
    return new Response(
      JSON.stringify({
        message: "This is a test response from the simplified chat API",
        receivedMessages: messages.length,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error: any) {
    console.error("Error in simple chat API route:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
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
