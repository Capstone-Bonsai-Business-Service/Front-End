import { ReloadOutlined } from "@ant-design/icons";
import { Button, Divider, Table, Tabs, Modal, Row, Col } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { ManagerServices } from "../manager.service";
import { take } from "rxjs";
import { CommonUtility } from "../../utils/utilities";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { PatternFormat } from "react-number-format";


interface ITransactionManagementProps {
}

interface ITransactionTabProps {
}

export const TransactionManagementComponent: React.FC<ITransactionManagementProps> = (props) => {
    const [tabKey, setTabKey] = useState<string>('new')
    return (
        // <div style={{ height: 'calc(100vh - 100px)', width: 'calc(100% - 80px)', marginLeft: 20 }}>
        //     <Tabs
        //         className="__app-tabs-custom"
        //         style={{ marginBottom: 0 }}
        //         defaultActiveKey='new'
        //         type='card'
        //         onChange={(key) => {
        //             setTabKey(key);
        //         }}
        //         items={[
        //             {
        //                 label: 'Báo cáo mới',
        //                 key: 'new',
        //                 children: tabKey === 'new' ? <TransactionTabComponent status='NEW' /> : <></>,
        //             },
        //             {
        //                 label: 'Báo cáo đã duyệt',
        //                 key: 'approved',
        //                 children: tabKey === 'approved' ? <TransactionTabComponent status='APPROVED' /> : <></>,
        //             },
        //             {
        //                 label: 'Báo cáo không hợp lệ',
        //                 key: 'rejected',
        //                 children: tabKey === 'rejected' ? <TransactionTabComponent status='DENIED' /> : <></>,
        //             },
        //         ]}
        //     />
        // </div>
        <TransactionTabComponent></TransactionTabComponent>
    )

}

export const TransactionTabComponent: React.FC<ITransactionTabProps> = (props) => {

    const managerServices = new ManagerServices();

    const [transactions, setTransaction] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [transactionOnSearch, setTransactionOnSearch] = useState<any[]>([]);
    const [transactionDetail, setTransactionDetail] = useState<{
        isShow: boolean,
        transaction: any
    }>({
        isShow: false,
        transaction: null
    });
    const [popUpConfirm, setPopUpConfirm] = useState<{
        isShow: boolean,
        plantCateogryID: string,
        message: string,
        action: string
    }>({
        isShow: false,
        plantCateogryID: '',
        message: '',
        action: ''
    });

    useEffect(() => {
        if (!isFirstInit) {
            loadData()
        }
    });

    function loadData() {
        setDataReady(false);
        const request$ = managerServices.getTransactions$();
        request$.pipe(take(1)).pipe(take(1)).subscribe({
            next: data => {
                setTransaction(data);
                setTransactionOnSearch(data);
                setDataReady(true);
                if (!isFirstInit) {
                    setFirstInit(true);
                }
            }
        })
    }

    const tableUserColumns: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            showSorterTooltip: false,
            ellipsis: true,
            width: 100,
        },
        {
            title: `Tên khách hàng`,
            dataIndex: 'fullName',
            key: 'fullName',
            showSorterTooltip: false,
            ellipsis: true,
            width: 240,
        },
        {
            title: 'Nội dung',
            dataIndex: 'description',
            key: 'description',
            showSorterTooltip: false,
            ellipsis: true,
        },
        {
            title: 'Ngày Transaction',
            dataIndex: 'createdDate',
            key: 'createdDate',
            showSorterTooltip: false,
            ellipsis: true,
            width: 150,
            render: (value) => {
                return <span>{DateTime.fromISO(value).setLocale('vi').toRelativeCalendar()}</span>
            }
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
                        setTransactionDetail({
                            isShow: true,
                            transaction: record
                        });
                    }}>Chi tiết</Button>
                </div>
            },
        }
    ]

    return (
        <>
            <div className='__app-toolbar-container' style={{ padding: '8px 24px' }}>
                <div className='__app-toolbar-left-buttons'>
                    {/* <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                        CommonUtility.exportExcel(transactions, tableUserColumns);
                    }}>Xuất Tệp Excel</Button> */}
                    <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                        loadData()
                    }}>Tải Lại</Button>
                </div>
                <div className='__app-toolbar-right-buttons'>
                    <Search
                        style={{ marginLeft: 10 }}
                        className='__app-search-box'
                        placeholder="ID, Tên KH, Nội dung"
                        onSearch={(value) => {
                            const columnsSearch = ['id', 'description', 'fullName']
                            const data = CommonUtility.onTableSearch(value, transactions, columnsSearch);
                            setTransactionOnSearch(data);
                        }}
                    />
                </div>
            </div>
            <div style={{ width: '94%' }}>
                <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
            </div>
            <div className='__app-layout-container' style={{ height: 'calc(100vh - 160px)', padding: '8px 24px' }}>
                <Table
                    loading={!isDataReady}
                    tableLayout='auto'
                    columns={tableUserColumns}
                    className='__app-user-info-table'
                    size='middle'
                    dataSource={transactionOnSearch}
                    pagination={{
                        pageSize: 7,
                        total: transactionOnSearch.length,
                        showTotal: (total, range) => {
                            return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                        }
                    }}
                ></Table>
            </div>
            {
                transactionDetail.isShow ?
                    <Modal
                        width={600}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Chi tiết báo cáo
                            </span>
                        )}
                        footer={[
                            <Button key='cancel' onClick={() => {
                                setTransactionDetail({
                                    isShow: false,
                                    transaction: null,
                                })
                            }}>Đóng</Button>
                        ]}
                        centered
                    >
                        <div className='__app-dialog-create-object' style={{
                            padding: '0 24px'
                        }}>
                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Mã hợp đồng:</Col><Col>{transactionDetail.transaction?.contractID}</Col>
                            </Row>

                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Khách hàng:</Col>
                                <Col>
                                    <Row style={{ fontWeight: 600 }}>{transactionDetail.transaction?.fullName}</Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Số điện thoại:</Col>
                                <Col><PatternFormat
                                    displayType='text'
                                    format='#### ### ###'
                                    value={transactionDetail.transaction?.phone}
                                />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Dịch vụ:</Col>
                                <Col>
                                    <span>{transactionDetail.transaction?.serviceName}</span>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Nội dung báo cáo:</Col>
                                <Col>
                                    <span style={{
                                        color: 'red'
                                    }}>{transactionDetail.transaction?.description}</span>
                                </Col>
                            </Row>
                            
                        </div>
                    </Modal> : <></>
            }
        </>
    )
}