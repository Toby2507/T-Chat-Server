import { Request, Response } from 'express';
import { omit } from 'lodash';
import { privateFields } from '../models/user.model';
import { addNewUsersToGroupInput, createGroupChatInput, deleteGroupChatInput, editGroupInfoInput, removeGroupMemberInput } from '../schemas/groupChat.schemas';
import { addNewAdminsToGroup, addNewUsersToGroup, createGroupChat, deleteGroupChat, editGroupInfo, leaveGroupChat, removeGroupMember, setGroupProfilePicture } from '../services/groupChat.service';
import { removeGroupFromGroupList, updateUsersGroupList } from '../services/user.service';

export const createGroupChatHandler = async (req: Request<{}, {}, createGroupChatInput>, res: Response) => {
  try {
    const { name, members, description } = req.body;
    const { _id: from } = res.locals.user;
    const groupChat = await createGroupChat({ userName: name, members, description: description || "", admins: [from] });
    await updateUsersGroupList(members, groupChat._id.toString());
    return res.status(201).json(omit(groupChat.toJSON(), privateFields));
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ message: 'Group already exists' });
  }
};

export const editGroupInfoHandler = async (req: Request<{}, {}, editGroupInfoInput>, res: Response) => {
  try {
    const { groupId, name, description } = req.body;
    const { _id: userId } = res.locals.user;
    const isUpdated = await editGroupInfo(groupId, name, (description || ""), userId);
    if (isUpdated.modifiedCount === 0) return res.status(403).json({ message: 'You are not an admin of this group' });
    res.sendStatus(204);
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ message: 'Group already exists' });
  }
};

export const addNewUsersToGroupHandler = async (req: Request<{}, {}, addNewUsersToGroupInput>, res: Response) => {
  const { members, groupId } = req.body;
  const { _id: by } = res.locals.user;
  const isUpdated = await addNewUsersToGroup(groupId, members, by);
  if (isUpdated.modifiedCount === 0) return res.status(403).json({ message: 'You are not an admin of this group' });
  await updateUsersGroupList(members, groupId);
  res.sendStatus(204);
};

export const groupAdminHandler = async (req: Request, res: Response) => {
  const { groupId, userId } = req.params;
  const { _id: by } = res.locals.user;
  const isUpdated = await addNewAdminsToGroup(groupId, userId, by);
  if (isUpdated.modifiedCount === 0) return res.status(403).json({ message: 'You are not an admin of this group' });
  return res.sendStatus(204);
};

export const setGroupProfilePictureHandler = async (req: Request, res: Response) => {
  const { _id: by } = res.locals.user;
  const { groupId } = req.params;
  const profilePicture = req.file?.path;
  if (!profilePicture) return res.status(400).json({ message: 'Could not set profile picture' });
  const isUpdated = await setGroupProfilePicture(groupId, profilePicture, by);
  if (isUpdated.modifiedCount === 0) return res.status(403).json({ message: 'You are not an admin of this group' });
  return res.status(200).json({ profilePicture });
};

export const removeGroupProfilePictureHandler = async (req: Request, res: Response) => {
  const { _id: by } = res.locals.user;
  const { groupId } = req.params;
  const isUpdated = await setGroupProfilePicture(groupId, null, by);
  if (isUpdated.modifiedCount === 0) return res.status(403).json({ message: 'You are not an admin of this group' });
  return res.sendStatus(204);
};

export const leaveGroupChatHandler = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { _id: userId } = res.locals.user;
  const updatedAdmin = await leaveGroupChat(groupId, userId);
  if (!updatedAdmin) return res.status(403).json({ message: 'You are not a member of this group' });
  await removeGroupFromGroupList(userId, groupId);
  res.status(200).json({ admins: updatedAdmin.admins });
};

export const removeGroupMemberHandler = async (req: Request<{}, {}, removeGroupMemberInput>, res: Response) => {
  const { groupId, userId } = req.body;
  const { _id: by } = res.locals.user;
  const isRemoved = await removeGroupMember(groupId, userId, by);
  if (isRemoved.modifiedCount === 0) return res.status(403).json({ message: 'You are not an admin of this group' });
  await removeGroupFromGroupList(userId, groupId);
  res.sendStatus(204);
};

export const deleteGroupChatHandler = async (req: Request<{}, {}, deleteGroupChatInput>, res: Response) => {
  const { groupId, members } = req.body;
  const { _id: userId } = res.locals.user;
  const isDeleted = await deleteGroupChat(groupId, userId);
  if (isDeleted.deletedCount === 0) return res.status(403).json({ message: 'You are not an admin of this group' });
  members.forEach(async (member: string) => {
    await removeGroupFromGroupList(member, groupId);
  });
  res.sendStatus(204);
};