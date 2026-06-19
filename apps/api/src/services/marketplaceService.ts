import { AutomationTemplate, type IAutomationTemplate, type TemplateCategory } from '@luxgen/db';
import { automationService } from './automationService';
import { usageService } from './usageService';
import { logger } from '../utils/logger';

const CATALOG_SEED = [
  {
    slug: 'welcome-sequence',
    name: 'Welcome sequence',
    description: 'Onboard new learners with email + group assignment when they enroll.',
    category: 'onboarding',
    priceCents: 0,
    featured: true,
    triggerType: 'USER_ENROLLED',
    triggerLabel: 'User Enrolled',
    actions: [
      { type: 'SEND_EMAIL', label: 'Send welcome email', config: { templateId: 'welcome' } },
      { type: 'ADD_TO_GROUP', label: 'Add to onboarding group' },
    ],
    tags: ['onboarding', 'email', 'free'],
  },
  {
    slug: 'completion-cert-slack',
    name: 'Completion certificate + Slack',
    description: 'Issue certificate, notify team on Slack, and send congrats email on course completion.',
    category: 'completion',
    priceCents: 1900,
    featured: true,
    triggerType: 'COURSE_COMPLETED',
    triggerLabel: 'Course Completed',
    actions: [
      { type: 'ISSUE_CERTIFICATE', label: 'Issue Certificate' },
      { type: 'NOTIFY_SLACK', label: 'Notify Slack', config: { channel: '#wins' } },
      { type: 'SEND_EMAIL', label: 'Send congrats email' },
    ],
    tags: ['completion', 'certificate', 'slack'],
  },
  {
    slug: 'power-learner-upsell',
    name: 'Power learner upsell',
    description: 'Tag high performers and enroll them in an advanced course after certificate issued.',
    category: 'retention',
    priceCents: 2900,
    featured: true,
    triggerType: 'CERTIFICATE_ISSUED',
    triggerLabel: 'Certificate Issued',
    actions: [
      { type: 'TAG_USER', label: 'Tag as power learner', config: { tag: 'power-learner' } },
      { type: 'ENROLL_IN_COURSE', label: 'Enroll in advanced course' },
    ],
    tags: ['retention', 'upsell'],
  },
  {
    slug: 'weekly-digest',
    name: 'Weekly progress digest',
    description: 'Scheduled email summarizing learner progress every Monday.',
    category: 'engagement',
    priceCents: 0,
    featured: false,
    triggerType: 'SCHEDULE',
    triggerLabel: 'Scheduled',
    actions: [{ type: 'SEND_EMAIL', label: 'Send weekly digest', config: { cron: '0 8 * * 1' } }],
    tags: ['engagement', 'email', 'free'],
  },
  {
    slug: 'crm-webhook-enroll',
    name: 'CRM webhook on enroll',
    description: 'Push enrollment events to HubSpot/Salesforce via webhook.',
    category: 'integrations',
    priceCents: 4900,
    featured: false,
    triggerType: 'USER_ENROLLED',
    triggerLabel: 'User Enrolled',
    actions: [
      {
        type: 'CALL_WEBHOOK',
        label: 'Call CRM webhook',
        config: { url: 'https://hooks.example.com/enrollment', method: 'POST' },
      },
    ],
    tags: ['integrations', 'webhook', 'crm'],
  },
  {
    slug: 'agent-merge-notify',
    name: 'Agent merge notifier',
    description: 'Notify engineering when Agent Studio merges code to main.',
    category: 'agent_ops',
    priceCents: 0,
    featured: false,
    triggerType: 'CODE_CHANGE_MERGED',
    triggerLabel: 'Code Change Merged',
    actions: [
      { type: 'NOTIFY_SLACK', label: 'Notify Slack', config: { channel: '#engineering' } },
      {
        type: 'RUN_AGENT_TASK',
        label: 'Summarize changes',
        config: { prompt: 'Summarize the merged agent changes for the team changelog.' },
      },
    ],
    tags: ['agent', 'enterprise'],
  },
];

export class MarketplaceService {
  async ensureCatalogSeeded(): Promise<void> {
    const count = await AutomationTemplate.countDocuments();
    if (count > 0) return;

    for (const item of CATALOG_SEED) {
      await AutomationTemplate.create({ ...item, installCount: Math.floor(Math.random() * 120) + 5 });
    }
    logger.info(`Seeded ${CATALOG_SEED.length} automation marketplace templates`);
  }

  async listTemplates(options: { category?: TemplateCategory; featured?: boolean } = {}) {
    await this.ensureCatalogSeeded();
    const filter: Record<string, unknown> = {};
    if (options.category) filter.category = options.category;
    if (options.featured !== undefined) filter.featured = options.featured;
    return AutomationTemplate.find(filter).sort({ featured: -1, installCount: -1 });
  }

  async getTemplateBySlug(slug: string) {
    await this.ensureCatalogSeeded();
    return AutomationTemplate.findOne({ slug });
  }

  async installTemplate(tenantId: string, slug: string, nameOverride?: string) {
    await usageService.assertAutomationCreateAllowed(tenantId);

    const template = await this.getTemplateBySlug(slug);
    if (!template) throw new Error(`Template not found: ${slug}`);

    const automation = await automationService.createAutomation({
      tenantId,
      name: nameOverride || template.name,
      triggerType: template.triggerType,
      triggerLabel: template.triggerLabel,
      actions: template.actions.map((a) => ({
        type: a.type,
        label: a.label,
        config: a.config,
      })),
      enabled: false,
    });

    await AutomationTemplate.updateOne({ slug }, { $inc: { installCount: 1 } });

    return automationService.toGraphQL(automation);
  }

  toGraphQL(template: IAutomationTemplate) {
    return {
      id: String(template._id),
      slug: template.slug,
      name: template.name,
      description: template.description,
      category: template.category.toUpperCase(),
      priceCents: template.priceCents,
      priceLabel: template.priceCents === 0 ? 'Free' : `$${(template.priceCents / 100).toFixed(0)}`,
      featured: template.featured,
      triggerType: template.triggerType,
      triggerLabel: template.triggerLabel,
      actions: template.actions.map((a) => ({
        type: a.type,
        label: a.label,
        config: a.config ?? null,
      })),
      installCount: template.installCount,
      tags: template.tags,
    };
  }
}

export const marketplaceService = new MarketplaceService();
