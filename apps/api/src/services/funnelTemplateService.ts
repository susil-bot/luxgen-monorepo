import { FunnelTemplate, type IFunnelTemplate } from '@luxgen/db';
import { tenantService } from './tenantService';
import { marketplaceService } from './marketplaceService';
import { logger } from '../utils/logger';

/**
 * T-VERT-06 — digital-products is the only seed shipped in this pass; T-VERT-07/08 append the
 * agency-consulting and membership entries in follow-up commits. Kept as one array (not one
 * per-vertical file) so ensureCatalogSeeded() stays a single, simple idempotent seed check.
 */
const CATALOG_SEED: Array<
  Pick<
    IFunnelTemplate,
    'slug' | 'name' | 'description' | 'industry' | 'vocabularyPreset' | 'enabledModules' | 'automationTemplateSlugs' | 'funnelStages'
  >
> = [
  {
    slug: 'digital-products',
    name: 'Digital products / info-products',
    description:
      'One-time downloads, licenses, and templates — instant delivery, no cohort or completion tracking.',
    industry: ['digital-products'],
    vocabularyPreset: { course: 'Product', enrollment: 'Purchase', student: 'Customer' },
    enabledModules: [],
    // Reuses the existing automation Marketplace — no new compound/bridge code needed
    // (docs/PLATFORM_VERTICALIZATION_STRATEGY.md §4a).
    automationTemplateSlugs: ['welcome-sequence'],
    funnelStages: [
      { stage: 'Storefront listing', description: 'Existing /products view over Course (courseToProductRow).' },
      { stage: 'Checkout', description: 'Existing order/enrollment flow.' },
      { stage: 'Instant delivery', description: 'Existing course-content access on enrollment.' },
      { stage: 'Post-purchase follow-up', description: 'Existing SEND_EMAIL automation action.' },
    ],
  },
  {
    // T-VERT-07 — recurring client status reports (core.report.send_client_summary) are
    // already scoped as net-new engineering in docs/AUTOMATION_HUB_STRATEGY.md §3's "Agencies
    // reselling white-label" row. Deliberately NOT invented here — this seed sticks to
    // automation templates that exist today, per docs/PLATFORM_VERTICALIZATION_STRATEGY.md §4b.
    slug: 'agency-consulting',
    name: 'Agency & consulting services',
    description: 'Client onboarding, engagement milestones, and lead capture — no cohort content library needed.',
    industry: ['agency', 'consulting'],
    vocabularyPreset: { course: 'Engagement', student: 'Client', instructor: 'Consultant', enrollment: 'Engagement start' },
    enabledModules: [],
    automationTemplateSlugs: ['crm-webhook-enroll', 'welcome-sequence'],
    funnelStages: [
      { stage: 'Lead capture', description: 'Existing core.webhook.received trigger.' },
      { stage: 'Client onboarding checklist', description: 'Existing welcome-sequence template (SEND_EMAIL + ADD_TO_GROUP).' },
      { stage: 'CRM sync', description: 'Existing crm-webhook-enroll template pushes enrollment events to HubSpot/Salesforce.' },
      { stage: 'Deliverables tracking', description: 'Course modules, relabeled "Engagement milestones" via vocabulary preset.' },
      { stage: 'Recurring client status reports', description: 'Deferred — needs a new core.report.send_client_summary action, not shipped in this pass.' },
    ],
  },
];

export class FunnelTemplateService {
  async ensureCatalogSeeded(): Promise<void> {
    const count = await FunnelTemplate.countDocuments();
    if (count > 0) return;
    for (const item of CATALOG_SEED) {
      await FunnelTemplate.create({ ...item, installCount: 0 });
    }
    logger.info(`Seeded ${CATALOG_SEED.length} funnel templates`);
  }

  async listTemplates(options: { industry?: string } = {}) {
    await this.ensureCatalogSeeded();
    const filter: Record<string, unknown> = {};
    if (options.industry) filter.industry = options.industry;
    return FunnelTemplate.find(filter).sort({ installCount: -1 });
  }

  async getTemplateBySlug(slug: string) {
    await this.ensureCatalogSeeded();
    return FunnelTemplate.findOne({ slug });
  }

  /**
   * Applies vocabulary + feature flags + installs each referenced automation template.
   * Idempotent: re-running just re-applies the same vocabulary/flags and re-installs
   * automations (installTemplate always creates a fresh draft Automation, same as installing
   * any Marketplace template twice today — it does not deduplicate, matching existing behavior).
   */
  async installFunnelTemplate(tenantId: string, slug: string) {
    const template = await this.getTemplateBySlug(slug);
    if (!template) throw new Error(`Funnel template not found: ${slug}`);

    await tenantService.updateVocabulary(tenantId, template.vocabularyPreset);
    await tenantService.updateFeatureFlags(tenantId, template.enabledModules);

    for (const automationSlug of template.automationTemplateSlugs) {
      await marketplaceService.installTemplate(tenantId, automationSlug);
    }

    await FunnelTemplate.updateOne({ slug }, { $inc: { installCount: 1 } });
    return this.toGraphQL(template);
  }

  toGraphQL(template: IFunnelTemplate) {
    return {
      id: String(template._id),
      slug: template.slug,
      name: template.name,
      description: template.description,
      industry: template.industry,
      vocabularyPreset: template.vocabularyPreset,
      enabledModules: template.enabledModules,
      automationTemplateSlugs: template.automationTemplateSlugs,
      funnelStages: template.funnelStages,
      installCount: template.installCount,
    };
  }
}

export const funnelTemplateService = new FunnelTemplateService();
