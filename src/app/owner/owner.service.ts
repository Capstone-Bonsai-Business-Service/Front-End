import axios from "axios";
import { Observable } from "rxjs";
import accounts from '../../mock/accounts.json';
import { CoreServices } from "../../service.core";
import { IUser } from "../../IApp.interface";
import { IContractDetail } from "../common/object-interfaces/contract.interface";


export class OwnerServices extends CoreServices {
    getBonsais$(options: any) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/plant/getAllPlantWithInactive?pageNo=${options.pageNo ?? 1}&pageSize=${options.pageSize ?? 10}&sortBy=ID&sortAsc=false`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getBonsai$(plantId: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/plant/${plantId}`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }

    getStores$(options: any) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getStore$(storeId: string) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store/getByID?storeID=${storeId}`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getStorePlant$(storeId: string) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store/getStorePlant/${storeId}?pageNo=0&pageSize=1000&sortBy=ID&sortAsc=false`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getMembers$(roleID: string) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/user?pageNo=0&pageSize=1000&sortBy=ID&sortTypeAsc=false`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                const result = (res.data as IUser[]).reduce((acc, cur) => {
                    if (cur.roleID === roleID) {
                        acc.push(cur);
                    }
                    return acc;
                }, [] as IUser[])
                obs.next(result);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getMemberByID$(userID: number) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/user/getByID?userID=${userID}`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }

    getService$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/service?pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getServicePacks$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/servicePack`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getAccount$(accountId: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/api/v1/accounts/${accountId}`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                let data = accounts.find(item => item.Id === accountId);
                obs.next(data);
                obs.complete();
            })
        })
    }

    createBonsai$(datapost: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/plant`
            axios.post(url, datapost, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }

    createNewCategory$(newCategory: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/category?name=${newCategory}`
            axios.post(url, null, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }

    getProvince$() {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/getAllProvince`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }

    getDistrict$(provinceID: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/getDistrictByProvinceID?provinceID=${provinceID}`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }

    createStore$(datapost: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store`
            axios.post(url, datapost, {
                'headers': {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }

    getAllContracts$() {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract/getAll?pageNo=0&pageSize=1000&sortBy=ID&sortAsc=false`
            axios.get(url, {
                'headers': {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }

    getContractDetail$(id: string) {
        return new Observable<IContractDetail[]>(obs => {
            let url = this.globalSettings.domain + `/contract/contractDetail/${id}?pageNo=0&pageSize=10&sortBy=ID&sortAsc=true`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }
}