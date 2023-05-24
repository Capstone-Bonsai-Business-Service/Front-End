import { environment } from '../environments/environment';

export class GlobalSettings {
    production: boolean;
    version: string;
    domain: string;
    server: string;
    apiVersion: string;
    userToken: string;

    constructor(production = false, version = '', domain = '', server = '', apiVersion = '', userToken = '') {
        this.production = production;
        this.version = version;
        this.domain = domain;
        this.server = server;
        this.apiVersion = apiVersion;
        this.userToken = userToken;
    }
}

export class GlobalSettingsBuilder {
    production: boolean | undefined;
    version: string | undefined;
    domain: string | undefined;
    server: string | undefined;
    apiVersion: string | undefined;
    userToken: string | undefined;

    setProduction(value = false) {
        this.production = value;
        return this;
    }

    setVersion(value = '') {
        this.version = value;
        return this;
    }

    setDomain(value = '') {
        this.domain = value;
        return this;
    }

    setServer(value = '') {
        this.server = value;
        return this;
    }

    setApiVersion(value = '') {
        this.apiVersion = value;
        return this;
    }

    setUserToken(value = '') {
        this.userToken = value;
        return this;
    }

    build() {
        return new GlobalSettings(this.production, this.version, this.domain, this.server, this.apiVersion, this.userToken);
    }
}

export const GLOBAL_SETTINGS = new GlobalSettingsBuilder()
    .setProduction(environment.production)
    .setVersion(environment.version)
    .setDomain(environment.domain)
    .setServer(environment.server)
    .setApiVersion(environment.apiVersion)
    .setUserToken(environment.userToken)
    .build();
