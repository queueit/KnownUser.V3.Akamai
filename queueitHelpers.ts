import crypto from './lib/sha256.js'

const AKAMAI_SDK_VERSION = "3.0.1";

export class QueueITHelper {

    public static addKUPlatformVersion = function (redirectQueueUrl) {
        return redirectQueueUrl + "&kupver=akamai-" + AKAMAI_SDK_VERSION;
    }

    public static configureKnownUserHashing = function (Utils) {
        Utils.generateSHA256Hash = function (secretKey, stringToHash) {
            return crypto.sha256.hmac(secretKey, stringToHash);
        };
    }

    public static getParameterByName(name, url) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return results[2].replace(/\+/g, ' ');
    }

    public static getNoCacheHeaders() {
        return {
            'Cache-Control': ['no-cache, no-store, must-revalidate'],
            'Pragma': ['no-cache'],
            'Expires': ['Fri, 01 Jan 1990 00:00:00 GMT']
        };
    }

    public static getSettingsFromPMVariables(request): Settings {
        let setting = {
            SecretKey: request.getVariable('PMUSER_QUEUEIT_SECRET_KEY'),
            ApiKey: request.getVariable('PMUSER_QUEUEIT_API_KEY'),
            CustomerId: request.getVariable('PMUSER_QUEUEIT_CUSTOMERID'),
            IntegrationConfigType: request.getVariable('PMUSER_QUEUEIT_CONFIG_TYPE')
        };

        if (!setting.CustomerId) {
            let settingException = new SettingException();
            settingException.Type = "CustomerId";
            throw settingException;
        }

        if (!setting.SecretKey) {
            let settingException = new SettingException();
            settingException.Type = "SecretKey";
            throw settingException;
        }

        if (!setting.IntegrationConfigType ||
            (setting.IntegrationConfigType.toLowerCase() != 'inline' &&
                setting.IntegrationConfigType.toLowerCase() != 'cache' &&
                setting.IntegrationConfigType.toLowerCase() != 'edgekv')) {
            let settingException = new SettingException();
            settingException.Type = "ConfigType";
            throw settingException;
        }

        return setting;
    }
}

export interface Settings {
    SecretKey: string,
    ApiKey: string,
    CustomerId: string,
    IntegrationConfigType: string
}

export class SettingException {
    Type: string;
}
