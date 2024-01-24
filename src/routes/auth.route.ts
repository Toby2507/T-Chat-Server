import { Router } from "express";
import { createUserHandler, loginUserHandler, logoutUserHandler, refreshAccessHandler } from "../controllers/auth.controller";
import validateSchema from "../middlewares/validateSchema";
import { createUserSchema, loginUserSchema } from "../schemas/auth.schema";

const router = Router();

router.post('/signup', validateSchema(createUserSchema), createUserHandler);
router.post('/login', validateSchema(loginUserSchema), loginUserHandler);
router.get('/refreshaccess', refreshAccessHandler);
router.get('/logout', logoutUserHandler);

export default router;