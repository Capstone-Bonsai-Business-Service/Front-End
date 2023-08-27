import { EyeInvisibleOutlined, EyeTwoTone, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Divider, Input, Modal, Radio, Row, Select, Upload } from 'antd';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CommonUtility } from '../../utils/utilities';
import { adminServices } from '../administration.service';
import { switchMap, take } from 'rxjs';
import { PatternFormat } from 'react-number-format';
import { IStore } from '../../common/object-interfaces/store.interface';

interface IAccountDetailProps {
    onCancel: () => void;
    onSave: (data: any) => void;
    role: string[];
}

export const CreateAccountDialog: React.FC<IAccountDetailProps> = (props) => {

    const adminService = new adminServices();

    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [newStores, setNewStores] = useState<IStore[]>([]);

    useEffect(() => {
        if (!isDataReady) {
            adminService.getStoreWithoutManager$().pipe(take(1)).subscribe({
                next: (value) => {
                    setNewStores(value);
                    setDataReady(true);
                }
            })
        }
    })

    const [accountDetail, setAccountDetail] = useState<{
        username: string;
        password: string;
        fullName: string;
        email: string;
        phone: string;
        address: string;
        role: string;
        gender: boolean;
        storeID: string;
    }>({
        username: '',
        password: '123456',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        gender: true,
        role: props.role[0] ?? '',
        storeID: ''
    });
    // const [loading, setLoading] = useState(false);
    // const [imageUrl, setImageUrl] = useState<string>();

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
                const accountInfo = {
                    "username": accountDetail.username,
                    "password": accountDetail.password,
                    "fullName": accountDetail.fullName,
                    "email": accountDetail.email,
                    "phone": accountDetail.phone,
                    "address": accountDetail.address,
                    "gender": accountDetail.gender,
                    "avatar": 'https://t4.ftcdn.net/jpg/05/49/98/39/240_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg'
                }
                let userIdNew = -1;
                adminService.createAccount$(accountInfo).pipe(
                    switchMap((res: string) => {
                        userIdNew = Number(res) ?? -1;
                        return adminService.changeRoleNewUser$(accountDetail.role === 'manager' ? 'R003' : 'R004', accountDetail.username);
                        
                    }),
                    switchMap(_ => {
                        return adminService.addStoreEmployee$(accountDetail.storeID, userIdNew);
                    })
                ).subscribe({
                    next: (res) => {
                        if (props.onSave) {
                            props.onSave(res);
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
                open={true}
                closable={false}
                title={(
                    <span className='__app-dialog-title'>
                        Thêm tài khoản
                    </span>
                )}
                footer={getRenderFooterButton()}
                centered
            >
                <div className='__app-dialog-create-account'>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Tên tài khoản: </strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input onChange={(args) => {
                                let temp = cloneDeep(accountDetail) ?? {};
                                temp['username'] = args.target.value;
                                setAccountDetail(temp);
                            }}
                                placeholder="Nhập tên tài khoản"
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Mật khẩu:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input.Password
                                placeholder="Nhập mật khẩu"
                                value={accountDetail?.password ?? '123456'}
                                onChange={(args) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['password'] = args.target.value;
                                    setAccountDetail(temp);
                                }}
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Loại tài khoản:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Select
                                value={accountDetail.role}
                                style={{ width: '100%' }}
                                options={props.role.map(item => {
                                    return {
                                        label: item,
                                        value: item
                                    }
                                })}
                                onChange={(value) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['role'] = value;
                                    setAccountDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Chi Nhánh:</strong> <span className='__app-required-field'> *</span>
                            </span>

                        </Col>
                        <Col span={18}>
                            <Select
                                style={{ width: '100%' }}
                                options={newStores.reduce((acc: any[], cur) => {
                                    if (accountDetail.role === 'manager') {
                                        if (CommonUtility.isNullOrUndefined(cur.managerID)) {
                                            acc.push({
                                                label: cur.storeName,
                                                value: cur.id
                                            })
                                        }
                                    } else {
                                        acc.push({
                                            label: cur.storeName,
                                            value: cur.id
                                        })
                                    }
                                    return acc;
                                }, [])}
                                onChange={(value) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['storeID'] = value;
                                    setAccountDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Divider className='__app-divider-no-margin'></Divider>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Họ & Tên:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input
                                onChange={(args) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['fullName'] = args.target.value;
                                    setAccountDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Email:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Input
                                onChange={(args) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['email'] = args.target.value;
                                    setAccountDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Giới tính:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <Radio.Group onChange={(args) => {
                                let temp = cloneDeep(accountDetail) ?? {};
                                temp['gender'] = args.target.value;
                                setAccountDetail(temp);
                            }} value={accountDetail?.gender ?? true}>
                                <Radio value={true}>Nam</Radio>
                                <Radio value={false}>Nữ</Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <span>
                                <strong>Phone:</strong> <span className='__app-required-field'> *</span>
                            </span>
                        </Col>
                        <Col span={18}>
                            <PatternFormat
                                className="app-numeric-input"
                                format='#### ### ###'
                                onValueChange={(value) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['phone'] = value.value;
                                    setAccountDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <strong>Địa chỉ:</strong>
                        </Col>
                        <Col span={18}>
                            <Input
                                onChange={(args) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['address'] = args.target.value;
                                    setAccountDetail(temp);
                                }}
                            />
                        </Col>
                    </Row>
                    {/* <Row className='__app-account-info-row'>
                        <Col span={6} className='__app-account-field'>
                            <strong>Ảnh đại diện:</strong>
                        </Col>
                        <Col span={18}>
                            <Upload
                                name="avatar"
                                listType="picture-circle"
                                className="avatar-uploader"
                                showUploadList={false}
                                // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                action={(file: RcFile) => {
                                    return new Promise<string>(resolve => {
                                        console.log(file);
                                        resolve('https://www.mocky.io/v2/5cc8019d300000980a055e76');
                                    })
                                }}
                                beforeUpload={() => {

                                }}
                                onChange={(info: UploadChangeParam<UploadFile>) => {
                                    if (info.file.status === 'uploading') {
                                        setLoading(true);
                                        return;
                                    }
                                    if (info.file.status === 'done') {
                                        // Get this url from response in real world.
                                        CommonUtility.getBase64(info.file.originFileObj as RcFile, (url) => {
                                            setLoading(false);
                                            setImageUrl(url);
                                        });
                                    }
                                    if (info.file.status === 'error') {
                                        // Get this url from response in real world.
                                        CommonUtility.getBase64(info.file.originFileObj as RcFile, (url) => {
                                            setLoading(false);
                                            setImageUrl(url);
                                        });
                                        setLoading(false);
                                        toast.error('Tải ảnh thất bại. Vui lòng thử lại sau.');
                                    }
                                }}
                            >
                                {
                                    imageUrl ?
                                        <Avatar shape="circle" size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} src={imageUrl} /> :
                                        // <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> 
                                        <div>
                                            {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                }
                            </Upload>
                        </Col>
                    </Row> */}
                </div>
            </Modal>
        </>
    )
}