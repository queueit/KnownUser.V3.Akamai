/// <reference path="./types/akamai.d.ts"/>
import { AkamaiHttpContextProvider } from './akamaiHttpContextProvider.js';
import integrationConfig from './integrationConfigProvider.js';
import { KnownUser, Utils } from './sdk/queueitknownuser.bundle.js';
import { QueueITHelper } from './queueitHelpers.js';
const COOKIE_VARIABLE_NAME = 'PMUSER_Q_C';
const HAS_ERROR_VARIABLE_NAME = 'PMUSER_Q_ER';
const BIG_SET_COOKIE_VALUE = 'TOOBIGCOOKIE';
const QUEUEIT_FAILED_HEADERNAME = 'x-queueit-failed';
const CustomerId = "";
const SecretKey = "";
export function onClientRequest(request) {
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
        let { queueitToken, requestUrlWithoutToken, validationResult } = validateRequest(httpContext);
        if (validationResult.doRedirect()) {
            // Adding no cache headers to prevent browsers to cache requests
            let headers = getNoCacheHeaders();
            if (validationResult.isAjaxResult) {
                var headerName = validationResult.getAjaxQueueRedirectHeaderKey();
                // In case of ajax call send the user to the queue by sending a custom queue-it header and redirecting user to queue from javascript
                headers[headerName] = [QueueITHelper.addKUPlatformVersion(validationResult.getAjaxRedirectUrl())];
                request.respondWith(200, headers, "");
                return;
            }
            else {
                // Send the user to the queue - either because hash was missing or because is was invalid
                let headers = getNoCacheHeaders();
                headers['Location'] = [QueueITHelper.addKUPlatformVersion(validationResult.redirectUrl)];
                request.respondWith(302, headers, "");
                return;
            }
        }
        else {
            // Request can continue - we remove queueittoken form querystring parameter to avoid sharing of user specific token
            // Support mobile scenario adding the condition !validationResult.isAjaxResult 
            if (!validationResult.isAjaxResult && queueitToken && validationResult.actionType === "Queue") {
                let headers = getNoCacheHeaders();
                headers['Location'] = [requestUrlWithoutToken];
                request.respondWith(302, headers, "");
                return;
            }
        }
    }
    catch (ex) {
        request.setVariable(HAS_ERROR_VARIABLE_NAME, 'error');
    }
}
function getNoCacheHeaders() {
    return {
        'Cache-Control': ['no-cache, no-store, must-revalidate'],
        'Pragma': ['no-cache'],
        'Expires': ['Fri, 01 Jan 1990 00:00:00 GMT']
    };
}
export function onClientResponse(request, response) {
    try {
        response.addHeader('x-queueit-connector', 'akamai');
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
            validateRequest(httpContext);
        }
        if (request.getVariable(HAS_ERROR_VARIABLE_NAME)) {
            response.addHeader(QUEUEIT_FAILED_HEADERNAME, 'true');
        }
    }
    catch (ex) {
        response.addHeader(QUEUEIT_FAILED_HEADERNAME, 'true');
        //throw ex;
    }
}
function validateRequest(httpContext) {
    var requestUrl = httpContext.getHttpRequest().getAbsoluteUri();
    let queueitToken = getParameterByName(KnownUser.QueueITTokenKey, requestUrl);
    var requestUrlWithoutToken = requestUrl.replace(new RegExp("([\?&])(" + KnownUser.QueueITTokenKey + "=[^&]*)", 'i'), "");
    requestUrlWithoutToken = requestUrlWithoutToken.replace(new RegExp("[?]$"), "");
    let validationResult = KnownUser.validateRequestByIntegrationConfig(requestUrl, queueitToken, integrationConfig, CustomerId, SecretKey, httpContext);
    return { queueitToken, requestUrlWithoutToken, validationResult };
}
function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return results[2].replace(/\+/g, ' ');
}
