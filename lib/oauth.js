const axios = require('axios');

const DISCORD_API_BASE = 'https://discord.com/api/v10';

class DiscordOAuth {
  get config() {
    return {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      redirectUri: process.env.DISCORD_REDIRECT_URI,
      scopes: process.env.DISCORD_SCOPES || 'identify email',
    };
  }

  getAuthorizationUrl() {
    this._validateConfig();
    const { clientId, redirectUri, scopes } = this.config;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
    });
    
    return `${DISCORD_API_BASE}/oauth2/authorize?${params.toString()}`;
  }

  async getAccessToken(code) {
    this._validateConfig();
    const { clientId, clientSecret, redirectUri } = this.config;
    
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    });

    try {
      const response = await axios.post(`${DISCORD_API_BASE}/oauth2/token`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`トークン交換エラー: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(`${DISCORD_API_BASE}/users/@me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`ユーザー情報取得エラー: ${error.response?.data?.message || error.message}`);
    }
  }

  _validateConfig() {
    const { clientId, clientSecret, redirectUri } = this.config;
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Discord OAuth の設定が見つかりません。.env ファイルに DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI を設定してください。');
    }
  }
}

module.exports = new DiscordOAuth();
