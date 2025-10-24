/**
 * Shared encryption utilities
 */

import crypto from 'crypto';

export interface EncryptionOptions {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

export class EncryptionUtils {
  private static readonly DEFAULT_OPTIONS: EncryptionOptions = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16
  };
  
  /**
   * Generate a random encryption key
   */
  public static generateKey(options: Partial<EncryptionOptions> = {}): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    return crypto.randomBytes(opts.keyLength).toString('hex');
  }
  
  /**
   * Generate a random IV
   */
  public static generateIV(options: Partial<EncryptionOptions> = {}): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    return crypto.randomBytes(opts.ivLength).toString('hex');
  }
  
  /**
   * Encrypt data
   */
  public static encrypt(
    data: string,
    key: string,
    options: Partial<EncryptionOptions> = {}
  ): { encrypted: string; iv: string; tag: string } {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const iv = Buffer.from(this.generateIV(options), 'hex');
    const cipher = crypto.createCipher(opts.algorithm, Buffer.from(key, 'hex'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = (cipher as any).getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  /**
   * Decrypt data
   */
  public static decrypt(
    encrypted: string,
    key: string,
    iv: string,
    tag: string,
    options: Partial<EncryptionOptions> = {}
  ): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const decipher = crypto.createDecipher(opts.algorithm, Buffer.from(key, 'hex'));
    
    (decipher as any).setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Hash data with salt
   */
  public static hash(data: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512').toString('hex');
    
    return { hash, salt: actualSalt };
  }
  
  /**
   * Verify hash
   */
  public static verifyHash(data: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hash(data, salt);
    return computedHash === hash;
  }
  
  /**
   * Generate secure random string
   */
  public static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
  
  /**
   * Generate JWT secret
   */
  public static generateJWTSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}
