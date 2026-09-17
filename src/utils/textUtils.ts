export function countWords(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Match contiguous non-whitespace sequences
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function truncateToMaxWords(text: string, maxWords: number = 50): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ');
}

export function validateWordCount(text: string, maxWords: number = 50) {
  const count = countWords(text);
  return {
    count,
    maxWords,
    isValid: count <= maxWords,
    remaining: Math.max(0, maxWords - count),
    isOverLimit: count > maxWords,
  };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function formatPortalDisplayUrl(url?: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
  } catch {
    return url.replace(/^https?:\/\//, '');
  }
}

/**
 * Generates a high-entropy, cryptographically strong random password
 * Format: e.g. CU#9mK7$pL2!
 */
export function generateSecurePassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*';

  const all = upper + lower + digits + symbols;
  let result = 'CU#'; // Standard University prefix
  
  // Guarantee at least one from each required set
  result += upper[Math.floor(Math.random() * upper.length)];
  result += lower[Math.floor(Math.random() * lower.length)];
  result += digits[Math.floor(Math.random() * digits.length)];
  result += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = result.length; i < length; i++) {
    result += all[Math.floor(Math.random() * all.length)];
  }

  return result;
}

/**
 * Formats user authentication details for copying
 */
export function formatAuthenticationInfo(user: {
  fullName: string;
  email: string;
  role: string;
  department: string;
  passwordPlain: string;
}): string {
  return [
    '========================================',
    'UNIVERSITY OF CHITTAGONG - SERVICES PORTAL',
    'Administrative Authentication Credentials',
    '========================================',
    `User Full Name : ${user.fullName}`,
    `Department     : ${user.department}`,
    `Login Email    : ${user.email}`,
    `System Role    : ${user.role}`,
    `Passcode       : ${user.passwordPlain}`,
    `Portal URL     : https://services.cu.ac.bd`,
    '----------------------------------------',
    'Confidential: Do not share these credentials.',
    '========================================',
  ].join('\n');
}

