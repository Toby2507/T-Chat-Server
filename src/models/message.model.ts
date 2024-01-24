import { Ref, Severity, getModelForClass, index, modelOptions, prop } from "@typegoose/typegoose";
import { ObjectId } from "mongoose";
import { User } from "./user.model";

@modelOptions({
  schemaOptions: { timestamps: true },
  options: { allowMixed: Severity.ALLOW }
})
@index({ users: 1 })
export class Message {
  @prop({ ref: () => "User", required: true })
  sender: Ref<User>;

  @prop({ required: true })
  message: string;

  @prop({ required: true })
  users: string[];

  @prop({ default: false })
  read: boolean;

  @prop({ default: [] })
  readers: string[];

  @prop({ default: false })
  isInformational: boolean;

  createdAt: Date;
  updatedAt: Date;
  _id: ObjectId;
}

const MessageModel = getModelForClass(Message);
export default MessageModel;