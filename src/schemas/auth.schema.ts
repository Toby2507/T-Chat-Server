import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
    body: object({
        userName: string({ required_error: "Username is required" }),
        password: string({ required_error: "Password is required" }).min(8, "Password requires atleast 8 chars"),
        email: string({ required_error: "Email is required" }).email("Not a valid email")
    })
});

export const loginUserSchema = object({
    body: object({
        userName: string({ required_error: "Username is required" }),
        password: string({ required_error: "Password is required" }).min(8, "Password requires atleast 8 chars")
    })
});

export type createUserInput = TypeOf<typeof createUserSchema>["body"];
export type loginUserInput = TypeOf<typeof loginUserSchema>["body"];