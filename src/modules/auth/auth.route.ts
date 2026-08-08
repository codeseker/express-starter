import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";

const router = Router();

const authController = new AuthController();

router.route("/register").post(authController.register);

export default {
  path: "/auth",
  router,
};
