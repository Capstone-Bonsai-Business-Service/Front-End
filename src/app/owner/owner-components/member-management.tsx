import { LeftOutlined, ReloadOutlined, UserOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Radio, Row, Skeleton, Table, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { OwnerServices } from "../owner.service";
import { take } from "rxjs";
import { IUser } from "../../../IApp.interface";
import { CommonUtility } from "../../utils/utilities";
import { AccountStatusMapping } from "../../common/object-interfaces/account.interface";
import { PatternFormat } from "react-number-format";


interface IMemberManagementProps {
    roleName: 'Nhân Viên' | 'Quản Lý';
    roleID: string;
}

export const MemberManagementComponent: React.FC<IMemberManagementProps> = (props) => {
    const ownerServices = new OwnerServices();

    const [members, setMember] = useState<any[]>([]);
    const [membersOnSearch, setSearchMember] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');
    const [userDetail, setUserDetail] = useState<IUser | null>(null);

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        ownerServices.getMembers$(props.roleID).pipe(take(1)).subscribe({
            next: data => {
                setMember(data);
                setSearchMember(data);
                setDataReady(true);
            }
        });
        if (!isFirstInit) {
            setFirstInit(true);
        }
    }

    const tableUserColumns: ColumnsType<IUser> = [
        {
            title: 'ID',
            dataIndex: 'userID',
            key: 'userID',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
            sorter: {
                compare: (acc, cur) => acc.userID > cur.userID ? 1 : acc.userID < cur.userID ? -1 : 0
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
            title: 'Chi Nhánh Làm Việc',
            dataIndex: 'storeName',
            key: 'storeName',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
            render: (value) => {
                return <div>
                    {value ?? '--'}
                </div>
            },
            sorter: {
                compare: (acc, cur) => acc.storeName > cur.storeName ? 1 : acc.storeName < cur.storeName ? -1 : 0
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
                return <div>
                    <Button className='__app-command-button' onClick={(e) => {
                        e.preventDefault();
                        getUserDetail(record.userID);
                        setFormMode('edit');
                    }}>Chi tiết</Button>
                </div>
            },
        }
    ]

    function getUserDetail(userID: number) {
        setDataReady(false);
        ownerServices.getMemberByID$(userID).pipe(take(1)).subscribe({
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
                    <div className='__app-toolbar-container' style={{ padding: '8px 24px' }}>
                        <div className='__app-toolbar-left-buttons'>
                            {/* <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => { }}>Xuất Tệp Excel</Button> */}
                            <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                loadData();
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
                            <div className="__app-title-form">Chi tiết {props.roleName}</div>
                        </div>
                        <div className="__app-content-container">
                            <Row className='__app-account-info-row'>
                                <Col span={3} className='__app-account-field'>
                                </Col>
                                <Col span={4}>
                                    <Avatar shape="circle" size={100} src={userDetail?.avatar} icon={<UserOutlined />} />
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
                            {
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
                                                    userDetail?.storeID ? <span>{userDetail?.storeName}</span> : <>--</>
                                                }
                                            </Col>
                                        </Row> :
                                        <></>
                            }
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
        </>
    )
}