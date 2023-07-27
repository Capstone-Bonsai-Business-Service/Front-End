import { CloudUploadOutlined, FormOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Input, Modal, Row, Select, Table, Tag, Image, Switch, Skeleton, Dropdown } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IPlant, PlantStatus, PlantStatusMapping } from "../../common/object-interfaces/plant.interface";
import { NumericFormat } from "react-number-format";
import { ManagerServices } from "../manager.service";
import { map, take } from "rxjs";
import { cloneDeep } from "lodash";
import TextArea from "antd/es/input/TextArea";
import { CommonUtility } from "../../utils/utilities";
import { toast } from "react-hot-toast";
import notFoundImage from '../../../assets/images/Image_not_available.png';


interface IBonsaiManagementProps {

}

export const BonsaiManagementComponent: React.FC<IBonsaiManagementProps> = (props) => {

    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const managerServices = new ManagerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [bonsais, setBonsai] = useState<any[]>([]);
    const [bonsaisOnSearch, setBonsaisOnSearch] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [plantIdIncreaseAmount, setPlantIdIncreaseAmount] = useState<string | null>(null);
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [bonsaiDetail, setBonsaiDetail] = useState<IPlant | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [plantShipFee, setPlantShipFee] = useState<any[]>([]);

    useEffect(() => {
        if (!isFirstInit) {
            managerServices.getBonsais$().pipe(take(1),
                map(res => {
                    return onUpdateDataSource(res);
                })
            ).subscribe({
                next: data => {
                    setBonsai(data);
                    setBonsaisOnSearch(data);
                    setFirstInit(true);
                    setDataReady(true);
                    getPlantCategories();
                    getShipPlant();
                }
            })
        }
    }, [isFirstInit, bonsais, managerServices, getPlantCategories, getShipPlant]);

    const tableUserColumns: ColumnsType<IPlant> = [
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
            dataIndex: 'amount',
            key: 'amount',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value, record, index) => {
                return <div>
                    {value ?? 0}
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
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                {
                                    key: 'detail',
                                    label: <span onClick={() => {
                                        getBonsaiDetail(record.plantID);
                                        setFormMode('edit');
                                    }}>
                                        Xem chi tiết
                                    </span>
                                },
                                {
                                    key: 'amountIncrease',
                                    label: <span
                                        onClick={() => {
                                            setPlantIdIncreaseAmount(record.plantID)
                                        }}
                                    >Thêm số lượng cây</span>
                                },
                                {
                                    key: 'disablePlant',
                                    label: 'Huỷ bán cây'
                                }]
                        }}
                        placement='bottom'>
                        <FormOutlined />
                    </Dropdown>
                    {/* <Button className='__app-command-button' onClick={(e) => {
                        e.preventDefault();
                        // getBonsaiDetail(record.plantID);
                        // setFormMode('edit');
                    }} icon={<FormOutlined />} /> */}
                </div>
            },
            className: '__app-header-title'
        }
    ]

    function getBonsaiDetail(plantId: string) {
        setDataReady(false);
        managerServices.getBonsai$(plantId).pipe(take(1)).subscribe({
            next: (response: IPlant) => {
                if (response) {
                    setBonsaiDetail(response);
                    setImageUrl(response.plantIMGList[0]?.url ?? notFoundImage);
                    setDataReady(true);
                }
            }
        })
    }

    function bindingListImage() {
        if (!isDataReady) {
            return [<Skeleton.Image style={{ width: 100 }} active={true} />,
            <Skeleton.Image style={{ width: 100 }} active={true} />,
            <Skeleton.Image style={{ width: 100 }} active={true} />]
        }
        const elements: JSX.Element[] = (bonsaiDetail?.plantIMGList as any[])?.reduce((acc, cur) => {
            acc.push(
                <Image
                    preview={false}
                    width={100}
                    src={cur.url}
                    style={{ cursor: 'pointer', borderRadius: 4 }}
                    onClick={() => {
                        setImageUrl(cur.url);
                    }}
                />
            )
            return acc;
        }, []);
        if (CommonUtility.isNullOrUndefined(elements) || elements.length === 0) {
            return [
                <Image
                    preview={false}
                    width={100}
                    src={notFoundImage}
                    style={{ cursor: 'pointer', borderRadius: 4, border: '1px solid' }}
                />
            ]
        } else {
            return elements;
        }
    }

    function onUpdateDataSource(data: any[]) {
        for (let item of data) {
            item['price'] = item.showPlantPriceModel.price;
        }
        return data;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    function getPlantCategories() {
        managerServices.getPlantCategories$().pipe(take(1)).subscribe({
            next: (data) => {
                const categoriesOptions = data.reduce((acc: any[], cur: any) => {
                    acc.push({
                        value: cur.categoryID,
                        label: cur.categoryName
                    })
                    return acc;
                }, []);
                setCategories(categoriesOptions);
                localStorage.setItem('plantCategories', JSON.stringify(data));
            }
        })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    function getShipPlant() {
        managerServices.getShipPlant$().pipe(take(1)).subscribe({
            next: (data) => {
                const plantShipOptions = data.reduce((acc: any[], cur: any) => {
                    acc.push({
                        value: cur.id,
                        label: `${cur.potSize} (${cur.pricePerPlant})`
                    })
                    return acc;
                }, []);
                setPlantShipFee(plantShipOptions);
                localStorage.setItem('plantShipFee', JSON.stringify(data));
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
                                {/* <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                                    setShowPopupCreate(true);
                                }}>Thêm Cây</Button> */}
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(bonsais, tableUserColumns);
                                }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    setDataReady(false);
                                    managerServices.getBonsais$().pipe(take(1)).subscribe({
                                        next: data => {
                                            setBonsai(data);
                                            setBonsaisOnSearch(data);
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
                                        const columnsSearch = ['plantID', 'name', 'status', 'height']
                                        const data = CommonUtility.onTableSearch(value, bonsais, columnsSearch);
                                        setBonsaisOnSearch(data);
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
                                dataSource={bonsaisOnSearch}
                                pagination={{
                                    pageSize: 7,
                                    total: bonsais.length,
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
                                setBonsaiDetail(null);
                                setImageUrl('');
                            }} />
                            <div className="__app-title-form">Chi tiết</div>
                        </div>
                        <div className="__app-content-container">
                            <div className="__app-main-info">
                                <div className="__app-images">
                                    <div className="__app-list-images">
                                        {
                                            bindingListImage()
                                        }
                                    </div>
                                    <Image
                                        style={{ borderRadius: 4 }}
                                        preview={false}
                                        width={350}
                                        height={300}
                                        src={imageUrl}
                                    />
                                </div>
                                <div className="__app-plain-info">
                                    <Row>
                                        <Col span={10} className='__app-object-field align-center'>
                                            <strong>ID: </strong>
                                            {
                                                isDataReady ?
                                                    <div style={{ marginLeft: 10 }}><strong>{bonsaiDetail?.plantID}</strong></div>
                                                    : <div style={{ width: '50%', marginLeft: '10%' }}><Skeleton.Input active={true} block={true} /></div>
                                            }
                                        </Col>
                                        <Col span={10} className='__app-object-field align-center'>
                                            <strong>Trạng thái: </strong>
                                            {
                                                isDataReady ?
                                                    <div style={{ marginLeft: 10 }}><span>{PlantStatusMapping[bonsaiDetail?.status ?? 'ONSALE']}</span></div>
                                                    : <div style={{ width: '50%', marginLeft: '10%' }}><Skeleton.Input active={true} block={true} /></div>
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Tên cây:</strong>
                                        </Col>
                                        <Col span={17} style={{ display: 'flex', alignItems: 'center' }}>
                                            {
                                                isDataReady ?
                                                    // <Input defaultValue={bonsaiDetail?.name} />
                                                    <span>{bonsaiDetail?.name ?? '--'}</span>
                                                    : <Skeleton.Input block={true} active={true} />
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Chiều cao:</strong>
                                        </Col>
                                        <Col span={17} style={{ display: 'flex', alignItems: 'center' }}>
                                            {
                                                isDataReady ?
                                                    <span>{bonsaiDetail?.height ?? '--'} (cm)</span>
                                                    // <NumericFormat
                                                    //     readOnly
                                                    //     className="app-numeric-input"
                                                    //     value={bonsaiDetail?.height}
                                                    //     onValueChange={(values) => {
                                                    //         // let temp = cloneDeep(bonsaiDetail) ?? {};
                                                    //         // temp['height'] = values.floatValue as number;
                                                    //         // setBonsaitDetail(temp);
                                                    //     }}
                                                    //     placeholder="Nhập chiều cao"
                                                    //     thousandSeparator=" "
                                                    // />
                                                    : <Skeleton.Input block={true} active={true} />
                                            }

                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Bao gồm chậu:</strong>
                                        </Col>
                                        <Col span={17} className='__app-object-field align-center'>
                                            {
                                                isDataReady ?
                                                    <Switch
                                                        defaultChecked={bonsaiDetail?.withPot}
                                                        disabled
                                                        onChange={(value) => {
                                                            // let temp = cloneDeep(bonsaiDetail) ?? {};
                                                            // temp['withPot'] = value;
                                                            // setBonsaitDetail(temp);
                                                        }}
                                                    />
                                                    : <>
                                                        <Skeleton.Button active={true} />
                                                    </>
                                            }

                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field'>
                                            <strong>Loại cây:</strong>
                                        </Col>
                                        <Col span={17} style={{ display: 'flex', alignItems: 'center' }}>
                                            {
                                                isDataReady ?
                                                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{
                                                        bonsaiDetail?.plantCategoryList.map(item => {
                                                            return <span> - {item.categoryName}</span>
                                                        })
                                                    }</span>
                                                    // <Select
                                                    //     mode='multiple'
                                                    //     defaultValue={
                                                    //         bonsaiDetail?.plantCategoryList.map(item => {
                                                    //             return item.categoryID
                                                    //         })
                                                    //     }
                                                    //     disabled
                                                    //     optionFilterProp='label'
                                                    //     style={{ width: '100%' }}
                                                    //     options={categories}
                                                    //     onChange={(values: any[]) => {
                                                    //         // let temp = cloneDeep(bonsaiDetail) ?? {};
                                                    //         // temp['categoryIDList'] = values.reduce((acc, cur) => {
                                                    //         //     acc.push(cur.value);
                                                    //         //     return acc;
                                                    //         // }, []);
                                                    //         // setBonsaitDetail(temp);
                                                    //     }}
                                                    //     placeholder='Chọn loại cây'
                                                    // />
                                                    : <>
                                                        <Skeleton.Input block={true} active={true} />
                                                    </>
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Phí giao hàng:</strong>
                                        </Col>
                                        <Col span={17} style={{ display: 'flex', alignItems: 'center' }}>
                                            {
                                                isDataReady ?
                                                    <span>{`${bonsaiDetail?.showPlantShipPriceModel.pricePerPlant}/km (${bonsaiDetail?.showPlantShipPriceModel.potSize})`}</span>
                                                    // <Select
                                                    //     disabled
                                                    //     defaultValue={bonsaiDetail?.showPlantShipPriceModel.id}
                                                    //     optionFilterProp='label'
                                                    //     style={{ width: '100%' }}
                                                    //     options={[
                                                    //         { value: 'PS001', label: '10000/km (< 20cm)' },
                                                    //         { value: 'PS002', label: '11000/km (~ 40cm)' },
                                                    //         { value: 'PS003', label: '13000/km (~ 70cm)' },
                                                    //         { value: 'PS004', label: '15000/km (> 100cm)' },
                                                    //     ]}
                                                    //     onChange={(values) => {
                                                    //         // let temp = cloneDeep(bonsaiDetail) ?? {};
                                                    //         // temp['categoryIDList'] = values.reduce((acc, cur) => {
                                                    //         //     acc.push(cur.value);
                                                    //         //     return acc;
                                                    //         // }, []);
                                                    //         // setBonsaitDetail(temp);
                                                    //     }}
                                                    //     placeholder='Chọn giá giao'
                                                    // />
                                                    : <>
                                                        <Skeleton.Input block={true} active={true} />
                                                    </>
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Giá cây:</strong>
                                        </Col>
                                        <Col span={17} style={{ display: 'flex', alignItems: 'center' }}>
                                            {
                                                isDataReady ?
                                                    // <span>{bonsaiDetail?.showPlantPriceModel.price ?? '--'} vnđ</span>
                                                    <NumericFormat
                                                        displayType='text'
                                                        value={bonsaiDetail?.showPlantPriceModel.price}
                                                        thousandSeparator=" "
                                                        suffix=" vnđ"
                                                    />
                                                    : <Skeleton.Input block={true} active={true} />
                                            }

                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Số lượng cây:</strong>
                                        </Col>
                                        <Col span={17} style={{ display: 'flex', alignItems: 'center' }}>
                                            {
                                                isDataReady ?
                                                    <NumericFormat
                                                        displayType='text'
                                                        value={bonsaiDetail?.amount ?? 0}
                                                        thousandSeparator=" "
                                                    />
                                                    : <Skeleton.Input block={true} active={true} />
                                            }

                                        </Col>
                                    </Row>
                                </div>
                            </div>
                            <div className="__app-description">
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 8 }}>
                                    <span style={{ padding: '0 0 0 8px' }}><strong>Mô tả:</strong></span>
                                    {
                                        isDataReady ?
                                            <TextArea readOnly rows={5} defaultValue={bonsaiDetail?.description}></TextArea>
                                            : <Skeleton paragraph={{ rows: 3 }} active={true} />
                                    }

                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 8 }}>
                                    <span style={{ padding: '0 0 0 8px' }}><strong>Lưu ý:</strong></span>
                                    {
                                        isDataReady ?
                                            <TextArea readOnly rows={5} defaultValue={bonsaiDetail?.careNote}></TextArea>
                                            : <Skeleton paragraph={{ rows: 3 }} active={true} />
                                    }

                                </div>
                            </div>
                            {/* <div className="__app-action-button">
                                <Button type="primary" onClick={() => {
                                    //todo
                                    setFormMode('display');
                                    setBonsaiDetail(null);
                                    setImageUrl('');
                                }}>Lưu</Button>
                            </div> */}
                        </div>
                    </div>
                    : <></>
            }
            {
                plantIdIncreaseAmount !== null ?
                    <Modal
                        width={600}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Thêm số lượng
                            </span>
                        )}
                        footer={[
                            <Button key='cancel' onClick={() => {
                                setPlantIdIncreaseAmount(null);
                            }}>Đóng</Button>,
                            <Button key='save' type='primary' onClick={() => {
                                // ownerServices.createStore$(storeDetail).pipe(take(1)).subscribe({
                                //     next: (res) => {
                                //         if (res) {
                                //             if (props.onSave) {
                                //                 props.onSave(res);
                                //             }
                                //         } else {
                                //             toast.error('Tạo chi nhánh thất bại.');
                                //         }

                                //     }
                                // })
                            }}>Lưu</Button>,
                        ]}
                        centered
                    >
                        <Row>
                            <Col span={4}>Số lượng</Col>
                            <Col span={20}>
                                <NumericFormat className="app-numeric-input" defaultValue={0} onChange={() => {

                                }} />
                            </Col>
                        </Row>
                    </Modal> : <></>
            }
        </>
    )
}