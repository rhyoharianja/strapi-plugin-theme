import { getFetchClient } from '@strapi/strapi/admin';

import { normalizeTheme, type ThemeSettings } from '../../../shared/theme';
import { PLUGIN_ID } from '../pluginId';

/**
 * Fetch the current theme from the plugin's admin route.
 *
 * Uses `getFetchClient` rather than the `useFetchClient` hook because the theme is applied
 * during app bootstrap, before any React context exists. Reading the JWT out of storage by
 * hand does not work at all: Strapi 5 keeps the access token in memory behind an httpOnly
 * refresh cookie, so a hand-rolled `Authorization` header is empty and the request comes
 * back "Missing or invalid credentials".
 */
export const fetchTheme = async (): Promise<ThemeSettings | null> => {
  try {
    const { data } = await getFetchClient().get<{ data?: unknown }>(`/${PLUGIN_ID}/settings`);
    return normalizeTheme(data?.data);
  } catch {
    // Never let a theme failure block the admin panel from loading.
    return null;
  }
};
