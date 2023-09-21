import { Button, Calendar, Col, Divider, Modal, Row, Select, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { CommonUtility } from '../../utils/utilities';
import './common-component.scss';
import { useEffect, useState } from 'react';
import { DefaultOptionType } from 'antd/es/select';
import { take } from 'rxjs';
import { UserPicker } from './user-picker-component';
import { IUser } from '../../../IApp.interface';
import { cloneDeep } from 'lodash';
import toast from 'react-hot-toast';
import { LeftOutlined, LoadingOutlined } from '@ant-design/icons';

interface IWorkingTimeProps {
    contractDetailId: string;
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
        props.apiServices.getWorkingTimesByService$(props.contractDetailId).pipe(take(1)).subscribe({
            next: (value: any) => {
                const data = onUpdateDataSource(value);
                setListWorkingTime(data);
                setDataReady(true);
            }
        })
    }

    function onUpdateDataSource(data: any[]) {
        for (let item of data) {
            const _workingDate = new Date(item.workingDate).getTime();
            const _toDay = new Date().getTime();
            if (_toDay > _workingDate) {
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
            case 'DONE': return 'rgb(146, 208, 80, 0.5)';
            case 'MISSED': return 'rgb(192, 0, 0, 0.5)';
            case 'WAITING': return 'rgb(255, 230, 153, 0.5)';
            case 'WORKING': return 'rgb(255, 130, 13, 0.5)';
            case 'CUSTOMERCANCELED': return 'rgb(192, 0, 0, 0.5)';
            case 'STAFFCANCELED': return 'rgb(192, 0, 0, 0.5)';
            default: return 'rgb(255, 230, 153, 0.5)'
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

    return <div className='__app-working-time-container'>
        <Calendar
            className='__app-calendar-container'
            mode='month'
            fullscreen={true}
            headerRender={(propsHeader) => {
                return <div className='__app-calendar-header'>
                    <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                        if (props.callbackFn) {
                            props.callbackFn();
                        }
                    }} />
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
                    const item = listWorkingTime.find(itm => date.isSame(itm.workingDate, 'date'));
                    const _backgroud = getBackgroundColor(item?.status);
                    const isToday = date.isSame(new Date(), 'date');
                    return <div
                        className={`__app-date-block${isToday ? ' today' : ''}`}
                        style={{ background: _backgroud, marginBottom: 4 }}
                        onDoubleClick={() => {
                            setPopupDate({
                                isShow: true,
                                data: item
                            })
                        }}
                    >
                        <div className={`__app-date-value${isToday ? ' today' : ''}`}>
                            {date.date()}
                        </div>
                        <div className='__app-date-content'>
                            {getDateContent(item?.status)}
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
                            })
                        }}>Đóng</Button>,
                        popupDate.data && popupDate.data.status !== 'DONE' && popupDate.data.status !== 'MISSED' ?
                            <Button
                                style={{ background: '#0D6368', color: '#FFF' }}
                                type='primary'
                                key='save'
                                disabled={popupDate.data.newStaff ? false : true}
                                onClick={() => {
                                    props.apiServices.changeStaffForWorkingDate$(popupDate.data.newStaff, popupDate.data.id).pipe(take(1)).subscribe({
                                        next: (value: any) => {
                                            if (value.error) {
                                                toast.error(value.error);
                                            } else {
                                                toast.success('Cập nhật thành công.');
                                                setPopupDate({
                                                    isShow: false,
                                                    data: null
                                                });
                                                loadData();
                                            }
                                        }
                                    });
                                }}>Thay đổi</Button> : null,


                    ]}
                    centered
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                    }}>
                        {
                            popupDate.data ? <>
                                <strong>{popupDate.data.title}</strong>
                                <Divider className='__app-divider-no-margin' />
                                <Row>
                                    <Col span={8} style={{ fontWeight: 500 }}>Trạng thái:</Col>
                                    <Col span={12}>
                                        <Tag color={CommonUtility.statusColorMapping(popupDate.data.status)}>{getDateContent(popupDate.data.status)}</Tag>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={8} style={{ fontWeight: 500 }}>Nhân Viên:</Col>
                                    <Col span={12}>
                                        {
                                            popupDate.data.status === 'DONE' || popupDate.data.status === 'MISSED' ? popupDate.data.showStaffModel.fullName ?? '--' :
                                                <UserPicker
                                                    listUser={props.listUser.reduce((acc: any[], cur) => {
                                                        acc.push({
                                                            value: cur.id,
                                                            label: cur.fullName
                                                        })
                                                        return acc;
                                                    }, [])}
                                                    onChanged={(userId) => {
                                                        let temp = cloneDeep(popupDate);
                                                        temp.data.newStaff = userId;
                                                        setPopupDate(temp);
                                                    }}
                                                    defaultValue={popupDate.data.showStaffModel.id}
                                                />
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={8} style={{ fontWeight: 500 }}>Tiến trình làm việc:</Col>
                                </Row>
                                <Row>
                                    {
                                        popupDate.data.status === 'WAITING' ?
                                            <span style={{ color: '#96939F' }}>Chưa tới ngày làm việc</span>
                                            : <></>
                                    }
                                    {
                                        popupDate.data.status === 'MISSED' ?
                                            <span style={{ color: 'red' }}>Nhân viên không đi làm</span>
                                            : <></>
                                    }
                                </Row>
                            </> : 'Không có thông tin hiển thị'
                        }
                    </div>
                </Modal> : <></>
        }
    </div>
}

const dummyDatav2 = [
    {
        "id": "WD014",
        "workingDate": "2023-10-22T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD013",
        "workingDate": "2023-10-21T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "MISSED",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD012",
        "workingDate": "2023-10-17T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD011",
        "workingDate": "2023-10-15T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD010",
        "workingDate": "2023-10-14T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD009",
        "workingDate": "2023-10-10T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD008",
        "workingDate": "2023-10-08T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD007",
        "workingDate": "2023-10-07T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD006",
        "workingDate": "2023-10-03T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD005",
        "workingDate": "2023-10-01T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD004",
        "workingDate": "2023-09-30T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD003",
        "workingDate": "2023-09-26T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD002",
        "workingDate": "2023-09-24T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    },
    {
        "id": "WD001",
        "workingDate": "2023-09-23T00:00:00",
        "startWorking": null,
        "endWorking": null,
        "startWorkingIMG": null,
        "endWorkingIMG": null,
        "status": "WAITING",
        "contractID": "CT002",
        "title": "Hợp đồng Chăm sóc cây tại nhà",
        "fullName": "Nguyễn Văn F",
        "address": "Phú Hữu, Quận 9, TP HCM",
        "phone": "0923455432",
        "email": "lnd@gmail.com",
        "contractDetailID": "CTD003",
        "timeWorking": "Chủ nhật - Thứ 3 - Thứ 7",
        "note": "Không có",
        "startDate": "2023-09-23T00:00:00",
        "endDate": null,
        "expectedEndDate": "2023-10-23T00:00:00",
        "totalPrice": 700000.0,
        "serviceID": "SE001",
        "serviceName": "Chăm sóc cây tại nhà",
        "serviceTypeID": "ST001",
        "typeName": "Cây từ đến 0 - 0.5 m",
        "typePercentage": 0,
        "typeSize": "0 - 0.5",
        "typeUnit": "m",
        "typeApplyDate": "2023-06-07T12:05:50",
        "servicePackID": "SP001",
        "packRange": "1",
        "packUnit": "tháng",
        "packPercentage": 0,
        "packApplyDate": "2022-06-30T00:00:00",
        "showStaffModel": {
            "fullName": "Nguyễn Văn B",
            "email": "phuongnghi@gmail.com",
            "phone": "0877333990",
            "address": "37, Kinh Dương Vương, Phường 12 Bình Tân, HCM",
            "id": 14,
            "avatar": "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/avatar-nu-dep.jpg",
            "gender": null,
            "status": null,
            "totalPage": null
        },
        "totalPage": 1.0
    }
]