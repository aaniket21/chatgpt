import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Ensure we have a 32-byte key
function getSecretKey() {
  const secret = process.env.ENCRYPTION_KEY || "01234567890123456789012345678901"; // Fallback for testing ONLY
  if (secret.length !== 32) {
    // If not 32 bytes, hash it to make it 32 bytes
    return crypto.createHash("sha256").update(secret).digest();
  }
  return Buffer.from(secret);
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
