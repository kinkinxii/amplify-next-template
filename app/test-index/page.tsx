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
        </ul>
      </div>
      
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2">Troubleshooting Notes</h3>
        <p className="mb-2">
          If you're experiencing 403 errors with the streaming endpoint, try the following:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Check that the OPENAI_API_KEY environment variable is set correctly in Amplify</li>
          <li>Test the non-streaming endpoints to see if they work</li>
          <li>Check CloudWatch logs for detailed error messages</li>
          <li>Try the /api/chat-stream-test endpoint which provides more detailed error information</li>
        </ul>
      </div>
    </div>
  );
}
