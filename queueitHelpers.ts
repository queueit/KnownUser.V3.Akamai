
const AKAMAI_SDK_VERSION = "3.0.7";

export class QueueITHelper {

    public static addKUPlatformVersion = function (redirectQueueUrl) {
        return redirectQueueUrl + "&kupver=akamai-" + AKAMAI_SDK_VERSION;
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
            IntegrationConfigType: request.getVariable('PMUSER_QUEUEIT_CONFIG_TYPE'),
            IgnoreOptionsRequests: request.getVariable('PMUSER_QUEUEIT_IGNORE_OPTIONS_REQUESTS'),
            GenerateEnqueueToken: request.getVariable('PMUSER_QUEUEIT_GENERATE_EQTOKEN')
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

        // convert to boolean
        setting.IgnoreOptionsRequests = setting.IgnoreOptionsRequests && setting.IgnoreOptionsRequests.toLowerCase() == 'true';
        setting.GenerateEnqueueToken = setting.GenerateEnqueueToken && setting.GenerateEnqueueToken.toLowerCase() == 'true';

        return setting;
    }

    // Based on REF 4122 section 4.4 http://www.ietf.org/rfc/rfc4122.txt
    public static generateUUID(): string {
        const s = [];
        const hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        return s.join("");
    }
}

export interface Settings {
    SecretKey: string,
    ApiKey: string,
    CustomerId: string,
    IntegrationConfigType: string,
    IgnoreOptionsRequests: boolean,
    GenerateEnqueueToken: boolean
}

export class SettingException {
    Type: string;
}
