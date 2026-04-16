import { describe, expect, it } from "vitest";
import {
  normalizeCommunityUsername,
  validateCommunityCredentials,
} from "../src/lib/communityValidation";

describe("community credentials", () => {
  it("normalizes username as case-insensitive", () => {
    expect(normalizeCommunityUsername("  Soul_Fan  ")).toBe("soul_fan");
  });

  it("rejects weak or empty passwords", () => {
    expect(validateCommunityCredentials("valid_user", "")).toContain("Password");
    expect(validateCommunityCredentials("valid_user", "12345")).toContain("Password");
  });

  it("rejects invalid usernames", () => {
    expect(validateCommunityCredentials("ab", "123456")).toContain("Username");
    expect(validateCommunityCredentials("not valid", "123456")).toContain("Username");
  });

  it("accepts valid credentials", () => {
    expect(validateCommunityCredentials("soul_user", "123456")).toBeNull();
  });
});
