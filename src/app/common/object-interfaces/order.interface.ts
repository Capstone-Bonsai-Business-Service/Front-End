

export const OrderStatusMapping: {
    [k: string]: string;
} = {
    'WAITING': 'Đang chờ duyệt',
    'APPROVE': 'Đã duyệt',
    'DENIED': 'Đã từ chối',
    'STAFFCANCELED': 'Đã từ chối',
    'CUSTOMERCANCELED': 'Đã huỷ',
    'DONE': 'Đã kết thúc'
}