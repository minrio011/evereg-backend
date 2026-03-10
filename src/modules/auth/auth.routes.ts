import { Router } from "express";
import * as authController from './auth.controller';
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/auth.middleware";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);

router.get('/me', authenticate, authController.getMe);

export default router;