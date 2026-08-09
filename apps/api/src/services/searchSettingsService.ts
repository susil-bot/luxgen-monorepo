import { SearchSettings } from '@luxgen/db';

const DEFAULTS = { resultsPerPage: 20, trackSearchHistory: true };

export const searchSettingsService = {
  async get(tenantId: string): Promise<{ resultsPerPage: number; trackSearchHistory: boolean }> {
    const doc = await SearchSettings.findOne({ tenantId });
    if (!doc) return { ...DEFAULTS };
    return { resultsPerPage: doc.resultsPerPage, trackSearchHistory: doc.trackSearchHistory };
  },

  async update(
    tenantId: string,
    input: { resultsPerPage: number; trackSearchHistory: boolean },
  ): Promise<{ resultsPerPage: number; trackSearchHistory: boolean }> {
    const doc = await SearchSettings.findOneAndUpdate(
      { tenantId },
      { $set: { resultsPerPage: input.resultsPerPage, trackSearchHistory: input.trackSearchHistory } },
      { new: true, upsert: true },
    );
    return { resultsPerPage: doc.resultsPerPage, trackSearchHistory: doc.trackSearchHistory };
  },
};
