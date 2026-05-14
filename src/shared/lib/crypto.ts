/**
 * Crypto utility library for End-to-End Encryption (E2EE)
 * Uses Web Crypto API (SubtleCrypto)
 */

const RSA_ALGORITHM = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

const AES_ALGORITHM = {
  name: 'AES-GCM',
  length: 256,
};

// --- RSA Helpers ---

export async function generateUserKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    RSA_ALGORITHM,
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  return arrayBufferToBase64(exported);
}

export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const binaryKey = base64ToArrayBuffer(base64Key);
  return window.crypto.subtle.importKey(
    'spki',
    binaryKey,
    RSA_ALGORITHM,
    true,
    ['encrypt']
  );
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('pkcs8', key);
  return arrayBufferToBase64(exported);
}

export async function importPrivateKey(base64Key: string): Promise<CryptoKey> {
  const binaryKey = base64ToArrayBuffer(base64Key);
  return window.crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    RSA_ALGORITHM,
    true,
    ['decrypt']
  );
}

// --- AES Helpers ---

export async function generateChannelKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    AES_ALGORITHM,
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportAESKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

export async function importAESKey(base64Key: string): Promise<CryptoKey> {
  const binaryKey = base64ToArrayBuffer(base64Key);
  return window.crypto.subtle.importKey(
    'raw',
    binaryKey,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
}

// --- Encryption / Decryption ---

export async function encryptWithPublicKey(publicKey: CryptoKey, data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const encrypted = await window.crypto.subtle.encrypt(RSA_ALGORITHM, publicKey, encoded);
  return arrayBufferToBase64(encrypted);
}

export async function decryptWithPrivateKey(privateKey: CryptoKey, base64Data: string): Promise<string> {
  const binaryData = base64ToArrayBuffer(base64Data);
  const decrypted = await window.crypto.subtle.decrypt(RSA_ALGORITHM, privateKey, binaryData);
  return new TextDecoder().decode(decrypted);
}

export async function encryptMessage(aesKey: CryptoKey, text: string): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encoded
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return arrayBufferToBase64(combined.buffer);
}

export async function decryptMessage(aesKey: CryptoKey, base64Data: string): Promise<string> {
  const combined = base64ToArrayBuffer(base64Data);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    aesKey,
    data
  );

  return new TextDecoder().decode(decrypted);
}

// --- Buffer Utilities ---

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
