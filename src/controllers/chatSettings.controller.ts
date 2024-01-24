import { Request, Response } from 'express';
import { setChatInfoInput } from '../schemas/chatSettings.schema';
import { updateUser } from '../services/chatSettings.service';

export const setChatInfoHandler = async (req: Request<setChatInfoInput["params"], {}, setChatInfoInput["body"]>, res: Response) => {
  const { userId } = req.params;
  const { control, set } = req.body;
  const { _id: from } = res.locals.user;
  const isUpdated = await updateUser(from, control, set, userId);
  if (!isUpdated?.acknowledged) return res.status(400).send();
  return res.status(204).send();
};