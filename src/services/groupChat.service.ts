import GroupChatModel, { GroupChat } from "../models/groupChat.model";

export const createGroupChat = (input: Partial<GroupChat>) => {
  return GroupChatModel.create({ ...input });
};

export const getGroupChats = (groupIds: string[], from: string) => {
  return GroupChatModel.find({ _id: { $in: groupIds }, members: { $in: from } });
};

export const leaveGroupChat = (groupId: string, userId: string) => {
  return GroupChatModel.findOneAndUpdate({ _id: groupId }, [
    {
      $set: {
        members: { $filter: { input: "$members", as: "member", cond: { $ne: ["$$member", userId] } } },
        admins: { $filter: { input: "$admins", as: "admin", cond: { $ne: ["$$admin", userId] } } }
      }
    },
    {
      $set: {
        admins: {
          $cond: {
            if: { $eq: ["$admins", []] },
            then: [
              {
                $arrayElemAt: ["$members", {
                  $floor: {
                    $multiply: [{ $rand: {} }, { $size: "$members" }]
                  }
                }]
              },
            ],
            else: "$admins"
          }
        }
      }
    }], { new: true, field: { admins: 1, _id: 0 } });
};

export const removeGroupMember = (groupId: string, userId: string, by: string) => {
  return GroupChatModel.updateOne({ _id: groupId, admins: by }, { $pull: { members: userId, admins: userId } });
};

export const removeAccountFromGroups = (groupIds: string[], userId: string) => {
  return GroupChatModel.updateMany({ _id: { $in: groupIds } }, [
    {
      $set: {
        members: { $filter: { input: "$members", as: "member", cond: { $ne: ["$$member", userId] } } },
        admins: { $filter: { input: "$admins", as: "admin", cond: { $ne: ["$$admin", userId] } } }
      }
    },
    {
      $set: {
        admins: {
          $cond: {
            if: { $eq: ["$admins", []] },
            then: [
              {
                $arrayElemAt: ["$members", {
                  $floor: {
                    $multiply: [{ $rand: {} }, { $size: "$members" }]
                  }
                }]
              },
            ],
            else: "$admins"
          }
        }
      }
    }]);
};

export const getGroupAdmins = (groupIds: string[]) => {
  return GroupChatModel.find({ _id: { $in: groupIds } }, { admins: 1 });
};

export const deleteGroupChat = (groupId: string, by: string) => {
  return GroupChatModel.deleteOne({ _id: groupId, admins: by });
};

export const editGroupInfo = (groupId: string, userName: string, description: string, by: string) => {
  return GroupChatModel.updateOne({ _id: groupId, admins: by }, { userName, description });
};

export const addNewUsersToGroup = (groupId: string, members: string[], by: string) => {
  return GroupChatModel.updateOne({ _id: groupId, admins: by }, { $addToSet: { members: { $each: members } } });
};

export const setGroupProfilePicture = (groupId: string, profilePicture: string | null, by: string) => {
  return GroupChatModel.updateOne({ _id: groupId, admins: by }, { profilePicture });
};

export const addNewAdminsToGroup = (groupId: string, admin: string, by: string) => {
  return GroupChatModel.updateOne({ _id: groupId, admins: by }, [{
    $set: {
      admins: {
        $cond: {
          if: { $in: [admin, "$admins"] },
          then: { $filter: { input: "$admins", as: "admin", cond: { $ne: ["$$admin", admin] } } },
          else: { $concatArrays: ["$admins", [admin]] }
        }
      }
    }
  }]);
};