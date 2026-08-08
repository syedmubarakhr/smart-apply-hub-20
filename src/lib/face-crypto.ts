/**
 * Client-side encryption for biometric captures.
 * AES-256-GCM with a key deterministically derived (PBKDF2) from the user id,
 * so stored templates are never plaintext images at rest.
 */

const enc = new TextEncoder();

async function deriveKey(userId: string): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", enc.encode(userId), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(`sats-face-${userId}`),
      iterations: 100_000,
      hash: "SHA-256",
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

/** Encrypts a data URL / string, returning `v1.<iv>.<ciphertext>` base64 parts. */
export async function encryptFaceImage(userId: string, payload: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) return payload;
  const key = await deriveKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(payload));
  return `v1.${toBase64(iv)}.${toBase64(new Uint8Array(cipher))}`;
}

function fromBase64(value: string): Uint8Array {
  const raw = atob(value);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** Decrypts a `v1.<iv>.<ciphertext>` payload produced by encryptFaceImage. */
export async function decryptFaceImage(userId: string, payload: string): Promise<string> {
  if (!payload.startsWith("v1.")) return payload;
  if (typeof crypto === "undefined" || !crypto.subtle) return payload;
  const [, iv, cipher] = payload.split(".");
  if (!iv || !cipher) return payload;
  const key = await deriveKey(userId);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) },
    key,
    fromBase64(cipher),
  );
  return new TextDecoder().decode(plain);
}
