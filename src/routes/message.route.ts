import { Router } from "express";
import { addMessageHandler, clearChatHandler, getMessagesHandler, readUserMessagesHandler } from "../controllers/message.controller";
import requireUser from "../middlewares/requireUser";
import validateSchema from "../middlewares/validateSchema";
import { addMessageSchema, clearChatSchema, getMessagesSchema, readUserMessagesSchema } from "../schemas/message.schema";

const router = Router();

router.use(requireUser);
router.post('/addmsg', validateSchema(addMessageSchema), addMessageHandler);
router.post('/getmsg/:to', validateSchema(getMessagesSchema), getMessagesHandler);
router.patch('/readmsgs', validateSchema(readUserMessagesSchema), readUserMessagesHandler);
router.delete('/clearchat', validateSchema(clearChatSchema), clearChatHandler);

export default router;