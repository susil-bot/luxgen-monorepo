import { Router, Request, Response } from 'express';
import { User, IUser } from '@luxgen/db';
import { hashPassword, verifyPassword } from '@luxgen/auth';
import { generateToken } from '../utils/jwt';
import { userService } from '../services/userService';
import { validateLogin, validateRegister } from '../middleware/validation';

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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        errors: {
          email: 'Email is already registered',
        }
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || 'STUDENT',
      tenant: tenantId, // This should be validated against existing tenants
    });

    await newUser.save();
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

export default router;
