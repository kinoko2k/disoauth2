const discordOAuthClient = require('./lib/oauth');

/**
 * @param {Object} options
 * @param {Function} [options.saveUser] - 自動セッション保存の前に実行されるDB保存用非同期フック
 * @param {Function} [options.onSuccess] - ログイン成功時
 * @param {Function} [options.onError] - ログイン失敗時
 * @param {String} [options.loginPath='/auth/discord']
 * @param {String} [options.callbackPath='/auth/discord/callback']
 * @param {String} [options.successRedirect='/'] - 成功時のリダイレクト先
 * @param {String} [options.failureRedirect='/'] - 失敗時のリダイレクト先
*/
function discordOAuth(options = {}) {
  const {
    loginPath = '/auth/discord',
    callbackPath = '/auth/discord/callback',
    successRedirect = '/',
    failureRedirect = '/',
    onSuccess,
    onError,
    saveUser
  } = options;

  return async (req, res, next) => {
    if (req.method === 'GET' && req.path === loginPath) {
      try {
        const authUrl = discordOAuthClient.getAuthorizationUrl();
        return res.redirect(authUrl);
      } catch (error) {
        if (onError) return onError(error, req, res);
        console.error('Discord OAuth Error:', error.message);
        return res.redirect(failureRedirect);
      }
    }

    if (req.method === 'GET' && req.path === callbackPath) {
      if (req.query.error) {
        if (onError) return onError(new Error(req.query.error_description || req.query.error), req, res);
        return res.redirect(failureRedirect);
      }

      const code = req.query.code;
      if (!code) {
        if (onError) return onError(new Error('コードがありません'), req, res);
        return res.redirect(failureRedirect);
      }

      try {
        const tokenData = await discordOAuthClient.getAccessToken(code);
        const user = await discordOAuthClient.getUserInfo(tokenData.access_token);
        user.oauth = tokenData;

        if (onSuccess) {
          return onSuccess(user, req, res);
        }

        if (saveUser) {
          await saveUser(user, req, res);
        }

        if (req.session) {
          req.session.discordUser = user;
        }
        
        return res.redirect(successRedirect);
      } catch (error) {
        if (onError) return onError(error, req, res);
        console.error('Discord OAuth Callback Error:', error.message);
        return res.redirect(failureRedirect);
      }
    }

    if (req.session && req.session.discordUser) {
      req.user = req.session.discordUser;
    }

    next();
  };
}

module.exports = {
  discordOAuth,
  discordOAuthClient
};
