import { User, IUser } from '@luxgen/db';
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
}

export class UserService {
  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id).populate('tenant');
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

  async updateUser(id: string, input: UpdateUserInput): Promise<IUser> {
    const user = await User.findByIdAndUpdate(id, input, { new: true }).populate('tenant');
    if (!user) throw new Error('User not found');
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async login({ email, password, tenantId, req }: LoginInput): Promise<AuthResult> {
    if (req) {
      checkLoginRateLimit(req, email);
    }

    const query: Record<string, unknown> = { email: email.toLowerCase().trim() };
    if (tenantId) query.tenant = tenantId;

    const user = await User.findOne(query).populate('tenant');
    if (!user) throw new Error('Invalid email or password');

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw new Error('Invalid email or password');

    if (!isAccountActive(user)) {
      throw new Error(ACCOUNT_DEACTIVATED_MESSAGE);
    }

    const token = generateToken(
      {
        id: (user as any)._id.toString(),
        email: user.email,
        tenant: (user.tenant as any)._id?.toString(),
        role: user.role,
      },
      (user.tenant as any)._id?.toString(),
    );

    logger.info(`User login: ${user.email}`);
    return { token, user };
  }

  async register(input: UserRegistrationData): Promise<AuthResult> {
    const user = await this.createUser(input);

    const token = generateToken(
      {
        id: (user as any)._id.toString(),
        email: user.email,
        tenant: (user.tenant as any)._id?.toString(),
        role: user.role,
      },
      (user.tenant as any)._id?.toString(),
    );

    logger.info(`User registered: ${user.email}`);
    return { token, user };
  }
}

export const userService = new UserService();
