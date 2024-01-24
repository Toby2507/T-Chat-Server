import { Router } from "express";
import { addNewUsersToGroupHandler, createGroupChatHandler, deleteGroupChatHandler, editGroupInfoHandler, groupAdminHandler, leaveGroupChatHandler, removeGroupMemberHandler, removeGroupProfilePictureHandler, setGroupProfilePictureHandler } from "../controllers/groupChat.controller";
import requireUser from "../middlewares/requireUser";
import validateSchema from "../middlewares/validateSchema";
import { addNewUsersToGroupSchema, createGroupChatSchema, deleteGroupChatSchema, editGroupInfoSchema, removeGroupMemberSchema } from "../schemas/groupChat.schemas";
import { parser } from "../utils/imageParser";

const router = Router();

router.use(requireUser);
router.post('/create', validateSchema(createGroupChatSchema), createGroupChatHandler);
router.patch('/edit', validateSchema(editGroupInfoSchema), editGroupInfoHandler);
router.patch('/add', validateSchema(addNewUsersToGroupSchema), addNewUsersToGroupHandler);
router.patch('/makeadmin/:groupId/:userId', groupAdminHandler);
router.patch('/leave/:groupId', leaveGroupChatHandler);
router.patch('/remove', validateSchema(removeGroupMemberSchema), removeGroupMemberHandler);
router.delete('/delete', validateSchema(deleteGroupChatSchema), deleteGroupChatHandler);
router.patch('/setprofilepicture/:groupId', parser.single('image'), setGroupProfilePictureHandler);
router.patch('/removeprofilepicture/:groupId', removeGroupProfilePictureHandler);

export default router;