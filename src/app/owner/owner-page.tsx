import React, { useEffect, useState } from 'react'
import { IUser } from '../../IApp.interface';
import { Avatar, Badge, Button, Dropdown, Layout, Menu, MenuProps } from 'antd';
import { BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { OwnerServices } from './owner.service';
import { GiTreehouse } from 'react-icons/gi';
import { PiBellRingingLight, PiHandshake, PiUserList } from 'react-icons/pi';
import { AiOutlineAreaChart, AiOutlineFall, AiOutlineRise } from 'react-icons/ai'
import { LiaStoreAltSolid } from 'react-icons/lia';
import { LuClipboardSignature } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { DashBoardComponent } from '../common/components/dashboard.component';
import { IDashboard, ITableColumn } from '../common/interfaces';
import { NumericFormat } from 'react-number-format';
import { BonsaiManagementComponent } from './owner-components/bonsai-management';
import { ServiceManagementComponent } from './owner-components/service-management';
import { StoreManagementComponent } from './owner-components/store-management';
import { MemberManagementComponent } from './owner-components/member-management';
import { ContractManagementComponent } from './owner-components/contract-management';


interface IOwnerPageProps {
    currentUser?: IUser;
    onLogoutCallback: () => void;
}

export const OwnerPage: React.FC<IOwnerPageProps> = (props) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ownerService = new OwnerServices();

    const navigate = useNavigate();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [currentMenuItem, setCurrentMenuItem] = useState<string>('dashboard');

    useEffect(() => {
        if (!isFirstInit) {
            setFirstInit(true);
            setDataReady(true);
        }
    }, [ownerService, isFirstInit]);

    const items: MenuProps['items'] = [
        {
            key: 'dashboard',
            className: '__app-group-menu',
            icon: <AiOutlineAreaChart color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Bảng thống kê
                </div>
            )
        },
        {
            key: 'bonsais',
            className: '__app-group-menu',
            icon: <GiTreehouse color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Cây cảnh
                </div>
            )
        },
        {
            key: 'services',
            className: '__app-group-menu',
            icon: <PiHandshake color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Dịch vụ
                </div>
            )
        },
        {
            key: 'stores',
            className: '__app-group-menu',
            icon: <LiaStoreAltSolid color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Chi nhánh
                </div>
            )
        },
        {
            key: 'members',
            className: '__app-group-menu',
            icon: <PiUserList color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Thành viên
                </div>
            ),
            children: [
                {
                    key: 'manager',
                    className: '__app-children-menu-divider',
                    label: 'Quản lý',
                },
                {
                    key: 'staff',
                    className: '__app-children-menu-divider',
                    label: 'Nhân viên',
                },
            ]
        },
        {
            key: 'contracts',
            className: '__app-group-menu',
            icon: <LuClipboardSignature color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Hợp đồng
                </div>
            )
        }
    ]

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'logout',
            label: (
                <span onClick={(e) => {
                    e.preventDefault();
                    props.onLogoutCallback();
                    return navigate('/owner-login');
                }}>
                    Đăng xuất
                </span>
            ),
            icon: <LogoutOutlined />
        }
    ]

    const tableColumns: ITableColumn[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100
        },
        {
            title: 'Chi Nhánh',
            dataIndex: 'store',
            key: 'store',
        },
        {
            title: 'Doanh thu (vnđ)',
            dataIndex: 'revenues',
            key: 'revenues',
            width: 200,
            render: (data: any) => {
                return <NumericFormat thousandSeparator=',' value={data ?? 0} displayType='text' suffix=" ₫" />
            }
        },
        {
            title: 'Tăng trưởng',
            dataIndex: 'profit',
            key: 'profit',
            width: 200,
            render: (data: any) => {
                return (
                    <div style={{ display: 'flex', gap: 5 }}>
                        <NumericFormat thousandSeparator=',' value={data ? data * 100 : 0} displayType='text' suffix="%" style={{
                            color: data > 0 ? '#A0D676' : '#FD6B6B'
                        }} />
                        {data > 0 ? <AiOutlineRise color='#A0D676' /> : <AiOutlineFall color='#FD6B6B' />}
                    </div>
                )
            }
        },
    ]

    const barChart: IDashboard['barChart'] = {
        title: 'Tổng doanh thu',
        filter(value) {

        },
        dataSource: {
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom' as const,
                    },
                    title: {
                        display: false,
                        text: '',
                    },
                },
                scales: {
                    y: {
                        type: 'linear' as const,
                        display: true,
                        position: 'left' as const,
                    },
                    y1: {
                        type: 'linear' as const,
                        display: true,
                        position: 'right' as const,
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                },
            },
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        type: 'bar' as const,
                        label: 'Dataset 1',
                        data: [
                            10000, 15000, 8000, 20000, 18000, 17000, 27000
                        ],
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        yAxisID: 'y',
                    },
                    {
                        type: 'line' as const,
                        label: 'Dataset 2',
                        data: [
                            200, 500, 380, 100, 210, 100, 150
                        ],
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        yAxisID: 'y1',
                    }
                ],
            },
            type: 'bar'
        },
        filterOptions: [{ label: '2021', value: 2021 }, { label: '2022', value: 20222 }, { label: '2023', value: 2023 }],
        filterSelected: 2023
    }

    const tableReport: IDashboard['tableReport'] = {
        title: 'Doanh thu các chi nhánh',
        columns: tableColumns,
        dataSource: [
            {
                id: 'R001',
                store: 'Chi Nhánh 1',
                revenues: 60500000,
                profit: 0.85
            },
            {
                id: 'R002',
                store: 'Chi Nhánh 2',
                revenues: 73700000,
                profit: 1.35
            },
            {
                id: 'R003',
                store: 'Chi Nhánh 3',
                revenues: 40500000,
                profit: 0.35
            },
            {
                id: 'R004',
                store: 'Chi Nhánh 4',
                revenues: 30500000,
                profit: 0.25
            }
        ],
        filter(value) {

        },
        filterOptions: [{ label: '2021', value: 2021 }, { label: '2022', value: 20222 }, { label: '2023', value: 2023 }],
        filterSelected: 2023
    }

    function onChangeMenuSelect(key: any) {
        setCurrentMenuItem(key);
    }

    function bindingNotifications() {
        const noti = (['1', '2', '3'] as any).reduce((acc: any[], cur: any) => {
            acc.push({
                key: cur,
                label: `Notification ${cur}`
            });
            return acc;
        }, []);
        return noti;
    }

    return (
        <>
            <Layout className='__owner-layout ant-layout-has-sider'>
                <Layout.Sider className='__app-layout-slider' trigger={null}>
                    <Menu className='__app-slider-menu' mode='inline' items={items} defaultSelectedKeys={[currentMenuItem]} onSelect={(args) => {
                        onChangeMenuSelect(args.key);
                    }}></Menu>
                </Layout.Sider>
                <Layout>
                    <Layout.Header className='__app-layout-header'>
                        <div className='__app-header-right'>
                            <div className='__app-notification-info'>
                                <Dropdown
                                    trigger={['click']}
                                    menu={{ items: bindingNotifications() }}
                                    placement='bottom'>
                                    <Badge size='default' dot={true}>
                                        <Avatar shape='circle' size='large' icon={<PiBellRingingLight />} />
                                    </Badge>
                                </Dropdown>
                            </div>

                            <div className='__app-user-info'>
                                <Dropdown
                                    trigger={['click']}
                                    menu={{ items: userMenuItems }}
                                    placement='bottomRight'>
                                    {
                                        props.currentUser?.avatar ?
                                            <Avatar className='__app-user-avatar' src={props.currentUser?.avatar} size={'large'} icon={<UserOutlined />}/> :
                                            <Avatar className='__app-user-avatar' size={'large'}>PH</Avatar>
                                    }
                                </Dropdown>
                            </div>
                        </div>

                    </Layout.Header>
                    <Layout.Content className='__app-layout-content'>
                        {
                            currentMenuItem === 'dashboard' ? <DashBoardComponent
                                key='dashboard-owner'
                                barChart={barChart}
                                tableReport={tableReport}
                            /> : <></>
                        }
                        {
                            currentMenuItem === 'bonsais' ? <BonsaiManagementComponent
                            /> : <></>
                        }
                        {
                            currentMenuItem === 'services' ? <ServiceManagementComponent
                            /> : <></>
                        }
                        {
                            currentMenuItem === 'stores' ? <StoreManagementComponent
                            /> : <></>
                        }
                        {
                            currentMenuItem === 'staff' ? <MemberManagementComponent roleName='Nhân Viên' roleID='R004' />
                                : <></>
                        }
                        {
                            currentMenuItem === 'manager' ? <MemberManagementComponent roleName='Quản Lý' roleID='R003' />
                                : <></>
                        }
                        {
                            currentMenuItem === 'contracts' ? <ContractManagementComponent />
                                : <></>
                        }
                    </Layout.Content>
                </Layout>
            </Layout>
        </>
    )
}