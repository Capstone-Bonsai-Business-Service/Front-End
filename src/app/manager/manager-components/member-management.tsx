import { FormOutlined, LeftOutlined, MoreOutlined, ReloadOutlined, UserOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Dropdown, Input, Modal, Radio, Row, Select, Skeleton, Table, Tag, Upload } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { ManagerServices } from "../manager.service";
import { take } from "rxjs";
import { IUser } from "../../../IApp.interface";
import { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";
import { CommonUtility } from "../../utils/utilities";
import toast from "react-hot-toast";
import { AccountStatusMapping } from "../../common/object-interfaces/account.interface";
import { PatternFormat } from "react-number-format";


interface IMemberManagementProps {
    roleName: 'Nhân Viên';
    roleID: string;
}

export const MemberManagementComponent: React.FC<IMemberManagementProps> = (props) => {

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const managerServices = new ManagerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [members, setMember] = useState<any[]>([]);
    const [membersOnSearch, setSearchMember] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [userDetail, setUserDetail] = useState<IUser | null>(null);
    const [popUpConfirm, setPopUpConfirm] = useState<{
        isShow: boolean,
        accountId: number
    }>({
        isShow: false,
        accountId: -1
    });

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    }, [isFirstInit, members, managerServices, props.roleID, props.roleName]);

    function loadData() {
        managerServices.getMembers$().pipe(take(1)).subscribe({
            next: data => {
                setMember(data);
                setSearchMember(data);
                setDataReady(true);
                setFirstInit(true);
            }
        });
    }

    const tableUserColumns: ColumnsType<IUser> = [
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
            title: `Tên ${props.roleName}`,
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
            width: 100,
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
        {
            title: '',
            dataIndex: 'command',
            align: 'center',
            width: 100,
            key: 'command',
            showSorterTooltip: false,
            ellipsis: true,
            render: (_, record, __) => {
                // return <div>
                //     <Button className='__app-command-button' onClick={(e) => {
                //         e.preventDefault();
                //         getUserDetail(record.id);
                //         setFormMode('edit');
                //     }} icon={<FormOutlined />} />
                // </div>
                return <div>
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [{
                                key: 'detail',
                                label: <span
                                    onClick={(e) => {
                                        e.preventDefault();
                                        getUserDetail(record.id);
                                        setFormMode('edit');
                                    }}
                                >Xem chi tiết</span>
                            },
                            record.status === 'ACTIVE' ? 
                            {
                                key: 'disableAccount',
                                label: <span
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPopUpConfirm({
                                            isShow: true,
                                            accountId: record['id']
                                        })
                                    }}
                                >Sa thải</span>
                            } : null,
                            ]
                        }}
                        placement='bottom'>
                        <MoreOutlined />
                    </Dropdown>
                </div>
            },
        }
    ]

    function getUserDetail(userID: number) {
        setDataReady(false);
        managerServices.getMemberByID$(userID).pipe(take(1)).subscribe({
            next: (data) => {
                setUserDetail(data);
                setDataReady(true);
            }
        });
    }

    return (
        <>
            {
                formMode === 'display' ? <>
                    <div className='__app-toolbar-container'>
                        <div className='__app-toolbar-left-buttons'>
                            {/* <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => { }}>Thêm {props.roleName}</Button> */}
                            <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => { }}>Xuất Tệp Excel</Button>
                            <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                setDataReady(false);
                                managerServices.getMembers$().pipe(take(1)).subscribe({
                                    next: data => {
                                        setMember(data);
                                        setSearchMember(data);
                                        setFirstInit(true);
                                        setDataReady(true);
                                    }
                                })
                            }}>Tải Lại</Button>
                        </div>
                        <div className='__app-toolbar-right-buttons'>
                            <Search
                                style={{ marginLeft: 10 }}
                                className='__app-search-box'
                                placeholder="ID, Tên"
                                onSearch={(value) => {
                                    const accountSearched = members.reduce((acc, cur) => {
                                        if (cur.fullName.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                                            acc.push(cur);
                                        } else if (cur.userID.toString().indexOf(value.toString()) > -1) {
                                            acc.push(cur);
                                        }
                                        return acc;
                                    }, []);
                                    setSearchMember(accountSearched);
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
                            size='middle'
                            columns={tableUserColumns}
                            className='__app-user-info-table'
                            dataSource={membersOnSearch}
                            pagination={{
                                pageSize: 8,
                                total: members.length,
                                showTotal: (total, range) => {
                                    return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                                }
                            }}
                        ></Table>
                    </div>
                </> : <></>
            }
            {
                formMode === 'edit' ? <>
                    <div className="__app-layout-container form-edit">
                        <div className="__app-top-action">
                            <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                                setFormMode('display');
                                setUserDetail(null);
                                // setImageUrl('');
                            }} />
                            <div className="__app-title-form">Chi tiết</div>
                        </div>
                        <div className="__app-content-container">
                            <Row className='__app-account-info-row'>
                                <Col span={3} className='__app-account-field'>
                                </Col>
                                <Col span={4}>
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
                                                return;
                                            }
                                            if (info.file.status === 'done') {
                                                // Get this url from response in real world.
                                                CommonUtility.getBase64(info.file.originFileObj as RcFile, (url) => {
                                                    // setLoading(false);
                                                    // setImageUrl(url);
                                                });
                                            }
                                            if (info.file.status === 'error') {
                                                // Get this url from response in real world.
                                                CommonUtility.getBase64(info.file.originFileObj as RcFile, (url) => {
                                                    // setLoading(false);
                                                    // setImageUrl(url);
                                                });
                                                // setLoading(false);
                                                toast.error('Tải ảnh thất bại. Vui lòng thử lại sau.');
                                            }
                                        }}
                                    >
                                        {
                                            userDetail?.avatar ?
                                                <Avatar shape="circle" size={100} src={userDetail?.avatar} icon={<UserOutlined />} /> :
                                                // <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> 
                                                <div>
                                                    <div style={{ marginTop: 8 }}>Upload</div>
                                                </div>
                                        }
                                    </Upload>
                                </Col>
                                <Col span={16}>
                                    <Row className='__app-account-info-row'>
                                        <Col span={5} className='__app-account-field'>
                                            <span>
                                                <strong>ID:</strong>
                                            </span>
                                        </Col>
                                        <Col span={15}>
                                            {
                                                isDataReady ?
                                                    <span><strong>{userDetail?.userID ?? '--'}</strong></span>
                                                    : <Skeleton.Input block={true} active={true} />
                                            }
                                        </Col>
                                    </Row>
                                    <Row className='__app-account-info-row'>
                                        <Col span={5} className='__app-account-field'>
                                            <span>
                                                <strong>Tên tài khoản:</strong>
                                            </span>
                                        </Col>
                                        <Col span={15}>
                                            {
                                                isDataReady ?
                                                    <span>{userDetail?.username ?? '--'}</span>
                                                    : <Skeleton.Input block={true} active={true} />
                                            }
                                        </Col>
                                    </Row>
                                    <Row className='__app-account-info-row'>
                                        <Col span={5} className='__app-account-field'>
                                            <span>
                                                <strong>Chức vụ:</strong>
                                            </span>
                                        </Col>
                                        <Col span={15}>
                                            {
                                                isDataReady ?
                                                    <span>{userDetail?.roleName ?? '--'}</span>
                                                    : <Skeleton.Input block={true} active={true} />
                                            }
                                        </Col>
                                    </Row>
                                    <Row className='__app-account-info-row'>
                                        <Col span={5} className='__app-account-field'>
                                            <span>
                                                <strong>Email:</strong> <span className='__app-required-field'> *</span>
                                            </span>
                                        </Col>
                                        <Col span={15}>
                                            {
                                                isDataReady ?
                                                    <span>{userDetail?.email ?? '--'}</span>
                                                    : <Skeleton.Input block={true} active={true} />
                                            }

                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <Divider className='__app-divider-no-margin'></Divider>
                            <Row className='__app-account-info-row'>
                                <Col span={3}>
                                </Col>
                                <Col span={3} className='__app-account-field'>
                                    <span>
                                        <strong>Họ & Tên:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={15}>
                                    {
                                        isDataReady ?
                                            <span>{userDetail?.fullName ?? ''}</span>
                                            : <Skeleton.Input block={true} active={true} />
                                    }
                                </Col>
                            </Row>
                            <Row className='__app-account-info-row'>
                                <Col span={3}>
                                </Col>
                                <Col span={3} className='__app-account-field'>
                                    <span>
                                        <strong>Phone:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={15}>
                                    {
                                        isDataReady ?
                                            <PatternFormat
                                                displayType='text'
                                                format='#### ### ###'
                                                value={userDetail?.phone ?? ''}
                                            />
                                            : <Skeleton.Input block={true} active={true} />
                                    }
                                </Col>
                            </Row>
                            <Row className='__app-account-info-row'>
                                <Col span={3}>
                                </Col>
                                <Col span={3} className='__app-account-field'>
                                    <span>
                                        <strong>Giới tính:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={15}>
                                    {
                                        isDataReady ?
                                            <Radio.Group
                                                disabled
                                                value={userDetail?.gender}>
                                                <Radio value={true}>Nam</Radio>
                                                <Radio value={false}>Nữ</Radio>
                                            </Radio.Group>
                                            : <Skeleton.Input block={true} active={true} />
                                    }

                                </Col>
                            </Row>
                            {/* {
                                !isDataReady ?
                                    <Skeleton.Input block={true} active={true} />
                                    :
                                    userDetail?.roleName === 'Staff' || 'Manager' ?
                                        <Row className='__app-account-info-row'>
                                            <Col span={3}>
                                            </Col>
                                            <Col span={3} className='__app-account-field'>
                                                <span>
                                                    <strong>Chi nhánh:</strong> <span className='__app-required-field'> *</span>
                                                </span>
                                            </Col>
                                            <Col span={15}>
                                                {
                                                    userDetail?.storeID ? <span>{userDetail?.storeName}</span> : <></>
                                                }
                                                {
                                                    userDetail?.storeID === null ?
                                                        <Select
                                                            defaultValue={userDetail?.storeID}
                                                            style={{ width: '100%' }}
                                                            options={stores}
                                                            onChange={(value) => {
                                                                // let temp = cloneDeep(accountDetail) ?? {};
                                                                // temp['storeId'] = value;
                                                                // setAccountDetail(temp);
                                                            }}
                                                        /> : <></>
                                                }

                                            </Col>
                                        </Row> :
                                        <></>
                            } */}
                            {/* {
                                isDataReady ?
                                    <div style={{ height: 210, display: 'flex', flexDirection: 'column-reverse', padding: 24 }}>
                                        <div className="__app-action-button" style={{ paddingRight: 115 }}>
                                            <Button type="primary" style={{ background: '#0D6368' }} onClick={() => {
                                                //todo
                                                setFormMode('display');
                                            }}>Lưu</Button>
                                        </div>
                                    </div> : <></>
                            } */}
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
                                    accountId: -1
                                })
                            }}>Huỷ</Button>,
                            <Button type="primary"
                                style={{ backgroundColor: '#5D050b' }}
                                onClick={() => {
                                    managerServices.disableAccount$(popUpConfirm.accountId).pipe(take(1)).subscribe({
                                        next: (res) => {
                                            if (res.error) {
                                                toast.error(res.error);
                                                setPopUpConfirm({
                                                    isShow: false,
                                                    accountId: -1
                                                })
                                            } else {
                                                setPopUpConfirm({
                                                    isShow: false,
                                                    accountId: -1
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
                        <span>Vui lòng xác nhận sẽ sa thải nhân viên?</span>
                    </Modal> : <></>
            }
        </>
    )
}