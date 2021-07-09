/// <reference path="./types/akamai.d.ts"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AkamaiHttpContextProvider } from './akamaiHttpContextProvider.js';
import { KnownUser, Utils } from './sdk/queueitknownuser.bundle.js';
import { QueueITHelper, SettingException } from './queueitHelpers.js';
import { IntegrationConfigProvider } from './integrationConfigProvider.js';
// @ts-ignore
import { logger } from 'log';
const COOKIE_VARIABLE_NAME = 'PMUSER_QUEUEIT_C';
const ERROR_VARIABLE_NAME = 'PMUSER_QUEUEIT_ER';
const BIG_SET_COOKIE_VALUE = 'TOO_BIG_COOKIE';
const QUEUEIT_CONNECTOR_EXECUTED_HEADERNAMRE = 'x-queueit-connector';
const QUEUEIT_FAILED_HEADERNAME = 'x-queueit-failed';
export function onClientRequest(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            QueueITHelper.configureKnownUserHashing(Utils);
            let httpContext = new AkamaiHttpContextProvider(request, {
                storeCookie: function (cookieString) {
                    if (cookieString.length < 800) {
                        request.setVariable(COOKIE_VARIABLE_NAME, cookieString);
                    }
                    else {
                        request.setVariable(COOKIE_VARIABLE_NAME, BIG_SET_COOKIE_VALUE);
                    }
                }
            });
            let settings = QueueITHelper.getSettingsFromPMVariables(request);
            let { queueitToken, requestUrlWithoutToken, validationResult } = yield validateRequest(httpContext, settings);
            if (validationResult.doRedirect()) {
                // Adding no cache headers to prevent browsers to cache requests
                let headers = QueueITHelper.getNoCacheHeaders();
                if (validationResult.isAjaxResult) {
                    var headerName = validationResult.getAjaxQueueRedirectHeaderKey();
                    // In case of ajax call send the user to the queue by sending a custom queue-it header and redirecting user to queue from javascript
                    headers[headerName] = [QueueITHelper.addKUPlatformVersion(validationResult.getAjaxRedirectUrl())];
                    request.respondWith(200, headers, "");
                    return;
                }
                else {
                    // Send the user to the queue - either because hash was missing or because is was invalid
                    let headers = QueueITHelper.getNoCacheHeaders();
                    headers['Location'] = [QueueITHelper.addKUPlatformVersion(validationResult.redirectUrl)];
                    request.respondWith(302, headers, "");
                    return;
                }
            }
            else {
                // Request can continue - we remove queueittoken form querystring parameter to avoid sharing of user specific token
                // Support mobile scenario adding the condition !validationResult.isAjaxResult 
                if (!validationResult.isAjaxResult && queueitToken && validationResult.actionType === "Queue") {
                    let headers = QueueITHelper.getNoCacheHeaders();
                    headers['Location'] = [requestUrlWithoutToken];
                    request.respondWith(302, headers, "");
                    return;
                }
            }
        }
        catch (ex) {
            if (ex instanceof SettingException) {
                request.setVariable(ERROR_VARIABLE_NAME, 'request;setting:' + ex.Type);
            }
            else {
                request.setVariable(ERROR_VARIABLE_NAME, 'request');
            }
            logger.log('OnClientRequest Exception: %s', ex);
        }
    });
}
export function onClientResponse(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            response.addHeader(QUEUEIT_CONNECTOR_EXECUTED_HEADERNAMRE, 'akamai');
            let cookieString = request.getVariable(COOKIE_VARIABLE_NAME);
            if (cookieString && cookieString !== BIG_SET_COOKIE_VALUE) {
                response.addHeader('Set-Cookie', cookieString);
            }
            else if (cookieString == BIG_SET_COOKIE_VALUE) {
                let httpContext = new AkamaiHttpContextProvider(request, {
                    storeCookie: function (cookieString) {
                        response.addHeader('Set-Cookie', cookieString);
                    }
                });
                //cookie value was big so re-evaluating to be able to set the cookie on the response
                let settings = QueueITHelper.getSettingsFromPMVariables(request);
                yield validateRequest(httpContext, settings);
            }
            let error = request.getVariable(ERROR_VARIABLE_NAME);
            if (request.getVariable(ERROR_VARIABLE_NAME)) {
                response.addHeader(QUEUEIT_FAILED_HEADERNAME, error);
            }
        }
        catch (ex) {
            if (ex instanceof SettingException) {
                response.addHeader(QUEUEIT_FAILED_HEADERNAME, 'response;setting:' + ex.Type);
            }
            else {
                response.addHeader(QUEUEIT_FAILED_HEADERNAME, 'response');
            }
            logger.log('OnClientRequest Exception: %s', ex);
        }
    });
}
function validateRequest(httpContext, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        var requestUrl = httpContext.getHttpRequest().getAbsoluteUri();
        let queueitToken = QueueITHelper.getParameterByName(KnownUser.QueueITTokenKey, requestUrl);
        var requestUrlWithoutToken = requestUrl.replace(new RegExp("([\?&])(" + KnownUser.QueueITTokenKey + "=[^&]*)", 'i'), "");
        requestUrlWithoutToken = requestUrlWithoutToken.replace(new RegExp("[?]$"), "");
        let integrationConfig = yield IntegrationConfigProvider.getIntegrationConfig(settings.IntegrationConfigType, settings.ApiKey);
        ;
        let validationResult = KnownUser.validateRequestByIntegrationConfig(requestUrl, queueitToken, integrationConfig, settings.CustomerId, settings.SecretKey, httpContext);
        return { queueitToken, requestUrlWithoutToken, validationResult };
    });
}
