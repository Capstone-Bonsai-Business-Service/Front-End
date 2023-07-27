

export interface IContract {
    id: string,
    title: string,
    fullName: string,
    email: string,
    phone: string,
    address: string,
    paymentMethod: string,
    reason: string,
    createdDate: string,
    startedDate: string,
    endedDate: string,
    approvedDate: string,
    rejectedDate: string,
    deposit: number,
    total: number,
    isFeedback: boolean,
    isSigned: boolean,
    storeID: string,
    storeName: string,
    staffID: number,
    staffName: string,
    customerID: number,
    paymentTypeID: string,
    status: ContractStatus,
    showStaffModel: any;
    imgList: [
        {
            id: string,
            imgUrl: string
        }
    ],
    totalPage: number,

}

export interface IContractDetail {
    [k: string]: any;
    id: string;
    showContractModel?: IContract;
    note: string;
    showServiceTypeModel?: {
        "id": string,
        "typeName": string,
        "typePercentage": number,
        "typeSize": string,
        "typeApplyDate": string
    };
    showServiceModel?: {
        "id": string,
        "name": string,
        "description": string,
        "price": number
    };
    showServicePackModel?: {
        "id": string,
        "packRange": string,
        "packPercentage": number,
        "packApplyDate": string
      };
    workingDateList?: any[];
    totalPrice?: number;
    endDate?: string;
    startDate?: string;
    timeWorking?: string;
}

export const ContractStatusMapping: {
    [k: string]: string;
} = {
    'WAITING': 'Đang chờ duyệt',
    'APPROVE': 'Đã duyệt',
    'DENIED': 'Đã từ chối',
    'STAFFCANCELED': 'Đã từ chối',
    'CUSTOMERCANCELED': 'Đã huỷ',
    'SIGNED': 'Đã ký',
    'WORKING': 'Đang hoạt động',
    'DONE': 'Đã kết thúc'
}

export type ContractStatus = 'WAITING' | 'APPROVE' | 'DENIED' | 'STAFFCANCELED' | 'CUSTOMERCANCELED' | 'SIGNED' | 'WORKING' | 'DONE'