import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Define the API key directly in the code for testing purposes
// In production, you would use a more secure method like AWS Secrets Manager
const HARDCODED_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your actual API key

export async function POST(req: Request) {
  try {
    console.log("Chat with secrets API request received:", req.method, req.url);
    
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
    
    // Log environment variable status
    console.log("Environment variables:", {
      OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
      HARDCODED_API_KEY_EXISTS: !!HARDCODED_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
    
    try {
      // Create OpenAI client with hardcoded API key
      console.log("Creating OpenAI client with hardcoded API key...");
      const openai = createOpenAI({
        apiKey: HARDCODED_API_KEY,
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
      console.error("Error with OpenAI API:", openaiError);
      return new Response(
        JSON.stringify({
          error: "OpenAI API error: " + (openaiError.message || 'Unknown error'),
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
    console.error("General error in chat with secrets API route:", error);
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
