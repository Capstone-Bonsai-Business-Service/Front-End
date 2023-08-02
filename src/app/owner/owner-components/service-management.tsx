import { FormOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Image, Button, Divider, Skeleton, Table, Tabs, Tag, Row, Col, Input, Select } from 'antd';
import Search from 'antd/es/input/Search';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import notFoundImage from '../../../assets/images/Image_not_available.png';
import { IPlant } from '../../common/object-interfaces/plant.interface';
import { NumericFormat } from 'react-number-format';
import { OwnerServices } from '../owner.service';
import { take } from 'rxjs';
import '../owner.scss';
import { CommonUtility } from '../../utils/utilities';
import { ServiceStatusMapping } from '../../common/object-interfaces/service.interface';
import TextArea from 'antd/es/input/TextArea';

interface IServiceManagementProps {

}



export const ServiceManagementComponent: React.FC<IServiceManagementProps> = (props) => {

    const [tabKey, setTabKey] = useState<string>('service')

    return (
        // <div className='__app-services-container'>
        <Tabs
            style={{ width: '90%' }}
            defaultActiveKey='service'
            onChange={(key) => {
                setTabKey(key);
            }}
            items={[
                {
                    label: 'Dịch vụ',
                    key: 'service',
                    children: tabKey === 'service' ? <TabServiceList /> : <></>,
                },
                {
                    label: 'Gói dịch vụ',
                    key: 'packs',
                    children: tabKey === 'packs' ? <TabPackList /> : <></>
                }
            ]}
        />
        // </div>
    )
}

const CreateServiceDialog: React.FC<{}> = (props) => {
    return <></>
}

const TabServiceList: React.FC<any> = (props) => {
    const ownerServices = new OwnerServices();

    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [services, setServices] = useState<any[]>([]);
    const [servicesOnSearch, setServicesOnSearch] = useState<any[]>([]);

    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [serviceDetail, setServiceDetail] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string>('');

    const tableUserColumns: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'serviceID',
            key: 'serviceID',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
            sorter: {
                compare: (acc, cur) => acc.serviceID > cur.serviceID ? 1 : acc.serviceID < cur.serviceID ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Tên dịch vụ',
            dataIndex: 'name',
            key: 'name',
            showSorterTooltip: false,
            ellipsis: true,
            sorter: {
                compare: (acc, cur) => acc.name > cur.name ? 1 : acc.name < cur.name ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Giá (tháng)',
            dataIndex: 'price',
            key: 'price',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value, record, index) => {
                return <div>
                    <NumericFormat displayType='text' value={record.price} thousandSeparator=' ' suffix=" ₫" />
                </div>
            },
            width: 200,
            sorter: {
                compare: (acc, cur) => acc.price > cur.price ? 1 : acc.price < cur.price ? -1 : 0
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
                return <Tag color={CommonUtility.statusColorMapping(value)}>{ServiceStatusMapping[value]}</Tag>
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
                        setServiceDetail(record);
                        setImageUrl(record?.imgList[0]?.url ?? '');
                        setFormMode('edit');
                    }} icon={<FormOutlined />} />
                </div>
            },
            className: '__app-header-title'
        }
    ]

    const tableSeriveTypeColumns: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
            sorter: {
                compare: (acc, cur) => acc.id > cur.id ? 1 : acc.id < cur.id ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Loại dịch vụ',
            dataIndex: 'name',
            key: 'name',
            showSorterTooltip: false,
            ellipsis: true,
            sorter: {
                compare: (acc, cur) => acc.name > cur.name ? 1 : acc.name < cur.name ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Kích thước',
            dataIndex: 'size',
            key: 'size',
            showSorterTooltip: false,
            ellipsis: true,
            width: 200,
            sorter: {
                compare: (acc, cur) => acc.size > cur.size ? 1 : acc.size < cur.size ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Phí phụ thu',
            dataIndex: 'percentage',
            key: 'percentage',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value, record, index) => {
                return <div>
                    <NumericFormat displayType='text' value={record.percentage} thousandSeparator=' ' suffix="%" />
                </div>
            },
            width: 200,
            sorter: {
                compare: (acc, cur) => acc.percentage > cur.percentage ? 1 : acc.percentage < cur.percentage ? -1 : 0
            },
            className: '__app-header-title'
        }
    ]

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        ownerServices.getService$().pipe(take(1)).subscribe({
            next: data => {
                setServices(data);
                setServicesOnSearch(data);
                setFirstInit(true);
                setDataReady(true);
            }
        })
    }

    function bindingListImage() {
        if (!isDataReady) {
            return [<Skeleton.Image style={{ width: 100 }} active={true} />,
            <Skeleton.Image style={{ width: 100 }} active={true} />,
            <Skeleton.Image style={{ width: 100 }} active={true} />]
        }
        const elements: JSX.Element[] = (serviceDetail?.imgList as any[])?.reduce((acc, cur) => {
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

    return (
        <>
            {
                formMode === 'display' ? <>
                    <div className='__app-toolbar-container' style={{ padding: '8px 24px' }}>
                        <div className='__app-toolbar-left-buttons'>
                            <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                                // setShowPopupCreate(true);
                            }}>Thêm dịch vụ</Button>
                            <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                CommonUtility.exportExcel(services, tableUserColumns);
                            }}>Xuất Tệp Excel</Button>
                            <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                loadData();
                            }}>Tải Lại</Button>
                        </div>
                        <div className='__app-toolbar-right-buttons'>
                            <Search
                                style={{ marginLeft: 10 }}
                                className='__app-search-box'
                                placeholder="Nhập ID/ Tên Cây"
                                onSearch={(value) => {
                                    const columnsSearch = ['serviceID', 'name']
                                    const data = CommonUtility.onTableSearch(value, services, columnsSearch);
                                    setServicesOnSearch(data);
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ width: '94%' }}>
                        <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
                    </div>
                    <div className='__app-layout-container' style={{ height: 'calc(100vh - 200px)' }}>
                        <Table
                            loading={!isDataReady}
                            tableLayout='auto'
                            size='middle'
                            columns={tableUserColumns}
                            className='__app-user-info-table'
                            dataSource={servicesOnSearch}
                            pagination={{
                                pageSize: 6,
                                total: servicesOnSearch.length,
                                showTotal: (total, range) => {
                                    return <span>{total} items</span>
                                }
                            }}
                        ></Table>

                    </div>
                </> : <></>
            }
            {
                formMode === 'edit' ? <>
                    <div className="__app-layout-container form-edit" style={{ width: '100%', height: 'calc(100vh - 140px)' }}>
                        <div className="__app-top-action">
                            <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                                setFormMode('display');
                                setServiceDetail(null);
                                // setImageUrl('');
                            }} />
                            <div className="__app-title-form">Chi tiết</div>
                        </div>
                        <div className="__app-content-container">
                            <div className="__app-main-info">
                                <div className="__app-images">
                                    <div className="__app-list-images" style={{ width: 101 }}>
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
                                                    <div style={{ marginLeft: 10 }}><strong>{serviceDetail?.id}</strong></div>
                                                    : <div style={{ width: '50%', marginLeft: '10%' }}><Skeleton.Input active={true} block={true} /></div>
                                            }
                                        </Col>
                                        <Col span={10} className='__app-object-field align-center'>
                                            <strong>Trạng thái: </strong>
                                            {
                                                isDataReady ?
                                                    <div style={{ marginLeft: 10 }}><Tag color={CommonUtility.statusColorMapping(serviceDetail?.status)} >{ServiceStatusMapping[serviceDetail?.status]}</Tag></div>
                                                    : <div style={{ width: '50%', marginLeft: '10%' }}><Skeleton.Input active={true} block={true} /></div>
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Tên dịch vụ:</strong>
                                        </Col>
                                        <Col span={17} >
                                            {
                                                isDataReady ?
                                                    <Input defaultValue={serviceDetail?.name} />
                                                    : <Skeleton.Input block={true} active={true} />
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={5} className='__app-object-field align-center'>
                                            <strong>Giá dịch vụ:</strong>
                                        </Col>
                                        <Col span={17}>
                                            {
                                                isDataReady ?
                                                    <NumericFormat
                                                        className="app-numeric-input"
                                                        defaultValue={serviceDetail?.price}
                                                        onValueChange={(values) => {
                                                            // let temp = cloneDeep(serviceDetail) ?? {};
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
                                    <Row>
                                        <Col span={5} className='__app-object-field'>
                                            <strong>Mô tả:</strong>
                                        </Col>
                                        <Col span={17}>
                                            {
                                                isDataReady ?
                                                    <TextArea rows={6} defaultValue={serviceDetail?.description}></TextArea>
                                                    : <Skeleton paragraph={{ rows: 3 }} active={true} />
                                            }
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                            <Divider />
                            <Table
                                loading={!isDataReady}
                                size='small'
                                tableLayout='auto'
                                columns={tableSeriveTypeColumns}
                                className='__app-user-info-table'
                                dataSource={serviceDetail?.typeList}
                                pagination={{
                                    pageSize: 4,
                                    total: servicesOnSearch.length,
                                    showTotal: (total, range) => {
                                        return <span>{total} items</span>
                                    }
                                }}
                            ></Table>
                            <div className="__app-action-button">
                                <Button type="primary" onClick={() => {
                                    //todo
                                    setFormMode('display');
                                    setServiceDetail(null);
                                    setImageUrl('');
                                }}>Lưu</Button>
                            </div>
                        </div>
                    </div>
                </> : <></>
            }
        </>

    )
}

const TabPackList: React.FC<{}> = (props) => {
    const ownerServices = new OwnerServices();

    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [servicePacks, setServicePacks] = useState<any[]>([]);
    const [servicePacksOnSearch, setServicePacksOnSearch] = useState<any[]>([]);

    const tableUserColumns: ColumnsType<IPlant> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
            sorter: {
                compare: (acc, cur) => acc.id > cur.id ? 1 : acc.id < cur.id ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Thời hạn',
            dataIndex: 'range',
            key: 'range',
            showSorterTooltip: false,
            ellipsis: true,
            sorter: {
                compare: (acc, cur) => acc.range > cur.range ? 1 : acc.range < cur.range ? -1 : 0
            },
            className: '__app-header-title'
        },
        {
            title: 'Khuyến mãi',
            dataIndex: 'percentage',
            key: 'percentage',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value, record, index) => {
                return <div>
                    <NumericFormat displayType='text' value={record.percentage} thousandSeparator=' ' suffix="%" />
                </div>
            },
            width: 200,
            sorter: {
                compare: (acc, cur) => acc.percentage > cur.percentage ? 1 : acc.percentage < cur.percentage ? -1 : 0
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
                return <Tag color={CommonUtility.statusColorMapping(value)}>{ServiceStatusMapping[value]}</Tag>
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
                        // getserviceDetail(record.plantID);
                        // setFormMode('edit');
                    }} icon={<FormOutlined />} />
                </div>
            },
            className: '__app-header-title'
        }
    ]

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        ownerServices.getServicePacks$().pipe(take(1)).subscribe({
            next: data => {
                setServicePacks(data);
                setServicePacksOnSearch(data);
                setFirstInit(true);
                setDataReady(true);
            }
        })
    }

    return <>
        <div className='__app-toolbar-container' style={{ padding: '8px 24px' }}>
            <div className='__app-toolbar-left-buttons'>
                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                    // setShowPopupCreate(true);
                }}>Thêm gói dịch vụ</Button>
                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                    CommonUtility.exportExcel(servicePacks, tableUserColumns);
                }}>Xuất Tệp Excel</Button>
                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                    loadData();
                }}>Tải Lại</Button>
            </div>
            <div className='__app-toolbar-right-buttons'>
                <Search
                    style={{ marginLeft: 10 }}
                    className='__app-search-box'
                    placeholder="Nhập ID/ Tên Cây"
                    onSearch={(value) => {
                        const columnsSearch = ['serviceID', 'name']
                        const data = CommonUtility.onTableSearch(value, servicePacks, columnsSearch);
                        setServicePacksOnSearch(data);
                    }}
                />
            </div>
        </div>
        <div style={{ width: '94%' }}>
            <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
        </div>
        <div className='__app-layout-container' style={{ height: 'calc(100vh - 200px)' }}>
            <Table
                loading={!isDataReady}
                tableLayout='auto'
                size='middle'
                columns={tableUserColumns}
                className='__app-user-info-table'
                dataSource={servicePacksOnSearch}
                pagination={{
                    pageSize: 6,
                    total: servicePacksOnSearch.length,
                    showTotal: (total, range) => {
                        return <span>{total} items</span>
                    }
                }}
            ></Table>

        </div>
    </>
}