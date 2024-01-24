import { Ref, getModelForClass, index, modelOptions, prop } from "@typegoose/typegoose";
import { User } from "./user.model";

@modelOptions({
    schemaOptions: { timestamps: true }
})
@index({ createdAt: -1 }, { expireAfterSeconds: 86460 })
export class Session {
    @prop({ ref: () => User })
    user: Ref<User>;

    @prop({ default: true })
    valid: boolean;

    public createdAt: Date;
}

const SessionModel = getModelForClass(Session);

export default SessionModel;