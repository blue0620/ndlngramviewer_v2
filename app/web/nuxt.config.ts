export default defineNuxtConfig({
  compatibilityDate: "2026-04-01",
  devtools: { enabled: false },
  app: {
    baseURL: "/ngramviewer/",
    head: {
      title: "NDL Ngram Viewer",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" }
      ],
      link: [
        { rel: "shortcut icon", href: "/ngramviewer/favicon.ico" },
        {
          rel: "stylesheet",
          href: "//cdn.materialdesignicons.com/4.0.96/css/materialdesignicons.min.css"
        }
      ],
      script: [
        { src: "https://www.promisejs.org/polyfills/promise-6.1.0.min.js" }
      ]
    }
  },
  nitro: {
    prerender: {
      routes: ["/"]
    }
  },
  typescript: {
    strict: true,
    typeCheck: false
  }
});
