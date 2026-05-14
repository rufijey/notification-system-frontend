import * as crypto from './crypto';

class CryptoService {
  private privateKey: CryptoKey | null = null;
  private publicKey: string | null = null;
  private channelKeys: Map<string, CryptoKey> = new Map();

  async init(userId: string): Promise<string> {
    const storedPrivKey = localStorage.getItem(`crypto_priv_${userId}`);
    const storedPubKey = localStorage.getItem(`crypto_pub_${userId}`);

    if (storedPrivKey && storedPubKey) {
      this.privateKey = await crypto.importPrivateKey(storedPrivKey);
      this.publicKey = storedPubKey;
    } else {
      const keyPair = await crypto.generateUserKeyPair();
      this.privateKey = keyPair.privateKey;
      const pubKeyBase64 = await crypto.exportPublicKey(keyPair.publicKey);
      const privKeyBase64 = await crypto.exportPrivateKey(keyPair.privateKey);

      localStorage.setItem(`crypto_priv_${userId}`, privKeyBase64);
      localStorage.setItem(`crypto_pub_${userId}`, pubKeyBase64);
      this.publicKey = pubKeyBase64;
    }

    return this.publicKey;
  }

  getPublicKey(): string | null {
    return this.publicKey;
  }

  async getChannelKey(channelId: string, encryptedKeyBase64?: string): Promise<CryptoKey | null> {
    if (this.channelKeys.has(channelId)) {
      return this.channelKeys.get(channelId)!;
    }

    if (!encryptedKeyBase64 || !this.privateKey) {
      return null;
    }

    try {
      const aesKeyBase64 = await crypto.decryptWithPrivateKey(this.privateKey, encryptedKeyBase64);
      const aesKey = await crypto.importAESKey(aesKeyBase64);
      this.channelKeys.set(channelId, aesKey);
      return aesKey;
    } catch (e) {
      console.error(`Failed to decrypt channel key for ${channelId}:`, e);
      return null;
    }
  }

  async encryptMessage(channelId: string, text: string): Promise<string> {
    const key = this.channelKeys.get(channelId);
    if (!key) return text; // Fallback to plain text if no key (though shouldn't happen for encrypted channels)
    return crypto.encryptMessage(key, text);
  }

  async decryptMessage(channelId: string, encryptedText: string): Promise<string> {
    const key = this.channelKeys.get(channelId);
    if (!key) return encryptedText;
    
    try {
      return await crypto.decryptMessage(key, encryptedText);
    } catch (e) {
      console.warn(`Failed to decrypt message in ${channelId}:`, e);
      return '[Decryption Failed]';
    }
  }
}

export const cryptoService = new CryptoService();
