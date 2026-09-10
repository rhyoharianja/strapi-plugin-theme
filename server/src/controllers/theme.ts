import type { Core } from '@strapi/strapi';

import type { ThemeSettings } from '../../../shared/theme';

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const COLOUR_FIELDS = ['primaryColor', 'secondaryColor', 'dangerColor', 'successColor'] as const;

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  /** The current palette, consumed by the admin panel on every load. */
  async find(ctx): Promise<void> {
    const settings: ThemeSettings = await strapi
      .plugin('theme')
      .service('theme')
      .find();

    ctx.body = { data: settings };
  },

  /**
   * Save the palette. Takes effect on the next admin reload — see the plugin README.
   *
   * The hex pattern is also on the schema, so this is the second of two checks rather than
   * the only one. It is here because the schema's answer is a validation error thrown deep
   * in the document service, and a route that names the offending field is easier to use.
   */
  async update(ctx): Promise<void> {
    const body = (ctx.request.body ?? {}) as Record<string, unknown>;

    for (const key of COLOUR_FIELDS) {
      const value = body[key];

      if (value !== undefined && (typeof value !== 'string' || !HEX.test(value))) {
        return ctx.badRequest(`${key} must be a hex colour like #4945ff`);
      }
    }

    if (body.enabled !== undefined && typeof body.enabled !== 'boolean') {
      return ctx.badRequest('enabled must be a boolean');
    }

    ctx.body = {
      data: await strapi.plugin('theme').service('theme').update(body),
    };
  },
});

export default controller;
