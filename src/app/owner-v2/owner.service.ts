import axios from "axios";
import { Observable } from "rxjs";
import accounts from '../../mock/accounts.json';
import { CoreServices } from "../../service.core";
import { IUser } from "../../IApp.interface";
import { IContractDetail } from "../common/object-interfaces/contract.interface";
import { StoreStatus } from "../common/object-interfaces/store.interface";


export class OwnerServices extends CoreServices {
    constructor() {
        super();
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
            const objUser = JSON.parse(currentUser);
            this.storeId = objUser.storeID;
        }
    }

    storeId: string = '';

    getBonsais$(options: any) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/plant/v2/getStorePlant?storeID=${this.storeId}&pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`;
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

    getStores$(options: any) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store`
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

    getStore$(storeId: string) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store/getByID?storeID=${storeId}`
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

    getStorePlant$(storeId: string) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store/getStorePlant/${storeId}?pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    updateCategory$(id: string, name: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/category?id=${id}&name=${name}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(true);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }

    getMembersV1$(roleID: string) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/user?pageNo=0&pageSize=100&sortBy=ID&sortTypeAsc=false`
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

    getMembersByStoreID$(storeID: string, managerID: number = -1) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store/getStoreStaff?storeID=${storeID}&pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                const member = res.data.reduce((acc: any[], cur: any) => {
                    if (managerID !== cur.id) {
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
            let url = this.globalSettings.domain + `/service/getAllServiceForOwner?pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    createService$(datapost: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/service`
            axios.post(url, datapost, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Tạo dịch vụ thất bại.'});
                obs.complete();
            })
        })
    }

    createServicePack$(range: string, unit: string, percent: number, status: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/servicePack?range=${range}&unit=${unit}&percentage=${percent}&status=${status}`
            axios.post(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Tạo gói dịch vụ thất bại.'});
                obs.complete();
            })
        })
    }

    getPlantQuantityHistory$(plantID: string) {
        return new Observable<any[]>(obs => {
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

    getServicePacks$() {
        return new Observable<any[]>(obs => {
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
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Tạo cây thất bại.'});
                obs.complete();
            })
        })
    }

    createNewCategory$(newCategory: string, status: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/category?name=${newCategory}&status=${status}`
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

    disableCategory$(id: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/plant/removeCategory?categoryID=${id}`
            axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Vô hiệu thất bại.'});
                obs.complete();
            })
        })
    }

    activeCategory$(id: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/category/v2/activateCategory?categoryID=${id}`
            axios.put(url, undefined,{
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Vô hiệu thất bại.'});
                obs.complete();
            })
        })
    }

    getProvince$() {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/getAllProvince`
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

    getDistrict$(provinceID: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/getDistrictByProvinceID?provinceID=${provinceID}`
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
            let url = this.globalSettings.domain + `/contract/getAll?pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
            axios.get(url, {
                'headers': {
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

    getAllOrders$() {
        return new Observable<IContractDetail[]>(obs => {
            let url = this.globalSettings.domain + `/order/getAll?pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    disablePlant$(plantID: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/plant/${plantID}`
            axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Huỷ bán thất bại.'});
                obs.complete();
            })
        })
    }

    activePlant$(plantID: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/plant/activatePlant?plantID=${plantID}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Thay đổi thất bại.'});
                obs.complete();
            })
        })
    }

    disableStore$(storeID: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/${storeID}`
            axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Huỷ bán thất bại.'});
                obs.complete();
            })
        })
    }

    changeStatusStore$(storeID: string, status: StoreStatus) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/changeStoreStatus?storeID=${storeID}&status=${status}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Thay đổi thất bại.'});
                obs.complete();
            })
        })
    }

    updatePlant$(data: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/plant`
            axios.put(url, data, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Chỉnh sửa thất bại.'});
                obs.complete();
            })
        })
    }

    updateStore$(data: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store`
            axios.put(url, data, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Chỉnh sửa thất bại.'});
                obs.complete();
            })
        })
    }

    addStoreEmployee$(data: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/addStoreEmployee`
            axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Thêm thất bại.'});
                obs.complete();
            })
        })
    }

    getReport$(from: string, to: string, storeId?: String) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/statistic?from=${from}&to=${to}`
            if (storeId) {
                url += `&storeID=${storeId}`;
            }
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Lấy Report Thất bại.'});
                obs.complete();
            })
        })
    }

    getReportAllStore$(from: string, to: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/statistic/getStatisticWithAllStore?from=${from}&to=${to}`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Lấy Report Thất bại.'});
                obs.complete();
            })
        })
    }

    getStoreOrderFeedbacks$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/feedback/getFeedbackOwnerManager?pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    getStoreContractFeedbacks$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/feedback/contractFeedback?pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    //#region api v2
    getRequestedContracts$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/contract/v2/getAllContractByStatus?type=REQUEST&pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    getContracts$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/contract/v2/getAllContractByStatus?type=CONTRACT&pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    getDeniedContracts$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/contract/v2/getAllContractByStatus?type=CANCEL&pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    getMembers$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/store/getStoreStaff?storeID=${this.storeId}&pageNo=0&pageSize=100&sortBy=ID&sortAsc=false`
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

    checkExistedCustomer$(phone: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/user/searchCustomer?phone=${phone}&pageNo=0&pageSize=1&sortBy=ID&sortTypeAsc=true`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Kiểm tra thất bại.' });
                obs.complete();
            })
        })
    }

    approveContract$(contractId: string, status: string, staffID: number) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract/changeContractStatus?contractID=${contractId}&status=${status}&staffID=${staffID}`
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

    rejectContract$(contractId: string, status: string, reason?: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract/changeContractStatus?contractID=${contractId}&status=${status}&reason=${reason}`;
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

    getWorkingTimesByService$(contractDetailID: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/workingDate/getWorkingDateByContractDetailID?contractDetailID=${contractDetailID}&pageNo=0&pageSize=300&sortBy=WORKINGDATE&sortAsc=false`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Kiểm tra thất bại.' });
                obs.complete();
            })
        })
    }

    changeStaffForWorkingDate$(staffId: number, workingDateId: string, note: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/workingDate/v2/updateWorkingDateStaffID?workingDateID=${workingDateId}&staffID=${staffId}&note=${note}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Thay thay đổi thất bại.' });
                obs.complete();
            })
        })
    }

    getWorkingTimesReport$(workingTimeId: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/report/v2/getByWorkingDateID?workingDateID=${workingTimeId}`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Không tìm thấy báo cáo.' });
                obs.complete();
            })
        })
    }

    activeServicePack$(servicePackID: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/servicePack/v2/updateStatus?servicePackID=${servicePackID}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Thay thay đổi thất bại.' });
                obs.complete();
            })
        })
    }

    deleteServicePack$(servicePackID: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/servicePack/${servicePackID}`
            axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Thay thay đổi thất bại.' });
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

    removeStorePlantQuantity$(storePlantID: string, quantity: number, reason: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/removeStorePlant/${storePlantID}?quantity=${quantity}&reason=${reason}`
            axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Giảm số lượng cây thất bại.' });
                obs.complete();
            })
        })
    }

    updateWorkingContracts$() {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract/checkStartDateEndDate`
            axios.get(url, {
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

    rejectOrder$(orderId: string, reason: string) {
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

    updateService$(data: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/service`
            axios.put(url, data, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Cập nhật thất bại.' });
                obs.complete();
            })
        })
    }

    updateStaffForContract$(contractId: string, staffId: number) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/contract/v2/updateContractStaff?contractID=${contractId}&staffID=${staffId}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Cập nhật thất bại.' });
                obs.complete();
            })
        })
    }

    getStoreOrders$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/order/getAllOrderByUsername?storeID=${this.storeId}&pageNo=0&pageSize=100&sortBy=ID&sortAsc=true`
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

    disableAccount$(accountID: number) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/employee/${accountID}`
            axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res);
                obs.complete();
            }).catch(err => {
                obs.next({ error: JSON.stringify(err.response?.data) ?? 'Thay đổi thất bại.' });
                obs.complete();
            })
        })
    }

    getAllServicePacks$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/servicePack/v2/getAllForOwner`
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

    disableService$(serviceId: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/service/${serviceId}`
            axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Huỷ bán thất bại.'});
                obs.complete();
            })
        })
    }

    activeService$(serviceId: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/service/v2/activeService?serviceID=${serviceId}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Thay đổi thất bại.'});
                obs.complete();
            })
        })
    }

    swapWorkingDate$(workingDateId: string, newDate: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/workingDate/v2/swapWorkingDate?workingDateID=${workingDateId}&date=${newDate}`
            axios.put(url, undefined, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Thay đổi thất bại.'});
                obs.complete();
            })
        })
    }

    checkWorkingDate$() {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/workingDate/v2/checkMissedDate`;
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Thay đổi thất bại.'});
                obs.complete();
            })
        })
    }
    //#endregion
}