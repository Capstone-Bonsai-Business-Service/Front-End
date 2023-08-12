import { LeftOutlined, ReloadOutlined, UserOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Row, Table, Tabs, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { ManagerServices } from "../manager.service";
import { take } from "rxjs";
import { CommonUtility } from "../../utils/utilities";
import { DateTime } from "luxon";
import { StoreStatus, StoreStatusMapping } from "../../common/object-interfaces/store.interface";
import { LuPalmtree } from "react-icons/lu";


interface IFeedbackManagementProps {
}

interface IFeedbackTabProps {
    feedbackType: 'order' | 'contract';
}

export const FeedbackManagementComponent: React.FC<IFeedbackManagementProps> = (props) => {
    const [tabKey, setTabKey] = useState<string>('order')
    return (
        <div style={{ height: 'calc(100vh - 100px)', width: 'calc(100% - 80px)', marginLeft: 20 }}>
            <Tabs
                className="__app-tabs-custom"
                style={{ marginBottom: 0 }}
                defaultActiveKey='order'
                type='card'
                onChange={(key) => {
                    setTabKey(key);
                }}
                items={[
                    {
                        label: 'Cây cảnh',
                        key: 'order',
                        children: tabKey === 'order' ? <FeedbackTabComponent feedbackType='order' /> : <></>,
                    },
                    {
                        label: 'Hợp đồng',
                        key: 'contract',
                        children: tabKey === 'contract' ? <FeedbackTabComponent feedbackType='contract' /> : <></>,
                    },
                ]}
            />
        </div>
    )

}

export const FeedbackTabComponent: React.FC<IFeedbackTabProps> = (props) => {

    const managerServices = new ManagerServices();

    const [feedbacks, setFeedback] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [feedbackOnSearch, setFeedbackOnSearch] = useState<any[]>([]);
    const [feedbackDetail, setFeedbackDetail] = useState<any>(null);
    const [formMode, setFormMode] = useState<'display' | 'edit'>('display');

    useEffect(() => {
        if (!isFirstInit) {
            loadData()
        }
    });

    function loadData() {
        setDataReady(false);
        const request$ = props.feedbackType === 'order' ? managerServices.getStoreOrderFeedbacks$() : managerServices.getStoreContractFeedbacks$();
        request$.pipe(take(1)).pipe(
            take(1)
        ).subscribe({
            next: data => {
                let result = onUpdateDataSource(data);
                setFeedback(result);
                setFeedbackOnSearch(result);
                setDataReady(true);
                if (!isFirstInit) {
                    setFirstInit(true);
                }
            }
        })
    }

    const onUpdateDataSource = (data: any[]) => {
        for (let item of data) {
            if (props.feedbackType === "contract") {
                item['id'] = item.contractFeedbackID;
            } else {
                item['id'] = item.orderFeedbackID;
            }
        }
        return data;
    }

    const tableUserColumns: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'orderFeedbackID',
            key: 'orderFeedbackID',
            showSorterTooltip: false,
            ellipsis: true,
            width: 100,
        },
        {
            title: `Tên khách hàng`,
            dataIndex: 'customer',
            key: 'customer',
            showSorterTooltip: false,
            ellipsis: true,
            width: 240,
            render: (_, record) => {
                return <div>
                    <Avatar src={record.showCustomerModel.avatar} icon={<UserOutlined />} />
                    <span className='__app-column-full-name'>{record.showCustomerModel.fullName}</span>
                </div>
            }
        },
        {
            title: 'Nội dung',
            dataIndex: 'description',
            key: 'description',
            showSorterTooltip: false,
            ellipsis: true,
        },
        {
            title: 'Ngày Feedback',
            dataIndex: 'createdDate',
            key: 'createdDate',
            showSorterTooltip: false,
            ellipsis: true,
            width: 150,
            render: (value) => {
                return <span>{DateTime.fromISO(value).setLocale('vi').toRelativeCalendar()}</span>
            }
        },
        {
            title: 'Sản phẩm feedback',
            dataIndex: 'product',
            key: 'product',
            showSorterTooltip: false,
            ellipsis: true,
            width: 100,
            render: (_, record) => {
                return <span>{record.showPlantModel.plantName}</span>
            }
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
                        setFeedbackDetail(record);
                        setFormMode('edit');
                    }}>Chi tiết</Button>
                </div>
            },
        }
    ]

    return (
        <>
            {
                formMode === 'display' ?
                    <>
                        <div className='__app-toolbar-container' style={{ width: '100%', padding: '8px 24px' }}>
                            <div className='__app-toolbar-left-buttons'>
                                <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                                    CommonUtility.exportExcel(feedbacks, tableUserColumns);
                                }}>Xuất Tệp Excel</Button>
                                <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                                    loadData()
                                }}>Tải Lại</Button>
                            </div>
                            <div className='__app-toolbar-right-buttons'>
                                <Search
                                    style={{ marginLeft: 10 }}
                                    className='__app-search-box'
                                    placeholder="ID, Nội dung"
                                    onSearch={(value) => {
                                        const columnsSearch = ['id', 'description']
                                        const data = CommonUtility.onTableSearch(value, feedbacks, columnsSearch);
                                        setFeedbackOnSearch(data);
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ width: '94%' }}>
                            <Divider className='__app-divider-no-margin' style={{ width: '94%' }}></Divider>
                        </div>
                        <div className='__app-layout-container' style={{ width: '100%', height: 'calc(100vh - 220px)', padding: '8px 24px' }}>
                            <Table
                                loading={!isDataReady}
                                tableLayout='auto'
                                columns={tableUserColumns}
                                className='__app-user-info-table'
                                size='middle'
                                dataSource={feedbackOnSearch}
                                pagination={{
                                    pageSize: 7,
                                    total: feedbackOnSearch.length,
                                    showTotal: (total, range) => {
                                        return <span>{range[0]} - {range[1]} / <strong>{total} Items</strong></span>
                                    }
                                }}
                            ></Table>
                        </div>
                    </>
                    : <></>
            }
            {
                formMode === 'edit' ?
                    <div className="__app-layout-container form-edit" style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
                        <div className="__app-top-action">
                            <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                                setFormMode('display');
                                setFeedbackDetail(null);
                                // setImageScanUrls([]);
                            }} />
                            <div className="__app-title-form">CHI TIẾT FEEDBACK</div>
                        </div>
                        <div className="__app-content-container">
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                <Col span={18} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 4, backgroundColor: '#f0f0f0' }}>
                                    <Row>
                                        <Col span={12}>
                                            <Row>
                                                <Col span={8} style={{ fontWeight: 500 }}>
                                                    Mã feedback:
                                                </Col>
                                                <Col span={16} style={{ fontWeight: 500 }}>{feedbackDetail?.id}</Col>
                                            </Row>
                                        </Col>
                                        <Col span={12}>
                                            <Row>
                                                <Col span={1}></Col>
                                                <Col span={7} style={{ fontWeight: 500 }}>Trạng thái:</Col>
                                                <Col span={16}>
                                                    <Tag color={CommonUtility.statusColorMapping(feedbackDetail?.status)} >
                                                        {StoreStatusMapping[feedbackDetail?.status as StoreStatus]}
                                                    </Tag>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12}>
                                            <Row>
                                                <Col span={8} style={{ fontWeight: 500 }}>
                                                    Khách hàng:
                                                </Col>
                                                <Col span={16} >
                                                    <div style={{
                                                        display: 'flex', gap: 4, alignItems: 'center'
                                                    }}>
                                                        <Avatar size={"small"} src={feedbackDetail.showCustomerModel.avatar} icon={<UserOutlined />} />
                                                        <span className='__app-column-full-name'>{feedbackDetail.showCustomerModel.fullName}</span>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col span={12}>
                                            <Row>
                                                <Col span={1}></Col>
                                                <Col span={7} style={{ fontWeight: 500 }}>Số điện thoại:</Col>
                                                <Col span={16}>
                                                    {feedbackDetail?.showCustomerModel.phone}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    {
                                        props.feedbackType === 'order' ?
                                            <>
                                                <Row>
                                                    <Col span={4} style={{ fontWeight: 500 }}>Sản phẩm:</Col>
                                                    <Col span={16}>
                                                        <div style={{
                                                            display: 'flex', gap: 4, alignItems: 'center'
                                                        }}>
                                                            <Avatar shape="square" size={"small"} src={feedbackDetail.showPlantModel.image} icon={<LuPalmtree />} />
                                                            <span className='__app-column-full-name'>{feedbackDetail.showPlantModel.plantName}</span>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </>
                                            : <></>
                                    }

                                    <Row>
                                        <Col span={4} style={{ fontWeight: 500 }}>
                                            Ngày tạo:
                                        </Col>
                                        <Col span={16}>
                                            {DateTime.fromISO(feedbackDetail?.createdDate).toFormat('dd-MM-yyyy HH:mm')}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={4} style={{ fontWeight: 500 }}>
                                            Nội dung:
                                        </Col>
                                        <Col span={16}>
                                            <span>
                                                {feedbackDetail?.description}
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={4} style={{ fontWeight: 500 }}>
                                        </Col>
                                        <Col span={16}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {
                                                    bindingImgFeedback()
                                                }
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </div>
                        </div >
                    </div >
                    : <></>
            }
        </>
    )

    function bindingImgFeedback() {
        if (feedbackDetail?.imgList?.length > 0) {
            return feedbackDetail.imgList.reduce((acc: React.ReactNode[], cur: any, index: number) => {
                acc.push(
                    <img key={`image_feedback_${index}`} src={cur.url} alt='' style={{ width: 140, height: 140 }} />
                )
                return acc;
            }, [] as React.ReactNode[]);
        }
        return [];
    }
}