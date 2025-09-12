// Client-side crypto utilities for frontend encryption/decryption

/**
 * Generate a secure random ID for reports
 */
export function generateReportId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash data using SHA-256
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple XOR encryption for demonstration purposes
 * In production, use proper encryption libraries
 */
export function simpleEncrypt(data: string, key: string): string {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result.push(String.fromCharCode(charCode));
  }
  return btoa(result.join(''));
}

/**
 * Simple XOR decryption
 */
export function simpleDecrypt(encryptedData: string, key: string): string {
  try {
    const data = atob(encryptedData);
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result.push(String.fromCharCode(charCode));
    }
    return result.join('');
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

/**
 * Generate a secure session key
 */
export function generateSessionKey(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate encryption strength
 */
export function validateEncryptionStrength(algorithm: string): boolean {
  const approvedAlgorithms = ['kyber-1024', 'dilithium-3', 'aes-256-gcm'];
  return approvedAlgorithms.includes(algorithm.toLowerCase());
}
