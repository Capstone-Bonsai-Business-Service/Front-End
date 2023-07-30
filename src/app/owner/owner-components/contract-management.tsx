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
import { CommonUtility } from "../../utils/utilities";
import { ContractStatusMapping, IContract } from "../../common/object-interfaces/contract.interface";


interface IContractManagementProps {
}

export const ContractManagementComponent: React.FC<IContractManagementProps> = (props) => {

    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ownerServices = new OwnerServices();

    // const [collapsed, setCollapsed] = useState<boolean>(false);
    const [contracts, setContracts] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [contractsOnSearch, setContractOnSearch] = useState<any[]>([]);

    useEffect(() => {
        if (!isFirstInit) {
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        ownerServices.getAllContracts$().pipe(take(1)).subscribe({
            next: data => {
                const dataSource = onUpdateDataContracts(data);
                setContracts(dataSource);
                setContractOnSearch(dataSource);
                setFirstInit(true);
                setDataReady(true);
            }
        })
    }

    function onUpdateDataContracts(data: IContract[]) {
        for (let item of data) {
            item['storeName'] = item.showStoreModel?.storeName ?? '';
        }
        return data;
    }

    const tableUserColumns: ColumnsType<IContract> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            showSorterTooltip: false,
            ellipsis: true,
            width: 80,
            className: '__app-header-title'
        },
        {
            title: `Tên Hợp Đồng`,
            dataIndex: 'title',
            key: 'title',
            showSorterTooltip: false,
            ellipsis: true,
            className: '__app-header-title'
        },
        {
            title: 'Khách hàng',
            dataIndex: 'fullName',
            key: 'fullName',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
            className: '__app-header-title'
        },
        {
            title: 'Cửa hàng tiếp nhận',
            dataIndex: 'storeName',
            key: 'storeName',
            showSorterTooltip: false,
            ellipsis: true,
            width: 250,
            className: '__app-header-title',
            render: (_, record) => {
                return <span>{record.showStaffModel?.fullName ?? '--'}</span>
            }
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
                return <Tag color={CommonUtility.statusColorMapping(value)}>{ContractStatusMapping[value]}</Tag>
            },
            width: 200,
            className: '__app-header-title'
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
                        // getContractDetail(record.id);
                        // setFormMode('edit');
                    }} icon={<FormOutlined />} />
                </div>
            },
            className: '__app-header-title'
        }
    ]

    return (
        <>
            <div className='__app-toolbar-container'>
                <div className='__app-toolbar-left-buttons'>
                    <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                        CommonUtility.exportExcel(contracts, tableUserColumns);
                    }}>Xuất Tệp Excel</Button>
                    <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                        loadData();
                    }}>Tải Lại</Button>
                </div>
                <div className='__app-toolbar-right-buttons'>
                    <Search
                        style={{ marginLeft: 10 }}
                        className='__app-search-box'
                        placeholder="ID, Tên HĐ"
                        onSearch={(value) => {
                            const columnsSearch = ['id', 'title']
                            const data = CommonUtility.onTableSearch(value, contracts, columnsSearch);
                            setContractOnSearch(data);
                        }}
                    />
                </div>
            </div>
            <div style={{ width: '94%' }}>
                <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
            </div>
            <div className='__app-layout-container'>
                <Table
                    loading={!isDataReady}
                    tableLayout='auto'
                    columns={tableUserColumns}
                    className='__app-user-info-table'
                    dataSource={contractsOnSearch}
                    pagination={{
                        pageSize: 6,
                        total: contractsOnSearch.length,
                        showTotal: (total, range) => {
                            return <span>{total} items</span>
                        }
                    }}
                ></Table>
            </div>
        </>
    )
}