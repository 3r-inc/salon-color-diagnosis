# Claude中継サーバー（Cloudflare Worker）設定手順

各iPadにAPIキーを入れずに、AI判定を全端末で使えるようにするための中継サーバーです。**無料**で作れます。

## 手順（ブラウザだけで完結・10分程度）

1. **Cloudflareに無料登録**
   - https://dash.cloudflare.com にアクセスし、メールで無料アカウントを作成（クレジットカード不要）。

2. **Workerを作る**
   - 左メニュー **「Workers & Pages」** → **「Create」**（作成）→ **「Create Worker」**
   - 名前を付ける（例：`salon-claude-proxy`）→ **「Deploy」**（いったん初期状態でデプロイ）

3. **コードを貼り替える**
   - 続けて **「Edit code」**（コードを編集）をクリック
   - エディタの中身を全部消して、同じフォルダの **`worker.js` の内容を丸ごと貼り付け**
   - 右上 **「Deploy」** を押す

4. **APIキーを登録する（ここが肝心）**
   - そのWorkerの **「Settings」**（設定）→ **「Variables and Secrets」**（変数とシークレット）
   - **「Add」** →種類で **「Secret」** を選ぶ
   - 名前： `ANTHROPIC_API_KEY`
   - 値： 取得したAPIキー（`sk-ant-...`）を貼り付け
   - 保存（Deploy）

5. **URLを控える**
   - Workerの画面に表示される公開URL（例：`https://salon-claude-proxy.xxxx.workers.dev`）をコピー
   - このURLを大塚さん（Claude）に伝える → アプリ側をこのURL経由に切り替えます

## 完了後
- 全iPadで、設定にAPIキーを入れなくてもAI判定が動くようになります。
- キーはこのサーバーの中だけに保管され、端末やアプリの公開ページには一切残りません。
- 使いすぎ防止に、Anthropic側の月額上限は引き続き設定しておくこと。
