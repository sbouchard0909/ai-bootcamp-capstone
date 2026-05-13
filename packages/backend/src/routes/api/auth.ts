import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail, findUserById } from '../../utils/userDb';
import { sanitizeUser } from '../../models/User';
import { isValidEmail, isValidPassword, validateRequiredFields } from '../../utils/validation';
import { AppError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';
import { authenticateToken, signAuthToken } from '../../middleware/auth';

const router = Router();
const SALT_ROUNDS = 10;

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    const missingField = validateRequiredFields({ email, password, name });
    if (missingField) throw new AppError(missingField, 400);
    if (!isValidEmail(email)) throw new AppError('Invalid email format', 400);
    if (!isValidPassword(password)) throw new AppError('password must be at least 8 characters long', 400);
    if (findUserByEmail(email)) throw new AppError('Email already exists', 409);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = createUser({ email, password: hashedPassword, name });

    return sendSuccess(res, { user: sanitizeUser(user) }, 201);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const missingField = validateRequiredFields({ email, password });
    if (missingField) throw new AppError(missingField, 400);

    const user = findUserByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError('Invalid credentials', 401);

    const token = signAuthToken({ userId: user.id, email: user.email });

    return sendSuccess(res, { token, user: sanitizeUser(user) }, 200);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  return sendSuccess(res, { message: 'Logged out successfully' }, 200);
});

router.get('/me', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Authentication token is required', 401);

    const user = findUserById(req.user.userId);
    if (!user) throw new AppError('User not found', 401);

    return sendSuccess(res, { user: sanitizeUser(user) }, 200);
  } catch (error) {
    next(error);
  }
});

export default router;
