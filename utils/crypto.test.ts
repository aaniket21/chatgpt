import { describe, it, expect } from "vitest";
import { encryptKey, decryptKey } from "./crypto";

describe("crypto utils", () => {
  it("should successfully encrypt and decrypt a string", () => {
    const secret = "test-api-key-123";
    const encrypted = encryptKey(secret);
    expect(encrypted).not.toBe(secret);
    
    const decrypted = decryptKey(encrypted);
    expect(decrypted).toBe(secret);
  });

  it("should fail to decrypt invalid data", () => {
    expect(() => decryptKey("invalid-data")).toThrow();
  });
});
