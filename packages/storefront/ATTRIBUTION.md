# Learnify attribution

The LuxGen storefront UI is **inspired by** [Learnify](https://github.com/alfredang/Learnify) (MIT License).

We do **not** embed Learnify's Prisma, NextAuth, or REST API. Instead:

- **Layout patterns** (hero, stats, category grid, course cards) follow Learnify's public marketing pages
- **Catalog data** comes from LuxGen GraphQL: `courses`, `storefrontProducts`, `storefrontBundles`, `storefrontCollections`, `tenantBySubdomain`
- **Tenant copy & theme** use `@luxgen/storefront` profile resolution (Mongo + presets)

Original project: https://github.com/alfredang/Learnify  
License: MIT
