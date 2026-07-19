// Decodes a JWT payload client-side, for UI purposes only (e.g. showing/hiding
// nav links). The backend independently verifies and enforces the token on
// every protected request — this is never used for authorization itself.
export function decodeToken(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
