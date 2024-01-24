require('dotenv').config();
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import { createClient } from "redis";
import { Server, Socket } from "socket.io";
import { allowedOrigins, corsOptions } from "../config/corsOptions";
import { corsCredentials } from "./middlewares/corsCredentials";
import deserializeUser from "./middlewares/deserializeUser";
import errorHandlerMiddleware from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.route";
import settingsRoutes from "./routes/chatSettings.route";
import groupChatRoutes from "./routes/groupChat.route";
import messageRoutes from "./routes/message.route";
import userRoutes from "./routes/user.route";
import connectDB from "./utils/connectDB";
import log from "./utils/logger";

export interface newMessage {
    id: string,
    fromSelf: boolean,
    message: string;
    date: string;
    time: string;
    datetime: number;
    read: boolean;
    readers: string[];
    sender: string;
    isInformational: boolean;
    to?: string;
    from?: string;
}
export interface groupPacket {
    profilePicture: string | null;
    _id: string;
    userName: string;
    description: string;
    messages: string[];
    unread: string[];
    members: string[];
    admins: string[];
    lastUpdated: number;
    isGroup: boolean;
    isArchived: boolean;
    isMuted: boolean;
    to?: string;
    by?: string;
}
export interface userPacket {
    profilePicture: string | null;
    _id: string;
    email: string;
    userName: string;
    groupColor: string;
    messages: { id: string, isInformational: boolean; }[];
    unread: string[];
    blockedUsers?: string[];
    groups: string[];
    blockedMe: boolean;
    lastUpdated: number;
    isGroup: boolean;
    isArchived: boolean;
    isMuted: boolean;
    isBlocked: boolean;
}
interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    new_user_created: (data: userPacket) => void;
    editted_user: (data: Partial<userPacket>) => void;
    receive_msg: (data: newMessage) => void;
    added_to_group: (data: groupPacket) => void;
    removed_from_group: (data: { groupId: string, userId: string, to: string; }) => void;
    deleted_group: (data: Partial<groupPacket>) => void;
    editted_group: (data: Partial<groupPacket>) => void;
    admin_initiated: (data: { groupId: string, userId: string, to: string; }) => void;
    blocked_me: (data: { userId: string, block: boolean; }) => void;
    online_users: (onlineUsers: string[]) => void;
    deleted_account: (userId: string) => void;
}
interface ClientToServerEvents {
    create_new_user: (data: userPacket) => void;
    edit_user: (data: Partial<userPacket>) => void;
    add_user: (userId: string) => void;
    send_msg: (data: newMessage) => void;
    add_to_group: (data: groupPacket) => void;
    remove_from_group: (data: { groupId: string, userId: string, to: string; }) => void;
    delete_group: (data: Partial<groupPacket>) => void;
    edit_group: (data: Partial<groupPacket>) => void;
    admin_init: (data: { groupId: string, userId: string, to: string; }) => void;
    block_user: (data: { userId: string, block: boolean; }) => void;
    delete_account: (userId: string) => void;
}
interface InterServerEvents {
    ping: () => void;
}
interface SocketData {
    name: string,
    age: number;
}
declare global {
    var onlineUsers: Map<string, string>;
    var chatSocket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    var currentUser: string;
}


const port = process.env.PORT;

const app = express();
connectDB();
export const client = createClient({ url: process.env.REDIS_URL });

// Middlewares
app.use(helmet());
app.use(corsCredentials);
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(cookieParser());
app.use(deserializeUser);

// Router
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/message', messageRoutes);
app.use('/api/v1/chatsettings', settingsRoutes);
app.use('/api/v1/groupchat', groupChatRoutes);

app.use(errorHandlerMiddleware);

global.onlineUsers = new Map<string, string>();
mongoose.connection.once('open', () => {
    (async () => {
        try {
            await client.connect();
        } catch (err: any) {
            log.error(err);
        }
    })();
    const server = app.listen(port, () => log.info(`Server Listening on Port ${port}...`));
    const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    });
    io.on('connection', socket => {
        global.chatSocket = socket;
        socket.on('create_new_user', async data => {
            socket.broadcast.emit('new_user_created', data);
        });
        socket.on('add_user', async userId => {
            global.currentUser = userId;
            onlineUsers.set(userId, socket.id);
            socket.broadcast.emit('online_users', [...onlineUsers.keys()]);
            io.to(socket.id).emit('online_users', [...onlineUsers.keys()]);
        });
        socket.on('send_msg', async data => {
            const sendUserSocket = onlineUsers.get(data.to as string);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit('receive_msg', data);
            }
        });
        socket.on('add_to_group', async data => {
            const sendUserSocket = onlineUsers.get(data.to as string);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit('added_to_group', data);
            }
        });
        socket.on('remove_from_group', async data => {
            const sendUserSocket = onlineUsers.get(data.to);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit('removed_from_group', data);
            }
        });
        socket.on('delete_group', async data => {
            const sendUserSocket = onlineUsers.get(data.to as string);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit('deleted_group', data);
            }
        });
        socket.on('edit_group', async data => {
            const sendUserSocket = onlineUsers.get(data.to as string);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit('editted_group', data);
            }
        });
        socket.on('edit_user', async data => {
            socket.broadcast.emit('editted_user', data);
        });
        socket.on('admin_init', async data => {
            const sendUserSocket = onlineUsers.get(data.to as string);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit('admin_initiated', data);
            }
        });
        socket.on('block_user', async data => {
            const sendUserSocket = onlineUsers.get(data.userId);
            if (sendUserSocket) { socket.to(sendUserSocket).emit('blocked_me', data); }
        });
        socket.on('delete_account', async userId => {
            socket.broadcast.emit('deleted_account', userId);
        });
        socket.on('disconnect', () => {
            onlineUsers.forEach((value, key) => {
                if (value === socket.id) {
                    onlineUsers.delete(key);
                    client.del(`user-${key}`);
                    socket.broadcast.emit('online_users', [...onlineUsers.keys()]);
                }
            });
        });
    });
});