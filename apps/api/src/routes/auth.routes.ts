import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validateDto } from '@/middleware/validation.middleware';
import { authenticateToken } from '@/middleware/auth.middleware';
import { SignupRequestDto, SigninRequestDto } from '@raven/validators';

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/signup
router.post('/signup', validateDto(SignupRequestDto), authController.signup.bind(authController));

// POST /api/v1/auth/signin
router.post('/signin', validateDto(SigninRequestDto), authController.signin.bind(authController));

// POST /api/v1/auth/google
router.post('/google', authController.googleSignin.bind(authController));

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh.bind(authController));

// POST /api/v1/auth/signout
router.post('/signout', authenticateToken, authController.signout.bind(authController));

export { router as authRoutes };
