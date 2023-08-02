

export const OrderStatusMapping: {
    [k: string]: string;
} = {
    'WAITING': 'Đơn mới',
    'APPROVED': 'Đã duyệt',
    'DENIED': 'Đã từ chối',
    'PACKAGING': 'Đang đóng gói',
    'DELIVERING': 'Đang giao',
    'RECEIVED': 'Đã giao',
    'STAFFCANCELED': 'Đã từ chối',
    'CUSTOMERCANCELED': 'Đã huỷ',
}