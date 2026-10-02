import QRCode from 'qrcode';

export interface DecodedVoterQR {
  nisn: string;
  pin: string;
}

/**
 * Generate a high quality QR Code DataURL for a voter card
 */
export async function generateVoterQRCode(nisn: string, pin: string): Promise<string> {
  const payload = JSON.stringify({
    nisn,
    pin,
    app: 'pemilos-smkspgri1',
  });

  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

/**
 * Safely parse QR code content scanned from a camera or image
 */
export function parseVoterQR(rawText: string): DecodedVoterQR | null {
  if (!rawText) return null;
  const clean = rawText.trim();

  // 1. Try JSON
  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === 'object') {
      const nisn = String(parsed.nisn || '').trim();
      const pin = String(parsed.pin || '').trim();
      if (/^\d{10}$/.test(nisn) && /^\d{6}$/.test(pin)) {
        return { nisn, pin };
      }
    }
  } catch {
    // Not json, continue
  }

  // 2. Try URI format: ?nisn=...&pin=...
  const nisnMatch = clean.match(/nisn[=:]\s*(\d{10})/i);
  const pinMatch = clean.match(/pin[=:]\s*(\d{6})/i);
  if (nisnMatch && pinMatch) {
    return { nisn: nisnMatch[1], pin: pinMatch[1] };
  }

  // 3. Try delimited format (e.g. 0071234561:123456 or 0071234561,123456)
  const delimitedMatch = clean.match(/(\d{10})[\s,:|/-]+(\d{6})/);
  if (delimitedMatch) {
    return { nisn: delimitedMatch[1], pin: delimitedMatch[2] };
  }

  return null;
}
