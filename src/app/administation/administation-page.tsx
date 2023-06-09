import React, { useEffect, useState } from 'react'
import { IUser } from '../../IApp.interface';
import { Avatar, Badge, Button, Col, Divider, Dropdown, Layout, Menu, MenuProps, Row, Skeleton, Table, Tag, Tooltip } from 'antd';
import { BarsOutlined, BellOutlined, CalendarOutlined, DeleteOutlined, DownOutlined, FormOutlined, LogoutOutlined, TableOutlined, UserOutlined } from '@ant-design/icons';
import { adminServices } from './administation.service';
import { layoutMode } from '../common/interfaces';
import { ColumnsType } from 'antd/es/table';
import Search from 'antd/es/input/Search';

interface IAdminPageProps {
    currentUser?: IUser;
}

export const AdminPage: React.FC<IAdminPageProps> = (props) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const adminService = new adminServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [accounts, setAccount] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [mode, setMode] = useState<layoutMode>('list');

    useEffect(() => {
        if (!isFirstInit) {
            adminService.getAccounts$().subscribe({
                next: (res) => {
                    setAccount(res);
                    setFirstInit(true);
                    setDataReady(true);
                }
            })
        }
    }, [adminService, isFirstInit]);

    const items: MenuProps['items'] = [
        {
            key: 'listAccount',
            className: '__app-group-menu',
            label: (
                <div className='__app-group-menu-label'>
                    <span>Danh sách tài khoản</span>
                    <UserOutlined className='__app-group-menu-icon' />
                </div>
            ),
            type: 'group',
            children: [
                {
                    key: 'managerAccounts',
                    label: 'Tài khoản Manager',
                    className: '__app-children-menu-divider'
                },
                {
                    key: 'staffAccounts',
                    label: 'Tài khoản Staff',
                    className: '__app-children-menu-divider'
                },
                {
                    key: 'customerAccounts',
                    label: 'Tài khoản Customer',
                    className: '__app-children-menu-divider'
                }
            ]
        }
    ]

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'user-info',
            label: (
                <a href='/userpage'>
                    Trang cá nhân
                </a>
            ),
            icon: (
                <UserOutlined />
            )
        },
        {
            key: 'logout',
            label: (
                <span onClick={(e) => {
                    e.preventDefault();
                }}>
                    Đăng xuất
                </span>
            ),
            icon: <LogoutOutlined />
        }
    ]

    const tableUserColumns: ColumnsType<any> = [
        {
            title: 'Họ & Tên',
            dataIndex: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
        }
    ]

    function statusColorMapping(status: string) {
        switch (status) {
            case 'Đang hoạt động': return 'green';
            case 'Dừng hoạt động': return 'error';
            default: return 'default';
        }
    }

    function renderUserInfoFrame() {
        const arrAccounts = accounts.reduce((acc, cur) => {
            acc.push(
                <div className='__app-user-frame-container'>
                    <div className='__app-avatar-block'>
                        <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} src={cur.avatar} />
                    </div>
                    <div className='__app-account-info-block-container'>
                        <div className='__app-account-info-top-block'>
                            <span className='__app-full-name'>{cur.fullName}</span>
                            <Row>
                                <Col className='__app-account-field' span={3}>Chi nhánh:</Col>
                                <Col span={21}>{cur.store?.name}</Col>
                            </Row>
                            <Row>
                                <Col className='__app-account-field' span={3}>Địa chỉ:</Col>
                                <Col span={21}>{cur.store?.address}</Col>
                            </Row>
                        </div>
                        <Divider className='__app-divider-no-margin'></Divider>
                        <div className='__app-account-info-bottom-block'>
                            <div className='__app-account-info-left'>
                                <span className='__app-account-info-title'>Thông tin tài khoản</span>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Account Id:</Col>
                                    <Col span={18}>{cur.Id}</Col>
                                </Row>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Tài khoản:</Col>
                                    <Col span={18}>{cur.role}</Col>
                                </Row>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Ngày tạo:</Col>
                                    <Col span={18}>{cur.createdAt}</Col>
                                </Row>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Trạng thái:</Col>
                                    <Col span={18}>
                                        <Tag color={statusColorMapping(cur.status)}>{cur.status}</Tag>
                                    </Col>
                                </Row>
                            </div>
                            <Divider type='vertical' style={{ height: '100%' }} className='__app-divider-no-margin'></Divider>
                            <div className='__app-account-info-right'>
                                <span className='__app-account-info-title'>Thông tin người dùng</span>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Email:</Col>
                                    <Col span={18}>{cur.email}</Col>
                                </Row>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Số điện thoại:</Col>
                                    <Col span={18}>{cur.phone}</Col>
                                </Row>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Địa chỉ:</Col>
                                    <Col span={18}>{cur.address}</Col>
                                </Row>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Giới tính:</Col>
                                    <Col span={18}>{cur.gender}</Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                    <Divider type='vertical' style={{ height: '100%' }} className='__app-divider-no-margin'></Divider>
                    <div className='__app-command-block'>
                        <Button className='__app-command-button' icon={<FormOutlined />} />
                        <Button className='__app-command-button' icon={<DeleteOutlined />} />
                    </div>
                </div>
            )
            return acc;
        }, []);
        return arrAccounts;
    }

    function renderShimmerLoading() {
        const arrShimmer = ['', '', ''].reduce((acc, _) => {
            acc.push(
                <div className='__app-user-frame-container'>
                    <div className='__app-avatar-block'>
                        <Skeleton.Avatar active size={80}></Skeleton.Avatar>
                    </div>
                    <div className='__app-account-info-block-container'>
                        <div className='__app-account-info-top-block'>
                            <span className='__app-full-name'>
                                <Skeleton
                                    className='__app-shimmer-content'
                                    title
                                    active
                                    paragraph={{
                                        rows: 2,
                                        width: ['50%', '50%']
                                    }}
                                >
                                </Skeleton>
                            </span>
                        </div>
                        <Divider className='__app-divider-no-margin'></Divider>
                        <div className='__app-account-info-bottom-block'>
                            <div className='__app-account-info-left'>
                                <Skeleton title
                                    className='__app-shimmer-content'
                                    active
                                    paragraph={{
                                        rows: 4,
                                        width: ['50%', '50%', '50%', '50%']
                                    }}
                                >
                                </Skeleton>
                            </div>
                            <Divider type='vertical' style={{ height: '100%' }} className='__app-divider-no-margin'></Divider>
                            <div className='__app-account-info-right'>
                                <Skeleton title
                                    active
                                    className='__app-shimmer-content'
                                    paragraph={{
                                        rows: 4,
                                        width: ['50%', '50%', '50%', '50%']
                                    }}
                                >
                                </Skeleton>
                            </div>
                        </div>
                    </div>
                    <Divider type='vertical' style={{ height: '100%' }} className='__app-divider-no-margin'></Divider>
                    <div className='__app-command-block'>
                        <Skeleton.Button active></Skeleton.Button>
                        <Skeleton.Button active></Skeleton.Button>
                    </div>
                </div>
            );
            return acc;
        }, [] as JSX.Element[]);
        return arrShimmer;
    }

    return (
        <>
            <Layout className='__admin-layout ant-layout-has-sider'>
                <Layout.Sider className='__app-layout-slider' trigger={null}>
                    <div className='__app-user-info-slider'>
                        {
                            props.currentUser?.avatar ?
                                <Avatar className='__app-user-avatar' src={props.currentUser?.avatar} /> :
                                <Avatar className='__app-user-avatar'>PH</Avatar>
                        }
                        <Dropdown
                            trigger={['click']}
                            menu={{ items: userMenuItems }}
                            placement='bottomRight'>
                            <div className='__app-user-info-group'>
                                <div className='__app-user-display-name-container'>
                                    <span className='__app-user-display-name'>{props.currentUser?.fullName ?? ''}</span>
                                    <DownOutlined />
                                </div>
                                <div className='__app-user-role'>{props.currentUser?.role ?? ''}</div>
                            </div>
                        </Dropdown>
                    </div>
                    <Divider className='__app-user-info-divider'></Divider>
                    <Menu className='__app-slider-menu' mode='inline' items={items} ></Menu>
                </Layout.Sider>
                <Layout>
                    <Layout.Header className='__app-layout-header'>
                        <Badge count={0}>
                            <Avatar shape="square" size="large" icon={<BellOutlined />} />
                        </Badge>
                    </Layout.Header>
                    <Layout.Content className='__app-layout-content'>
                        <div className='__app-toolbar-container'>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' type='primary'>Tạo tài khoản</Button>
                                <Search style={{ marginLeft: 10 }} placeholder="Tìm kiếm" />
                            </div>
                            <div className='__app-toolbar-right-buttons'>
                                <Tooltip placement='bottom' title='Dữ liệu bảng' arrow={true}>
                                    <Button
                                        className={mode === 'table' ? '__app-mode-button active' : '__app-mode-button'}
                                        type='text'
                                        icon={<CalendarOutlined />}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setMode('table');
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip placement='bottom' title='Dữ liệu chi tiết' arrow={true}>
                                    <Button
                                        className={mode === 'list' ? '__app-mode-button active' : '__app-mode-button'}
                                        type='text'
                                        style={{ marginLeft: 10 }}
                                        icon={<BarsOutlined />}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setMode('list');
                                        }}
                                    />
                                </Tooltip>

                            </div>
                        </div>
                        <div style={{ width: '94%' }}>
                            <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
                        </div>
                        <div className='__app-layout-container'>
                            {
                                mode === 'list' ?
                                    (isDataReady ?
                                        renderUserInfoFrame() :
                                        renderShimmerLoading()
                                    ) :
                                    (<Table
                                        tableLayout='auto'
                                        columns={tableUserColumns}
                                        className='__app-user-info-table'
                                        dataSource={accounts}
                                    ></Table>)
                            }
                        </div>
                    </Layout.Content>
                </Layout>
            </Layout>
        </>
    )
}