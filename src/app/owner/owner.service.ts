import axios from "axios";
import { GlobalSettings } from "../global-settings";
import { Observable } from "rxjs";
import accounts from '../../mock/accounts.json';
import { environment } from "../../environments/environment";


export class OwnerServices {
    constructor() {
        this.globalSettings = new GlobalSettings();
        this.globalSettings.domain = environment.domain;
    };

    globalSettings: GlobalSettings;

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

    getBonsais$(options: any) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/plant?pageNo=${options.pageNo ?? 1}&pageSize=${options.pageSize ?? 10}&sortBy=ID&sortAsc=true`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
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

    getMembers$(options: any) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/user`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            })
        })
    }

    getService$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/service?pageNo=1&pageSize=10&sortBy=ID&sortAsc=true`
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
}