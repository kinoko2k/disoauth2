# disoauth2

`.env` に環境変数を設定するだけで、アプリケーションにDiscord OAuth2ログイン機能を追加できるライブラリです。

## インストール

```bash
npm install @kinoko2k/disoauth2 dotenv express-session
```

## 設定

プロジェクトのルートディレクトリに `.env` ファイルを作成し、Discord Developer Portal で取得した情報を設定してください。

```env
DISCORD_CLIENT_ID=クライアントID
DISCORD_CLIENT_SECRET=クライアントシークレット
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

## 使い方（超簡単モード）

`discordOAuth()`に何も引数を渡さない場合、自動的にセッションにユーザーを保存し、トップページにリダイレクトします。  
その後は、`req.user`からDiscordのユーザー情報にアクセスできます。

```javascript
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { discordOAuth } = require("@kinoko2k/disoauth2");

const app = express();

app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));

app.use(discordOAuth());

app.get("/", (req, res) => {
  if (req.user) {
    res.send(`ようこそ、${req.user.username} さん！`);
  } else {
    res.send(`<a href="/auth/discord">Discordでログイン</a>`);
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## 取得情報

- `req.user.id`: Discord ユーザー ID
- `req.user.username`: ユーザー名
- `req.user.email`: メールアドレス
- `req.user.avatar`: アバター画像ハッシュ
- `req.user.oauth.access_token`: アクセストークン

## カスタマイズ（応用）

リダイレクト先を変えたり、ユーザー情報をデータベースに保存したい場合はオプションを渡せます。

```javascript
app.use(
  discordOAuth({
    successRedirect: "/dashboard", // 成功時のリダイレクト先
    failureRedirect: "/login?error=true", // 失敗時のリダイレクト先

    saveUser: async (user) => {
      // 例: DBにユーザーを保存・更新する処理
      // await db.query('INSERT INTO users ...', [user.id, user.username]);
    },

    // ※ もし自動リダイレクトもセッション保存も使わず、完全に自作したい場合はonSuccessを使います。
    // onSuccess: (user, req, res) => { res.send(""); }
  }),
);
```

## ライセンス

MIT License
