require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { discordOAuth } = require('../index');

const app = express();
const port = process.env.PORT || 3000;

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(discordOAuth());

app.get('/', (req, res) => {
  if (req.user) {
    const avatarUrl = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
    res.send(`
      <div style="font-family: sans-serif; padding: 2rem;">
        <h1>ログイン成功！</h1>
        <img src="${avatarUrl}" width="100" style="border-radius: 50%;" />
        <p>こんにちは、<strong>${req.user.username}</strong> さん！</p>
        <a href="/logout">ログアウト</a>
      </div>
    `);
  } else {
    res.send(`
      <div style="font-family: sans-serif; padding: 2rem;">
        <h1>Discord Login Test</h1>
        <a href="/auth/discord" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #5865F2;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Login with Discord</a>
      </div>
    `);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`サーバーが起動しました。http://localhost:${port}`);
  console.log(`DiscordリダイレクトURL➡ http://localhost:${port}/auth/discord/callback`);
});
