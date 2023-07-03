
export interface IPlant {
    plantID: string;
    name: string;
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
    status: string;
}