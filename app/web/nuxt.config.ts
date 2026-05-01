type DeployEnv = "prod" | "stg";

const deployEnv = (process.env.NUXT_DEPLOY_ENV || "prod") as DeployEnv;

const appBaseByEnv: Record<DeployEnv, string> = {
  prod: "/ngramviewer/",
  stg: "/ngramviewer-stg/",
};

const assetsDirByEnv: Record<DeployEnv, string> = {
  prod: "/assets/",
  stg: "/assets/js/",
};

const selectedBaseURL = process.env.NUXT_APP_BASE_URL || appBaseByEnv[deployEnv] || appBaseByEnv.prod;
const selectedAssetsDir = process.env.NUXT_APP_BUILD_ASSETS_DIR || assetsDirByEnv[deployEnv] || assetsDirByEnv.prod;

export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: selectedBaseURL,
    buildAssetsDir: selectedAssetsDir,
    head: {
      link: [
        { rel: "icon", type: "image/x-icon", href: "favicon.ico" },
      ],
    },
  },
  css: ["~/assets/styles/main.scss", "bulma/css/bulma.min.css", "@fortawesome/fontawesome-free/css/all.min.css"],
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
      basePath: process.env.NUXT_PUBLIC_BASE_PATH || selectedBaseURL,
      apiBase: "https://lab.ndl.go.jp/ngramviewer/api/",
    },
  },
});
