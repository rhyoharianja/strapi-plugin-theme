import type { Core } from '@strapi/strapi';

import theme from './theme';

/**
 * Explicitly annotated: without it TypeScript infers a type that names `@strapi/types`
 * through a pnpm-internal path, which is not portable in a published declaration file.
 */
const controllers: Record<string, (context: { strapi: Core.Strapi }) => unknown> = {
  theme,
};

export default controllers;
