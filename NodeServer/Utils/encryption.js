const crypto = require("crypto");
require("dotenv").config();

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.AES_KEY, "hex"); // 32 bytes
const iv = Buffer.from(process.env.AES_IV, "hex"); // 16 bytes

console.log("Key length:", key.length, "IV length:", iv.length);

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

function decrypt(encryptedText) {
  if (!encryptedText) return "";
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", {
      input: encryptedText,
      keyLength: key.length,
      ivLength: iv.length,
      error: err.message,
    });
    return ""; // Fallback to empty string
  }
}

module.exports = { encrypt, decrypt };
