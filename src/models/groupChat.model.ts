import { Severity, getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: { timestamps: true },
  options: { allowMixed: Severity.ALLOW }
})
export class GroupChat {
  @prop({ required: true })
  userName: string;

  @prop({ default: "" })
  description: string;

  @prop({ required: true })
  members: string[];

  @prop({ default: [] })
  admins: string[];

  @prop({ default: null })
  profilePicture: string | null;
}

const GroupChatModel = getModelForClass(GroupChat);
export default GroupChatModel;