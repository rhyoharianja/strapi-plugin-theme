import type { Core } from "@strapi/strapi";

/**
 * Application methods
 */
import bootstrap from "./bootstrap";
import destroy from "./destroy";
import register from "./register";

/**
 * Plugin server methods
 */
import config from "./config";
import contentTypes from "./content-types";
import controllers from "./controllers";
import middlewares from "./middlewares";
import policies from "./policies";
import routes from "./routes";
import services from "./services";

type Lifecycle = (context: { strapi: Core.Strapi }) => void | Promise<void>;
type Factory = (context: { strapi: Core.Strapi }) => unknown;

/**
 * Structural shape of this plugin's server half.
 *
 * Declared locally and referencing only `@strapi/strapi` (a real dependency) so the
 * emitted declaration stays portable. Inferring it instead makes TypeScript name
 * `@strapi/types` through a pnpm-internal path, which breaks consumers (TS2742).
 */
interface ThemeServerPlugin {
  register: Lifecycle;
  bootstrap: Lifecycle;
  destroy: Lifecycle;
  config: { default: Record<string, unknown>; validator: (config?: unknown) => void };
  controllers: Record<string, Factory>;
  routes: Record<string, unknown>;
  services: Record<string, Factory>;
  contentTypes: Record<string, { schema: Record<string, unknown> }>;
  policies: Record<string, unknown>;
  middlewares: Record<string, unknown>;
}

const plugin: ThemeServerPlugin = {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  contentTypes,
  policies,
  middlewares,
};

export default plugin;
