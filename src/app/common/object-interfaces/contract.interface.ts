

export interface IContract {
    [k: string]: any;
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
    showPaymentTypeModel: {
        "id": string,
        "name": string,
        "value": number
    }

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
        "packApplyDate": string,
        "packUnit": string;
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
    'APPROVED': 'Đã duyệt',
    'DENIED': 'Đã từ chối',
    'STAFFCANCELED': 'Cửa hàng đã huỷ',
    'CUSTOMERCANCELED': 'Bị huỷ',
    'SIGNED': 'Đã ký',
    'WORKING': 'Đang hoạt động',
    'DONE': 'Đã kết thúc'
}

export type ContractStatus = 'WAITING' | 'APPROVED' | 'DENIED' | 'STAFFCANCELED' | 'CUSTOMERCANCELED' | 'SIGNED' | 'WORKING' | 'DONE'