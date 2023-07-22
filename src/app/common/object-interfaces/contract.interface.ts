

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
    status: string,
    imgList: [
        {
            id: string,
            imgUrl: string
        }
    ],
    totalPage: number
}