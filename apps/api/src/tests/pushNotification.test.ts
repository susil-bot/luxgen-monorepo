import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('expo-server-sdk', () => {
  const Expo = jest.fn().mockImplementation(() => ({
    chunkPushNotifications: (messages: unknown[]) => [messages],
    sendPushNotificationsAsync: jest.fn().mockResolvedValue([{ status: 'ok' }]),
  }));
  (Expo as unknown as { isExpoPushToken: (token: string) => boolean }).isExpoPushToken = (token: string) =>
    token.startsWith('ExponentPushToken[');
  return { __esModule: true, default: Expo };
});

jest.mock('@luxgen/db', () => ({
  User: {
    findOneAndUpdate: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.mock('../utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { User } from '@luxgen/db';
import { PushNotificationService } from '../services/pushNotificationService';

describe('PushNotificationService', () => {
  let service: PushNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PushNotificationService();
  });

  describe('registerToken', () => {
    it('rejects invalid Expo push tokens', async () => {
      await expect(service.registerToken('user1', 'tenant1', 'not-a-token')).rejects.toThrow('Invalid Expo push token');
    });

    it('adds token to user document', async () => {
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: 'user1' });

      const result = await service.registerToken('user1', 'tenant1', 'ExponentPushToken[abc123]');

      expect(result).toBe(true);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'user1', tenant: 'tenant1' },
        { $addToSet: { pushTokens: 'ExponentPushToken[abc123]' } },
        { new: true },
      );
    });

    it('throws when user is not found', async () => {
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(service.registerToken('user1', 'tenant1', 'ExponentPushToken[abc123]')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('sendToUser', () => {
    it('skips when notifications preference is disabled', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          pushTokens: ['ExponentPushToken[abc123]'],
          metadata: { preferences: { notifications: false } },
        }),
      });

      const sendSpy = jest.spyOn(service, 'sendToTokens').mockResolvedValue(undefined);
      await service.sendToUser('user1', { title: 'Hi', body: 'Test' });

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('sends when user has valid tokens and notifications enabled', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          pushTokens: ['ExponentPushToken[abc123]'],
          metadata: { preferences: { notifications: true } },
        }),
      });

      const sendSpy = jest.spyOn(service, 'sendToTokens').mockResolvedValue(undefined);
      await service.sendEnrollmentConfirmation('user1', 'Intro to AI');

      expect(sendSpy).toHaveBeenCalledWith(['ExponentPushToken[abc123]'], {
        title: 'Enrollment confirmed',
        body: 'You are enrolled in Intro to AI',
        data: { type: 'ENROLLMENT' },
      });
    });
  });
});
