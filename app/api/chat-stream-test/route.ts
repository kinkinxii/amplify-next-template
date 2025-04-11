import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log("Stream test request received:", req.method, req.url);
    
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
    console.log("Messages received in stream test:", JSON.stringify(messages).substring(0, 100) + "...");
    
    // Log environment variables
    console.log("Environment variables:", {
      OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
    
    // Test each step of the streaming process separately
    try {
      console.log("Creating OpenAI client...");
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log("OpenAI client created successfully");
      
      try {
        console.log("Creating stream...");
        const result = streamText({
          model: openai('gpt-4o'),
          messages,
        });
        console.log("Stream created successfully");
        
        try {
          console.log("Converting to data stream response...");
          const response = result.toDataStreamResponse();
          console.log("Response created successfully");
          
          // Add CORS headers to the response
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
          
          return response;
        } catch (responseError: any) {
          console.error("Error creating response:", responseError);
          return new Response(JSON.stringify({ 
            error: "Response creation error: " + (responseError.message || 'Unknown error'),
            stack: responseError.stack,
            phase: "response creation"
          }), {
            status: 500,
            headers,
          });
        }
      } catch (streamError: any) {
        console.error("Error creating stream:", streamError);
        return new Response(JSON.stringify({ 
          error: "Stream creation error: " + (streamError.message || 'Unknown error'),
          stack: streamError.stack,
          phase: "stream creation"
        }), {
          status: 500,
          headers,
        });
      }
    } catch (clientError: any) {
      console.error("Error creating OpenAI client:", clientError);
      return new Response(JSON.stringify({ 
        error: "OpenAI client creation error: " + (clientError.message || 'Unknown error'),
        stack: clientError.stack,
        phase: "client creation"
      }), {
        status: 500,
        headers,
      });
    }
  } catch (error: any) {
    console.error("General error in stream test API route:", error);
    return new Response(JSON.stringify({ 
      error: "General error: " + (error.message || 'Unknown error occurred'),
      stack: error.stack,
      phase: "general"
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
