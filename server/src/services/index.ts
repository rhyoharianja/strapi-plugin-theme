import type { Core } from '@strapi/strapi';

import theme from './theme';

/** Annotated for the same declaration-portability reason as the controllers index. */
const services: Record<string, (context: { strapi: Core.Strapi }) => unknown> = {
  theme,
};

export default services;
