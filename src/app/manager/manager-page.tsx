import React, { useEffect, useState } from 'react'
import { IUser } from '../../IApp.interface';
import { Avatar, Badge, Button, Dropdown, Layout, Menu, MenuProps, Modal } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { ManagerServices } from './manager.service';
import { GiTreehouse } from 'react-icons/gi';
import { PiBellRingingLight, PiHandshake, PiUserList } from 'react-icons/pi';
import { RiFeedbackLine } from 'react-icons/ri';
import { AiOutlineAreaChart, AiOutlineFall, AiOutlineRise } from 'react-icons/ai'
import { LuClipboardSignature } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { DashBoardComponent } from '../common/components/dashboard.component';
import { IDashboard, ITableColumn, reportLabel } from '../common/interfaces';
import { NumericFormat } from 'react-number-format';
import './manager.scss';
import { ContractManagementComponent } from './manager-components/contract-management';
import { BonsaiManagementComponent } from './manager-components/bonsai-management';
import { MemberManagementComponent } from './manager-components/member-management';
import { OrderManagementComponent } from './manager-components/order-management';
import Logo from '../../assets/images/logo1.png'
import { toast } from 'react-hot-toast';
import { FeedbackManagementComponent } from './manager-components/feedback-management';
import { Observable, forkJoin, take, timer } from 'rxjs';
import { DateTime } from 'luxon';


interface IManagerPageProps {
    currentUser?: IUser;
    onLogoutCallback: () => void;
}

export const ManagerPage: React.FC<IManagerPageProps> = (props) => {
    const managerService = new ManagerServices();

    const navigate = useNavigate();

    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [currentMenuItem, setCurrentMenuItem] = useState<string>('dashboard');
    const [showModalExpiredToken, setShowModalExpiredToken] = useState<boolean>(false);
    const [datasetData, setDatasetData] = useState({
        numOfContract: [0, 0, 0, 0, 0, 0, 0],
        numOfOrder: [0, 0, 0, 0, 0, 0, 0],
        sumOfContract: [0, 0, 0, 0, 0, 0, 0],
        sumOfOrder: [0, 0, 0, 0, 0, 0, 0]
    })
    const [datasetFilter, setDatasetFilter] = useState<'weekly' | 'quarter' | 'month'>('weekly');

    useEffect(() => {
        if (!isFirstInit) {
            loadStatistic$(datasetFilter).pipe(take(1)).subscribe({
                next: (res: any) => {
                    setFirstInit(true);
                    setDataReady(true);
                    setDatasetData(res);
                    registerPingToken();
                }
            })

        }
    });

    function registerPingToken() {
        let sub = timer(0, 120000).subscribe({
            next: (time: any) => {
                if (props.currentUser) {
                    managerService.getUserInfoByToken$(props.currentUser.token).pipe(take(1)).subscribe({
                        next: (res) => {
                            if (res) {
                                return time;
                            } else {
                                sub.unsubscribe();
                                setShowModalExpiredToken(true);
                            }
                        }
                    })
                } else {
                    return time;
                }

            }
        })
    }

    function loadStatistic$(_datasetFilter: 'weekly' | 'quarter' | 'month') {
        switch (_datasetFilter) {
            case 'weekly': return getDataSetReportWeekly$();
            case 'month': return getDataSetReportMonthly$();
            case 'quarter': return getDataSetReportQuarter$();
        }
    }

    function getDataSetReportWeekly$() {
        return new Observable(obs => {
            let today = DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd');
            const request$ = [];
            for (let i = 0; i < 7; i++) {
                let date = new Date(today);
                let _to = DateTime.fromJSDate(new Date(date.setDate(date.getDate() - i))).toFormat('yyyy-MM-dd');
                let _from = DateTime.fromJSDate(new Date(date.setDate(date.getDate() - 1))).toFormat('yyyy-MM-dd');
                request$.push(managerService.getReport$(_from, _to))
            }
            forkJoin(request$.reverse()).subscribe({
                next: (values) => {
                    const datasets = values.reduce((acc, cur) => {
                        acc['numOfContract'].push(cur.storeContractModel.numOfContract ?? 0);
                        acc['numOfOrder'].push(cur.storeOrderModel.numOfOrder ?? 0);
                        acc['sumOfContract'].push(Number(cur.storeContractModel.sumOfContract ?? 0));
                        acc['sumOfOrder'].push(Number(cur.storeOrderModel.sumOfOrder ?? 0));
                        return acc;
                    }, {
                        numOfContract: [],
                        numOfOrder: [],
                        sumOfContract: [],
                        sumOfOrder: []
                    })
                    obs.next(datasets);
                    obs.complete();
                }
            })
        })
    }

    function getDataSetReportQuarter$() {
        return new Observable(obs => {
            const thisYear = DateTime.fromJSDate(new Date()).toFormat('yyyy');
            const currentMonth = new Date().getMonth() + 1;
            const currentQuarter = Math.ceil(currentMonth / 3);

            const request$ = [managerService.getReport$(`${thisYear}-01-01`, `${thisYear}-03-31`)];

            if (currentQuarter < 3) {
                request$.push(managerService.getReport$(`${thisYear}-04-01`, `${thisYear}-06-30`));
            }
            if (currentQuarter < 4) {
                request$.push(managerService.getReport$(`${thisYear}-07-01`, `${thisYear}-09-30`));
            }
            if (currentQuarter === 4) {
                request$.push(managerService.getReport$(`${thisYear}-10-01`, `${thisYear}-12-31`));
            }
            forkJoin([...request$]).subscribe({
                next: (values) => {
                    const datasets = values.reduce((acc, cur) => {
                        acc['numOfContract'].push(cur.storeContractModel.numOfContract ?? 0);
                        acc['numOfOrder'].push(cur.storeOrderModel.numOfOrder ?? 0);
                        acc['sumOfContract'].push(Number(cur.storeContractModel.sumOfContract ?? 0));
                        acc['sumOfOrder'].push(Number(cur.storeOrderModel.sumOfOrder ?? 0));
                        return acc;
                    }, {
                        numOfContract: [],
                        numOfOrder: [],
                        sumOfContract: [],
                        sumOfOrder: []
                    })
                    obs.next(datasets);
                    obs.complete();
                }
            })
        })
    }

    function getDataSetReportMonthly$() {
        return new Observable(obs => {
            let thisYear = DateTime.fromJSDate(new Date()).toFormat('yyyy');
            const currentMonth = new Date().getMonth() + 1;
            const request$: Observable<any>[] = [];
            const range = [
                managerService.getReport$(`${thisYear}-01-01`, `${thisYear}-01-31`),
                managerService.getReport$(`${thisYear}-02-01`, `${thisYear}-02-28`),
                managerService.getReport$(`${thisYear}-03-01`, `${thisYear}-03-31`),
                managerService.getReport$(`${thisYear}-04-01`, `${thisYear}-04-30`),
                managerService.getReport$(`${thisYear}-05-01`, `${thisYear}-05-31`),
                managerService.getReport$(`${thisYear}-06-01`, `${thisYear}-06-30`),
                managerService.getReport$(`${thisYear}-07-01`, `${thisYear}-07-31`),
                managerService.getReport$(`${thisYear}-08-01`, `${thisYear}-08-31`),
                managerService.getReport$(`${thisYear}-09-01`, `${thisYear}-09-30`),
                managerService.getReport$(`${thisYear}-10-01`, `${thisYear}-10-31`),
                managerService.getReport$(`${thisYear}-11-01`, `${thisYear}-11-30`),
                managerService.getReport$(`${thisYear}-12-01`, `${thisYear}-12-31`)
            ];
            for (let i = 0; i < currentMonth; i++) {
                request$.push(range[i]);
            }
            forkJoin([...request$]).subscribe({
                next: (values) => {
                    const datasets = values.reduce((acc, cur) => {
                        acc['numOfContract'].push(cur.storeContractModel.numOfContract ?? 0);
                        acc['numOfOrder'].push(cur.storeOrderModel.numOfOrder ?? 0);
                        acc['sumOfContract'].push(Number(cur.storeContractModel.sumOfContract ?? 0));
                        acc['sumOfOrder'].push(Number(cur.storeOrderModel.sumOfOrder ?? 0));
                        return acc;
                    }, {
                        numOfContract: [],
                        numOfOrder: [],
                        sumOfContract: [],
                        sumOfOrder: []
                    })
                    obs.next(datasets);
                    obs.complete();
                }
            })
        })
    }

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
            key: 'orders',
            className: '__app-group-menu',
            icon: <PiHandshake color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Đơn đặt hàng
                </div>
            )
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
        },
        {
            key: 'members',
            className: '__app-group-menu',
            icon: <PiUserList color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Nhân Viên
                </div>
            )
        },
        {
            key: 'feedback',
            className: '__app-group-menu',
            icon: <RiFeedbackLine color='#000' />,
            label: (
                <div className='__app-group-menu-label'>
                    Phản hồi
                </div>
            )
        },
    ]

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'logout',
            label: (
                <span onClick={(e) => {
                    e.preventDefault();
                    props.onLogoutCallback();
                    return navigate('/manager-login');
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
                return <NumericFormat thousandSeparator=' ' value={data ?? 0} displayType='text' suffix=" ₫" />
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
                        <NumericFormat thousandSeparator=' ' value={data ? data * 100 : 0} displayType='text' suffix="%" style={{
                            color: data > 0 ? '#A0D676' : '#FD6B6B'
                        }} />
                        {data > 0 ? <AiOutlineRise color='#A0D676' /> : <AiOutlineFall color='#FD6B6B' />}
                    </div>
                )
            }
        },
    ]

    const barChart: IDashboard['barChart'] = {
        title: 'THỐNG KÊ',
        filter(value) {
            setDatasetFilter(value);
            loadStatistic$(value).pipe(take(1)).subscribe({
                next: (res: any) => {
                    setDatasetData(res);
                    setFirstInit(true);
                    setDataReady(true);
                }
            })
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
                        grace: 1
                    },
                },
            },
            data: {
                labels: reportLabel[datasetFilter],
                datasets: [
                    {
                        type: 'bar' as const,
                        label: 'Tổng thu nhập từ Hợp đồng',
                        data: datasetData.sumOfContract,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        yAxisID: 'y',
                    },
                    {
                        type: 'bar' as const,
                        label: 'Tổng thu nhập từ Đơn hàng',
                        data: datasetData.sumOfOrder,
                        backgroundColor: 'rgba(200, 99, 52, 0.5)',
                        yAxisID: 'y',
                    },
                    {
                        type: 'line' as const,
                        label: 'Số lượng Hợp đồng',
                        data: datasetData.numOfContract,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgb(54, 162, 235, 0.5)',
                        yAxisID: 'y1',
                    },
                    {
                        type: 'line' as const,
                        label: 'Số lượng đơn hàng',
                        data: datasetData.numOfOrder,
                        backgroundColor: 'rgba(53, 162, 25, 0.5)',
                        borderColor: 'rgba(53, 162, 25, 0.5)',
                        yAxisID: 'y1',
                    }
                ],
            },
            type: 'bar'
        },
        filterOptions: [{ label: '7 ngày trước', value: 'weekly' }, { label: 'Mỗi Quý', value: 'quarter' }, { label: 'Mỗi Tháng', value: 'month' }],
        filterSelected: 'weekly'
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
            <Layout className='__manager-layout ant-layout-has-sider'>
                <Layout.Sider className='__app-layout-slider' trigger={null}>
                    <Menu className='__app-slider-menu' mode='inline' items={items} defaultSelectedKeys={[currentMenuItem]} onSelect={(args) => {
                        onChangeMenuSelect(args.key);
                    }}></Menu>
                </Layout.Sider>
                <Layout>
                    <Layout.Header className='__app-layout-header'
                        style={{
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
                                            <Avatar className='__app-user-avatar' size={'large'} icon={<UserOutlined />}></Avatar>
                                    }
                                </Dropdown>
                            </div>
                        </div>

                    </Layout.Header>
                    <Layout.Content className='__app-layout-content'>
                        {
                            currentMenuItem === 'dashboard' ? <DashBoardComponent
                                key='dashboard-manager'
                                barChart={barChart}
                                tableReport={tableReport}
                            /> : <></>
                        }
                        {
                            currentMenuItem === 'contracts' ? <ContractManagementComponent
                            /> : <></>
                        }
                        {
                            currentMenuItem === 'bonsais' ? <BonsaiManagementComponent
                            /> : <></>
                        }
                        {/* {
                            currentMenuItem === 'stores' ? <StoreManagementComponent
                            /> : <></>
                        } */}
                        {
                            currentMenuItem === 'members' ? <MemberManagementComponent roleName='Nhân Viên' roleID='R004' />
                                : <></>
                        }
                        {
                            currentMenuItem === 'orders' ? <OrderManagementComponent roleID='R004' />
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