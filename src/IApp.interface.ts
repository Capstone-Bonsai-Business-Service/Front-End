import { NoticeType } from "antd/es/message/interface";

export interface IUser {
    [k: string]: any;
    userID: number;
    username: string;
    password?: string;
    fullName: string;
    token: string;
    phone: string;
    roleID: string;
    roleName: RoleName;
    avatar?: string;
    address?: string;
    gender: boolean;
    status: string;
    storeID: string;
    storeName: string;
}

export type IMessage = (type: NoticeType, message: string, duration?: number, key?: string) => void;

export type RoleName = 'Admin' | 'Owner' | 'Manager' | 'Staff' | 'Customer';