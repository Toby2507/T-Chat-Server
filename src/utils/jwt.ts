import config from "config";
import { sign, SignOptions, verify } from "jsonwebtoken";

export const signJWT = (
    payload: Object,
    keyName: 'accessTokenPrivateKey' | 'refreshTokenPrivateKey',
    options?: SignOptions | undefined
) => {
    const key = Buffer.from(config.get<string>(keyName), "base64");
    return sign(payload, key, { ...(options && options), algorithm: 'RS256' });
}

export const verifyJWT = <T>(token: string, keyName: 'accessTokenPublicKey' | 'refreshTokenPublicKey') => {
    const key = Buffer.from(config.get<string>(keyName), "base64");
    try {
        const decoded = verify(token, key) as T;
        return decoded;
    } catch (err) { return null }
}