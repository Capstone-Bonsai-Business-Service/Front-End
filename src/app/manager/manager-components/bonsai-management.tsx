import { LeftOutlined, MoreOutlined, PlusOutlined, ReloadOutlined, RestOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Modal, Row, Select, Table, Tag, Image, Switch, Skeleton, Dropdown } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { IPlant, PlantStatus, PlantStatusMapping } from "../../common/object-interfaces/plant.interface";
import { NumericFormat } from "react-number-format";
import { ManagerServices } from "../manager.service";
import { map, take } from "rxjs";
import { cloneDeep } from "lodash";
import TextArea from "antd/es/input/TextArea";
import { CommonUtility } from "../../utils/utilities";
import { toast } from "react-hot-toast";
import notFoundImage from '../../../assets/images/Image_not_available.png';
import { DateTime } from "luxon";


interface IBonsaiManagementProps {

}

interface IFormImportPlantProps {
    onCancel?: () => void;
    onSave?: () => void;
    listPlant: { value: string, label: string }[];
}

export const BonsaiManagementComponent: React.FC<IBonsaiManagementProps> = (props) => {

    const managerServices = new ManagerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [bonsais, setBonsai] = useState<any[]>([]);
    const [bonsaisOnSearch, setBonsaisOnSearch] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [bonsaiDetail, setBonsaiDetail] = useState<IPlant | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [plantShipFee, setPlantShipFee] = useState<any[]>([]);
    const [showPopupImport, setShowPopupImport] = useState<boolean>(false);
    const [showPopupPlantQuantity, setShowPopupPlantQuantity] = useState<boolean>(false);
    const [plantQuantityHistory, setPlantQuantityHistory] = useState<any[]>([]);
    const [plantDecreaseQuantityForm, setPlantDecreaseQuantityForm] = useState<{
        isShow: boolean;
        storePlantID: string;
        quantity: number;
        reason: string
    }>({
        isShow: false,
        storePlantID: '',
        quantity: 0,
        reason: ''
    });

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
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
                if (!isFirstInit) {
                    getPlantCategories();
                    getShipPlant();
                }
            }
        })
    }

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
            dataIndex: 'quantity',
            key: 'quantity',
            showSorterTooltip: false,
            ellipsis: true,
            width: 200,
            sorter: {
                compare: (acc, cur) => acc.quantity > cur.quantity ? 1 : acc.quantity < cur.quantity ? -1 : 0
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
                            items: [{
                                key: 'detail',
                                label: <span
                                    onClick={(e) => {
                                        e.preventDefault();
                                        getBonsaiDetail(record);
                                        setFormMode('edit');
                                    }}
                                >Xem chi tiết</span>
                            },
                            {
                                key: 'quantityDecrease',
                                label: <span
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPlantDecreaseQuantityForm({
                                            isShow: true,
                                            quantity: 0,
                                            reason: '',
                                            storePlantID: record.showStorePlantModel.id
                                        });
                                    }}
                                >Giảm số lượng cây</span>
                            },
                            {
                                key: 'disablePlant',
                                label: <span
                                    onClick={() => {
                                        getPlantQuantityHistory(record.plantID);
                                        setShowPopupPlantQuantity(true);
                                    }}
                                >Lịch sử nhập/xuất cây</span>
                            }]
                        }}
                        placement='bottom'>
                        <MoreOutlined />
                    </Dropdown>
                </div>
            },
            className: '__app-header-title'
        }
    ]

    function getBonsaiDetail(plant: IPlant) {
        setBonsaiDetail(plant);
        setImageUrl(plant.plantIMGList[0]?.url ?? notFoundImage);
    }

    function getPlantQuantityHistory(plantId: string) {
        managerServices.getPlantQuantityHistory$(plantId).pipe(take(1)).subscribe({
            next: value => {
                if (value) {
                    setPlantQuantityHistory(value);
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
            item['quantity'] = item.showStorePlantModel?.quantity ?? 0;
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

    function validateFormDecreasePlant() {
        let result = {
            invalid: false,
            error: [] as string[]
        }
        if (CommonUtility.isNullOrEmpty(plantDecreaseQuantityForm.quantity)) {
            result.invalid = true;
            result.error.push('Số lượng');
        } else if (plantDecreaseQuantityForm.quantity <= 0) {
            result.invalid = true;
            result.error.push('Số lượng lớn hơn 0');
        }
        if (CommonUtility.isNullOrEmpty(plantDecreaseQuantityForm.reason)) {
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
                        <div className='__app-toolbar-container'>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                                    setShowPopupImport(true);
                                }}>Nhập Thêm Cây</Button>
                                {/* <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(bonsais, tableUserColumns);
                                }}>Xuất Tệp Excel</Button> */}
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    loadData()
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
                        <div className='__app-layout-container' style={{ height: 'calc(100vh - 160px)', padding: '8px 24px' }}>

                            <Table
                                loading={!isDataReady}
                                tableLayout='auto'
                                size='middle'
                                columns={tableUserColumns}
                                className='__app-user-info-table'
                                dataSource={bonsaisOnSearch}
                                pagination={{
                                    pageSize: 8,
                                    total: bonsais.length,
                                    showTotal: (total, range) => {
                                        return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                                    }
                                }}
                            ></Table>

                        </div>
                        {
                            showPopupPlantQuantity ?
                                <Modal
                                    width={600}
                                    open={true}

                                    closable={false}
                                    title={(
                                        <span className='__app-dialog-title'>
                                            LỊCH SỬ NHẬP/ XUẤT CÂY
                                        </span>
                                    )}
                                    footer={[
                                        <Button key='cancel' onClick={() => {
                                            setShowPopupPlantQuantity(false)
                                            setPlantQuantityHistory([]);
                                        }}>Đóng</Button>
                                    ]}
                                >
                                    <Row style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', maxHeight: 400, overflowX: 'auto' }}>
                                        <Col span={22} >
                                            <Row>
                                                <Col span={1}></Col>
                                                <Col span={8} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center', fontWeight: 500 }}>Ngày</Col>
                                                <Col span={4} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center', fontWeight: 500 }}>Số lượng</Col>
                                                <Col span={10} style={{ textAlign: 'center', fontWeight: 500 }}>Nội dung</Col>
                                                <Col span={1}></Col>
                                            </Row>
                                            <Divider className="__app-divider-no-margin" />
                                            {
                                                plantQuantityHistory?.reduce((acc, cur, index) => {
                                                    const isIncrease = cur.reason.indexOf('[+]') > -1;
                                                    const _reason = cur.reason.split('Lí do :')[1].trim();
                                                    acc.push(
                                                        <Row key={`history_${index}`} style={{ marginTop: 5 }}>
                                                            <Col span={1}></Col>
                                                            <Col span={8} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>
                                                                {DateTime.fromJSDate(new Date(cur.importDate)).toFormat('dd/MM/yyyy HH:mm')}
                                                            </Col>
                                                            <Col span={4} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>
                                                                <span style={{
                                                                    color: isIncrease ? '#3f8600' : '#cf1322'
                                                                }}>
                                                                    <NumericFormat 
                                                                        thousandSeparator=' '
                                                                        displayType='text'
                                                                        prefix={isIncrease ? '+' : '-'}
                                                                        value={cur.amount}
                                                                    />
                                                                </span>
                                                            </Col>
                                                            <Col span={10} style={{ textAlign: 'center' }}>
                                                                {_reason}
                                                            </Col>
                                                            <Col span={1}></Col>
                                                        </Row>
                                                    )
                                                    return acc;
                                                }, [])
                                            }
                                            {
                                                plantQuantityHistory.length === 0 ?
                                                    <Row key={`history_0`} style={{ marginTop: 5 }}>
                                                        <Col span={1}></Col>
                                                        <Col span={8} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>
                                                            --
                                                        </Col>
                                                        <Col span={4} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>
                                                            --
                                                        </Col>
                                                        <Col span={10} style={{ textAlign: 'center' }}>
                                                            --
                                                        </Col>
                                                        <Col span={1}></Col>
                                                    </Row> : <></>
                                            }
                                        </Col>
                                    </Row>

                                </Modal> : <></>
                        }
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
                                                        value={bonsaiDetail?.quantity ?? 0}
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
                showPopupImport ?
                    <FormImportPlantDialog
                        listPlant={bonsais.reduce((acc, cur: IPlant) => {
                            acc.push({
                                value: cur.plantID,
                                label: cur.name
                            })
                            return acc;
                        }, [])}
                        onCancel={() => {
                            setShowPopupImport(false);
                        }}
                        onSave={() => {
                            setShowPopupImport(false);
                            toast.success('Nhập cây thành công.');
                            loadData();
                        }}
                    /> : <></>
            }
            {
                plantDecreaseQuantityForm.isShow ?
                    <Modal
                        width={500}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Giảm số lượng cây
                            </span>
                        )}
                        footer={[
                            <Button key='cancel' onClick={() => {
                                setPlantDecreaseQuantityForm({
                                    isShow: false,
                                    quantity: 0,
                                    reason: '',
                                    storePlantID: ''
                                })
                            }}>Đóng</Button>,
                            <Button key='save' type='primary' style={{ background: '#0D6368' }} onClick={() => {
                                const validation = validateFormDecreasePlant();
                                if (validation.invalid) {
                                    toast.error('Vui lòng nhập thông tin ' + validation.error.join(', '));
                                } else {
                                    managerServices.removeStorePlantQuantity$(plantDecreaseQuantityForm.storePlantID, plantDecreaseQuantityForm.quantity, plantDecreaseQuantityForm.reason).pipe(take(1)).subscribe({
                                        next: (res) => {
                                            if (res.error) {
                                                toast.error(res.error);
                                            } else {
                                                toast.success(`Cập nhật thành công.`);
                                                setPlantDecreaseQuantityForm({
                                                    isShow: false,
                                                    quantity: 0,
                                                    reason: '',
                                                    storePlantID: ''
                                                })
                                            }
                                        }
                                    })
                                }
                            }}>Lưu</Button>
                        ]}
                        centered
                    >
                        <div style={{ width: '100%', display: 'flex', gap: 4, flexDirection: 'column' }}>
                            <Row>
                                <Col span={5} className='__app-object-field align-center'>
                                    <strong>Số lượng: <span className='__app-required-field'> *</span></strong>
                                </Col>
                                <Col span={19}>
                                    <NumericFormat
                                        className="app-numeric-input"
                                        placeholder="Nhập số lượng"
                                        value={plantDecreaseQuantityForm.quantity}
                                        allowNegative={false}
                                        onChange={(value) => {
                                            let temp = cloneDeep(plantDecreaseQuantityForm);
                                            temp['quantity'] = Number(value.target.value);
                                            setPlantDecreaseQuantityForm(temp);
                                        }}></NumericFormat>
                                </Col>

                            </Row>
                            <Row>
                                <Col span={5} className='__app-object-field align-center'>
                                    <strong>Lý do: <span className='__app-required-field'> *</span></strong>
                                </Col>
                                <Col span={19}>
                                    <TextArea
                                        rows={5}
                                        value={plantDecreaseQuantityForm.reason}
                                        onChange={(value) => {
                                            let temp = cloneDeep(plantDecreaseQuantityForm);
                                            temp['reason'] = value.target.value;
                                            setPlantDecreaseQuantityForm(temp);
                                        }}
                                    ></TextArea>
                                </Col>

                            </Row>
                        </div>
                    </Modal> : <></>
            }
        </>
    )
}

export const FormImportPlantDialog: React.FC<IFormImportPlantProps> = (props) => {
    const managerServices = new ManagerServices();

    const [listPlant, setListPlant] = useState<{
        id: string;
        plantID: string | null,
        quantity: number,
    }[]>([
        {
            id: new Date().getTime().toString(),
            plantID: null,
            quantity: 0,
        }
    ])

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
                const data = formatDataBeforePost();
                const body = data.reduce((acc, cur, index) => {
                    const dataPost = {
                        "storeID": managerServices.storeId,
                        "plantID": cur.plantID,
                        "quantity": cur.quantity
                    }
                    acc.push(dataPost);
                    return acc;
                }, [] as any[]);
                managerServices.addStorePlantQuantity$(body).pipe(take(1)).subscribe({
                    next: (res) => {
                        if (res) {
                            if (props.onSave) {
                                props.onSave();
                            }
                        } else {
                            toast.error('Nhập số lượng cây thất bại')
                        }
                    }
                })
            }}>Lưu</Button>
        );
        return nodes;
    }

    function formatDataBeforePost() {
        return listPlant.reduce((acc, cur) => {
            if (cur.quantity > 0 && cur.plantID) {
                const includePlantIdIndex = acc.findIndex(item => item.plantID === cur.plantID);
                if (includePlantIdIndex === -1) {
                    acc.push(cur);
                } else {
                    acc[includePlantIdIndex].quantity += cur.quantity;
                }
            }
            return acc;
        }, [] as {
            id: string;
            plantID: string | null;
            quantity: number;
        }[])
    }

    function renderListPlantQuantity(): React.ReactNode[] {
        const elem = listPlant.reduce((acc, cur, index, list) => {
            acc.push(
                <Row key={`plant_quantity_${index}`}>
                    <Col span={2} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>
                        {index + 1}
                    </Col>
                    <Col span={11} style={{ borderRight: '1px solid #d9d9d9', display: 'flex', justifyContent: 'center' }}>
                        <Select
                            style={{ width: '90%' }}
                            options={props.listPlant}
                            placeholder='Chọn loại cây'
                            value={cur.plantID}
                            onChange={(value) => {
                                let temp = cloneDeep(listPlant) ?? [];
                                temp[index]['plantID'] = value;
                                setListPlant(temp);
                            }}
                        />
                    </Col>
                    <Col span={9} style={{ borderRight: '1px solid #d9d9d9', display: 'flex', justifyContent: 'center' }}>
                        <NumericFormat
                            style={{ width: '90%' }}
                            className="app-numeric-input"
                            placeholder="Nhập số lượng"
                            value={cur.quantity}
                            allowNegative={false}
                            onChange={(value) => {
                                let temp = cloneDeep(listPlant) ?? [];
                                temp[index]['quantity'] = Number(value.target.value);
                                setListPlant(temp);
                            }}></NumericFormat>
                    </Col>
                    <Col span={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <RestOutlined style={{ width: 18, height: 18, fontSize: 18 }} onClick={(e) => {
                            e.preventDefault();
                            const temp = listPlant.filter(item => { return item.id !== cur.id })
                            setListPlant(temp);
                        }} />
                    </Col>
                </Row>
            )
            return acc;
        }, [] as any[]);
        return elem;
    }

    return (
        <Modal
            width={800}
            open={true}
            closable={false}
            title={(
                <span className='__app-dialog-title'>
                    Nhập cây vào kho
                </span>
            )}
            footer={getRenderFooterButton()}
            centered
        >
            <div style={{ width: '100%', display: 'flex', gap: 4, flexDirection: 'column' }}>
                <Row>
                    <Col span={2} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>STT</Col>
                    <Col span={11} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>Loại cây</Col>
                    <Col span={9} style={{ borderRight: '1px solid #d9d9d9', textAlign: 'center' }}>Lượng nhập</Col>
                    <Col span={2}></Col>
                </Row>
                <Divider className="__app-divider-no-margin"></Divider>
                {
                    renderListPlantQuantity()
                }
                <Divider className="__app-divider-no-margin"></Divider>
                <Row style={{ padding: 10 }}>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => {
                            const temp = cloneDeep(listPlant);
                            temp.push({
                                id: new Date().getTime().toString(),
                                plantID: null,
                                quantity: 0,
                            })
                            setListPlant(temp);
                        }}
                    >Thêm</Button>
                </Row>
            </div>
        </Modal>
    )
}