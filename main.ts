/// <reference path="./types/akamai.d.ts"/>

import { AkamaiContextProvider } from './akamaiContextProvider.js';
import { KnownUser } from './sdk/queueit-knownuserv3-sdk.js';
import { QueueITHelper, SettingException, Settings } from './queueitHelpers.js';
import { IntegrationConfigProvider } from './integrationConfigProvider.js';

// @ts-ignore
import { logger } from 'log';

const COOKIE_VARIABLE_NAME = 'PMUSER_QUEUEIT_C';
const ERROR_VARIABLE_NAME = 'PMUSER_QUEUEIT_ER';
const EXECUTED_VARIABLE_NAME = 'PMUSER_QUEUEIT_EXECUTED';
const BIG_SET_COOKIE_VALUE = 'TOO_BIG_COOKIE';
const QUEUEIT_CONNECTOR_EXECUTED_HEADER_NAME = 'x-queueit-connector';
const QUEUEIT_FAILED_HEADERNAME = 'x-queueit-failed';
const QUEUEIT_CONNECTOR_NAME = "akamai";

export async function onClientRequest(request) {
    try {
        // Set PMUSER variable to allow validation that EdgeWorker was executed
        request.setVariable(EXECUTED_VARIABLE_NAME, 'true');

        const settings = QueueITHelper.getSettingsFromPMVariables(request);
        if (isIgnored(request, settings)) {
            return;
        }

        let contextProvider = new AkamaiContextProvider(request, {
            storeCookie: function (cookieString) {
                if (cookieString.length < 800) {
                    request.setVariable(COOKIE_VARIABLE_NAME, cookieString);
                } else {
                    request.setVariable(COOKIE_VARIABLE_NAME, BIG_SET_COOKIE_VALUE);
                }
            }
        });

        if (settings.GenerateEnqueueToken) {
            contextProvider.setEnqueueTokenProvider(
                settings,
                60000,
                contextProvider.getHttpRequest().getUserHostAddress()
            );
        }

        let { queueitToken, requestUrlWithoutToken, validationResult } = await validateRequest(contextProvider, settings);

        if (validationResult.doRedirect()) {
            // Adding no cache headers to prevent browsers to cache requests
            let headers = QueueITHelper.getNoCacheHeaders();

            if (validationResult.isAjaxResult) {
                const headerName = validationResult.getAjaxQueueRedirectHeaderKey();
                // In case of ajax call send the user to the queue by sending a custom queue-it header and redirecting user to queue from javascript
                headers[headerName] = [QueueITHelper.addKUPlatformVersion(validationResult.getAjaxRedirectUrl())];
                headers['Access-Control-Expose-Headers'] = [headerName];
                request.respondWith(200, headers, "");
                return;
            } else {
                // Send the user to the queue - either because hash was missing or because is was invalid
                let headers = QueueITHelper.getNoCacheHeaders();
                headers['Location'] = [QueueITHelper.addKUPlatformVersion(validationResult.redirectUrl)];
                request.respondWith(302, headers, "");
                return;
            }
        } else {
            // Request can continue - we remove queueittoken form querystring parameter to avoid sharing of user specific token
            // Support mobile scenario adding the condition !validationResult.isAjaxResult
            if (!validationResult.isAjaxResult && queueitToken && validationResult.actionType === "Queue") {
                let headers = QueueITHelper.getNoCacheHeaders();
                headers['Location'] = [requestUrlWithoutToken];
                request.respondWith(302, headers, "");
                return;
            }
        }
    } catch (ex) {
        if (ex instanceof SettingException) {
            request.setVariable(ERROR_VARIABLE_NAME, 'request;setting:' + ex.Type);
        } else {
            request.setVariable(ERROR_VARIABLE_NAME, 'request');
        }
        /*
        if (typeof ex == 'string') {
           request.setVariable(ERROR_VARIABLE_NAME, ex);
        }
        else {
          request.setVariable(ERROR_VARIABLE_NAME, JSON.stringify(ex));
        }
        */
        logger.log('OnClientRequest Exception: %s', ex);
    }
}

export async function onClientResponse(request, response) {
    try {
        response.addHeader(QUEUEIT_CONNECTOR_EXECUTED_HEADER_NAME, QUEUEIT_CONNECTOR_NAME);

        let settings = QueueITHelper.getSettingsFromPMVariables(request);
        if (isIgnored(request, settings)) {
            return;
        }

        let cookieString = request.getVariable(COOKIE_VARIABLE_NAME);
        if (cookieString && cookieString !== BIG_SET_COOKIE_VALUE) {
            response.addHeader('Set-Cookie', cookieString);
        } else if (cookieString == BIG_SET_COOKIE_VALUE) {
            let contextProvider = new AkamaiContextProvider(request, {
                storeCookie: function (cookieString) {
                    response.addHeader('Set-Cookie', cookieString);
                }
            });
            //cookie value was big so re-evaluating to be able to set the cookie on the response
            await validateRequest(contextProvider, settings);
        }

        let error = request.getVariable(ERROR_VARIABLE_NAME);
        if (error) {
            response.addHeader(QUEUEIT_FAILED_HEADERNAME, error);
        }
    } catch (ex) {
        if (ex instanceof SettingException) {
            response.addHeader(QUEUEIT_FAILED_HEADERNAME, 'response;setting:' + ex.Type);
        } else {
            response.addHeader(QUEUEIT_FAILED_HEADERNAME, 'response');
        }
        /*
        if (typeof ex == 'string') {
           response.addHeader(QUEUEIT_FAILED_HEADERNAME, ex);
        }
        else {
           response.addHeader(QUEUEIT_FAILED_HEADERNAME, JSON.stringify(ex));
        }
        */
        logger.log('OnClientRequest Exception: %s', ex);
    }
}

function isIgnored(request, settings: Settings) {
    return request.method === 'OPTIONS' && settings.IgnoreOptionsRequests;
}

async function getQueueItToken(contextProvider: AkamaiContextProvider, requestUrl: string) {
    let queueitToken = QueueITHelper.getParameterByName(KnownUser.QueueITTokenKey, requestUrl);
    if (queueitToken) {
        return queueitToken;
    }

    const tokenHeaderName = `x-${KnownUser.QueueITTokenKey}`;
    return contextProvider.getHttpRequest().getHeader(tokenHeaderName);
}

async function validateRequest(contextProvider: AkamaiContextProvider, settings: Settings) {
    const requestUrl = contextProvider.getHttpRequest().getAbsoluteUri();
    const queueitToken = await getQueueItToken(contextProvider, requestUrl);
    let requestUrlWithoutToken = requestUrl.replace(new RegExp("([\?&])(" + KnownUser.QueueITTokenKey + "=[^&]*)", 'i'), "");
    requestUrlWithoutToken = requestUrlWithoutToken.replace(new RegExp("[?]$"), "");

    const integrationConfig = await IntegrationConfigProvider.getIntegrationConfig(
        settings.CustomerId,
        settings.IntegrationConfigType,
        settings.ApiKey);

    const validationResult = KnownUser.validateRequestByIntegrationConfig(
        requestUrl, queueitToken, integrationConfig,
        settings.CustomerId, settings.SecretKey, contextProvider);

    return { queueitToken, requestUrlWithoutToken, validationResult };
}