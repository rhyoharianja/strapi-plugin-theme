import { getTranslation } from "./utils/getTranslation";
import { PLUGIN_ID } from "./pluginId";
import { Initializer } from "./components/Initializer";
import { PluginIcon } from "./components/PluginIcon";
import {
  applyFavicon,
  applyTheme,
  readCachedTheme,
  writeCachedTheme,
} from "./utils/applyTheme";
import { fetchTheme } from "./utils/fetchTheme";

import type { StrapiApp } from "@strapi/strapi/admin";

const plugin: StrapiApp["appPlugins"][string] = {
  register(app) {
    /*
     * Retheme before the panel renders.
     *
     * Strapi reads `app.configurations.themes` once at render, so the tokens have to be in
     * place during `register` — which is why the last known theme is cached in
     * localStorage. The database stays the source of truth: `bootstrap` reconciles the
     * cache below, and a change made in the Content Manager shows up on the next reload.
     */
    const cached = readCachedTheme();
    applyTheme(app, cached);
    applyFavicon(cached);

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: "Theme",
      },
      Component: () => import("./pages/App"),
      permissions: [],
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async bootstrap() {
    /*
     * Reconcile the cache with the database.
     *
     * The panel has already rendered with the cached colours, so a *changed* palette lands
     * on the next reload rather than repainting mid-session. Repainting would mean reaching
     * into the styled-components provider from outside, and a half-recoloured panel is worse
     * than one that updates on refresh.
     *
     * Worth knowing: on a fresh login this request is **unauthenticated**. Strapi 5 keeps the
     * access token in memory behind an httpOnly refresh cookie, and the React layer only
     * obtains it during render — after `bootstrap` — so `getFetchClient` sends `Bearer null`
     * and every admin route answers 401. The settings page writes the cache itself when it
     * saves, which is what makes the colours stick from then on.
     */
    const theme = await fetchTheme();

    if (theme) {
      writeCachedTheme(theme);
      applyFavicon(theme);
    }
  },

  registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = (await import(
            `./translations/${locale}.json`
          )) as {
            default: Record<string, string>;
          };

          const newData: Record<string, string> = {};
          const keys = Object.keys(data);

          for (const key of keys) {
            newData[getTranslation(key)] = data[key];
          }

          return { data: newData, locale };
        } catch {
          return { data: {}, locale };
        }
      }),
    );
  },
};

export default plugin;
