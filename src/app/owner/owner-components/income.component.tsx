import React, { useEffect, useState } from 'react';
import { Chart, Doughnut } from 'react-chartjs-2';
import { Select, Spin } from 'antd';
import { IDashboard, reportLabel } from '../../common/interfaces';
import { Observable, forkJoin, take } from 'rxjs';
import { DateTime } from 'luxon';
import { OwnerServices } from '../owner.service';
import '../owner.scss';
import { LoadingOutlined } from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import { CommonUtility } from '../../utils/utilities';

interface IDashboardProps {

}

export const IncomStatisticComponent: React.FC<IDashboardProps> = (props) => {
    const ownerService = new OwnerServices();

    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [dataSetDataOrder, setDataSetOrder] = useState<{
        count: number[],
        sum: number[]
    }>({
        count: [],
        sum: []
    })
    const [dataSetDataContract, setDataSetContract] = useState<{
        count: number[],
        sum: number[]
    }>({
        count: [],
        sum: []
    })
    const [dataSetFilterOrder, setDataFilterOrder] = useState<'weekly' | 'monthly' | 'quarter'>('weekly');
    const [dataSetFilterContract, setDataFilterContract] = useState<'weekly' | 'monthly' | 'quarter'>('weekly');
    const [dataSetStoreOrderIncome, setDataSetStoreOrderIncome] = useState<{
        data: number[],
        label: string[]
    }>({
        data: [],
        label: []
    });
    const [dataSetStoreContractIncome, setDataSetStoreContractIncome] = useState<{
        data: number[],
        label: string[]
    }>({
        data: [],
        label: []
    })

    const barChartOrder: IDashboard['barChart'] = {
        title: 'THỐNG KÊ ĐƠN HÀNG',
        filter(value) {
            setDataFilterOrder(value);
            loadStatistic$(value, 'order').pipe(take(1)).subscribe({
                next: (res: any) => {
                    setDataSetOrder(res);
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
                labels: reportLabel[dataSetFilterOrder],
                datasets: [
                    {
                        type: 'bar' as const,
                        label: 'Tổng thu nhập từ Đơn hàng',
                        data: dataSetDataOrder.sum,
                        backgroundColor: 'rgba(200, 99, 52, 0.5)',
                        yAxisID: 'y',
                    },
                    {
                        type: 'line' as const,
                        label: 'Số lượng đơn hàng',
                        data: dataSetDataOrder.count,
                        backgroundColor: 'rgba(53, 162, 25, 0.5)',
                        borderColor: 'rgba(53, 162, 25, 0.5)',
                        yAxisID: 'y1',
                    }
                ],
            },
            type: 'bar'
        },
        filterOptions: [{ label: '7 ngày trước', value: 'weekly' }, { label: 'Mỗi Quý', value: 'quarter' }, { label: 'Mỗi Tháng', value: 'monthly' }],
        filterSelected: 'weekly'
    }

    const barChartContract: IDashboard['barChart'] = {
        title: 'THỐNG KÊ HỢP ĐỒNG',
        filter(value) {
            setDataFilterContract(value);
            loadStatistic$(value, 'contract').pipe(take(1)).subscribe({
                next: (res: any) => {
                    setDataSetContract(res);
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
                labels: reportLabel[dataSetFilterContract],
                datasets: [
                    {
                        type: 'bar' as const,
                        label: 'Tổng thu nhập từ Hợp đồng',
                        data: dataSetDataContract.sum,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        yAxisID: 'y',
                    },
                    {
                        type: 'line' as const,
                        label: 'Số lượng Hợp đồng',
                        data: dataSetDataContract.count,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgb(54, 162, 235, 0.5)',
                        yAxisID: 'y1',
                    },
                ],
            },
            type: 'bar'
        },
        filterOptions: [{ label: '7 ngày trước', value: 'weekly' }, { label: 'Mỗi Quý', value: 'quarter' }, { label: 'Mỗi Tháng', value: 'monthly' }],
        filterSelected: 'weekly'
    }

    const donutChartOrder: IDashboard['donutChart'] = {
        title: 'DOANH THU ĐƠN HÀNG THEO CHI NHÁNH',
        dataSource: {
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right' as const,
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
                labels: dataSetStoreOrderIncome.label,
                datasets: [
                    {
                        label: '',
                        data: dataSetStoreOrderIncome.data,
                        backgroundColor: CommonUtility.getListColorDataSet(dataSetStoreOrderIncome.label),
                        borderWidth: 1,
                    },
                ],
            }
        }
    }

    const donutChartContract: IDashboard['donutChart'] = {
        title: 'DOANH THU HỢP ĐỒNG THEO CHI NHÁNH',
        dataSource: {
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right' as const,
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
                labels: dataSetStoreContractIncome.label,
                datasets: [
                    {
                        label: '',
                        data: dataSetStoreContractIncome.data,
                        backgroundColor: CommonUtility.getListColorDataSet(dataSetStoreContractIncome.label),
                        borderWidth: 1,
                    },
                ],
            }
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!isFirstInit) {
            setFirstInit(true);
            loadData();
        }
    });

    function loadData() {
        setDataReady(false);
        forkJoin([
            loadStatistic$(dataSetFilterOrder, 'order'),
            loadStatistic$(dataSetFilterContract, 'contract'),
            loadStoreIncome$('order'),
            loadStoreIncome$('contract')
        ]).pipe(take(1)).subscribe({
            next: (values: any[]) => {
                setDataSetOrder(values[0]);
                setDataSetContract(values[1]);
                setDataSetStoreOrderIncome(values[2]);
                setDataSetStoreContractIncome(values[3])
                setDataReady(true);
                setFirstInit(true);
            }
        })
    }

    function loadStoreIncome$(object: 'order' | 'contract') {
        return new Observable(obs => {
            const year = new Date().getFullYear();
            ownerService.getReportAllStore$(`${year}-01-01`, `${year}-12-31`).pipe(take(1)).subscribe({
                next: (res) => {
                    if (res.error) {
                        toast.error('Không thể lấy dữ liệu');
                        obs.next({
                            label: [],
                            data: []
                        });
                        obs.complete();
                    } else {
                        const result = res.reduce((acc: any, cur: any) => {
                            acc['label'].push(cur.showStoreModel.storeName);
                            if (object === 'contract') {
                                acc['data'].push(Number(cur.storeContractModel.sumOfContract) ?? 0);
                            } else {
                                acc['data'].push(Number(cur.storeOrderModel.sumOfOrder) ?? 0);
                            }
                            return acc;
                        }, {
                            label: [],
                            data: []
                        });
                        obs.next(result);
                        obs.complete();
                    }
                }
            })
        })
    }

    function loadStatistic$(_datasetFilter: 'weekly' | 'quarter' | 'monthly', object: 'order' | 'contract') {
        switch (_datasetFilter) {
            case 'weekly': return getDataSetReportWeekly$(object);
            case 'monthly': return getDataSetReportMonthly$(object);
            case 'quarter': return getDataSetReportQuarter$(object);
        }
    }

    function getDataSetReportWeekly$(object: 'order' | 'contract') {
        return new Observable(obs => {
            let today = DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd');
            const request$ = [];
            for (let i = 0; i < 7; i++) {
                let date = new Date(today);
                let _to = DateTime.fromJSDate(new Date(date.setDate(date.getDate() - i))).toFormat('yyyy-MM-dd');
                let _from = DateTime.fromJSDate(new Date(date.setDate(date.getDate() - 1))).toFormat('yyyy-MM-dd');
                request$.push(ownerService.getReport$(_from, _to))
            }
            forkJoin(request$.reverse()).subscribe({
                next: (values) => {
                    const datasets = values.reduce((acc, cur) => {
                        if (object === 'contract') {
                            acc['count'].push(cur.numOfContract ?? 0);
                            acc['sum'].push(Number(cur.sumOfContract ?? 0));
                        } else {
                            acc['count'].push(cur.numOfOrder ?? 0);
                            acc['sum'].push(Number(cur.sumOfOrder ?? 0));
                        }
                        return acc;
                    }, {
                        count: [],
                        sum: []
                    })
                    obs.next(datasets);
                    obs.complete();
                }
            })
        })
    }

    function getDataSetReportQuarter$(object: 'order' | 'contract') {
        return new Observable(obs => {
            const thisYear = DateTime.fromJSDate(new Date()).toFormat('yyyy');
            const currentMonth = new Date().getMonth() + 1;
            const currentQuarter = Math.ceil(currentMonth / 3);

            const request$ = [ownerService.getReport$(`${thisYear}-01-01`, `${thisYear}-03-31`)];

            if (currentQuarter < 3) {
                request$.push(ownerService.getReport$(`${thisYear}-04-01`, `${thisYear}-06-30`));
            }
            if (currentQuarter < 4) {
                request$.push(ownerService.getReport$(`${thisYear}-07-01`, `${thisYear}-09-30`));
            }
            if (currentQuarter === 4) {
                request$.push(ownerService.getReport$(`${thisYear}-10-01`, `${thisYear}-12-31`));
            }
            forkJoin([...request$]).subscribe({
                next: (values) => {
                    const datasets = values.reduce((acc, cur) => {
                        if (object === 'contract') {
                            acc['count'].push(cur.numOfContract ?? 0);
                            acc['sum'].push(Number(cur.sumOfContract ?? 0));
                        } else {
                            acc['count'].push(cur.numOfOrder ?? 0);
                            acc['sum'].push(Number(cur.sumOfOrder ?? 0));
                        }
                        return acc;
                    }, {
                        count: [],
                        sum: []
                    })
                    obs.next(datasets);
                    obs.complete();
                }
            })
        })
    }

    function getDataSetReportMonthly$(object: 'order' | 'contract') {
        return new Observable(obs => {
            let thisYear = DateTime.fromJSDate(new Date()).toFormat('yyyy');
            const currentMonth = new Date().getMonth() + 1;
            const request$: Observable<any>[] = [];
            const range = [
                ownerService.getReport$(`${thisYear}-01-01`, `${thisYear}-01-31`),
                ownerService.getReport$(`${thisYear}-02-01`, `${thisYear}-02-28`),
                ownerService.getReport$(`${thisYear}-03-01`, `${thisYear}-03-31`),
                ownerService.getReport$(`${thisYear}-04-01`, `${thisYear}-04-30`),
                ownerService.getReport$(`${thisYear}-05-01`, `${thisYear}-05-31`),
                ownerService.getReport$(`${thisYear}-06-01`, `${thisYear}-06-30`),
                ownerService.getReport$(`${thisYear}-07-01`, `${thisYear}-07-31`),
                ownerService.getReport$(`${thisYear}-08-01`, `${thisYear}-08-31`),
                ownerService.getReport$(`${thisYear}-09-01`, `${thisYear}-09-30`),
                ownerService.getReport$(`${thisYear}-10-01`, `${thisYear}-10-31`),
                ownerService.getReport$(`${thisYear}-11-01`, `${thisYear}-11-30`),
                ownerService.getReport$(`${thisYear}-12-01`, `${thisYear}-12-31`)
            ];
            for (let i = 0; i < currentMonth; i++) {
                request$.push(range[i]);
            }
            forkJoin([...request$]).subscribe({
                next: (values) => {
                    const datasets = values.reduce((acc, cur) => {
                        if (object === 'contract') {
                            acc['count'].push(cur.numOfContract ?? 0);
                            acc['sum'].push(Number(cur.sumOfContract ?? 0));
                        } else {
                            acc['count'].push(cur.numOfOrder ?? 0);
                            acc['sum'].push(Number(cur.sumOfOrder ?? 0));
                        }
                        return acc;
                    }, {
                        count: [],
                        sum: []
                    })
                    obs.next(datasets);
                    obs.complete();
                }
            })
        })
    }

    return (
        <div className='__app-dashboard-container'>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                <div className='__app-widget-container'>
                    {
                        isDataReady ?
                            <>
                                <div className='__app-widget-header'>
                                    <span className='__app-widget-title'>{barChartOrder.title}</span>
                                    <Select
                                        className='__app-widget-filter-option'
                                        defaultValue={barChartOrder.filterSelected ?? null}
                                        options={barChartOrder.filterOptions}
                                        onChange={(value) => {
                                            barChartOrder.filter(value);
                                        }}
                                    ></Select>
                                </div>
                                <div className="__app-chart-widget-block">
                                    <div style={{ width: '90%' }}>
                                        <Chart
                                            type={barChartOrder.dataSource.type}
                                            options={barChartOrder.dataSource.options}
                                            data={barChartOrder.dataSource.data} />
                                    </div>
                                </div>
                            </> :
                            <div className='__app-widget-loader'>
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#0D6368' }} spin />} />
                            </div>
                    }

                </div>
                <div className='__app-widget-container'>
                    {
                        isDataReady ? <>
                            <div className='__app-widget-header'>
                                <span className='__app-widget-title'>{barChartContract.title}</span>
                                <Select
                                    className='__app-widget-filter-option'
                                    defaultValue={barChartContract.filterSelected ?? null}
                                    options={barChartContract.filterOptions}
                                    onChange={(value) => {
                                        barChartContract.filter(value);
                                    }}
                                ></Select>
                            </div>
                            <div className="__app-chart-widget-block">
                                <div style={{ width: '90%' }}>
                                    <Chart
                                        type={barChartContract.dataSource.type}
                                        options={barChartContract.dataSource.options}
                                        data={barChartContract.dataSource.data} />
                                </div>
                            </div>
                        </> :
                            <div className='__app-widget-loader'>
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#0D6368' }} spin />} />
                            </div>
                    }

                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                <div className='__app-widget-container'>
                    {
                        isDataReady ?
                            <>
                                <div className='__app-widget-header'>
                                    <span className='__app-widget-title'>{donutChartOrder.title}</span>
                                    <span></span>
                                </div>
                                <div className="__app-chart-widget-block">
                                    <div style={{ width: '90%' }}>
                                        <Doughnut
                                            options={donutChartOrder.dataSource.options}
                                            data={donutChartOrder.dataSource.data} />
                                    </div>
                                </div>
                            </> :
                            <div className='__app-widget-loader'>
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#0D6368' }} spin />} />
                            </div>
                    }

                </div>
                <div className='__app-widget-container'>
                    {
                        isDataReady ? <>
                            <div className='__app-widget-header'>
                                <span className='__app-widget-title'>{donutChartContract.title}</span>
                                <span></span>
                            </div>
                            <div className="__app-chart-widget-block">
                                <div style={{ width: '90%' }}>
                                    <Doughnut
                                        options={donutChartContract.dataSource.options}
                                        data={donutChartContract.dataSource.data} />
                                </div>
                            </div>
                        </> :
                            <div className='__app-widget-loader'>
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#0D6368' }} spin />} />
                            </div>
                    }

                </div>
            </div>
        </div>
    )
}