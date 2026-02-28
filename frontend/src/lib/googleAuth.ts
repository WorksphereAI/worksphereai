// src/lib/googleAuth.ts
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

// Use production URL for redirects, fallback to current origin
const getRedirectUri = () => {
  const prodUrl = import.meta.env.VITE_PROD_URL;
  if (prodUrl && prodUrl !== 'http://localhost:5173') {
    return prodUrl;
  }
  return window.location.origin;
};

export const GoogleAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  scope: 'email profile',
  redirectUri: getRedirectUri(),
  responseType: 'token',
  prompt: 'consent',
  accessType: 'offline'
};
