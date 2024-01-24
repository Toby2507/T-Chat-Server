import UserModel from "../models/user.model";

export const updateUser = (me: string, control: string, set: boolean, otherUser: string) => {
  switch (control) {
    case "archivedChats":
      if (set) return UserModel.updateOne({ _id: me }, { $push: { archivedChats: otherUser } });
      return UserModel.updateOne({ _id: me }, { $pull: { archivedChats: otherUser } });
    case "blockedUsers":
      if (set) return UserModel.updateOne({ _id: me }, { $push: { blockedUsers: otherUser } });
      return UserModel.updateOne({ _id: me }, { $pull: { blockedUsers: otherUser } });
    case "mutedUsers":
      if (set) return UserModel.updateOne({ _id: me }, { $push: { mutedUsers: otherUser } });
      return UserModel.updateOne({ _id: me }, { $pull: { mutedUsers: otherUser } });
    default:
      break;
  }
};