export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // URL de tu backend local
  catApiKey: 'live_JBT0Ah0Nt12iyl2IpjQVLDWjcLk0GQwf4zI9wBMfmfejKmcC31mOJp4yJz5TsOUP', // API key para TheCatAPI
  defaultLanguage: 'es',
  enableDebug: true,
  version: '1.0.0-dev',
  auth: {
    tokenKey: 'catAppAuthToken',
    userKey: 'catAppCurrentUser',
    tokenExpiryKey: 'catAppTokenExpiry'
  },
  features: {
    enableAnalytics: false,
    enableLogger: true
  }
};
