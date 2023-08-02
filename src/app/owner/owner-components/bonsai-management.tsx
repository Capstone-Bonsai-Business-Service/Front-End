import { CloudUploadOutlined, FormOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Input, Modal, Row, Select, Table, Tag, Image, Switch, Skeleton, Space, Upload } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IPlant } from "../../common/object-interfaces/plant.interface";
import { NumericFormat } from "react-number-format";
import { OwnerServices } from "../owner.service";
import { map, of, switchMap, take } from "rxjs";
import { cloneDeep } from "lodash";
import TextArea from "antd/es/input/TextArea";
import { CommonUtility } from "../../utils/utilities";
import { toast } from "react-hot-toast";
import notFoundImage from '../../../assets/images/Image_not_available.png';
import { PlantStatusMapping, PlantStatus } from '../../common/object-interfaces/plant.interface'
import { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";

interface IBonsaiManagementProps {

}

export const BonsaiManagementComponent: React.FC<IBonsaiManagementProps> = (props) => {

    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ownerServices = new OwnerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [bonsais, setBonsai] = useState<any[]>([]);
    const [bonsaisOnSearch, setBonsaisOnSearch] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [isShowPopupCreate, setShowPopupCreate] = useState<boolean>(false);
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [bonsaiDetail, setBonsaiDetail] = useState<IPlant | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [plantShipFee, setPlantShipFee] = useState<any[]>([]);

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        ownerServices.getBonsais$({ pageNo: 0, pageSize: 1000 }).pipe(take(1),
            map(res => {
                return onUpdateDataSource(res);
            })
        ).subscribe({
            next: data => {
                setBonsai(data);
                setBonsaisOnSearch(data);
                setDataReady(true);
                if (!isFirstInit) {
                    setFirstInit(true);
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
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value, record, index) => {
                return <div>
                    <NumericFormat displayType='text' value={record.showPlantPriceModel.price} thousandSeparator=',' suffix=" ₫" />
                </div>
            },
            width: 200,
            sorter: {
                compare: (acc, cur) => acc.showPlantPriceModel.price > cur.showPlantPriceModel.price ? 1 : acc.showPlantPriceModel.price < cur.showPlantPriceModel.price ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Chiều cao (cm)',
            dataIndex: 'height',
            key: 'height',
            showSorterTooltip: false,
            ellipsis: true,
            width: 100,
            sorter: {
                compare: (acc, cur) => acc.height > cur.height ? 1 : acc.height < cur.height ? -1 : 0
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
                    <Button className='__app-command-button' onClick={(e) => {
                        e.preventDefault();
                        getBonsaiDetail(record.plantID);
                        setFormMode('edit');
                    }} icon={<FormOutlined />} />
                </div>
            },
            className: '__app-header-title'
        }
    ]

    function getBonsaiDetail(plantId: string) {
        setDataReady(false);
        ownerServices.getBonsai$(plantId).pipe(take(1)).subscribe({
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
        ownerServices.getPlantCategories$().pipe(take(1)).subscribe({
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
        ownerServices.getShipPlant$().pipe(take(1)).subscribe({
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
                        <div className='__app-toolbar-container' style={{ padding: '8px 24px' }}>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                                    setShowPopupCreate(true);
                                }}>Thêm Cây</Button>
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(bonsais, tableUserColumns);
                                }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    setDataReady(false);
                                    ownerServices.getBonsais$({ pageNo: 0, pageSize: 1000 }).pipe(take(1)).subscribe({
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
                                    placeholder="Nhập ID/ Tên Cây"
                                    onSearch={(value) => {
                                        const columnsSearch = ['plantID', 'name']
                                        const data = CommonUtility.onTableSearch(value, bonsais, columnsSearch);
                                        setBonsaisOnSearch(data);
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
                                dataSource={bonsaisOnSearch}
                                pagination={{
                                    pageSize: 8,
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
                                    {
                                        isDataReady ?
                                            <Image
                                                style={{ borderRadius: 4, border: '1px solid' }}
                                                preview={false}
                                                width={350}
                                                height={300}
                                                src={imageUrl}
                                            /> : <Skeleton.Image style={{ borderRadius: 4, width: 350, height: 300 }} active={true} />
                                    }

                                </div>
                                <div className="__app-plain-info">
                                    <Row style={{ height: 31.6 }}>
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
                                        <Col span={17} >
                                            {
                                                isDataReady ?
                                                    <Input defaultValue={bonsaiDetail?.name} />
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
                                                        value={bonsaiDetail?.height}
                                                        onValueChange={(values) => {
                                                            // let temp = cloneDeep(bonsaiDetail) ?? {};
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
                                    <Row
                                        style={{ height: 31.6 }}
                                    >
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Bao gồm chậu:</strong>
                                        </Col>
                                        <Col span={17} className='__app-object-field align-center'>
                                            {
                                                isDataReady ?
                                                    <Switch
                                                        defaultChecked={bonsaiDetail?.withPot}
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
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Loại cây:</strong>
                                        </Col>
                                        <Col span={17}>
                                            {
                                                isDataReady ?
                                                    <Select
                                                        mode='multiple'
                                                        defaultValue={
                                                            bonsaiDetail?.plantCategoryList.map(item => {
                                                                return item.categoryID
                                                            })
                                                        }
                                                        optionFilterProp='label'
                                                        style={{ width: '100%' }}
                                                        options={categories}
                                                        onChange={(values: any[]) => {
                                                            // let temp = cloneDeep(bonsaiDetail) ?? {};
                                                            // temp['categoryIDList'] = values.reduce((acc, cur) => {
                                                            //     acc.push(cur.value);
                                                            //     return acc;
                                                            // }, []);
                                                            // setBonsaitDetail(temp);
                                                        }}
                                                        placeholder='Chọn loại cây'
                                                    />
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
                                        <Col span={17}>
                                            {
                                                isDataReady ?
                                                    <Select
                                                        defaultValue={bonsaiDetail?.showPlantShipPriceModel.id}
                                                        optionFilterProp='label'
                                                        style={{ width: '100%' }}
                                                        options={plantShipFee}
                                                        onChange={(values) => {
                                                            // let temp = cloneDeep(bonsaiDetail) ?? {};
                                                            // temp['categoryIDList'] = values.reduce((acc, cur) => {
                                                            //     acc.push(cur.value);
                                                            //     return acc;
                                                            // }, []);
                                                            // setBonsaitDetail(temp);
                                                        }}
                                                        placeholder='Chọn giá giao'
                                                    />
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
                                        <Col span={17}>
                                            {
                                                isDataReady ?
                                                    <NumericFormat
                                                        className="app-numeric-input"
                                                        value={bonsaiDetail?.showPlantPriceModel.price}
                                                        onValueChange={(values) => {
                                                            // let temp = cloneDeep(bonsaiDetail) ?? {};
                                                            // temp['height'] = values.floatValue as number;
                                                            // setBonsaitDetail(temp);
                                                        }}
                                                        placeholder="Nhập giá cây"
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
                                            <TextArea rows={5} defaultValue={bonsaiDetail?.description}></TextArea>
                                            : <Skeleton paragraph={{ rows: 3 }} active={true} />
                                    }

                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 8 }}>
                                    <span style={{ padding: '0 0 0 8px' }}><strong>Lưu ý:</strong></span>
                                    {
                                        isDataReady ?
                                            <TextArea rows={5} defaultValue={bonsaiDetail?.careNote}></TextArea>
                                            : <Skeleton paragraph={{ rows: 3 }} active={true} />
                                    }

                                </div>
                            </div>
                            <div className="__app-action-button">
                                <Button type="primary" onClick={() => {
                                    //todo
                                    setFormMode('display');
                                    setBonsaiDetail(null);
                                    setImageUrl('');
                                }}>Lưu</Button>
                            </div>
                        </div>
                    </div>
                    : <></>
            }
            {
                isShowPopupCreate ?
                    <FormCreateBonsaitDialog
                        onCancel={() => { setShowPopupCreate(false) }}
                        onSave={(data: any) => {
                            setShowPopupCreate(false);
                            loadData();
                        }}
                    /> : <></>
            }
        </>
    )
}

const FormCreateBonsaitDialog: React.FC<any> = (props: any) => {
    const [bonsaiDetail, setBonsaitDetail] = useState<any>({
        name: '',
        height: 0,
        description: '',
        careNote: '',
        withPot: false,
        shipPriceID: '',
        categoryIDList: [],
        price: 0,
        applyDate: ''
    });
    const [images, setImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([])
    const [plantShipFee, setPlantShipFee] = useState<any[]>([]);
    const [isUpload, setIsUpload] = useState<boolean>(false);

    const [newCategory, setNewCategory] = useState<string>('');

    const ownerServices = new OwnerServices();

    useEffect(() => {
        const categories = JSON.parse(localStorage.getItem('plantCategories') as string);
        const categoriesOptions = categories.reduce((acc: any[], cur: any) => {
            acc.push({
                value: cur.categoryID,
                label: cur.categoryName
            })
            return acc;
        }, []);
        setCategories(categoriesOptions);

        const plantShip = JSON.parse(localStorage.getItem('plantShipFee') as string);
        const plantShipOptions = plantShip.reduce((acc: any[], cur: any) => {
            acc.push({
                value: cur.id,
                label: `${cur.potSize} (${cur.pricePerPlant})`
            })
            return acc;
        }, []);
        setPlantShipFee(plantShipOptions);
    }, [])

    function getRenderFooterButton(): React.ReactNode[] {
        let nodes: React.ReactNode[] = []
        nodes.push(
            <Button key='cancel' onClick={() => {
                if (props.onCancel) {
                    props.onCancel();
                }
            }}>Huỷ</Button>
        );
        nodes.push(
            <Button key='save' type='primary' onClick={() => {
                onCreateBonsai();
            }}>Tạo</Button>
        );
        return nodes;
    }

    function getPlantCategories() {
        ownerServices.getPlantCategories$().pipe(take(1)).subscribe({
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

    function onCreateBonsai() {
        // const form = new FormData();
        // form.append('name', bonsaiDetail.name);
        // form.append('height', bonsaiDetail.height);
        // form.append('description', bonsaiDetail.description);
        // form.append('careNote', bonsaiDetail.careNote);
        // form.append('withPot', bonsaiDetail.withPot);
        // form.append('shipPriceID', bonsaiDetail.shipPriceID);
        // form.append('categoryIDList', bonsaiDetail.categoryIDList);
        // form.append('price', bonsaiDetail.price);
        // form.append('applyDate', new Date().toISOString());
        const data = {
            name: bonsaiDetail.name,
            height: bonsaiDetail.height,
            description: bonsaiDetail.description,
            careNote: bonsaiDetail.careNote,
            withPot: bonsaiDetail.withPot,
            shipPriceID: bonsaiDetail.shipPriceID,
            categoryIDList: bonsaiDetail.categoryIDList,
            price: bonsaiDetail.price,
            applyDate: new Date().toISOString()
        }

        ownerServices.createBonsai$(data).pipe(
            switchMap(res => {
                if (res) {
                    return ownerServices.addImageToDatabase$('PLANT', res, images);
                } else {
                    return of(null);
                }
            })
        ).subscribe({
            next: (res) => {
                if (res) {
                    toast.success('Thêm cây thành công');
                    props.onSave();
                } else {
                    toast.error('Tạo thêm cây thất bại.');
                }
            }
        })
    }

    return (
        <>
            <Modal
                width={600}
                open={true}
                closable={false}
                title={(
                    <span className='__app-dialog-title'>
                        Thêm Cây
                    </span>
                )}
                footer={getRenderFooterButton()}
                centered
            >
                <div className='__app-dialog-create-object'>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Tên cây: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(bonsaiDetail) ?? {};
                                temp['name'] = args.target.value;
                                setBonsaitDetail(temp);
                            }}
                                placeholder="Nhập tên cây"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Loại cây:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                mode='multiple'
                                defaultValue={[]}
                                optionFilterProp='label'
                                style={{ width: '100%' }}
                                options={categories}
                                onChange={(values: any[]) => {
                                    let temp = cloneDeep(bonsaiDetail) ?? {};
                                    temp['categoryIDList'] = values;
                                    setBonsaitDetail(temp);
                                }}
                                placeholder='Chọn loại cây'
                                dropdownRender={(menu) => (
                                    <>
                                        <Space style={{ padding: '0 8px 4px' }}>
                                            <Input
                                                placeholder='Thêm loại cây'
                                                style={{ width: 280 }}
                                                onChange={(value) => {
                                                    setNewCategory(value.target.value);
                                                }}
                                                value={newCategory}
                                            />
                                            <Button type="text" icon={<PlusOutlined />} disabled={newCategory === ''} onClick={() => {
                                                ownerServices.createNewCategory$(newCategory).pipe(take(1)).subscribe({
                                                    next: (value) => {
                                                        if (value) {
                                                            toast.success('Tạo loại cây mới thành công!');
                                                            getPlantCategories();
                                                            setNewCategory('');
                                                        } else {
                                                            toast.error('Tạo loại cây thất bại');
                                                            return;
                                                        }
                                                    }
                                                })
                                            }}>Thêm
                                            </Button>
                                        </Space>
                                        <Divider style={{ margin: '8px 0' }} />
                                        {menu}
                                    </>
                                )}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Mô tả:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <TextArea rows={4} onChange={(args) => {
                                let temp = cloneDeep(bonsaiDetail) ?? {};
                                temp['description'] = args.target.value;
                                setBonsaitDetail(temp);
                            }}
                                placeholder="Nhập mô tả"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Chăm sóc:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <TextArea rows={4} onChange={(args) => {
                                let temp = cloneDeep(bonsaiDetail) ?? {};
                                temp['careNote'] = args.target.value;
                                setBonsaitDetail(temp);
                            }}
                                placeholder="Nhập lưu ý khi chăm sóc"
                            />

                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Chiều cao:</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={18}>
                            <NumericFormat
                                className="app-numeric-input"
                                onValueChange={(values) => {
                                    let temp = cloneDeep(bonsaiDetail) ?? {};
                                    temp['height'] = values.floatValue as number;
                                    setBonsaitDetail(temp);
                                }}
                                placeholder="Nhập chiều cao"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Kèm chậu:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Switch
                                onChange={(value) => {
                                    let temp = cloneDeep(bonsaiDetail) ?? {};
                                    temp['withPot'] = value;
                                    setBonsaitDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Giá:</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={18}>
                            <NumericFormat
                                className="app-numeric-input"
                                onValueChange={(values) => {
                                    let temp = cloneDeep(bonsaiDetail) ?? {};
                                    temp['price'] = values.floatValue as number;
                                    setBonsaitDetail(temp);
                                }}
                                placeholder="Nhập giá"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Phí ship:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                options={plantShipFee}
                                onChange={(value) => {
                                    let temp = cloneDeep(bonsaiDetail) ?? {};
                                    temp['shipPriceID'] = value;
                                    setBonsaitDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Ảnh đính kèm:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <div className="__app-images-upload-container">
                                <div className="__app-list-images" style={{ flexDirection: 'row' }}>
                                    {renderImages()}
                                </div>
                                <div className="__app-button-upload">
                                    {
                                        !isUpload ? <Button key='upload' icon={<CloudUploadOutlined />} onClick={() => {
                                            document.getElementById('upload')?.click();
                                        }}>Tải ảnh</Button> : <Skeleton.Button active={true}></Skeleton.Button>
                                    }
                                    
                                </div>
                                <input
                                    id='upload'
                                    type="file"
                                    accept="*"
                                    multiple={false}
                                    hidden={true}
                                    onChange={(args) => {
                                        setIsUpload(true);
                                        const file = Array.from(args.target.files as FileList);
                                        ownerServices.uploadImageToFireBase$(file[0]).pipe(take(1)).subscribe({
                                            next: url => {
                                                const img = images;
                                                img.push(url as string);
                                                setImages(img);
                                                setIsUpload(false);
                                            }
                                        });
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
                <img style={{ width: 100 }} src={cur} alt='img' />
            )
            return acc;
        }, [] as JSX.Element[]);
        return elements;
    }
}