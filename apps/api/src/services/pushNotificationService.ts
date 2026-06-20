import Expo, { type ExpoPushMessage } from 'expo-server-sdk';
import { User } from '@luxgen/db';

import { logger } from '../utils/logger';

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class PushNotificationService {
  private expo = new Expo();

  async registerToken(userId: string, tenantId: string, token: string): Promise<boolean> {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Invalid Expo push token');
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, tenant: tenantId },
      { $addToSet: { pushTokens: token } },
      { new: true },
    );

    if (!user) {
      throw new Error('User not found');
    }

    return true;
  }

  async removeToken(userId: string, token: string): Promise<void> {
    await User.updateOne({ _id: userId }, { $pull: { pushTokens: token } });
  }

  async sendToUser(userId: string, message: PushMessage): Promise<void> {
    const user = await User.findById(userId).select('pushTokens metadata.preferences.notifications');
    if (!user) return;

    const notificationsEnabled = user.metadata?.preferences?.notifications ?? true;
    if (!notificationsEnabled) return;

    const tokens = user.pushTokens ?? [];
    await this.sendToTokens(tokens, message);
  }

  async sendEnrollmentConfirmation(userId: string, courseTitle: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Enrollment confirmed',
      body: `You are enrolled in ${courseTitle}`,
      data: { type: 'ENROLLMENT' },
    });
  }

  async sendToTokens(tokens: string[], message: PushMessage): Promise<void> {
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));
    if (validTokens.length === 0) return;

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title: message.title,
      body: message.body,
      data: message.data,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        for (const ticket of tickets) {
          if (ticket.status === 'error') {
            logger.warn(`Push ticket error: ${ticket.message}`);
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.warn(`Push send failed: ${msg}`);
      }
    }
  }
}

export const pushNotificationService = new PushNotificationService();
