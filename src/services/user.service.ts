import UserModel, { User } from "../models/user.model";

export const createUser = (input: Partial<User>) => {
    return UserModel.create({ ...input });
};

export const findUserByUsername = (userName: string) => {
    return UserModel.findOne({ userName });
};

export const findUserByEmail = (email: string) => {
    return UserModel.findOne({ email });
};

export const findUserById = (id: string) => {
    return UserModel.findById(id);
};

export const findUserByRefeshToken = (refreshToken: string) => {
    return UserModel.findOne({ refreshToken });
};

export const setProfilePicture = (id: string, profilePicture: string | null) => {
    return UserModel.updateOne({ _id: id }, { profilePicture });
};

export const getAllUsers = (currentUserId: string) => {
    return UserModel.find({ _id: { $ne: currentUserId }, verified: true }).sort('userName');
};

export const updateUserName = (userID: string, userName: string) => {
    return UserModel.updateOne({ _id: userID }, { userName });
};

export const updateUsersGroupList = (userIds: string[], groupId: string) => {
    return UserModel.updateMany({ _id: { $in: userIds } }, { $addToSet: { groups: groupId } }, { multi: true });
};

export const removeGroupFromGroupList = (userId: string, groupId: string) => {
    return UserModel.updateOne({ _id: userId }, { $pull: { groups: groupId } });
};

export const getUserGroups = (userId: string) => {
    return UserModel.findById(userId, { groups: 1, _id: 0 });
};

export const deleteAccount = (userId: string) => {
    return UserModel.findByIdAndDelete(userId);
};

export const deleteAccountTrail = (userId: string) => {
    return UserModel.updateMany({}, { $pull: { archivedChats: userId, blockedUsers: userId, mutedUsers: userId } });
};