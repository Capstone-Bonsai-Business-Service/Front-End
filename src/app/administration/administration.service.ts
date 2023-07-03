import axios from "axios";
import { GlobalSettings } from "../global-settings";
import { Observable } from "rxjs";
import accounts from '../../mock/accounts.json';
import { CommonUtility } from "../utils/utilities";
import { environment } from '../../environments/environment'

export class adminServices {
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

    getAccounts$(options: string = '') {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + `/api/v1/accounts?${options}`
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                let data: any[] = [];
                if (CommonUtility.isNullOrEmpty(options)) {
                    data = accounts;
                } else {
                    const __role = options.slice(6, options.length - 1);
                    data = accounts.reduce((acc, cur) => {
                        if (cur.role === __role) {
                            acc.push(cur);
                        }
                        return acc;
                    }, [] as any);
                }
                obs.next(data);
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