import { Schema, model, Document } from 'mongoose';
import type { TenantVocabulary } from './tenant';

/**
 * T-VERT-06 — a Funnel Template is data, not code: a bundle of a vocabulary preset, feature
 * flags to enable, and existing AutomationTemplate slugs to install. Installing one is three
 * already-existing operations run in sequence (tenantService.updateVocabulary,
 * tenantService.updateFeatureFlags, marketplaceService.installTemplate × N) — no new execution
 * engine. Same "templates configure the core, never extend it" rule this repo already runs its
 * automation Marketplace on. See docs/PLATFORM_VERTICALIZATION_STRATEGY.md §4.
 */
export interface IFunnelStage {
  stage: string;
  description: string;
}

export interface IFunnelTemplate extends Document {
  slug: string;
  name: string;
  description: string;
  industry: string[];
  vocabularyPreset: Partial<TenantVocabulary>;
  enabledModules: string[];
  automationTemplateSlugs: string[];
  funnelStages: IFunnelStage[];
  installCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const funnelStageSchema = new Schema<IFunnelStage>(
  {
    stage: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const funnelTemplateSchema = new Schema<IFunnelTemplate>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: [String], default: [] },
    vocabularyPreset: { type: Schema.Types.Mixed, default: {} },
    enabledModules: { type: [String], default: [] },
    automationTemplateSlugs: { type: [String], default: [] },
    funnelStages: { type: [funnelStageSchema], default: [] },
    installCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

funnelTemplateSchema.index({ industry: 1 });

export const FunnelTemplate = model<IFunnelTemplate>('FunnelTemplate', funnelTemplateSchema);
