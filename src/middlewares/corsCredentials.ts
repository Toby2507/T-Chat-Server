import { NextFunction, Request, Response } from "express";
import { allowedOrigins } from "../../config/corsOptions";

export const corsCredentials = (req: Request, res: Response, next: NextFunction) => {
    const origin = req?.headers?.origin;
    if (allowedOrigins.includes(String(origin))) {
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
};