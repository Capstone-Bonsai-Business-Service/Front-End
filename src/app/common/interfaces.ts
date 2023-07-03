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
    }
}