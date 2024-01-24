import { array, boolean, object, string, TypeOf } from "zod";

export const addMessageSchema = object({
  body: object({
    message: string({ required_error: "Message is required" }),
    to: string({ required_error: "Please specify a To value" }),
    members: string().array().optional(),
    isInformational: boolean().optional()
  })
});

export const getMessagesSchema = object({
  params: object({
    to: string()
  }),
  body: object({
    isGroup: boolean({ required_error: "Please specify if request if for a group or not" })
  })
});

export const readUserMessagesSchema = object({
  body: object({
    messages: array(string(), { required_error: "Message Ids are required" }),
    to: string({ required_error: "Please specify a To value" })
  })
});

export const clearChatSchema = object({
  body: object({
    messageIds: array(string(), { required_error: "Message Ids are required" }),
    to: string({ required_error: "Please specify a To value" })
  })
});

export type addMessageInput = TypeOf<typeof addMessageSchema>["body"];
export type getMessagesInput = TypeOf<typeof getMessagesSchema>;
export type readUserMessagesInput = TypeOf<typeof readUserMessagesSchema>["body"];
export type clearChatInput = TypeOf<typeof clearChatSchema>["body"];