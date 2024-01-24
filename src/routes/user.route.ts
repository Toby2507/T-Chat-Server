import { Router } from "express";
import { deleteAccountHandler, forgotPasswordHandler, getAllUsersHandler, removeProfilepictureHandler, resendPasswordResetEmailHandler, resendVerifyUserEmailHandler, resetPasswordHandler, setProfilePictureHandler, updateUserInfoHandler, verifyUserHandler } from "../controllers/user.controller";
import requireUser from "../middlewares/requireUser";
import validateSchema from "../middlewares/validateSchema";
import { forgotPasswordSchema, resendPasswordResetEmailSchema, resetPasswordSchema, updateUserInfoSchema, verifyUserSchema } from "../schemas/user.schema";
import { parser } from "../utils/imageParser";

const router = Router();

router.post('/forgotpassword', validateSchema(forgotPasswordSchema), forgotPasswordHandler);
router.post('/resetpassword/:id/:passwordResetCode', validateSchema(resetPasswordSchema), resetPasswordHandler);
router.post('/resendforgotpasswordemail', validateSchema(resendPasswordResetEmailSchema), resendPasswordResetEmailHandler);
router.use(requireUser);
router.get('/verify/:verificationCode', validateSchema(verifyUserSchema), verifyUserHandler);
router.get('/resendverifyemail', resendVerifyUserEmailHandler);
router.patch('/setprofilepicture', parser.single('image'), setProfilePictureHandler);
router.patch('/removeprofilepicture', removeProfilepictureHandler);
router.get('/getallusers', getAllUsersHandler);
router.patch('/updateuserinfo', validateSchema(updateUserInfoSchema), updateUserInfoHandler);
router.delete('/deleteaccount', deleteAccountHandler);

export default router;