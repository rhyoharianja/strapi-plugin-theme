/**
 * Theme contract shared by the plugin's server and admin bundles.
 *
 * Kept here rather than in either side so the field names and the safe defaults cannot drift
 * apart between what the API returns and what the panel applies.
 *
 * **Scope: colours, and the two brand images.** An earlier version of this plugin also
 * carried corner radius, spacing density, a type scale, a font family and three navigation
 * layouts — including a replacement sidebar of its own. Those were removed deliberately.
 * Colours reach every component in the admin through Strapi's own tokens and cannot fail
 * halfway; the structural parts either needed CSS aimed at Strapi's internals or a second
 * React root spliced into its shell, and the second of those never reliably rendered. What
 * is left is the part that works.
 */

export interface ThemeSettings {
  /** Off reverts to Strapi's palette without discarding the configured colours. */
  enabled: boolean;
  primaryColor: string;
  secondaryColor: string;
  dangerColor: string;
  successColor: string;
  /** Used for the navigation and login logos; plain Strapi configuration. */
  logoUrl: string | null;
  faviconUrl: string | null;
}

/** Strapi's own palette — used until Theme Settings is configured. */
export const DEFAULT_THEME: ThemeSettings = {
  enabled: true,
  primaryColor: '#4945ff',
  secondaryColor: '#7b79ff',
  dangerColor: '#d02b20',
  successColor: '#328048',
  logoUrl: null,
  faviconUrl: null,
};

/** localStorage key holding the last known theme, to prevent a flash before first paint. */
export const THEME_CACHE_KEY = 'theme';

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Normalise anything that claims to be a theme into a complete, valid one.
 *
 * Per-field fallbacks rather than an all-or-nothing check: one bad colour should cost that
 * colour, not the whole palette, and never the panel.
 */
export const normalizeTheme = (input: unknown): ThemeSettings => {
  const source = (input ?? {}) as Partial<ThemeSettings>;

  const color = (value: unknown, fallback: string): string =>
    typeof value === 'string' && HEX.test(value) ? value : fallback;

  return {
    enabled: typeof source.enabled === 'boolean' ? source.enabled : DEFAULT_THEME.enabled,
    primaryColor: color(source.primaryColor, DEFAULT_THEME.primaryColor),
    secondaryColor: color(source.secondaryColor, DEFAULT_THEME.secondaryColor),
    dangerColor: color(source.dangerColor, DEFAULT_THEME.dangerColor),
    successColor: color(source.successColor, DEFAULT_THEME.successColor),
    logoUrl: typeof source.logoUrl === 'string' ? source.logoUrl : null,
    faviconUrl: typeof source.faviconUrl === 'string' ? source.faviconUrl : null,
  };
};

/**
 * Lighten or darken a hex colour by `amount` (-1..1).
 *
 * Each brand colour has to fill a five-stop Strapi ramp (100…700), so the tints and shades
 * are derived rather than asked for — four colour pickers instead of twenty.
 */
export const shade = (hex: string, amount: number): string => {
  if (!HEX.test(hex)) return hex;

  const full =
    hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;

  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(full.slice(offset, offset + 2), 16);
    const shifted = amount >= 0 ? value + (255 - value) * amount : value * (1 + amount);

    return Math.round(Math.min(255, Math.max(0, shifted)))
      .toString(16)
      .padStart(2, '0');
  });

  return `#${channels.join('')}`;
};
