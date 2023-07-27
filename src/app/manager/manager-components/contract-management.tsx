import { CloudUploadOutlined, FormOutlined, LeftOutlined, LoadingOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Dropdown, Input, Modal, Row, Select, Skeleton, Table, Tag, Upload } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { ManagerServices } from "../manager.service";
import { take } from "rxjs";
import { IUser } from "../../../IApp.interface";
import { ContractStatus, ContractStatusMapping, IContract, IContractDetail } from "../../common/object-interfaces/contract.interface";
import { cloneDeep } from "lodash";
import { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";
import { CommonUtility } from "../../utils/utilities";
import toast from "react-hot-toast";
import '../manager.scss';
import { UserPicker } from "../../common/components/user-picker-component";
import { DateTime } from "luxon";


interface IContractManagementProps {
}

export const ContractManagementComponent: React.FC<IContractManagementProps> = (props) => {

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const managerServices = new ManagerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [contracts, setContract] = useState<IContract[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [isShowPopupCreate, setShowPopupCreate] = useState<boolean>(false);
    const [contractDetail, setContractDetail] = useState<IContractDetail[]>([])
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [staffList, setStaffList] = useState<any[]>([]);

    useEffect(() => {
        if (!isFirstInit) {
            managerServices.getContracts$().pipe(take(1)).subscribe({
                next: data => {
                    setContract(data);
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
            dataIndex: 'height',
            key: 'height',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
            className: '__app-header-title',
            render: (value) => {
                return <span>{value ?? '--'}</span>
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
        managerServices.getContractDetail$(id).pipe(take(1)).subscribe({
            next: (response: IContractDetail[]) => {
                if (response) {
                    setContractDetail(response);
                    setDataReady(true);
                }
            }
        });
        managerServices.getStaffForContract$().pipe(take(1)).subscribe({
            next: (value) => {
                const staffListOption = value.reduce((acc, cur) => {
                    acc.push({
                        value: cur.userID,
                        label: cur.fullName
                    })
                    return acc;
                }, [] as any)
                setStaffList(staffListOption);
            }
        })
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
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => { }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => { }}>Tải Lại</Button>
                            </div>
                            <div className='__app-toolbar-right-buttons'>
                                <Search
                                    style={{ marginLeft: 10 }}
                                    className='__app-search-box'
                                    placeholder="ID, Tên hợp đồng"
                                    onSearch={(value) => {
                                        // const accountSearched = accounts.reduce((acc, cur) => {
                                        //     if (cur.fullName.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                                        //         acc.push(cur);
                                        //     } else if (cur.phone.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                                        //         acc.push(cur);
                                        //     } else if (cur.email.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                                        //         acc.push(cur);
                                        //     }
                                        //     return acc;
                                        // }, []);
                                        // setAccountsOnSearch(accountSearched);
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
                                dataSource={contracts}
                                pagination={{
                                    pageSize: 7,
                                    total: contracts.length,
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
                                                contractDetail[0]?.showContractModel?.showStaffModel ?
                                                    <span>{ }</span> :
                                                    <UserPicker
                                                        listUser={staffList}
                                                        onChanged={(value) => {

                                                        }}
                                                    />
                                            }
                                        </Col>
                                    </Row>
                                    {
                                        contractDetail[0]?.showContractModel?.status === 'DENIED' ?
                                            <>
                                                <Row>
                                                    <Col span={5} style={{ fontWeight: 500 }}>Ngày từ chối:</Col>
                                                    <Col>{contractDetail[0]?.showContractModel.rejectedDate}</Col>
                                                </Row>
                                                <Row>
                                                    <Col span={5} style={{ fontWeight: 500 }}>Lý do từ chối:</Col>
                                                    <Col>{contractDetail[0]?.showContractModel.reason}</Col>
                                                </Row>
                                            </> : <></>
                                    }
                                    {
                                        contractDetail[0]?.showContractModel?.status === 'APPROVE' ?
                                            <>
                                                <Row>
                                                    <Col span={5} style={{ fontWeight: 500 }}>Ngày duyệt:</Col>
                                                    <Col>{contractDetail[0]?.showContractModel.approvedDate}</Col>
                                                </Row>
                                                <Row>
                                                    <Col span={5} style={{ fontWeight: 500 }}>Lý do từ chối:</Col>
                                                    <Col>{contractDetail[0]?.showContractModel.reason}</Col>
                                                </Row>
                                            </> : <></>
                                    }
                                </Col>
                            </div>
                            <div className="__app-action-button">
                                <Button type="primary" onClick={() => {
                                    //todo
                                    setFormMode('display');
                                    setContractDetail([]);
                                }}>Duyệt</Button>
                                <Button type="default" onClick={() => {
                                    //todo
                                    setFormMode('display');
                                    setContractDetail([]);
                                }}>Từ chối</Button>
                            </div>
                        </div>
                    </div>
                    : <></>
            }
        </>
    )
}

const FormCreateContractDialog: React.FC<any> = (props: any) => {
    const [contractDetail, setContractDetail] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);

    const managerServices = new ManagerServices();

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
                if (props.onSave) {
                    props.onSave(contractDetail);
                }
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
                    {/* <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Ngày bắt đầu:</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={18}>
                            <Select
                                defaultValue='001'
                                style={{ width: '100%' }}
                                options={[
                                    { value: '001', label: 'Chi Nhánh 1' },
                                    { value: '002', label: 'Chi Nhánh 2' },
                                    { value: '003', label: 'Chi Nhánh 3' },
                                ]}
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['storeId'] = value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row> */}
                    {/* <Divider className='__app-divider-no-margin'></Divider> */}
                    {/* <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Thời hạn:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input
                                onChange={(args) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['fullName'] = args.target.value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row> */}
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
                                <strong>Nhân viên tiếp nhận:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <UserPicker
                                listUser={[{ value: '001', label: 'Nhân viên 1' }]}
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
                            <strong>Ảnh Scan: </strong> <span className='__app-required-field'> *</span>
                        </Col>
                        <Col span={18}>
                            <div className="__app-images-upload-container">
                                <div className="__app-list-images">
                                    {renderImages()}
                                </div>
                                <div className="__app-button-upload">
                                    <Button key='upload' icon={<CloudUploadOutlined />} onClick={() => {
                                        document.getElementById('upload')?.click();
                                    }}>Tải ảnh</Button>
                                </div>
                                <input
                                    id='upload'
                                    type="file"
                                    accept="*"
                                    multiple={true}
                                    hidden={true}
                                    onChange={(args) => {
                                        const files = Array.from(args.target.files as FileList);
                                        setImages(files);
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            </Modal>
        </>
    )

    function renderImages() {
        const elements: JSX.Element[] = images.reduce((acc, cur) => {
            acc.push(
                <span>{cur.name}</span>
            )
            return acc;
        }, [] as JSX.Element[]);
        return elements;
    }
}