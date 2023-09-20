import { LeftOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { WorkingTimeCalendar } from "../../../common/components/working-time.component";
import { DateTime } from "luxon";
import { CommonUtility } from "../../../utils/utilities";
import { forkJoin, take } from "rxjs";
import { useEffect, useState } from "react";
import { OwnerServices } from "../../owner.service";
import { FormCreateContractDialog } from "./new-contract";
import { ContractStatusMapping, IContract, IContractDetail } from "../../../common/object-interfaces/contract.interface";
import { Tag, Button, Divider, Table, Col, Row, Modal } from "antd";
import { ColumnsType } from "antd/es/table";
import toast from "react-hot-toast";
import { PatternFormat, NumericFormat } from "react-number-format";
import { UserPicker } from "../../../common/components/user-picker-component";
import Search from "antd/es/input/Search";

interface IContractFormProps {
    callbackFn?: (action: actionCallback, data?: string) => void;
}

interface IContractDetailProps extends IContractFormProps {
    contractId: string;
}
type actionCallback = 'backToList' | 'goToDetail'

export const ContractWorkingFormModule: React.FC<{}> = () => {
    const [formMode, setFormMode] = useState<'list' | 'detail'>('list');
    const [contractId, setContractId] = useState<string | undefined>();

    function componentCallback(action: actionCallback, data?: string) {
        if (action === 'backToList') {
            setFormMode('list');
            setContractId(undefined);
        }
        if (action === 'goToDetail') {
            setFormMode('detail');
            setContractId(data);
        }
    }

    return <>
        {
            formMode === 'list' ? <RequestContractListComponent
                callbackFn={(action, data) => {
                    componentCallback(action, data);
                }}
            /> : <></>
        }
        {
            formMode === 'detail' ? <RequestContractDetailComponent
                contractId={contractId as string}
                callbackFn={(action) => {
                    componentCallback(action);
                }}
            /> : <></>
        }
    </>
}

const RequestContractListComponent: React.FC<IContractFormProps> = (props) => {

    const tableRequestColumns: ColumnsType<IContract> = [
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
            title: `Hợp Đồng`,
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
            width: 210,
            className: '__app-header-title'
        },
        {
            title: 'Nhân viên tiếp nhận',
            dataIndex: 'staff',
            key: 'staff',
            showSorterTooltip: false,
            ellipsis: true,
            width: 210,
            className: '__app-header-title',
            render: (_, record) => {
                return <span>{record.showStaffModel?.fullName ?? '--'}</span>
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            showSorterTooltip: false,
            ellipsis: true,
            width: 210,
            className: '__app-header-title',
            render: (value) => {
                return <Tag color={CommonUtility.statusColorMapping(value)}>{ContractStatusMapping[value]}</Tag>
            },
            filterMode: 'menu',
            filters: [
                {
                    text: 'Mới',
                    value: 'WAITING'
                },
                {
                    text: 'Đã duyệt',
                    value: 'APPROVED'
                },
                {
                    text: 'Đang khảo sát',
                    value: 'CONFIRMING'
                }
            ],
            filterSearch: false,
            filterMultiple: true,
            onFilter: (value, record) => (record.status as string).toLowerCase().indexOf((value as string).toLowerCase()) > -1,
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
                        if (props.callbackFn) {
                            props.callbackFn('goToDetail', record.id);
                        }
                    }}>Chi tiết</Button>
                </div>
            },
            className: '__app-header-title'
        }
    ]

    const apiService = new OwnerServices();

    const [contracts, setContract] = useState<IContract[]>([]);
    const [contractsOnSearch, setContractsOnSearch] = useState<IContract[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [isShowPopupCreate, setShowPopupCreate] = useState<boolean>(false);

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        apiService.getContracts$().pipe(take(1)).subscribe({
            next: data => {
                setContract(data);
                setContractsOnSearch(data);
                setFirstInit(true);
                setDataReady(true);
            }
        })
    }

    return <>
        <div className='__app-toolbar-container' style={{ width: '100%', padding: '8px 24px' }}>
            <div className='__app-toolbar-left-buttons'>
                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                    setShowPopupCreate(true);
                }}>Tạo Hợp Đồng</Button>
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
                        setContractsOnSearch(data);
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
                columns={tableRequestColumns}
                className='__app-user-info-table'
                dataSource={contractsOnSearch}
                pagination={{
                    pageSize: 6,
                    total: contractsOnSearch.length,
                    showTotal: (total, range) => {
                        return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                    }
                }}
            ></Table>
            {
                isShowPopupCreate ? <FormCreateContractDialog
                    onCancel={() => { setShowPopupCreate(false) }}
                    onSave={(data: IContract) => {
                        setShowPopupCreate(false);
                        loadData();
                    }}
                /> : <></>
            }
        </div>
    </>
}

const RequestContractDetailComponent: React.FC<IContractDetailProps> = (props) => {
    const apiService = new OwnerServices();

    const [contractDetail, setContractDetail] = useState<IContractDetail[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [staffForContract, setStaffForContract] = useState<number | null>(null);
    const [rejectContractForm, setRejectContractForm] = useState<{
        isShow: boolean,
        reason: string,
        contractID: string
    }>({
        isShow: false,
        reason: '',
        contractID: ''
    });

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        forkJoin([apiService.getContractDetail$(props.contractId), apiService.getMembers$()]).subscribe({
            next: (values) => {
                const staffListOption = values[1].reduce((acc, cur) => {
                    acc.push({
                        value: cur.id,
                        label: cur.fullName
                    })
                    return acc;
                }, [] as any)
                setStaffList(staffListOption);
                setContractDetail(values[0]);
                setDataReady(true);
                setFirstInit(true);
            }
        });
    }

    function validateFormReject() {
        let result = {
            invalid: false,
            error: [] as string[]
        }
        if (CommonUtility.isNullOrEmpty(rejectContractForm.reason)) {
            result.invalid = true;
            result.error.push('Lý do');
        }
        return result;
    }

    function getExpectedEndDate() {
        const endDate = contractDetail.reduce((acc, cur) => {
            if (acc) {
                acc = acc > cur.expectedEndDate ? acc : cur.expectedEndDate;
            } else {
                acc = cur.expectedEndDate;
            }
            return acc;
        }, null);
        if (endDate) {
            return DateTime.fromJSDate(new Date(endDate)).toFormat('dd/MM/yyyy HH:mm');
        } else {
            return '--';
        }
        
    }

    return <div className="__app-layout-container form-edit" style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
        <div className="__app-top-action">
            <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                if (props.callbackFn) {
                    props.callbackFn('backToList');
                }
            }} />
            <div className="__app-title-form">YÊU CẦU</div>
        </div>
        <div className="__app-content-container">
            <div style={{ display: 'flex', flexDirection: 'row', margin: '0 30px', gap: 6 }}>
                <Col span={13} style={{ backgroundColor: '#f0f0f0', padding: '18px 24px', borderRadius: 4, gap: 8, display: 'flex', flexDirection: 'column' }}>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Mã hợp đồng:</Col><Col><strong>{contractDetail[0]?.showContractModel?.id}</strong></Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Tên hợp đồng:</Col><Col>{contractDetail[0]?.showContractModel?.title}</Col>
                    </Row>

                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Khách hàng:</Col>
                        <Col>
                            <Row style={{ fontWeight: 600 }}>{contractDetail[0]?.showContractModel?.fullName}</Row>
                            <Row>
                                <PatternFormat
                                    displayType='text'
                                    format='#### ### ###'
                                    value={contractDetail[0]?.showContractModel?.phone}
                                /></Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Ngày bắt đầu:</Col><Col>{DateTime.fromJSDate(new Date(contractDetail[0]?.showContractModel?.startedDate as string)).toFormat('dd/MM/yyyy HH:mm')}</Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Ngày dự kiến kết thúc:</Col><Col>{getExpectedEndDate()}</Col>
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
                        <Col span={8} style={{ fontWeight: 500 }}>Nhân viên tiếp nhận:</Col>
                        <Col span={16}>
                            {
                                contractDetail[0]?.showContractModel?.showStaffModel.id ?
                                    <span>{contractDetail[0]?.showContractModel?.showStaffModel.fullName}</span> :
                                    contractDetail[0]?.showContractModel?.status === 'WAITING' ?
                                        <UserPicker
                                            listUser={staffList}
                                            onChanged={(value) => {
                                                setStaffForContract(value);
                                            }}
                                        /> : <span>--</span>
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
                </Col>
            </div>
            {
                contractDetail[0]?.showContractModel?.status === 'WAITING' ?
                    <div className="__app-action-button" style={{ gap: 10 }}>
                        <Button type="primary"
                            style={{ background: '#0D6368' }} onClick={() => {
                                apiService.approveContract$(props.contractId, 'APPROVED', staffForContract as number).pipe(take(1)).subscribe({
                                    next: (res) => {
                                        if (res) {
                                            toast.success('Duyệt Hợp đồng thành công');
                                            if (props.callbackFn) {
                                                props.callbackFn('backToList');
                                            }
                                        } else {
                                            toast.error('Duyệt Hợp đồng thất bại');
                                        }
                                    }
                                })
                            }}>Duyệt</Button>
                        <Button type="default" onClick={() => {
                            setRejectContractForm({
                                isShow: true,
                                contractID: contractDetail[0]?.showContractModel?.id ?? '',
                                reason: ''
                            })
                        }}>Từ chối</Button>
                    </div> : <></>
            }
            {
                rejectContractForm.isShow ?
                    <Modal
                        width={500}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Từ chối hợp đồng
                            </span>
                        )}
                        footer={[
                            <Button key='cancel' onClick={() => {
                                setRejectContractForm({
                                    isShow: false,
                                    contractID: '',
                                    reason: ''
                                })
                            }}>Đóng</Button>,
                            <Button key='save' type='primary' style={{ background: '#0D6368' }} onClick={() => {
                                const validation = validateFormReject();
                                if (validation.invalid) {
                                    toast.error('Vui lòng nhập thông tin ' + validation.error.join(', '));
                                } else {
                                    apiService.rejectContract$(props.contractId, 'DENIED', rejectContractForm.reason).pipe(take(1)).subscribe({
                                        next: (res) => {
                                            if (res) {
                                                toast.success('Cập nhật thành công');
                                                if (props.callbackFn) {
                                                    props.callbackFn('backToList');
                                                }
                                            } else {
                                                toast.error('Cập nhật thất bại. Vui lòng thử lại');
                                            }
                                        }
                                    })
                                }
                            }}>Lưu</Button>
                        ]}
                        centered
                    >

                    </Modal> : <></>
            }
        </div>
    </div>
}