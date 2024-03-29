import { CheckSquareOutlined, CloudUploadOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, RestOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Divider, Input, Modal, Row, Select, Skeleton, Table, Tabs, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { NumericFormat, PatternFormat } from "react-number-format";
import { ManagerServices } from "../manager.service";
import { forkJoin, take } from "rxjs";
import { ContractStatus, ContractStatusMapping, IContract, IContractDetail } from "../../common/object-interfaces/contract.interface";
import { cloneDeep } from "lodash";
import { CommonUtility } from "../../utils/utilities";
import toast from "react-hot-toast";
import '../manager.scss';
import { UserPicker } from "../../common/components/user-picker-component";
import { DateTime } from "luxon";
import TextArea from "antd/es/input/TextArea";
import dayjs from 'dayjs';

interface IContractManagementProps {
    contractStatus: ContractStatus;
}

export const ContractManagementComponent: React.FC<any> = () => {
    const [tabKey, setTabKey] = useState<string>('waiting')
    return (
        <div style={{ height: 'calc(100vh - 100px)', width: 'calc(100% - 80px)', marginLeft: 20 }}>
            <Tabs
                className="__app-tabs-custom"
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
                        label: 'HĐ đã ký',
                        key: 'signed',
                        children: tabKey === 'signed' ? <ContractTabLayoutComponent contractStatus='SIGNED' /> : <></>,
                    },
                    {
                        label: 'HĐ đang hoạt động',
                        key: 'working',
                        children: tabKey === 'working' ? <ContractTabLayoutComponent contractStatus='WORKING' /> : <></>,
                    },
                    {
                        label: 'HĐ đã từ chối',
                        key: 'denied',
                        children: tabKey === 'denied' ? <ContractTabLayoutComponent contractStatus='DENIED' /> : <></>,
                    },
                    // {
                    //     label: 'HĐ cửa hàng đã huỷ',
                    //     key: 'storeCancel',
                    //     children: tabKey === 'storeCancel' ? <ContractTabLayoutComponent contractStatus='STAFFCANCELED' /> : <></>,
                    // },
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const managerServices = new ManagerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [contracts, setContract] = useState<IContract[]>([]);
    const [contractsOnSearch, setContractOnSearch] = useState<IContract[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [isShowPopupCreate, setShowPopupCreate] = useState<boolean>(false);
    const [contractDetail, setContractDetail] = useState<IContractDetail[]>([])
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [staffList, setStaffList] = useState<any[]>([]);
    const [staffForContract, setStaffForContract] = useState<number | null>(null);
    const [imageScanUrls, setImageScanUrls] = useState<string[]>([]);
    const [isUpload, setIsUpload] = useState<boolean>(false);
    const [signedForm, setSignedForm] = useState<any>({
        deposit: 0,
        paymentTypeID: null
    })
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

    function autoUpdateStatusWorking() {
        managerServices.updateWorkingContracts$().pipe(take(1)).subscribe();
    }

    function loadData() {
        setDataReady(false);
        autoUpdateStatusWorking();
        managerServices.getContracts$().pipe(take(1)).subscribe({
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
        forkJoin([managerServices.getContractDetail$(id), managerServices.getMembers$()]).subscribe({
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

    return (
        <>
            {
                formMode === 'display' ?
                    <>
                        <div className='__app-toolbar-container' style={{ width: '100%', padding: '8px 24px' }}>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                                    setShowPopupCreate(true);
                                }}>Tạo Hợp Đồng</Button>
                                {/* <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(contracts, tableUserColumns);
                                }}>Xuất Tệp Excel</Button> */}
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
                                        return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                                    }
                                }}
                            ></Table>
                            {
                                isShowPopupCreate ? <FormCreateContractDialog
                                    onCancel={() => { setShowPopupCreate(false) }}
                                    onSave={(data: IContract) => {
                                        setShowPopupCreate(false);

                                    }}
                                /> : <></>
                            }
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
                                setImageScanUrls([]);
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
                                            <Row>
                                                <PatternFormat
                                                    displayType='text'
                                                    format='#### ### ###'
                                                    value={contractDetail[0]?.showContractModel?.phone}
                                                /></Row>
                                        </Col>
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
                                        <Col>{
                                            // contractDetail[0]?.showContractModel?.status === 'APPROVED' ?
                                            //     <Select
                                            //         style={{ width: '100%' }}
                                            //         options={[
                                            //             { value: 'PT001', label: 'Thanh toán trước 50%' },
                                            //             { value: 'PT002', label: 'Thanh toán trước 80%' },
                                            //             { value: 'PT003', label: 'Thanh toán hoàn toàn' },
                                            //         ]}
                                            //         placeholder='Chọn phương thức thanh toán'
                                            //         onChange={(value) => {
                                            //             let _dep = 0
                                            //             switch (value) {
                                            //                 case 'PT001':
                                            //                     _dep = (contractDetail[0]?.showContractModel?.total ?? 0) * 0.5;
                                            //                     break;
                                            //                 case 'PT002':
                                            //                     _dep = (contractDetail[0]?.showContractModel?.total ?? 0) * 0.8;
                                            //                     break;
                                            //                 case 'PT003':
                                            //                     _dep = (contractDetail[0]?.showContractModel?.total ?? 0);
                                            //                     break;
                                            //             }
                                            //             setSignedForm({
                                            //                 deposit: _dep,
                                            //                 paymentTypeID: value
                                            //             })
                                            //         }}
                                            //     />
                                            //     : contractDetail[0]?.showContractModel?.showPaymentTypeModel?.name ?? ''
                                            contractDetail[0]?.showContractModel?.paymentMethod ?? '--'
                                        }</Col>
                                    </Row>
                                    {/* <Row>
                                        <Col span={8} style={{ fontWeight: 500 }}>Đặt cọc:</Col>
                                        <Col>
                                            <NumericFormat
                                                displayType='text'
                                                thousandSeparator=' '
                                                suffix={' vnđ'}
                                                value={
                                                    contractDetail[0]?.showContractModel?.status === 'APPROVED' ? 
                                                    signedForm.deposit : contractDetail[0]?.showContractModel?.deposit
                                                } />
                                        </Col>
                                    </Row> */}
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
                                    {
                                        contractDetail[0]?.showContractModel?.status === 'APPROVED' ?
                                            <>
                                                <Row>
                                                    <Col span={8} style={{ fontWeight: 500 }}>Ngày duyệt:</Col>
                                                    <Col>{DateTime.fromJSDate(new Date(contractDetail[0]?.showContractModel.approvedDate)).toFormat('dd/MM/yyyy HH:mm')}</Col>
                                                </Row>
                                                <Row>
                                                    <Col span={8} style={{ fontWeight: 500 }}>Ảnh Scan:</Col>
                                                    <Col>
                                                        <div className="__app-button-upload">
                                                            {
                                                                !isUpload ? <Button key='upload' icon={<CloudUploadOutlined />} onClick={() => {
                                                                    document.getElementById('uploadContract')?.click();
                                                                }}>Tải ảnh</Button> : <Skeleton.Button active={true}></Skeleton.Button>
                                                            }

                                                        </div>
                                                        <input
                                                            id='uploadContract'
                                                            type="file"
                                                            accept="*"
                                                            multiple={false}
                                                            hidden={true}
                                                            onChange={(args) => {
                                                                setIsUpload(true);
                                                                const file = Array.from(args.target.files as FileList);
                                                                managerServices.uploadImageToFireBase$(file[0]).pipe(take(1)).subscribe({
                                                                    next: url => {
                                                                        const img = imageScanUrls;
                                                                        img.push(url as string);
                                                                        setImageScanUrls(img);
                                                                        setIsUpload(false);
                                                                    }
                                                                });
                                                            }}
                                                        />
                                                        <div>
                                                            {
                                                                imageScanUrls.reduce((acc, cur) => {
                                                                    acc.push(
                                                                        <img src={cur} alt='' style={{ width: 150, height: 200 }} />
                                                                    )
                                                                    return acc;
                                                                }, [] as React.ReactNode[])
                                                            }
                                                        </div>
                                                    </Col>
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
                                                    <Col span={8} style={{ fontWeight: 500 }}>Ảnh hợp đồng:</Col>
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
                            {
                                contractDetail[0]?.showContractModel?.status === 'WAITING' ?
                                    <div className="__app-action-button">
                                        <Button type="primary"
                                            style={{ background: '#0D6368' }} onClick={() => {
                                                const dataPost = {
                                                    "contractID": contractDetail[0]?.showContractModel?.id,
                                                    "deposit": contractDetail[0]?.showContractModel?.deposit,
                                                    "paymentMethod": contractDetail[0]?.showContractModel?.paymentMethod,
                                                    "staffID": staffForContract,
                                                    "paymentTypeID": contractDetail[0]?.showContractModel?.paymentTypeID ?? 'PT003'
                                                }
                                                managerServices.approveContract$(dataPost).pipe(take(1)).subscribe({
                                                    next: (res) => {
                                                        if (res) {
                                                            setFormMode('display');
                                                            setContractDetail([]);
                                                            loadData();
                                                            toast.success('Duyệt Hợp đồng thành công');
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
                                contractDetail[0]?.showContractModel?.status !== 'WAITING' ?
                                    <div className="__app-action-button">
                                        {
                                            contractDetail[0]?.showContractModel?.status === 'APPROVED' ?
                                                <Button type="primary" style={{ background: '#0D6368' }} onClick={() => {
                                                    if (imageScanUrls.length > 0) {
                                                        managerServices.activeContract$(imageScanUrls, contractDetail[0]?.showContractModel?.id as string, signedForm['paymentTypeID'], signedForm['deposit']).pipe(take(1)).subscribe({
                                                            next: (res) => {
                                                                if (res) {
                                                                    setFormMode('display');
                                                                    setContractDetail([]);
                                                                    setImageScanUrls([]);
                                                                    loadData();
                                                                    toast.success('Lưu Hợp đồng thành công');
                                                                } else {
                                                                    toast.error('Lưu Hợp đồng thất bại');
                                                                }
                                                            }
                                                        })
                                                    } else {
                                                        toast.error('Vui lòng upload ảnh scan hợp đồng')
                                                    }
                                                }}>Lưu</Button> : <></>
                                        }

                                        {/* <Button style={{ width: 200, backgroundColor: '#5D050b' }} type="primary" onClick={() => {
                                            managerServices.rejectContract$(contractDetail[0]?.showContractModel?.id as string, 'STAFFCANCELED').pipe(take(1)).subscribe({
                                                next: (res) => {
                                                    if (res) {
                                                        setFormMode('display');
                                                        setContractDetail([]);
                                                        setImageScanUrls([]);
                                                        loadData();
                                                        toast.success('Cập nhật thành công');
                                                    } else {
                                                        toast.error('Cập nhật thất bại. Vui lòng thử lại');
                                                    }
                                                }
                                            })
                                        }}>Huỷ Hợp Đồng</Button> */}
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
                                                    managerServices.rejectContract$(contractDetail[0]?.showContractModel?.id as string, 'DENIED', rejectContractForm.reason).pipe(take(1)).subscribe({
                                                        next: (res) => {
                                                            if (res) {
                                                                setFormMode('display');
                                                                setContractDetail([]);
                                                                setRejectContractForm({
                                                                    isShow: false,
                                                                    contractID: '',
                                                                    reason: ''
                                                                })
                                                                loadData();
                                                                toast.success('Cập nhật thành công');
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
                    : <></>
            }
        </>
    )
}

const FormCreateContractDialog: React.FC<any> = (props: any) => {
    const [contractDetail, setContractDetail] = useState<any>({});
    const [isUpload, setIsUpload] = useState(false);
    const [imageScanUrls, setImageScanUrls] = useState<string[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [serviceList, setServiceList] = useState<any[]>([]);
    const [servicePackList, setServicePackTypeList] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);

    const [servicesForm, setServiceForm] = useState<any[]>([]);
    const [checkCustomer, setCheckCustomer] = useState<{
        isChecked: boolean,
        isExist: boolean
    }>({
        isChecked: false,
        isExist: false
    })

    const managerServices = new ManagerServices();

    useEffect(() => {
        if (!isFirstInit) {
            forkJoin([managerServices.getMembers$(), managerServices.getService$(), managerServices.getServicePacks$()]).subscribe({
                next: values => {
                    const staffListOption = values[0].reduce((acc, cur) => {
                        acc.push({
                            value: cur.id,
                            label: cur.fullName
                        })
                        return acc;
                    }, [] as any)
                    setStaffList(staffListOption);
                    setServicePackTypeList(values[2]);
                    setStaffList(staffListOption);
                    setServiceList(values[1]);
                    setFirstInit(true);
                }
            })
        }
    })

    function getRenderFooterButton(): React.ReactNode[] {
        let nodes: React.ReactNode[] = []
        nodes.push(
            <Button key='cancel' onClick={() => {
                if (props.onCancel) {
                    props.onCancel();
                }
            }}>Đóng</Button>
        );
        nodes.push(
            <Button key='save' type='primary' style={{ background: '#0D6368' }} onClick={() => {
                const firstServiceName = serviceList.find(item => item.serviceID === servicesForm[0]?.serviceID)?.name ?? 'Dịch vụ';
                const dataPost = {
                    "title": `Hợp đồng ${firstServiceName}`,
                    "fullName": contractDetail['fullName'],
                    "phone": contractDetail['phone'] ?? '',
                    "address": contractDetail['address'] ?? '',
                    "storeID": managerServices.storeId,
                    "paymentMethod": contractDetail['paymentMethod'] ?? '',
                    "customerID": contractDetail['customerID'] ?? null,
                    "email": contractDetail['email'] ?? '',
                    "detailModelList": servicesForm.reduce((acc, cur) => {
                        acc.push({
                            "note": cur['note'] ?? '',
                            "timeWorking": cur['timeWorking']?.join(', ') ?? '',
                            "totalPrice": getTotalPrice(cur),
                            "servicePackID": cur['servicePackID'] ?? '',
                            "serviceTypeID": cur['serviceTypeID'] ?? '',
                            "startDate": cur['startDate'] ?? '',
                            "endDate": getEndDate(cur) ?? ''
                        })
                        return acc;
                    }, []),
                    "staffID": contractDetail['staffID'],
                    "listURL": imageScanUrls
                }
                managerServices.createContract$(dataPost).subscribe({
                    next: (res) => {
                        if (res) {
                            toast.success('Tạo hợp đồng thành công');
                            if (props.onSave) {
                                props.onSave(contractDetail);
                            }
                        } else {
                            toast.error('Tạo hợp đồng thất bại');
                        }
                    }
                })
            }}>Lưu</Button>
        );
        return nodes;
    }

    return (
        <>
            <Modal
                width={1100}
                open={true}
                closable={false}
                title={(
                    <span className='__app-dialog-title'>
                        Tạo Hợp Đồng
                    </span>
                )}
                footer={getRenderFooterButton()}
                centered
            >
                <div className='__app-dialog-create-account'>
                    <Row className='__app-account-info-row'>
                        <Col span={12}>
                            <Row>
                                <Col span={6} className='__app-account-field'>
                                    <span>
                                        <strong>Số điện thoại:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={16} style={{
                                    display: "flex",
                                    flexDirection: 'row',
                                    gap: 10
                                }}>
                                    <PatternFormat
                                        displayType='input'
                                        className='app-numeric-input'
                                        format='#### ### ###'
                                        value={contractDetail?.phone ?? ''}
                                        onValueChange={(values) => {
                                            let temp = cloneDeep(contractDetail) ?? {};
                                            temp['phone'] = values.value;
                                            setContractDetail(temp);
                                            setCheckCustomer({
                                                isChecked: false,
                                                isExist: false
                                            })
                                        }}
                                        placeholder="Nhập số điện thoại khách hàng"
                                    />
                                    <Button type='ghost' title='Kiểm tra khách hàng' icon={<CheckSquareOutlined style={{ color: '#0D6368' }} />} onClick={() => {
                                        managerServices.checkExistedCustomer$(contractDetail?.phone).pipe(take(1)).subscribe({
                                            next: (value) => {
                                                if (value.error) {
                                                    setCheckCustomer({
                                                        isChecked: true,
                                                        isExist: false
                                                    })
                                                } else {
                                                    setCheckCustomer({
                                                        isChecked: true,
                                                        isExist: value.length > 0
                                                    });
                                                    if (value.length > 0) {
                                                        let temp = cloneDeep(contractDetail) ?? {};
                                                        temp['fullName'] = value[0].fullName;
                                                        temp['email'] = value[0].email;
                                                        temp['address'] = value[0].address;
                                                        temp['customerID'] = value[0].userID;
                                                        setContractDetail(temp);
                                                    } else {
                                                        let temp = cloneDeep(contractDetail) ?? {};
                                                        temp['fullName'] = '';
                                                        temp['email'] = '';
                                                        temp['address'] = '';
                                                        temp['customerID'] = -1;
                                                        setContractDetail(temp);
                                                    }
                                                }
                                            }
                                        })
                                    }}></Button>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Row>
                                <Col span={6} className='__app-account-field'>
                                    <span>
                                        <strong>Khách Hàng: </strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={16}>
                                    <Input onChange={(args) => {
                                        let temp = cloneDeep(contractDetail) ?? {};
                                        temp['fullName'] = args.target.value;
                                        setContractDetail(temp);
                                    }}
                                        placeholder="Nhập tên khách hàng"
                                        value={contractDetail?.fullName}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {
                        checkCustomer.isChecked ? <Row className='__app-account-info-row'>
                            <Col span={12}>
                                <Row>
                                    <Col span={6} className='__app-account-field'>
                                    </Col>
                                    <span
                                        style={{
                                            color: checkCustomer.isExist ? 'green' : 'red'
                                        }}
                                    >{
                                            checkCustomer.isExist ? 'Đã có user trong hệ thống' : 'User chưa có trong hệ thống'
                                        }</span>
                                </Row>
                            </Col>
                        </Row> : <></>
                    }
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span>
                                <strong>Địa chỉ:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(contractDetail) ?? {};
                                temp['address'] = args.target.value;
                                setContractDetail(temp);
                            }}
                                placeholder="Nhập địa chỉ"
                                value={contractDetail?.address}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span>
                                <strong>Email:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(contractDetail) ?? {};
                                temp['email'] = args.target.value;
                                setContractDetail(temp);
                            }}
                                placeholder="Nhập địa chỉ"
                                value={contractDetail?.email}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field' style={{ alignItems: 'flex-start' }}>
                            <span>
                                <strong>Dịch vụ:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            {
                                renderServiceForms()
                            }
                            {
                                servicesForm.length < 5 ?
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const form = cloneDeep(servicesForm);
                                            form.push({
                                                'tempId': new Date().getTime().toString(),
                                                "note": '',
                                                "timeWorking": [],
                                                "totalPrice": 0,
                                                "servicePackID": '',
                                                "serviceTypeID": '',
                                                "startDate": '',
                                                "endDate": ''
                                            })
                                            setServiceForm(form);
                                        }}
                                    >Thêm dịch vụ</Button> : <></>
                            }
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span>
                                <strong>Phương thức thanh toán:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <Select
                                style={{ width: '100%' }}
                                options={[
                                    { value: 'Thanh toán trực tuyến', label: 'Thanh toán trực tuyến' },
                                    { value: 'Thanh toán tiền mặt', label: 'Thanh toán tiền mặt' },
                                ]}
                                placeholder='Chọn phương thức thanh toán'
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['paymentMethod'] = value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>

                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span>
                                <strong>Nhân viên tiếp nhận:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <UserPicker
                                listUser={staffList}
                                placeholder="Chọn nhân viên"
                                onChanged={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['staffID'] = value;
                                    setContractDetail(temp);
                                }}
                            ></UserPicker>
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span><strong>Ảnh Scan: </strong> <span className='__app-required-field'> *</span></span>
                        </Col>
                        <Col span={20}>
                            <div className="__app-images-upload-container">
                                <div className="__app-button-upload">
                                    {
                                        !isUpload ? <Button key='upload' icon={<CloudUploadOutlined />} onClick={() => {
                                            document.getElementById('uploadContract')?.click();
                                        }}>Tải ảnh</Button> : <Skeleton.Button active={true}></Skeleton.Button>
                                    }

                                </div>
                                <input
                                    id='uploadContract'
                                    type="file"
                                    accept="*"
                                    multiple={false}
                                    hidden={true}
                                    onChange={(args) => {
                                        setIsUpload(true);
                                        const file = Array.from(args.target.files as FileList);
                                        managerServices.uploadImageToFireBase$(file[0]).pipe(take(1)).subscribe({
                                            next: url => {
                                                const img = imageScanUrls;
                                                img.push(url as string);
                                                setImageScanUrls(img);
                                                setIsUpload(false);
                                            }
                                        });
                                    }}
                                />
                                <div>
                                    {
                                        imageScanUrls.reduce((acc, cur, index) => {
                                            acc.push(
                                                <img key={`image_contract_${index}`} src={cur} alt='' style={{ width: 150, height: 200 }} />
                                            )
                                            return acc;
                                        }, [] as React.ReactNode[])
                                    }
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Modal>
        </>
    )

    function renderServiceForms() {
        return servicesForm.reduce((acc, cur, currentIndex) => {
            acc.push(
                <Row
                    id={`service_${currentIndex}`}
                    key={`service_${currentIndex}`}
                    className='__app-service-form'
                    style={{ padding: 10, border: '1px solid #a5a5a5', borderRadius: 4, margin: '8px 0' }}>
                    <Col span={23}>
                        <Row
                            style={{ gap: 6 }}
                        >
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={12}>
                                    <Row>
                                        <Col className='__app-account-field' span={8}>
                                            <span>
                                                <strong>Tên dịch vụ:</strong> <span className='__app-required-field'> *</span>
                                            </span>
                                        </Col>
                                        <Col span={13}>
                                            <Select
                                                style={{ width: '100%' }}
                                                options={serviceList.reduce((acc_, cur_) => {
                                                    acc_.push({
                                                        value: cur_.serviceID,
                                                        label: cur_.name
                                                    })
                                                    return acc_;
                                                }, [])}
                                                value={cur.serviceID}
                                                placeholder='Dịch vụ'
                                                onChange={(value) => {
                                                    const temp = cloneDeep(servicesForm) ?? [];
                                                    temp[currentIndex]['serviceID'] = value
                                                    temp[currentIndex]['serviceTypeID'] = null;
                                                    const _serviceTypeList = serviceList.find(item => item.serviceID === value)?.typeList.reduce((acc: any, cur: any) => {
                                                        acc.push({
                                                            value: cur.id,
                                                            label: cur.name
                                                        })
                                                        return acc;
                                                    }, []);
                                                    temp[currentIndex]['serviceTypeList'] = _serviceTypeList;
                                                    setServiceForm(temp);
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={12}>
                                    <Row>
                                        <Col className='__app-account-field' span={8}>
                                            <span>
                                                <strong>Loại dịch vụ:</strong> <span className='__app-required-field'> *</span>
                                            </span>
                                        </Col>
                                        <Col span={13}>
                                            <Select
                                                style={{ width: '100%' }}
                                                options={cur?.serviceTypeList ?? []}
                                                placeholder='Loại dịch vụ'
                                                value={cur.serviceTypeID}
                                                onChange={(value) => {
                                                    let temp = cloneDeep(servicesForm) ?? [];
                                                    temp[currentIndex]['serviceTypeID'] = value;
                                                    setServiceForm(temp);
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>

                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Gói:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={20}>
                                    <Select
                                        style={{ width: '100%' }}
                                        options={servicePackList?.reduce((acc, cur) => {
                                            if (cur.status === 'ACTIVE') {
                                                acc.push({
                                                    value: cur.id,
                                                    label: `${cur.range} ${cur.unit}`
                                                })
                                            }
                                            return acc;
                                        }, [] as any)}
                                        placeholder='Loại dịch vụ'
                                        value={cur.servicePackID}
                                        onChange={(value) => {
                                            let temp = cloneDeep(servicesForm) ?? [];
                                            temp[currentIndex]['servicePackID'] = value;
                                            setServiceForm(temp);
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Ngày bắt đầu:</strong> <span className='__app-required-field'> *</span>
                                    </span>

                                </Col>
                                <Col span={20}>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        placeholder="Chọn ngày bắt đầu"
                                        value={cur.startDate !== '' ? dayjs(new Date(cur.startDate)) : null}
                                        onChange={(value) => {
                                            let temp = cloneDeep(servicesForm) ?? [];
                                            temp[currentIndex]['startDate'] = DateTime.fromJSDate(value?.toDate() as any).toFormat('yyyy-MM-dd');
                                            setServiceForm(temp);
                                        }} />
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Lịch làm việc:</strong> <span className='__app-required-field'> *</span>
                                    </span>

                                </Col>
                                <Col span={20}>
                                    <Select
                                        style={{ width: '100%' }}
                                        mode='multiple'
                                        value={cur.timeWorking}
                                        options={[
                                            { value: 'Thứ 2', label: 'Thứ 2' },
                                            { value: 'Thứ 3', label: 'Thứ 3' },
                                            { value: 'Thứ 4', label: 'Thứ 4' },
                                            { value: 'Thứ 5', label: 'Thứ 5' },
                                            { value: 'Thứ 6', label: 'Thứ 6' },
                                            { value: 'Thứ 7', label: 'Thứ 7' },
                                            { value: 'Chủ Nhật', label: 'Chủ Nhật' },
                                        ]}
                                        optionFilterProp='label'
                                        placeholder='Chọn Lịch'
                                        onChange={(values) => {
                                            if (values.length <= 3) {
                                                let temp = cloneDeep(servicesForm) ?? [];
                                                temp[currentIndex]['timeWorking'] = values;
                                                setServiceForm(temp);
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Thành tiền:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={20}>
                                    {
                                        cur?.serviceID && cur?.serviceTypeID && cur?.servicePackID ?
                                            <NumericFormat displayType="text" thousandSeparator=" " suffix=" vnđ" value={
                                                getTotalPrice(cur)
                                            } />
                                            : <>--</>
                                    }
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Ghi chú:</strong>
                                    </span>
                                </Col>
                                <Col span={20}>
                                    <TextArea
                                        placeholder="Nhập ghi chú"
                                        rows={2}
                                        value={cur.note}
                                        onChange={(value) => {
                                            let temp = cloneDeep(servicesForm) ?? [];
                                            temp[currentIndex]['note'] = value.target.value;
                                            setServiceForm(temp);
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Row>
                    </Col>
                    <Col span={1}>
                        <RestOutlined style={{ width: 18, height: 18, fontSize: 18 }} onClick={(e) => {
                            e.preventDefault();
                            const form = servicesForm.filter(item => { return item.tempId !== cur.tempId })
                            setServiceForm(form);
                        }} />
                    </Col>
                </Row>
            );
            return acc;
        }, [] as React.ReactNode[]);
    }

    function getTotalPrice(cur: any) {
        let pack = Number(servicePackList.find(item => item.id === cur.servicePackID)?.range ?? '0')
        const unit = servicePackList.find(item => item.id === cur.servicePackID)?.unit;
        if (unit === 'năm') {
            pack = pack * 12;
        }
        const servicePrice = serviceList.find(item => item.serviceID === cur['serviceID'])?.price ?? 0;
        const servicePackPercent = servicePackList.find(item => item.id === cur['servicePackID'])?.percentage ?? 0;
        const serviceTypePercent = serviceList.find(item => item.serviceID === cur['serviceID'])?.typeList.find((itemTL: any) => itemTL.id === cur['serviceTypeID'])?.percentage ?? 0;
        const total = (servicePrice * pack) - (servicePrice * (servicePackPercent / 100) * pack) + (servicePrice * (serviceTypePercent / 100) * pack);
        return total;
    }

    function getEndDate(cur: any) {
        const startDate = new Date(cur['startDate'] ?? null);
        const numberOfDay = Number(servicePackList.find(item => item.id === cur.servicePackID)?.range ?? '0') * 30;
        const endDate = new Date(startDate.setDate(startDate.getDate() + numberOfDay));
        return DateTime.fromJSDate(endDate).toFormat('yyyy-MM-dd');
    }
}