import { NextFunction, Request, Response } from "express";

export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  let customError = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Something went wrong. Please try again later'
  };
  if (err.code && err.code === 11000) { customError.message = 'User already exists'; customError.statusCode = 409; }
  return res.status(customError.statusCode).json({ message: customError.message });
};

export default errorHandlerMiddleware;