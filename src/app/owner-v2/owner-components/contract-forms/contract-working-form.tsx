import { CameraOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, ScheduleOutlined } from "@ant-design/icons";
import { WorkingTimeCalendar } from "../../../common/components/working-time.component";
import { DateTime } from "luxon";
import { CommonUtility } from "../../../utils/utilities";
import { forkJoin, take } from "rxjs";
import { useEffect, useState } from "react";
import { OwnerServices } from "../../owner.service";
import { FormCreateContractDialog } from "./new-contract";
import { ContractStatusMapping, IContract, IContractDetail } from "../../../common/object-interfaces/contract.interface";
import { Tag, Button, Divider, Table, Col, Row, Modal, Image } from "antd";
import { ColumnsType } from "antd/es/table";
import toast from "react-hot-toast";
import { PatternFormat, NumericFormat } from "react-number-format";
import { UserPicker } from "../../../common/components/user-picker-component";
import Search from "antd/es/input/Search";

interface IContractFormProps {
    callbackFn?: (action: actionCallback, data?: string | string[]) => void;
}

interface IContractDetailProps extends IContractFormProps {
    contractId: string;
}
type actionCallback = 'backToList' | 'goToDetail' | 'goToSchedule'

export const ContractWorkingFormModule: React.FC<{}> = () => {
    const [formMode, setFormMode] = useState<'list' | 'detail' | 'schedule'>('list');
    const [contractId, setContractId] = useState<string | undefined>();
    const [contractDetailId, setContractDetailId] = useState<string[] | undefined>();
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [staffList, setStaffList] = useState<any[]>([]);

    useEffect(() => {
        if (!isFirstInit) {
            setFirstInit(true);
            apiService.getMembers$().pipe(take(1)).subscribe({
                next: (value) => {
                    setStaffList(value);
                }
            })
        }
    })

    function componentCallback(action: actionCallback, data?: string | string[]) {
        if (action === 'backToList') {
            setContractId(undefined);
            setContractDetailId(undefined)
            setFormMode('list');
        }
        if (action === 'goToDetail') {
            setContractId(data as string);
            setContractDetailId(undefined);
            setFormMode('detail');
        }
        if (action === 'goToSchedule') {
            setContractDetailId(data as string[]);
            setFormMode('schedule');
        }
    }

    const apiService = new OwnerServices();

    return <>
        {
            formMode === 'list' ? <RequestContractListComponent
                callbackFn={(action, data) => {
                    componentCallback(action, data);
                }}
            /> : <></>
        }
        {
            formMode === 'detail' ? <ContractDetailComponent
                contractId={contractId as string}
                callbackFn={(action, data) => {
                    componentCallback(action, data);
                }}
            /> : <></>
        }
        {
            formMode === 'schedule' ? <WorkingTimeCalendar
                contractDetailId={contractDetailId as string[]}
                callbackFn={() => {
                    componentCallback('goToDetail', contractId);
                }}
                apiServices={apiService}
                listUser={staffList}
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
            title: 'Ngày tạo',
            dataIndex: 'createdDate',
            key: 'createdDate',
            showSorterTooltip: false,
            ellipsis: true,
            width: 180,
            className: '__app-header-title',
            render: (data) => {
                return <span>{DateTime.fromJSDate(new Date(data)).toFormat('dd/MM/yyyy HH:mm')}</span>
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
                    // loadData();
                    apiService.checkWorkingDate$().pipe(take(1)).subscribe({
                        next: () => {
                            loadData();
                        }
                    })
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

const ContractDetailComponent: React.FC<IContractDetailProps> = (props) => {
    const apiService = new OwnerServices();

    const [contractDetail, setContractDetail] = useState<IContractDetail[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [staffForContract, setStaffForContract] = useState<number | null>(null);
    const [hasDataChanged, setDataChanged] = useState(false);
    // const [rejectContractForm, setRejectContractForm] = useState({
    //     isShow: false,
    //     reason: '',
    //     contractID: ''
    // });
    const [listImgForm, setListImgForm] = useState({
        isShow: false,
        listImg: []
    });

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        forkJoin([apiService.getContractDetail$(props.contractId), apiService.getMembers$(), apiService.checkWorkingDate$()]).subscribe({
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
                setStaffForContract(values[0][0].showContractModel?.showStaffModel.id ?? null);
                setDataReady(true);
                setFirstInit(true);
            }
        });
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
            <div className="__app-title-form">HỢP ĐỒNG</div>
        </div>
        <div className="__app-content-container">
            <div style={{ display: 'flex', flexDirection: 'row', margin: '0 30px', gap: 6 }}>
                <Col span={11} style={{ backgroundColor: '#f0f0f0', padding: '18px 24px', borderRadius: 4, gap: 8, display: 'flex', flexDirection: 'column' }}>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Mã hợp đồng:</Col><Col><strong>{contractDetail[0]?.showContractModel?.id}</strong></Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Tên hợp đồng:</Col><Col>{contractDetail[0]?.showContractModel?.title}</Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Trạng thái:</Col>
                        <Col>
                            <Tag color={CommonUtility.statusColorMapping(contractDetail[0]?.showContractModel?.status ?? '')}>{ContractStatusMapping[contractDetail[0]?.showContractModel?.status ?? '']}</Tag>
                        </Col>
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
                        <Col span={8} style={{ fontWeight: 500 }}>Ngày tạo:</Col><Col>{DateTime.fromJSDate(new Date(contractDetail[0]?.showContractModel?.createdDate as string)).toFormat('dd/MM/yyyy HH:mm')}</Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Ngày bắt đầu:</Col><Col>{DateTime.fromJSDate(new Date(contractDetail[0]?.showContractModel?.startedDate as string)).toFormat('dd/MM/yyyy HH:mm')}</Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Dự kiến kết thúc:</Col><Col>{getExpectedEndDate()}</Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Nhân viên tiếp nhận:</Col>
                        {/* <Col span={16}>
                            {
                                contractDetail[0]?.showContractModel?.showStaffModel.id ?
                                    <span>{contractDetail[0]?.showContractModel?.showStaffModel.fullName}</span> :
                                    <span>--</span>
                            }
                        </Col> */}
                        <Col span={16}>
                            <UserPicker
                                listUser={staffList}
                                defaultValue={staffForContract}
                                onChanged={(value) => {
                                    setStaffForContract(value);
                                    setDataChanged(true);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Ngày duyệt:</Col>
                        <Col>
                            {DateTime.fromJSDate(new Date(contractDetail[0]?.showContractModel?.confirmedDate as string)).toFormat('dd/MM/yyyy HH:mm')}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Ngày Ký:</Col>
                        <Col>
                            {DateTime.fromJSDate(new Date(contractDetail[0]?.showContractModel?.signedDate as string)).toFormat('dd/MM/yyyy HH:mm')}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Lịch:</Col>
                        <Col span={16} >
                            <div onClick={() => {
                                if (props.callbackFn) {
                                    props.callbackFn('goToSchedule', contractDetail.reduce((acc: string[], cur: IContractDetail) => {
                                        acc.push(cur.id)
                                        return acc;
                                    }, []));
                                }
                            }}>
                                <ScheduleOutlined style={{
                                    cursor: 'pointer',
                                    marginRight: 10,
                                    color: 'blue',
                                }} />
                                <span style={{
                                    cursor: 'pointer',
                                    color: 'blue',
                                    textDecoration: 'underline'
                                }}>Xem lịch làm việc</span>
                            </div>

                        </Col>
                    </Row>
                    <Row>
                        <Col span={8} style={{ fontWeight: 500 }}>Ảnh hợp đồng:</Col>
                        <Col span={16}>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {
                                    contractDetail[0]?.showContractModel?.imgList.reduce((acc, cur) => {
                                        acc.push(
                                            <img src={cur.imgUrl} alt='' style={{ width: 100, height: 140, cursor: 'pointer' }} onClick={() => { window.open(cur.imgUrl, 'Image') }} />
                                        )
                                        return acc;
                                    }, [] as React.ReactNode[])
                                }
                            </div>
                        </Col>
                    </Row>
                </Col>
                <Col span={13} style={{ backgroundColor: '#f0f0f0', padding: '18px 24px', borderRadius: 4, gap: 8, display: 'flex', flexDirection: 'column' }}>
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
                                                <Col span={8}>Cây:</Col>
                                                <Col span={16}>
                                                    <span>{cur.plantName ?? '--'} {cur.plantStatus ? `(${cur.plantStatus})` : `(Chưa kiểm tra)`}</span>
                                                    </Col>
                                            </Row>
                                            <Row style={{ width: '100%' }}>
                                                <Col span={8}>Ngày làm:</Col>
                                                <Col span={16}>
                                                    <span>{cur.timeWorking ?? '--'}</span>
                                                </Col>
                                            </Row>
                                            <Row style={{ width: '100%' }}>
                                                <Col span={8}></Col>
                                                <Col span={16} >
                                                    <div onClick={() => {
                                                        setListImgForm({
                                                            isShow: true,
                                                            listImg: cur.plantStatusIMGModelList
                                                        })
                                                    }}>
                                                        <CameraOutlined style={{
                                                            cursor: 'pointer',
                                                            marginRight: 10,
                                                            color: 'blue',
                                                        }} />
                                                        <span style={{
                                                            cursor: 'pointer',
                                                            color: 'blue',
                                                            textDecoration: 'underline'
                                                        }}>Xem ảnh đính kèm</span>
                                                    </div>

                                                </Col>
                                            </Row>
                                            {/* <Row style={{ width: '100%' }}>
                                                <Col span={8}></Col>
                                                <Col span={16} >
                                                    <div onClick={() => {
                                                        if (props.callbackFn) {
                                                            props.callbackFn('goToSchedule', cur.id);
                                                        }
                                                    }}>
                                                        <ScheduleOutlined style={{
                                                            cursor: 'pointer',
                                                            marginRight: 10,
                                                            color: 'blue',
                                                        }} />
                                                        <span style={{
                                                            cursor: 'pointer',
                                                            color: 'blue',
                                                            textDecoration: 'underline'
                                                        }}>Xem lịch làm việc</span>
                                                    </div>

                                                </Col>
                                            </Row> */}
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
            </div>
            {
                // contractDetail[0]?.showContractModel?.status === 'WAITING' ?
                //      : <></>

                <div className="__app-action-button" style={{ gap: 10 }}>
                    <Button type="primary"
                        disabled={!hasDataChanged}
                        style={{ backgroundColor: hasDataChanged ? '#0D6368' : 'rgb(13, 99, 104, 0.3)', color: hasDataChanged ? '#FFF' : '#E2E2E2' }}
                        onClick={() => {
                            apiService.updateStaffForContract$(props.contractId, staffForContract as number).pipe(take(1)).subscribe({
                                next: (res) => {
                                    if (res) {
                                        toast.success('Cập nhật thành công');
                                        if (props.callbackFn) {
                                            props.callbackFn('backToList');
                                        }
                                    } else {
                                        toast.error('Cập nhật thất bại');
                                    }
                                }
                            })
                        }}>Cập nhật</Button>
                </div>
            }
        </div>
        {
            listImgForm.isShow ? <Modal
                width={500}
                open={true}
                closable={false}
                title={(
                    <span className='__app-dialog-title'>
                        Hình ảnh mô tả
                    </span>
                )}
                footer={[
                    <Button key='cancel' onClick={() => {
                        setListImgForm({
                            isShow: false,
                            listImg: []
                        })
                    }}>Đóng</Button>
                ]}
                centered
            >
                <Row style={{ padding: 16, maxHeight: 600, display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
                    {
                        listImgForm.listImg.length > 0 ? listImgForm.listImg.reduce((acc: JSX.Element[], cur: any) => {
                            acc.push(
                                <Image
                                    preview={false}
                                    width={180}
                                    src={cur.imgUrl}
                                    style={{ borderRadius: 2 }}
                                />
                            )
                            return acc;
                        }, []) : <span>Không có hình ảnh</span>
                    }
                </Row>
            </Modal> : <></>
        }
    </div>
}