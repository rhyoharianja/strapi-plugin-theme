import { extendTheme } from '@strapi/design-system';

import {
  DEFAULT_THEME,
  THEME_CACHE_KEY,
  normalizeTheme,
  shade,
  type ThemeSettings,
} from '../../../shared/theme';

/**
 * Just enough of the StrapiApp instance for this plugin to recolour it.
 *
 * The theme objects are left `unknown` and narrowed at the assignment: the Design System's
 * `Colors` is an interface, and TypeScript gives interfaces no implicit index signature, so
 * it is not assignable to `Record<string, string>` however string-valued it is.
 */
interface ThemeableApp {
  configurations: {
    themes: {
      light: unknown;
      dark: unknown;
    };
    menuLogo?: string;
    authLogo?: string;
  };
}

/**
 * Read the last known theme out of localStorage.
 *
 * Purely an anti-flash cache: it is applied synchronously during `register`, before the
 * first paint, and refreshed from the database afterwards. Any read failure (private mode,
 * blocked storage, stale shape) silently degrades to the defaults.
 */
export const readCachedTheme = (): ThemeSettings => {
  try {
    const raw = window.localStorage.getItem(THEME_CACHE_KEY);
    return raw ? normalizeTheme(JSON.parse(raw)) : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const writeCachedTheme = (theme: ThemeSettings): void => {
  try {
    window.localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(theme));
  } catch {
    // Storage is a convenience here, never a requirement.
  }
};

/** Derive a Strapi colour ramp (100…700) from one brand colour. */
const ramp = (prefix: string, base: string): Record<string, string> => ({
  [`${prefix}100`]: shade(base, 0.9),
  [`${prefix}200`]: shade(base, 0.75),
  [`${prefix}500`]: shade(base, 0.15),
  [`${prefix}600`]: base,
  [`${prefix}700`]: shade(base, -0.25),
});

/**
 * Recolour the panel by extending Strapi's own theme objects.
 *
 * The Design System is themed through a **styled-components theme object**
 * (`theme.colors.primary600`, …), not CSS custom properties — the only `var(--…)` it reads
 * are Radix internals. Injecting a stylesheet therefore cannot retheme the panel; the only
 * thing that appears to work is guessing at internal class names and overriding them, which
 * silently breaks anything else on the page that happens to match. An earlier version of
 * this plugin did exactly that and painted Puck's block palette with the brand colour.
 *
 * The extension goes through the Design System's documented `extendTheme`, which deep-merges
 * nested token objects and **clones** rather than mutating — so Strapi's exported
 * `lightTheme` is never modified in place. Writing into it directly, as a still earlier
 * version did, made a page reload the only route back to the original tokens.
 *
 * `app.configurations.themes` is read when the panel renders, so this must run during
 * `register()` — which is also why the cached copy exists, and why a colour change lands on
 * the next reload rather than the moment it is saved.
 */
export const applyTheme = (app: ThemeableApp, theme: ThemeSettings): void => {
  const settings = theme.enabled ? theme : DEFAULT_THEME;

  const colors = {
    ...ramp('primary', settings.primaryColor),
    ...ramp('secondary', settings.secondaryColor),
    danger600: settings.dangerColor,
    danger700: shade(settings.dangerColor, -0.25),
    success600: settings.successColor,
    success700: shade(settings.successColor, -0.25),
    // Buttons read their own tokens, so a primary change has to reach these too or the
    // palette and the buttons drift apart.
    buttonPrimary500: shade(settings.primaryColor, 0.15),
    buttonPrimary600: settings.primaryColor,
  };

  /*
   * The focus ring is four inset shadows in the brand colour, so it is derived rather than
   * left alone — otherwise changing the primary leaves every focused input outlined in the
   * old one.
   */
  const focus = ['inset 2px 0 0', 'inset 0 2px 0', 'inset -2px 0 0', 'inset 0 -2px 0']
    .map((offset) => `${offset} ${settings.primaryColor}`)
    .join(', ');

  for (const mode of ['light', 'dark'] as const) {
    const base = app.configurations.themes[mode];

    if (!base) continue;

    app.configurations.themes[mode] = extendTheme(base as never, {
      colors,
      shadows: { focus },
    });
  }

  // The brand logo in the navigation and on the login screen are plain configuration.
  if (settings.logoUrl) {
    app.configurations.menuLogo = settings.logoUrl;
    app.configurations.authLogo = settings.logoUrl;
  }
};

/** Swap the browser-tab icon, which is plain DOM and unrelated to the design system. */
export const applyFavicon = (theme: ThemeSettings): void => {
  if (!theme.enabled || !theme.faviconUrl) return;

  const existing = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  const link =
    existing ??
    document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }));

  link.href = theme.faviconUrl;
};
