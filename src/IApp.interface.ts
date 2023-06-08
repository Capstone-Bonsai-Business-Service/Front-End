import { NoticeType } from "antd/es/message/interface";

export interface IUser {
    username: string;
    password: string;
    fullName: string;
    token: string;
    phone: string;
    role: string;
    avatar?: string;
}

export type IMessage = (type: NoticeType, message: string, duration?: number, key?: string) => void;