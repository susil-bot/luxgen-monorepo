import { Router, Request, Response } from 'express';
import { User, IUser, UserRole } from '@luxgen/db';
import { hashPassword, verifyPassword } from '@luxgen/auth';
import { generateToken } from '../utils/jwt';
import { userService } from '../services/userService';
import { validateLogin, validateRegister } from '../middleware/validation';
import { UserRegistrationService } from '../services/userRegistrationService';
import { requireRole, canInviteUsers, logRoleAccess } from '../middleware/roleManagement';

const router = Router();

// Login endpoint
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password, tenant } = req.body;

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      ...(tenant && { tenant }) // Include tenant filter if provided
    }).populate('tenant');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: {
          email: 'Invalid email or password',
          password: 'Invalid email or password',
        }
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: {
          email: 'Invalid email or password',
          password: 'Invalid email or password',
        }
      });
    }

    // Check if user is active (you can add an isActive field to the user model)
    // if (!user.isActive) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Account is deactivated',
    //   });
    // }

    // Generate JWT token with tenant-specific key
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      tenant: user.tenant._id?.toString(),
      role: user.role,
    }, user.tenant._id?.toString());

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenant: {
            id: user.tenant._id,
            name: user.tenant.name,
            subdomain: user.tenant.subdomain,
          },
        },
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Register endpoint
router.post('/register', validateRegister, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Get tenant from request (set by middleware)
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant context required',
        errors: {
          tenant: 'No tenant context found'
        }
      });
    }

    // Use the registration service
    const registrationResult = await UserRegistrationService.registerUser({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.USER,
      tenantId,
    });

    if (!registrationResult.success) {
      return res.status(400).json({
        success: false,
        message: registrationResult.message,
        errors: registrationResult.errors
      });
    }

    const newUser = registrationResult.user!;
    await newUser.populate('tenant');

    // Generate JWT token with tenant-specific key
    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      tenant: newUser.tenant._id?.toString(),
      role: newUser.role,
    }, newUser.tenant._id?.toString());

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          status: newUser.status,
          tenant: {
            id: newUser.tenant._id,
            name: newUser.tenant.name,
            subdomain: newUser.tenant.subdomain,
          },
        },
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
          id: user.tenant._id,
          name: user.tenant.name,
          subdomain: user.tenant.subdomain,
        },
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Invite user endpoint
router.post('/invite', 
  canInviteUsers, 
  logRoleAccess('user invitation'),
  async (req: Request, res: Response) => {
    try {
      const { email, firstName, lastName, role } = req.body;
      const tenantId = req.tenantId;
      const invitedBy = req.user?._id.toString();

      if (!tenantId || !invitedBy) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context and authentication required'
        });
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);

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
          errors: registrationResult.errors
        });
      }

      res.status(201).json({
        success: true,
        message: 'User invited successfully',
        data: {
          user: {
            id: registrationResult.user!._id,
            email: registrationResult.user!.email,
            firstName: registrationResult.user!.firstName,
            lastName: registrationResult.user!.lastName,
            role: registrationResult.user!.role,
            status: registrationResult.user!.status,
          },
          tempPassword, // In production, this should be sent via email
        }
      });

    } catch (error) {
      console.error('User invitation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// Update user role endpoint
router.put('/users/:userId/role', 
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
          message: 'Tenant context and authentication required'
        });
      }

      const updateResult = await UserRegistrationService.updateUserRole(
        userId,
        role,
        updatedBy,
        tenantId
      );

      if (!updateResult.success) {
        return res.status(400).json({
          success: false,
          message: updateResult.message,
          errors: updateResult.errors
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
          }
        }
      });

    } catch (error) {
      console.error('Role update error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// Activate user endpoint
router.put('/users/:userId/activate', 
  requireRole(UserRole.ADMIN),
  logRoleAccess('user activation'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const activatedBy = req.user?._id.toString();

      if (!activatedBy) {
        return res.status(400).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const activationResult = await UserRegistrationService.activateUser(userId, activatedBy);

      if (!activationResult.success) {
        return res.status(400).json({
          success: false,
          message: activationResult.message,
          errors: activationResult.errors
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
          }
        }
      });

    } catch (error) {
      console.error('User activation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

export default router;
