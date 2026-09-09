import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    /*
     * `shared/theme.ts` is the whole of this plugin's logic: validating colours and deriving
     * the ramps from them. It imports neither React nor Strapi, so the suite needs no
     * browser and no running application.
     */
    include: ['shared/**/*.test.ts'],
    environment: 'node',
  },
});
