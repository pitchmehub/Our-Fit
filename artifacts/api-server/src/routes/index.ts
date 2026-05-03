import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import outfitsRouter from "./outfits/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(outfitsRouter);

export default router;
