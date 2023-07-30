import { CloudUploadOutlined, FormOutlined, LeftOutlined, LoadingOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, DatePicker, Divider, Dropdown, Input, Modal, Row, Select, Skeleton, Table, Tag, Upload } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { ManagerServices } from "../manager.service";
import { forkJoin, take } from "rxjs";
import { IUser } from "../../../IApp.interface";
import { ContractStatus, ContractStatusMapping, IContract, IContractDetail } from "../../common/object-interfaces/contract.interface";
import { cloneDeep } from "lodash";
import { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";
import { CommonUtility } from "../../utils/utilities";
import toast from "react-hot-toast";
import '../manager.scss';
import { UserPicker } from "../../common/components/user-picker-component";
import { DateTime } from "luxon";
import TextArea from "antd/es/input/TextArea";


interface IContractManagementProps {
}

export const ContractManagementComponent: React.FC<IContractManagementProps> = (props) => {

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

    useEffect(() => {
        if (!isFirstInit) {
            managerServices.getContracts$().pipe(take(1)).subscribe({
                next: data => {
                    setContract(data);
                    setContractOnSearch(data);
                    setFirstInit(true);
                    setDataReady(true);
                }
            })
        }
    }, [isFirstInit, contracts, managerServices]);

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
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            showSorterTooltip: false,
            // sorter: {
            //     compare: (acc, cur) => acc.status > cur.status ? 1 : acc.status < cur.status ? -1 : 0
            // },
            ellipsis: true,
            render: (value) => {
                return <Tag color={CommonUtility.statusColorMapping(value)}>{ContractStatusMapping[value]}</Tag>
            },
            width: 200,
            className: '__app-header-title'
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
                    }} icon={<FormOutlined />} />
                </div>
            },
            className: '__app-header-title'
        }
    ]

    function getContractDetail(id: string) {
        setDataReady(false);
        forkJoin([managerServices.getContractDetail$(id), managerServices.getStaffForContract$()]).subscribe({
            next: (values) => {
                const staffListOption = values[1].reduce((acc, cur) => {
                    acc.push({
                        value: cur.staffID,
                        label: cur.staffName
                    })
                    return acc;
                }, [] as any)
                setStaffList(staffListOption);
                setContractDetail(values[0]);
                setDataReady(true);
            }
        });
    }

    return (
        <>
            {
                formMode === 'display' ?
                    <>
                        <div className='__app-toolbar-container'>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                                    setShowPopupCreate(true);
                                }}>Tạo Hợp Đồng</Button>
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(contracts, tableUserColumns);
                                }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    setDataReady(false);
                                    managerServices.getContracts$().pipe(take(1)).subscribe({
                                        next: data => {
                                            setContract(data);
                                            setContractOnSearch(data);
                                            setDataReady(true);
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
                                        setContractOnSearch(data);
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
                                dataSource={contractsOnSearch}
                                pagination={{
                                    pageSize: 7,
                                    total: contractsOnSearch.length,
                                    showTotal: (total, range) => {
                                        return <span>{total} items</span>
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
                    <div className="__app-layout-container form-edit">
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
                                            <Row>{contractDetail[0]?.showContractModel?.email ?? 'No Email'}</Row>
                                            <Row>{contractDetail[0]?.showContractModel?.phone}</Row>
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
                                                                <Col span={16}>{cur.showServicePackModel?.packRange}</Col>
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
                                        <Col span={5} style={{ fontWeight: 500 }}>Tổng thanh toán:</Col><Col><NumericFormat displayType='text' thousandSeparator=' ' suffix=' vnđ' value={contractDetail[0]?.showContractModel?.total} /></Col>
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
                                                    <UserPicker
                                                        listUser={staffList}
                                                        onChanged={(value) => {
                                                            setStaffForContract(value);
                                                        }}
                                                    />
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
                            {
                                contractDetail[0]?.showContractModel?.status === 'WAITING' ?
                                    <div className="__app-action-button">
                                        <Button type="primary" onClick={() => {
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
                                                        toast.success('Duyệt Hợp đồng thành công');
                                                    } else {
                                                        toast.error('Duyệt Hợp đồng thất bại');
                                                    }
                                                }
                                            })
                                        }}>Duyệt</Button>
                                        <Button type="default" onClick={() => {
                                            //todo
                                            setFormMode('display');
                                            setContractDetail([]);
                                        }}>Từ chối</Button>
                                    </div> : <></>
                            }
                            {
                                contractDetail[0]?.showContractModel?.status !== 'WAITING' ?
                                    <div className="__app-action-button">
                                        {
                                            contractDetail[0]?.showContractModel?.status === 'APPROVED' ?
                                                <Button type="primary" onClick={() => {
                                                    if (imageScanUrls.length > 0) {
                                                        managerServices.activeContract$(imageScanUrls, contractDetail[0]?.showContractModel?.id as string).pipe(take(1)).subscribe({
                                                            next: (res) => {
                                                                if (res) {
                                                                    setFormMode('display');
                                                                    setContractDetail([]);
                                                                    setImageScanUrls([]);
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

                                        <Button style={{ width: 200, backgroundColor: '#8E0000' }} type="primary" onClick={() => {
                                            //todo
                                            setFormMode('display');
                                            setContractDetail([]);
                                        }}>Huỷ Hợp Đồng</Button>
                                    </div> : <></>
                            }

                        </div>
                    </div>
                    : <></>
            }
        </>
    )
}

const FormCreateContractDialog: React.FC<any> = (props: any) => {
    const [contractDetail, setContractDetail] = useState<any>(null);
    const [isUpload, setIsUpload] = useState(false);
    const [imageScanUrls, setImageScanUrls] = useState<string[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [serviceList, setServiceList] = useState<any[]>([]);
    const [serviceTypeList, setServiceTypeList] = useState<any[]>([]);
    const [servicePackList, setServicePackTypeList] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const managerServices = new ManagerServices();

    useEffect(() => {
        if (!isFirstInit) {
            forkJoin([managerServices.getStaffForContract$(), managerServices.getService$(), managerServices.getServicePacks$()]).subscribe({
                next: values => {
                    const staffListOption = values[0].reduce((acc, cur) => {
                        acc.push({
                            value: cur.staffID,
                            label: cur.staffName
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
            <Button key='save' type='primary' onClick={() => {
                const dataPost = {
                    "title": `Contract ${DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd')}`,
                    "fullName": contractDetail['fullName'],
                    "phone": contractDetail['phone'] ?? '',
                    "address": contractDetail['address'] ?? '',
                    "storeID": managerServices.storeId,
                    "deposit": contractDetail['deposit'] ?? 0,
                    "paymentMethod": contractDetail['paymentMethod'] ?? '',
                    "paymentTypeID": contractDetail['paymentTypeID'] ?? '',
                    "customerID": null,
                    "email": '',
                    "detailModelList": [
                        {
                            "note": contractDetail['note'] ?? '',
                            "timeWorking": contractDetail['timeWorking'] ?? '',
                            "totalPrice": 0,
                            "servicePackID": contractDetail['servicePackID'] ?? '',
                            "serviceTypeID": contractDetail['serviceTypeID'] ?? '',
                            "startDate": contractDetail['startDate'] ?? '',
                            "endDate": contractDetail['endDate'] ?? ''
                        }
                    ],
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
                width={600}
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
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Khách Hàng: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(contractDetail) ?? {};
                                temp['fullName'] = args.target.value;
                                setContractDetail(temp);
                            }}
                                placeholder="Nhập tên khách hàng"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Số điện thoại:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(contractDetail) ?? {};
                                temp['phone'] = args.target.value;
                                setContractDetail(temp);
                            }}
                                placeholder="Nhập số điện thoại khách hàng"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Địa chỉ:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(contractDetail) ?? {};
                                temp['address'] = args.target.value;
                                setContractDetail(temp);
                            }}
                                placeholder="Nhập địa chỉ"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Dịch vụ:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                options={serviceList.reduce((acc, cur) => {
                                    acc.push({
                                        value: cur.serviceID,
                                        label: cur.name
                                    })
                                    return acc;
                                }, [])}
                                placeholder='Dịch vụ'
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['serviceID'] = value;
                                    temp['serviceTypeID'] = null;
                                    const _serviceTypeList = serviceList.find(item => item.serviceID === value)?.typeList.reduce((acc: any, cur: any) => {
                                        acc.push({
                                            value: cur.id,
                                            label: cur.name
                                        })
                                        return acc;
                                    }, []);
                                    setServiceTypeList(_serviceTypeList);
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Loại dịch vụ:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                value={contractDetail?.serviceTypeID}
                                options={serviceTypeList}
                                placeholder='Loại dịch vụ'
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['serviceTypeID'] = value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Gói:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                options={servicePackList?.reduce((acc, cur) => {
                                    if (cur.status === 'ACTIVE') {
                                        acc.push({
                                            value: cur.id,
                                            label: cur.range
                                        })
                                    }
                                    return acc;
                                }, [] as any)}
                                placeholder='Loại dịch vụ'
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['servicePackID'] = value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Thành tiền:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            {
                                contractDetail?.serviceID && contractDetail?.serviceTypeID && contractDetail?.servicePackID ?
                                    <NumericFormat displayType="text" thousandSeparator=" " suffix=" vnđ" value={
                                        getTotalPrice()
                                    } />
                                    : <>--</>
                            }
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Ngày bắt đầu:</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={18}>
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Chọn ngày bắt đầu"
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['startDate'] = DateTime.fromJSDate(value?.toDate() as any).toFormat('yyyy-MM-dd');
                                    setContractDetail(temp);
                                }} />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Ngày kết thúc:</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={18}>
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Chọn ngày kết thúc"
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['endDate'] = DateTime.fromJSDate(value?.toDate() as any).toFormat('yyyy-MM-dd');
                                    setContractDetail(temp);
                                }} />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Lịch làm việc:</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                options={[
                                    { value: 'Thứ 2', label: 'Thứ 2' },
                                    { value: 'Thứ 3', label: 'Thứ 3' },
                                    { value: 'Thứ 4', label: 'Thứ 4' },
                                    { value: 'Thứ 5', label: 'Thứ 5' },
                                    { value: 'Thứ 6', label: 'Thứ 6' },
                                    { value: 'Thứ 7', label: 'Thứ 7' },
                                    { value: 'Chủ Nhật', label: 'Chủ Nhật' },
                                ]}
                                placeholder='Chọn Lịch'
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['timeWorking'] = value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Phương thức thanh toán:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                options={[
                                    { value: 'PT001', label: 'Thanh toán trước 50%' },
                                    { value: 'PT002', label: 'Thanh toán trước 80%' },
                                    { value: 'PT003', label: 'Thanh toán hoàn toàn' },
                                ]}
                                placeholder='Chọn phương thức thanh toán'
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['paymentTypeID'] = value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Loại thanh toán:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                options={[
                                    { value: 'Thanh toán online', label: 'Thanh toán online' },
                                    { value: 'Thanh toán tiền mặt', label: 'Thanh toán tiền mặt' },
                                ]}
                                placeholder='Chọn loại thanh toán'
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['paymentMethod'] = value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Tiền đặt cọc:</strong>
                            </span>
                        </Col>
                        <Col span={18}>
                            <NumericFormat className="app-numeric-input" thousandSeparator=" " defaultValue={0} onChange={(args) => {
                                let temp = cloneDeep(contractDetail) ?? {};
                                temp['deposit'] = Number(args.target.value);
                                setContractDetail(temp);
                            }} />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Nhân viên tiếp nhận:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
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
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Ghi chú:</strong>
                            </span>
                        </Col>
                        <Col span={18}>
                            <TextArea
                                placeholder="Nhập ghi chú"
                                rows={2}
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['note'] = value.target.value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <strong>Ảnh Scan: </strong> <span className='__app-required-field'> *</span>
                        </Col>
                        <Col span={18}>
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
                                        imageScanUrls.reduce((acc, cur) => {
                                            acc.push(
                                                <img src={cur} alt='' style={{ width: 150, height: 200 }} />
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

    function getTotalPrice() {
        let duration = ((new Date(contractDetail['startDate']).getTime() - new Date(contractDetail['startDate']).getTime()) / (1000*60*60*24)) / 30;
        duration = duration > 1 ? duration : 1;
        const servicePrice = serviceList.find(item => item.serviceID === contractDetail['serviceID'])?.price ?? 0;
        const servicePackPercent = servicePackList.find(item => item.id === contractDetail['servicePackID'])?.percentage ?? 0;
        const serviceTypePercent = serviceList.find(item => item.serviceID === contractDetail['serviceID'])?.typeList.find((itemTL: any) => itemTL.id === contractDetail['serviceTypeID'])?.percentage ?? 0;
        const total = (servicePrice * duration) - (servicePrice * (servicePackPercent / 100)) + (servicePrice * (serviceTypePercent / 100));
        return total;
    }

    // function renderImages() {
    //     const elements: JSX.Element[] = images.reduce((acc, cur) => {
    //         acc.push(
    //             <span>{cur.name}</span>
    //         )
    //         return acc;
    //     }, [] as JSX.Element[]);
    //     return elements;
    // }
}