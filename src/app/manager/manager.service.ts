import axios from "axios";
import { Observable } from "rxjs";
import { CoreServices } from "../../service.core";
import { IUser } from "../../IApp.interface";
import { IContractDetail } from "../common/object-interfaces/contract.interface";


export class ManagerServices extends CoreServices {
    constructor() {
        super();
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
            const objUser = JSON.parse(currentUser);
            this.storeId = objUser.storeID;
        }
    }

    storeId: string = '';

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

    getMembers$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store/getStoreStaff?storeID=${this.storeId}&pageNo=0&pageSize=1000&sortBy=ID&sortAsc=false`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                const currentUser = localStorage.getItem('user');
                const objUser = JSON.parse(currentUser as string);
                const member = res.data.reduce((acc: any[], cur: any) => {
                    if (objUser.userID !== cur.id) {
                        acc.push(cur);
                    }
                    return acc;
                }, [])
                obs.next(member);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getService$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/service?pageNo=0&pageSize=10&sortBy=ID&sortAsc=false`
            axios.get(url).then((res) => {
                obs.next(res.data);
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

    getBonsais$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store/getStorePlant/${this.storeId}?pageNo=0&pageSize=1000&sortBy=ID&sortAsc=false`
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

    getBonsai$(plantId: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/plant/${plantId}`
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

    getContracts$() {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract?storeID=${this.storeId}&pageNo=0&pageSize=1000&sortBy=ID&sortAsc=false`
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

    getStaffForContract$() {
        return new Observable<IUser[]>(obs => {
            let url = this.globalSettings.domain + `/contract/getStaffForContract`
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

    getServicePacks$() {
        return new Observable<IUser[]>(obs => {
            let url = this.globalSettings.domain + `/servicePack`
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
    
    getPlantQuantityHistory$(plantID: string) {
        return new Observable<IUser[]>(obs => {
            let url = this.globalSettings.domain + `/store/getStorePlantRecord?plantID=${plantID}&storeID=${this.storeId}&pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    createContract$(dataPost: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract/createContractManager`
            axios.post(url, dataPost, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            })
        })
    }

    approveContract$(dataPost: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract/approveContract`
            axios.put(url, dataPost, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            })
        })
    }

    approveOrder$(orderId: string, staffId: number = 0) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/order/approveOrder/${orderId}?staffID=${staffId}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            })
        })
    }

    confirmPaymentOrder$(orderID: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/order/updateIsPaid?orderID=${orderID}&isPaid=true`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            })
        })
    }

    rejectOrder$(orderId: string, reason: string ) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/order/rejectOrder?orderID=${orderId}&reason=${reason}&status=DENIED`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            })
        })
    }

    rejectContract$(contractId: string, status: string ) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract/changeContractStatus?contractID=${contractId}&status=${status}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            })
        })
    }

    cancelContract$(orderId: string, reason: string ) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract/rejectOrder?orderID=${orderId}&reason=${reason}&status=STAFFCANCEL`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            })
        })
    }

    activeContract$(listUrl: string[], contractID: string) {
        return new Observable<any>(obs => {
            const paramUrl = listUrl.join('&listURL=');
            let url = this.globalSettings.domain + `/contract/addContractIMG?contractID=${contractID}&listURL=${paramUrl}`
            axios.post(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            })
        })
    }

    getStoreOrders$() {
        return new Observable<IUser[]>(obs => {
            let url = this.globalSettings.domain + `/order/getAllOrderByUsername?storeID=${this.storeId}&pageNo=0&pageSize=1000&sortBy=ID&sortAsc=false`
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

    addStorePlantQuantity$(dataPost: any) {
        return new Observable<IUser[]>(obs => {
            let url = this.globalSettings.domain + `/store/addStorePlant`
            axios.post(url, dataPost, {
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