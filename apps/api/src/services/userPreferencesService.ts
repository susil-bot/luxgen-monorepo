import { User } from '@luxgen/db';
const D = { theme: 'system', notifications: true, language: 'en' };
export const userPreferencesService = {
  async get(id: string) {
    const u = await User.findById(id);
    return { ...D, ...(u?.metadata as { preferences?: typeof D })?.preferences };
  },
  async update(id: string, i: Partial<typeof D>) {
    const n = { ...(await this.get(id)), ...i };
    await User.findByIdAndUpdate(id, { $set: { 'metadata.preferences': n } });
    return n;
  },
};
