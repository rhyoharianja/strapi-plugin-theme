export default () => ({
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/settings',
      handler: 'theme.find',
      config: {
        // Every authenticated admin user needs the tokens to render the panel, so this
        // route is not gated behind a specific permission.
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/settings',
      handler: 'theme.update',
      config: { policies: [] },
    },
  ],
});
