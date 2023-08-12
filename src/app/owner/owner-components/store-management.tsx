import { LeftOutlined, MoreOutlined, PlusOutlined, ReloadOutlined, UserOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Dropdown, Input, Modal, Row, Select, Skeleton, Table, Tabs, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { IPlant, PlantStatus, PlantStatusMapping } from "../../common/object-interfaces/plant.interface";
import { OwnerServices } from "../owner.service";
import { Observable, concat, finalize, switchMap, take, tap } from "rxjs";
import { cloneDeep } from "lodash";
import { IStore, StoreStatus, StoreStatusMapping } from "../../common/object-interfaces/store.interface";
import { toast } from "react-hot-toast";
import { CommonUtility } from "../../utils/utilities";
import { UserPicker } from "../../common/components/user-picker-component";
import { AccountStatusMapping } from "../../common/object-interfaces/account.interface";


interface IStoreManagementProps {

}

export const StoreManagementComponent: React.FC<IStoreManagementProps> = (props) => {

    const ownerServices = new OwnerServices();

    const [stores, setStore] = useState<any[]>([]);
    const [storesOnSearch, setStoreOnSearch] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [storeDetail, setStoreDetail] = useState<IStore | null>(null);
    const [isShowPopupCreate, setShowPopupCreate] = useState<boolean>(false);
    const [popUpConfirm, setPopUpConfirm] = useState<any>({
        isShow: false,
        storeID: ''
    });
    const [freeManagers, setFreeManagers] = useState<any[]>([]);
    const [changeManager, setChangeManager] = useState<any>({
        isChanged: false,
        managerID: null
    })
    const [tabKey, setTabKey] = useState<'plant' | 'staff'>('plant');
    const [isShowPopUpStaffAdd, setShowPopUpStaffAdd] = useState<boolean>(false);
    const [freeStaff, setFreeStaff] = useState<any[]>([]);

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        ownerServices.getStores$({ pageNo: 0, pageSize: 1000 }).pipe(take(1)).subscribe({
            next: data => {
                setStore(data);
                setStoreOnSearch(data);
                setFirstInit(true);
                setDataReady(true);
            }
        })
    }

    const tableUserColumns: ColumnsType<IStore> = [
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
                return <Tag color={CommonUtility.statusColorMapping(value)}>{StoreStatusMapping[value as StoreStatus]}</Tag>
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
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                {
                                    key: 'detail',
                                    label: <span
                                        onClick={(e) => {
                                            e.preventDefault();
                                            getStoreDetail(record.id);
                                            setFormMode('edit');
                                        }}
                                    >Xem chi tiết</span>
                                },
                                record.status === 'ACTIVE' ?
                                    {
                                        key: 'disableStore',
                                        label: <span
                                            onClick={() => {
                                                setPopUpConfirm({
                                                    isShow: true,
                                                    storeID: record.id
                                                });
                                            }}
                                        >Vô hiệu hoá cửa hàng</span>
                                    } : null,
                                record.status === 'INACTIVE' ?
                                    {
                                        key: 'reactive',
                                        label: <span
                                            onClick={() => {
                                                ownerServices.changeStatusStore$(record.id, 'ACTIVE').pipe(take(1)).subscribe({
                                                    next: (res) => {
                                                        if (res.error) {
                                                            toast.error(res.error);
                                                        } else {
                                                            toast.success('Hoạt động lại cửa hàng thành công.');
                                                            loadData();
                                                        }
                                                    }
                                                })
                                            }}
                                        >Hoạt động lại</span>
                                    } : null
                            ]
                        }}
                        placement='bottom'>
                        <MoreOutlined />
                    </Dropdown>
                </div>
            },
        }
    ]

    const plantTableColumn: ColumnsType<IPlant> = [
        {
            title: 'ID',
            dataIndex: 'plantID',
            key: 'plantID',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
            sorter: {
                compare: (acc, cur) => acc.plantID > cur.plantID ? 1 : acc.plantID < cur.plantID ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Tên Cây',
            dataIndex: 'name',
            key: 'name',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value, record, index) => {
                return <div className='__app-column-name-container'>
                    <Avatar shape='square' src={record.plantIMGList[0]?.url} />
                    <span className='__app-column-name'>{value}</span>
                </div>
            },
            sorter: {
                compare: (acc, cur) => acc.name > cur.name ? 1 : acc.name < cur.name ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value, record, index) => {
                return <div>
                    {record.showStorePlantModel?.quantity ?? 0}
                </div>
            },
            width: 200,
            sorter: {
                compare: (acc, cur) => acc.showPlantPriceModel.price > cur.showPlantPriceModel.price ? 1 : acc.showPlantPriceModel.price < cur.showPlantPriceModel.price ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value) => {
                return <Tag color={CommonUtility.statusColorMapping(value)}>{PlantStatusMapping[value as PlantStatus]}</Tag>
            },
            width: 200,
            sorter: {
                compare: (acc, cur) => acc.status > cur.status ? 1 : acc.status < cur.status ? -1 : 0
            },
            className: '__app-header-title'
        }
    ]

    const staffTableColumn: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
            sorter: {
                compare: (acc, cur) => acc.userID > cur.userID ? 1 : acc.userID < cur.userID ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: `Tên Nhân Viên`,
            dataIndex: 'fullName',
            key: 'fullName',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value, record, index) => {
                return <div>
                    <Avatar src={record.avatar} icon={<UserOutlined />} />
                    <span className='__app-column-full-name'>{value}</span>
                </div>
            },
            sorter: {
                compare: (acc, cur) => acc.fullName > cur.fullName ? 1 : acc.fullName < cur.fullName ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'address',
            key: 'address',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
            sorter: {
                compare: (acc, cur) => (acc.address ?? '') > (cur.address ?? '') ? 1 : (acc.address ?? '') < (cur.address ?? '') ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            showSorterTooltip: false,
            ellipsis: true,
            width: 150,
            className: '__app-header-title'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            showSorterTooltip: false,
            sorter: {
                compare: (acc, cur) => acc.status > cur.status ? 1 : acc.status < cur.status ? -1 : 0
            },
            className: '__app-header-title',
            ellipsis: true,
            render: (value) => {
                return <Tag color={CommonUtility.statusColorMapping(value)}>{AccountStatusMapping[value]}</Tag>
            },
            width: 200,
        },
    ]

    function getStoreDetail(storeId: string) {
        setDataReady(false);
        let tempStoreDetail = {} as IStore;
        ownerServices.getStore$(storeId).pipe(
            switchMap((res: any) => {
                tempStoreDetail = res;
                return ownerServices.getMembersByStoreID$(storeId, tempStoreDetail.managerID)
            }),
            switchMap((res) => {
                tempStoreDetail['staff'] = res;
                return ownerServices.getStorePlant$(storeId);
            }),
            finalize(() => {
                ownerServices.getMembers$('R003').pipe(take(1)).subscribe({
                    next: (res) => {
                        if (res) {
                            const newManagers = res.reduce((acc, cur) => {
                                if (CommonUtility.isNullOrUndefined(cur.storeID)) {
                                    acc.push({
                                        label: cur.fullName,
                                        value: cur.userID
                                    })
                                }
                                return acc;
                            }, []);
                            setFreeManagers(newManagers);
                        }
                    }
                });
                ownerServices.getMembers$('R004').pipe(take(1)).subscribe({
                    next: (res) => {
                        if (res) {
                            const newStaffs = res.reduce((acc, cur) => {
                                if (CommonUtility.isNullOrUndefined(cur.storeID)) {
                                    acc.push({
                                        label: cur.fullName,
                                        value: cur.userID
                                    })
                                }
                                return acc;
                            }, []);
                            setFreeStaff(newStaffs);
                        }
                    }
                })
            })
        ).subscribe({
            next: storePlants => {
                tempStoreDetail['storePlant'] = storePlants;
                setStoreDetail(tempStoreDetail);
                setDataReady(true);
            }
        })
    }

    function validateFormEdit() {
        let temp = cloneDeep(storeDetail);
        let manager = cloneDeep(changeManager)
        let result = {
            invalid: false,
            fields: [] as string[]
        }
        if (CommonUtility.isNullOrEmpty(temp?.storeName)) {
            result.invalid = true;
            result.fields.push('Tên cửa hàng');
        }
        if (CommonUtility.isNullOrEmpty(temp?.phone)) {
            result.invalid = true;
            result.fields.push('Số điện thoại');
        }
        if (CommonUtility.isNullOrEmpty(temp?.managerID) && CommonUtility.isNullOrUndefined(manager.managerID)) {
            result.invalid = true;
            result.fields.push('Quản lý');
        }
        return result;
    }

    return (
        <>
            {
                formMode === 'display' ?
                    <>
                        <div className='__app-toolbar-container' style={{ padding: '8px 24px' }}>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                                    //getDataStore
                                    setShowPopupCreate(true);
                                }}>Thêm Chi Nhánh</Button>
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(stores, tableUserColumns);
                                }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    loadData();
                                }}>Tải Lại</Button>
                            </div>
                            <div className='__app-toolbar-right-buttons'>
                                <Search
                                    style={{ marginLeft: 10 }}
                                    className='__app-search-box'
                                    placeholder="ID, Chi Nhánh"
                                    onSearch={(value) => {
                                        const columnsSearch = ['id', 'storeName']
                                        const data = CommonUtility.onTableSearch(value, stores, columnsSearch);
                                        setStoreOnSearch(data);
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
                                size="middle"
                                columns={tableUserColumns}
                                className='__app-user-info-table'
                                dataSource={storesOnSearch}
                                pagination={{
                                    pageSize: 9,
                                    total: stores.length,
                                    showTotal: (total, range) => {
                                        return <span>{range[0]} - {range[1]} / <strong>{total} Items</strong></span>
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
                                setChangeManager({
                                    managerID: null,
                                    isChanged: false
                                });
                                setFreeManagers([]);
                                setFreeStaff([]);
                            }} />
                            <div className="__app-title-form">CHI TIẾT CỬA HÀNG</div>
                        </div>
                        <div className="__app-content-container">
                            <div className="__app-main-info" style={{ flexDirection: 'column', gap: 8, paddingLeft: 40 }}>
                                <Row style={{ height: 31.6 }}>
                                    <Col span={12} className='__app-object-field align-center'>
                                        <strong>ID: </strong>
                                        {
                                            isDataReady ?
                                                <div style={{ marginLeft: 10 }}><strong>{storeDetail?.id}</strong></div>
                                                : <div style={{ width: '50%', marginLeft: '10%' }}><Skeleton.Input active={true} block={true} /></div>
                                        }
                                    </Col>
                                    <Col span={12} className='__app-object-field align-center'>
                                        <Row style={{ width: '100%' }}>
                                            <Col span={6}>
                                                <strong>Trạng thái: </strong>
                                            </Col>
                                            {
                                                isDataReady ?
                                                    <div><Tag color={CommonUtility.statusColorMapping(storeDetail?.status ?? '')}>{StoreStatusMapping[storeDetail?.status as StoreStatus]}</Tag></div>
                                                    : <div style={{ width: '50%' }}><Skeleton.Input active={true} block={true} /></div>
                                            }
                                        </Row>


                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12}>
                                        <Row>
                                            <Col span={6} className='__app-object-field align-center'>
                                                <strong>Tên cửa hàng:</strong>
                                            </Col>
                                            <Col span={17} >
                                                {
                                                    isDataReady ?
                                                        <Input value={storeDetail?.storeName}
                                                            onChange={(args) => {
                                                                let temp = cloneDeep(storeDetail) as IStore;
                                                                temp['storeName'] = args.target.value;
                                                                setStoreDetail(temp);
                                                            }}
                                                        />
                                                        : <Skeleton.Input block={true} active={true} />
                                                }
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={12}>
                                        <Row>
                                            <Col span={6} className='__app-object-field align-center'>
                                                <strong>Số điện thoại:</strong>
                                            </Col>
                                            <Col span={14} >
                                                {
                                                    isDataReady ?
                                                        <Input value={storeDetail?.phone}
                                                            onChange={(args) => {
                                                                let temp = cloneDeep(storeDetail) as IStore;
                                                                temp['phone'] = args.target.value;
                                                                setStoreDetail(temp);
                                                            }}
                                                        />
                                                        : <Skeleton.Input block={true} active={true} />
                                                }
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row style={{ height: 31.6 }}>
                                    <Col span={3} className='__app-object-field align-center'>
                                        <strong>Địa chỉ:</strong>
                                    </Col>
                                    <Col span={19} style={{ display: 'flex', alignItems: 'center' }}>
                                        {
                                            isDataReady ?
                                                <span>{storeDetail?.address}</span>
                                                : <Skeleton.Input block={true} active={true} />
                                        }

                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={3} className='__app-object-field align-center'>
                                        <strong>Quản lý:</strong>
                                    </Col>
                                    <Col span={19}>
                                        {
                                            isDataReady ?
                                                CommonUtility.isNullOrEmpty(storeDetail?.managerID) ?
                                                    <UserPicker
                                                        listUser={freeManagers}
                                                        onChanged={(value) => {
                                                            setChangeManager({
                                                                isChanged: true,
                                                                managerID: value
                                                            });
                                                        }}
                                                    /> : <div style={{ height: 31.6, display: 'flex', alignItems: 'center' }}>
                                                        <span>{storeDetail?.managerName}</span>
                                                    </div>
                                                : <Skeleton.Input block={true} active={true} />
                                        }

                                    </Col>
                                </Row>
                            </div>
                            <Divider style={{ width: '94%', margin: '12px 0', border: '1px solid #f0f0f0' }}></Divider>
                            <Tabs
                                className="__app-sub-tab-custom"
                                style={{ marginBottom: 0 }}
                                defaultActiveKey='plant'
                                type='card'
                                onChange={(key: any) => {
                                    setTabKey(key);
                                }}
                                items={[
                                    {
                                        label: 'Cây',
                                        key: 'plant',
                                        children: tabKey === 'plant' ?
                                            <div style={{
                                                padding: '8px 12px',
                                                border: '1px solid #000000',
                                                borderRadius: '0px 8px 8px 8px'
                                            }}>
                                                <Table
                                                    size='small'
                                                    tableLayout='auto'
                                                    columns={plantTableColumn}
                                                    className='__app-user-info-table'
                                                    dataSource={storeDetail ? storeDetail['storePlant'] : []}
                                                    pagination={{
                                                        pageSize: 3,
                                                        total: storeDetail ? storeDetail['storePlant']?.length : 0,
                                                        showTotal: (total, range) => {
                                                            return <span>{range[0]} - {range[1]} / <strong>{total} Items</strong></span>
                                                        }
                                                    }}
                                                />
                                            </div> : <></>,
                                    },
                                    {
                                        label: 'Nhân viên',
                                        key: 'staff',
                                        children: tabKey === 'staff' ?
                                            <div style={{
                                                padding: '8px 12px',
                                                border: '1px solid #000000',
                                                borderRadius: '0x 8px 8px 8px'
                                            }}>
                                                <Button type="primary" style={{ background: '#B3B3B3' }} icon={<PlusOutlined />}>Thêm nhân viên</Button>
                                                <Table
                                                    size='small'
                                                    tableLayout='auto'
                                                    columns={staffTableColumn}
                                                    className='__app-user-info-table'
                                                    dataSource={storeDetail ? storeDetail['staff'] : []}
                                                    pagination={{
                                                        pageSize: 3,
                                                        total: storeDetail ? storeDetail['staff']?.length : 0,
                                                        showTotal: (total, range) => {
                                                            return <span>{range[0]} - {range[1]} / <strong>{total} Items</strong></span>
                                                        }
                                                    }}
                                                />
                                            </div> : <></>,
                                    },
                                ]}
                            />

                            {
                                storeDetail?.status === 'ACTIVE' ?
                                    <div className="__app-action-button" style={{ marginTop: 10 }}>
                                        <Button type="primary" style={{ background: '#0D6368' }} onClick={() => {
                                            const validation = validateFormEdit();
                                            if (validation.invalid) {
                                                toast.error(`Vui lòng nhập đầy đủ thông tin ${validation.fields.join(', ')}.`);
                                                return;
                                            }
                                            let isCompleted = false;
                                            let hasError = false;
                                            const formEdit = {
                                                "storeID": storeDetail.id,
                                                "storeName": storeDetail.storeName,
                                                "phone": storeDetail.phone,
                                                "address": storeDetail.address,
                                                "districtID": storeDetail.districtID
                                            }
                                            const addEmployee = {
                                                "storeID": storeDetail.id,
                                                "employeeIDList": [
                                                    changeManager.managerID
                                                ]
                                            }
                                            const request$: Observable<any>[] = [];
                                            if (changeManager.isChanged !== false) {
                                                request$.push(ownerServices.updateStore$(formEdit));
                                                request$.push(ownerServices.addStoreEmployee$(addEmployee));
                                            } else {
                                                request$.push(ownerServices.updateStore$(formEdit).pipe(tap(() => isCompleted = true)));
                                            }
                                            concat(...request$).subscribe({
                                                next: res => {
                                                    if (res.error) {
                                                        hasError = true;
                                                    }
                                                    if (isCompleted) {
                                                        if (hasError) {
                                                            setFormMode('display');
                                                            setStoreDetail(null);
                                                            setChangeManager({
                                                                managerID: null,
                                                                isChanged: false
                                                            });
                                                            setFreeManagers([]);
                                                            setFreeStaff([]);
                                                            toast.error('Cập nhật thông tin thất bại.');
                                                        } else {
                                                            setFormMode('display');
                                                            setStoreDetail(null);
                                                            setChangeManager({
                                                                managerID: null,
                                                                isChanged: false
                                                            });
                                                            setFreeManagers([]);
                                                            setFreeStaff([]);
                                                            toast.success('Cập nhật thành công');
                                                        }
                                                    }
                                                }
                                            })
                                        }}>Lưu</Button>
                                    </div> : <></>
                            }

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
                            loadData();
                        }}
                    /> : <></>
            }
            {
                popUpConfirm.isShow ?
                    <Modal
                        width={500}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Vô hiệu cửa hàng
                            </span>
                        )}
                        footer={[
                            <Button type="default" onClick={() => {
                                setPopUpConfirm({
                                    isShow: false,
                                    storeID: ''
                                })
                            }}>Huỷ</Button>,
                            <Button type="primary"
                                style={{ background: '#5D050b' }}
                                onClick={() => {
                                    ownerServices.changeStatusStore$(popUpConfirm.storeID, 'INACTIVE').pipe(take(1)).subscribe({
                                        next: (res) => {
                                            if (res.error) {
                                                toast.error(res.error);
                                                setPopUpConfirm({
                                                    isShow: false,
                                                    storeID: ''
                                                })
                                            } else {
                                                setPopUpConfirm({
                                                    isShow: false,
                                                    storeID: ''
                                                })
                                                toast.success('Vô hiệu cửa hàng thành công.');
                                                loadData();
                                            }
                                        }
                                    })

                                }}>Vô hiệu</Button>
                        ]}
                        centered
                    >
                        <span>Vui lòng nhấn xác nhận để vô hiệu hoá cửa hàng trong hệ thống.</span>
                    </Modal> : <></>
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
        districtName: '',
        provinceName: '',
    });
    const [listProvince, setListProvince] = useState([]);
    const [listDistrict, setListDistrict] = useState([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);

    const ownerServices = new OwnerServices();

    useEffect(() => {
        if (!isFirstInit) {
            ownerServices.getProvince$().pipe(take(1)).subscribe({
                next: (res) => {
                    const result = res.reduce((acc: any[], cur: any) => {
                        acc.push({
                            value: cur.id,
                            label: cur.name
                        })
                        return acc;
                    }, []);
                    setListProvince(result);
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
            <Button key='save' style={{ background: '#0D6368' }} type='primary' onClick={() => {
                const validation = validateFormCreate();
                if (validation.invalid === false) {
                    const dataPost = {
                        storeName: storeDetail.storeName,
                        phone: storeDetail.phone,
                        address: `${storeDetail.address}, ${storeDetail.districtName}, ${storeDetail.provinceName}, Việt Nam`,
                        districtID: storeDetail.districtID,
                    }
                    ownerServices.createStore$(dataPost).pipe(take(1)).subscribe({
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
                } else {
                    toast.error(`Vui lòng nhập thông tin ${validation.fields.join(', ')}`);
                }
            }}>Lưu</Button>
        );
        return nodes;
    }

    function validateFormCreate() {
        let temp = cloneDeep(storeDetail);
        let result = {
            invalid: false,
            fields: [] as string[]
        }

        if (CommonUtility.isNullOrEmpty(temp.storeName)) {
            result.invalid = true;
            result.fields.push('Tên chi nhánh');
        }
        if (CommonUtility.isNullOrEmpty(temp.phone)) {
            result.invalid = true;
            result.fields.push('Số điện thoại');
        }
        if (CommonUtility.isNullOrEmpty(temp.address)) {
            result.invalid = true;
            result.fields.push('Địa chỉ');
        }
        if (CommonUtility.isNullOrEmpty(temp.provinceName)) {
            result.invalid = true;
            result.fields.push('Tỉnh/ Thành');
        }
        if (CommonUtility.isNullOrEmpty(temp.districtName)) {
            result.invalid = true;
            result.fields.push('Quận/ Huyện');
        }

        return result;
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
                                <strong>Tỉnh/TP: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                optionFilterProp='label'
                                style={{ width: '100%' }}
                                options={listProvince}
                                onChange={(value) => {
                                    let temp = cloneDeep(storeDetail) ?? {};
                                    temp['districtID'] = '';
                                    temp['districtName'] = '';
                                    const provinceName = (listProvince.find((item: any) => item.value === value) as any)?.label ?? '';
                                    temp['provinceName'] = provinceName;
                                    setBonsaitDetail(temp);
                                    ownerServices.getDistrict$(value).pipe(take(1)).subscribe({
                                        next: value => {
                                            const result = value.reduce((acc: any[], cur: any) => {
                                                acc.push({
                                                    value: cur.id,
                                                    label: cur.name
                                                })
                                                return acc;
                                            }, []);
                                            setListDistrict(result);
                                        }
                                    })
                                }}
                                placeholder='Chọn Quận'
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Quận/Huyện: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                optionFilterProp='label'
                                style={{ width: '100%' }}
                                options={listDistrict}
                                onChange={(value) => {
                                    let temp = cloneDeep(storeDetail) ?? {};
                                    const districtName = (listDistrict.find((item: any) => item.value === value) as any)?.label ?? '';
                                    temp['districtName'] = districtName;
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

