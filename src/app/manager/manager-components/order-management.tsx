import { FormOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Table, Tag } from "antd";
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


interface IOrderManagementProps {
    roleID: string;
}

export const OrderManagementComponent: React.FC<IOrderManagementProps> = (props) => {

    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const managerServices = new ManagerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [orders, setOrder] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [orderOnSearch, setOrderOnSearch] = useState<any[]>([]);

    useEffect(() => {
        if (!isFirstInit) {
            managerServices.getStoreOrders$().pipe(take(1)).subscribe({
                next: data => {
                    setOrder(data);
                    setOrderOnSearch(data);
                    setFirstInit(true);
                    setDataReady(true);
                }
            })
        }
    }, [isFirstInit, orders, managerServices]);

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
            title: 'Trạng thái',
            dataIndex: 'progressStatus',
            key: 'progressStatus',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value) => {
                return <Tag color={CommonUtility.statusColorMapping(value)}>{OrderStatusMapping[value]}</Tag>
            },
            width: 200,
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
                        //openDetailUser(record.Id);
                    }} icon={<FormOutlined />} />
                </div>
            },
        }
    ]

    return (
        <>
            <div className='__app-toolbar-container'>
                <div className='__app-toolbar-left-buttons'>
                    <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                        CommonUtility.exportExcel(orders, tableUserColumns);
                    }}>Xuất Tệp Excel</Button>
                    <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                        setDataReady(false);
                        managerServices.getStoreOrders$().pipe(take(1)).subscribe({
                            next: data => {
                                setOrder(data);
                                setOrderOnSearch(data);
                                setDataReady(true);
                            }
                        })
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
            <div className='__app-layout-container'>
                <Table
                    loading={!isDataReady}
                    tableLayout='auto'
                    columns={tableUserColumns}
                    className='__app-user-info-table'
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
    )
}