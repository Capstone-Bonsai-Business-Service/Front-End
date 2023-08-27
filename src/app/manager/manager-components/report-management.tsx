import { ReloadOutlined } from "@ant-design/icons";
import { Button, Divider, Table, Tabs, Modal, Row, Col } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { ManagerServices } from "../manager.service";
import { take } from "rxjs";
import { CommonUtility } from "../../utils/utilities";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { PatternFormat } from "react-number-format";


interface IReportManagementProps {
}

interface IReportTabProps {
    status: string;
}

export const ReportManagementComponent: React.FC<IReportManagementProps> = (props) => {
    const [tabKey, setTabKey] = useState<string>('new')
    return (
        <div style={{ height: 'calc(100vh - 100px)', width: 'calc(100% - 80px)', marginLeft: 20 }}>
            <Tabs
                className="__app-tabs-custom"
                style={{ marginBottom: 0 }}
                defaultActiveKey='new'
                type='card'
                onChange={(key) => {
                    setTabKey(key);
                }}
                items={[
                    {
                        label: 'Báo cáo mới',
                        key: 'new',
                        children: tabKey === 'new' ? <ReportTabComponent status='NEW' /> : <></>,
                    },
                    {
                        label: 'Báo cáo đã duyệt',
                        key: 'approved',
                        children: tabKey === 'approved' ? <ReportTabComponent status='APPROVED' /> : <></>,
                    },
                    {
                        label: 'Báo cáo không hợp lệ',
                        key: 'rejected',
                        children: tabKey === 'rejected' ? <ReportTabComponent status='DENIED' /> : <></>,
                    },
                ]}
            />
        </div>

    )

}

export const ReportTabComponent: React.FC<IReportTabProps> = (props) => {

    const managerServices = new ManagerServices();

    const [reports, setReport] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [reportOnSearch, setReportOnSearch] = useState<any[]>([]);
    const [reportDetail, setReportDetail] = useState<{
        isShow: boolean,
        report: any
    }>({
        isShow: false,
        report: null
    });
    const [popUpConfirm, setPopUpConfirm] = useState<{
        isShow: boolean,
        plantCateogryID: string,
        message: string,
        action: string
    }>({
        isShow: false,
        plantCateogryID: '',
        message: '',
        action: ''
    });

    useEffect(() => {
        if (!isFirstInit) {
            loadData()
        }
    });

    function loadData() {
        setDataReady(false);
        const request$ = managerServices.getReports$();
        request$.pipe(take(1)).pipe(take(1)).subscribe({
            next: data => {
                const result = data.filter(item => {
                    return item.status === props.status
                })
                setReport(result);
                setReportOnSearch(result);
                setDataReady(true);
                if (!isFirstInit) {
                    setFirstInit(true);
                }
            }
        })
    }

    const tableUserColumns: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            showSorterTooltip: false,
            ellipsis: true,
            width: 100,
        },
        {
            title: `Tên khách hàng`,
            dataIndex: 'fullName',
            key: 'fullName',
            showSorterTooltip: false,
            ellipsis: true,
            width: 240,
        },
        {
            title: 'Nội dung',
            dataIndex: 'description',
            key: 'description',
            showSorterTooltip: false,
            ellipsis: true,
        },
        {
            title: 'Ngày Report',
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
                        setReportDetail({
                            isShow: true,
                            report: record
                        });
                    }}>Chi tiết</Button>
                </div>
            },
        }
    ]

    return (
        <>
            <div className='__app-toolbar-container' style={{ width: '100%', padding: '8px 24px' }}>
                <div className='__app-toolbar-left-buttons'>
                    {/* <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='text' onClick={() => {
                        CommonUtility.exportExcel(reports, tableUserColumns);
                    }}>Xuất Tệp Excel</Button> */}
                    <Button shape='default' icon={<ReloadOutlined />} type='text' onClick={() => {
                        loadData()
                    }}>Tải Lại</Button>
                </div>
                <div className='__app-toolbar-right-buttons'>
                    <Search
                        style={{ marginLeft: 10 }}
                        className='__app-search-box'
                        placeholder="ID, Tên KH, Nội dung"
                        onSearch={(value) => {
                            const columnsSearch = ['id', 'description', 'fullName']
                            const data = CommonUtility.onTableSearch(value, reports, columnsSearch);
                            setReportOnSearch(data);
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
                    dataSource={reportOnSearch}
                    pagination={{
                        pageSize: 7,
                        total: reportOnSearch.length,
                        showTotal: (total, range) => {
                            return <span>{range[0]} - {range[1]} / <strong>{total}</strong></span>
                        }
                    }}
                ></Table>
            </div>
            {
                reportDetail.isShow ?
                    <Modal
                        width={600}
                        open={true}
                        closable={false}
                        title={(
                            <span className='__app-dialog-title'>
                                Chi tiết báo cáo
                            </span>
                        )}
                        footer={[
                            <Button key='cancel' onClick={() => {
                                setReportDetail({
                                    isShow: false,
                                    report: null,
                                })
                            }}>Đóng</Button>,
                            reportDetail.report.status === 'NEW' ?
                            <Button key='reject' style={{ background: '#5D050b' }} type='primary' onClick={() => {
                                managerServices.changeStatusReport$(reportDetail.report.id, 'DENIED', 'Không hợp lệ').pipe(take(1)).subscribe({
                                    next: (res) => {
                                        if (res) {
                                            setReportDetail({
                                                isShow: false,
                                                report: null
                                            });
                                            loadData();
                                            toast.success(`Cập nhật thành công.`)
                                        } else {
                                            setReportDetail({
                                                isShow: false,
                                                report: null
                                            });
                                            toast.error(`Cập nhật thất bại.`)
                                        }
                                    }
                                })
                            }}>Từ chối</Button> : null,
                            reportDetail.report.status === 'NEW' ? <Button key='save' style={{ background: '#0D6368' }} type='primary' onClick={() => {
                                managerServices.changeStatusReport$(reportDetail.report.id, 'APPROVED', '').pipe(take(1)).subscribe({
                                    next: (res) => {
                                        if (res) {
                                            setReportDetail({
                                                isShow: false,
                                                report: null
                                            });
                                            loadData();
                                            toast.success(`Cập nhật thành công.`)
                                        } else {
                                            setReportDetail({
                                                isShow: false,
                                                report: null
                                            });
                                            toast.error(`Cập nhật thất bại.`)
                                        }
                                    }
                                })
                            }}>Duyệt</Button> : null
                        ]}
                        centered
                    >
                        <div className='__app-dialog-create-object' style={{
                            padding: '0 24px'
                        }}>
                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Mã hợp đồng:</Col><Col>{reportDetail.report?.contractID}</Col>
                            </Row>

                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Khách hàng:</Col>
                                <Col>
                                    <Row style={{ fontWeight: 600 }}>{reportDetail.report?.fullName}</Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Số điện thoại:</Col>
                                <Col><PatternFormat
                                    displayType='text'
                                    format='#### ### ###'
                                    value={reportDetail.report?.phone}
                                />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Dịch vụ:</Col>
                                <Col>
                                    <span>{reportDetail.report?.serviceName}</span>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={{ fontWeight: 500 }}>Nội dung báo cáo:</Col>
                                <Col>
                                    <span style={{
                                        color: 'red'
                                    }}>{reportDetail.report?.description}</span>
                                </Col>
                            </Row>
                            
                        </div>
                    </Modal> : <></>
            }
        </>
    )
}