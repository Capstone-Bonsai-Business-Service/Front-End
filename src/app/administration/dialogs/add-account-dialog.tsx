import { EyeInvisibleOutlined, EyeTwoTone, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Divider, Input, Modal, Radio, Row, Select, Upload } from 'antd';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CommonUtility } from '../../utils/utilities';
import { adminServices } from '../administration.service';
import { take } from 'rxjs';

interface IAccountDetailProps {
    onCancel: () => void;
    onSave: (data: any) => void;
}

export const CreateAccountDialog: React.FC<IAccountDetailProps> = (props) => {

    const adminService = new adminServices();

    const [accountDetail, setAccountDetail] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();

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
                    "avatar": accountDetail.avatar
                }
                adminService.createAccount$(accountInfo).pipe(take(1)).subscribe({
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
                                defaultValue='Staff'
                                style={{ width: '100%' }}
                                options={[
                                    { value: 'Staff', label: 'Staff' },
                                    { value: 'Manager', label: 'Manager' },
                                ]}
                                onChange={(value) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['accountType'] = value;
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
                                defaultValue='001'
                                style={{ width: '100%' }}
                                options={[
                                    { value: '001', label: 'Chi Nhánh 1' },
                                    { value: '002', label: 'Chi Nhánh 2' },
                                    { value: '003', label: 'Chi Nhánh 3' },
                                ]}
                                onChange={(value) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['storeId'] = value;
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
                            }} defaultValue={true}>
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
                        <Input
                                onChange={(args) => {
                                    let temp = cloneDeep(accountDetail) ?? {};
                                    temp['phone'] = args.target.value;
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
                    <Row className='__app-account-info-row'>
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
                    </Row>
                </div>
            </Modal>
        </>
    )
}