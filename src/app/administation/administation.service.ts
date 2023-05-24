import axios from "axios";
import { GlobalSettings } from "../global-settings";
import { Observable } from "rxjs";
import userInfo from '../../mock/userInfo.json'


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
                obs.next(res);
                obs.complete();
            }).catch(() => {
                obs.next(userInfo);
                obs.complete();
            })
        })
    }
}