import { LeftOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Row, Table, Tabs, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { OwnerServices } from "../owner.service";
import { take } from "rxjs";
import { ContractStatus, ContractStatusMapping, IContract, IContractDetail } from "../../common/object-interfaces/contract.interface";
import { CommonUtility } from "../../utils/utilities";
import '../owner.scss';
import { DateTime } from "luxon";


interface IContractManagementProps {
    contractStatus: ContractStatus;
}

export const ContractManagementComponent: React.FC<any> = () => {
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
                        label: 'HĐ mới',
                        key: 'waiting',
                        children: tabKey === 'waiting' ? <ContractTabLayoutComponent contractStatus='WAITING' /> : <></>,
                    },
                    {
                        label: 'HĐ đã duyệt',
                        key: 'approved',
                        children: tabKey === 'approved' ? <ContractTabLayoutComponent contractStatus='APPROVED' /> : <></>,
                    },
                    {
                        label: 'HĐ đang thực hiện',
                        key: 'working',
                        children: tabKey === 'working' ? <ContractTabLayoutComponent contractStatus='WORKING' /> : <></>,
                    },
                    {
                        label: 'HĐ đã từ chối',
                        key: 'denied',
                        children: tabKey === 'denied' ? <ContractTabLayoutComponent contractStatus='DENIED' /> : <></>,
                    },
                    {
                        label: 'HĐ cửa hàng đã huỷ',
                        key: 'storeCancel',
                        children: tabKey === 'storeCancel' ? <ContractTabLayoutComponent contractStatus='STAFFCANCELED' /> : <></>,
                    },
                    {
                        label: 'HĐ đã bị huỷ',
                        key: 'cancel',
                        children: tabKey === 'cancel' ? <ContractTabLayoutComponent contractStatus='CUSTOMERCANCELED' /> : <></>,
                    },
                    {
                        label: 'HĐ đã hoàn thành',
                        key: 'done',
                        children: tabKey === 'done' ? <ContractTabLayoutComponent contractStatus='DONE' /> : <></>,
                    },
                ]}
            />
        </div>
    )
}

export const ContractTabLayoutComponent: React.FC<IContractManagementProps> = (props) => {

    const ownerServices = new OwnerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [contracts, setContract] = useState<IContract[]>([]);
    const [contractsOnSearch, setContractOnSearch] = useState<IContract[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [contractDetail, setContractDetail] = useState<IContractDetail[]>([])
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        ownerServices.getAllContracts$().pipe(take(1)).subscribe({
            next: data => {
                const result = data.reduce((acc: any[], cur: any) => {
                    if (cur.status === props.contractStatus) {
                        acc.push(cur);
                    }
                    return acc;
                }, []);
                setContract(result);
                setContractOnSearch(result);
                setFirstInit(true);
                setDataReady(true);
            }
        })
    }

    const tableUserColumns: ColumnsType<IContract> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
            className: '__app-header-title'
        },
        {
            title: `Tên Hợp Đồng`,
            dataIndex: 'title',
            key: 'title',
            showSorterTooltip: false,
            ellipsis: true,
            className: '__app-header-title'
        },
        {
            title: 'Khách hàng',
            dataIndex: 'fullName',
            key: 'fullName',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
            className: '__app-header-title'
        },
        {
            title: 'Nhân viên tiếp nhận',
            dataIndex: 'staff',
            key: 'staff',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
            className: '__app-header-title',
            render: (_, record) => {
                return <span>{record.showStaffModel?.fullName ?? '--'}</span>
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
                        getContractDetail(record.id);
                        setFormMode('edit');
                    }}>Chi tiết</Button>
                </div>
            },
            className: '__app-header-title'
        }
    ]

    function getContractDetail(id: string) {
        setDataReady(false);
        ownerServices.getContractDetail$(id).subscribe({
            next: (value) => {
                setContractDetail(value);
                setDataReady(true);
            }
        });
    }

    return (
        <>
            {
                formMode === 'display' ?
                    <>
                        <div className='__app-toolbar-container' style={{ width: '100%', padding: '8px 24px' }}>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(contracts, tableUserColumns);
                                }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    loadData();
                                }}>Tải Lại</Button>
                            </div>
                            <div className='__app-toolbar-right-buttons'>
                                <Search
                                    style={{ marginLeft: 10 }}
                                    className='__app-search-box'
                                    placeholder="ID, Tên hợp đồng"
                                    onSearch={(value) => {
                                        const columnsSearch = ['id', 'title']
                                        const data = CommonUtility.onTableSearch(value, contracts, columnsSearch);
                                        setContractOnSearch(data);
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ width: '100%' }}>
                            <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
                        </div>
                        <div className='__app-layout-container' style={{ width: '100%', height: 'calc(100vh - 220px)', padding: '8px 24px' }}>
                            <Table
                                loading={!isDataReady}
                                tableLayout='auto'
                                size='middle'
                                columns={tableUserColumns}
                                className='__app-user-info-table'
                                dataSource={contractsOnSearch}
                                pagination={{
                                    pageSize: 6,
                                    total: contractsOnSearch.length,
                                    showTotal: (total, range) => {
                                        return <span>{total} items</span>
                                    }
                                }}
                            ></Table>
                        </div>
                    </> : <></>
            }
            {
                formMode === 'edit' ?
                    <div className="__app-layout-container form-edit" style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
                        <div className="__app-top-action">
                            <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                                setFormMode('display');
                                setContractDetail([]);
                            }} />
                            <div className="__app-title-form">HỢP ĐỒNG</div>
                        </div>
                        <div className="__app-content-container">
                            <div style={{ display: 'flex', flexDirection: 'row', margin: '0 30px', gap: 6 }}>
                                <Col span={13} style={{ backgroundColor: '#f0f0f0', padding: '18px 24px', borderRadius: 4, gap: 8, display: 'flex', flexDirection: 'column' }}>
                                    <Row>
                                        <Col span={5} style={{ fontWeight: 500 }}>Mã hợp đồng:</Col><Col><strong>{contractDetail[0]?.showContractModel?.id}</strong></Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} style={{ fontWeight: 500 }}>Tên hợp đồng:</Col><Col>{contractDetail[0]?.showContractModel?.title}</Col>
                                    </Row>

                                    <Row>
                                        <Col span={5} style={{ fontWeight: 500 }}>Khách hàng:</Col>
                                        <Col>
                                            <Row style={{ fontWeight: 600 }}>{contractDetail[0]?.showContractModel?.fullName}</Row>
                                            <Row>{contractDetail[0]?.showContractModel?.phone}</Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} style={{ fontWeight: 500 }}>Cửa hàng:</Col><Col>{contractDetail[0]?.showContractModel?.showStoreModel?.storeName ?? '--'}</Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} style={{ fontWeight: 500 }}>Ngày bắt đầu:</Col><Col>{DateTime.fromJSDate(new Date(contractDetail[0]?.showContractModel?.startedDate as string)).toFormat('dd/MM/yyyy HH:mm')}</Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} style={{ fontWeight: 500 }}>Ngày kết thúc:</Col><Col>{DateTime.fromJSDate(new Date(contractDetail[0]?.showContractModel?.endedDate as string)).toFormat('dd/MM/yyyy HH:mm')}</Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} style={{ fontWeight: 500 }}>Dịch vụ thuê:</Col>
                                        <Col span={19} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {
                                                contractDetail.reduce((acc, cur: IContractDetail) => {
                                                    acc.push(
                                                        <Row style={{ border: '1px solid #000', padding: '6px 14px', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                            <Row style={{ width: '100%' }}>
                                                                <Col span={8}>ID:</Col>
                                                                <Col span={16}>{cur.id}</Col>
                                                            </Row>
                                                            <Row style={{ width: '100%' }}>
                                                                <Col span={8}>Tên dịch vụ:</Col>
                                                                <Col span={16}>{cur.showServiceModel?.name}</Col>
                                                            </Row>
                                                            <Row style={{ width: '100%' }}>
                                                                <Col span={8}>Loại dịch vụ:</Col>
                                                                <Col span={16}>{cur.showServiceTypeModel?.typeName}</Col>
                                                            </Row>
                                                            <Row style={{ width: '100%' }}>
                                                                <Col span={8}>Gói dịch vụ:</Col>
                                                                <Col span={16}>{`${cur.showServicePackModel?.packRange} ${cur.showServicePackModel?.packUnit}`}</Col>
                                                            </Row>
                                                            <Row style={{ width: '100%' }}>
                                                                <Col span={8}>Ngày làm:</Col>
                                                                <Col span={16}>{cur.timeWorking ?? '--'}</Col>
                                                            </Row>
                                                            <Row style={{ width: '100%' }}>
                                                                <Col span={8}>Ghi chú:</Col>
                                                                <Col span={16}>{cur.note ?? '--'}</Col>
                                                            </Row>
                                                            <Divider className='__app-divider-no-margin' />
                                                            <Row style={{ width: '100%' }}>
                                                                <Col span={8}>Giá:</Col>
                                                                <Col span={16}><NumericFormat displayType='text' thousandSeparator=' ' suffix=' vnđ' value={cur.totalPrice} /></Col>
                                                            </Row>
                                                        </Row>
                                                    )
                                                    return acc;
                                                }, [] as React.ReactNode[])
                                            }
                                        </Col>
                                    </Row>
                                    <Divider className='__app-divider-no-margin' />
                                    <Row>
                                        <span style={{ fontWeight: 500 }}>Tổng thanh toán: <span><NumericFormat displayType='text' thousandSeparator=' ' suffix=' vnđ' value={contractDetail[0]?.showContractModel?.total} /></span></span>
                                    </Row>
                                </Col>
                                <Col span={11} style={{ backgroundColor: '#f0f0f0', padding: '18px 24px', borderRadius: 4, gap: 8, display: 'flex', flexDirection: 'column' }}>
                                    <Row>
                                        <Col span={8} style={{ fontWeight: 500 }}>Trạng thái:</Col><Col><Tag color={CommonUtility.statusColorMapping(contractDetail[0]?.showContractModel?.status ?? '')}>{ContractStatusMapping[contractDetail[0]?.showContractModel?.status ?? '']}</Tag></Col>
                                    </Row>
                                    <Row>
                                        <Col span={8} style={{ fontWeight: 500 }}>Loại thanh toán:</Col>
                                        <Col>{contractDetail[0]?.showContractModel?.paymentMethod}</Col>
                                    </Row>
                                    <Row>
                                        <Col span={8} style={{ fontWeight: 500 }}>Đã đặt cọc:</Col>
                                        <Col><NumericFormat displayType='text' thousandSeparator=' ' suffix=' vnđ' value={contractDetail[0]?.showContractModel?.deposit} /></Col>
                                    </Row>
                                    <Row>
                                        <Col span={8} style={{ fontWeight: 500 }}>Nhân viên tiếp nhận:</Col>
                                        <Col span={16}>
                                            {
                                                contractDetail[0]?.showContractModel?.showStaffModel.id ?
                                                    <span>{contractDetail[0]?.showContractModel?.showStaffModel.fullName}</span> :
                                                    <span>--</span>
                                            }
                                        </Col>
                                    </Row>
                                    {
                                        contractDetail[0]?.showContractModel?.status === 'DENIED' ?
                                            <>
                                                <Row>
                                                    <Col span={8} style={{ fontWeight: 500 }}>Ngày từ chối:</Col>
                                                    <Col>{contractDetail[0]?.showContractModel.rejectedDate}</Col>
                                                </Row>
                                                <Row>
                                                    <Col span={16} style={{ fontWeight: 500 }}>Lý do từ chối:</Col>
                                                    <Col>{contractDetail[0]?.showContractModel.reason}</Col>
                                                </Row>
                                            </> : <></>
                                    }
                                    {
                                        contractDetail[0]?.showContractModel?.status === 'DENIED' ?
                                            <>
                                                <Row>
                                                    <Col span={8} style={{ fontWeight: 500 }}>Lý do từ chối:</Col>
                                                    <Col>{contractDetail[0]?.showContractModel.reason}</Col>
                                                </Row>
                                            </> : <></>
                                    }
                                    {
                                        contractDetail[0]?.showContractModel?.status !== 'WAITING' &&
                                            contractDetail[0]?.showContractModel?.status !== 'APPROVED' ?
                                            <>
                                                <Row>
                                                    <Col span={8} style={{ fontWeight: 500 }}>Ảnh Đính Kèm:</Col>
                                                    <Col span={16}>
                                                        {
                                                            contractDetail[0]?.showContractModel?.imgList.reduce((acc, cur) => {
                                                                acc.push(
                                                                    <img src={cur.imgUrl} alt='' style={{ width: 150, height: 200 }} />
                                                                )
                                                                return acc;
                                                            }, [] as React.ReactNode[])
                                                        }
                                                    </Col>
                                                </Row>
                                            </> : <></>
                                    }
                                </Col>
                            </div>
                        </div>
                    </div>
                    : <></>
            }
        </>
    )
}