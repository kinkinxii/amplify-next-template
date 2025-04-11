'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<string>('/api/chat');

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const messages = [
        { role: 'user', content: 'Hello, this is a test message.' }
      ];

      console.log(`Testing API: ${selectedApi}`);
      
      const response = await fetch(selectedApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      console.log('Response status:', response.status);
      // Log headers in a TypeScript-friendly way
      const headerObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headerObj[key] = value;
      });
      console.log('Response headers:', headerObj);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        // For streaming responses or text
        const text = await response.text();
        setResponse(text);
      }
    } catch (err: any) {
      console.error('Error testing API:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Select API to test:</label>
        <select 
          value={selectedApi}
          onChange={(e) => setSelectedApi(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="/api/chat">/api/chat (Streaming)</option>
          <option value="/api/chat-simple">/api/chat-simple (Non-streaming)</option>
          <option value="/api/hello">/api/hello (Simple GET)</option>
        </select>
      </div>
      
      <button
        onClick={testApi}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {response && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
