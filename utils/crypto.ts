import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Ensure we have a 32-byte key
function getSecretKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || "01234567890123456789012345678901"; // Fallback for testing ONLY

  // 64-char hex string = 32 bytes when decoded
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }

  // Exactly 32 ASCII chars = 32 bytes
  if (secret.length === 32) {
    return Buffer.from(secret);
  }

  // Anything else: hash to get a consistent 32-byte key
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptKey(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedText
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptKey(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const text = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
