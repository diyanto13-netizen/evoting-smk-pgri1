import QRCode from 'qrcode';

export interface DecodedVoterQR {
  nisn: string;
  pin: string;
}

/**
 * Generate a high quality QR Code DataURL for a voter card (Student or Teacher)
 */
export async function generateVoterQRCode(nisn: string, pin: string): Promise<string> {
  const cleanId = String(nisn || '').trim();
  const cleanPin = String(pin || '').trim();

  const payload = JSON.stringify({
    nisn: cleanId,
    nip: cleanId,
    pin: cleanPin,
    app: 'pemilos-smkspgri1',
  });

  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 600,
      color: {
        dark: '#020617',
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
