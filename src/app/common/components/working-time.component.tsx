import { Button, Calendar, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { CommonUtility } from '../../utils/utilities';
import './common-component.scss';
import { useEffect, useState } from 'react';
import { DefaultOptionType } from 'antd/es/select';

interface IWorkingTimeProps {
    contractId: string;
}


export const WorkingTimeCalendar: React.FC<IWorkingTimeProps> = (props) => {
    const [listWorkingTime, setListWorkingTime] = useState<any>();
    const [isFirstInit, setFirstInit] = useState<boolean>(false);
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

    function getBackgroundColor(status: any) {
        if (CommonUtility.isNullOrUndefined(status)) {
            return 'transparent';
        }
        switch (status) {
            case 'DONE': return 'rgb(146, 208, 80, 0.5)';
            case 'MISS': return 'rgb(192, 0, 0, 0.5)';
            default: return 'rgb(255, 230, 153, 0.5)'
        }
    }

    function getDateContent(status: any) {
        if (CommonUtility.isNullOrUndefined(status)) {
            return '';
        }
        switch (status) {
            case 'DONE': return 'Đã hoàn thành';
            case 'MISS': return 'Chưa hoàn thành';
            default: return 'Đang đợi';
        }
    }

    return <div className='__app-working-time-container'>
        <Calendar
            className='__app-calendar-container'
            mode='month'
            fullscreen={true}
            headerRender={(props) => {
                return <div className='__app-calendar-header'>
                    <Select
                        style={{ width: 100 }}
                        value={yearSelect}
                        options={yearOptions}
                        onChange={(value) => {
                            setYearSelect(value);
                            let temp = props.value.clone().year(value);
                            props.onChange(temp);
                        }}
                    />
                    <Select
                        style={{ width: 150 }}
                        value={monthSelect}
                        options={monthOptions}
                        onChange={(value) => {
                            setMonthSelect(value);
                            let temp = props.value.clone().month(value - 1);
                            props.onChange(temp);
                        }}
                    />
                </div>
            }}
            fullCellRender={(date) => {
                const item = dummyData.find(itm => date.isSame(itm.strDate, 'date'));
                const _backgroud = getBackgroundColor(item?.status);
                const isToday = date.isSame(new Date(), 'date');
                return <div
                    className={`__app-date-block${isToday ? ' today' : ''}`}
                    style={{ background: _backgroud }}
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
                    ]}
                    centered
                >
                    <div>
                        {
                            popupDate.data ? popupDate.data.status : 'Không có thông tin hiển thị' 
                        }
                    </div>
                </Modal> : <></>
        }
    </div>
}

const dummyData = [
    {
        date: dayjs(new Date('2023-09-01')),
        strDate: '2023-09-01',
        status: 'DONE'
    },
    {
        date: dayjs(new Date('2023-09-05')),
        strDate: '2023-09-05',
        status: 'DONE'
    },
    {
        date: dayjs(new Date('2023-09-07')),
        strDate: '2023-09-07',
        status: 'DONE'
    },
    {
        date: dayjs(new Date('2023-08-09')),
        strDate: '2023-09-09',
        status: 'MISS'
    },
    {
        date: dayjs(new Date('2023-09-11')),
        strDate: '2023-09-11',
        status: 'DONE'
    },
    {
        date: dayjs(new Date('2023-09-13')),
        strDate: '2023-09-13',
        status: 'WAITING'
    },
    {
        date: dayjs(new Date('2023-09-15')),
        strDate: '2023-09-15',
        status: 'WAITING'
    },
    {
        date: dayjs(new Date('2023-08-17')),
        strDate: '2023-09-17',
        status: 'WAITING'
    }
]