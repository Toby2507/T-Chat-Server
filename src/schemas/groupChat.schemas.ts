import { TypeOf, object, string } from "zod";

export const createGroupChatSchema = object({
  body: object({
    name: string({ required_error: "Group name is required" }),
    description: string().optional(),
    members: string({ required_error: "Members are required" }).array(),
  })
});

export const editGroupInfoSchema = object({
  body: object({
    groupId: string({ required_error: "Group id is required" }),
    name: string({ required_error: "Group name is required" }),
    description: string().optional(),
  })
});

export const addNewUsersToGroupSchema = object({
  body: object({
    groupId: string({ required_error: "Group id is required" }),
    members: string({ required_error: "Members are required" }).array(),
  })
});

export const removeGroupMemberSchema = object({
  body: object({
    groupId: string({ required_error: "Group id is required" }),
    userId: string({ required_error: "User id is required" }),
  })
});

export const deleteGroupChatSchema = object({
  body: object({
    groupId: string({ required_error: "Group id is required" }),
    members: string({ required_error: "Members are required" }).array()
  })
});

export type createGroupChatInput = TypeOf<typeof createGroupChatSchema>["body"];
export type editGroupInfoInput = TypeOf<typeof editGroupInfoSchema>["body"];
export type addNewUsersToGroupInput = TypeOf<typeof addNewUsersToGroupSchema>["body"];
export type removeGroupMemberInput = TypeOf<typeof removeGroupMemberSchema>["body"];
export type deleteGroupChatInput = TypeOf<typeof deleteGroupChatSchema>["body"];