import { TypeOf, boolean, object, string } from "zod";

export const setChatInfoSchema = object({
  params: object({
    userId: string({ required_error: "User Id is required" })
  }),
  body: object({
    control: string({ required_error: "Control is required" }),
    set: boolean({ required_error: "Set is required" })
  })
});

export type setChatInfoInput = TypeOf<typeof setChatInfoSchema>;