export const COMMUNITY_USERNAME_MIN = 3;
export const COMMUNITY_USERNAME_MAX = 24;
export const COMMUNITY_PASSWORD_MIN = 6;

export function normalizeCommunityUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidCommunityUsername(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < COMMUNITY_USERNAME_MIN || trimmed.length > COMMUNITY_USERNAME_MAX) {
    return false;
  }
  return /^[a-zA-Z0-9_]+$/.test(trimmed);
}

export function isValidCommunityPassword(value: string): boolean {
  return value.length >= COMMUNITY_PASSWORD_MIN;
}

export function validateCommunityCredentials(username: string, password: string): string | null {
  if (!isValidCommunityUsername(username)) {
    return "Username must be 3-24 chars and use only letters, numbers, or underscore.";
  }

  if (!isValidCommunityPassword(password)) {
    return "Password must be at least 6 characters.";
  }

  return null;
}
