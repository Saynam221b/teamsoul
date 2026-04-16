import { createHash, randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import type { CommunityUser } from "@/data/types";
import {
  createCommunitySession,
  createCommunityUser,
  deleteCommunitySessionByTokenHash,
  findCommunitySessionByTokenHash,
  findCommunityUserByNormalizedUsername,
  touchCommunitySession,
} from "@/lib/db/community";
import {
  normalizeCommunityUsername,
  validateCommunityCredentials,
} from "@/lib/communityValidation";

const scrypt = promisify(scryptCallback);

export const COMMUNITY_SESSION_COOKIE = "team_soul_community_session";
const SESSION_TTL_DAYS = 30;

function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return derived.toString("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function signUpCommunityUser(payload: { username: string; password: string }): Promise<CommunityUser> {
  const username = payload.username.trim();
  const password = payload.password;
  const validationError = validateCommunityCredentials(username, password);
  if (validationError) {
    throw new Error(validationError);
  }

  const usernameNormalized = normalizeCommunityUsername(username);
  const existing = await findCommunityUserByNormalizedUsername(usernameNormalized);
  if (existing) {
    throw new Error("Username is already taken.");
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(password, salt);

  return createCommunityUser({
    username,
    usernameNormalized,
    passwordHash,
    passwordSalt: salt,
  });
}

export async function loginCommunityUser(payload: {
  username: string;
  password: string;
}): Promise<{ user: CommunityUser; sessionToken: string; expiresAt: Date }> {
  const usernameNormalized = normalizeCommunityUsername(payload.username);
  const candidate = await findCommunityUserByNormalizedUsername(usernameNormalized);
  if (!candidate) {
    throw new Error("Invalid username or password.");
  }

  const expectedHash = await hashPassword(payload.password, candidate.passwordSalt);
  if (expectedHash !== candidate.passwordHash) {
    throw new Error("Invalid username or password.");
  }

  const sessionToken = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await createCommunitySession({
    userId: candidate.id,
    tokenHash: hashToken(sessionToken),
    expiresAtIso: expiresAt.toISOString(),
  });

  return {
    user: {
      id: candidate.id,
      username: candidate.username,
      createdAt: candidate.createdAt,
    },
    sessionToken,
    expiresAt,
  };
}

export async function getCurrentCommunityUser(): Promise<CommunityUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COMMUNITY_SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessionLookup = await findCommunitySessionByTokenHash(hashToken(token));
  if (!sessionLookup) {
    return null;
  }

  void touchCommunitySession(sessionLookup.session.id);
  return sessionLookup.user;
}

export async function requireCommunityUser(): Promise<CommunityUser> {
  const user = await getCurrentCommunityUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function logoutCommunitySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COMMUNITY_SESSION_COOKIE)?.value;
  if (!token) return;
  await deleteCommunitySessionByTokenHash(hashToken(token));
}

export function getCommunitySessionCookieConfig(expiresAt: Date) {
  return {
    name: COMMUNITY_SESSION_COOKIE,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    },
  };
}
