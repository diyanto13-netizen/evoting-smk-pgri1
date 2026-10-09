import QRCode from 'qrcode';

export interface DecodedVoterQR {
  nisn: string;
  pin: string;
}

// In-memory cache for ultra-fast instant rendering of voter card QR codes
const voterQRCache = new Map<string, string>();

/**
 * Synchronous lookup for pre-generated QR code
 */
export function getCachedVoterQR(nisn: string, pin: string): string | undefined {
  const cleanId = String(nisn || '').trim();
  const cleanPin = String(pin || '').trim();
  return voterQRCache.get(`${cleanId}:${cleanPin}`);
}

/**
 * Generate a high quality vector QR Code DataURL for a voter card (Student or Teacher)
 * Uses lightweight SVG data-uri for 7x faster generation and pixel-perfect print clarity.
 */
export async function generateVoterQRCode(nisn: string, pin: string): Promise<string> {
  const cleanId = String(nisn || '').trim();
  const cleanPin = String(pin || '').trim();
  const cacheKey = `${cleanId}:${cleanPin}`;

  const cached = voterQRCache.get(cacheKey);
  if (cached) return cached;

  const payload = JSON.stringify({
    nisn: cleanId,
    nip: cleanId,
    pin: cleanPin,
    app: 'pemilos-smkspgri1',
  });

  try {
    // Generate clean SVG vector string: ~7x faster than canvas, 0 canvas DOM overhead
    const svgString = await QRCode.toString(payload, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    });
    const url = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    voterQRCache.set(cacheKey, url);
    return url;
  } catch {
    // Fallback to toDataURL if SVG fails
    try {
      const url = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 200,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      });
      voterQRCache.set(cacheKey, url);
      return url;
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      return '';
    }
  }
}

/**
 * Preload batch of voter QR codes asynchronously in background without freezing UI
 */
export async function preloadVoterQRCodesBatch(
  voters: Array<{ nisn: string; pin: string }>,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const pending = voters.filter((v) => !getCachedVoterQR(v.nisn, v.pin));
  if (pending.length === 0) {
    if (onProgress) onProgress(voters.length, voters.length);
    return;
  }

  const BATCH_SIZE = 25;
  let completed = voters.length - pending.length;

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const chunk = pending.slice(i, i + BATCH_SIZE);
    await Promise.all(chunk.map((v) => generateVoterQRCode(v.nisn, v.pin)));
    completed += chunk.length;
    if (onProgress) {
      onProgress(completed, voters.length);
    }
    // Yield to browser event loop
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/**
 * Safely parse QR code content scanned from a camera or image
 * Fully supports:
 * - 10-digit NISN for students
 * - 18-digit NIP or 16-digit NUPTK for teachers/staff
 * - Alphanumeric teacher IDs (e.g. GURU-01, TENDIK-02)
 */
export function parseVoterQR(rawText: string): DecodedVoterQR | null {
  if (!rawText) return null;
  const clean = rawText.trim();

  // 1. Try JSON parsing
  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === 'object') {
      const rawId = String(parsed.nisn || parsed.nip || parsed.nuptk || parsed.id || '').trim();
      const rawPin = String(parsed.pin || '').trim();
      if (/^\d{6}$/.test(rawPin)) {
        return { nisn: rawId || rawPin, pin: rawPin };
      }
    }
  } catch {
    // Not valid JSON, continue to string pattern matching
  }

  // 2. Try URI format: ?nisn=...&pin=... or ?nip=...&pin=...
  const idMatch = clean.match(/(?:nisn|nip|nuptk|id|pemilih)[=:]\s*([a-zA-Z0-9_.-]{3,30})/i);
  const pinMatch = clean.match(/pin[=:]\s*(\d{6})/i);
  if (idMatch && pinMatch) {
    return { nisn: idMatch[1].trim(), pin: pinMatch[1].trim() };
  }

  // 3. Try delimited format (e.g. EVOTE:198503152010011005:123456 or 198503152010011005,123456)
  const delimitedMatch = clean.match(/(?:EVOTE[:\s]+)?([a-zA-Z0-9_.-]{3,30})[\s,:|/-]+(\d{6})/i);
  if (delimitedMatch) {
    return { nisn: delimitedMatch[1].trim(), pin: delimitedMatch[2].trim() };
  }

  // 4. Try pure 6-digit PIN token (e.g. "839201" or "PIN: 839201")
  const purePinMatch = clean.match(/^(?:pin[:\s]*)?(\d{6})$/i);
  if (purePinMatch) {
    return { nisn: purePinMatch[1], pin: purePinMatch[1] };
  }

  return null;
}
