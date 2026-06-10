import nacl from "tweetnacl";
import util from "tweetnacl-util";

/**
 * End-to-end encryption helpers using NaCl box (X25519 + XSalsa20-Poly1305).
 *
 * Model:
 * - Each user has a long-lived keypair generated on their device.
 * - The PUBLIC key is uploaded to `profiles.public_key`.
 * - The PRIVATE key NEVER leaves the device — stored in localStorage.
 *   (Consequence: messages are only readable on the device that holds the
 *   private key. Signing in on a new device generates a new keypair and
 *   prior ciphertext on that account becomes unreadable on the new device.
 *   Acceptable trade-off for v1 — no server-side key escrow.)
 */

const STORAGE_KEY = (uid: string) => `unadmitted.keypair.${uid}`;

export type LocalKeyPair = {
  publicKey: string;  // base64
  secretKey: string;  // base64 — secret, never sent to server
};

const b64 = util.encodeBase64;
const b64d = util.decodeBase64;

export const loadLocalKeyPair = (uid: string): LocalKeyPair | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(uid));
    if (!raw) return null;
    const kp = JSON.parse(raw) as LocalKeyPair;
    if (!kp.publicKey || !kp.secretKey) return null;
    return kp;
  } catch {
    return null;
  }
};

export const generateAndStoreKeyPair = (uid: string): LocalKeyPair => {
  const kp = nacl.box.keyPair();
  const stored: LocalKeyPair = {
    publicKey: b64(kp.publicKey),
    secretKey: b64(kp.secretKey),
  };
  localStorage.setItem(STORAGE_KEY(uid), JSON.stringify(stored));
  return stored;
};

export const ensureLocalKeyPair = (uid: string): LocalKeyPair =>
  loadLocalKeyPair(uid) ?? generateAndStoreKeyPair(uid);

export type Sealed = { body: string; nonce: string };

export const encryptFor = (
  plaintext: string,
  recipientPublicKeyB64: string,
  senderSecretKeyB64: string,
): Sealed => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const cipher = nacl.box(
    util.decodeUTF8(plaintext),
    nonce,
    b64d(recipientPublicKeyB64),
    b64d(senderSecretKeyB64),
  );
  return { body: b64(cipher), nonce: b64(nonce) };
};

export const decryptFrom = (
  ciphertextB64: string,
  nonceB64: string,
  senderPublicKeyB64: string,
  recipientSecretKeyB64: string,
): string | null => {
  try {
    const plain = nacl.box.open(
      b64d(ciphertextB64),
      b64d(nonceB64),
      b64d(senderPublicKeyB64),
      b64d(recipientSecretKeyB64),
    );
    if (!plain) return null;
    return util.encodeUTF8(plain);
  } catch {
    return null;
  }
};
