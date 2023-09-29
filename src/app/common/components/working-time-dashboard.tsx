import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { IDashboard } from '../interfaces';
import { Button, Select } from 'antd';
import './common-component.scss';
import { LeftOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';

interface IDashboardProps {
    data: any[];
    exportExcel: () => void;
    backToSchedule: () => void;
    backToList: () => void;
}

export const WorkingTimeDashBoardComponent: React.FC<IDashboardProps> = (props) => {

    function getDataCount() {
        return props.data.reduce((acc, cur) => {
            if (cur.status === 'DONE') {
                acc[0] += 1;
            }
            if (cur.status === 'MISSED') {
                acc[1] += 1;
            }
            if (cur.status === 'WORKING') {
                acc[2] += 1;
            }
            if (cur.status === 'WAITING') {
                acc[3] += 1;
            }
            return acc;
        }, [0, 0, 0, 0]) ?? [0, 0, 0, 0];
    }

    const donutChartWorkingTime: IDashboard['donutChart'] = {
        title: `THỐNG KÊ LỊCH LÀM VIỆC`,
        dataSource: {
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom' as const,
                        align: 'center',
                        labels: {
                            padding: 8
                        }
                    },
                },
                layout: {
                    padding: 0
                }
            },
            data: {
                labels: ['Đã hoàn thành', 'Không đi làm', 'Đang làm', 'Đang chờ'],
                datasets: [
                    {
                        label: '',
                        data: getDataCount(),
                        backgroundColor: ['rgb(146, 208, 80, 0.7)', 'rgb(192, 0, 0, 0.7)', 'rgb(255, 130, 13, 0.7)', 'rgb(255, 230, 153, 0.7)'],
                        borderWidth: 1,
                    },
                ],
            }
        }
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 24,
                background: '#fff',
                padding: '14px 24px 0 16px'
            }}>
                <LeftOutlined style={{ color: '#000', cursor: 'pointer' }} onClick={() => {
                    props.backToList();
                }} />
                <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                    <Button shape='default' icon={<VerticalAlignBottomOutlined />} type='default' onClick={() => {
                        props.exportExcel();
                    }}>Xuất Tệp Excel</Button>
                    <Select
                        style={{ width: 120 }}
                        value={'dashboard'}
                        options={[{ value: 'calendar', label: 'Lịch' }, { value: 'dashboard', label: 'Dashboard' }]}
                        onChange={(value) => {
                            if (value === 'calendar') {
                                props.backToSchedule()
                            }
                        }}
                    />
                </div>
            </div>
            <div className='__app-dashboard' style={{ background: '#fff', height: 520, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <div style={{ width: '45%' }}>
                    <Doughnut
                        options={donutChartWorkingTime.dataSource.options}
                        data={donutChartWorkingTime.dataSource.data} />
                </div>
            </div>
        </div>

    )
}