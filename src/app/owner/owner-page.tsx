import React, { useEffect, useState } from 'react'
import { IUser } from '../../IApp.interface';
import { Avatar, Badge, Button, Dropdown, Layout, Menu, MenuProps, Modal } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { OwnerServices } from './owner.service';
import { GiTreehouse } from 'react-icons/gi';
import { PiBellRingingLight, PiHandshake, PiUserList } from 'react-icons/pi';
import { AiOutlineAreaChart } from 'react-icons/ai'
import { LiaStoreAltSolid } from 'react-icons/lia';
import { LuClipboardSignature } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { BonsaiManagementComponent } from './owner-components/bonsai-management';
import { ServiceManagementComponent } from './owner-components/service-management';
import { StoreManagementComponent } from './owner-components/store-management';
import { MemberManagementComponent } from './owner-components/member-management';
import { ContractManagementComponent } from './owner-components/contract-management';
import { OrderManagementComponent } from './owner-components/order-management';
import Logo from '../../assets/images/logo1.png'
import './owner.scss';
import '../../styles/global.style.scss';
import { take, timer } from 'rxjs';
import toast from 'react-hot-toast';
import { RiFeedbackLine } from 'react-icons/ri';
import { FeedbackManagementComponent } from './owner-components/feedback-management';
import { IncomStatisticComponent } from './owner-components/income.component';
import { StoreStatisticComponent } from './owner-components/store-revenue.component';

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
    const [currentMenuItem, setCurrentMenuItem] = useState<string>('income');
    const [showModalExpiredToken, setShowModalExpiredToken] = useState<boolean>(false);

    useEffect(() => {
        if (!isFirstInit) {
            registerPingToken();
            setFirstInit(true);
        }
    });

    function registerPingToken() {
        let sub = timer(0, 100000).subscribe({
            next: (time) => {
                if (props.currentUser) {
                    ownerService.getUserInfoByToken$(props.currentUser.token).pipe(take(1)).subscribe({
                        next: (res) => {
                            if (res.error) {
                                sub.unsubscribe();
                                setShowModalExpiredToken(true);
                            } else {
                                return time;
                            }
                        }
                    })
                } else {
                    return time;
                }

            }
        })
    }

    const ownerSession: MenuProps['items'] = [
        {
            key: 'statistic',
            className: '__app-group-menu',
            icon: <AiOutlineAreaChart color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Thống kê
                </div>
            ),
            children: [
                {
                    key: 'income',
                    icon: <AiOutlineAreaChart color='#000' />,
                    className: '__app-children-menu-divider',
                    label: 'Doanh thu',
                },
                {
                    key: 'storeRating',
                    icon: <AiOutlineAreaChart color='#000' />,
                    className: '__app-children-menu-divider',
                    label: 'Thống kê theo cửa hàng',
                },
            ]
        },
        {
            key: 'management',
            className: '__app-group-menu',
            icon: <LuClipboardSignature color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Quản lý hệ thống
                </div>
            ),
            children: [
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
                }
            ]
        },
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
                    <Menu 
                    className='__app-slider-menu' 
                    mode='inline' 
                    items={ownerSession} 
                    defaultSelectedKeys={[currentMenuItem]} 
                    defaultOpenKeys={['statistic', 'management']}
                    onSelect={(args) => {
                        onChangeMenuSelect(args.key);
                    }}></Menu>
                </Layout.Sider>
                <Layout>
                    <Layout.Header className='__app-layout-header' style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'row'

                    }}>
                        <div style={{
                            height: 64,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {/* <img src={Logo} alt='' style={{ height: 58, }} /> */}
                        </div>
                        <div className='__app-header-right'>
                            {/* <div className='__app-notification-info'>
                                <Dropdown
                                    trigger={['click']}
                                    menu={{ items: bindingNotifications() }}
                                    placement='bottom'>
                                    <Badge size='default' dot={true}>
                                        <Avatar shape='circle' size='large' icon={<PiBellRingingLight />} />
                                    </Badge>
                                </Dropdown>
                            </div> */}

                            <div className='__app-user-info'>
                                <Dropdown
                                    trigger={['click']}
                                    menu={{ items: userMenuItems }}
                                    placement='bottomRight'>
                                    {
                                        props.currentUser?.avatar ?
                                            <Avatar className='__app-user-avatar' src={props.currentUser?.avatar} size={'large'} icon={<UserOutlined />} /> :
                                            <Avatar className='__app-user-avatar' size={'large'}>PH</Avatar>
                                    }
                                </Dropdown>
                            </div>
                        </div>

                    </Layout.Header>
                    <Layout.Content className='__app-layout-content'>
                        {
                            currentMenuItem === 'income' ? <IncomStatisticComponent/> : <></>
                        }
                        {
                            currentMenuItem === 'storeRating' ? <StoreStatisticComponent/> : <></>
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
                        {
                            currentMenuItem === 'orders' ? <OrderManagementComponent />
                                : <></>
                        }
                        {
                            currentMenuItem === 'feedback' ? <FeedbackManagementComponent />
                                : <></>
                        }
                    </Layout.Content>
                </Layout>
            </Layout>
            {
                showModalExpiredToken ?
                    <Modal
                        width={500}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Thông báo
                            </span>
                        )}
                        footer={[
                            <Button type="default" onClick={() => {
                                setShowModalExpiredToken(false)
                            }}>Huỷ</Button>,
                            <Button type="primary"
                                style={{ background: '#0D6368' }}
                                onClick={() => {
                                    props.onLogoutCallback();
                                    toast.loading(`Phiên đăng nhập đã hết hạn.`);
                                    return navigate('/manager-login');
                                }}>Xác nhận</Button>
                        ]}
                        centered
                    >
                        <span>Phiên đăng nhập đã hết hạn.</span>
                    </Modal> : <></>
            }
        </>
    )
}