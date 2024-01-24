import { Request, Response } from "express";
import { omit } from "lodash";
import { nanoid } from "nanoid";
import { privateFields } from "../models/user.model";
import { forgotPasswordInput, resendPasswordResetEmailInput, resetPasswordInput, updateUserInfoInput, verifyUserInput } from "../schemas/user.schema";
import { getGroupAdmins, getGroupChats, removeAccountFromGroups } from "../services/groupChat.service";
import { deleteAccount, deleteAccountTrail, findUserByEmail, findUserById, getAllUsers, getUserGroups, setProfilePicture, updateUserName } from "../services/user.service";
import sendEmail from "../utils/mailer";

export const getAllUsersHandler = async (req: Request, res: Response) => {
    const { _id: from } = res.locals.user;
    const users = await getAllUsers(from);
    const groups = await getUserGroups(from);
    const groupChats = await getGroupChats(groups?.groups as string[], from);
    const sanitizedGroupChats = groupChats.map(groupChat => omit(groupChat.toJSON(), privateFields));
    const sanitizedUsers = users.map(user => omit(user.toJSON(), [...privateFields, "archivedChats", "mutedUsers", "verified"]));
    return res.status(200).json({ users: sanitizedUsers, groups: sanitizedGroupChats });
};

export const verifyUserHandler = async (req: Request<verifyUserInput>, res: Response) => {
    const { verificationCode } = req.params;
    const { _id } = res.locals.user;
    const user = await findUserById(_id);
    if (!user) return res.status(404).json({ message: 'Could not verify user' });
    if (user.verified) return res.sendStatus(204);
    if (user.verificationCode === +verificationCode) {
        user.verified = true;
        await user.save();
        return res.sendStatus(204);
    }
    return res.status(400).json({ message: 'Could not verify user' });
};

export const resendVerifyUserEmailHandler = async (req: Request, res: Response) => {
    const { _id } = res.locals.user;
    const user = await findUserById(_id);
    if (!user) return res.sendStatus(404);
    await sendEmail({
        to: user.email,
        template: "verifyUser",
        locals: { name: user.userName, verifyCode: user.verificationCode }
    });
    return res.sendStatus(204);
};

export const forgotPasswordHandler = async (req: Request<{}, {}, forgotPasswordInput>, res: Response) => {
    const { email } = req.body;
    const message = "If a user with that email exists, we've sent you an email with a link to reset your password.";
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message });
    const passwordResetCode = nanoid();
    user.passwordResetCode = passwordResetCode;
    await user.save();
    const resetUrl = `${req.get('origin')}/reset/${user._id}/${user.passwordResetCode}`;
    await sendEmail({
        to: user.email,
        template: "forgotPassword",
        locals: { name: user.userName, resetUrl }
    });
    return res.status(200).json({ message });
};

export const resendPasswordResetEmailHandler = async (req: Request<{}, {}, resendPasswordResetEmailInput>, res: Response) => {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.sendStatus(404);
    const resetUrl = `${req.get('origin')}/reset/${user._id}/${user.passwordResetCode}`;
    await sendEmail({
        to: user.email,
        template: "forgotPassword",
        locals: { name: user.userName, resetUrl }
    });
    return res.sendStatus(204);
};

export const resetPasswordHandler = async (req: Request<resetPasswordInput["params"], {}, resetPasswordInput["body"]>, res: Response) => {
    const { body: { password }, params: { id, passwordResetCode } } = req;
    const user = await findUserById(id);
    if (!user || !user.passwordResetCode || user.passwordResetCode !== passwordResetCode) return res.status(400).json({ message: "Could not reset user password" });
    if (!user.verified) user.verified = true;
    user.passwordResetCode = null;
    user.password = password;
    await user.save();
    return res.sendStatus(204);
};

export const setProfilePictureHandler = async (req: Request, res: Response) => {
    const { _id } = res.locals.user;
    const profilePicture = req.file?.path;
    if (!profilePicture) return res.status(400).json({ message: 'Could not set profile picture' });
    const isUpdated = await setProfilePicture(_id, profilePicture);
    if (isUpdated.modifiedCount === 0) return res.status(400).json({ message: 'Could not set profile picture' });
    return res.status(200).json({ profilePicture });
};

export const removeProfilepictureHandler = async (req: Request, res: Response) => {
    const { _id } = res.locals.user;
    const isUpdated = await setProfilePicture(_id, null);
    if (isUpdated.modifiedCount === 0) return res.status(400).json({ message: 'Could not remove profile picture' });
    return res.sendStatus(204);
};

export const updateUserInfoHandler = async (req: Request<{}, {}, updateUserInfoInput>, res: Response) => {
    try {
        const { _id } = res.locals.user;
        const { userName } = req.body;
        const isUpdated = await updateUserName(_id, userName);
        if (isUpdated.modifiedCount === 0) return res.status(400).json({ message: 'Could not update user info' });
        return res.sendStatus(204);
    } catch (err: any) {
        if (err.code === 11000) return res.status(409).json({ message: 'User already exists' });
    }
};

export const deleteAccountHandler = async (req: Request, res: Response) => {
    const { _id } = res.locals.user;
    const user = await deleteAccount(_id);
    await deleteAccountTrail(_id);
    const groups = user?.toJSON().groups;
    await removeAccountFromGroups(groups as string[], _id);
    const updatedAdmins = await getGroupAdmins(groups as string[]);
    return res.status(200).json({ updatedAdmins });
};