export const StoreCatalogFacetsTypeDefs = `type StoreCatalogFacet{category:String!count:Int!} extend type Query{storeCatalogFacets(tenantId:ID!):[StoreCatalogFacet!]!}`;
