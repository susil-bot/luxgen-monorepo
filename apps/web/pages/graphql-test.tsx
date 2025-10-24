import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, GET_CURRENT_USER } from '../graphql/queries/auth';

export default function GraphQLTest() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState<any>(null);

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const { data: currentUserData, loading: userLoading } = useQuery(GET_CURRENT_USER, {
    skip: true, // We'll trigger this manually
  });

  const handleLogin = async () => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        }
      });
      setResult({ success: true, data });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    }
  };

  const testGraphQLConnection = async () => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'query { _empty } }'
        })
      });
      
      const data = await response.json();
      setResult({ success: true, connection: 'GraphQL server is running!', data });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">GraphQL Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* GraphQL Connection Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">GraphQL Server Connection</h2>
            <button
              onClick={testGraphQLConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test GraphQL Connection
            </button>
          </div>

          {/* Login Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Login Test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loginLoading ? 'Logging in...' : 'Test Login'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Results</h3>
            <div className={`p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* GraphQL Playground Link */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">GraphQL Playground</h3>
          <p className="text-gray-600 mb-4">
            Access the GraphQL Playground to explore the schema and test queries interactively.
          </p>
          <a
            href="http://localhost:4000/graphql"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Open GraphQL Playground
          </a>
        </div>

        {/* Available Endpoints */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Available Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium">REST API</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• POST /api/auth/login</li>
                <li>• POST /api/auth/register</li>
                <li>• GET /api/auth/me</li>
                <li>• POST /api/auth/logout</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">GraphQL</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• POST /graphql</li>
                <li>• login mutation</li>
                <li>• register mutation</li>
                <li>• currentUser query</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
