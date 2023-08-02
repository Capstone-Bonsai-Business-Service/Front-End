import { FormOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Checkbox, Col, Divider, Modal, Row, Table, Tabs, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { ManagerServices } from "../manager.service";
import { take } from "rxjs";
import { IUser } from "../../../IApp.interface";
import { CommonUtility } from "../../utils/utilities";
import { OrderStatusMapping } from "../../common/object-interfaces/order.interface";
import { UserPicker } from "../../common/components/user-picker-component";
import { toast } from "react-hot-toast";
import TextArea from "antd/es/input/TextArea";
import { cloneDeep } from "lodash";


interface IOrderManagementProps {
    roleID: string;
}

interface IOrderTabProps extends IOrderManagementProps {
    orderStatus: string;
}

export const OrderManagementComponent: React.FC<IOrderManagementProps> = (props) => {
    const [tabKey, setTabKey] = useState<string>('waiting')
    return (
        <div style={{ height: 'calc(100vh - 100px)', width: 'calc(100% - 80px)', marginLeft: 20 }}>
            <Tabs
                style={{ marginBottom: 0 }}
                defaultActiveKey='waiting'
                type='card'
                onChange={(key) => {
                    setTabKey(key);
                }}
                items={[
                    {
                        label: 'Đơn mới',
                        key: 'waiting',
                        children: tabKey === 'waiting' ? <OrderTabComponent orderStatus='WAITING' roleID={props.roleID} /> : <></>,
                    },
                    {
                        label: 'Đã duyệt',
                        key: 'approved',
                        children: tabKey === 'approved' ? <OrderTabComponent orderStatus='APPROVED' roleID={props.roleID} /> : <></>,
                    },
                    {
                        label: 'Đang chuẩn bị',
                        key: 'packaging',
                        children: tabKey === 'packaging' ? <OrderTabComponent orderStatus='PACKAGING' roleID={props.roleID} /> : <></>,
                    },
                    {
                        label: 'Đã từ chối',
                        key: 'denied',
                        children: tabKey === 'denied' ? <OrderTabComponent orderStatus='DENIED' roleID={props.roleID} /> : <></>,
                    },
                    {
                        label: 'Đang giao',
                        key: 'delivering',
                        children: tabKey === 'delivering' ? <OrderTabComponent orderStatus='DELIVERING' roleID={props.roleID} /> : <></>,
                    },
                    {
                        label: 'Đã giao',
                        key: 'received',
                        children: tabKey === 'received' ? <OrderTabComponent orderStatus='RECEIVED' roleID={props.roleID} /> : <></>,
                    },
                    {
                        label: 'Đã huỷ',
                        key: 'reject',
                        children: tabKey === 'reject' ? <OrderTabComponent orderStatus='STAFFCANCELED' roleID={props.roleID} /> : <></>,
                    },
                    {
                        label: 'Bị huỷ',
                        key: 'cancel',
                        children: tabKey === 'cancel' ? <OrderTabComponent orderStatus='CUSTOMERCANCELED' roleID={props.roleID} /> : <></>,
                    },
                ]}
            />
        </div>
    )

}

export const OrderTabComponent: React.FC<IOrderTabProps> = (props) => {

    const managerServices = new ManagerServices();

    const [orders, setOrder] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [orderOnSearch, setOrderOnSearch] = useState<any[]>([]);
    const [orderDetail, setOrderDetail] = useState<any>(null);
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [staffList, setStaffList] = useState<any[]>([]);
    const [staffForOrder, setStaffForOrder] = useState<number | null>(null);
    const [reasonReject, setReasonReject] = useState<string>('');
    const [isShowPopupReason, setShowPopupReason] = useState<boolean>(false);
    const [isProcess, setIsProcess] = useState<boolean>(false);

    useEffect(() => {
        if (!isFirstInit) {
            loadData()
        }
    });

    function loadData() {
        setDataReady(false);
        managerServices.getStoreOrders$().pipe(take(1)).subscribe({
            next: data => {
                const result = data.reduce((acc: any[], cur: any) => {
                    if (cur.progressStatus === props.orderStatus) {
                        acc.push(cur);
                    }
                    return acc;
                }, []);
                setOrder(result);
                setOrderOnSearch(result);
                setDataReady(true);
                if (!isFirstInit) {
                    setFirstInit(true);
                    getListStaff();
                }
            }
        })
    }

    function getListStaff() {
        managerServices.getStaffForContract$().pipe(take(1)).subscribe({
            next: (value) => {
                const staffListOption = value.reduce((acc, cur) => {
                    acc.push({
                        value: cur.staffID,
                        label: cur.staffName
                    })
                    return acc;
                }, [] as any)
                setStaffList(staffListOption);
            }
        })

    }

    const tableUserColumns: ColumnsType<IUser> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
        },
        {
            title: `Tên khách hàng`,
            dataIndex: 'fullName',
            key: 'fullName',
            showSorterTooltip: false,
            ellipsis: true,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            showSorterTooltip: false,
            ellipsis: true,
            width: 100,
        },
        {
            title: 'Tổng thanh toán',
            dataIndex: 'total',
            key: 'total',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
            render: (value) => {
                return <NumericFormat displayType="text" value={value} thousandSeparator=" " suffix=" vnđ" />
            }
        },
        {
            title: 'Hình thức thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
        },
        {
            title: '',
            dataIndex: 'command',
            align: 'center',
            width: 100,
            key: 'command',
            showSorterTooltip: false,
            ellipsis: true,
            render: (_, record, __) => {
                return <div>
                    <Button className='__app-command-button' onClick={(e) => {
                        e.preventDefault();
                        setOrderDetail(record);
                        setFormMode('edit');
                    }}>Chi tiết</Button>
                </div>
            },
        }
    ]

    return (
        <>
            {
                formMode === 'display' ?
                    <>
                        <div className='__app-toolbar-container' style={{ width: '100%', padding: '8px 24px' }}>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(orders, tableUserColumns);
                                }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    loadData()
                                }}>Tải Lại</Button>
                            </div>
                            <div className='__app-toolbar-right-buttons'>
                                <Search
                                    style={{ marginLeft: 10 }}
                                    className='__app-search-box'
                                    placeholder="ID, Tên KH, SĐT"
                                    onSearch={(value) => {
                                        const columnsSearch = ['id', 'fullName', 'phone']
                                        const data = CommonUtility.onTableSearch(value, orders, columnsSearch);
                                        setOrderOnSearch(data);
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ width: '94%' }}>
                            <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
                        </div>
                        <div className='__app-layout-container' style={{ width: '100%', height: 'calc(100vh - 220px)', padding: '8px 24px' }}>
                            <Table
                                loading={!isDataReady}
                                tableLayout='auto'
                                columns={tableUserColumns}
                                className='__app-user-info-table'
                                size='middle'
                                dataSource={orderOnSearch}
                                pagination={{
                                    pageSize: 7,
                                    total: orderOnSearch.length,
                                    showTotal: (total, range) => {
                                        return <span>{total} items</span>
                                    }
                                }}
                            ></Table>
                        </div>
                    </>
                    : <></>
            }
            {
                formMode === 'edit' ?
                    <div className="__app-layout-container form-edit" style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
                        <div className="__app-top-action">
                            <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                                setFormMode('display');
                                setOrderDetail(null);
                                // setImageScanUrls([]);
                            }} />
                            <div className="__app-title-form">CHI TIẾT ĐƠN HÀNG</div>
                        </div>
                        <div className="__app-content-container">
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                <Col span={18} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 4, backgroundColor: '#f0f0f0' }}>
                                    <Row>
                                        <Col span={12}>
                                            <Row>
                                                <Col span={8} style={{ fontWeight: 500 }}>
                                                    Mã đơn hàng:
                                                </Col>
                                                <Col span={16} style={{ fontWeight: 500 }}>{orderDetail?.id}</Col>
                                            </Row>
                                        </Col>
                                        <Col span={12}>
                                            <Row>
                                                <Col span={1}></Col>
                                                <Col span={7} style={{ fontWeight: 500 }}>Trạng thái:</Col>
                                                <Col span={16}>
                                                    <Tag color={CommonUtility.statusColorMapping(orderDetail?.progressStatus)} >
                                                        {OrderStatusMapping[orderDetail?.progressStatus]}
                                                    </Tag>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12}>
                                            <Row>
                                                <Col span={8} style={{ fontWeight: 500 }}>
                                                    Khách hàng:
                                                </Col>
                                                <Col span={16} >{orderDetail?.fullName}</Col>
                                            </Row>
                                        </Col>
                                        <Col span={12}>
                                            <Row>
                                                <Col span={1}></Col>
                                                <Col span={7} style={{ fontWeight: 500 }}>Số điện thoại:</Col>
                                                <Col span={16}>
                                                    {orderDetail?.phone}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={4} style={{ fontWeight: 500 }}>
                                            Địa chỉ giao:
                                        </Col>
                                        <Col span={18}>
                                            {orderDetail?.address}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col style={{ fontWeight: 500 }}>Đơn hàng:</Col>
                                    </Row>
                                    <Row>
                                        <Col span={1}></Col>
                                        <Col span={2} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>STT</Col>
                                        <Col span={6} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>Tên cây</Col>
                                        <Col span={4} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>Số lượng</Col>
                                        <Col span={4} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>Đơn giá</Col>
                                        <Col span={4} style={{ textAlign: 'center' }}>Thành tiền</Col>
                                        <Col span={1}></Col>
                                    </Row>
                                    <Divider className="__app-divider-no-margin" />
                                    {
                                        renderBillOrder()
                                    }
                                    <Row>
                                        <Col span={1}></Col>
                                        <Col span={2} style={{ textAlign: 'center' }}>Phí ship:</Col>
                                        <Col span={14}></Col>
                                        <Col span={4} style={{ textAlign: 'center' }}>
                                            <NumericFormat displayType="text" thousandSeparator=" " suffix=" vnđ" value={orderDetail?.totalShipCost + (orderDetail?.distance * orderDetail?.showDistancePriceModel?.pricePerKm)} />
                                        </Col>
                                        <Col span={1}></Col>
                                    </Row>
                                    <Divider className="__app-divider-no-margin" />
                                    <Row>
                                        <Col span={1}></Col>
                                        <Col span={2} style={{ textAlign: 'center', fontWeight: 500 }}>Tổng:</Col>
                                        <Col span={14}></Col>
                                        <Col span={4} style={{ textAlign: 'center', fontWeight: 500 }}>
                                            <NumericFormat displayType="text" thousandSeparator=" " suffix=" vnđ" value={orderDetail?.total} />
                                        </Col>
                                        <Col span={1}></Col>
                                    </Row>
                                    <Row></Row>
                                    <Row>
                                        <Col span={6} style={{ fontWeight: 500 }}>
                                            Nhân viên tiếp nhận:
                                        </Col>
                                        <Col span={16}>
                                            {
                                                orderDetail?.progressStatus === 'WAITING' ?
                                                    <UserPicker
                                                        listUser={staffList}
                                                        onChanged={(value) => {
                                                            setStaffForOrder(value);
                                                        }}
                                                    />
                                                    : orderDetail?.showStaffModel?.fullName ?? '--'
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={6} style={{ fontWeight: 500 }}>
                                            Hình thức thanh toán:
                                        </Col>
                                        <Col span={16}>
                                            {orderDetail?.paymentMethod ?? '--'}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={6} style={{ fontWeight: 500 }}>
                                            Đã Thanh Toán:
                                        </Col>
                                        <Col span={16}>
                                            <span>
                                                <Tag color={orderDetail?.isPaid ? 'lime' : 'red'}>{orderDetail?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>
                                            </span>
                                            {
                                                orderDetail?.isPaid === false ? 
                                                <Button size="middle" type="link" onClick={() => {
                                                    setIsProcess(true);
                                                    managerServices.confirmPaymentOrder$(orderDetail?.id).pipe(take(1)).subscribe({
                                                        next: (value) => {
                                                            if (value) {
                                                                toast.success('Cập nhật thành công.');
                                                                setIsProcess(false);
                                                                const data = cloneDeep(orderDetail);
                                                                data['isPaid'] = true;
                                                                setOrderDetail(data);
                                                            } else {
                                                                toast.error('Không thể xác nhận. Vui lòng thử lại');
                                                            }
                                                        }
                                                    })
                                                }}>Xác nhận thanh toán</Button> : <></>
                                            }
                                        </Col>
                                    </Row>
                                    {
                                        orderDetail?.receiptIMG ?
                                            <Row>
                                                <Col span={6} style={{ fontWeight: 500 }}>
                                                    Ảnh hoá đơn:
                                                </Col>
                                                <Col span={16}>
                                                    <img src={orderDetail.receiptIMG} alt="" style={{ width: 100, cursor: 'pointer' }} onClick={() => {
                                                        window.open(orderDetail.receiptIMG);
                                                    }} />
                                                </Col>
                                            </Row>
                                            : <></>
                                    }
                                </Col>
                            </div>
                            {
                                orderDetail?.progressStatus === 'WAITING' ?
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                        <Col span={18} style={{ padding: '24px 0', display: 'flex', flexDirection: 'row-reverse', gap: 8 }}>
                                            <Button type="primary" onClick={() => {
                                                managerServices.approveOrder$(orderDetail?.id, staffForOrder ?? 0).pipe(take(1)).subscribe({
                                                    next: (res) => {
                                                        if (res) {
                                                            setFormMode('display');
                                                            setOrderDetail(null);
                                                            loadData();
                                                            toast.success('Duyệt đơn hàng thành công.');
                                                        } else {
                                                            toast.success('Không thể duyệt đơn hàng.')
                                                        }
                                                    }
                                                })
                                            }}>Duyệt</Button>
                                            <Button type="default" onClick={() => {
                                                setShowPopupReason(true);
                                            }}>Từ chối</Button>
                                        </Col>
                                    </div>
                                    : <></>
                            }
                        </div >
                        {
                            isShowPopupReason ?
                                <Modal
                                    width={600}
                                    open={true}
                                    closable={false}
                                    title={(
                                        <span className='__app-dialog-title'>
                                            TỪ CHỐI ĐƠN HÀNG
                                        </span>
                                    )}
                                    footer={[
                                        <Button key='cancel' onClick={() => {
                                            setShowPopupReason(false)
                                        }}>Đóng</Button>,
                                        <Button key='save' type='primary' style={{ backgroundColor: '#8E0000' }} onClick={() => {
                                            managerServices.rejectOrder$(orderDetail?.id, reasonReject).pipe(take(1)).subscribe({
                                                next: (res) => {
                                                    if (res) {
                                                        setFormMode('display');
                                                        setOrderDetail(null);
                                                        loadData();
                                                        setShowPopupReason(false)
                                                        toast.success('Từ chối đơn hàng thành công.');
                                                    } else {
                                                        toast.success('Không thể từ chối đơn hàng.')
                                                    }
                                                }
                                            })
                                        }}>Từ chối</Button>
                                    ]}
                                >
                                    <Row style={{ padding: 16 }}>
                                        <Col span={4} style={{ fontWeight: 500 }}>Lý do:</Col>
                                        <Col span={18}>
                                            <TextArea
                                                rows={3}
                                                onChange={(args) => {
                                                    setReasonReject(args.target.value);
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </Modal>
                                : <></>
                        }


                    </div >
                    : <></>
            }
        </>

    )

    function renderBillOrder() {
        if (orderDetail && orderDetail.showPlantModel.length > 0) {
            const elem = orderDetail.showPlantModel.reduce((acc: any[], cur: any, index: number) => {
                acc.push(
                    <Row key={`bill_item_${index}`}>
                        <Col span={1}></Col>
                        <Col span={2} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>{index + 1}</Col>
                        <Col span={6} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>{cur.plantName}</Col>
                        <Col span={4} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>
                            {cur.quantity}
                        </Col>
                        <Col span={4} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>
                            <NumericFormat displayType="text" thousandSeparator=" " suffix=" vnđ" value={(cur.plantPrice ?? 0)} />
                        </Col>
                        <Col span={4} style={{ textAlign: 'center' }}>
                            <NumericFormat displayType="text" thousandSeparator=" " suffix=" vnđ" value={(cur.quantity ?? 0) * (cur.plantPrice ?? 0)} />
                        </Col>
                        <Col span={1}></Col>
                    </Row>
                )
                return acc;
            }, []);
            return elem;
        } else {
            return (
                <Row key={`bill_item_${1}`}>
                    <Col span={1}></Col>
                    <Col span={2} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>--</Col>
                    <Col span={6} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>--</Col>
                    <Col span={4} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>--</Col>
                    <Col span={4} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>--</Col>
                    <Col span={4} style={{ textAlign: 'left' }}>--</Col>
                    <Col span={1}></Col>
                </Row>
            )
        }
    }
}