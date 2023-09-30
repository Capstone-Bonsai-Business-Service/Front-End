import { useEffect, useState } from 'react';
import { OwnerServices } from '../../owner.service';
import { forkJoin, take } from 'rxjs';
import { Button, Col, DatePicker, Input, Modal, Row, Select } from 'antd';
import toast from 'react-hot-toast';
import { NumericFormat, PatternFormat } from 'react-number-format';
import { CheckSquareOutlined, PlusOutlined, RestOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';
import { UserPicker } from '../../../common/components/user-picker-component';
import { DateTime } from 'luxon';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
import { CommonUtility } from '../../../utils/utilities';


export const FormCreateContractDialog: React.FC<any> = (props: any) => {
    const [contractDetail, setContractDetail] = useState<any>({});
    const [staffList, setStaffList] = useState<any[]>([]);
    const [serviceList, setServiceList] = useState<any[]>([]);
    const [servicePackList, setServicePackTypeList] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);

    const [servicesForm, setServiceForm] = useState<any[]>([]);
    const [checkCustomer, setCheckCustomer] = useState<{
        isChecked: boolean,
        isExist: boolean
    }>({
        isChecked: false,
        isExist: false
    })

    const apiService = new OwnerServices();

    useEffect(() => {
        if (!isFirstInit) {
            forkJoin([apiService.getMembers$(), apiService.getService$(), apiService.getServicePacks$()]).subscribe({
                next: values => {
                    const staffListOption = values[0].reduce((acc, cur) => {
                        acc.push({
                            value: cur.id,
                            label: cur.fullName
                        })
                        return acc;
                    }, [] as any)
                    setStaffList(staffListOption);
                    setServicePackTypeList(values[2]);
                    setServiceList(values[1]);
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
            <Button key='save' type='primary' style={{ background: '#0D6368' }} onClick={() => {
                const firstServiceName = serviceList.find(item => item.serviceID === servicesForm[0]?.serviceID)?.name ?? 'Dịch vụ';
                const dataPost = {
                    'title': `Hợp đồng ${firstServiceName}`,
                    'fullName': contractDetail['fullName'],
                    'phone': contractDetail['phone'] ?? '',
                    'address': contractDetail['address'] ?? '',
                    'storeID': apiService.storeId,
                    // 'status': contractDetail.status ?? 'ACTIVE',
                    'paymentMethod': contractDetail['paymentMethod'] ?? '',
                    'customerID': contractDetail['customerID'] !== -1 ? contractDetail['customerID'] : null,
                    'email': contractDetail['email'] ?? '',
                    'detailModelList': servicesForm.reduce((acc, cur) => {
                        acc.push({
                            'note': CommonUtility.isNullOrEmpty(cur['note']) ? '(Không có ghi chú)' : cur['note'],
                            'timeWorking': cur['timeWorking']?.join(' - ') ?? '',
                            'totalPrice': getTotalPrice(cur),
                            'servicePackID': cur['servicePackID'] ?? '',
                            'serviceTypeID': cur['serviceTypeID'] ?? '',
                            'startDate': cur['startDate'] ?? '',
                            'endDate': getEndDate(cur) ?? '',
                            'plantName': cur['plantName'] ?? '(Chưa có tên cây)'
                        })
                        return acc;
                    }, []),
                    'staffID': contractDetail['staffID'] !== -1 ? contractDetail['staffID'] : null,
                    // 'listURL': imageScanUrls,
                    'isPaid': true
                }
                apiService.createContract$(dataPost).subscribe({
                    next: (res) => {
                        if (res) {
                            toast.success('Tạo yêu cầu thành công');
                            if (props.onSave) {
                                props.onSave(contractDetail);
                            }
                        } else {
                            toast.error('Tạo yêu cầu thất bại');
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
                width={1100}
                open={true}
                closable={false}
                title={(
                    <span className='__app-dialog-title'>
                        Tạo yêu cầu
                    </span>
                )}
                footer={getRenderFooterButton()}
                centered
            >
                <div className='__app-dialog-create-account'>
                    <Row className='__app-account-info-row'>
                        <Col span={12}>
                            <Row>
                                <Col span={6} className='__app-account-field'>
                                    <span>
                                        <strong>Số điện thoại:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={16} style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 10
                                }}>
                                    <PatternFormat
                                        displayType='input'
                                        className='app-numeric-input'
                                        format='#### ### ###'
                                        value={contractDetail?.phone ?? ''}
                                        onValueChange={(values) => {
                                            let temp = cloneDeep(contractDetail) ?? {};
                                            temp['phone'] = values.value;
                                            setContractDetail(temp);
                                            setCheckCustomer({
                                                isChecked: false,
                                                isExist: false
                                            })
                                        }}
                                        placeholder='Nhập số điện thoại khách hàng'
                                    />
                                    <Button type='ghost' title='Kiểm tra khách hàng' icon={<CheckSquareOutlined style={{ color: '#0D6368' }} />} onClick={() => {
                                        apiService.checkExistedCustomer$(contractDetail?.phone).pipe(take(1)).subscribe({
                                            next: (value) => {
                                                if (value.error) {
                                                    setCheckCustomer({
                                                        isChecked: true,
                                                        isExist: false
                                                    })
                                                } else {
                                                    setCheckCustomer({
                                                        isChecked: true,
                                                        isExist: value.length > 0
                                                    });
                                                    if (value.length > 0) {
                                                        let temp = cloneDeep(contractDetail) ?? {};
                                                        temp['fullName'] = value[0].fullName;
                                                        temp['email'] = value[0].email;
                                                        temp['address'] = value[0].address;
                                                        temp['customerID'] = value[0].userID;
                                                        setContractDetail(temp);
                                                    } else {
                                                        let temp = cloneDeep(contractDetail) ?? {};
                                                        temp['fullName'] = '';
                                                        temp['email'] = '';
                                                        temp['address'] = '';
                                                        temp['customerID'] = -1;
                                                        setContractDetail(temp);
                                                    }
                                                }
                                            }
                                        })
                                    }}></Button>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Row>
                                <Col span={6} className='__app-account-field'>
                                    <span>
                                        <strong>Khách Hàng: </strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={16}>
                                    <Input onChange={(args) => {
                                        let temp = cloneDeep(contractDetail) ?? {};
                                        temp['fullName'] = args.target.value;
                                        setContractDetail(temp);
                                    }}
                                        placeholder='Nhập tên khách hàng'
                                        value={contractDetail?.fullName}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {
                        checkCustomer.isChecked ? <Row className='__app-account-info-row'>
                            <Col span={12}>
                                <Row>
                                    <Col span={6} className='__app-account-field'>
                                    </Col>
                                    <span
                                        style={{
                                            color: checkCustomer.isExist ? 'green' : 'red'
                                        }}
                                    >{
                                            checkCustomer.isExist ? 'Đã có user trong hệ thống' : 'User chưa có trong hệ thống'
                                        }</span>
                                </Row>
                            </Col>
                        </Row> : <></>
                    }
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span>
                                <strong>Địa chỉ:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(contractDetail) ?? {};
                                temp['address'] = args.target.value;
                                setContractDetail(temp);
                            }}
                                placeholder='Nhập địa chỉ'
                                value={contractDetail?.address}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span>
                                <strong>Email:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(contractDetail) ?? {};
                                temp['email'] = args.target.value;
                                setContractDetail(temp);
                            }}
                                placeholder='Nhập địa chỉ'
                                value={contractDetail?.email}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field' style={{ alignItems: 'flex-start' }}>
                            <span>
                                <strong>Dịch vụ:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            {
                                renderServiceForms()
                            }
                            {
                                servicesForm.length < 3 ?
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const form = cloneDeep(servicesForm);
                                            form.push({
                                                'tempId': new Date().getTime().toString(),
                                                'note': '',
                                                'timeWorking': [],
                                                'totalPrice': 0,
                                                'servicePackID': '',
                                                'serviceTypeID': '',
                                                'startDate': '',
                                                'endDate': '',
                                                'plantName': null
                                            })
                                            setServiceForm(form);
                                        }}
                                    >Thêm dịch vụ</Button> : <></>
                            }
                        </Col>
                    </Row>
                    {/* <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span>
                                <strong>Phương thức thanh toán:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <Select
                                style={{ width: '100%' }}
                                options={[
                                    { value: 'Thanh toán trực tuyến', label: 'Thanh toán trực tuyến' },
                                    { value: 'Thanh toán tiền mặt', label: 'Thanh toán tiền mặt' },
                                ]}
                                placeholder='Chọn phương thức thanh toán'
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['paymentMethod'] = value;
                                    setContractDetail(temp);
                                }}
                            />
                        </Col>
                    </Row> */}
                    {/* <Row className='__app-account-info-row'>

                    </Row> */}
                    <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span>
                                <strong>Nhân viên tiếp nhận:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <UserPicker
                                listUser={staffList}
                                placeholder='Chọn nhân viên'
                                onChanged={(value) => {
                                    let temp = cloneDeep(contractDetail) ?? {};
                                    temp['staffID'] = value;
                                    setContractDetail(temp);
                                }}
                            ></UserPicker>
                        </Col>
                    </Row>
                    {/* <Row className='__app-object-info-row'>
                        <Col span={3} className='__app-object-field'>
                            <span>
                                <strong>Trạng thái: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={20}>
                            <Select
                                onChange={(value) => {
                                    let temp = cloneDeep(contractDetail);
                                    temp['status'] = value;
                                    setContractDetail(temp);
                                }}
                                style={{ width: '100%' }}
                                options={[{ value: 'ACTIVE', label: 'Hoạt động' }, { value: 'INACTIVE', label: 'Ngưng hoạt động' }]}
                                value={contractDetail.status}
                            />
                        </Col>
                    </Row> */}
                    {/* <Row className='__app-account-info-row'>
                        <Col span={3} className='__app-account-field'>
                            <span><strong>Ảnh Scan: </strong> <span className='__app-required-field'> *</span></span>
                        </Col>
                        <Col span={20}>
                            <div className='__app-images-upload-container'>
                                <div className='__app-button-upload'>
                                    {
                                        !isUpload ? <Button key='upload' icon={<CloudUploadOutlined />} onClick={() => {
                                            document.getElementById('uploadContract')?.click();
                                        }}>Tải ảnh</Button> : <Skeleton.Button active={true}></Skeleton.Button>
                                    }

                                </div>
                                <input
                                    id='uploadContract'
                                    type='file'
                                    accept='*'
                                    multiple={false}
                                    hidden={true}
                                    onChange={(args) => {
                                        setIsUpload(true);
                                        const file = Array.from(args.target.files as FileList);
                                        apiService.uploadImageToFireBase$(file[0]).pipe(take(1)).subscribe({
                                            next: url => {
                                                const img = imageScanUrls;
                                                img.push(url as string);
                                                setImageScanUrls(img);
                                                setIsUpload(false);
                                            }
                                        });
                                    }}
                                />
                                <div>
                                    {
                                        imageScanUrls.reduce((acc, cur, index) => {
                                            acc.push(
                                                <img key={`image_contract_${index}`} src={cur} alt='' style={{ width: 150, height: 200 }} />
                                            )
                                            return acc;
                                        }, [] as React.ReactNode[])
                                    }
                                </div>
                            </div>
                        </Col>
                    </Row> */}
                </div>
            </Modal>
        </>
    )

    function renderServiceForms() {
        return servicesForm.reduce((acc, cur, currentIndex) => {
            acc.push(
                <Row
                    id={`service_${currentIndex}`}
                    key={`service_${currentIndex}`}
                    className='__app-service-form'
                    style={{ padding: 10, border: '1px solid #a5a5a5', borderRadius: 4, margin: '8px 0' }}>
                    <Col span={23}>
                        <Row
                            style={{ gap: 6 }}
                        >
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={12}>
                                    <Row>
                                        <Col className='__app-account-field' span={8}>
                                            <span>
                                                <strong>Tên dịch vụ:</strong> <span className='__app-required-field'> *</span>
                                            </span>
                                        </Col>
                                        <Col span={13}>
                                            <Select
                                                style={{ width: '100%' }}
                                                options={serviceList.reduce((acc_, cur_) => {
                                                    if (cur_.status === 'ACTIVE') {
                                                        acc_.push({
                                                            value: cur_.serviceID,
                                                            label: cur_.name
                                                        })
                                                    }
                                                    return acc_;
                                                }, [])}
                                                value={cur.serviceID}
                                                placeholder='Dịch vụ'
                                                onChange={(value) => {
                                                    const temp = cloneDeep(servicesForm) ?? [];
                                                    temp[currentIndex]['serviceID'] = value
                                                    temp[currentIndex]['serviceTypeID'] = null;
                                                    const _serviceTypeList = serviceList.find(item => item.serviceID === value)?.typeList.reduce((acc: any, cur: any) => {
                                                        acc.push({
                                                            value: cur.id,
                                                            label: cur.name
                                                        })
                                                        return acc;
                                                    }, []);
                                                    temp[currentIndex]['serviceTypeList'] = _serviceTypeList;
                                                    setServiceForm(temp);
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={12}>
                                    <Row>
                                        <Col className='__app-account-field' span={8}>
                                            <span>
                                                <strong>Loại dịch vụ:</strong> <span className='__app-required-field'> *</span>
                                            </span>
                                        </Col>
                                        <Col span={13}>
                                            <Select
                                                style={{ width: '100%' }}
                                                options={cur?.serviceTypeList ?? []}
                                                placeholder='Loại dịch vụ'
                                                value={cur.serviceTypeID}
                                                onChange={(value) => {
                                                    let temp = cloneDeep(servicesForm) ?? [];
                                                    temp[currentIndex]['serviceTypeID'] = value;
                                                    setServiceForm(temp);
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Tên cây:</strong> <span className='__app-required-field'> *</span>
                                    </span>

                                </Col>
                                <Col span={20}>
                                    <Input 
                                        value={ cur.plantName }
                                        onChange={(args) => {
                                            let temp = cloneDeep(servicesForm) ?? [];
                                            temp[currentIndex]['plantName'] = args.target.value;
                                            setServiceForm(temp);
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Gói:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={20}>
                                    <Select
                                        style={{ width: '100%' }}
                                        options={servicePackList?.reduce((acc, cur) => {
                                            if (cur.status === 'ACTIVE') {
                                                acc.push({
                                                    value: cur.id,
                                                    label: `${cur.range} ${cur.unit}`
                                                })
                                            }
                                            return acc;
                                        }, [] as any)}
                                        placeholder='Loại dịch vụ'
                                        value={cur.servicePackID}
                                        onChange={(value) => {
                                            let temp = cloneDeep(servicesForm) ?? [];
                                            temp[currentIndex]['servicePackID'] = value;
                                            setServiceForm(temp);
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Ngày bắt đầu:</strong> <span className='__app-required-field'> *</span>
                                    </span>

                                </Col>
                                <Col span={20}>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        placeholder='Chọn ngày bắt đầu'
                                        value={cur.startDate !== '' ? dayjs(new Date(cur.startDate)) : null}
                                        onChange={(value) => {
                                            let temp = cloneDeep(servicesForm) ?? [];
                                            temp[currentIndex]['startDate'] = DateTime.fromJSDate(value?.toDate() as any).toFormat('yyyy-MM-dd');
                                            setServiceForm(temp);
                                        }} />
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Lịch làm việc:</strong> <span className='__app-required-field'> *</span>
                                    </span>

                                </Col>
                                <Col span={20}>
                                    <Select
                                        style={{ width: '100%' }}
                                        mode='multiple'
                                        value={cur.timeWorking}
                                        options={[
                                            { value: 'Thứ 2', label: 'Thứ 2' },
                                            { value: 'Thứ 3', label: 'Thứ 3' },
                                            { value: 'Thứ 4', label: 'Thứ 4' },
                                            { value: 'Thứ 5', label: 'Thứ 5' },
                                            { value: 'Thứ 6', label: 'Thứ 6' },
                                            { value: 'Thứ 7', label: 'Thứ 7' },
                                            { value: 'Chủ Nhật', label: 'Chủ Nhật' },
                                        ]}
                                        optionFilterProp='label'
                                        placeholder='Chọn Lịch'
                                        onChange={(values) => {
                                            if (values.length <= 3) {
                                                let temp = cloneDeep(servicesForm) ?? [];
                                                temp[currentIndex]['timeWorking'] = values;
                                                setServiceForm(temp);
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Thành tiền:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={20}>
                                    {
                                        cur?.serviceID && cur?.serviceTypeID && cur?.servicePackID ?
                                            <NumericFormat displayType='text' thousandSeparator=' ' suffix=' vnđ' value={
                                                getTotalPrice(cur)
                                            } />
                                            : <>--</>
                                    }
                                </Col>
                            </Row>
                            <Row style={{ width: '100%', padding: '0 12px' }}>
                                <Col span={4} className='__app-account-field'>
                                    <span>
                                        <strong>Ghi chú:</strong>
                                    </span>
                                </Col>
                                <Col span={20}>
                                    <TextArea
                                        placeholder='Nhập ghi chú'
                                        rows={2}
                                        value={cur.note}
                                        onChange={(value) => {
                                            let temp = cloneDeep(servicesForm) ?? [];
                                            temp[currentIndex]['note'] = value.target.value;
                                            setServiceForm(temp);
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Row>
                    </Col>
                    <Col span={1}>
                        <RestOutlined style={{ width: 18, height: 18, fontSize: 18 }} onClick={(e) => {
                            e.preventDefault();
                            const form = servicesForm.filter(item => { return item.tempId !== cur.tempId })
                            setServiceForm(form);
                        }} />
                    </Col>
                </Row>
            );
            return acc;
        }, [] as React.ReactNode[]);
    }

    function getTotalPrice(cur: any) {
        let pack = Number(servicePackList.find(item => item.id === cur.servicePackID)?.range ?? '0')
        const unit = servicePackList.find(item => item.id === cur.servicePackID)?.unit;
        if (unit === 'năm') {
            pack = pack * 12;
        }
        const servicePrice = serviceList.find(item => item.serviceID === cur['serviceID'])?.price ?? 0;
        const servicePackPercent = servicePackList.find(item => item.id === cur['servicePackID'])?.percentage ?? 0;
        const serviceTypePercent = serviceList.find(item => item.serviceID === cur['serviceID'])?.typeList.find((itemTL: any) => itemTL.id === cur['serviceTypeID'])?.percentage ?? 0;
        const total = (servicePrice * pack) - (servicePrice * (servicePackPercent / 100) * pack) + (servicePrice * (serviceTypePercent / 100) * pack);
        return total;
    }

    function getEndDate(cur: any) {
        const startDate = new Date(cur['startDate'] ?? null);
        const numberOfDay = Number(servicePackList.find(item => item.id === cur.servicePackID)?.range ?? '0') * 30;
        const endDate = new Date(startDate.setDate(startDate.getDate() + numberOfDay));
        return DateTime.fromJSDate(endDate).toFormat('yyyy-MM-dd');
    }
}