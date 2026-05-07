// Mock chrome API before requiring popup.js
global.chrome = {
  tabs: { query: jest.fn(), update: jest.fn(), create: jest.fn() },
  storage: { local: { get: jest.fn(), set: jest.fn() } },
};

const { detectLocale, switchUrl, isStressless, LOCALES, LOCALE_MAP } = require('./stressless-switcher/popup');

// ── isStressless ──────────────────────────────────────────────────────────────

describe('isStressless', () => {
  test('matches stressless.com', () => {
    expect(isStressless('https://www.stressless.com/en/')).toBe(true);
  });
  test('matches shop.stressless.com', () => {
    expect(isStressless('https://shop.stressless.com/en-gb/')).toBe(true);
  });
  test('does not match unrelated domain', () => {
    expect(isStressless('https://www.google.com')).toBe(false);
  });
  test('does not match stressless in path of wrong domain', () => {
    expect(isStressless('https://example.com/stressless')).toBe(false);
  });
});

// ── detectLocale ──────────────────────────────────────────────────────────────

describe('detectLocale', () => {
  test('detects simple locale', () => {
    expect(detectLocale('https://www.stressless.com/en/')).toBe('en');
  });
  test('detects compound locale', () => {
    expect(detectLocale('https://www.stressless.com/en-gb/sofas')).toBe('en-gb');
  });
  test('detects global', () => {
    expect(detectLocale('https://www.stressless.com/global/')).toBe('global');
  });
  test('returns null when no locale segment', () => {
    expect(detectLocale('https://www.stressless.com/')).toBeNull();
  });
  test('returns null for unrelated URL', () => {
    expect(detectLocale('https://www.google.com/en/')).toBeNull();
  });
  test('detects all defined locales', () => {
    for (const locale of LOCALES) {
      const url = `https://www.stressless.com/${locale.code}/some-page`;
      expect(detectLocale(url)).toBe(locale.code);
    }
  });
});

// ── switchUrl ─────────────────────────────────────────────────────────────────

describe('switchUrl', () => {
  test('replaces existing locale segment', () => {
    expect(switchUrl('https://www.stressless.com/en/sofas', 'de-de'))
      .toBe('https://www.stressless.com/de-de/sofas');
  });
  test('replaces locale at root with trailing slash', () => {
    expect(switchUrl('https://www.stressless.com/en/', 'fr-fr'))
      .toBe('https://www.stressless.com/fr-fr/');
  });
  test('replaces compound locale with simple one', () => {
    expect(switchUrl('https://www.stressless.com/en-gb/chairs', 'en'))
      .toBe('https://www.stressless.com/en/chairs');
  });
  test('replaces global with a locale', () => {
    expect(switchUrl('https://www.stressless.com/global/page', 'nb-no'))
      .toBe('https://www.stressless.com/nb-no/page');
  });
  test('injects locale when no locale segment present', () => {
    const result = switchUrl('https://www.stressless.com/some-page', 'en-au');
    expect(result).toBe('https://www.stressless.com/en-au/some-page');
  });
  test('preserves query string', () => {
    expect(switchUrl('https://www.stressless.com/en/?ref=nav', 'de-de'))
      .toBe('https://www.stressless.com/de-de/?ref=nav');
  });
  test('handles shop subdomain', () => {
    expect(switchUrl('https://shop.stressless.com/en-gb/cart', 'fr-fr'))
      .toBe('https://shop.stressless.com/fr-fr/cart');
  });
});

// ── LOCALE_MAP completeness ───────────────────────────────────────────────────

describe('LOCALE_MAP', () => {
  test('every locale in LOCALES is in LOCALE_MAP', () => {
    for (const locale of LOCALES) {
      expect(LOCALE_MAP[locale.code]).toEqual(locale);
    }
  });
  test('no duplicate locale codes', () => {
    const codes = LOCALES.map(l => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
