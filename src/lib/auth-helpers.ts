import crypto from 'crypto';

// 32 karakterlik bir gizli anahtar (çevre değişkeninde yoksa fallback olarak kullanılır)
const ENCRYPTION_KEY = process.env.AUTH_SECRET || "c5d8f41c683917d194baa764f9642606"; 
const IV_LENGTH = 16;

/**
 * Şifreyi PBKDF2 algoritması ve rastgele salt ile güvenli bir şekilde hash'ler.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Girilen şifreyi kaydedilen hash ile karşılaştırır.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (error) {
    return false;
  }
}

/**
 * Oturum verisini AES-256-CBC ile şifreler.
 */
export function encryptSession(data: any): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Şifrelenmiş oturum verisini çözer ve objeye dönüştürür.
 */
export function decryptSession(text: string): any | null {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() || '', 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (error) {
    return null;
  }
}
