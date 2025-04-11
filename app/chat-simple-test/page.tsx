'use client';

import { useState } from 'react';

export default function ChatSimpleTest() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Send request to the non-streaming API
      const response = await fetch('/api/chat-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Add AI response to the chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: data.message || JSON.stringify(data)
        }
      ]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-4">Chat Simple Test</h1>
      <p className="mb-4">This page uses the non-streaming /api/chat-simple endpoint</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="mb-4">
        {messages.map((message, i) => (
          <div key={i} className="mb-2 p-2 rounded">
            <strong>{message.role === 'user' ? 'You: ' : 'AI: '}</strong>
            <span>{message.content}</span>
          </div>
        ))}
        
        {loading && (
          <div className="p-2 text-gray-500">
            AI is thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <input
          className="flex-grow p-2 border border-gray-300 rounded-l"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
