import { FormOutlined, PlusOutlined, ReloadOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Table, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { OwnerServices } from "../owner.service";
import { take } from "rxjs";
import { IUser } from "../../../IApp.interface";


interface IMemberManagementProps {
    roleName: 'Nhân Viên' | 'Quản Lý';
}

export const MemberManagementComponent: React.FC<IMemberManagementProps> = (props) => {

    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ownerServices = new OwnerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [members, setMember] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);

    useEffect(() => {
        if (!isFirstInit) {
            ownerServices.getMembers$({ pageNo: 1, pageSize: 1000 }).pipe(take(1)).subscribe({
                next: data => {
                    setMember(data);
                    setFirstInit(true);
                }
            })
        }
    }, [isFirstInit, members, ownerServices, props.roleName]);

    const tableUserColumns: ColumnsType<IUser> = [
        {
            title: 'ID',
            dataIndex: 'plantID',
            key: 'plantID',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
        },
        {
            title: `Tên ${props.roleName}`,
            dataIndex: 'name',
            key: 'name',
            showSorterTooltip: false,
            ellipsis: true,
            render: (value, record, index) => {
                return <div className='__app-column-name-container'>
                    <Avatar shape='square' src={record.plantIMGList[0]?.url} />
                    <span className='__app-column-name'>{value}</span>
                </div>
            },
        },
        {
            title: 'Chi Nhánh Làm Việc',
            dataIndex: 'price',
            key: 'price',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'height',
            key: 'height',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'height',
            key: 'height',
            showSorterTooltip: false,
            ellipsis: true,
            width: 100,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            showSorterTooltip: false,
            // sorter: {
            //     compare: (acc, cur) => acc.status > cur.status ? 1 : acc.status < cur.status ? -1 : 0
            // },
            ellipsis: true,
            render: (value) => {
                return <Tag color={statusColorMapping(value)}>{value}</Tag>
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
                        //openDetailUser(record.Id);
                    }} icon={<FormOutlined />} />
                </div>
            },
        }
    ]

    function statusColorMapping(status: string) {
        switch (status) {
            case 'ONSALE': return 'green';
            case 'Dừng hoạt động': return 'error';
            default: return 'default';
        }
    }

    return (
        <>
            <div className='__app-toolbar-container'>
                <div className='__app-toolbar-left-buttons'>
                    <Button shape='default' icon={<PlusOutlined />} type='text' onClick={() => { }}>Thêm {props.roleName}</Button>
                    <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => { }}>Xuất Tệp Excel</Button>
                    <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => { }}>Tải Lại</Button>
                </div>
                <div className='__app-toolbar-right-buttons'>
                    <Search
                        style={{ marginLeft: 10 }}
                        className='__app-search-box'
                        placeholder="Tìm kiếm"
                        onSearch={(value) => {
                            // const accountSearched = accounts.reduce((acc, cur) => {
                            //     if (cur.fullName.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                            //         acc.push(cur);
                            //     } else if (cur.phone.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                            //         acc.push(cur);
                            //     } else if (cur.email.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                            //         acc.push(cur);
                            //     }
                            //     return acc;
                            // }, []);
                            // setAccountsOnSearch(accountSearched);
                        }}
                    />
                </div>
            </div>
            <div style={{ width: '94%' }}>
                <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
            </div>
            <div className='__app-layout-container'>
                <Table
                    tableLayout='auto'
                    columns={tableUserColumns}
                    className='__app-user-info-table'
                    dataSource={members}
                ></Table>
            </div>
        </>
    )
}