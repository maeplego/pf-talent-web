# pf-talent-web

学習用の求人マッチング UI です。候補者の検索・応募と、企業の求人・応募者一覧があります。年収は整数です。応募メールは送りません。**本番の採用サイトの置き換えではありません。**

API は [pf-talent-api](https://github.com/maeplego/pf-talent-api) です。先に API を起動してください。

## 起動

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
- API: http://localhost:8090/health

ホスト開発:

```powershell
npm install
$env:TALENT_API_URL="http://localhost:8090"
npm run dev
```

API が落ちていても Web プロセスは起動し、検索画面に接続できない旨を出します。

## ユーザー

`?user=` が無いと選択画面になります。ゲスト相当はありません。

| 例 | 役割 |
| --- | --- |
| `?user=candidate-1` | 候補者 |
| `?user=employer-1&role=employer` | 企業 |

認可は API の開発ヘッダです。画面の非表示だけでは足りません。カレンダー未起動時、書類通過後の枠は「カレンダー未接続」になります。枠計算はカレンダー UI をコピーしません。
