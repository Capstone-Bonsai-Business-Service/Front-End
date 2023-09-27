import { Button, Calendar, Col, Divider, Modal, Row, Select, Skeleton, Spin, Tag } from 'antd';
import { CommonUtility } from '../../utils/utilities';
import './common-component.scss';
import { useEffect, useState } from 'react';
import { DefaultOptionType } from 'antd/es/select';
import { Observable, forkJoin, take } from 'rxjs';
import { UserPicker } from './user-picker-component';
import { IUser } from '../../../IApp.interface';
import { cloneDeep } from 'lodash';
import toast from 'react-hot-toast';
import { ExclamationCircleOutlined, LeftOutlined, LoadingOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { DateTime } from 'luxon';
import TextArea from 'antd/es/input/TextArea';

interface IWorkingTimeProps {
    contractDetailId: string[];
    callbackFn?: () => void;
    apiServices: any;
    listUser: IUser[];
}


export const WorkingTimeCalendar: React.FC<IWorkingTimeProps> = (props) => {
    const [listWorkingTime, setListWorkingTime] = useState<any[]>([]);
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [yearSelect, setYearSelect] = useState<number>(new Date().getFullYear());
    const [monthSelect, setMonthSelect] = useState<number>((new Date().getMonth() + 1));
    const [yearOptions, setYearOptions] = useState<DefaultOptionType[]>([]);
    const [monthOptions, setMonthOptions] = useState<DefaultOptionType[]>([]);
    const [popupDate, setPopupDate] = useState<{
        isShow: boolean,
        data: any
    }>({
        isShow: false,
        data: null
    })
    const [workingDateReport, setWorkingDateReport] = useState(new Map<string, any>());
    const [hasDataChanged, setDataChanged] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!isFirstInit) {
            renderOptions();
            setFirstInit(true);
            loadData();
        }
    });

    function renderOptions() {
        const currentYear = new Date().getFullYear();
        setMonthOptions([
            {
                label: 'Tháng 1',
                value: 1,
            },
            {
                label: 'Tháng 2',
                value: 2,
            },
            {
                label: 'Tháng 3',
                value: 3,
            },
            {
                label: 'Tháng 4',
                value: 4,
            },
            {
                label: 'Tháng 5',
                value: 5,
            },
            {
                label: 'Tháng 6',
                value: 6,
            },
            {
                label: 'Tháng 7',
                value: 7,
            },
            {
                label: 'Tháng 8',
                value: 8,
            },
            {
                label: 'Tháng 9',
                value: 9,
            },
            {
                label: 'Tháng 10',
                value: 10,
            },
            {
                label: 'Tháng 11',
                value: 11,
            },
            {
                label: 'Tháng 12',
                value: 12,
            },
        ]);
        setYearOptions([
            {
                label: currentYear - 1,
                value: currentYear - 1,
            },
            {
                label: currentYear,
                value: currentYear,
            },
            {
                label: currentYear + 1,
                value: currentYear + 1,
            },
        ])
    }

    function loadData() {
        setDataReady(false);
        if (props.contractDetailId.length === 0) {
            setDataReady(true);
            return;
        } else {
            let request$ = props.contractDetailId.reduce((acc: Observable<any>[], cur: any) => {
                acc.push(props.apiServices.getWorkingTimesByService$(cur));
                return acc;
            }, []);
            forkJoin([...request$]).pipe(take(1)).subscribe({
                next: (value: any[]) => {
                    const result = value.reduce((acc: any[], cur) => {
                        acc.push(...cur);
                        return acc;
                    }, []);
                    const data = onUpdateDataSource(result);
                    setListWorkingTime(data);
                    setDataReady(true);
                }
            })
        }

    }

    function onUpdateDataSource(data: any[]) {
        for (let item of data) {
            const _workingDate = new Date(item.workingDate).getTime();
            const _toDay = new Date().setHours(0, 0, 0, 0);
            if (_toDay > _workingDate && item.status !== 'DONE') {
                item.status = 'MISSED'
            }
        }
        return data;
    }

    function getBackgroundColor(status: any) {
        if (CommonUtility.isNullOrUndefined(status)) {
            return 'transparent';
        }
        switch (status) {
            case 'DONE': return 'rgb(146, 208, 80, 0.3)';
            case 'MISSED': return 'rgb(192, 0, 0, 0.3)';
            case 'WAITING': return 'rgb(255, 230, 153, 0.3)';
            case 'WORKING': return 'rgb(255, 130, 13, 0.3)';
            case 'CUSTOMERCANCELED': return 'rgb(192, 0, 0, 0.3)';
            case 'STAFFCANCELED': return 'rgb(192, 0, 0, 0.3)';
            default: return 'rgb(255, 230, 153, 0.3)'
        }
    }

    function getDateContent(status: any) {
        if (CommonUtility.isNullOrUndefined(status)) {
            return '';
        }
        switch (status) {
            case 'DONE': return 'Đã hoàn thành';
            case 'MISSED': return 'Chưa hoàn thành';
            case 'WAITING': return 'Đợi';
            case 'WORKING': return 'Đang làm';
            case 'CUSTOMERCANCELED': return 'Nghỉ';
            case 'STAFFCANCELED': return 'Nghỉ';
            default: return 'Đang đợi';
        }
    }

    function getReport(workingDateId: string[]) {
        workingDateId.forEach(wkdId => {
            if (CommonUtility.isNullOrUndefined(workingDateReport.get(wkdId))) {
                props.apiServices.getWorkingTimesReport$(wkdId).pipe(take(1)).subscribe({
                    next: (res: any) => {
                        let temp = cloneDeep(workingDateReport);
                        if (res.error) {
                            temp.set(wkdId, 'Lỗi tìm báo cáo.');
                        } else {
                            temp.set(wkdId, res[0] ? res[0].description : 'Không tìm thấy báo cáo.');
                        }
                        setWorkingDateReport(temp);
                    }
                })
            }
        })

    }

    function formatDataExport() {
        const result = listWorkingTime.reduce((acc, cur) => {
            acc.push({
                id: cur.id,
                _workingDate: DateTime.fromJSDate(new Date(cur.workingDate)).toFormat('dd/MM/yyyy HH:mm'),
                _serviceDetail: cur.contractDetailID,
                fullName: cur.fullName,
                _status: getDateContent(cur.status),
                _checkIn: cur.startWorking ? DateTime.fromJSDate(new Date(cur.startWorking)).toFormat('dd/MM/yyyy HH:mm') : '',
                _checkOut: cur.endWorking ? DateTime.fromJSDate(new Date(cur.endWorking)).toFormat('dd/MM/yyyy HH:mm') : '',
                _noteWorkingDate: cur.noteWorkingDate ?? ''
            })
            return acc;
        }, []);
        return result;
    }

    return <div className='__app-working-time-container'>
        <Calendar
            className='__app-calendar-container'
            mode='month'
            fullscreen={true}
            headerRender={(propsHeader) => {
                return <div className='__app-calendar-header'>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 24
                    }}>
                        <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                            if (props.callbackFn) {
                                props.callbackFn();
                            }
                        }} />
                        <div>
                            <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='default' onClick={() => {
                                const columns = [
                                    {
                                        key: 'id',
                                        title: 'Mã'
                                    },
                                    {
                                        key: '_workingDate',
                                        title: 'Ngày làm việc'
                                    },
                                    {
                                        key: '_serviceDetail',
                                        title: 'Dịch vụ số'
                                    },
                                    {
                                        key: 'fullName',
                                        title: 'Nhân viên'
                                    },
                                    {
                                        key: '_status',
                                        title: 'Trạng thái'
                                    },
                                    {
                                        key: '_checkIn',
                                        title: 'Giờ làm'
                                    },
                                    {
                                        key: '_checkOut',
                                        title: 'Giờ về'
                                    },
                                    {
                                        key: '_noteWorkingDate',
                                        title: 'Ghi chú'
                                    },
                                ]
                                let dataFormatted = formatDataExport();
                                CommonUtility.exportExcelV2(dataFormatted, columns, 'Lịch làm việc');
                            }}>Xuất Tệp Excel</Button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Select
                            style={{ width: 100 }}
                            value={yearSelect}
                            options={yearOptions}
                            onChange={(value) => {
                                setYearSelect(value);
                                let temp = propsHeader.value.clone().year(value);
                                propsHeader.onChange(temp);
                            }}
                        />
                        <Select
                            style={{ width: 150 }}
                            value={monthSelect}
                            options={monthOptions}
                            onChange={(value) => {
                                setMonthSelect(value);
                                let temp = propsHeader.value.clone().month(value - 1);
                                propsHeader.onChange(temp);
                            }}
                        />
                    </div>

                </div>
            }}
            fullCellRender={(date) => {
                if (isDataReady) {
                    const items = listWorkingTime.filter(itm => { return date.isSame(itm.workingDate, 'date') }).reduce((acc, cur) => {
                        acc.push({ ...cur, newStaff: cur?.showStaffModel?.id ?? null });
                        return acc;
                    }, []);
                    // const _backgroud = getBackgroundColor(item?.status);
                    const isToday = date.isSame(new Date(), 'date');
                    const hasReport = items.reduce((acc: boolean, cur: any) => {
                        if (cur.isReported) {
                            acc = true;
                        }
                        return acc;
                    }, false);
                    return <div
                        className={`__app-date-block${isToday ? ' today' : ''}`}
                        style={{ background: 'transparent', marginBottom: 4 }}
                        onDoubleClick={() => {
                            // item.newStaff = item?.showStaffModel?.id ?? null;
                            setPopupDate({
                                isShow: true,
                                data: items
                            });
                            getReport(items.reduce((acc: string[], cur: any) => {
                                acc.push(cur.id)
                                return acc;
                            }, []));
                        }}
                    >
                        <div className={`__app-date-value${isToday ? ' today' : ''}`}>
                            {
                                hasReport ? <ExclamationCircleOutlined style={{
                                    marginRight: 10,
                                    color: 'red'
                                }} /> : null
                            }
                            {date.date()}
                        </div>
                        <div className='__app-date-content'>
                            {/* {getDateContent(items?.status)} */}
                            {
                                items.length > 0 ? items.reduce((acc: JSX.Element[], cur: any) => {
                                    acc.push(
                                        <span style={{
                                            padding: 5,
                                            background: getBackgroundColor(cur.status),
                                        }}></span>
                                    )
                                    return acc;
                                }, []) : <></>
                            }
                        </div>
                    </div>
                } else {
                    return <div
                        className={`__app-date-block`}
                        style={{ marginBottom: 4 }}
                    >
                        <div className={`__app-date-value`}>
                            {date.date()}
                        </div>
                        <div className='__app-date-content'>
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#0D6368' }} spin />} />
                        </div>
                    </div>
                }

            }}
            onChange={(date) => {
                setMonthSelect(date.month() + 1);
                setYearSelect(date.year());
            }}
        />
        {
            popupDate.isShow ?
                <Modal
                    width={500}
                    open={true}
                    closable={false}
                    title={(
                        <span className='__app-dialog-title'>
                            THÔNG TIN NGÀY LÀM VIỆC
                        </span>
                    )}
                    footer={[
                        <Button key='cancel' onClick={() => {
                            setPopupDate({
                                isShow: false,
                                data: null
                            });
                            if (hasDataChanged) {
                                setDataChanged(false);
                                loadData();
                            }
                        }}>Đóng</Button>,


                    ]}
                    centered
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                    }}>
                        {
                            popupDate.data.length > 0 ? <>
                                {
                                    popupDate.data.reduce((acc: JSX.Element[], cur: any, index: number) => {
                                        acc.push(
                                            <div style={{ padding: '4px 12px 4px 12px', border: '1px solid rgba(5, 5, 5, 0.3)', display: 'flex', gap: 4, flexDirection: 'column' }}>
                                                <span><strong>{cur.contractDetailID}</strong> - <strong>{cur.title}</strong></span>
                                                <Divider className='__app-divider-no-margin' />
                                                <Row>
                                                    <Col span={8} style={{ fontWeight: 500 }}>Trạng thái:</Col>
                                                    <Col span={12}>
                                                        <Tag color={CommonUtility.statusColorMapping(cur.status)}>{getDateContent(cur.status)}</Tag>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col span={8} style={{ fontWeight: 500 }}>Nhân Viên:</Col>
                                                    <Col span={12}>
                                                        {
                                                            cur.status === 'DONE' || cur.status === 'MISSED' ? cur.showStaffModel.fullName ?? '--' :
                                                                <UserPicker
                                                                    listUser={props.listUser.reduce((acc_user: any[], cur_user) => {
                                                                        acc_user.push({
                                                                            value: cur_user.id,
                                                                            label: cur_user.fullName
                                                                        })
                                                                        return acc_user;
                                                                    }, [])}
                                                                    onChanged={(userId) => {
                                                                        let temp = cloneDeep(popupDate);
                                                                        temp.data[index].newStaff = userId;
                                                                        // temp.data.newStaff = userId;
                                                                        setPopupDate(temp);
                                                                    }}
                                                                    defaultValue={cur.newStaff}
                                                                />
                                                        }
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col span={8} style={{ fontWeight: 500 }}>Tiến trình làm việc:</Col>
                                                </Row>
                                                <Row>
                                                    {
                                                        cur.status === 'WAITING' ?
                                                            <span style={{ color: '#96939F' }}>Chưa tới ngày làm việc</span>
                                                            : <></>
                                                    }
                                                    {
                                                        cur.status === 'MISSED' ?
                                                            <span style={{ color: 'red' }}>Nhân viên không đi làm</span>
                                                            : <></>
                                                    }
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        width: '100%',
                                                        justifyContent: 'space-around'
                                                    }}>
                                                        {
                                                            cur.startWorking ? <div style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                width: 'calc(50% - 32px)'
                                                            }}>
                                                                <span>
                                                                    <span style={{ fontWeight: 600, color: 'green' }}>Vào làm: </span>
                                                                    <span>{DateTime.fromJSDate(new Date(cur.startWorking)).toFormat('dd/MM/yyyy HH:mm')}</span>
                                                                </span>
                                                                <img alt='' src={cur.startWorkingIMG} style={{ width: 60 }} />
                                                            </div> : <></>
                                                        }
                                                        {
                                                            cur.endWorking ? <div style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                            }}>
                                                                <span>
                                                                    <span style={{ fontWeight: 600, color: 'green' }}>Hoàn thành: </span>
                                                                    <span>{DateTime.fromJSDate(new Date(cur.endWorking)).toFormat('dd/MM/yyyy HH:mm')}</span>
                                                                </span>
                                                                <img alt='' src={cur.endWorkingIMG} style={{ width: 60 }} />
                                                            </div> : <></>
                                                        }
                                                    </div>
                                                </Row>
                                                <Row>
                                                    <Col span={8} style={{ fontWeight: 500 }}>Ghi chú:</Col>
                                                    <Col span={12}>
                                                        {
                                                            cur.status !== 'DONE' && cur.status !== 'MISSED' ?
                                                                <TextArea
                                                                    rows={2}
                                                                    value={cur.noteWorkingDate ?? ''}
                                                                    onChange={(args) => {
                                                                        let temp = cloneDeep(popupDate);
                                                                        temp.data[index].noteWorkingDate = args.target.value;
                                                                        setPopupDate(temp);
                                                                    }}
                                                                ></TextArea>
                                                                : <span>{cur.noteWorkingDate ?? ''}</span>
                                                        }

                                                    </Col>
                                                </Row>
                                                {
                                                    cur.isReported ?
                                                        <Row>
                                                            <Col span={8} style={{ fontWeight: 500 }}>Báo cáo:</Col>
                                                            <Col span={12}>
                                                                <span style={{
                                                                    color: 'red',
                                                                    fontWeight: 700
                                                                }}>
                                                                    {workingDateReport.get(cur.id) ?? <Skeleton.Input active={true} block={true} />}
                                                                </span>
                                                            </Col>
                                                        </Row>
                                                        : <></>
                                                }
                                                <span style={{ padding: 2 }}></span>
                                                {
                                                    cur.status !== 'DONE' && cur.status !== 'MISSED' ?
                                                        <div style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'row-reverse'
                                                        }}><Button
                                                            style={{ background: '#0D6368', color: '#FFF' }}
                                                            type='primary'
                                                            key='save'
                                                            disabled={cur.newStaff ? false : true}
                                                            onClick={() => {
                                                                props.apiServices.changeStaffForWorkingDate$(cur.newStaff, cur.id, cur.noteWorkingDate).pipe(take(1)).subscribe({
                                                                    next: (value: any) => {
                                                                        if (value.error) {
                                                                            toast.error(value.error);
                                                                        } else {
                                                                            toast.success('Cập nhật thành công.');
                                                                            setDataChanged(true);
                                                                        }
                                                                    }
                                                                });
                                                            }}>Thay đổi</Button></div> : <></>
                                                }
                                            </div>
                                        )
                                        return acc;
                                    }, [])
                                }
                            </> : 'Không có thông tin hiển thị'
                        }
                    </div>
                </Modal> : <></>
        }
    </div>
}