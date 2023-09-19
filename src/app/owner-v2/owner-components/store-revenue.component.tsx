import React, { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { Card, Col, Row, Select, Spin, Statistic } from 'antd';
import '../../common/components/common-component.scss';
import { OwnerServices } from '../owner.service';
import { IDashboard, reportLabel } from '../../common/interfaces';
import { DateTime } from 'luxon';
import { Observable, concat, forkJoin, take, tap } from 'rxjs';
import { ArrowDownOutlined, ArrowUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { NumericFormat } from 'react-number-format';

interface IDashboardProps {

}

export const StoreStatisticComponent: React.FC<IDashboardProps> = (props) => {

    const ownerService = new OwnerServices();

    const [isFirstInit, setFirstInit] = useState<boolean>(false);
    const [isDataReady, setDataReady] = useState<boolean>(false);
    const [currentStore, setCurrentStore] = useState('');
    const [listStore, setListStore] = useState([]);
    const [dataSetData, setDatasetData] = useState<{
        numOfContract: number[],
        numOfOrder: number[],
        sumOfContract: number[],
        sumOfOrder: number[]
    }>({
        numOfContract: [0, 0, 0, 0, 0, 0, 0],
        numOfOrder: [0, 0, 0, 0, 0, 0, 0],
        sumOfContract: [0, 0, 0, 0, 0, 0, 0],
        sumOfOrder: [0, 0, 0, 0, 0, 0, 0]
    });
    const [kpiDataSet, setKpiDataSet] = useState<{
        contractCount: {
            pre: number,
            cur: number
        },
        contractSum: {
            pre: number,
            cur: number
        },
        orderCount: {
            pre: number,
            cur: number
        },
        orderSum: {
            pre: number,
            cur: number
        },
    }>({
        contractCount: {
            pre: 0,
            cur: 0
        },
        contractSum: {
            pre: 0,
            cur: 0
        },
        orderCount: {
            pre: 0,
            cur: 0
        },
        orderSum: {
            pre: 0,
            cur: 0
        },
    });

    const [dataSetFilter, setDatasetFilter] = useState<'weekly' | 'monthly' | 'quarter'>('weekly');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!isFirstInit) {
            setFirstInit(true);
            getListStore$().subscribe({
                next: (storeId) => {
                    if (storeId) {
                        loadData(storeId);
                    }
                }
            })

        }
    });

    function getListStore$() {
        return new Observable<string | undefined>(obs => {
            ownerService.getStores$(null).pipe(take(1)).subscribe({
                next: (res) => {
                    if (res.length > 0) {
                        const storeOpts = res.reduce((acc, cur) => {
                            acc.push({
                                label: cur.storeName,
                                value: cur.id
                            })
                            return acc;
                        }, []);
                        setListStore(storeOpts);
                        setCurrentStore(storeOpts[0].value);
                        obs.next(storeOpts[0].value);
                        obs.complete();
                    } else {
                        obs.next();
                        obs.complete();
                    }

                }
            })
        })

    }

    function loadData(storeId: string) {
        setDataReady(false);
        forkJoin([
            loadStatistic$(dataSetFilter, storeId),
            loadKPIWidget$(storeId)
        ]).pipe(take(1)).subscribe({
            next: (values: any[]) => {
                setDatasetData(values[0]);
                setKpiDataSet(values[1]);
                setDataReady(true);
                setFirstInit(true);
            }
        })
    }

    function loadStatistic$(_datasetFilter: 'weekly' | 'quarter' | 'monthly', storeId: string) {
        switch (_datasetFilter) {
            case 'weekly': return getDataSetReportWeekly$(storeId);
            case 'monthly': return getDataSetReportMonthly$(storeId);
            case 'quarter': return getDataSetReportQuarter$(storeId);
        }
    }

    function loadKPIWidget$(storeId: string) {
        return new Observable(obs => {
            const currentMonth = new Date().getMonth() + 1;
            const thisYear = new Date().getFullYear();
            const thisMonth = new Date(`${thisYear}-${currentMonth}-01`);
            const lastMonth = new Date(new Date(`${thisYear}-${currentMonth}-01`).setMonth(currentMonth - 2));

            const curTo = DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd');
            const curFrom = DateTime.fromJSDate(thisMonth).toFormat('yyyy-MM-dd');

            const preFrom = DateTime.fromJSDate(lastMonth).toFormat('yyyy-MM-dd');
            const preTo = DateTime.fromJSDate(new Date(thisMonth.setDate(thisMonth.getDate() - 1))).toFormat('yyyy-MM-dd')
            forkJoin([
                ownerService.getReport$(preFrom, preTo, storeId),
                ownerService.getReport$(curFrom, curTo, storeId)
            ]).subscribe({
                next: (values) => {
                    const result = {
                        contractCount: {
                            pre: values[0]?.storeContractModel?.numOfContract ?? 0,
                            cur: values[1]?.storeContractModel?.numOfContract ?? 0,
                        },
                        contractSum: {
                            pre: Number(values[0]?.storeContractModel?.sumOfContract ?? 0),
                            cur: Number(values[1]?.storeContractModel?.sumOfContract ?? 0),
                        },
                        orderCount: {
                            pre: values[0]?.storeOrderModel?.numOfOrder ?? 0,
                            cur: values[1]?.storeOrderModel?.numOfOrder ?? 0,
                        },
                        orderSum: {
                            pre: Number(values[0]?.storeOrderModel?.sumOfOrder ?? 0),
                            cur: Number(values[1]?.storeOrderModel?.sumOfOrder ?? 0),
                        },
                    }
                    obs.next(result);
                    obs.complete();
                }
            })
        })

    }

    const barChart: IDashboard['barChart'] = {
        title: 'THỐNG KÊ',
        filter(value) {
            setDatasetFilter(value);
            loadStatistic$(value, currentStore).pipe(take(1)).subscribe({
                next: (res: any) => {
                    setDatasetData(res);
                    setFirstInit(true);
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
                },
            },
            data: {
                labels: reportLabel[dataSetFilter],
                datasets: [
                    {
                        type: 'bar' as const,
                        label: 'Tổng thu nhập từ Hợp đồng',
                        data: dataSetData.sumOfContract,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        yAxisID: 'y',
                    },
                    {
                        type: 'bar' as const,
                        label: 'Tổng thu nhập từ Đơn hàng',
                        data: dataSetData.sumOfOrder,
                        backgroundColor: 'rgba(200, 99, 52, 0.5)',
                        yAxisID: 'y',
                    },
                ],
            },
            type: 'bar'
        },
        filterOptions: [{ label: '7 ngày trước', value: 'weekly' }, { label: 'Mỗi Quý', value: 'quarter' }, { label: 'Mỗi Tháng', value: 'monthly' }],
        filterSelected: 'weekly'
    }

    function getDataSetReportWeekly$(storeId: string) {
        return new Observable(obs => {
            let today = DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd');
            const request$ = [];
            let isCompleted = false;
            const result: any[] = [];
            for (let i = 0; i < 7; i++) {
                let date = new Date(today);
                let _to = DateTime.fromJSDate(new Date(date.setDate(date.getDate() - i))).toFormat('yyyy-MM-dd');
                let _from = DateTime.fromJSDate(new Date(date.setDate(date.getDate() - 1))).toFormat('yyyy-MM-dd');
                if (i === 0) {
                    // eslint-disable-next-line no-loop-func
                    request$.push(ownerService.getReport$(_from, _to, storeId).pipe(tap(() => { isCompleted = true })))
                } else {
                    request$.push(ownerService.getReport$(_from, _to, storeId))
                }
            }

            concat(...request$.reverse()).subscribe({
                next: (value: any) => {
                    result.push(value)
                    if (isCompleted) {
                        const datasets = result.reduce((acc, cur) => {
                            acc['numOfContract'].push(cur.storeContractModel.numOfContract ?? 0);
                            acc['numOfOrder'].push(cur.storeOrderModel.numOfOrder ?? 0);
                            acc['sumOfContract'].push(Number(cur.storeContractModel.sumOfContract ?? 0));
                            acc['sumOfOrder'].push(Number(cur.storeOrderModel.sumOfOrder ?? 0));
                            return acc;
                        }, {
                            numOfContract: [],
                            numOfOrder: [],
                            sumOfContract: [],
                            sumOfOrder: []
                        })
                        obs.next(datasets);
                        obs.complete();
                    }

                }
            })
        })
    }

    function getDataSetReportQuarter$(storeId: string) {
        return new Observable(obs => {
            const thisYear = DateTime.fromJSDate(new Date()).toFormat('yyyy');
            const currentMonth = new Date().getMonth() + 1;
            const currentQuarter = Math.ceil(currentMonth / 3);

            const request$ = [ownerService.getReport$(`${thisYear}-01-01`, `${thisYear}-03-31`, storeId)];
            let isCompleted = false;
            const result: any[] = [];

            if (currentQuarter < 3) {
                request$.push(ownerService.getReport$(`${thisYear}-04-01`, `${thisYear}-06-30`, storeId).pipe(tap(() => {
                    isCompleted = true;
                })));
            }
            if (currentQuarter < 4) {
                request$.push(ownerService.getReport$(`${thisYear}-07-01`, `${thisYear}-09-30`, storeId).pipe(tap(() => {
                    isCompleted = true;
                })));
            }
            if (currentQuarter === 4) {
                request$.push(ownerService.getReport$(`${thisYear}-10-01`, `${thisYear}-12-31`, storeId).pipe(tap(() => {
                    isCompleted = true;
                })));
            }
            concat(...request$).subscribe({
                next: (value) => {
                    result.push(value);
                    if (isCompleted) {
                        const datasets = result.reduce((acc, cur) => {
                            acc['numOfContract'].push(cur.storeContractModel.numOfContract ?? 0);
                            acc['numOfOrder'].push(cur.storeOrderModel.numOfOrder ?? 0);
                            acc['sumOfContract'].push(Number(cur.storeContractModel.sumOfContract ?? 0));
                            acc['sumOfOrder'].push(Number(cur.storeOrderModel.sumOfOrder ?? 0));
                            return acc;
                        }, {
                            numOfContract: [],
                            numOfOrder: [],
                            sumOfContract: [],
                            sumOfOrder: []
                        })
                        obs.next(datasets);
                        obs.complete();
                    }
                }
            })
        })
    }

    function getDataSetReportMonthly$(storeId: string) {
        return new Observable(obs => {
            let thisYear = DateTime.fromJSDate(new Date()).toFormat('yyyy');
            const currentMonth = new Date().getMonth() + 1;
            const request$: Observable<any>[] = [];
            let isCompleted = false;
            const result: any[] = [];

            const range = [
                ownerService.getReport$(`${thisYear}-01-01`, `${thisYear}-01-31`, storeId),
                ownerService.getReport$(`${thisYear}-02-01`, `${thisYear}-02-28`, storeId),
                ownerService.getReport$(`${thisYear}-03-01`, `${thisYear}-03-31`, storeId),
                ownerService.getReport$(`${thisYear}-04-01`, `${thisYear}-04-30`, storeId),
                ownerService.getReport$(`${thisYear}-05-01`, `${thisYear}-05-31`, storeId),
                ownerService.getReport$(`${thisYear}-06-01`, `${thisYear}-06-30`, storeId),
                ownerService.getReport$(`${thisYear}-07-01`, `${thisYear}-07-31`, storeId),
                ownerService.getReport$(`${thisYear}-08-01`, `${thisYear}-08-31`, storeId),
                ownerService.getReport$(`${thisYear}-09-01`, `${thisYear}-09-30`, storeId),
                ownerService.getReport$(`${thisYear}-10-01`, `${thisYear}-10-31`, storeId),
                ownerService.getReport$(`${thisYear}-11-01`, `${thisYear}-11-30`, storeId),
                ownerService.getReport$(`${thisYear}-12-01`, `${thisYear}-12-31`, storeId)
            ];
            for (let i = 0; i < currentMonth; i++) {
                if (i === currentMonth - 1) {
                    // eslint-disable-next-line no-loop-func
                    request$.push(range[i].pipe(tap(() => {
                        isCompleted = true;
                    })));
                } else {
                    request$.push(range[i]);
                }
            }
            concat(...request$).subscribe({
                next: (value) => {
                    result.push(value);
                    if (isCompleted) {
                        const datasets = result.reduce((acc, cur) => {
                            acc['numOfContract'].push(cur.storeContractModel.numOfContract ?? 0);
                            acc['numOfOrder'].push(cur.storeOrderModel.numOfOrder ?? 0);
                            acc['sumOfContract'].push(Number(cur.storeContractModel.sumOfContract ?? 0));
                            acc['sumOfOrder'].push(Number(cur.storeOrderModel.sumOfOrder ?? 0));
                            return acc;
                        }, {
                            numOfContract: [],
                            numOfOrder: [],
                            sumOfContract: [],
                            sumOfOrder: []
                        })
                        obs.next(datasets);
                        obs.complete();
                    }
                }
            })
        })
    }

    return (
        <div className='__app-dashboard'>
            <div>
                <Row>
                    <Col span={2}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <span>
                            <strong>Chi Nhánh:</strong>
                        </span>
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            value={currentStore}
                            options={listStore}
                            onChange={(value) => {
                                setCurrentStore(value);
                                loadData(value);
                            }}
                        ></Select>
                    </Col>
                </Row>
            </div>
            <div>
                <Row>
                    <Col span={6}>
                        <div style={{ paddingRight: 5 }}>
                            <Card bordered={false} style={{
                                boxShadow: '0 4px 8px 0 #00000033, 0 6px 20px 0 #00000030',
                                padding: 10,
                            }}>
                                <Statistic
                                    title="Số lượng hợp đồng tháng này"
                                    value={kpiDataSet.contractCount.cur}
                                    precision={0}
                                    valueStyle={{ color: '#000000', fontWeight: 600 }}
                                />
                            </Card>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div style={{ padding: '0 5px' }}>
                            <Card bordered={false} style={{
                                boxShadow: '0 4px 8px 0 #00000033, 0 6px 20px 0 #00000030',
                                padding: 10,
                            }}>
                                <Statistic
                                    title="Số lượng đơn hàng tháng này"
                                    value={kpiDataSet.orderCount.cur}
                                    precision={0}
                                    valueStyle={{ color: '#000000', fontWeight: 600 }}
                                />
                            </Card>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div style={{ padding: '0 5px' }}>
                            <Card bordered={false} style={{
                                boxShadow: '0 4px 8px 0 #00000033, 0 6px 20px 0 #00000030',
                                padding: 10,
                            }}>
                                <Statistic
                                    title="Doanh thu hợp đồng tháng này"
                                    value={kpiDataSet.contractSum.cur}
                                    precision={0}
                                    valueStyle={{ color: kpiDataSet.contractSum.cur - kpiDataSet.contractSum.pre >= 0 ? '#3f8600' : '#cf1322', fontWeight: 600 }}
                                    suffix={
                                        kpiDataSet.contractSum.cur - kpiDataSet.contractSum.pre === 0 ? null :
                                            kpiDataSet.contractSum.cur - kpiDataSet.contractSum.pre > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                    formatter={(value) => {
                                        return <NumericFormat thousandSeparator=' ' value={value} displayType='text' suffix=' vnđ' />
                                    }}
                                />
                            </Card>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div style={{ paddingLeft: 10 }}>
                            <Card bordered={false} style={{
                                boxShadow: '0 4px 8px 0 #00000033, 0 6px 20px 0 #00000030',
                                padding: 10,
                            }}>
                                <Statistic
                                    title="Doanh thu đơn hàng tháng này"
                                    value={kpiDataSet.orderSum.cur}
                                    precision={0}
                                    valueStyle={{ color: kpiDataSet.orderSum.cur - kpiDataSet.orderSum.pre >= 0 ? '#3f8600' : '#cf1322', fontWeight: 600 }}
                                    suffix={
                                        kpiDataSet.orderSum.cur - kpiDataSet.orderSum.pre === 0 ? null :
                                            kpiDataSet.orderSum.cur - kpiDataSet.orderSum.pre > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                    formatter={(value) => {
                                        return <NumericFormat thousandSeparator=' ' value={value} displayType='text' suffix=' vnđ' />
                                    }}
                                />
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
            <div className='__app-widget-container'>
                {
                    isDataReady ?
                        <>
                            <div className='__app-widget-header'>
                                <span className='__app-widget-title'>{barChart.title}</span>
                                <Select
                                    className='__app-widget-filter-option'
                                    defaultValue={barChart.filterSelected ?? null}
                                    options={barChart.filterOptions}
                                    onChange={(value) => {
                                        barChart.filter(value);
                                    }}
                                ></Select>
                            </div>
                            <div className="__app-chart-widget-block">
                                <div style={{ width: '84%' }}>
                                    <Chart type={barChart.dataSource.type} options={barChart.dataSource.options} data={barChart.dataSource.data} />
                                </div>
                            </div>
                        </> :
                        <div className='__app-widget-loader'>
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#0D6368' }} spin />} />
                        </div>
                }
            </div>
        </div>
    )
}