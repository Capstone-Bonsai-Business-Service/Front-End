import { FormOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Input, Modal, Row, Select, Skeleton, Table, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IPlant } from "../../common/object-interfaces/plant.interface";
import { NumericFormat } from "react-number-format";
import { OwnerServices } from "../owner.service";
import { take } from "rxjs";
import { cloneDeep } from "lodash";
import { IStore } from "../../common/object-interfaces/store.interface";
import { toast } from "react-hot-toast";
import { CommonUtility } from "../../utils/utilities";


interface IStoreManagementProps {

}

export const StoreManagementComponent: React.FC<IStoreManagementProps> = (props) => {

    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ownerServices = new OwnerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [stores, setStore] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [storeDetail, setStoreDetail] = useState<IStore | null>(null);
    const [isShowPopupCreate, setShowPopupCreate] = useState<boolean>(false);

    useEffect(() => {
        if (!isFirstInit) {
            ownerServices.getStores$({ pageNo: 1, pageSize: 1000 }).pipe(take(1)).subscribe({
                next: data => {
                    setStore(data);
                    setFirstInit(true);
                    setDataReady(true);
                }
            })
        }
    }, [isFirstInit, stores, ownerServices]);

    const tableUserColumns: ColumnsType<IPlant> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
        },
        {
            title: 'Tên Chi Nhánh',
            dataIndex: 'storeName',
            key: 'storeName',
            showSorterTooltip: false,
            ellipsis: true,
            // render: (value, record, index) => {
            //     return <div className='__app-column-name-container'>
            //         <Avatar shape='square' src={record.plantIMGList[0]?.url} />
            //         <span className='__app-column-name'>{value}</span>
            //     </div>
            // },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            showSorterTooltip: false,
            ellipsis: true,
            width: 200,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            showSorterTooltip: false,
            ellipsis: true,
            width: 150,
        },
        {
            title: 'Quản lý',
            dataIndex: 'managerName',
            key: 'managerName',
            showSorterTooltip: false,
            ellipsis: true,
            width: 200,
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
                return <Tag color={statusColorMapping(value)}>{value}</Tag>
            },
            width: 150,
        },
        {
            title: '',
            dataIndex: 'command',
            align: 'center',
            width: 70,
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
            {
                formMode === 'display' ?
                    <>
                        <div className='__app-toolbar-container'>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                                    //getDataStore
                                    setShowPopupCreate(true);
                                }}>Thêm Chi Nhánh</Button>
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(stores, tableUserColumns);
                                }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    setDataReady(false);
                                    ownerServices.getStores$({ pageNo: 0, pageSize: 1000 }).pipe(take(1)).subscribe({
                                        next: data => {
                                            setStore(data);
                                            setDataReady(true);
                                        }
                                    })
                                }}>Tải Lại</Button>
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
                                tableLayout='fixed'
                                columns={tableUserColumns}
                                className='__app-user-info-table'
                                dataSource={stores}
                                pagination={{
                                    pageSize: 7,
                                    total: stores.length,
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
                    <div className="__app-layout-container form-edit">
                        <div className="__app-top-action">
                            <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                                setFormMode('display');
                                setStoreDetail(null);
                            }} />
                            <div className="__app-title-form">Chi tiết</div>
                        </div>
                        <div className="__app-content-container">
                            <div className="__app-main-info">
                                <div className="__app-images">
                                    {/* <div className="__app-list-images">
                                        {
                                            bindingListImage()
                                        }
                                    </div> */}
                                    {/* <Image
                                        style={{ borderRadius: 4 }}
                                        preview={false}
                                        width={350}
                                        height={300}
                                        src={imageUrl}
                                    /> */}
                                </div>
                                <div className="__app-plain-info">
                                    <Row style={{ height: 31.6 }}>
                                        <Col span={10} className='__app-object-field align-center'>
                                            <strong>ID: </strong>
                                            {
                                                isDataReady ?
                                                    <div style={{ marginLeft: 10 }}><strong>{storeDetail ? 'Test' : ''}</strong></div>
                                                    : <div style={{ width: '50%', marginLeft: '10%' }}><Skeleton.Input active={true} block={true} /></div>
                                            }
                                        </Col>
                                        <Col span={10} className='__app-object-field align-center'>
                                            <strong>Trạng thái: </strong>
                                            {
                                                isDataReady ?
                                                    <div style={{ marginLeft: 10 }}><span>{storeDetail ? 'Test' : ''}</span></div>
                                                    : <div style={{ width: '50%', marginLeft: '10%' }}><Skeleton.Input active={true} block={true} /></div>
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Tên cây:</strong>
                                        </Col>
                                        <Col span={17} >
                                            {
                                                isDataReady ?
                                                    <Input defaultValue={storeDetail ? 'Test' : ''} />
                                                    : <Skeleton.Input block={true} active={true} />
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Chiều cao:</strong>
                                        </Col>
                                        <Col span={17}>
                                            {
                                                isDataReady ?
                                                    <NumericFormat
                                                        className="app-numeric-input"
                                                        value={storeDetail ? 'Test' : ''}
                                                        onValueChange={(values) => {
                                                            // let temp = cloneDeep(storeDetail) ?? {};
                                                            // temp['height'] = values.floatValue as number;
                                                            // setBonsaitDetail(temp);
                                                        }}
                                                        placeholder="Nhập chiều cao"
                                                        thousandSeparator=" "
                                                    />
                                                    : <Skeleton.Input block={true} active={true} />
                                            }

                                        </Col>
                                    </Row>
                                </div>
                            </div>
                            {/* <div className="__app-description">
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 8 }}>
                                    <span style={{ padding: '0 0 0 8px' }}><strong>Mô tả:</strong></span>
                                    {
                                        isDataReady ?
                                            <TextArea rows={5} defaultValue={storeDetail?.description}></TextArea>
                                            : <Skeleton paragraph={{ rows: 3 }} active={true} />
                                    }

                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 8 }}>
                                    <span style={{ padding: '0 0 0 8px' }}><strong>Lưu ý:</strong></span>
                                    {
                                        isDataReady ?
                                            <TextArea rows={5} defaultValue={storeDetail?.careNote}></TextArea>
                                            : <Skeleton paragraph={{ rows: 3 }} active={true} />
                                    }

                                </div>
                            </div> */}
                            <div className="__app-action-button">
                                <Button type="primary" onClick={() => {

                                }}>Lưu</Button>
                            </div>
                        </div>
                    </div>
                    : <></>
            }
            {
                isShowPopupCreate ?
                    <FormCreateStoreDialog
                        onCancel={() => { setShowPopupCreate(false) }}
                        onSave={(data: any) => {
                            toast.success('Thêm chi nhánh thành công');
                            setShowPopupCreate(false);
                            setDataReady(false);
                            ownerServices.getStores$({ pageNo: 0, pageSize: 1000 }).pipe(take(1)).subscribe({
                                next: data => {
                                    setStore(data);
                                    setDataReady(true);
                                }
                            })
                        }}
                    /> : <></>
            }
        </>

    )
}

const FormCreateStoreDialog: React.FC<any> = (props: any) => {
    const [storeDetail, setBonsaitDetail] = useState<any>({
        storeName: '',
        phone: '',
        address: '',
        districtID: '',
    });
    const [listDistrict, setListDistrict] = useState([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);

    const ownerServices = new OwnerServices();

    useEffect(() => {
        if (!isFirstInit) {
            ownerServices.getDistrict$().pipe(take(1)).subscribe({
                next: (res) => {
                    const result = res.reduce((acc: any[], cur: any) => {
                        acc.push({
                            value: cur.id,
                            label: cur.name
                        })
                        return acc;
                    }, []);
                    setListDistrict(result);
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
                ownerServices.createStore$(storeDetail).pipe(take(1)).subscribe({
                    next: (res) => {
                        if (res) {
                            if (props.onSave) {
                                props.onSave(res);
                            }
                        } else {
                            toast.error('Tạo chi nhánh thất bại.');
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
                        Thêm Chi Nhánh
                    </span>
                )}
                footer={getRenderFooterButton()}
                centered
            >
                <div className='__app-dialog-create-object'>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Tên chi nhánh: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(storeDetail) ?? {};
                                temp['storeName'] = args.target.value;
                                setBonsaitDetail(temp);
                            }}
                                placeholder="Nhập tên chi nhánh"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Số điện thoại: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(storeDetail) ?? {};
                                temp['phone'] = args.target.value;
                                setBonsaitDetail(temp);
                            }}
                                placeholder="Nhập số điện thoại"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Địa chỉ: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(storeDetail) ?? {};
                                temp['address'] = args.target.value;
                                setBonsaitDetail(temp);
                            }}
                                placeholder="Nhập địa chỉ"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Quận: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                optionFilterProp='label'
                                style={{ width: '100%' }}
                                options={listDistrict}
                                onChange={(value) => {
                                    let temp = cloneDeep(storeDetail) ?? {};
                                    temp['districtID'] = value;
                                    setBonsaitDetail(temp);
                                }}
                                placeholder='Chọn Quận'
                            />
                        </Col>
                    </Row>
                </div>
            </Modal>
        </>
    )
}