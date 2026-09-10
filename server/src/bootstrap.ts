import type { Core } from '@strapi/strapi';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Seed the single type so the entry is immediately editable in the Content Manager.
  await strapi.plugin('theme').service('theme').ensureDefaults();
};

export default bootstrap;
