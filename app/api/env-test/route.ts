import { secret } from '@aws-amplify/backend';

// Allow responses up to 30 seconds
export const maxDuration = 30;

export async function GET(req: Request) {
  try {
    console.log("Environment test API request received");
    
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };
    
    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    // Get all environment variables (safely, without exposing actual values)
    const envVars: Record<string, string> = {};
    
    // Check for specific environment variables
    const keysToCheck = [
      'OPENAI_API_KEY',
      'NODE_ENV',
      'VERCEL_ENV',
      'AWS_REGION',
      'AWS_LAMBDA_FUNCTION_NAME',
      'AWS_LAMBDA_FUNCTION_VERSION',
      'AWS_LAMBDA_FUNCTION_MEMORY_SIZE',
      'AWS_EXECUTION_ENV',
      'PATH',
      // Add any other environment variables you want to check
    ];
    
    for (const key of keysToCheck) {
      if (process.env[key]) {
        // For sensitive keys, just indicate they exist but don't show the value
        if (key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN') || key.includes('PASSWORD')) {
          envVars[key] = `[EXISTS - ${process.env[key].length} chars]`;
        } else {
          envVars[key] = process.env[key] as string;
        }
      } else {
        envVars[key] = secret("OPENAI_API_KEY").resolve.toString();
      }
    }
    
    // Get process information
    const processInfo = {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      versions: process.versions,
      cwd: process.cwd(),
      execPath: process.execPath,
      pid: process.pid,
      ppid: process.ppid,
      memoryUsage: process.memoryUsage(),
    };
    
    // Return environment information
    return new Response(
      JSON.stringify({
        environment: envVars,
        process: processInfo,
        timestamp: new Date().toISOString(),
      }, null, 2),
      {
        status: 200,
        headers,
      }
    );
  } catch (error: any) {
    console.error("Error in environment test API:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
