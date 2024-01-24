import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import { ErrorMessageOptions } from "zod-error";
import { generateError } from "zod-error/lib/functions";
import { CustomError } from "./errorHandler";

const validateSchema = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch (err: any) {
        const options: ErrorMessageOptions = {
            delimiter: { error: ',' },
            path: { enabled: false },
            message: { enabled: true, label: '' },
            code: { enabled: false },
        };
        const zodError = generateError(err, options);
        const error = new CustomError(zodError.message, 400);
        throw error;
    }
};

export default validateSchema;