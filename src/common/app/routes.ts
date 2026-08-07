import { Request, Response, Router } from "express";
import { modules } from "../config/route.registery";

const router = Router();

router.use("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    message: "The system is fine!",
    success: true,
  });
});

for (const module of modules) {
  router.use(module.path, module.router);
}
export default router;
