import type { ProductEditMeta, ProductSeo, ProductStatus } from './fetcher';
import { statusBadgeClass, statusDisplayLabel } from './fetcher';
import { EntityFormPageLayout } from '../SplitPageLayout/EntityFormPageLayout';
import { SplitPageHeader } from '../SplitPageLayout/SplitPageHeader';
import { ProductEditTranslations } from './translations';
import { TitleDescriptionSection } from './sections/TitleDescriptionSection';
import { MediaSection } from './sections/MediaSection';
import { CategorySection } from './sections/CategorySection';
import { PricingSection } from './sections/PricingSection';
import { InventorySection } from './sections/InventorySection';
import { DeliverySection } from './sections/DeliverySection';
import { VariantsSection } from './sections/VariantsSection';
import { MetafieldsSection } from './sections/MetafieldsSection';
import { SearchListingSection } from './sections/SearchListingSection';
import { ProductTimelineSection } from './sections/TimelineSection';
import type { TimelineActivityProps } from '../Timeline';
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
  backHref?: string;
  saveLabel?: string;
  savingLabel?: string;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onSeoChange: (patch: Partial<ProductSeo>) => void;
  onMetaChange: (patch: Partial<ProductEditMeta>) => void;
  onStatusChange: (s: ProductStatus) => void;
  onSave: () => void;
  timeline?: TimelineActivityProps;
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
  backHref,
  saveLabel,
  savingLabel,
  onTitleChange,
  onBodyChange,
  onSeoChange,
  onMetaChange,
  onStatusChange,
  onSave,
  timeline,
}: ProductEditFormProps) {
  return (
    <EntityFormPageLayout
      header={
        <SplitPageHeader
          backHref={backHref ?? '/products'}
          backLabel={ProductEditTranslations.en.backToProducts}
          title={title || ProductEditTranslations.en.untitledProduct}
          badges={
            <span className={`badge ${statusBadgeClass(status)} flex-shrink-0`}>{statusDisplayLabel(status)}</span>
          }
          actions={
            <>
              <button type="button" className="ios-btn-secondary text-sm" disabled>
                {ProductEditTranslations.en.moreActions}
              </button>
              <button type="button" className="ios-btn-primary text-sm" disabled={saving} onClick={onSave}>
                {saving
                  ? (savingLabel ?? ProductEditTranslations.en.saving)
                  : (saveLabel ?? ProductEditTranslations.en.save)}
              </button>
            </>
          }
        />
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
          <SearchListingSection seo={seo} productTitle={title} tenant={tenant} onSeoChange={onSeoChange} />
          {timeline && (
            <ProductTimelineSection
              events={timeline.events}
              allowComments={timeline.allowComments}
              commentDraft={timeline.commentDraft}
              onCommentDraftChange={timeline.onCommentDraftChange}
              onPostComment={timeline.onPostComment}
              posting={timeline.posting}
              staffInitials={timeline.staffInitials}
            />
          )}
        </>
      }
      aside={
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
