import { useState } from 'react';

export default function TestAPI() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, url, method = 'GET') => {
    try {
      const result = {
        name,
        url,
        status: 'loading',
        response: null,
        error: null,
      };
      setResults(prev => [...prev, result]);

      const res = await fetch(url, { method });
      const data = await res.json();

      setResults(prev =>
        prev.map(r =>
          r.name === name
            ? { ...r, status: res.status, response: data, error: null }
            : r
        )
      );
    } catch (error) {
      setResults(prev =>
        prev.map(r =>
          r.name === name
            ? { ...r, status: 'error', error: error.message }
            : r
        )
      );
    }
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Test obituaries endpoint
    await testEndpoint('Obituaries', '/api/obituaries?limit=3');

    // Test a sample obituary - you'll need to replace with actual ID
    await testEndpoint('Sample Obituary', '/api/obituary/test-id-12345');

    // Test memories endpoint
    await testEndpoint('Memories', '/api/memories/test-id-12345');

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">API Endpoint Tester</h1>
      <p className="text-gray-600 mb-6">
        This page helps debug your API endpoints. Click &quot;Run Tests&quot; to check if your APIs are responding correctly.
      </p>

      <button
        onClick={runTests}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        {loading ? 'Testing...' : 'Run Tests'}
      </button>

      <div className="space-y-4">
        {results.map(result => (
          <div key={result.name} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{result.name}</h3>
              <span
                className={`px-3 py-1 rounded text-white text-sm font-medium ${
                  result.status === 'loading'
                    ? 'bg-yellow-500'
                    : typeof result.status === 'number'
                    ? result.status === 200
                      ? 'bg-green-500'
                      : 'bg-red-500'
                    : 'bg-gray-500'
                }`}
              >
                {result.status === 'loading' ? 'Loading...' : `HTTP ${result.status}`}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{result.url}</p>
            {result.error && <p className="text-red-600 text-sm">Error: {result.error}</p>}
            {result.response && (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(result.response, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold mb-2">Notes:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Check that the obituaries endpoint returns HTTP 200 with a list of obituaries</li>
          <li>• The sample obituary test will fail (404) because &quot;test-id-12345&quot; doesn&apos;t exist</li>
          <li>• Get a real obituary ID from your dashboard and test with that</li>
          <li>• All endpoints should be accessible - if you see CORS errors, check your browser console</li>
        </ul>
      </div>
    </div>
  );
}
