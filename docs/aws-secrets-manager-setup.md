# AWS Secrets Manager with Next.js API Routes in Amplify

このドキュメントでは、Next.jsのAPIルート（route handlers）をAWS Amplifyにデプロイする際に、AWS Secrets Managerを使用してシークレット情報（APIキーなど）を安全に管理する方法について説明します。

## 1. AWS Secrets Managerの概要

AWS Secrets Managerは、データベースの認証情報、APIキー、その他のシークレット情報を安全に保存・管理するためのAWSサービスです。主な利点は以下の通りです：

- シークレットの暗号化と安全な保存
- きめ細かなアクセス制御（IAMポリシーによる）
- シークレットの自動ローテーション
- 監査ログとモニタリング

## 2. Secrets Managerでシークレットを作成する

### 2.1 AWS Management Consoleでの作成

1. [AWS Management Console](https://console.aws.amazon.com/)にログインします
2. Secrets Managerサービスに移動します
3. 「Store a new secret」（新しいシークレットを保存）をクリックします
4. シークレットタイプとして「Other type of secret」（その他のタイプのシークレット）を選択します
5. キーと値のペアとして、例えば「OPENAI_API_KEY」と実際のAPIキーを入力します
6. 暗号化キーはデフォルトのAWS KMSキーを使用します
7. シークレット名（例：`openai-api-key`）と説明を入力します
8. 自動ローテーションは必要に応じて設定します（オプション）
9. 残りのステップはデフォルト設定のままで進み、シークレットを作成します

### 2.2 AWS CLIでの作成

```bash
aws secretsmanager create-secret \
    --name openai-api-key \
    --description "OpenAI API Key for chat application" \
    --secret-string "{\"OPENAI_API_KEY\":\"your-api-key-here\"}"
```

## 3. IAMロールの設定

Next.jsのAPIルートがSecrets Managerからシークレットを取得するには、適切なIAM権限が必要です。

### 3.1 Amplifyアプリケーションのサービスロールを特定する

1. [AWS Amplifyコンソール](https://console.aws.amazon.com/amplify/)にアクセスします
2. アプリケーションを選択します
3. 「App settings」→「General」に移動します
4. 「App ARN」をメモします（例：`arn:aws:amplify:us-east-1:123456789012:apps/abcdef123456`）

### 3.2 IAMポリシーを作成する

1. [IAMコンソール](https://console.aws.amazon.com/iam/)に移動します
2. 「Policies」→「Create policy」をクリックします
3. JSONエディタで以下のポリシーを入力します（シークレット名とリージョンを適宜変更してください）：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:openai-api-key-*"
    }
  ]
}
```

4. ポリシー名（例：`AmplifySecretsManagerAccess`）を入力し、ポリシーを作成します

### 3.3 IAMロールにポリシーをアタッチする

1. IAMコンソールで「Roles」に移動します
2. Amplifyアプリケーションのサービスロールを検索します（通常は`amplifyconsole-backend-role`または`AmplifyServiceRole`という名前）
3. ロールを選択し、「Add permissions」→「Attach policies」をクリックします
4. 先ほど作成したポリシー（`AmplifySecretsManagerAccess`）を検索して選択します
5. 「Attach policies」をクリックしてポリシーをロールにアタッチします

## 4. Next.jsアプリケーションでの実装

### 4.1 必要なパッケージのインストール

```bash
npm install @aws-sdk/client-secrets-manager
```

### 4.2 APIルートでの実装

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// シークレットを取得する関数
async function getSecret(secretName: string): Promise<string> {
  try {
    // Secrets Managerクライアントを作成
    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    // GetSecretValueCommandを作成
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });
    
    // コマンドを実行してシークレットを取得
    const response = await client.send(command);
    
    // シークレット値を返す
    if (response.SecretString) {
      return response.SecretString;
    } else {
      throw new Error('Secret value is not a string');
    }
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

// APIルートハンドラー
export async function POST(req: Request) {
  try {
    // リクエストを処理...
    
    // Secrets Managerからシークレットを取得
    const apiKey = await getSecret('openai-api-key');
    
    // 取得したシークレットを使用して処理を続行...
    // ...
    
    return new Response(/* レスポンス */);
  } catch (error) {
    // エラーハンドリング...
    return new Response(/* エラーレスポンス */);
  }
}
```

### 4.3 JSONフォーマットのシークレットを解析する

シークレットがJSON形式で保存されている場合（例：`{"OPENAI_API_KEY":"your-api-key-here"}`）、以下のようにして特定のキーの値を取得できます：

```typescript
const secretString = await getSecret('openai-api-key');
const secretData = JSON.parse(secretString);
const apiKey = secretData.OPENAI_API_KEY;
```

## 5. ローカル開発環境での設定

ローカル開発環境でAWS Secrets Managerにアクセスするには、AWS認証情報を設定する必要があります。

### 5.1 AWS CLIの設定

1. AWS CLIをインストールします（まだの場合）
2. 以下のコマンドを実行して認証情報を設定します：

```bash
aws configure
```

3. プロンプトに従って、AWS Access Key ID、Secret Access Key、デフォルトリージョン、出力形式を入力します

### 5.2 環境変数での設定

`.env.local`ファイルに以下の環境変数を設定することもできます：

```
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
```

## 6. トラブルシューティング

### 6.1 認証情報エラー

エラーメッセージ：`CredentialsProviderError: Could not load credentials from any providers`

**解決策**:
- Amplifyにデプロイされている場合：IAMロールに適切な権限が付与されているか確認します
- ローカル開発環境の場合：AWS認証情報が正しく設定されているか確認します

### 6.2 アクセス拒否エラー

エラーメッセージ：`AccessDeniedException: User is not authorized to perform: secretsmanager:GetSecretValue`

**解決策**:
- IAMロールに`secretsmanager:GetSecretValue`アクションの権限が付与されているか確認します
- シークレットのARNが正しいか確認します

### 6.3 シークレットが見つからないエラー

エラーメッセージ：`ResourceNotFoundException: Secrets Manager can't find the specified secret.`

**解決策**:
- シークレット名が正しいか確認します
- シークレットが存在するリージョンと、コードで指定しているリージョンが一致しているか確認します

## 7. ベストプラクティス

- **最小権限の原則**: IAMロールには必要最小限の権限のみを付与します
- **シークレットのローテーション**: 定期的にシークレットをローテーションするように設定します
- **キャッシング**: パフォーマンスを向上させるために、取得したシークレットをメモリ内でキャッシュすることを検討します（ただし、セキュリティリスクも考慮してください）
- **エラーハンドリング**: シークレット取得時のエラーを適切に処理し、ユーザーフレンドリーなエラーメッセージを表示します
- **監査**: CloudTrailを有効にして、シークレットへのアクセスを監査します

## 8. 参考リソース

- [AWS Secrets Manager公式ドキュメント](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [AWS SDK for JavaScript v3 - Secrets Manager](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-secrets-manager/index.html)
- [AWS Amplify公式ドキュメント](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
