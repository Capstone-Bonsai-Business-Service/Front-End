import React from 'react';
import { Chart } from 'react-chartjs-2';
import { IDashboard } from '../interfaces';
import { Select, Table } from 'antd';
import './common-component.scss';

interface IDashboardProps extends IDashboard {

}

export const DashBoardComponent: React.FC<IDashboardProps> = (props) => {

    return (
        <div className='__app-dashboard'>
            <div className='__app-widget-container'>
                <div className='__app-widget-header'>
                    <span className='__app-widget-title'>{props.barChart.title}</span>
                    <Select
                        className='__app-widget-filter-option'
                        defaultValue={props.barChart.filterSelected ?? null}
                        options={props.barChart.filterOptions}
                        onChange={(value) => {
                            props.barChart.filter(value);
                        }}
                    ></Select>
                </div>
                <div className="__app-chart-widget-block">
                    <div style={{ width: '84%' }}>
                        <Chart type={props.barChart.dataSource.type} options={props.barChart.dataSource.options} data={props.barChart.dataSource.data} />
                    </div>
                </div>
            </div>
        </div>
    )
}