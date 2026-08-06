import { Request, Response, Router } from "express";

const router = Router();

router.use("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    message: "The system is fine!",
    success: true,
  });
});

export default router;
