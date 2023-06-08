import axios from "axios";
import { GlobalSettings } from "../global-settings";
import { Observable } from "rxjs";
import userInfo from '../../mock/userInfo.json';
import accounts from '../../mock/accounts.json';


export class adminServices {
    constructor() {
        this.globalSettings = new GlobalSettings();
    };

    globalSettings: GlobalSettings;

    login$(username: string, password: string): Observable<any> {
        return new Observable(obs => {
            let url = this.globalSettings.domain + '/api/v1/auth/login';
            let datapost = {
                username: username,
                password: password
            }
            axios.post(url, datapost).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(userInfo);
                obs.complete();
            })
        })
    }

    getAccounts$(options?: any) {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + '/api/v1/accounts';
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next(accounts);
                obs.complete();
            })
        })
    }
}