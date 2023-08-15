import { ColumnFilterItem, ColumnType } from "antd/es/table/interface";
import { ChartProps } from "react-chartjs-2";

export type layoutMode = 'list' | 'table';

export interface ISelect {
    label: string | number | boolean;
    value: string | number | boolean;
}

export interface ITableColumn extends ColumnType<any> {
    title: string;
    dataIndex: string;
    key: string;
    showSorterTooltip?: boolean;
    ellipsis?: boolean;
    render?: (value: any, record: any, index: number) => JSX.Element;
    filterMode?: 'menu' | 'tree' | undefined;
    filters?: ColumnFilterItem[];
    filterSearch?: boolean,
    filterMultiple?: boolean;
    onFilter?: (value: string | number | boolean, record: any) => boolean;
}

export interface IDashboard {
    barChart: {
        title: string;
        filterOptions: ISelect[];
        dataSource: ChartProps;
        filterSelected: string | number | boolean;
        filter: (value: any) => void;
    },
    tableReport: {
        title: string;
        columns: ITableColumn[];
        dataSource: any[];
        filterOptions: ISelect[];
        filterSelected: string | number | boolean;
        filter: (value: any) => void;
    },
    donutChart?: {
        title: string;
        dataSource: any;
    }
}

export const reportLabel: { [k: string]: any } = {
    'monthly': ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    'quarter': ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
    'weekly': ['7 ngày trước', '6 ngày trước', '5 ngày trước', '4 ngày trước', '3 ngày trước', '2 ngày trước', 'hôm qua']
}