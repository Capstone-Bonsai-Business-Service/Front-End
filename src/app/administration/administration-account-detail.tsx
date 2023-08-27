import { useEffect, useState } from "react"
import { adminServices } from "./administration.service";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Button, Col, Divider, Dropdown, Input, Layout, Menu, MenuProps, Row, Select, Radio } from "antd";
import { LeftOutlined, LoadingOutlined, LogoutOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { IUser } from "../../IApp.interface";
import toast from "react-hot-toast";
import { CommonUtility } from "../utils/utilities";
import { PatternFormat } from "react-number-format";
import { IStore } from "../common/object-interfaces/store.interface";
import { take } from "rxjs";
import { cloneDeep } from "lodash";

interface IAccountDetailPageProps {
    currentUser?: IUser;
}

export const AccountDetailPage: React.FC<IAccountDetailPageProps> = (props) => {

    const adminService = new adminServices();
    const params = useParams();
    const navigate = useNavigate();

    const [account, setAccount] = useState<any>(null);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [newStores, setNewStores] = useState<IStore[]>([]);
    const [storeForMember, setStoreForMember] = useState<string>('');

    useEffect(() => {
        if (!isFirstInit) {
            adminService.getAccount$(params.id ?? '').subscribe({
                next: (res) => {
                    if (res.error) {
                        toast.error(res.error);
                    } else {
                        setAccount(res);
                        setFirstInit(true);
                        setDataReady(true);
                    }
                }
            });
            adminService.getStoreWithoutManager$().pipe(take(1)).subscribe({
                next: (value) => {
                    setNewStores(value);
                    setDataReady(true);
                }
            })
        }
    });

    function onChangeMenuSelect(key: any) {
        let filter = '';
        switch (key) {
            case 'allAccounts':
                filter = ``;
                break;
            case 'ownerAccounts':
                filter = `role='Owner'`;
                break;
            case 'managerAccounts':
                filter = `role='Manager'`;
                break;
            case 'staffAccounts':
                filter = `role='Staff'`;
                break;
            case 'customerAccounts':
                filter = `role='Customer'`;
                break;
        }
        setDataReady(false);
        adminService.getAccounts$(filter).subscribe({
            next: res => {
                //to do
            }
        });
    }

    const userMenuItems: MenuProps['items'] = [
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

    return (
        <>
            <Layout className='__admin-layout ant-layout-has-sider'>
                <Layout.Sider className='__app-layout-slider' trigger={null}>
                    <Menu className='__app-slider-menu' mode='inline' items={items} defaultSelectedKeys={['allAccounts']} onSelect={(args) => {
                        onChangeMenuSelect(args.key);
                    }}></Menu>
                </Layout.Sider>
                <Layout>
                    <Layout.Header className='__app-layout-header'>

                        <div className='__app-user-info'>
                            <Dropdown
                                trigger={['click']}
                                menu={{ items: userMenuItems }}
                                placement='bottomRight'>
                                <Avatar className='__app-user-avatar' src={props.currentUser?.avatar ?? null} icon={<UserOutlined />} size={'large'} />
                            </Dropdown>
                        </div>
                    </Layout.Header>
                    <Layout.Content className='__app-layout-content'>
                        <div className='__app-toolbar-container'>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' type='ghost' onClick={() => {
                                    navigate('/administration');
                                }} icon={<LeftOutlined />}></Button>
                            </div>
                            <div className='__app-toolbar-title'>
                                <strong>Thông tin cá nhân</strong>
                            </div>
                        </div>
                        <div className='__app-layout-container'>
                            <Row className='__app-account-info-row'>
                                <Col span={3} className='__app-account-field'>
                                </Col>
                                <Col span={21}>
                                    <Avatar shape="circle" size={100} src={account?.avatar} icon={<UserOutlined />} />
                                </Col>
                            </Row>
                            <Row className='__app-account-info-row'>
                                <Col span={3}>
                                </Col>
                                <Col span={3} className='__app-account-field'>
                                    <span>
                                        <strong>ID:</strong>
                                    </span>
                                </Col>
                                <Col span={15}>
                                    <span>{account?.userID ?? ''}</span>
                                </Col>
                            </Row>
                            <Row className='__app-account-info-row'>
                                <Col span={3}>
                                </Col>
                                <Col span={3} className='__app-account-field'>
                                    <span>
                                        <strong>Tên tài khoản:</strong>
                                    </span>
                                </Col>
                                <Col span={15}>
                                    <span>{account?.username ?? ''}</span>
                                </Col>
                            </Row>
                            <Row className='__app-account-info-row'>
                                <Col span={3}>
                                </Col>
                                <Col span={3} className='__app-account-field'>
                                    <span>
                                        <strong>Chức vụ:</strong>
                                    </span>
                                </Col>
                                <Col span={15}>
                                    <span>{account?.roleName ?? ''}</span>
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
                                    <span>{account?.fullName ?? ''}</span>
                                </Col>
                            </Row>
                            <Row className='__app-account-info-row'>
                                <Col span={3}>
                                </Col>
                                <Col span={3} className='__app-account-field'>
                                    <span>
                                        <strong>Email:</strong> <span className='__app-required-field'> *</span>
                                    </span>
                                </Col>
                                <Col span={15}>
                                    <span>{account?.email ?? ''}</span>
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
                                    <PatternFormat
                                        displayType='text'
                                        format='#### ### ###'
                                        value={account?.phone}
                                        placeholder="Nhập số điện thoại"
                                    />
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
                                    <Radio.Group
                                        disabled
                                        value={account?.gender}>
                                        <Radio value={true}>Nam</Radio>
                                        <Radio value={false}>Nữ</Radio>
                                    </Radio.Group>
                                </Col>
                            </Row>
                            {
                                (account?.roleID === 'R003' || account?.roleID === 'R004') ?
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
                                                account?.storeID === null ?
                                                    <Select
                                                        value={storeForMember}
                                                        style={{ width: '100%' }}
                                                        options={newStores.reduce((acc: any[], cur) => {
                                                            if (account?.roleID === 'R003') {
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
                                                            setStoreForMember(value);
                                                        }}
                                                    /> : <span>{account?.storeName}</span>
                                            }

                                        </Col>
                                    </Row> :
                                    <></>
                            }
                            {
                                (account?.roleID === 'R003' || account?.roleID === 'R004') && account?.storeID === null ?
                                    <Row style={{
                                        display: 'flex',
                                        flexDirection: 'row-reverse',
                                        width: '87%'
                                    }}>
                                        <Button type="primary"
                                            style={{ backgroundColor: '#0D6368' }}
                                            onClick={() => {
                                                adminService.addStoreEmployee$(storeForMember, Number(params?.id as string)).pipe(take(1)).subscribe({
                                                    next: (res) => {
                                                        if (res.error) {
                                                            toast.error(`Cập nhật thất bại.`);
                                                        } else {
                                                            toast.success(`Cập nhật thành công.`);
                                                            let temp = cloneDeep(account) ?? {};
                                                            temp['storeID'] = storeForMember;
                                                            const storeName = newStores.find(item => item.id === storeForMember)?.storeName ?? '--'
                                                            temp['storeName'] = storeName;
                                                            setAccount(temp);
                                                        }
                                                    }
                                                })
                                            }}
                                        >Lưu</Button>
                                    </Row> : <></>
                            }

                        </div>
                    </Layout.Content>
                </Layout>
            </Layout>
        </>
    )
}