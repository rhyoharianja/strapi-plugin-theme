export default () => ({
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/settings',
      handler: 'theme.find',
      config: {
        // Public read so front-end apps can reuse the same design tokens.
        auth: false,
        policies: [],
      },
    },
  ],
});
