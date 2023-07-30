

export const OrderStatusMapping: {
    [k: string]: string;
} = {
    'WAITING': 'Đang chờ duyệt',
    'APPROVE': 'Đã duyệt',
    'DENIED': 'Đã từ chối',
    'PACKAGING': 'Đang đóng gói',
    'DELIVERING': 'Đang giao',
    'RECEIVED': 'Đã nhận hàng',
    'STAFFCANCELED': 'Đã từ chối',
    'CUSTOMERCANCELED': 'Đã huỷ',
}