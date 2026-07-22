import type { TimelineEvent } from './fetcher';

export const timelineFixtures: TimelineEvent[] = [
  {
    id: '1',
    message: 'You added a note to this customer.',
    createdAt: new Date().toISOString(),
    kind: 'STAFF_COMMENT',
    actorType: 'STAFF',
    actorName: 'Staff',
  },
  {
    id: '2',
    message: 'Order #1038 confirmation email sent.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    kind: 'SYSTEM',
    actorType: 'APP',
    actorName: 'LuxGen',
  },
];
