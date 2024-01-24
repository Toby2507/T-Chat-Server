import { DocumentType } from "@typegoose/typegoose";
import { omit } from "lodash";
import SessionModel from "../models/session.model";
import { User, privateFields } from "../models/user.model";
import { signJWT } from "../utils/jwt";

export const createSession = async (user: string) => {
    return SessionModel.create({ user });
};

export const signAccessToken = (user: DocumentType<User>) => {
    const payload = omit(user.toJSON(), privateFields);
    const accessToken = signJWT(payload, 'accessTokenPrivateKey', { expiresIn: '15m' });
    return accessToken;
};

export const signRefreshToken = async (user: string) => {
    const session = await createSession(user);
    const refreshToken = signJWT({ sessionId: session._id, user }, 'refreshTokenPrivateKey', { expiresIn: '1d' });
    return refreshToken;
};

export const findSessionById = (id: string) => {
    return SessionModel.findById(id);
};