import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { userRegistrationValidatorSchema, userLoginValidatorSchema } from "../validators/userValidators.js";
import { authLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/register", authLimiter, validateRequest(userRegistrationValidatorSchema), register);

router.post("/login", authLimiter, validateRequest(userLoginValidatorSchema), login);

router.post("/logout", logout);

export default router