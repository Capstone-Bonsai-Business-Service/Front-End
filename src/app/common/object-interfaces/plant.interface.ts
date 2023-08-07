
export interface IPlant {
    [k: string]: any;
    plantID: string;
    name: string;
    description: string;
    careNote: string;
    height: string;
    withPot: boolean;
    totalPage: number;
    showPlantShipPriceModel: {
        id: string;
        potSize: string;
        pricePerPlant: number;
    };
    showPlantPriceModel: {
        id: string;
        price: number;
        applyDate: string;
    };
    plantCategoryList: {
        categoryID: string;
        categoryName: string;
    }[];
    plantIMGList: {
        id: string;
        url: string;
    }[];
    //status
    status: PlantStatus;
    showStorePlantModel: any;
}

export type PlantStatus = 'ONSALE' | 'INACTIVE';

export enum PlantStatusMapping {
    'ONSALE' = 'Đang bán',
    'INACTIVE' = 'Ngưng bán'
}

export const plantHeightOptions = [
    {
        label: '5cm đến 30cm',
        value: '5cm đến 30cm'
    },
    {
        label: '30cm đến 50cm',
        value: '30cm đến 50cm'
    },
    {
        label: '50cm đến 80cm',
        value: '50cm đến 80cm'
    },
    {
        label: '80cm đến 1m',
        value: '80cm đến 1m'
    },
    {
        label: '1m đến 1m2',
        value: '1m đến 1m2'
    },
    {
        label: '1m2 đến 2m',
        value: '1m2 đến 2m'
    },
    {
        label: 'Trên 2m',
        value: 'Trên 2m'
    }
]