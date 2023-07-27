import React, { useEffect, useState } from 'react'
import { IUser } from '../../IApp.interface';
import { Avatar, Button, Col, Divider, Dropdown, Layout, Menu, MenuProps, Row, Skeleton, Table, Tag, Tooltip } from 'antd';
import { BarsOutlined, CalendarOutlined, DeleteOutlined, FormOutlined, LogoutOutlined, PlusOutlined, ReloadOutlined, UserOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { adminServices } from './administration.service';
import { layoutMode } from '../common/interfaces';
import { ColumnsType } from 'antd/es/table';
import Search from 'antd/es/input/Search';
import { ColumnFilterItem } from 'antd/es/table/interface';
import { uniqBy } from 'lodash';
import { DateTime } from 'luxon';
import { CreateAccountDialog } from './dialogs/add-account-dialog';
import { useNavigate } from 'react-router-dom';
import './administration.scss';
import { CommonUtility } from '../utils/utilities';

interface IAdminPageProps {
    currentUser?: IUser;
    globalSettings: any;
    onLogoutCallback: () => void;
}

interface ITableFilter {
    fullName: ColumnFilterItem[],
    email: ColumnFilterItem[],
    status: ColumnFilterItem[],
    phone: ColumnFilterItem[]
}

export const AdminPage: React.FC<IAdminPageProps> = (props) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const adminService = new adminServices();

    const navigate = useNavigate();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [mode, setMode] = useState<layoutMode>('list');
    const [accountsOnSearch, setAccountsOnSearch] = useState<any[]>([]);
    const [objectFilter, setObjectFilter] = useState<ITableFilter>({
        email: [],
        fullName: [],
        phone: [],
        status: []
    })
    const [isShowDialogCreate, setShowDialogCreate] = useState<boolean>(false);
    const [currentMenu, setCurrentMenu] = useState<string>('allAccounts');

    useEffect(() => {
        if (!isFirstInit) {
            adminService.getAccounts$().subscribe({
                next: (res) => {
                    setAccounts(res);
                    setAccountsOnSearch(res);
                    bindingObjectFilter(res);
                    setFirstInit(true);
                    setDataReady(true);
                }
            })
        }
    }, [adminService, bindingObjectFilter, isFirstInit]);

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
                    key: 'allAccounts',
                    label: 'Tất cả',
                    className: '__app-children-menu-divider'
                },
                {
                    key: 'ownerAccounts',
                    label: 'Tài khoản Owner',
                    className: '__app-children-menu-divider'
                },
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
            key: 'logout',
            label: (
                <span onClick={(e) => {
                    e.preventDefault();
                    props.onLogoutCallback();
                    return navigate('/administration-login');
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
            key: 'fullName',
            showSorterTooltip: false,
            sorter: {
                compare: (acc, cur) => acc.fullName > cur.fullName ? 1 : acc.fullName < cur.fullName ? -1 : 0
            },
            ellipsis: true,
            render: (value, record, index) => {
                return <div>
                    <Avatar src={record.avatar} />
                    <span className='__app-column-full-name'>{value}</span>
                </div>
            },
            filterMode: 'menu',
            filters: objectFilter.fullName,
            filterSearch: true,
            filterMultiple: true,
            onFilter: (value, record) => (record.fullName as string).toLowerCase().indexOf((value as string).toLowerCase()) > -1,

        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            showSorterTooltip: false,
            sorter: {
                compare: (acc, cur) => acc.email > cur.email ? 1 : acc.email < cur.email ? -1 : 0
            },
            ellipsis: true,
            width: '30%',
            filterMode: 'menu',
            filters: objectFilter.email,
            filterSearch: true,
            filterMultiple: true,
            onFilter: (value, record) => (record.email as string).toLowerCase().indexOf((value as string).toLowerCase()) > -1,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            showSorterTooltip: false,
            sorter: {
                compare: (acc, cur) => acc.phone > cur.phone ? 1 : acc.phone < cur.phone ? -1 : 0
            },
            ellipsis: true,
            width: 200,
            filterMode: 'menu',
            filters: objectFilter.phone,
            filterSearch: true,
            filterMultiple: true,
            onFilter: (value, record) => (record.phone as string).toLowerCase().indexOf((value as string).toLowerCase()) > -1,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            showSorterTooltip: false,
            sorter: {
                compare: (acc, cur) => acc.status > cur.status ? 1 : acc.status < cur.status ? -1 : 0
            },
            ellipsis: true,
            render: (value) => {
                return <Tag color={CommonUtility.statusColorMapping(value)}>{value}</Tag>
            },
            width: 200,
            filterMode: 'menu',
            filters: objectFilter.status,
            filterSearch: true,
            filterMultiple: true,
            onFilter: (value, record) => (record.status as string).toLowerCase().indexOf((value as string).toLowerCase()) > -1,
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
                        openDetailUser(record.Id);
                    }} icon={<FormOutlined />} />
                </div>
            },
        }
    ]

    // eslint-disable-next-line react-hooks/exhaustive-deps
    function bindingObjectFilter(arrAccounts: any[]) {
        const __objFilter = arrAccounts.reduce((acc, cur) => {
            acc.email.push({
                text: cur.email,
                value: cur.email
            });
            acc.fullName.push({
                text: cur.fullName,
                value: cur.fullName
            });
            acc.phone.push({
                text: cur.phone,
                value: cur.phone
            });
            acc.status.push({
                text: cur.status,
                value: cur.status
            });
            return acc;
        }, {
            email: [],
            fullName: [],
            phone: [],
            status: []
        });
        __objFilter.email = uniqBy(__objFilter.email, (item: any) => item.value);
        __objFilter.fullName = uniqBy(__objFilter.fullName, (item: any) => item.value);
        __objFilter.phone = uniqBy(__objFilter.phone, (item: any) => item.value);
        __objFilter.status = uniqBy(__objFilter.status, (item: any) => item.value);
        setObjectFilter(__objFilter);
    }

    function renderUserInfoFrame() {
        const arrAccounts = accountsOnSearch.reduce((acc, cur) => {
            acc.push(
                <div className='__app-user-frame-container' key={cur.Id} onClick={() => {
                    openDetailUser(cur.Id);
                }}>
                    <div className='__app-avatar-block'>
                        <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} src={cur.avatar} />
                    </div>
                    <div className='__app-account-info-block-container'>
                        <div className='__app-account-info-top-block'>
                            <span className='__app-full-name'>{cur.fullName}</span>
                            {
                                cur.store ?
                                    <>
                                        <Row>
                                            <Col className='__app-account-field' span={3}>Chi nhánh:</Col>
                                            <Col span={21}>{cur.store?.name}</Col>
                                        </Row>
                                        <Row>
                                            <Col className='__app-account-field' span={3}>Địa chỉ:</Col>
                                            <Col span={21}>{cur.store?.address}</Col>
                                        </Row>
                                    </>
                                    : <></>
                            }
                        </div>
                        <Divider className='__app-divider-no-margin'></Divider>
                        <div className='__app-account-info-bottom-block'>
                            <div className='__app-account-info-left'>
                                <span className='__app-account-info-title'>Thông tin tài khoản</span>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Account Id:</Col>
                                    <Col span={18}>{cur.userID}</Col>
                                </Row>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Tài khoản:</Col>
                                    <Col span={18}>{cur.roleName}</Col>
                                </Row>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Ngày tạo:</Col>
                                    <Col span={18}>{DateTime.fromJSDate(new Date(cur.createdDate)).toFormat('dd-MM-yyyy HH:mm')}</Col>
                                </Row>
                                <Row>
                                    <Col className='__app-account-field' span={6}>Trạng thái:</Col>
                                    <Col span={18}>
                                        <Tag color={CommonUtility.statusColorMapping(cur.status)}>{cur.status}</Tag>
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
                                    <Col span={18}>{cur.gender ? 'Nam' : 'Nữ'}</Col>
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
        const arrShimmer = ['', '', ''].reduce((acc, _, index) => {
            acc.push(
                <div className='__app-user-frame-container' key={index}>
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

    function onChangeMenuSelect(key: any) {
        setDataReady(false);
        let filter = '';
        switch (key) {
            case 'allAccounts':
                filter = ``;
                break;
            case 'ownerAccounts':
                filter = `Owner`;
                break;
            case 'managerAccounts':
                filter = `Manager`;
                break;
            case 'staffAccounts':
                filter = `Staff`;
                break;
            case 'customerAccounts':
                filter = `Customer`;
                break;
        }
        setDataReady(false);
        adminService.getAccounts$(filter).subscribe({
            next: res => {
                setAccounts(res);
                setAccountsOnSearch(res);
                bindingObjectFilter(res);
                setDataReady(true);
            }
        });
    }

    function openDetailUser(userId: string) {
        return navigate(`/administration/account/${userId}`);
    }

    function openCreateAccount() {
        setShowDialogCreate(true);
    }

    function onCreateAccount(data: any) {
        setShowDialogCreate(false);
    }

    function closeDialogCreateAccount() {
        setShowDialogCreate(false);
    }

    return (
        <>
            <Layout className='__admin-layout ant-layout-has-sider'>
                <Layout.Sider className='__app-layout-slider' trigger={null}>
                    <Menu className='__app-slider-menu' mode='inline' items={items} defaultSelectedKeys={['allAccounts']} onSelect={(args) => {
                        onChangeMenuSelect(args.key);
                        setCurrentMenu(args.key);
                    }}></Menu>
                </Layout.Sider>
                <Layout>
                    <Layout.Header className='__app-layout-header'>

                        {/* <Badge count={0}>
                            <Avatar shape="square" size="large" icon={<BellOutlined />} />
                        </Badge> */}

                        <div className='__app-user-info'>
                            {/* <span className='__app-user-display-name'>{props.currentUser?.fullName ?? ''}</span> */}
                            <Dropdown
                                trigger={['click']}
                                menu={{ items: userMenuItems }}
                                placement='bottomRight'>
                                {
                                    props.currentUser?.avatar ?
                                        <Avatar className='__app-user-avatar' src={props.currentUser?.avatar} size={'large'} /> :
                                        <Avatar className='__app-user-avatar' size={'large'}>PH</Avatar>
                                }
                            </Dropdown>
                        </div>
                    </Layout.Header>
                    <Layout.Content className='__app-layout-content'>
                        <div className='__app-toolbar-container'>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<PlusOutlined />} type='text' onClick={openCreateAccount}>Thêm tài khoản</Button>
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(accounts, tableUserColumns);
                                }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    onChangeMenuSelect(currentMenu);
                                }}>Tải lại</Button>
                            </div>
                            <div className='__app-toolbar-right-buttons'>
                                <Search
                                    style={{ marginLeft: 10 }}
                                    className='__app-search-box'
                                    placeholder="Tìm kiếm"
                                    onSearch={(value) => {
                                        const accountSearched = accounts.reduce((acc, cur) => {
                                            if (cur.fullName.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                                                acc.push(cur);
                                            } else if (cur.phone.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                                                acc.push(cur);
                                            } else if (cur.email.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                                                acc.push(cur);
                                            }
                                            return acc;
                                        }, []);
                                        setAccountsOnSearch(accountSearched);
                                    }}
                                />
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
                                        loading={!isDataReady}
                                        tableLayout='auto'
                                        columns={tableUserColumns}
                                        className='__app-user-info-table'
                                        dataSource={accountsOnSearch}
                                        pagination={{
                                            pageSize: 7,
                                            total: accountsOnSearch.length,
                                            showTotal: (total, range) => {
                                                return <span>{total} items</span>
                                            }
                                        }}
                                    ></Table>)
                            }
                        </div>
                        {
                            isShowDialogCreate ?
                                <CreateAccountDialog
                                    onCancel={closeDialogCreateAccount}
                                    onSave={onCreateAccount}
                                    key='createAccountDialog'
                                /> :
                                <></>
                        }

                    </Layout.Content>
                </Layout>
            </Layout>
        </>
    )
}