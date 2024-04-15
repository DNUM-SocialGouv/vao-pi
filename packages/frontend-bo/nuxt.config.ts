// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "fr",
      },
      title: "VAO - Vacances Adaptées Organisées",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },
  css: [
    "@gouvfr/dsfr/dist/dsfr.min.css",
    "@gouvminint/vue-dsfr/styles",
    "@gouvfr/dsfr/dist/utility/icons/icons.min.css",
    "@/assets/css/main.css",
  ],
  modules: ["nuxt-security", "@pinia/nuxt"],
  runtimeConfig: {
    public: {
      appVersion: undefined,
      backendUrl: undefined,
      environment: undefined,
      sentry: {
        dsn: undefined,
        enabled: undefined,
      },
    },
  },
  security: {
    headers: {
      crossOriginEmbedderPolicy: "unsafe-none",
      contentSecurityPolicy: {
        "img-src": ["'self'", "*.openstreetmap.org", "data:"],
      },
    },
  },
  srcDir: "src",
  ssr: false,
  security: {
    enabled: process.env.NODE_ENV === "production",
  },
});
