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
            <strong>/api/chat-with-secrets</strong>
            <p className="text-gray-600">
              Uses a hardcoded API key instead of an environment variable. Tests if the issue is with environment variable access or with the OpenAI API integration.
            </p>
          </li>
          <li>
            <strong>/api/chat-with-secrets-manager</strong>
            <p className="text-gray-600">
              Uses AWS Secrets Manager to securely retrieve the API key. This is the recommended approach for production environments.
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
          The <strong>/api/env-test</strong> endpoint confirms that the OPENAI_API_KEY environment variable is not accessible in the Lambda function environment, even though it's set in the Amplify Console and accessible in client-side components.
        </p>
        <h4 className="font-semibold mt-4 mb-2">Next.js Environment Variables in Amplify</h4>
        <p className="mb-2">
          There appears to be a difference in how environment variables are handled between:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-2">
          <li><strong>Client-side components</strong>: Environment variables prefixed with <code>NEXT_PUBLIC_</code> are accessible</li>
          <li><strong>Server-side components</strong>: Environment variables are accessible during build/render time</li>
          <li><strong>API Routes (Lambda functions)</strong>: Environment variables may not be properly passed to the Lambda runtime environment</li>
        </ul>
        <h4 className="font-semibold mt-4 mb-2">推奨される解決策: AWS Secrets Manager</h4>
        <p className="mb-2">
          Next.jsのAPIルートをAmplifyにデプロイする場合、環境変数の代わりにAWS Secrets Managerを使用することを強く推奨します。これにより、以下の利点があります：
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>シークレット情報を安全に保存・管理できる</li>
          <li>Lambda関数（APIルート）から確実にアクセスできる</li>
          <li>環境変数の問題を回避できる</li>
          <li>AWSのベストプラクティスに従っている</li>
        </ul>
        
        <h5 className="font-semibold mt-2 mb-1">実装手順</h5>
        <ol className="list-decimal pl-6 space-y-1 mb-4">
          <li>
            <strong>AWS Secrets Managerにシークレットを作成</strong>
            <p className="text-sm">AWS Management Consoleで、Secrets Managerサービスにアクセスし、新しいシークレットを作成します。</p>
          </li>
          <li>
            <strong>必要なパッケージをインストール</strong>
            <p className="text-sm"><code>npm install @aws-sdk/client-secrets-manager</code>を実行して、AWS SDKをインストールします。</p>
          </li>
          <li>
            <strong>APIルートでSecretsManagerClientを使用</strong>
            <p className="text-sm">APIルートで<code>SecretsManagerClient</code>と<code>GetSecretValueCommand</code>を使用してシークレットを取得します。</p>
            <p className="text-sm">実装例は<strong>/api/chat-with-secrets-manager</strong>エンドポイントを参照してください。</p>
          </li>
          <li>
            <strong>IAMロールに適切な権限を付与</strong>
            <p className="text-sm">Lambda関数のIAMロールに<code>secretsmanager:GetSecretValue</code>権限を付与します。</p>
          </li>
        </ol>
        
        <h5 className="font-semibold mt-2 mb-1">その他の選択肢</h5>
        <ul className="list-disc pl-6 space-y-1 mb-2">
          <li>
            <strong>AWS Systems Manager Parameter Store</strong>
            <p className="text-sm">Secrets Managerの代わりにParameter Storeを使用することもできます。コストが低いですが、機能が限定されています。</p>
          </li>
          <li>
            <strong>ハードコードされたシークレット（テスト用のみ）</strong>
            <p className="text-sm">テスト環境では、<strong>/api/chat-with-secrets</strong>エンドポイントのようにハードコードされたAPIキーを使用できますが、本番環境では推奨されません。</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
