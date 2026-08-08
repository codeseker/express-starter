import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";

const router = Router();

const authController = new AuthController();

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);

export default {
  path: "/auth",
  router,
};
