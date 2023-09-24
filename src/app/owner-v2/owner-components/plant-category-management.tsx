import { MoreOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Divider, Table, Tag, Dropdown, Modal, Row, Col, Input } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { OwnerServices } from "../owner.service";
import { take } from "rxjs";
import { cloneDeep } from "lodash";
import { CommonUtility } from "../../utils/utilities";
import { toast } from "react-hot-toast";
import { CategoryStatusMapping } from '../../common/object-interfaces/plant.interface';

interface IPlantCategoryManagementProps {

}

export const PlantCategoryManagementComponent: React.FC<IPlantCategoryManagementProps> = (props) => {

    const ownerServices = new OwnerServices();

    const [plantCategorys, setPlantCategory] = useState<any[]>([]);
    const [plantCategorysOnSearch, setPlantCategorysOnSearch] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [isShowPopupCreate, setShowPopupCreate] = useState<{
        isShow: boolean,
        plantCategoryName: string
    }>({
        isShow: false,
        plantCategoryName: ''
    });
    const [isShowPopupEdit, setShowPopupEdit] = useState<{
        isShow: boolean,
        plantCategoryName: string,
        plantCategoryID: string
    }>({
        isShow: false,
        plantCategoryName: '',
        plantCategoryID: ''
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
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        ownerServices.getPlantCategories$().pipe(take(1)).subscribe({
            next: data => {
                setPlantCategory(data.reverse());
                setPlantCategorysOnSearch(data);
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
            dataIndex: 'categoryID',
            key: 'categoryID',
            showSorterTooltip: false,
            ellipsis: true,
            width: 100,
            sorter: {
                compare: (acc, cur) => acc.categoryID > cur.categoryID ? 1 : acc.categoryID < cur.categoryID ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Tên loại cây',
            dataIndex: 'categoryName',
            key: 'categoryName',
            showSorterTooltip: false,
            ellipsis: true,
            sorter: {
                compare: (acc, cur) => acc.categoryName > cur.categoryName ? 1 : acc.categoryName < cur.categoryName ? -1 : 0
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
                return <Tag color={CommonUtility.statusColorMapping(value)}>{CategoryStatusMapping[value]}</Tag>
            },
            width: 180,
            sorter: {
                compare: (acc, cur) => acc.status > cur.status ? 1 : acc.status < cur.status ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: '',
            dataIndex: 'command',
            align: 'center',
            width: 50,
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
                                            setShowPopupEdit({
                                                isShow: true,
                                                plantCategoryName: record.categoryName,
                                                plantCategoryID: record.categoryID
                                            });
                                        }}
                                    >Xem chi tiết</span>
                                },
                                record.status === 'ACTIVE' ?
                                    {
                                        key: 'disablePlant',
                                        label: <span
                                            onClick={() => {
                                                setPopUpConfirm({
                                                    isShow: true,
                                                    plantCateogryID: record.categoryID,
                                                    message: 'Vui lòng xác nhận vô hiệu loại cây trong hệ thống.',
                                                    action: 'disable'
                                                });
                                            }}
                                        >Vô hiệu</span>
                                    } : null,
                                record.status === 'INACTIVE' ?
                                    {
                                        key: 'activePlant',
                                        label: <span
                                            onClick={() => {
                                                setPopUpConfirm({
                                                    isShow: true,
                                                    plantCateogryID: record.categoryID,
                                                    message: 'Vui lòng xác nhận hoạt động lại loại cây trong hệ thống.',
                                                    action: 'active'
                                                });
                                            }}
                                        >Hoạt động lại</span>
                                    } : null,
                            ]
                        }}
                        placement='bottom'>
                        <MoreOutlined />
                    </Dropdown>
                </div>
            },
            className: '__app-header-title'
        }
    ]


    function validateFormEdit() {
        const temp = cloneDeep(isShowPopupEdit);
        let result = {
            invalid: false,
            fields: [] as string[]
        }
        if (CommonUtility.isNullOrEmpty(temp.plantCategoryName)) {
            result.invalid = true;
            result.fields.push('Tên Loại Cây');
        }
        return result;
    }

    function validateFormCreate() {
        const temp = cloneDeep(isShowPopupCreate);
        let result = {
            invalid: false,
            fields: [] as string[]
        }
        if (CommonUtility.isNullOrEmpty(temp.plantCategoryName)) {
            result.invalid = true;
            result.fields.push('Tên Loại Cây');
        }
        return result;
    }

    return (
        <>
            <div className='__app-toolbar-container' style={{ padding: '8px 24px' }}>
                <div className='__app-toolbar-left-buttons'>
                    <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                        setShowPopupCreate({
                            isShow: true,
                            plantCategoryName: ''
                        });
                    }}>Thêm Loại Cây</Button>
                    {/* <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                        CommonUtility.exportExcel(plantCategorys, tableUserColumns);
                    }}>Xuất Tệp Excel</Button> */}
                    <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                        loadData()
                    }}>Tải Lại</Button>
                </div>
                <div className='__app-toolbar-right-buttons'>
                    <Search
                        style={{ marginLeft: 10 }}
                        className='__app-search-box'
                        placeholder="Nhập ID/ Tên Loại Cây"
                        onSearch={(value) => {
                            const columnsSearch = ['categoryName', 'categoryID']
                            const data = CommonUtility.onTableSearch(value, plantCategorys, columnsSearch);
                            setPlantCategorysOnSearch(data);
                        }}
                    />
                </div>
            </div>
            <div style={{ width: '94%' }}>
                <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
            </div>
            <div className='__app-layout-container' style={{ padding: '8px 24px' }}>

                <Table
                    loading={!isDataReady}
                    tableLayout='auto'
                    size="middle"
                    columns={tableUserColumns}
                    className='__app-user-info-table'
                    dataSource={plantCategorysOnSearch}
                    pagination={{
                        pageSize: 8,
                        total: plantCategorys.length,
                        showTotal: (total, range) => {
                            return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                        }
                    }}
                ></Table>

            </div>
            {
                isShowPopupEdit.isShow ?
                    <Modal
                        width={600}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Chỉnh sửa
                            </span>
                        )}
                        footer={[
                            <Button key='cancel' onClick={() => {
                                setShowPopupEdit({
                                    isShow: false,
                                    plantCategoryName: '',
                                    plantCategoryID: ''
                                })
                            }}>Huỷ</Button>,
                            <Button key='save' style={{ background: '#0D6368' }} type='primary' onClick={() => {
                                const validation = validateFormEdit();
                                if (validation.invalid === false) {
                                    ownerServices.updateCategory$(isShowPopupEdit.plantCategoryID, isShowPopupEdit.plantCategoryName).pipe(take(1)).subscribe({
                                        next: (res) => {
                                            if (res) {
                                                toast.success('Chỉnh sửa thành công.');
                                                setShowPopupEdit({
                                                    isShow: false,
                                                    plantCategoryName: '',
                                                    plantCategoryID: ''
                                                });
                                                loadData();
                                            } else {
                                                toast.error('Chỉnh sửa thất bại.');
                                            }
                                        }
                                    })
                                } else {
                                    toast.error(`Không được để trống ${validation.fields.join(', ')}`);
                                }
                            }}>Lưu</Button>
                        ]}
                        centered
                    >
                        <div className='__app-dialog-create-object'>
                            <Row className='__app-object-info-row'>
                                <Col span={6} className='__app-object-field'>
                                    <span>
                                        <strong>Tên loại cây: </strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={18}>
                                    <Input onChange={(args) => {
                                        let temp = cloneDeep(isShowPopupEdit);
                                        temp['plantCategoryName'] = args.target.value;
                                        setShowPopupEdit(temp);
                                    }}
                                        placeholder="Nhập tên loại cây"
                                        value={isShowPopupEdit.plantCategoryName}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Modal> : <></>
            }
            {
                isShowPopupCreate.isShow ?
                    <Modal
                        width={600}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Tạo loại cây
                            </span>
                        )}
                        footer={[
                            <Button key='cancel' onClick={() => {
                                setShowPopupCreate({
                                    isShow: false,
                                    plantCategoryName: '',
                                })
                            }}>Huỷ</Button>,
                            <Button key='save' style={{ background: '#0D6368' }} type='primary' onClick={() => {
                                const validation = validateFormCreate();
                                if (validation.invalid === false) {
                                    ownerServices.createNewCategory$(isShowPopupCreate.plantCategoryName).pipe(take(1)).subscribe({
                                        next: (res) => {
                                            if (res) {
                                                toast.success('Tạo thành công.');
                                                setShowPopupCreate({
                                                    isShow: false,
                                                    plantCategoryName: ''
                                                });
                                                loadData();
                                            } else {
                                                toast.error('Tạo thất bại.');
                                            }
                                        }
                                    })
                                } else {
                                    toast.error(`Không được để trống ${validation.fields.join(', ')}`);
                                }
                            }}>Lưu</Button>
                        ]}
                        centered
                    >
                        <div className='__app-dialog-create-object'>
                            <Row className='__app-object-info-row'>
                                <Col span={6} className='__app-object-field'>
                                    <span>
                                        <strong>Tên loại cây: </strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={18}>
                                    <Input onChange={(args) => {
                                        let temp = cloneDeep(isShowPopupCreate);
                                        temp['plantCategoryName'] = args.target.value;
                                        setShowPopupCreate(temp);
                                    }}
                                        placeholder="Nhập tên loại cây"
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Modal> : <></>
            }
            {
                popUpConfirm.isShow ?
                    <Modal
                        width={300}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Xác nhận
                            </span>
                        )}
                        footer={[
                            <Button type="default" onClick={() => {
                                setPopUpConfirm({
                                    isShow: false,
                                    plantCateogryID: '',
                                    message: '',
                                    action: ''
                                })
                            }}>Huỷ</Button>,
                            popUpConfirm.action === 'active' ?
                                <Button type="primary"
                                    style={{ backgroundColor: '#0D6368' }}
                                    onClick={() => {
                                        ownerServices.activeCategory$(popUpConfirm.plantCateogryID).pipe(take(1)).subscribe({
                                            next: (res) => {
                                                if (res.error) {
                                                    toast.error(res.error);
                                                    setPopUpConfirm({
                                                        isShow: false,
                                                        plantCateogryID: '',
                                                        message: '',
                                                        action: ''
                                                    })
                                                } else {
                                                    setPopUpConfirm({
                                                        isShow: false,
                                                        plantCateogryID: '',
                                                        message: '',
                                                        action: ''
                                                    })
                                                    loadData();
                                                    toast.success('Cập nhật thành công');
                                                }
                                            }
                                        })

                                    }}>Xác Nhận</Button> :
                                <Button type="primary"
                                    style={{ backgroundColor: '#5D050b' }}
                                    onClick={() => {
                                        ownerServices.disableCategory$(popUpConfirm.plantCateogryID).pipe(take(1)).subscribe({
                                            next: (res) => {
                                                if (res.error) {
                                                    toast.error(res.error);
                                                    setPopUpConfirm({
                                                        isShow: false,
                                                        plantCateogryID: '',
                                                        message: '',
                                                        action: ''
                                                    })
                                                } else {
                                                    setPopUpConfirm({
                                                        isShow: false,
                                                        plantCateogryID: '',
                                                        message: '',
                                                        action: ''
                                                    })
                                                    loadData();
                                                    toast.success('Cập nhật thành công');
                                                }
                                            }
                                        })

                                    }}>Xác Nhận</Button>
                        ]}
                        centered
                    >
                        <span>{popUpConfirm.message}</span>
                    </Modal> : <></>
            }
        </>
    )
}