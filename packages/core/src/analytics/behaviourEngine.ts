export interface UserBehavior {
  userId: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BehaviorAnalytics {
  userId: string;
  totalActions: number;
  uniqueActions: string[];
  mostFrequentAction: string;
  averageActionsPerDay: number;
  lastActivity: Date;
}

export class BehaviorEngine {
  private behaviors: Map<string, UserBehavior[]> = new Map();

  trackBehavior(behavior: Omit<UserBehavior, 'timestamp'>): void {
    const fullBehavior: UserBehavior = {
      ...behavior,
      timestamp: new Date(),
    };

    const userBehaviors = this.behaviors.get(behavior.userId) || [];
    userBehaviors.push(fullBehavior);
    this.behaviors.set(behavior.userId, userBehaviors);
  }

  getUserBehaviors(userId: string): UserBehavior[] {
    return this.behaviors.get(userId) || [];
  }

  getBehaviorAnalytics(userId: string): BehaviorAnalytics {
    const behaviors = this.getUserBehaviors(userId);
    
    if (behaviors.length === 0) {
      return {
        userId,
        totalActions: 0,
        uniqueActions: [],
        mostFrequentAction: '',
        averageActionsPerDay: 0,
        lastActivity: new Date(),
      };
    }

    const actionCounts = behaviors.reduce((acc, behavior) => {
      acc[behavior.action] = (acc[behavior.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueActions = Object.keys(actionCounts);
    const mostFrequentAction = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    const daysSinceFirst = Math.max(1, 
      Math.ceil((Date.now() - behaviors[0].timestamp.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      userId,
      totalActions: behaviors.length,
      uniqueActions,
      mostFrequentAction,
      averageActionsPerDay: behaviors.length / daysSinceFirst,
      lastActivity: behaviors[behaviors.length - 1].timestamp,
    };
  }

  getTopActions(limit: number = 10): Array<{ action: string; count: number }> {
    const allBehaviors = Array.from(this.behaviors.values()).flat();
    const actionCounts = allBehaviors.reduce((acc, behavior) => {
      acc[behavior.action] = (acc[behavior.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const behaviorEngine = new BehaviorEngine();
