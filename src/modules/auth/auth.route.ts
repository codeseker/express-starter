import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";
import { authenticate, extractUser } from "@/common/middlewares/authenticate";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/refresh", extractUser, authController.refresh);
router.post("/logout", authenticate, authController.logout);

router.post("/verify-email", authenticate, authController.verifyEmail);
router.post("/resend-otp", authenticate, authController.resendOtp);

export default {
  path: "/auth",
  router,
};
