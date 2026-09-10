/**
 * Theme Settings — a single type owned by this plugin.
 *
 * Holds the admin palette: four brand colours, the two brand images and an on/off switch.
 * `draftAndPublish` is off so a save takes effect immediately.
 */
export default {
  kind: 'singleType',
  collectionName: 'theme_settings',
  info: {
    singularName: 'theme-settings',
    pluralName: 'theme-settings-list',
    displayName: 'Theme Settings',
    description: 'Design tokens applied to the admin panel at runtime',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    /*
     * Hidden from the Content Manager on purpose.
     *
     * The Content Manager is where people edit *content*; this is platform configuration
     * (or a log) that belongs to this plugin's own admin section. Leaving it in the
     * collection-type list buries Article and Page among a dozen internal tables.
     */
    'content-manager': { visible: false },
    'content-type-builder': { visible: false },
  },
  attributes: {
    primaryColor: {
      type: 'string',
      default: '#4945ff',
      regex: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
      required: true,
    },
    secondaryColor: {
      type: 'string',
      default: '#7b79ff',
      regex: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
      required: true,
    },
    dangerColor: {
      type: 'string',
      default: '#d02b20',
      regex: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
      required: true,
    },
    successColor: {
      type: 'string',
      default: '#328048',
      regex: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
      required: true,
    },
    /** Used for the navigation and the login screen. */
    logo: { type: 'media', multiple: false, allowedTypes: ['images'] },
    favicon: { type: 'media', multiple: false, allowedTypes: ['images'] },
    /** Off reverts to Strapi's palette without discarding the colours above. */
    enabled: { type: 'boolean', default: true },
  },
};
