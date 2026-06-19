import type { ProductStatus } from '../../../lib/product-display';
import type { ProductEditMeta, ProductSeo } from '../../../lib/product-edit-meta';
import { ProductEditLayout } from './ProductEditLayout';
import { ProductEditHeader } from './ProductEditHeader';
import { TitleDescriptionSection } from './sections/TitleDescriptionSection';
import { MediaSection } from './sections/MediaSection';
import { CategorySection } from './sections/CategorySection';
import { PricingSection } from './sections/PricingSection';
import { InventorySection } from './sections/InventorySection';
import { DeliverySection } from './sections/DeliverySection';
import { VariantsSection } from './sections/VariantsSection';
import { MetafieldsSection } from './sections/MetafieldsSection';
import { SearchListingSection } from './sections/SearchListingSection';
import { StatusSection } from './sidebar/StatusSection';
import { PublishingSection } from './sidebar/PublishingSection';
import { SalesSection } from './sidebar/SalesSection';
import { OrganizationSection } from './sidebar/OrganizationSection';
import { ThemeTemplateSection } from './sidebar/ThemeTemplateSection';

export interface ProductEditFormProps {
  tenant: string;
  title: string;
  bodyHtml: string;
  seo: ProductSeo;
  meta: ProductEditMeta;
  status: ProductStatus;
  enrollmentCount: number;
  saving?: boolean;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onSeoChange: (patch: Partial<ProductSeo>) => void;
  onMetaChange: (patch: Partial<ProductEditMeta>) => void;
  onStatusChange: (s: ProductStatus) => void;
  onSave: () => void;
}

export function ProductEditForm({
  tenant,
  title,
  bodyHtml,
  seo,
  meta,
  status,
  enrollmentCount,
  saving,
  onTitleChange,
  onBodyChange,
  onSeoChange,
  onMetaChange,
  onStatusChange,
  onSave,
}: ProductEditFormProps) {
  return (
    <ProductEditLayout
      header={
        <ProductEditHeader title={title} status={status} saving={saving} onSave={onSave} />
      }
      main={
        <>
          <TitleDescriptionSection
            title={title}
            bodyHtml={bodyHtml}
            onTitleChange={onTitleChange}
            onBodyChange={onBodyChange}
          />
          <MediaSection />
          <CategorySection category={meta.category} onCategoryChange={(c) => onMetaChange({ category: c })} />
          <PricingSection meta={meta} onMetaChange={onMetaChange} />
          <InventorySection meta={meta} enrolled={enrollmentCount} onMetaChange={onMetaChange} />
          <DeliverySection />
          <VariantsSection />
          <MetafieldsSection />
          <SearchListingSection
            seo={seo}
            productTitle={title}
            tenant={tenant}
            onSeoChange={onSeoChange}
          />
        </>
      }
      sidebar={
        <>
          <StatusSection status={status} onStatusChange={onStatusChange} />
          <PublishingSection />
          <SalesSection enrollmentCount={enrollmentCount} />
          <OrganizationSection meta={meta} onMetaChange={onMetaChange} />
          <ThemeTemplateSection meta={meta} onMetaChange={onMetaChange} />
        </>
      }
    />
  );
}
