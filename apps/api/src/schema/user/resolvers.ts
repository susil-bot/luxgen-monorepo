import { User } from '@luxgen/db';
import { hashPassword, verifyPassword } from '@luxgen/auth';
import { generateToken } from '../../utils/jwt';

export const userResolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      return await User.findById(id).populate('tenant');
    },
    users: async (_: any, { tenantId }: { tenantId: string }) => {
      return await User.find({ tenant: tenantId }).populate('tenant');
    },
    currentUser: async (_: any, __: any, context: any) => {
      return context.user;
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: any }) => {
      const hashedPassword = await hashPassword(input.password);
      const user = new User({
        ...input,
        password: hashedPassword,
      });
      await user.save();
      await user.populate('tenant');
      return user;
    },
    updateUser: async (_: any, { id, input }: { id: string; input: any }) => {
      const user = await User.findByIdAndUpdate(id, input, { new: true }).populate('tenant');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    },
    login: async (_: any, { input }: { input: { email: string; password: string } }) => {
      try {
        // Find user by email
        const user = await User.findOne({ 
          email: input.email.toLowerCase().trim() 
        }).populate('tenant');

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await verifyPassword(input.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Generate JWT token with tenant-specific key
        const token = generateToken({
          id: user._id.toString(),
          email: user.email,
          tenant: user.tenant.toString(),
          role: user.role,
        }, user.tenant._id?.toString());

        return {
          token,
          user,
        };
      } catch (error) {
        throw new Error((error as Error).message || 'Login failed');
      }
    },
    register: async (_: any, { input }: { input: any }) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: input.email.toLowerCase().trim() });
        if (existingUser) {
          throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(input.password);

        // Create new user
        const user = new User({
          ...input,
          email: input.email.toLowerCase().trim(),
          password: hashedPassword,
        });

        await user.save();
        await user.populate('tenant');

        // Generate JWT token with tenant-specific key
        const token = generateToken({
          id: user._id.toString(),
          email: user.email,
          tenant: user.tenant.toString(),
          role: user.role,
        }, user.tenant._id?.toString());

        return {
          token,
          user,
        };
      } catch (error) {
        throw new Error((error as Error).message || 'Registration failed');
      }
    },
  },
};
