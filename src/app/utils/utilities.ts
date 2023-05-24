

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
}