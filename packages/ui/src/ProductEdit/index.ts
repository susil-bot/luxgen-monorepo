export { ProductEditForm } from './ProductEditForm';
export type { ProductEditFormProps } from './ProductEditForm';
export { ProductEditLayout } from './ProductEditLayout';
export type { ProductEditLayoutProps } from './ProductEditLayout';
export { ProductEditHeader } from './ProductEditHeader';
export type { ProductEditHeaderProps } from './ProductEditHeader';
export { ProductEditSection } from './ProductEditSection';
export type { ProductEditSectionProps } from './ProductEditSection';

export {
  DEFAULT_PRODUCT_EDIT_META,
  parseProductEditRecord,
  serializeProductEditRecord,
  parseProductDescription,
  serializeProductDescription,
  mapCourseToProductEditState,
  buildCourseUpdateInput,
  buildCourseCreateInput,
  statusBadgeClass,
  statusDisplayLabel,
} from './fetcher';
export type { ProductEditMeta, ProductSeo, ProductStatus, ProductEditFormState, CourseProductSource } from './fetcher';

export { productEditFixtures } from './fixture';
export { productEditStyles } from './styles';
export { ProductEditTranslations } from './translations';

export * from './sections/TitleDescriptionSection';
export * from './sections/MediaSection';
export * from './sections/CategorySection';
export * from './sections/PricingSection';
export * from './sections/InventorySection';
export * from './sections/DeliverySection';
export * from './sections/VariantsSection';
export * from './sections/MetafieldsSection';
export * from './sections/SearchListingSection';

export * from './sidebar/StatusSection';
export * from './sidebar/PublishingSection';
export * from './sidebar/SalesSection';
export * from './sidebar/OrganizationSection';
export * from './sidebar/ThemeTemplateSection';
