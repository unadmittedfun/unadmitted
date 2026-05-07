import CryptoJS from "crypto-js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

export const SECURITY_CONFIG = {
  KEY_SIZE: 256,
  IV_SIZE: 128,
  SALT_ROUNDS: 10000,
  ENCRYPTION_ALGORITHM: "AES-256-GCM",
  HASH_ALGORITHM: "SHA-256",
  PBKDF2_ITERATIONS: 100000,
};

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  keyId: string;
}

export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
  keyId: string;
  timestamp: number;
  signature?: string;
}

export class SecurityUtils {
  private static instance: SecurityUtils;
  private constructor() {}
  static getInstance(): SecurityUtils {
    if (!SecurityUtils.instance) SecurityUtils.instance = new SecurityUtils();
    return SecurityUtils.instance;
  }

  async generateKey
