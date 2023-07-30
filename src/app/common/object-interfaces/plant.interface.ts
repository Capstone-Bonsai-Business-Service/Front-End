
export interface IPlant {
    [k: string]: any;
    plantID: string;
    name: string;
    description: string;
    careNote: string;
    height: number;
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