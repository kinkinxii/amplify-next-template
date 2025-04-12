# AWS Systems Manager Parameter Store with Next.js API Routes in Amplify

このドキュメントでは、Next.jsのAPIルート（route handlers）をAWS Amplifyにデプロイする際に、AWS Systems Manager Parameter Storeを使用してシークレット情報（APIキーなど）を安全に管理する方法について説明します。Parameter StoreはSecrets Managerの代替として、より低コストでシンプルなシークレット管理を提供します。

## 1. AWS Systems Manager Parameter Storeの概要

AWS Systems Manager Parameter Storeは、設定データやシークレット情報を階層的に保存・管理するためのAWSサービスです。主な利点は以下の通りです：

- 無料または低コストでの利用（標準パラメータは無料、高度なパラメータは有料）
- シークレット値の暗号化（AWS KMSを使用）
- 階層的な構造でのパラメータ管理
- バージョン管理とラベル付け
- AWS Secrets Managerよりもシンプルな機能セット

## 2. Parameter Storeでパラメータを作成する

### 2.1 AWS Management Consoleでの作成

1. [AWS Management Console](https://console.aws.amazon.com/)にログインします
2. AWS Systems Managerサービスに移動します
3. 左側のナビゲーションから「Parameter Store」を選択します
4. 「Create parameter」（パラメータの作成）をクリックします
5. 以下の情報を入力します：
   - 名前：`/amplify/{app_id}/{environment}/OPENAI_API_KEY`（例：`/amplify/d105t1gvfvrmti/prod/OPENAI_API_KEY`）
   - 説明：「OpenAI API Key for chat application」など
   - ティア：「Standard」または「Advanced」
   - タイプ：「SecureString」（暗号化されたシークレット情報の場合）
   - KMSキーソース：「My current account」（デフォルトのAWS KMSキーを使用）
   - 値：実際のAPIキー
6. 「Create parameter」をクリックしてパラメータを作成します

### 2.2 AWS CLIでの作成

```bash
aws ssm put-parameter \
    --name "/amplify/d105t1gvfvrmti/prod/OPENAI_API_KEY" \
    --description "OpenAI API Key for chat application" \
    --type "SecureString" \
    --value "your-api-key-here"
```

## 3. IAMロールの設定

Next.jsのAPIルートがParameter Storeからパラメータを取得するには、適切なIAM権限が必要です。

### 3.1 IAMポリシーを作成する

1. [IAMコンソール](https://console.aws.amazon.com/iam/)に移動します
2. 「Policies」→「Create policy」をクリックします
3. JSONエディタで以下のポリシーを入力します（パラメータ名とリージョンを適宜変更してください）：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ssm:GetParameter",
      "Resource": "arn:aws:ssm:us-east-1:123456789012:parameter/amplify/d105t1gvfvrmti/prod/OPENAI_API_KEY"
    }
  ]
}
```

4. ポリシー名（例：`AmplifyParameterStoreAccess`）を入力し、ポリシーを作成します

### 3.2 IAMロールにポリシーをアタッチする

1. IAMコンソールで「Roles」に移動します
2. Amplifyアプリケーションのサービスロールを検索します（通常は`amplifyconsole-backend-role`または`AmplifyServiceRole`という名前）
3. ロールを選択し、「Add permissions」→「Attach policies」をクリックします
4. 先ほど作成したポリシー（`AmplifyParameterStoreAccess`）を検索して選択します
5. 「Attach policies」をクリックしてポリシーをロールにアタッチします

## 4. Next.jsアプリケーションでの実装

### 4.1 必要なパッケージのインストール

```bash
npm install @aws-sdk/client-ssm
```

### 4.2 APIルートでの実装

```typescript
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// パラメータを取得する関数
async function getParameter(parameterName: string): Promise<string> {
  try {
    // SSMクライアントを作成
    const client = new SSMClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    // GetParameterCommandを作成
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true, // SecureStringの場合は復号化する
    });
    
    // コマンドを実行してパラメータを取得
    const response = await client.send(command);
    
    // パラメータ値を返す
    if (response.Parameter?.Value) {
      return response.Parameter.Value;
    } else {
      throw new Error('Parameter value not found');
    }
  } catch (error) {
    console.error('Error retrieving parameter:', error);
    throw error;
  }
}

// APIルートハンドラー
export async function POST(req: Request) {
  try {
    // リクエストを処理...
    
    // Parameter Storeからパラメータを取得
    const apiKey = await getParameter('/amplify/d105t1gvfvrmti/prod/OPENAI_API_KEY');
    
    // 取得したパラメータを使用して処理を続行...
    // ...
    
    return new Response(/* レスポンス */);
  } catch (error) {
    // エラーハンドリング...
    return new Response(/* エラーレスポンス */);
  }
}
```

## 5. ローカル開発環境での設定

ローカル開発環境でAWS Systems Manager Parameter Storeにアクセスするには、AWS認証情報を設定する必要があります。

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

エラーメッセージ：`AccessDeniedException: User is not authorized to perform: ssm:GetParameter`

**解決策**:
- IAMロールに`ssm:GetParameter`アクションの権限が付与されているか確認します
- パラメータのARNが正しいか確認します

### 6.3 パラメータが見つからないエラー

エラーメッセージ：`ParameterNotFound: Parameter /amplify/d105t1gvfvrmti/prod/OPENAI_API_KEY not found.`

**解決策**:
- パラメータ名が正しいか確認します
- パラメータが存在するリージョンと、コードで指定しているリージョンが一致しているか確認します

## 7. Secrets ManagerとParameter Storeの比較

| 機能 | AWS Secrets Manager | AWS Systems Manager Parameter Store |
|------|---------------------|-------------------------------------|
| 主な用途 | データベース認証情報、APIキー、その他のシークレット | 設定データ、シークレット情報 |
| コスト | 有料（シークレットごとに月額料金） | 標準パラメータは無料、高度なパラメータは有料 |
| 自動ローテーション | サポート | サポートなし |
| 暗号化 | AWS KMSによる暗号化 | AWS KMSによる暗号化（SecureStringの場合） |
| バージョン管理 | サポート | サポート |
| 階層構造 | なし | サポート |
| 最大サイズ | 64 KB | 標準：4 KB、高度：8 KB |

## 8. ベストプラクティス

- **命名規則**: パラメータ名には階層構造を使用して整理します（例：`/amplify/{app_id}/{environment}/{parameter_name}`）
- **最小権限の原則**: IAMロールには必要最小限の権限のみを付与します
- **暗号化**: シークレット情報には必ず`SecureString`タイプを使用します
- **キャッシング**: パフォーマンスを向上させるために、取得したパラメータをメモリ内でキャッシュすることを検討します
- **エラーハンドリング**: パラメータ取得時のエラーを適切に処理し、ユーザーフレンドリーなエラーメッセージを表示します
- **監査**: CloudTrailを有効にして、パラメータへのアクセスを監査します

## 9. 参考リソース

- [AWS Systems Manager Parameter Store公式ドキュメント](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [AWS SDK for JavaScript v3 - SSM](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ssm/index.html)
- [AWS Amplify公式ドキュメント](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
