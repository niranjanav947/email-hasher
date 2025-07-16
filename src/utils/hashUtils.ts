
import { generateMD5 } from './md5';

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

export const generateHash = async (input: string, algorithm: HashAlgorithm): Promise<string> => {
  const cleanInput = input.toLowerCase().trim();
  
  switch (algorithm) {
    case 'md5':
      return generateMD5(cleanInput);
    case 'sha1':
    case 'sha256':
    case 'sha512':
      return await generateWebCryptoHash(cleanInput, algorithm);
    default:
      throw new Error(`Unsupported hash algorithm: ${algorithm}`);
  }
};

const generateWebCryptoHash = async (input: string, algorithm: 'sha1' | 'sha256' | 'sha512'): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  const hashAlgorithm = algorithm.toUpperCase().replace(/(\d+)/, '-$1');
  const hashBuffer = await crypto.subtle.digest(hashAlgorithm, data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

export const getHashAlgorithmName = (algorithm: HashAlgorithm): string => {
  switch (algorithm) {
    case 'md5':
      return 'MD5';
    case 'sha1':
      return 'SHA-1';
    case 'sha256':
      return 'SHA-256';
    case 'sha512':
      return 'SHA-512';
    default:
      return algorithm.toUpperCase();
  }
};
