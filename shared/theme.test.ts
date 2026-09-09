import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, normalizeTheme, shade } from './theme';

/**
 * The plugin recolours every button, input, card and badge in the admin from four values, so
 * the two things worth testing are that a bad value cannot get through and that a good one
 * produces a sane ramp. A malformed colour reaching `theme.colors` does not fail loudly — it
 * produces an unreadable panel.
 */

describe('normalizeTheme', () => {
  it('accepts a complete, valid theme unchanged', () => {
    const theme = {
      enabled: false,
      primaryColor: '#123456',
      secondaryColor: '#abcdef',
      dangerColor: '#ff0000',
      successColor: '#00ff00',
      logoUrl: 'https://example.test/logo.png',
      faviconUrl: null,
    };

    expect(normalizeTheme(theme)).toEqual(theme);
  });

  it('falls back per field, so one bad colour costs only that colour', () => {
    const result = normalizeTheme({
      primaryColor: 'rebeccapurple',
      secondaryColor: '#abc',
    });

    expect(result.primaryColor).toBe(DEFAULT_THEME.primaryColor);
    expect(result.secondaryColor).toBe('#abc');
  });

  it('accepts three-digit hex', () => {
    expect(normalizeTheme({ primaryColor: '#f0a' }).primaryColor).toBe('#f0a');
  });

  it('rejects a hex without its hash, and anything that is not a string', () => {
    expect(normalizeTheme({ primaryColor: '123456' }).primaryColor).toBe(
      DEFAULT_THEME.primaryColor
    );
    expect(normalizeTheme({ primaryColor: 0x123456 }).primaryColor).toBe(
      DEFAULT_THEME.primaryColor
    );
  });

  it('keeps `enabled: false`, which a truthiness check would lose', () => {
    expect(normalizeTheme({ enabled: false }).enabled).toBe(false);
    expect(normalizeTheme({}).enabled).toBe(true);
  });

  it('treats a missing media field as null rather than undefined', () => {
    expect(normalizeTheme({}).logoUrl).toBeNull();
    expect(normalizeTheme({ logoUrl: 42 }).logoUrl).toBeNull();
  });

  it('survives null, undefined and the wrong shape entirely', () => {
    for (const input of [null, undefined, 'nonsense', 7, []]) {
      expect(normalizeTheme(input)).toEqual(DEFAULT_THEME);
    }
  });
});

describe('shade', () => {
  it('returns the colour itself at zero', () => {
    expect(shade('#4945ff', 0)).toBe('#4945ff');
  });

  it('lightens towards white and darkens towards black', () => {
    expect(shade('#000000', 1)).toBe('#ffffff');
    expect(shade('#ffffff', -1)).toBe('#000000');
  });

  it('expands three-digit hex before shading', () => {
    expect(shade('#fff', -1)).toBe('#000000');
  });

  it('clamps rather than overflowing a channel', () => {
    // The ramp asks for 0.9 on colours that are already near-white.
    expect(shade('#fefefe', 0.9)).toBe('#ffffff');
  });

  it('pads a single-digit channel, so the result is always a valid hex', () => {
    // 0x0a darkened to 0x01: without padding this would emit `#111` and mean something else.
    expect(shade('#0a0a0a', -0.9)).toBe('#010101');
    expect(shade('#4945ff', 0.9)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('passes an unparseable value straight through', () => {
    // Better an unchanged colour than `#NaNNaNNaN` in a token.
    expect(shade('not-a-colour', 0.5)).toBe('not-a-colour');
  });
});
