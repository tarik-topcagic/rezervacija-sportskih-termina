export function decodeJwtPayload(token: string): any {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  return JSON.parse(atob(padded));
}

export function getRolesFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token);
  const roleClaim = payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  if (!roleClaim) return [];
  return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
}

export function getUserIdFromToken(token: string): string | null {
  return decodeJwtPayload(token).sub ?? null;
}
