import { RcFile } from "antd/es/upload";
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Observable, take } from "rxjs";

export module CommonUtility {

    export function isNullOrEmpty(data: any) {
        if (data === null || data === "" || data === undefined) {
            return true;
        }
        if (Array.isArray(data)) {
            return data.length === 0;
        }
        return false;
    }

    export function isNullOrUndefined(data: any) {
        if (data === null || data === undefined) {
            return true;
        }
        return false;
    }

    export function isEmptyObject(obj: any) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    export function isJsonString(str: any) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    export function ignoreSpaces(string: any) {
        let temp = "";
        string = '' + string;
        let splitstring = string.split(" ");
        for (let i = 0; i < splitstring.length; i++)
            temp += splitstring[i];
        return temp;
    }

    export function redirectTo(url: string): void {
        let elem = document.createElement('a');
        elem.href = url;
        elem.click();
    }

    export function getBase64(img: RcFile, callback: (url: string) => void) {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result as string));
        reader.readAsDataURL(img);
    };

    export function onTableSearch(searchValue: string, dataSource: any[], columns?: string[]) {
        if (isNullOrEmpty(columns)) {
            const dataSearch = dataSource.reduce((acc, cur) => {
                for (let property in cur) {
                    if ((cur[property].toString() as string)?.indexOf(searchValue) > -1) {
                        acc.push(cur);
                        break;
                    }
                }
                return acc;
            }, []);
            return dataSearch;
        } else {
            const dataSearch = dataSource.reduce((acc, cur) => {
                for (let column of columns as any[]) {
                    if ((cur[column]?.toString() as string)?.indexOf(searchValue) > -1) {
                        acc.push(cur);
                        break;
                    }
                }
                return acc;
            }, []);
            return dataSearch;
        }
    }

    export function exportExcel(dataSource: any[], columns: any[]) {
        const excelColumns = columns.reduce((acc, cur) => {
            if (cur.key !== 'command') {
                acc.push({ name: cur.title });
            }
            return acc;
        }, []);

        const rowsData = dataSource.reduce((acc, cur) => {
            const row = columns.reduce((acc_row, cur_row) => {
                if (cur_row.key !== 'command') {
                    acc_row.push(cur[cur_row.key] ?? '');
                }
                return acc_row;
            }, []);
            acc.push(row);
            return acc;
        }, []);

        const workbook = new Workbook();
        workbook.creator = 'System';
        workbook.lastModifiedBy = 'System';
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet('Sheet1');
        worksheet.addTable({
            name: 'TABLEData',
            ref: 'A1',
            headerRow: true,
            columns: excelColumns,
            rows: rowsData,
        });

        return saveWorkbookToFile(workbook).pipe(take(1)).subscribe({
            next: () => {
                console.log(`Exported`);
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    export function saveWorkbookToFile(workbook: Workbook, fileName = 'export-excel') {
        return new Observable((observer) => {
            workbook.xlsx.writeBuffer()
                .then((data) => {
                    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    fs.saveAs(blob, `${fileName}.xlsx`);
                    observer.next();
                    observer.complete();
                }).catch((err) => {
                    observer.error(err);
                });
        });
    }

    export function statusColorMapping(status: string) {
        switch (status) {
            case 'ONSALE': case 'APPROVED': case 'SIGN': case 'WORKING': case 'ACTIVE': case 'AVAILABLE': return 'green';
            case 'WAITING': return 'processing';
            case 'RECEIVED': case 'PACKAGING': case 'DELIVERING': return 'orange'
            case 'UNAVAILABLE': case 'INACTIVE': return 'error';
            case 'STAFFCANCELED': return 'red';
            case 'DONE': return 'purple';
            default: return 'default';
        }
    }
}