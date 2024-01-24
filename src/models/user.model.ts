import { getModelForClass, pre, prop } from "@typegoose/typegoose";
import { index } from "@typegoose/typegoose/lib";
import { Severity } from "@typegoose/typegoose/lib/internal/constants";
import { modelOptions } from "@typegoose/typegoose/lib/modelOptions";
import { DocumentType } from "@typegoose/typegoose/lib/types";
import bcrypt from "bcrypt";
import verifyCode from "../utils/manualVerifyCode";

export const privateFields = ["password", "__v", "verificationCode", "passwordResetCode", "createdAt", "updatedAt"];

@pre<User>("save", async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
    return;
})
@index({ email: 1 })
@index(
    { createdAt: -1 },
    { expireAfterSeconds: 3600, partialFilterExpression: { verified: false } }
)
@modelOptions({
    schemaOptions: { timestamps: true },
    options: { allowMixed: Severity.ALLOW }
})
export class User {
    @prop({ lowercase: true, required: true, unique: true })
    email: string;

    @prop({ required: true, unique: true })
    userName: string;

    @prop({ required: true })
    password: string;

    @prop({ default: () => verifyCode() })
    verificationCode: number;

    @prop({ default: false })
    verified: boolean;

    @prop()
    passwordResetCode: string | null;

    @prop({ default: null })
    profilePicture: string | null;

    @prop({ default: [] })
    archivedChats: string[];

    @prop({ default: [] })
    blockedUsers: string[];

    @prop({ default: [] })
    mutedUsers: string[];

    @prop({ default: [] })
    groups: string[];

    @prop({ default: Date.now })
    createdAt: Date;

    async validatePassword(this: DocumentType<User>, password: string) {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (err) {
            return false;
        }
    }
}

const UserModel = getModelForClass(User);

export default UserModel;