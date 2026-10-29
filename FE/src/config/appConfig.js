/**
 * Centralized Application & Environment Configuration.
 * Decouples runtime environment variables from individual consumers.
 */

const rawTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS);

export const appConfig = Object.freeze({
  api: Object.freeze({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:51283/api",
    timeoutMs: Number.isFinite(rawTimeout) && rawTimeout > 0 ? rawTimeout : 15000,
  }),
  app: Object.freeze({
    name: import.meta.env.VITE_APP_NAME || "G1 SelfStorage",
    mode: import.meta.env.MODE || "development",
    isProduction: import.meta.env.PROD || false,
    isDevelopment: import.meta.env.DEV || true,
    currency: import.meta.env.VITE_DEFAULT_CURRENCY || "VND",
  }),
});

export default appConfig;
