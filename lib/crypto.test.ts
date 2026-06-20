import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { encryptSecret, decryptSecret } from "./crypto";

const key = crypto.randomBytes(32);

describe("crypto", () => {
  it("round-trips a secret", () => {
    const secret = "investor-password-123";
    const enc = encryptSecret(secret, key);
    expect(enc).not.toContain(secret);
    expect(decryptSecret(enc, key)).toBe(secret);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    expect(encryptSecret("same", key)).not.toBe(encryptSecret("same", key));
  });

  it("fails to decrypt with the wrong key", () => {
    const enc = encryptSecret("secret", key);
    expect(() => decryptSecret(enc, crypto.randomBytes(32))).toThrow();
  });

  it("detects tampering via the auth tag", () => {
    const enc = encryptSecret("secret", key);
    const buf = Buffer.from(enc, "base64");
    buf[buf.length - 1] ^= 0xff; // flip a ciphertext bit
    expect(() => decryptSecret(buf.toString("base64"), key)).toThrow();
  });
});
