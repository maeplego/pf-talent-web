# pf-talent-web

P10 求人マッチングの候補者 / 企業 UI（学習用）。Next.js App Router。本番 IdP の置き換えではない。

検索は API の部分一致。OpenSearch / Postgres FTS のふりはしない。年収は整数。応募メールは出さない。

## 起動（2 コマンド）

API を先に上げる。

```powershell
cd pf-talent-api/deploy
copy .env.example .env
docker compose up -d --build
```

```powershell
cd pf-talent-web/deploy
copy .env.example .env
docker compose up -d --build
```

- Web: http://localhost:3010/?user=candidate-1
- API: http://localhost:8090/health（Compose 内の web は `http://host.docker.internal:8090` を呼ぶ）

ローカル開発:

```powershell
npm install
$env:TALENT_API_URL="http://localhost:8090"
npm run dev
```

API が落ちていても web プロセスは起動する。検索画面に「talent API に接続できません」と出す。

## 開発ユーザー

ゲスト相当は出さない。`?user=` が無いと選択画面になる。

| 例 | ロール |
| --- | --- |
| `?user=candidate-1` | candidate |
| `?user=employer-1&role=employer` | employer |

認可は API の `X-Dev-User-Sub`。画面の非表示だけでは足りない。

http://localhost:3010/?user=candidate-1 で検索→応募。`?user=employer-1&role=employer` で求人と応募者。

## 既知の制限

- メモリ API。再起動で求人はシードし直す
- OIDC は未接続（P01 ルートは後続）
- 検索は API 内の部分一致
- K8s overlay は別スライス
