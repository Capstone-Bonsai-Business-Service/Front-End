import axios from "axios";
import { Observable } from "rxjs";
import accounts from '../../mock/accounts.json';
import { CommonUtility } from "../utils/utilities";
import { CoreServices } from "../../service.core";

export class adminServices extends CoreServices {

    login$(username: string, password: string): Observable<any> {
        return new Observable(obs => {
            let url = this.globalSettings.domain + `/user/login`;
            let datapost = {
                username: username,
                password: password
            }
            axios.post(url, datapost).then((res) => {
                obs.next(res.data.token);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            })
        })
    }

    getUserInfoByToken$(strToken: string): Observable<any> {
        return new Observable(obs => {
            let url = this.globalSettings.domain + '/user/getByToken';
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${strToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            });
        })
    }

    getAccounts$(options: string = '') {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/user?pageNo=0&pageSize=1000&sortBy=USERNAME&sortTypeAsc=true`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                if (!CommonUtility.isNullOrEmpty(options)) {
                    const data = res.data.reduce((acc: any[], cur: any) => {
                        if (cur.roleName === options) {
                            acc.push(cur);
                        }
                        return acc;
                    }, [] as any);
                    obs.next(data);
                    obs.complete();
                } else {
                    obs.next(res.data);
                    obs.complete();
                }
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getAccount$(accountId: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/user/getByID?userID=${accountId}`
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({
                    error: err
                });
                obs.complete();
            })
        })
    }

    createAccount$(dataPost: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/user/register`
            axios.post(url, dataPost, {
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

    getStoreWithoutManager$() {
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

    addStoreEmployee$(storeID: string, employeeID: number) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/store/addStoreEmployee`
            axios.post(url, {
                storeID: storeID,
                employeeIDList: [employeeID]
            }, {
                headers: {
                    'Authorization': `Bearer ${this.globalSettings.userToken}`
                }
            }).then((_) => {
                obs.next(true);
                obs.complete();
            }).catch((err) => {
                obs.next({ error: err });
                obs.complete();
            })
        })
    }
}