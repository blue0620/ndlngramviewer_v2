# Legacy router mapping (`src/router.vue`)

| Legacy path | Route name | Display component | Notes |
|---|---|---|---|
| `/` | `top` | `src/main.vue` | Main search UI |
| `*` | - | redirect to `top` | Any unknown route redirects to `/` |

## Nuxt migration mapping

| Nuxt page file | URL | Purpose |
|---|---|---|
| `pages/index.vue` | `/` | Main search UI migrated from `src/main.vue` |
| `pages/[...slug].vue` | `/*` | Catch-all compatibility page to keep old URLs reachable |

