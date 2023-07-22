import { CloudUploadOutlined, FormOutlined, LoadingOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Input, Modal, Row, Select, Table, Tag, Upload } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { ManagerServices } from "../manager.service";
import { take } from "rxjs";
import { IUser } from "../../../IApp.interface";
import { IContract } from "../../common/object-interfaces/contract.interface";
import { cloneDeep } from "lodash";
import { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";
import { CommonUtility } from "../../utils/utilities";
import toast from "react-hot-toast";
import '../manager.scss';
import { UserPicker } from "../../common/components/user-picker-component";


interface IContractManagementProps {
}

export const ContractManagementComponent: React.FC<IContractManagementProps> = (props) => {

    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const managerServices = new ManagerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [contracts, setContract] = useState<IContract[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [isShowPopupCreate, setShowPopupCreate] = useState<boolean>(false);

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
            dataIndex: 'plantID',
            key: 'plantID',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
        },
        {
            title: `Tên Hợp Đồng`,
            dataIndex: 'name',
            key: 'name',
            showSorterTooltip: false,
            ellipsis: true,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'fullName',
            key: 'fullName',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
        },
        {
            title: 'Nhân viên tiếp nhận',
            dataIndex: 'height',
            key: 'height',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
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
                return <Tag color={statusColorMapping(value)}>{value}</Tag>
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

    function statusColorMapping(status: string) {
        switch (status) {
            case 'ONSALE': return 'green';
            case 'Dừng hoạt động': return 'error';
            default: return 'default';
        }
    }

    return (
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
                        placeholder="Tìm kiếm"
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
                    {/* <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Giới tính:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input></Input>
                        </Col>
                    </Row> */}
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Nhân viên tiếp nhận:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <UserPicker
                                listUser={[{ value: '001', label: 'Nhân viên 1'}]}
                                placeholder="Chọn nhân viên"
                                onChanged={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['staffID'] = value;
                                    setContractDetail(temp);
                                }}
                            ></UserPicker>
                        </Col>
                    </Row>
                    {/* <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <strong>Địa chỉ:</strong>
                        </Col>
                        <Col span={18}>
                            <Input></Input>
                        </Col>
                    </Row> */}
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