// src/lib/googleAuth.ts
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

export const GoogleAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  scope: 'email profile',
  redirectUri: window.location.origin,
  responseType: 'token',
  prompt: 'consent',
  accessType: 'offline'
};
