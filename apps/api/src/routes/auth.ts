import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { User, IUser } from '@luxgen/db';
import { UserRole } from '@luxgen/auth';
import { hashPassword } from '@luxgen/auth';
import {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
} from '../middleware/validation';
import { loginRateLimitMiddleware } from '../middleware/loginRateLimit';
import { isAccountActive, ACCOUNT_DEACTIVATED_MESSAGE } from '../utils/accountStatus';
import { AuthServiceError, buildAuthRestPayload, userService } from '../services/userService';
import { UserRegistrationService } from '../services/userRegistrationService';
import { requireRole, canInviteUsers, logRoleAccess } from '../middleware/roleManagement';
import { sendTransactionalEmail } from '../utils/email';
import { logger } from '../utils/logger';
import { getWebUrl } from '@luxgen/config';
import { generateToken } from '../utils/jwt';
import {
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
  clearRefreshCookie,
  verifyRefreshToken,
  type RefreshTokenPayload,
} from '../utils/refreshToken';

const router = Router();

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const PASSWORD_RESET_SENT_MESSAGE = 'If an account exists with that email, a password reset link has been sent.';

function refreshPayloadFromUser(user: IUser): RefreshTokenPayload {
  const tenant = user.tenant as { _id?: { toString(): string } } | undefined;
  const id = user._id?.toString();
  if (!id) {
    throw new Error('User id is required for refresh token');
  }
  return {
    id,
    email: user.email,
    tenant: tenant?._id?.toString(),
    role: user.role,
  };
}

// Login endpoint
router.post('/login', loginRateLimitMiddleware, validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password, tenant } = req.body;
    const { token, user } = await userService.login({
      email,
      password,
      tenantId: tenant,
    });
    setRefreshCookie(res, refreshPayloadFromUser(user));

    res.json({
      success: true,
      message: 'Login successful',
      data: buildAuthRestPayload(token, user),
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(error.errors ? { errors: error.errors } : {}),
      });
    }
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

// Register endpoint
router.post('/register', validateRegister, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant context required',
        errors: {
          tenant: 'No tenant context found',
        },
      });
    }

    const { token, user } = await userService.register({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.USER,
      tenantId,
    });
    setRefreshCookie(res, refreshPayloadFromUser(user));

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: buildAuthRestPayload(token, user, true),
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(error.errors ? { errors: error.errors } : {}),
      });
    }
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

// Get current user endpoint
router.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const user = await User.findById(req.user.id).populate('tenant');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: {
          id: (user.tenant as any)._id,
          name: (user.tenant as any).name,
          subdomain: (user.tenant as any).subdomain,
        },
      },
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

// Refresh access token using httpOnly refresh cookie
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      clearRefreshCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const user = await User.findById(payload.id).populate('tenant');
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    if (!isAccountActive(user)) {
      clearRefreshCookie(res);
      return res.status(403).json({
        success: false,
        message: ACCOUNT_DEACTIVATED_MESSAGE,
      });
    }

    const tokenPayload = refreshPayloadFromUser(user);
    const token = generateToken(tokenPayload, tokenPayload.tenant);
    setRefreshCookie(res, tokenPayload);

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

// Logout endpoint — clears httpOnly refresh cookie
router.post('/logout', (req: Request, res: Response) => {
  clearRefreshCookie(res);
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Forgot password — issues a crypto reset token (email stub via sendTransactionalEmail)
router.post('/forgot-password', validateForgotPassword, async (req: Request, res: Response) => {
  try {
    const { email, tenant } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      ...(tenant && { tenant }),
    }).select('+passwordResetToken +passwordResetExpires');

    if (user && isAccountActive(user)) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = hashResetToken(rawToken);
      user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
      await user.save();

      const resetUrl = `${getWebUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;

      try {
        await sendTransactionalEmail({
          to: user.email,
          subject: 'Reset your LuxGen password',
          body: [
            `Hello ${user.firstName},`,
            '',
            'We received a request to reset your LuxGen password.',
            '',
            `Reset your password using this link (valid for 1 hour):`,
            resetUrl,
            '',
            'If you did not request this, you can ignore this email.',
          ].join('\n'),
        });
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
      }
    }

    res.json({
      success: true,
      message: PASSWORD_RESET_SENT_MESSAGE,
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

// Reset password — consumes token and sets a new password
router.post('/reset-password', validateResetPassword, async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const hashedToken = hashResetToken(token.trim());

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        errors: { token: 'Invalid or expired reset token' },
      });
    }

    if (!isAccountActive(user)) {
      return res.status(403).json({
        success: false,
        message: ACCOUNT_DEACTIVATED_MESSAGE,
      });
    }

    user.password = await hashPassword(password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

// Invite user endpoint
router.post('/invite', canInviteUsers, logRoleAccess('user invitation'), async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, role } = req.body;
    const tenantId = req.tenantId;
    const invitedBy = req.user?._id.toString();

    if (!tenantId || !invitedBy) {
      return res.status(400).json({
        success: false,
        message: 'Tenant context and authentication required',
      });
    }

    // Generate cryptographically secure temporary password — delivered via email only
    const tempPassword = crypto.randomBytes(16).toString('hex');

    const registrationResult = await UserRegistrationService.registerUser({
      email,
      password: tempPassword,
      firstName,
      lastName,
      role: role || UserRole.USER,
      tenantId,
      invitedBy,
    });

    if (!registrationResult.success) {
      return res.status(400).json({
        success: false,
        message: registrationResult.message,
        errors: registrationResult.errors,
      });
    }

    try {
      await sendTransactionalEmail({
        to: email,
        subject: 'You have been invited to LuxGen',
        body: [
          `Hello ${firstName},`,
          '',
          'An administrator has invited you to LuxGen.',
          '',
          `Sign in with your email (${email}) and this temporary password:`,
          tempPassword,
          '',
          'Please change your password after your first login.',
        ].join('\n'),
      });
    } catch (emailError) {
      logger.error('Failed to send invite email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'User was created but the invitation email could not be sent. Contact an administrator.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'User invited successfully. Login credentials were sent by email.',
      data: {
        user: {
          id: registrationResult.user!._id,
          email: registrationResult.user!.email,
          firstName: registrationResult.user!.firstName,
          lastName: registrationResult.user!.lastName,
          role: registrationResult.user!.role,
          status: registrationResult.user!.status,
        },
      },
    });
  } catch (error) {
    logger.error('User invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

// Update user role endpoint
router.put(
  '/users/:userId/role',
  requireRole(UserRole.ADMIN),
  logRoleAccess('role update'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const tenantId = req.tenantId;
      const updatedBy = req.user?._id.toString();

      if (!tenantId || !updatedBy) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context and authentication required',
        });
      }

      const updateResult = await UserRegistrationService.updateUserRole(userId, role, updatedBy, tenantId);

      if (!updateResult.success) {
        return res.status(400).json({
          success: false,
          message: updateResult.message,
          errors: updateResult.errors,
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: {
          user: {
            id: updateResult.user!._id,
            email: updateResult.user!.email,
            role: updateResult.user!.role,
            status: updateResult.user!.status,
          },
        },
      });
    } catch (error) {
      logger.error('Role update error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error:
          process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      });
    }
  },
);

// Activate user endpoint
router.put(
  '/users/:userId/activate',
  requireRole(UserRole.ADMIN),
  logRoleAccess('user activation'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const activatedBy = req.user?._id.toString();

      if (!activatedBy) {
        return res.status(400).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const activationResult = await UserRegistrationService.activateUser(userId, activatedBy);

      if (!activationResult.success) {
        return res.status(400).json({
          success: false,
          message: activationResult.message,
          errors: activationResult.errors,
        });
      }

      res.json({
        success: true,
        message: 'User activated successfully',
        data: {
          user: {
            id: activationResult.user!._id,
            email: activationResult.user!.email,
            status: activationResult.user!.status,
          },
        },
      });
    } catch (error) {
      logger.error('User activation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error:
          process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      });
    }
  },
);

export default router;
