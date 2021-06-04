/// <reference path="types/akamai.d.ts"/>
import { Cookies } from 'cookies';
export class AkamaiHttpContextProvider {
    constructor(akamiNativeRequest, akamaiNativeResponse) {
        this._httpRequest = new AkamaiHttpRequest(akamiNativeRequest);
        this._httpResponse = new AkamaiHttpResponse(akamaiNativeResponse);
    }
    getHttpRequest() {
        return this._httpRequest;
    }
    getHttpResponse() {
        return this._httpResponse;
    }
}
class AkamaiHttpRequest {
    constructor(_akamiNativeRequest) {
        this._akamiNativeRequest = _akamiNativeRequest;
    }
    getUserAgent() {
        return this.getHeader("user-agent");
    }
    getHeader(headerNameArg) {
        return (this._akamiNativeRequest.getHeader(headerNameArg) || []).toString();
    }
    getAbsoluteUri() {
        return `${this._akamiNativeRequest.scheme}://${this._akamiNativeRequest.host}${this._akamiNativeRequest.url}`;
    }
    getUserHostAddress() {
        return this._akamiNativeRequest.getVariable('PMUSER_TRUE_CLIENT_IP');
    }
    getCookieValue(cookieKey) {
        try {
            let cookies = new Cookies(this._akamiNativeRequest.getHeader('Cookie'));
            let cookieValue = cookies.get(cookieKey);
            if (cookieValue)
                return decodeURIComponent(cookieValue);
        }
        catch (_a) {
            return undefined;
        }
    }
    getRequestBodyAsString() {
        return "";
    }
}
class AkamaiHttpResponse {
    constructor(_akamiNativeRequest) {
        this._akamiNativeRequest = _akamiNativeRequest;
    }
    setCookie(cookieName, cookieValue, domain, expiration) {
        // expiration is in secs, but Date needs it in milisecs
        let expirationDate = new Date(expiration * 1000);
        var setCookieString = `${cookieName}=${encodeURIComponent(cookieValue)}; expires=${expirationDate.toUTCString()};`;
        if (domain) {
            setCookieString += ` domain=${domain};`;
        }
        setCookieString += " path=/";
        this._akamiNativeRequest.storeCookie(setCookieString);
    }
}
