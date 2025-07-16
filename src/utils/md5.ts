
// Simple MD5 implementation for client-side hashing
export function generateMD5(input: string): string {
  // Convert string to array of bytes
  const msg = new TextEncoder().encode(input);
  
  // MD5 constants
  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];

  const S = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];

  // Helper functions
  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);

  const rotateLeft = (n: number, b: number) => (n << b) | (n >>> (32 - b));
  const toUint32 = (x: number) => x >>> 0;

  // Pre-processing: adding padding bits
  const msgBits = msg.length * 8;
  const padded = new Uint8Array(msg.length + 1 + (64 - ((msg.length + 9) % 64)) % 64 + 8);
  padded.set(msg);
  padded[msg.length] = 0x80;
  
  // Append length in bits as 64-bit little-endian
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, msgBits, true);
  view.setUint32(padded.length - 4, Math.floor(msgBits / 0x100000000), true);

  // Initialize MD5 buffer
  let h0 = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;

  // Process message in 512-bit chunks
  for (let i = 0; i < padded.length; i += 64) {
    const chunk = new Uint32Array(padded.buffer, i, 16);
    
    let A = h0, B = h1, C = h2, D = h3;

    for (let j = 0; j < 64; j++) {
      let f, g;
      if (j < 16) {
        f = F(B, C, D);
        g = j;
      } else if (j < 32) {
        f = G(B, C, D);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = H(B, C, D);
        g = (3 * j + 5) % 16;
      } else {
        f = I(B, C, D);
        g = (7 * j) % 16;
      }

      f = toUint32(f + A + K[j] + chunk[g]);
      A = D;
      D = C;
      C = B;
      B = toUint32(B + rotateLeft(f, S[j]));
    }

    h0 = toUint32(h0 + A);
    h1 = toUint32(h1 + B);
    h2 = toUint32(h2 + C);
    h3 = toUint32(h3 + D);
  }

  // Convert to hex string
  const toHex = (n: number) => n.toString(16).padStart(8, '0');
  const result = new DataView(new ArrayBuffer(16));
  result.setUint32(0, h0, true);
  result.setUint32(4, h1, true);
  result.setUint32(8, h2, true);
  result.setUint32(12, h3, true);
  
  return Array.from(new Uint8Array(result.buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
