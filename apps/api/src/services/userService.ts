import { User, IUser, Enrollment } from '@luxgen/db';
import { verifyPassword } from '@luxgen/auth';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { isAccountActive, ACCOUNT_DEACTIVATED_MESSAGE } from '../utils/accountStatus';
import { checkLoginRateLimit } from '../middleware/loginRateLimit';
import type { Request } from 'express';
import { UserRegistrationService, UserRegistrationData } from './userRegistrationService';

export interface LoginInput {
  email: string;
  password: string;
  tenantId?: string;
  req?: Request;
}

export interface AuthResult {
  token: string;
  user: IUser;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string;
  marketingEmail?: boolean;
  marketingSms?: boolean;
  marketingWhatsapp?: boolean;
}

export class UserService {
  async getUserById(id: string, tenantId?: string): Promise<IUser | null> {
    const filter: { _id: string; tenant?: string } = { _id: id };
    if (tenantId) filter.tenant = tenantId;
    return User.findOne(filter).populate('tenant');
  }

  async getUsersByTenant(tenantId: string): Promise<IUser[]> {
    return User.find({ tenant: tenantId }).populate('tenant');
  }

  async createUser(input: UserRegistrationData): Promise<IUser> {
    const result = await UserRegistrationService.registerUser(input);
    if (!result.success || !result.user) {
      throw new Error(result.message);
    }
    return result.user;
  }

  async updateUser(id: string, tenantId: string, input: UpdateUserInput): Promise<IUser> {
    const user = await User.findOneAndUpdate({ _id: id, tenant: tenantId }, input, { new: true }).populate('tenant');
    if (!user) throw new Error('User not found');
    return user;
  }

  async getCustomersByTenant(tenantId: string, search?: string): Promise<IUser[]> {
    const query: Record<string, unknown> = {
      tenant: tenantId,
      role: { $in: ['STUDENT', 'USER'] },
    };
    if (search?.trim()) {
      const pattern = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ email: pattern }, { firstName: pattern }, { lastName: pattern }];
    }
    return User.find(query).populate('tenant').sort({ createdAt: -1 });
  }

  async deleteUser(id: string, tenantId: string): Promise<boolean> {
    const user = await User.findOne({ _id: id, tenant: tenantId });
    if (!user) throw new Error('User not found');

    const activeOrders = await Enrollment.countDocuments({
      tenant: tenantId,
      student: id,
      cancelledAt: null,
    });
    if (activeOrders > 0) {
      throw new Error(`Cannot delete customer with ${activeOrders} active order(s). Cancel or complete orders first.`);
    }

    const result = await User.findOneAndDelete({ _id: id, tenant: tenantId });
    return !!result;
  }

  async registerPushToken(userId: string, tenantId: string, token: string): Promise<boolean> {
    const { pushNotificationService } = await import('./pushNotificationService');
    return pushNotificationService.registerToken(userId, tenantId, token);
  }

  async login({ email, password, tenantId: inputTenantId, req }: LoginInput): Promise<AuthResult> {
    if (req) {
      await checkLoginRateLimit(req, email);
    }

    const query: Record<string, unknown> = { email: email.toLowerCase().trim() };
    if (inputTenantId) query.tenant = inputTenantId;

    const user = await User.findOne(query).populate('tenant');
    if (!user) throw new Error('Invalid email or password');

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw new Error('Invalid email or password');

    if (!isAccountActive(user)) {
      throw new Error(ACCOUNT_DEACTIVATED_MESSAGE);
    }

    const tenantId = (user.tenant as any)?._id?.toString();
    if (!tenantId) throw new Error('User has no associated tenant');

    const token = generateToken(
      { id: (user as any)._id.toString(), email: user.email, tenant: tenantId, role: user.role },
      tenantId,
    );

    logger.info(`User login: ${user.email}`);
    return { token, user };
  }

  async register(
    input: UserRegistrationData,
    options?: { selfService?: boolean; tenantId?: string },
  ): Promise<AuthResult> {
    const registration: UserRegistrationData = { ...input };

    if (options?.selfService) {
      registration.role = 'STUDENT' as UserRegistrationData['role'];
      if (options.tenantId) {
        registration.tenantId = options.tenantId;
      }
    }

    const user = await this.createUser(registration);

    const tenantId = (user.tenant as any)?._id?.toString();
    if (!tenantId) throw new Error('User has no associated tenant');

    const token = generateToken(
      { id: (user as any)._id.toString(), email: user.email, tenant: tenantId, role: user.role },
      tenantId,
    );

    logger.info(`User registered: ${user.email}`);
    return { token, user };
  }
}

export const userService = new UserService();
