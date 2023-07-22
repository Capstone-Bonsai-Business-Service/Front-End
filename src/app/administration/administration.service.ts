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
            axios.get(url).then((res) => {
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

    createAccount$(dataPost: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/user/register`
            axios.post(url, dataPost).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(null);
                obs.complete();
            })
        })
    }
}