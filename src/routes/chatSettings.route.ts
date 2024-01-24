import { Router } from "express";
import { setChatInfoHandler } from "../controllers/chatSettings.controller";
import requireUser from "../middlewares/requireUser";
import validateSchema from "../middlewares/validateSchema";
import { setChatInfoSchema } from "../schemas/chatSettings.schema";

const router = Router();

router.use(requireUser);
router.post('/setinfo/:userId', validateSchema(setChatInfoSchema), setChatInfoHandler);

export default router;