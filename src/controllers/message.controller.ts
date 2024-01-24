import { Request, Response } from 'express';
import { client, newMessage } from '../app';
import { addMessageInput, clearChatInput, getMessagesInput, readUserMessagesInput } from '../schemas/message.schema';
import { addMessage, deleteMessages, formatMessage, getChatMessages, readUserMessages } from '../services/message.service';

export const addMessageHandler = async (req: Request<{}, {}, addMessageInput>, res: Response) => {
  const { message, to, members, isInformational } = req.body;
  const { _id: from } = res.locals.user;
  const msg = await addMessage(message, to, from, isInformational);
  const newMsg = formatMessage(msg, from);
  const myOldMessages = await client.hGet(`user-${from}`, `messages-${to}`);
  if (myOldMessages) {
    const myParsedMessages = myOldMessages && JSON.parse(myOldMessages);
    myParsedMessages.push(newMsg);
    client.hSet(`user-${from}`, `messages-${to}`, JSON.stringify(myParsedMessages));
    if (members) {
      let memberMessages = members.map(async member => await client.hGet(`user-${member}`, `messages-${to}`));
      const finalMemberMessages = await Promise.all(memberMessages);
      const memberParsedMessages = finalMemberMessages.map(msg => msg && JSON.parse(msg));
      memberParsedMessages.forEach((msg, index) => {
        if (msg) {
          msg.push({ ...newMsg, fromSelf: false });
          client.hSet(`user-${members[index]}`, `messages-${to}`, JSON.stringify(msg));
        }
      });
    } else {
      const yourOldMessages = await client.hGet(`user-${to}`, `messages-${from}`);
      if (yourOldMessages) {
        const yourParsedMessages = JSON.parse(yourOldMessages);
        yourParsedMessages.push({ ...newMsg, fromSelf: false });
        client.hSet(`user-${to}`, `messages-${from}`, JSON.stringify(yourParsedMessages));
      }
    }
  } else {
    client.hSet(`user-${from}`, `messages-${to}`, JSON.stringify([newMsg]));
  }
  return res.status(201).json(newMsg);
};

export const getMessagesHandler = async (req: Request<getMessagesInput["params"], {}, getMessagesInput["body"]>, res: Response) => {
  const { to } = req.params;
  const { isGroup } = req.body;
  const { _id: from } = res.locals.user;
  const cachedMessages = await client.hGet(`user-${from}`, `messages-${to}`);
  if (cachedMessages) return res.json(JSON.parse(cachedMessages));
  const chatMessages = await getChatMessages(from, to, isGroup);
  const messages = chatMessages.map(msg => formatMessage(msg, from));
  client.hSet(`user-${from}`, `messages-${to}`, JSON.stringify(messages));
  return res.json(messages);
};

export const readUserMessagesHandler = async (req: Request<{}, {}, readUserMessagesInput>, res: Response) => {
  const { messages, to } = req.body;
  const { _id: from } = res.locals.user;
  const isUpdated = await readUserMessages(messages, from);
  if (!isUpdated.acknowledged) return res.status(401).send();
  const oldMessages = await client.hGet(`user-${from}`, `messages-${to}`);
  const parsedMessages = oldMessages && JSON.parse(oldMessages);
  const updatedMessages = parsedMessages.map((msg: newMessage) => {
    if (messages.includes(msg.id)) {
      msg.read = true;
      !msg.readers.includes(from) && msg.readers.push(from);
    }
    return msg;
  });
  client.hSet(`user-${from}`, `messages-${to}`, JSON.stringify(updatedMessages));
  return res.status(204).send();
};

export const clearChatHandler = async (req: Request<{}, {}, clearChatInput>, res: Response) => {
  const { messageIds, to } = req.body;
  const { _id: from } = res.locals.user;
  const isDeleted = await deleteMessages(messageIds);
  if (!isDeleted.acknowledged) return res.status(401).send();
  await client.hDel(`user-${from}`, `messages-${to}`);
  return res.status(204).send();
};