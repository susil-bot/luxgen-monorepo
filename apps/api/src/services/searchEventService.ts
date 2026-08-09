import { SearchEvent, type ISearchEvent } from '@luxgen/db';

export interface SearchEventSummary {
  totalSearches: number;
  avgResultCount: number;
  zeroResultCount: number;
  topQueries: Array<{ query: string; count: number }>;
}

const TOP_QUERIES_LIMIT = 10;
/** Cap the summary aggregation to a recent rolling window so it stays cheap without an index-only count. */
const SUMMARY_WINDOW_DAYS = 30;

export const searchEventService = {
  async log(tenantId: string, query: string, resultCount: number): Promise<ISearchEvent> {
    return SearchEvent.create({ tenantId, query, resultCount });
  },

  async summary(tenantId: string): Promise<SearchEventSummary> {
    const since = new Date(Date.now() - SUMMARY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const events = await SearchEvent.find({ tenantId, createdAt: { $gte: since } })
      .select('query resultCount')
      .lean();

    if (events.length === 0) {
      return { totalSearches: 0, avgResultCount: 0, zeroResultCount: 0, topQueries: [] };
    }

    const totalSearches = events.length;
    const zeroResultCount = events.filter((e) => e.resultCount === 0).length;
    const avgResultCount =
      Math.round((events.reduce((sum, e) => sum + e.resultCount, 0) / totalSearches) * 100) / 100;

    const counts = new Map<string, number>();
    for (const e of events) {
      const key = e.query.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const topQueries = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_QUERIES_LIMIT)
      .map(([query, count]) => ({ query, count }));

    return { totalSearches, avgResultCount, zeroResultCount, topQueries };
  },
};
