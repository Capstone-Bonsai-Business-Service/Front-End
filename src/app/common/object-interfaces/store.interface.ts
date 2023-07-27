export interface IStore {
    [k: string]: any;
    id: string;
    storeName: string;
    address: string;
    phone: string;
    status: string;
    district: string;
    managerID: number;
    managerName: string;
}

export type StoreStatus = 'ACTIVE';

export enum StoreStatusMapping {
    'ACTIVE' = 'Đang hoạt động',
    'INACTIVE' = 'Dừng hoạt động'
}