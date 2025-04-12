export default function TestIndexPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Testing Pages</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Test Pages</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <a href="/test-api" className="text-blue-600 hover:underline">
              API Test Page
            </a>
            <p className="text-gray-600">
              Test all API endpoints with a simple interface. Allows testing different endpoints with the same request format.
            </p>
          </li>
          <li>
            <a href="/chat-simple-test" className="text-blue-600 hover:underline">
              Chat Simple Test
            </a>
            <p className="text-gray-600">
              A chat interface that uses the non-streaming /api/chat-simple endpoint.
            </p>
          </li>
          <li>
            <a href="/" className="text-blue-600 hover:underline">
              Original Chat Page
            </a>
            <p className="text-gray-600">
              The original chat interface that uses the useChat hook and the streaming /api/chat endpoint.
            </p>
          </li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>/api/chat</strong>
            <p className="text-gray-600">
              Attempts to use streaming but falls back to non-streaming if there's an error. Captures streaming error details.
            </p>
          </li>
          <li>
            <strong>/api/chat-stream-test</strong>
            <p className="text-gray-600">
              Streaming endpoint with detailed error handling to diagnose streaming issues.
            </p>
          </li>
          <li>
            <strong>/api/chat-openai-nonstream</strong>
            <p className="text-gray-600">
              Uses the OpenAI API through the AI SDK but in non-streaming mode. Tests if the issue is with streaming or with the OpenAI API integration.
            </p>
          </li>
          <li>
            <strong>/api/chat-simple</strong>
            <p className="text-gray-600">
              Simple endpoint that returns a JSON response without using the AI SDK at all.
            </p>
          </li>
          <li>
            <strong>/api/hello</strong>
            <p className="text-gray-600">
              Simple endpoint that supports both GET and POST requests.
            </p>
          </li>
          <li>
            <strong>/api/env-test</strong>
            <p className="text-gray-600">
              Diagnostic endpoint that returns information about environment variables and the runtime environment. Useful for debugging environment variable issues.
            </p>
          </li>
        </ul>
      </div>
      
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2">Troubleshooting Notes</h3>
        <p className="mb-2">
          Based on testing, we've identified that the issue is with the OPENAI_API_KEY environment variable not being properly accessed in the Amplify environment.
        </p>
        <p className="mb-2">
          The error message from the OpenAI API is: <code className="bg-yellow-50 px-1 rounded">OpenAI API key is missing. Pass it using the 'apiKey' parameter or the OPENAI_API_KEY environment variable.</code>
        </p>
        <p className="mb-2">
          To resolve this issue, try the following:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Use the <strong>/api/env-test</strong> endpoint to check if the OPENAI_API_KEY environment variable is properly set in the Amplify environment</li>
          <li>Verify that the OPENAI_API_KEY environment variable is set correctly in the Amplify Console (App settings → Environment variables)</li>
          <li>Try redeploying the application after confirming the environment variable is set</li>
          <li>Check if there are any restrictions on environment variable access in the Amplify environment</li>
          <li>Consider using a different approach to store and access the API key, such as AWS Secrets Manager or AWS Systems Manager Parameter Store</li>
        </ul>
        <p className="mt-2">
          In the meantime, you can use the <strong>/api/chat-simple</strong> endpoint which doesn't require the OpenAI API key, or the <strong>/chat-simple-test</strong> page which uses this endpoint.
        </p>
      </div>
    </div>
  );
}
