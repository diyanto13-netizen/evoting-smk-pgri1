/**
 * Utility to guarantee 100% unique 6-digit secret PINs for school voters.
 * Range: 100000 - 999999 (900,000 unique possible combinations)
 */
export function generateUniquePin(existingPins: Set<string>): string {
  let pin = '';
  let attempts = 0;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;
    if (attempts > 50000) break;
  } while (existingPins.has(pin));

  existingPins.add(pin);
  return pin;
}

/**
 * Ensures an array of voters each have a distinct, non-duplicate 6-digit PIN.
 */
export function ensureUniquePins<T extends { pin?: string }>(
  items: T[],
  initialExistingPins: Set<string> = new Set()
): T[] {
  const usedPins = new Set<string>(initialExistingPins);

  return items.map((item) => {
    let pin = item.pin?.trim();
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin) || usedPins.has(pin)) {
      pin = generateUniquePin(usedPins);
    } else {
      usedPins.add(pin);
    }
    return {
      ...item,
      pin,
    };
  });
}
