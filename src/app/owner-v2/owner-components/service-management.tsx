import { CloudUploadOutlined, FormOutlined, LeftOutlined, MoreOutlined, PlusOutlined, ReloadOutlined, RestOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Image, Button, Divider, Skeleton, Table, Tabs, Tag, Row, Col, Input, Modal, Switch, Select, Dropdown } from 'antd';
import Search from 'antd/es/input/Search';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import notFoundImage from '../../../assets/images/Image_not_available.png';
import { NumericFormat } from 'react-number-format';
import { OwnerServices } from '../owner.service';
import { take } from 'rxjs';
import '../owner.scss';
import { CommonUtility } from '../../utils/utilities';
import { ServiceStatusMapping } from '../../common/object-interfaces/service.interface';
import TextArea from 'antd/es/input/TextArea';
import { cloneDeep } from 'lodash';
import toast from 'react-hot-toast';

interface IServiceManagementProps {

}

interface ICreateServiceProps {
    onCancel: () => void;
    onSave: () => void;
}

interface IEditServicePackProps {
    onCancel: () => void;
    onSave: () => void;
    servicePackData: any;
}

export const ServiceManagementComponent: React.FC<IServiceManagementProps> = (props) => {

    const [tabKey, setTabKey] = useState<string>('service')

    return (
        <div style={{ height: 'calc(100vh - 100px)', width: 'calc(100% - 80px)', marginLeft: 20 }}>
            <Tabs
                className="__app-tabs-custom"
                style={{ marginBottom: 0 }}
                defaultActiveKey='service'
                type='card'
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
        </div>
    )
}

const FormCreateServiceDialog: React.FC<ICreateServiceProps> = (props: ICreateServiceProps) => {
    const ownerServices = new OwnerServices();
    const [serviceForm, setServiceForm] = useState<{
        name: string,
        price: number,
        description: string,
        createServiceTypeModel: {
            name: string;
            size: string;
            unit: string;
            percentage: number;
            key: string;
        }[],
        listURL: string[],
        atHome: boolean,
        status: 'ACTIVE' | 'INACTIVE'
    }>({
        name: '',
        price: 0,
        description: '',
        createServiceTypeModel: [],
        listURL: [],
        atHome: true,
        status: 'ACTIVE'
    });
    const [isUpload, setIsUpload] = useState<boolean>(false);
    const [images, setImages] = useState<string[]>([]);

    return (
        <>
            <Modal
                width={700}
                open={true}
                closable={false}
                title={(
                    <span className='__app-dialog-title'>
                        Thêm dịch vụ mới
                    </span>
                )}
                footer={[
                    <Button type="default" onClick={() => {
                        props.onCancel();
                    }}>Huỷ</Button>,
                    <Button type="primary"
                        style={{ backgroundColor: '#0D6368' }}
                        onClick={() => {
                            const validation = validateFormCreate();
                            if (validation.invalid === false) {
                                onCreateService();
                            } else {
                                toast.error(`Không được để trống ${validation.fields.join(', ')}`);
                            }

                        }}>Tạo</Button>
                ]}
                centered
            >
                <div className='__app-dialog-create-object'>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Tên dịch vụ: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(serviceForm) ?? {};
                                temp['name'] = args.target.value;
                                setServiceForm(temp);
                            }}
                                placeholder="Nhập tên dịch vụ"
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
                                let temp = cloneDeep(serviceForm) ?? {};
                                temp['description'] = args.target.value;
                                setServiceForm(temp);
                            }}
                                placeholder="Nhập mô tả"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Chăm sóc tại nhà:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Switch
                                onChange={(value) => {
                                    let temp = cloneDeep(serviceForm) ?? {};
                                    temp['atHome'] = value;
                                    setServiceForm(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={3} className='__app-object-field'>
                            <span>
                                <strong>Trạng thái: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <Select
                                onChange={(value) => {
                                    let temp = cloneDeep(serviceForm);
                                    temp['status'] = value;
                                    setServiceForm(temp);
                                }}
                                style={{ width: '100%' }}
                                options={[{ value: 'ACTIVE', label: 'Hoạt động' }, { value: 'INACTIVE', label: 'Ngưng hoạt động' }]}
                                value={serviceForm.status}
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
                                thousandSeparator=' '
                                allowNegative={false}
                                onValueChange={(values) => {
                                    let temp = cloneDeep(serviceForm) ?? {};
                                    temp['price'] = values.floatValue as number;
                                    setServiceForm(temp);
                                }}
                                placeholder="Nhập giá"
                            />
                            <span>Giá sẽ được áp dụng ngay khi tạo dịch vụ thành công.</span>
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Loại phụ thu:</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={18}>
                            {
                                serviceForm.createServiceTypeModel.reduce((acc, cur, currentIndex) => {
                                    acc.push(
                                        <Row
                                            id={`serviceType_${currentIndex}`}
                                            key={`serviceType_${currentIndex}`}
                                            className='__app-service-form'
                                            style={{ padding: 10, border: '1px solid #a5a5a5', borderRadius: 4, margin: '8px 0' }}
                                        >
                                            <Col span={23} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                <Row>
                                                    <Col span={6}>Tên loại phụ thu: </Col>
                                                    <Col span={16}>
                                                        <Input value={cur.name}
                                                            placeholder='Nhập tên loại phụ thu'
                                                            onChange={(args) => {
                                                                let temp = cloneDeep(serviceForm);
                                                                temp.createServiceTypeModel[currentIndex].name = args.target.value;
                                                                setServiceForm(temp);
                                                            }}></Input>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col span={6}>Kích thước (m): </Col>
                                                    <Col span={16}>
                                                        <Input value={cur.size}
                                                            placeholder='Nhập kích thước'
                                                            onChange={(args) => {
                                                                let temp = cloneDeep(serviceForm);
                                                                temp.createServiceTypeModel[currentIndex].size = args.target.value;
                                                                setServiceForm(temp);
                                                            }}></Input>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col span={6}>Phụ thu (%): </Col>
                                                    <Col span={16}>
                                                        <NumericFormat
                                                            className="app-numeric-input"
                                                            thousandSeparator=' '
                                                            value={cur.percentage}
                                                            onValueChange={(values) => {
                                                                let temp = cloneDeep(serviceForm);
                                                                temp.createServiceTypeModel[currentIndex].percentage = values.floatValue as number;
                                                                setServiceForm(temp);
                                                            }}
                                                            placeholder="Nhập giá"
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col span={1}>
                                                <RestOutlined style={{ width: 18, height: 18, fontSize: 18 }} onClick={(e) => {
                                                    e.preventDefault();
                                                    let temp = cloneDeep(serviceForm);
                                                    temp.createServiceTypeModel = temp.createServiceTypeModel.filter(item => { return item.key !== cur.key })
                                                    setServiceForm(temp);
                                                }} />
                                            </Col>
                                        </Row>
                                    )
                                    return acc;
                                }, [] as React.ReactNode[])
                            }
                            <Button type='default' onClick={() => {
                                let temp = cloneDeep(serviceForm);
                                temp.createServiceTypeModel.push({
                                    key: new Date().getTime().toString(),
                                    name: '',
                                    percentage: 0,
                                    size: '',
                                    unit: 'm'
                                })
                                setServiceForm(temp);
                            }}>Thêm loại phụ thu</Button>
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

    function validateFormCreate() {
        const temp = cloneDeep(serviceForm);
        let result = {
            invalid: false,
            fields: [] as string[],
        }
        if (CommonUtility.isNullOrEmpty(temp.name)) {
            result.invalid = true;
            result.fields.push('Tên dịch vụ');
        }
        if (CommonUtility.isNullOrEmpty(temp.description)) {
            result.invalid = true;
            result.fields.push('Mô tả');
        }
        if (CommonUtility.isNullOrEmpty(temp.createServiceTypeModel)) {
            result.invalid = true;
            result.fields.push('Loại phụ thu');
        } else {
            const dataValid = temp.createServiceTypeModel.reduce((acc, cur) => {
                if (CommonUtility.isNullOrEmpty(cur.name)) {
                    acc = true;
                }
                if (CommonUtility.isNullOrEmpty(cur.size)) {
                    acc = true;
                }
                if (CommonUtility.isNullOrEmpty(cur.percentage)) {
                    acc = true;
                }
                return acc;
            }, false);
            if (dataValid) {
                result.invalid = true;
                result.fields.push('Loại phụ thu');
            }
        }
        if (CommonUtility.isNullOrEmpty(temp.price) || temp.price === 0) {
            result.invalid = true;
            result.fields.push('Giá');
        }
        if (CommonUtility.isNullOrEmpty(images)) {
            result.invalid = true;
            result.fields.push('Ảnh dịch vụ');
        }
        return result;
    }

    function onCreateService() {
        const formData = {
            "name": serviceForm.name,
            "price": serviceForm.price,
            "description": serviceForm.description,
            "createServiceTypeModel": serviceForm.createServiceTypeModel.reduce((acc, cur) => {
                acc.push({
                    "name": cur.name,
                    "size": cur.size,
                    "unit": cur.unit,
                    "percentage": cur.percentage
                })
                return acc;
            }, [] as any[]),
            "listURL": images,
            "atHome": serviceForm.atHome,
            status: serviceForm.status
        }
        ownerServices.createService$(formData).pipe(take(1)).subscribe({
            next: (res) => {
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success('Thêm cây thành công');
                    props.onSave();
                }
            }
        })
    }

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

const FormCreateServicePackDialog: React.FC<ICreateServiceProps> = (props: ICreateServiceProps) => {
    const ownerServices = new OwnerServices();
    const [servicePackForm, setServicePackForm] = useState<{
        range: string | null;
        unit: 'năm' | 'tháng';
        percentage: number;
        status: 'ACTIVE' | 'INACTIVE';
    }>({
        range: null,
        unit: 'tháng',
        percentage: 0,
        status: 'ACTIVE'
    });

    return (
        <>
            <Modal
                width={700}
                open={true}
                closable={false}
                title={(
                    <span className='__app-dialog-title'>
                        Thêm gói dịch vụ mới
                    </span>
                )}
                footer={[
                    <Button type="default" onClick={() => {
                        props.onCancel();
                    }}>Huỷ</Button>,
                    <Button type="primary"
                        style={{ backgroundColor: '#0D6368' }}
                        onClick={() => {
                            const validation = validateFormCreate();
                            if (validation.invalid === false) {
                                onCreateServicePack();
                            } else {
                                toast.error(`Không được để trống ${validation.fields.join(', ')}`);
                            }

                        }}>Tạo</Button>
                ]}
                centered
            >
                <div className='__app-dialog-create-object'>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Thời hạn: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                value={servicePackForm.unit}
                                options={[
                                    {
                                        value: 'tháng',
                                        label: 'tháng'
                                    },
                                    {
                                        value: 'năm',
                                        label: 'năm'
                                    }
                                ]}
                                placeholder='Chọn thời hạn'
                                onChange={(value) => {
                                    let temp = cloneDeep(servicePackForm) ?? {};
                                    temp['unit'] = value;
                                    temp['range'] = null;
                                    setServicePackForm(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Khoản thời gian: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                value={servicePackForm.range}
                                options={
                                    servicePackForm.unit === 'năm' ? [
                                        {
                                            value: '1',
                                            label: '1'
                                        },
                                        {
                                            value: '2',
                                            label: '2'
                                        },
                                        {
                                            value: '3',
                                            label: '3'
                                        }
                                    ] : [
                                        {
                                            value: '1',
                                            label: '1'
                                        },
                                        {
                                            value: '2',
                                            label: '2'
                                        },
                                        {
                                            value: '3',
                                            label: '3'
                                        },
                                        {
                                            value: '4',
                                            label: '4'
                                        },
                                        {
                                            value: '5',
                                            label: '5'
                                        },
                                        {
                                            value: '6',
                                            label: '6'
                                        },
                                        {
                                            value: '7',
                                            label: '7'
                                        },
                                        {
                                            value: '8',
                                            label: '8'
                                        },
                                        {
                                            value: '9',
                                            label: '9'
                                        },
                                        {
                                            value: '10',
                                            label: '10'
                                        },
                                        {
                                            value: '11',
                                            label: '11'
                                        },
                                    ]
                                }
                                placeholder='Chọn thời hạn'
                                onChange={(value) => {
                                    let temp = cloneDeep(servicePackForm) ?? {};
                                    temp['range'] = value;
                                    setServicePackForm(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Khuyến mãi (%):</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={18}>
                            <NumericFormat
                                className="app-numeric-input"
                                thousandSeparator=' '
                                value={servicePackForm.percentage}
                                onValueChange={(values) => {
                                    let temp = cloneDeep(servicePackForm) ?? {};
                                    temp['percentage'] = (values.floatValue as number);
                                    setServicePackForm(temp);
                                }}
                                placeholder="Nhập khuyến mãi"
                                decimalScale={0}
                                suffix=' %'
                            />
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row'>
                        <Col span={6} className='__app-object-field'>
                            <span>
                                <strong>Trạng thái: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                onChange={(value) => {
                                    let temp = cloneDeep(servicePackForm);
                                    temp['status'] = value;
                                    setServicePackForm(temp);
                                }}
                                style={{ width: '100%' }}
                                options={[{ value: 'ACTIVE', label: 'Hoạt động' }, { value: 'INACTIVE', label: 'Ngưng hoạt động' }]}
                                value={servicePackForm.status}
                            />
                        </Col>
                    </Row>
                </div>
            </Modal>
        </>
    )

    function validateFormCreate() {
        const temp = cloneDeep(servicePackForm);
        let result = {
            invalid: false,
            fields: [] as string[],
        }
        if (CommonUtility.isNullOrEmpty(temp.unit)) {
            result.invalid = true;
            result.fields.push('Loại thời hạn');
        }
        if (CommonUtility.isNullOrEmpty(temp.range)) {
            result.invalid = true;
            result.fields.push('Thời hạn');
        }
        if (CommonUtility.isNullOrEmpty(temp.percentage)) {
            result.invalid = true;
            result.fields.push('Khuyến mãi');
        }
        return result;
    }

    function onCreateServicePack() {
        ownerServices.createServicePack$(servicePackForm.range as string, servicePackForm.unit as string, servicePackForm.percentage, servicePackForm.status).pipe(take(1)).subscribe({
            next: (res) => {
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success('Thêm gói dịch vụ công');
                    props.onSave();
                }
            }
        })
    }
}

const FormEditServicePackDialog: React.FC<IEditServicePackProps> = (props: IEditServicePackProps) => {
    const [servicePackForm, setServicePackForm] = useState<{
        range: string | null;
        unit: 'năm' | 'tháng';
        percentage: number;
    }>({
        range: props.servicePackData.range,
        unit: props.servicePackData.unit,
        percentage: props.servicePackData.percentage,
    });

    return (
        <>
            <Modal
                width={500}
                open={true}
                closable={false}
                title={(
                    <span className='__app-dialog-title'>
                        Thông tin gói dịch vụ
                    </span>
                )}
                footer={
                    [
                        <Button type="default" onClick={() => {
                            props.onCancel();
                        }}>Đóng</Button>,
                        // <Button type="primary"
                        //     style={{ backgroundColor: '#0D6368' }}
                        //     onClick={() => {
                        //         const validation = validateFormCreate();
                        //         if (validation.invalid === false) {
                        //             onEditService();
                        //         } else {
                        //             toast.error(`Không được để trống ${validation.fields.join(', ')}`);
                        //         }

                        //     }}>Lưu</Button>
                    ]
                }
                centered
            >
                <div className='__app-dialog-create-object'>
                    <Row className='__app-object-info-row' style={{ padding: '0 24px' }}>
                        <Col span={9} className='__app-object-field'>
                            <span>
                                <strong>Thời hạn: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={9}>
                            {/* <Select
                                style={{ width: '100%' }}
                                value={servicePackForm.unit}
                                options={[
                                    {
                                        value: 'tháng',
                                        label: 'tháng'
                                    },
                                    {
                                        value: 'năm',
                                        label: 'năm'
                                    }
                                ]}
                                placeholder='Chọn thời hạn'
                                onChange={(value) => {
                                    let temp = cloneDeep(servicePackForm) ?? {};
                                    temp['unit'] = value;
                                    temp['range'] = null;
                                    setServicePackForm(temp);
                                }}
                            /> */}
                            <span>{servicePackForm.unit}</span>
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row' style={{ padding: '0 24px' }}>
                        <Col span={9} className='__app-object-field'>
                            <span>
                                <strong>Khoản thời gian: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={9}>
                            {/* <Select
                                style={{ width: '100%' }}
                                value={servicePackForm.range}
                                options={
                                    servicePackForm.unit === 'năm' ? [
                                        {
                                            value: '1',
                                            label: '1'
                                        },
                                        {
                                            value: '2',
                                            label: '2'
                                        },
                                        {
                                            value: '3',
                                            label: '3'
                                        }
                                    ] : [
                                        {
                                            value: '1',
                                            label: '1'
                                        },
                                        {
                                            value: '2',
                                            label: '2'
                                        },
                                        {
                                            value: '3',
                                            label: '3'
                                        },
                                        {
                                            value: '4',
                                            label: '4'
                                        },
                                        {
                                            value: '5',
                                            label: '5'
                                        },
                                        {
                                            value: '6',
                                            label: '6'
                                        },
                                        {
                                            value: '7',
                                            label: '7'
                                        },
                                        {
                                            value: '8',
                                            label: '8'
                                        },
                                        {
                                            value: '9',
                                            label: '9'
                                        },
                                        {
                                            value: '10',
                                            label: '10'
                                        },
                                        {
                                            value: '11',
                                            label: '11'
                                        },
                                    ]
                                }
                                placeholder='Chọn thời hạn'
                                onChange={(value) => {
                                    let temp = cloneDeep(servicePackForm) ?? {};
                                    temp['range'] = value;
                                    setServicePackForm(temp);
                                }}
                            /> */}
                            <span>{servicePackForm.range}</span>
                        </Col>
                    </Row>
                    <Row className='__app-object-info-row' style={{ padding: '0 24px' }}>
                        <Col span={9} className='__app-object-field'>
                            <span>
                                <strong>Khuyến mãi (%):</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={9}>
                            <NumericFormat
                                // className="app-numeric-input"
                                displayType='text'
                                thousandSeparator=' '
                                value={servicePackForm.percentage}
                                onValueChange={(values) => {
                                    let temp = cloneDeep(servicePackForm) ?? {};
                                    temp['percentage'] = (values.floatValue as number);
                                    setServicePackForm(temp);
                                }}
                                placeholder="Nhập khuyến mãi"
                                decimalScale={0}
                                suffix=' %'
                            />
                        </Col>
                    </Row>
                </div>
            </Modal>
        </>
    )

    function validateFormCreate() {
        const temp = cloneDeep(servicePackForm);
        let result = {
            invalid: false,
            fields: [] as string[],
        }
        if (CommonUtility.isNullOrEmpty(temp.unit)) {
            result.invalid = true;
            result.fields.push('Loại thời hạn');
        }
        if (CommonUtility.isNullOrEmpty(temp.range)) {
            result.invalid = true;
            result.fields.push('Thời hạn');
        }
        if (CommonUtility.isNullOrEmpty(temp.percentage)) {
            result.invalid = true;
            result.fields.push('Khuyến mãi');
        }
        return result;
    }

    function onEditService() {
        // const formData = {
        //     "name": serviceForm.name,
        //     "price": serviceForm.price,
        //     "description": serviceForm.description,
        //     "createServiceTypeModel": serviceForm.createServiceTypeModel.reduce((acc, cur) => {
        //         acc.push({
        //             "name": cur.name,
        //             "size": cur.size,
        //             "unit": cur.unit,
        //             "percentage": cur.percentage
        //         })
        //         return acc;
        //     }, [] as any[]),
        //     "listURL": serviceForm.listURL,
        //     "atHome": serviceForm.atHome
        // }
        // ownerServices.createService$(formData).pipe(take(1)).subscribe({
        //     next: (res) => {
        //         if (res.error) {
        //             toast.error(res.error);
        //         } else {
        //             toast.success('Thêm cây thành công');
        //             props.onSave();
        //         }
        //     }
        // })
    }
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
    const [showPopupCreate, setShowPopupCreate] = useState<boolean>(false);
    const [popUpConfirm, setPopUpConfirm] = useState<any>({
        isShow: false,
        serviceID: '',
        message: '',
        action: ''
    });

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
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                {
                                    key: 'detail',
                                    label: <span
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setServiceDetail(record);
                                            setImageUrl(record?.imgList[0]?.url ?? '');
                                            setFormMode('edit');
                                        }}
                                    >Xem chi tiết</span>
                                },
                                record.status === 'ACTIVE' ?
                                    {
                                        key: 'disableService',
                                        label: <span
                                            onClick={() => {
                                                setPopUpConfirm({
                                                    isShow: true,
                                                    serviceID: record.serviceID,
                                                    message: 'Vui lòng xác nhận huỷ bán cây trong hệ thống.',
                                                    action: 'disable'
                                                });
                                            }}
                                        >Ngưng hoạt động</span>
                                    } : null,
                                record.status === 'INACTIVE' ?
                                    {
                                        key: 'activeService',
                                        label: <span
                                            onClick={() => {
                                                setPopUpConfirm({
                                                    isShow: true,
                                                    serviceID: record.serviceID,
                                                    message: 'Vui lòng xác nhận bán lại cây trong hệ thống.',
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

    function validateFormEdit() {
        let temp = cloneDeep(serviceDetail);
        let result = {
            invalid: false,
            fields: [] as string[]
        }
        if (CommonUtility.isNullOrEmpty(temp?.name)) {
            result.invalid = true;
            result.fields.push('Tên dịch vụ');
        }
        if (CommonUtility.isNullOrEmpty(temp?.description)) {
            result.invalid = true;
            result.fields.push('Mô tả');
        }
        return result;
    }

    return (
        <>
            {
                formMode === 'display' ? <>
                    <div className='__app-toolbar-container' style={{ width: '100%', padding: '8px 24px' }}>
                        <div className='__app-toolbar-left-buttons'>
                            <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                                setShowPopupCreate(true);
                            }}>Thêm dịch vụ</Button>
                            {/* <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                CommonUtility.exportExcel(services, tableUserColumns);
                            }}>Xuất Tệp Excel</Button> */}
                            <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                loadData();
                            }}>Tải Lại</Button>
                        </div>
                        <div className='__app-toolbar-right-buttons'>
                            <Search
                                style={{ marginLeft: 10 }}
                                className='__app-search-box'
                                placeholder="Nhập ID/ Tên Dịch vụ"
                                onSearch={(value) => {
                                    const columnsSearch = ['serviceID', 'name']
                                    const data = CommonUtility.onTableSearch(value, services, columnsSearch);
                                    setServicesOnSearch(data);
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ width: '100%' }}>
                        <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
                    </div>
                    <div className='__app-layout-container' style={{ width: '100%', height: 'calc(100vh - 200px)' }}>
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
                                    return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                                }
                            }}
                        ></Table>
                        {
                            showPopupCreate ?
                                <FormCreateServiceDialog
                                    onCancel={() => {
                                        setShowPopupCreate(false);
                                    }}
                                    onSave={() => {
                                        setShowPopupCreate(false);
                                        loadData();
                                    }}
                                />
                                : <></>
                        }
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
                                loadData();
                            }} />
                            <div className="__app-title-form">Chi tiết</div>
                        </div>
                        <div className="__app-content-container">
                            <div className="__app-main-info" style={{ gap: 18 }}>
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
                                                    <div style={{ marginLeft: 10 }}><strong>{serviceDetail?.serviceID}</strong></div>
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
                                                    <Input value={serviceDetail?.name} onChange={(args) => {
                                                        let temp = cloneDeep(serviceDetail);
                                                        temp.name = args.target.value;
                                                        setServiceDetail(temp);
                                                    }} />
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
                                                        // displayType='text'
                                                        className="app-numeric-input"
                                                        allowNegative={false}
                                                        value={serviceDetail?.price}
                                                        onValueChange={(values) => {
                                                            let temp = cloneDeep(serviceDetail);
                                                            temp['height'] = values.floatValue as number;
                                                            setServiceDetail(temp);
                                                        }}
                                                        placeholder="Nhập giá"
                                                        suffix=' vnđ'
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
                                                    <TextArea rows={6} defaultValue={serviceDetail?.description} onChange={(args) => {
                                                        let temp = cloneDeep(serviceDetail);
                                                        temp.description = args.target.value;
                                                        setServiceDetail(temp);
                                                    }}></TextArea>
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
                                    total: serviceDetail?.typeList.length,
                                    showTotal: (total, range) => {
                                        return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                                    }
                                }}
                            ></Table>
                            <div className="__app-action-button">
                                <Button type="primary" style={{ background: '#0D6368' }} onClick={() => {
                                    //todo
                                    let validation = validateFormEdit();
                                    if (validation.invalid) {
                                        toast.error(`Vui lòng nhập ${validation.fields.join(', ')}`);
                                    } else {
                                        let data = {
                                            "serviceID": serviceDetail.serviceID,
                                            "name": serviceDetail.name,
                                            "price": serviceDetail.price,
                                            "description": serviceDetail.description,
                                            "typeIDList": serviceDetail.typeList.reduce((acc: string[], cur: any) => {
                                                acc.push(cur.id);
                                                return acc;
                                            }, []),
                                            "listURL": serviceDetail.imgList.reduce((acc: string[], cur: any) => {
                                                acc.push(cur.url);
                                                return acc;
                                            }, []),
                                            "atHome": true
                                        }
                                        ownerServices.updateService$(data).pipe(take(1)).subscribe({
                                            next: () => {
                                                toast.success(`Cập nhật thành công`);
                                                loadData();
                                                setFormMode('display');
                                                setServiceDetail(null);
                                                setImageUrl('');
                                            }
                                        })
                                    }

                                }}>Lưu</Button>
                            </div>
                        </div>
                    </div>
                </> : <></>
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
                                    serviceID: '',
                                    message: '',
                                    action: ''
                                })
                            }}>Huỷ</Button>,
                            popUpConfirm.action === 'active' ?
                                <Button type="primary"
                                    style={{ backgroundColor: '#0D6368' }}
                                    onClick={() => {
                                        ownerServices.activeService$(popUpConfirm.serviceID).pipe(take(1)).subscribe({
                                            next: (res) => {
                                                if (res.error) {
                                                    toast.error(res.error);
                                                    setPopUpConfirm({
                                                        isShow: false,
                                                        serviceID: '',
                                                        message: '',
                                                        action: ''
                                                    })
                                                } else {
                                                    setPopUpConfirm({
                                                        isShow: false,
                                                        serviceID: '',
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
                                        ownerServices.disableService$(popUpConfirm.serviceID).pipe(take(1)).subscribe({
                                            next: (res) => {
                                                if (res.error) {
                                                    toast.error(res.error);
                                                    setPopUpConfirm({
                                                        isShow: false,
                                                        serviceID: '',
                                                        message: '',
                                                        action: ''
                                                    })
                                                } else {
                                                    setPopUpConfirm({
                                                        isShow: false,
                                                        serviceID: '',
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

const TabPackList: React.FC<{}> = (props) => {
    const ownerServices = new OwnerServices();

    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [servicePacks, setServicePacks] = useState<any[]>([]);
    const [servicePacksOnSearch, setServicePacksOnSearch] = useState<any[]>([]);
    const [isShowPopUpCreate, setShowPopUpCreate] = useState<boolean>(false);
    const [isShowPopUpEdit, setShowPopUpEdit] = useState<boolean>(false);
    const [servicePackEdit, setServicePackEdit] = useState<any>(null);
    const [popUpConfirm, setPopUpConfirm] = useState({
        isShow: false,
        packServiceID: '',
        message: '',
        action: ''
    });

    const tableUserColumns: ColumnsType<any> = [
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
            render: (value, record) => {
                return <span>{value} {record.unit}</span>
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
            // render: (_, record, __) => {
            //     return <div>
            //         <Button className='__app-command-button'
            //             type='ghost'
            //             onClick={(e) => {
            //                 e.preventDefault();
            //                 setShowPopUpEdit(true);
            //                 setServicePackEdit(record);
            //             }} icon={<FormOutlined />} />
            //     </div>
            // },
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
                                            setShowPopUpEdit(true);
                                            setServicePackEdit(record);
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
                                                    packServiceID: record.id,
                                                    message: 'Vui lòng xác nhận huỷ bán cây trong hệ thống.',
                                                    action: 'disable'
                                                });
                                            }}
                                        >Ngưng gói dịch vụ</span>
                                    } : null,
                                record.status === 'INACTIVE' ?
                                    {
                                        key: 'activePlant',
                                        label: <span
                                            onClick={() => {
                                                setPopUpConfirm({
                                                    isShow: true,
                                                    packServiceID: record.id,
                                                    message: 'Vui lòng xác nhận bán lại cây trong hệ thống.',
                                                    action: 'active'
                                                });
                                            }}
                                        >Bán lại</span>
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

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        ownerServices.getAllServicePacks$().pipe(take(1)).subscribe({
            next: data => {
                setServicePacks(data);
                setServicePacksOnSearch(data);
                setFirstInit(true);
                setDataReady(true);
            }
        })
    }

    return <>
        <div className='__app-toolbar-container' style={{ width: '100%', padding: '8px 24px' }}>
            <div className='__app-toolbar-left-buttons'>
                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => {
                    setShowPopUpCreate(true);
                }}>Thêm gói dịch vụ</Button>
                {/* <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                    CommonUtility.exportExcel(servicePacks, tableUserColumns);
                }}>Xuất Tệp Excel</Button> */}
                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                    loadData();
                }}>Tải Lại</Button>
            </div>
            <div className='__app-toolbar-right-buttons'>
                <Search
                    style={{ marginLeft: 10 }}
                    className='__app-search-box'
                    placeholder="Nhập ID/ Tên Gói"
                    onSearch={(value) => {
                        const columnsSearch = ['serviceID', 'name']
                        const data = CommonUtility.onTableSearch(value, servicePacks, columnsSearch);
                        setServicePacksOnSearch(data);
                    }}
                />
            </div>
        </div>
        <div style={{ width: '100%' }}>
            <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
        </div>
        <div className='__app-layout-container' style={{ width: '100%', height: 'calc(100vh - 200px)' }}>
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
                        return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                    }
                }}
            ></Table>

        </div>
        {
            isShowPopUpCreate ?
                <FormCreateServicePackDialog
                    onCancel={() => {
                        setShowPopUpCreate(false);
                    }}
                    onSave={() => {
                        setShowPopUpCreate(false);
                        loadData();
                    }}
                /> : <></>
        }
        {
            isShowPopUpEdit ?
                <FormEditServicePackDialog
                    servicePackData={servicePackEdit}
                    onCancel={() => {
                        setShowPopUpEdit(false);
                        setServicePackEdit(null);
                    }}
                    onSave={() => {
                        setShowPopUpEdit(false);
                        setServicePackEdit(null);
                        loadData();
                    }}
                /> : <></>
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
                                packServiceID: '',
                                message: '',
                                action: ''
                            })
                        }}>Huỷ</Button>,
                        popUpConfirm.action === 'active' ?
                            <Button type="primary"
                                style={{ backgroundColor: '#0D6368' }}
                                onClick={() => {
                                    ownerServices.activeServicePack$(popUpConfirm.packServiceID).pipe(take(1)).subscribe({
                                        next: (res) => {
                                            if (res.error) {
                                                toast.error(res.error);
                                                setPopUpConfirm({
                                                    isShow: false,
                                                    packServiceID: '',
                                                    message: '',
                                                    action: ''
                                                })
                                            } else {
                                                setPopUpConfirm({
                                                    isShow: false,
                                                    packServiceID: '',
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
                                    ownerServices.deleteServicePack$(popUpConfirm.packServiceID).pipe(take(1)).subscribe({
                                        next: (res) => {
                                            if (res.error) {
                                                toast.error(res.error);
                                                setPopUpConfirm({
                                                    isShow: false,
                                                    packServiceID: '',
                                                    message: '',
                                                    action: ''
                                                })
                                            } else {
                                                setPopUpConfirm({
                                                    isShow: false,
                                                    packServiceID: '',
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
}