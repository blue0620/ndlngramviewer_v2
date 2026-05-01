export default defineNuxtConfig({
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/ngramviewer/",
    head: {
      link: [
        { rel: "icon", type: "image/x-icon", href: "favicon.ico" },
      ],
    },
  },
  css: ["~/assets/styles/main.scss",'bulma/css/bulma.min.css','@fortawesome/fontawesome-free/css/all.min.css'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          includePaths: ["./assets/styles", "./node_modules"],
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      basePath: process.env.NUXT_PUBLIC_BASE_PATH || process.env.NUXT_APP_BASE_URL || "/ngramviewer/",
      apiBase: "https://lab.ndl.go.jp/ngramviewer/api/",
    },
  },
});
