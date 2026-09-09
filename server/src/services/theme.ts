import type { Core } from '@strapi/strapi';

import { DEFAULT_THEME, type ThemeSettings } from '../../../shared/theme';
import { documents } from '../utils/documents';

export const THEME_UID = 'plugin::content-hub-theme.theme-settings' as const;

/**
 * Reads and writes the Theme Settings single type.
 *
 * The database is the single source of truth. The admin panel caches a copy in
 * localStorage purely to avoid a flash of unstyled colours before the first fetch
 * resolves — it never overrides what comes back from here.
 */
const theme = ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(): Promise<ThemeSettings> {
    const entry = await strapi.documents(THEME_UID).findFirst({ populate: ['logo', 'favicon'] });

    if (!entry) {
      return DEFAULT_THEME;
    }

    // Fall back per field: a half-configured entry must not produce an unusable panel.
    return {
      enabled: entry.enabled ?? DEFAULT_THEME.enabled,
      primaryColor: entry.primaryColor || DEFAULT_THEME.primaryColor,
      secondaryColor: entry.secondaryColor || DEFAULT_THEME.secondaryColor,
      dangerColor: entry.dangerColor || DEFAULT_THEME.dangerColor,
      successColor: entry.successColor || DEFAULT_THEME.successColor,
      logoUrl: entry.logo?.url ?? null,
      faviconUrl: entry.favicon?.url ?? null,
    };
  },

  /**
   * Update the palette.
   *
   * Lives here rather than in the Content Manager: the single type is hidden from it so the
   * collection-type list stays content-only, which means this plugin owns its own editing.
   */
  async update(patch: Partial<ThemeSettings>): Promise<ThemeSettings> {
    const existing = await documents(strapi, THEME_UID).findFirst();

    const data = {
      ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
      ...(patch.primaryColor !== undefined ? { primaryColor: patch.primaryColor } : {}),
      ...(patch.secondaryColor !== undefined ? { secondaryColor: patch.secondaryColor } : {}),
      ...(patch.dangerColor !== undefined ? { dangerColor: patch.dangerColor } : {}),
      ...(patch.successColor !== undefined ? { successColor: patch.successColor } : {}),
    };

    if (existing) {
      await documents(strapi, THEME_UID).update({ documentId: existing.documentId, data });
    } else {
      await documents(strapi, THEME_UID).create({ data });
    }

    return this.find();
  },

  /** Create the single type with defaults on first boot so the entry is editable. */
  async ensureDefaults(): Promise<void> {
    const existing = await strapi.documents(THEME_UID).findFirst();

    if (existing) return;

    await strapi.documents(THEME_UID).create({
      data: {
        enabled: DEFAULT_THEME.enabled,
        primaryColor: DEFAULT_THEME.primaryColor,
        secondaryColor: DEFAULT_THEME.secondaryColor,
        dangerColor: DEFAULT_THEME.dangerColor,
        successColor: DEFAULT_THEME.successColor,
      },
    });

    strapi.log.info('[content-hub-theme] seeded Theme Settings with defaults');
  },
});

export default theme;
