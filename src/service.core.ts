import { Observable, of } from "rxjs";
import { GlobalSettings } from "./app/global-settings";
import { environment } from "./environments/environment";
import axios from "axios";

export class CoreServices {
    constructor() {
        this.globalSettings = new GlobalSettings();
        this.globalSettings.domain = environment.domain;
        
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
            const objUser = JSON.parse(currentUser);
            this.globalSettings.userToken = objUser.token;
        }
    };

    globalSettings: GlobalSettings;

    login$(username: string, password: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/user/login`;
            let datapost = {
                username: username,
                password: password
            }
            axios.post(url, datapost).then((res) => {
                this.globalSettings.userToken = res.data.token;
                obs.next(res.data.token);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Sai tài khoản hoặc mật khẩu.'});
                obs.complete();
            })
        })
    }

    getUserInfoByToken$(strToken: string) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + '/user/getByToken';
            axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${strToken}`
                }
            }).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch((err) => {
                obs.next({error: JSON.stringify(err.response?.data) ?? 'Lỗi truy vấn người dùng.'});
                obs.complete();
            });
        })
    }

    getPlantCategories$() {
        return new Observable<any[]>(obs => {
            let url = this.globalSettings.domain + '/category';
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next([]);
                obs.complete();
            });
        })
    }

    getShipPlant$() {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + '/plantShipPrice?pageNo=0&pageSize=100&sortBy=ID&sortAsc=false';
            axios.get(url).then((res) => {
                obs.next(res.data);
                obs.complete();
            }).catch(() => {
                obs.next();
                obs.complete();
            });
        })
    }

    addImageToDatabase$(entityName: string,  entityID: string, listURL: string[]) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/image/addImage?entityName=${entityName}&entityID=${entityID}&listURL=${listURL}`;
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
            });
        })
    }

    uploadImageToFireBase$(file: any) {
        return new Observable<any>(obs => {
            let url = this.globalSettings.domain + `/image/convertFromFileToImageURL`;
            const dataPost = new FormData();
            dataPost.append('file', file);
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
            });
        })
    }

    updateStatusContract$() {
        return of()
        // return new Observable<any>(obs => {
        //     let url = this.globalSettings.domain + `/image/convertFromFileToImageURL`;
        //     const dataPost = new FormData();
        //     dataPost.append('file', file);
        //     axios.post(url, dataPost, {
        //         headers: {
        //             'Authorization': `Bearer ${this.globalSettings.userToken}`
        //         }
        //     }).then((res) => {
        //         obs.next(res.data);
        //         obs.complete();
        //     }).catch(() => {
        //         obs.next();
        //         obs.complete();
        //     });
        // })
    }
}