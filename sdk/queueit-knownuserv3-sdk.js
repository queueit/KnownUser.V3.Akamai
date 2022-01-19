(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],2:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComparisonOperatorHelper = exports.HttpHeaderValidatorHelper = exports.RequestBodyValidatorHelper = exports.UserAgentValidatorHelper = exports.CookieValidatorHelper = exports.UrlValidatorHelper = exports.IntegrationEvaluator = void 0;
var IntegrationModels = __importStar(require("./IntegrationConfigModel"));
var Models_1 = require("../Models");
var IntegrationEvaluator = /** @class */ (function () {
    function IntegrationEvaluator() {
    }
    IntegrationEvaluator.prototype.getMatchedIntegrationConfig = function (customerIntegration, currentPageUrl, request) {
        if (!request)
            throw new Models_1.KnownUserException("request is null");
        if (!customerIntegration)
            throw new Models_1.KnownUserException("customerIntegration is null");
        for (var _i = 0, _a = customerIntegration.Integrations || []; _i < _a.length; _i++) {
            var integration = _a[_i];
            for (var _b = 0, _c = integration.Triggers; _b < _c.length; _b++) {
                var trigger = _c[_b];
                if (this.evaluateTrigger(trigger, currentPageUrl, request)) {
                    return integration;
                }
            }
        }
        return null;
    };
    IntegrationEvaluator.prototype.evaluateTrigger = function (trigger, currentPageUrl, request) {
        var part;
        if (trigger.LogicalOperator === IntegrationModels.LogicalOperatorType.Or) {
            for (var _i = 0, _a = trigger.TriggerParts; _i < _a.length; _i++) {
                part = _a[_i];
                if (this.evaluateTriggerPart(part, currentPageUrl, request))
                    return true;
            }
            return false;
        }
        else {
            for (var _b = 0, _c = trigger.TriggerParts; _b < _c.length; _b++) {
                part = _c[_b];
                if (!this.evaluateTriggerPart(part, currentPageUrl, request))
                    return false;
            }
            return true;
        }
    };
    IntegrationEvaluator.prototype.evaluateTriggerPart = function (triggerPart, currentPageUrl, request) {
        switch (triggerPart.ValidatorType) {
            case IntegrationModels.ValidatorType.UrlValidator:
                return UrlValidatorHelper.evaluate(triggerPart, currentPageUrl);
            case IntegrationModels.ValidatorType.CookieValidator:
                return CookieValidatorHelper.evaluate(triggerPart, request);
            case IntegrationModels.ValidatorType.UserAgentValidator:
                return UserAgentValidatorHelper.evaluate(triggerPart, request.getUserAgent());
            case IntegrationModels.ValidatorType.HttpHeaderValidator:
                return HttpHeaderValidatorHelper.evaluate(triggerPart, request.getHeader(triggerPart.HttpHeaderName));
            case IntegrationModels.ValidatorType.RequestBodyValidator:
                return RequestBodyValidatorHelper.evaluate(triggerPart, request.getRequestBodyAsString());
            default:
                return false;
        }
    };
    return IntegrationEvaluator;
}());
exports.IntegrationEvaluator = IntegrationEvaluator;
var UrlValidatorHelper = /** @class */ (function () {
    function UrlValidatorHelper() {
    }
    UrlValidatorHelper.evaluate = function (triggerPart, url) {
        return ComparisonOperatorHelper.evaluate(triggerPart.Operator, triggerPart.IsNegative, triggerPart.IsIgnoreCase, this.getUrlPart(triggerPart, url), triggerPart.ValueToCompare, triggerPart.ValuesToCompare);
    };
    UrlValidatorHelper.getUrlPart = function (triggerPart, url) {
        switch (triggerPart.UrlPart) {
            case IntegrationModels.UrlPartType.PagePath:
                return this.getPathFromUrl(url);
            case IntegrationModels.UrlPartType.PageUrl:
                return url;
            case IntegrationModels.UrlPartType.HostName:
                return this.getHostNameFromUrl(url);
            default:
                return "";
        }
    };
    UrlValidatorHelper.getHostNameFromUrl = function (url) {
        var urlMatcher = /^(([^:/\?#]+):)?(\/\/([^/\?#]*))?([^\?#]*)(\?([^#]*))?(#(.*))?/;
        var match = urlMatcher.exec(url);
        if (match && match[4])
            return match[4];
        return "";
    };
    UrlValidatorHelper.getPathFromUrl = function (url) {
        var urlMatcher = /^(([^:/\?#]+):)?(\/\/([^/\?#]*))?([^\?#]*)(\?([^#]*))?(#(.*))?/;
        var match = urlMatcher.exec(url);
        if (match && match[5])
            return match[5];
        return "";
    };
    return UrlValidatorHelper;
}());
exports.UrlValidatorHelper = UrlValidatorHelper;
var CookieValidatorHelper = /** @class */ (function () {
    function CookieValidatorHelper() {
    }
    CookieValidatorHelper.evaluate = function (triggerPart, request) {
        return ComparisonOperatorHelper.evaluate(triggerPart.Operator, triggerPart.IsNegative, triggerPart.IsIgnoreCase, this.getCookie(triggerPart.CookieName, request), triggerPart.ValueToCompare, triggerPart.ValuesToCompare);
    };
    CookieValidatorHelper.getCookie = function (cookieName, request) {
        var cookie = request.getCookieValue(cookieName);
        if (!cookie)
            return "";
        return cookie;
    };
    return CookieValidatorHelper;
}());
exports.CookieValidatorHelper = CookieValidatorHelper;
var UserAgentValidatorHelper = /** @class */ (function () {
    function UserAgentValidatorHelper() {
    }
    UserAgentValidatorHelper.evaluate = function (triggerPart, userAgent) {
        return ComparisonOperatorHelper.evaluate(triggerPart.Operator, triggerPart.IsNegative, triggerPart.IsIgnoreCase, userAgent, triggerPart.ValueToCompare, triggerPart.ValuesToCompare);
    };
    return UserAgentValidatorHelper;
}());
exports.UserAgentValidatorHelper = UserAgentValidatorHelper;
var RequestBodyValidatorHelper = /** @class */ (function () {
    function RequestBodyValidatorHelper() {
    }
    RequestBodyValidatorHelper.evaluate = function (triggerPart, bodyString) {
        return ComparisonOperatorHelper.evaluate(triggerPart.Operator, triggerPart.IsNegative, triggerPart.IsIgnoreCase, bodyString, triggerPart.ValueToCompare, triggerPart.ValuesToCompare);
    };
    return RequestBodyValidatorHelper;
}());
exports.RequestBodyValidatorHelper = RequestBodyValidatorHelper;
var HttpHeaderValidatorHelper = /** @class */ (function () {
    function HttpHeaderValidatorHelper() {
    }
    HttpHeaderValidatorHelper.evaluate = function (triggerPart, headerValue) {
        return ComparisonOperatorHelper.evaluate(triggerPart.Operator, triggerPart.IsNegative, triggerPart.IsIgnoreCase, headerValue, triggerPart.ValueToCompare, triggerPart.ValuesToCompare);
    };
    return HttpHeaderValidatorHelper;
}());
exports.HttpHeaderValidatorHelper = HttpHeaderValidatorHelper;
var ComparisonOperatorHelper = /** @class */ (function () {
    function ComparisonOperatorHelper() {
    }
    ComparisonOperatorHelper.evaluate = function (opt, isNegative, isIgnoreCase, value, valueToCompare, valuesToCompare) {
        value = value || "";
        valueToCompare = valueToCompare || "";
        valuesToCompare = valuesToCompare || [];
        switch (opt) {
            case IntegrationModels.ComparisonOperatorType.EqualS:
                return ComparisonOperatorHelper.equalS(value, valueToCompare, isNegative, isIgnoreCase);
            case IntegrationModels.ComparisonOperatorType.Contains:
                return ComparisonOperatorHelper.contains(value, valueToCompare, isNegative, isIgnoreCase);
            case IntegrationModels.ComparisonOperatorType.EqualsAny:
                return ComparisonOperatorHelper.equalsAny(value, valuesToCompare, isNegative, isIgnoreCase);
            case IntegrationModels.ComparisonOperatorType.ContainsAny:
                return ComparisonOperatorHelper.containsAny(value, valuesToCompare, isNegative, isIgnoreCase);
            default:
                return false;
        }
    };
    ComparisonOperatorHelper.contains = function (value, valueToCompare, isNegative, ignoreCase) {
        if (valueToCompare === "*" && value)
            return true;
        var evaluation = false;
        if (ignoreCase)
            evaluation = value.toUpperCase().indexOf(valueToCompare.toUpperCase()) !== -1;
        else
            evaluation = value.indexOf(valueToCompare) !== -1;
        if (isNegative)
            return !evaluation;
        else
            return evaluation;
    };
    ComparisonOperatorHelper.equalS = function (value, valueToCompare, isNegative, ignoreCase) {
        var evaluation = false;
        if (ignoreCase)
            evaluation = value.toUpperCase() === valueToCompare.toUpperCase();
        else
            evaluation = value === valueToCompare;
        if (isNegative)
            return !evaluation;
        else
            return evaluation;
    };
    ComparisonOperatorHelper.equalsAny = function (value, valuesToCompare, isNegative, isIgnoreCase) {
        for (var _i = 0, valuesToCompare_1 = valuesToCompare; _i < valuesToCompare_1.length; _i++) {
            var valueToCompare = valuesToCompare_1[_i];
            if (ComparisonOperatorHelper.equalS(value, valueToCompare, false, isIgnoreCase))
                return !isNegative;
        }
        return isNegative;
    };
    ComparisonOperatorHelper.containsAny = function (value, valuesToCompare, isNegative, isIgnoreCase) {
        for (var _i = 0, valuesToCompare_2 = valuesToCompare; _i < valuesToCompare_2.length; _i++) {
            var valueToCompare = valuesToCompare_2[_i];
            if (ComparisonOperatorHelper.contains(value, valueToCompare, false, isIgnoreCase))
                return !isNegative;
        }
        return isNegative;
    };
    return ComparisonOperatorHelper;
}());
exports.ComparisonOperatorHelper = ComparisonOperatorHelper;

},{"../Models":5,"./IntegrationConfigModel":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionType = exports.LogicalOperatorType = exports.ComparisonOperatorType = exports.UrlPartType = exports.ValidatorType = exports.TriggerModel = exports.TriggerPart = exports.CustomerIntegration = exports.IntegrationConfigModel = void 0;
var IntegrationConfigModel = /** @class */ (function () {
    function IntegrationConfigModel() {
    }
    return IntegrationConfigModel;
}());
exports.IntegrationConfigModel = IntegrationConfigModel;
var CustomerIntegration = /** @class */ (function () {
    function CustomerIntegration() {
        this.Integrations = new Array();
        this.Version = -1;
    }
    return CustomerIntegration;
}());
exports.CustomerIntegration = CustomerIntegration;
var TriggerPart = /** @class */ (function () {
    function TriggerPart() {
    }
    return TriggerPart;
}());
exports.TriggerPart = TriggerPart;
var TriggerModel = /** @class */ (function () {
    function TriggerModel() {
        this.TriggerParts = new Array();
    }
    return TriggerModel;
}());
exports.TriggerModel = TriggerModel;
var ValidatorType = /** @class */ (function () {
    function ValidatorType() {
    }
    ValidatorType.UrlValidator = "UrlValidator";
    ValidatorType.CookieValidator = "CookieValidator";
    ValidatorType.UserAgentValidator = "UserAgentValidator";
    ValidatorType.HttpHeaderValidator = "HttpHeaderValidator";
    ValidatorType.RequestBodyValidator = "RequestBodyValidator";
    return ValidatorType;
}());
exports.ValidatorType = ValidatorType;
var UrlPartType = /** @class */ (function () {
    function UrlPartType() {
    }
    UrlPartType.HostName = "HostName";
    UrlPartType.PagePath = "PagePath";
    UrlPartType.PageUrl = "PageUrl";
    return UrlPartType;
}());
exports.UrlPartType = UrlPartType;
var ComparisonOperatorType = /** @class */ (function () {
    function ComparisonOperatorType() {
    }
    ComparisonOperatorType.EqualS = "Equals";
    ComparisonOperatorType.Contains = "Contains";
    ComparisonOperatorType.EqualsAny = "EqualsAny";
    ComparisonOperatorType.ContainsAny = "ContainsAny";
    return ComparisonOperatorType;
}());
exports.ComparisonOperatorType = ComparisonOperatorType;
var LogicalOperatorType = /** @class */ (function () {
    function LogicalOperatorType() {
    }
    LogicalOperatorType.Or = "Or";
    LogicalOperatorType.And = "And";
    return LogicalOperatorType;
}());
exports.LogicalOperatorType = LogicalOperatorType;
var ActionType = /** @class */ (function () {
    function ActionType() {
    }
    ActionType.IgnoreAction = "Ignore";
    ActionType.CancelAction = "Cancel";
    ActionType.QueueAction = "Queue";
    return ActionType;
}());
exports.ActionType = ActionType;

},{}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownUser = void 0;
var UserInQueueService_1 = require("./UserInQueueService");
var UserInQueueStateCookieRepository_1 = require("./UserInQueueStateCookieRepository");
var Models_1 = require("./Models");
var QueueITHelpers_1 = require("./QueueITHelpers");
var IntegrationConfigHelpers = __importStar(require("./IntegrationConfig/IntegrationConfigHelpers"));
var KnownUser = /** @class */ (function () {
    function KnownUser() {
    }
    KnownUser.getUserInQueueService = function (contextProvider) {
        if (!this.UserInQueueService) {
            return new UserInQueueService_1.UserInQueueService(contextProvider, new UserInQueueStateCookieRepository_1.UserInQueueStateCookieRepository(contextProvider));
        }
        return this.UserInQueueService;
    };
    KnownUser.isQueueAjaxCall = function (contextProvider) {
        return !!contextProvider.getHttpRequest().getHeader(this.QueueITAjaxHeaderKey);
    };
    KnownUser.generateTargetUrl = function (originalTargetUrl, contextProvider) {
        return !this.isQueueAjaxCall(contextProvider) ?
            originalTargetUrl :
            QueueITHelpers_1.Utils.decodeUrl(contextProvider.getHttpRequest().getHeader(this.QueueITAjaxHeaderKey));
    };
    KnownUser.logExtraRequestDetails = function (debugEntries, contextProvider) {
        debugEntries["ServerUtcTime"] = (new Date()).toISOString().split('.')[0] + "Z";
        debugEntries["RequestIP"] = contextProvider.getHttpRequest().getUserHostAddress();
        debugEntries["RequestHttpHeader_Via"] = contextProvider.getHttpRequest().getHeader("Via");
        debugEntries["RequestHttpHeader_Forwarded"] = contextProvider.getHttpRequest().getHeader("Forwarded");
        debugEntries["RequestHttpHeader_XForwardedFor"] = contextProvider.getHttpRequest().getHeader("X-Forwarded-For");
        debugEntries["RequestHttpHeader_XForwardedHost"] = contextProvider.getHttpRequest().getHeader("X-Forwarded-Host");
        debugEntries["RequestHttpHeader_XForwardedProto"] = contextProvider.getHttpRequest().getHeader("X-Forwarded-Proto");
    };
    KnownUser.setDebugCookie = function (debugEntries, contextProvider) {
        var cookieValue = "";
        for (var key in debugEntries) {
            cookieValue += key + "=" + debugEntries[key] + "|";
        }
        if (cookieValue.lastIndexOf("|") === cookieValue.length - 1) {
            cookieValue = cookieValue.substring(0, cookieValue.length - 1);
        }
        if (!cookieValue)
            return;
        contextProvider.getHttpResponse().setCookie(this.QueueITDebugKey, cookieValue, null, QueueITHelpers_1.Utils.getCurrentTime() + 20 * 60, // now + 20 mins
        false, false);
    };
    KnownUser._resolveQueueRequestByLocalConfig = function (targetUrl, queueitToken, queueConfig, customerId, secretKey, contextProvider, debugEntries, isDebug) {
        if (isDebug) {
            debugEntries["SdkVersion"] = UserInQueueService_1.UserInQueueService.SDK_VERSION;
            debugEntries["TargetUrl"] = targetUrl;
            debugEntries["QueueitToken"] = queueitToken;
            debugEntries["OriginalUrl"] = contextProvider.getHttpRequest().getAbsoluteUri();
            debugEntries["QueueConfig"] = queueConfig !== null ? queueConfig.getString() : "NULL";
            this.logExtraRequestDetails(debugEntries, contextProvider);
        }
        if (!customerId)
            throw new Models_1.KnownUserException("customerId can not be null or empty.");
        if (!secretKey)
            throw new Models_1.KnownUserException("secretKey can not be null or empty.");
        if (!queueConfig)
            throw new Models_1.KnownUserException("queueConfig can not be null.");
        if (!queueConfig.eventId)
            throw new Models_1.KnownUserException("queueConfig.eventId can not be null or empty.");
        if (!queueConfig.queueDomain)
            throw new Models_1.KnownUserException("queueConfig.queueDomain can not be null or empty.");
        if (queueConfig.cookieValidityMinute <= 0)
            throw new Models_1.KnownUserException("queueConfig.cookieValidityMinute should be integer greater than 0.");
        var userInQueueService = this.getUserInQueueService(contextProvider);
        var result = userInQueueService.validateQueueRequest(targetUrl, queueitToken, queueConfig, customerId, secretKey);
        result.isAjaxResult = this.isQueueAjaxCall(contextProvider);
        return result;
    };
    KnownUser._cancelRequestByLocalConfig = function (targetUrl, queueitToken, cancelConfig, customerId, secretKey, contextProvider, debugEntries, isDebug) {
        targetUrl = this.generateTargetUrl(targetUrl, contextProvider);
        if (isDebug) {
            debugEntries["SdkVersion"] = UserInQueueService_1.UserInQueueService.SDK_VERSION;
            debugEntries["TargetUrl"] = targetUrl;
            debugEntries["QueueitToken"] = queueitToken;
            debugEntries["CancelConfig"] = cancelConfig !== null ? cancelConfig.getString() : "NULL";
            debugEntries["OriginalUrl"] = contextProvider.getHttpRequest().getAbsoluteUri();
            this.logExtraRequestDetails(debugEntries, contextProvider);
        }
        if (!targetUrl)
            throw new Models_1.KnownUserException("targetUrl can not be null or empty.");
        if (!customerId)
            throw new Models_1.KnownUserException("customerId can not be null or empty.");
        if (!secretKey)
            throw new Models_1.KnownUserException("secretKey can not be null or empty.");
        if (!cancelConfig)
            throw new Models_1.KnownUserException("cancelConfig can not be null.");
        if (!cancelConfig.eventId)
            throw new Models_1.KnownUserException("cancelConfig.eventId can not be null or empty.");
        if (!cancelConfig.queueDomain)
            throw new Models_1.KnownUserException("cancelConfig.queueDomain can not be null or empty.");
        var userInQueueService = this.getUserInQueueService(contextProvider);
        var result = userInQueueService.validateCancelRequest(targetUrl, cancelConfig, customerId, secretKey);
        result.isAjaxResult = this.isQueueAjaxCall(contextProvider);
        return result;
    };
    KnownUser.handleQueueAction = function (currentUrlWithoutQueueITToken, queueitToken, customerIntegrationInfo, customerId, secretKey, matchedConfig, contextProvider, debugEntries, isDebug) {
        var targetUrl;
        switch (matchedConfig.RedirectLogic) {
            case "ForcedTargetUrl":
                targetUrl = matchedConfig.ForcedTargetUrl;
                break;
            case "EventTargetUrl":
                targetUrl = "";
                break;
            default:
                targetUrl = this.generateTargetUrl(currentUrlWithoutQueueITToken, contextProvider);
                break;
        }
        var queueEventConfig = new Models_1.QueueEventConfig(matchedConfig.EventId, matchedConfig.LayoutName, matchedConfig.Culture, matchedConfig.QueueDomain, matchedConfig.ExtendCookieValidity, matchedConfig.CookieValidityMinute, matchedConfig.CookieDomain, matchedConfig.IsCookieHttpOnly || false, matchedConfig.IsCookieSecure || false, customerIntegrationInfo.Version, matchedConfig.Name);
        return this._resolveQueueRequestByLocalConfig(targetUrl, queueitToken, queueEventConfig, customerId, secretKey, contextProvider, debugEntries, isDebug);
    };
    KnownUser.handleCancelAction = function (currentUrlWithoutQueueITToken, queueitToken, customerIntegrationInfo, customerId, secretKey, matchedConfig, contextProvider, debugEntries, isDebug) {
        var cancelEventConfig = new Models_1.CancelEventConfig(matchedConfig.EventId, matchedConfig.QueueDomain, matchedConfig.CookieDomain, matchedConfig.IsCookieHttpOnly || false, matchedConfig.IsCookieSecure || false, customerIntegrationInfo.Version, matchedConfig.Name);
        var targetUrl = this.generateTargetUrl(currentUrlWithoutQueueITToken, contextProvider);
        return this._cancelRequestByLocalConfig(targetUrl, queueitToken, cancelEventConfig, customerId, secretKey, contextProvider, debugEntries, isDebug);
    };
    KnownUser.handleIgnoreAction = function (contextProvider, actionName) {
        var userInQueueService = this.getUserInQueueService(contextProvider);
        var result = userInQueueService.getIgnoreResult(actionName);
        result.isAjaxResult = this.isQueueAjaxCall(contextProvider);
        return result;
    };
    KnownUser.extendQueueCookie = function (eventId, cookieValidityMinute, cookieDomain, isCookieHttpOnly, isCookieSecure, secretKey, contextProvider) {
        if (!eventId)
            throw new Models_1.KnownUserException("eventId can not be null or empty.");
        if (!secretKey)
            throw new Models_1.KnownUserException("secretKey can not be null or empty.");
        if (cookieValidityMinute <= 0)
            throw new Models_1.KnownUserException("cookieValidityMinute should be integer greater than 0.");
        var userInQueueService = this.getUserInQueueService(contextProvider);
        userInQueueService.extendQueueCookie(eventId, cookieValidityMinute, cookieDomain, isCookieHttpOnly, isCookieSecure, secretKey);
    };
    KnownUser.resolveQueueRequestByLocalConfig = function (targetUrl, queueitToken, queueConfig, customerId, secretKey, contextProvider) {
        var debugEntries = {};
        var connectorDiagnostics = QueueITHelpers_1.ConnectorDiagnostics.verify(customerId, secretKey, queueitToken, contextProvider);
        if (connectorDiagnostics.hasError)
            return connectorDiagnostics.validationResult;
        try {
            targetUrl = this.generateTargetUrl(targetUrl, contextProvider);
            return this._resolveQueueRequestByLocalConfig(targetUrl, queueitToken, queueConfig, customerId, secretKey, contextProvider, debugEntries, connectorDiagnostics.isEnabled);
        }
        catch (e) {
            if (connectorDiagnostics.isEnabled)
                debugEntries["Exception"] = e.message;
            throw e;
        }
        finally {
            this.setDebugCookie(debugEntries, contextProvider);
        }
    };
    KnownUser.validateRequestByIntegrationConfig = function (currentUrlWithoutQueueITToken, queueitToken, integrationsConfigString, customerId, secretKey, contextProvider) {
        var debugEntries = {};
        var customerIntegrationInfo;
        var connectorDiagnostics = QueueITHelpers_1.ConnectorDiagnostics.verify(customerId, secretKey, queueitToken, contextProvider);
        if (connectorDiagnostics.hasError)
            return connectorDiagnostics.validationResult;
        try {
            if (connectorDiagnostics.isEnabled) {
                debugEntries["SdkVersion"] = UserInQueueService_1.UserInQueueService.SDK_VERSION;
                debugEntries["PureUrl"] = currentUrlWithoutQueueITToken;
                debugEntries["QueueitToken"] = queueitToken;
                debugEntries["OriginalUrl"] = contextProvider.getHttpRequest().getAbsoluteUri();
                this.logExtraRequestDetails(debugEntries, contextProvider);
            }
            customerIntegrationInfo = JSON.parse(integrationsConfigString);
            if (connectorDiagnostics.isEnabled) {
                debugEntries["ConfigVersion"] = customerIntegrationInfo && customerIntegrationInfo.Version ? customerIntegrationInfo.Version.toString() : "NULL";
            }
            if (!currentUrlWithoutQueueITToken)
                throw new Models_1.KnownUserException("currentUrlWithoutQueueITToken can not be null or empty.");
            if (!customerIntegrationInfo || !customerIntegrationInfo.Version)
                throw new Models_1.KnownUserException("integrationsConfigString can not be null or empty.");
            var configEvaluator = new IntegrationConfigHelpers.IntegrationEvaluator();
            var matchedConfig = configEvaluator.getMatchedIntegrationConfig(customerIntegrationInfo, currentUrlWithoutQueueITToken, contextProvider.getHttpRequest());
            if (connectorDiagnostics.isEnabled) {
                debugEntries["MatchedConfig"] = matchedConfig ? matchedConfig.Name : "NULL";
            }
            if (!matchedConfig)
                return new Models_1.RequestValidationResult(null, null, null, null, null, null);
            switch (matchedConfig.ActionType) {
                case Models_1.ActionTypes.QueueAction: {
                    return this.handleQueueAction(currentUrlWithoutQueueITToken, queueitToken, customerIntegrationInfo, customerId, secretKey, matchedConfig, contextProvider, debugEntries, connectorDiagnostics.isEnabled);
                }
                case Models_1.ActionTypes.CancelAction: {
                    return this.handleCancelAction(currentUrlWithoutQueueITToken, queueitToken, customerIntegrationInfo, customerId, secretKey, matchedConfig, contextProvider, debugEntries, connectorDiagnostics.isEnabled);
                }
                default: {
                    return this.handleIgnoreAction(contextProvider, matchedConfig.Name);
                }
            }
        }
        catch (e) {
            if (connectorDiagnostics.isEnabled)
                debugEntries["Exception"] = e.message;
            throw e;
        }
        finally {
            this.setDebugCookie(debugEntries, contextProvider);
        }
    };
    KnownUser.cancelRequestByLocalConfig = function (targetUrl, queueitToken, cancelConfig, customerId, secretKey, contextProvider) {
        var debugEntries = {};
        var connectorDiagnostics = QueueITHelpers_1.ConnectorDiagnostics.verify(customerId, secretKey, queueitToken, contextProvider);
        if (connectorDiagnostics.hasError)
            return connectorDiagnostics.validationResult;
        try {
            return this._cancelRequestByLocalConfig(targetUrl, queueitToken, cancelConfig, customerId, secretKey, contextProvider, debugEntries, connectorDiagnostics.isEnabled);
        }
        catch (e) {
            if (connectorDiagnostics.isEnabled)
                debugEntries["Exception"] = e.message;
            throw e;
        }
        finally {
            this.setDebugCookie(debugEntries, contextProvider);
        }
    };
    KnownUser.QueueITTokenKey = "queueittoken";
    KnownUser.QueueITDebugKey = "queueitdebug";
    KnownUser.QueueITAjaxHeaderKey = "x-queueit-ajaxpageurl";
    KnownUser.UserInQueueService = null;
    return KnownUser;
}());
exports.KnownUser = KnownUser;

},{"./IntegrationConfig/IntegrationConfigHelpers":2,"./Models":5,"./QueueITHelpers":6,"./UserInQueueService":7,"./UserInQueueStateCookieRepository":8}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionTypes = exports.MissingSha256ImplementationException = exports.KnownUserException = exports.RequestValidationResult = exports.CancelEventConfig = exports.QueueEventConfig = void 0;
var QueueITHelpers_1 = require("./QueueITHelpers");
var QueueEventConfig = /** @class */ (function () {
    function QueueEventConfig(eventId, layoutName, culture, queueDomain, extendCookieValidity, cookieValidityMinute, cookieDomain, isCookieHttpOnly, isCookieSecure, version, actionName) {
        if (actionName === void 0) { actionName = 'unspecified'; }
        this.eventId = eventId;
        this.layoutName = layoutName;
        this.culture = culture;
        this.queueDomain = queueDomain;
        this.extendCookieValidity = extendCookieValidity;
        this.cookieValidityMinute = cookieValidityMinute;
        this.cookieDomain = cookieDomain;
        this.isCookieHttpOnly = isCookieHttpOnly;
        this.isCookieSecure = isCookieSecure;
        this.version = version;
        this.actionName = actionName;
    }
    QueueEventConfig.prototype.getString = function () {
        return "EventId:".concat(this.eventId, "&Version:").concat(this.version, "&ActionName:").concat(this.actionName, "&QueueDomain:").concat(this.queueDomain) +
            "&CookieDomain:".concat(this.cookieDomain, "&IsCookieHttpOnly:").concat(this.isCookieHttpOnly, "&IsCookieSecure:").concat(this.isCookieSecure) +
            "&ExtendCookieValidity:".concat(this.extendCookieValidity) +
            "&CookieValidityMinute:".concat(this.cookieValidityMinute, "&LayoutName:").concat(this.layoutName, "&Culture:").concat(this.culture);
    };
    return QueueEventConfig;
}());
exports.QueueEventConfig = QueueEventConfig;
var CancelEventConfig = /** @class */ (function () {
    function CancelEventConfig(eventId, queueDomain, cookieDomain, isCookieHttpOnly, isCookieSecure, version, actionName) {
        if (actionName === void 0) { actionName = 'unspecified'; }
        this.eventId = eventId;
        this.queueDomain = queueDomain;
        this.cookieDomain = cookieDomain;
        this.isCookieHttpOnly = isCookieHttpOnly;
        this.isCookieSecure = isCookieSecure;
        this.version = version;
        this.actionName = actionName;
    }
    CancelEventConfig.prototype.getString = function () {
        return "EventId:".concat(this.eventId, "&Version:").concat(this.version) +
            "&QueueDomain:".concat(this.queueDomain) +
            "&CookieDomain:".concat(this.cookieDomain, "&IsCookieHttpOnly:").concat(this.isCookieHttpOnly, "&IsCookieSecure:").concat(this.isCookieSecure) +
            "&ActionName:".concat(this.actionName);
    };
    return CancelEventConfig;
}());
exports.CancelEventConfig = CancelEventConfig;
var RequestValidationResult = /** @class */ (function () {
    function RequestValidationResult(actionType, eventId, queueId, redirectUrl, redirectType, actionName) {
        this.actionType = actionType;
        this.eventId = eventId;
        this.queueId = queueId;
        this.redirectUrl = redirectUrl;
        this.redirectType = redirectType;
        this.actionName = actionName;
    }
    RequestValidationResult.prototype.doRedirect = function () {
        return !!this.redirectUrl;
    };
    RequestValidationResult.prototype.getAjaxQueueRedirectHeaderKey = function () {
        return "x-queueit-redirect";
    };
    RequestValidationResult.prototype.getAjaxRedirectUrl = function () {
        if (this.redirectUrl) {
            return QueueITHelpers_1.Utils.encodeUrl(this.redirectUrl);
        }
        return "";
    };
    return RequestValidationResult;
}());
exports.RequestValidationResult = RequestValidationResult;
var KnownUserException = /** @class */ (function () {
    function KnownUserException(message) {
        this.message = message;
    }
    return KnownUserException;
}());
exports.KnownUserException = KnownUserException;
exports.MissingSha256ImplementationException = new KnownUserException("Missing implementation for generateSHA256Hash");
var ActionTypes = /** @class */ (function () {
    function ActionTypes() {
    }
    ActionTypes.QueueAction = "Queue";
    ActionTypes.CancelAction = "Cancel";
    ActionTypes.IgnoreAction = "Ignore";
    return ActionTypes;
}());
exports.ActionTypes = ActionTypes;

},{"./QueueITHelpers":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorDiagnostics = exports.CookieHelper = exports.QueueParameterHelper = exports.QueueUrlParams = exports.Utils = exports.ErrorCode = void 0;
var Models_1 = require("./Models");
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["Hash"] = "hash";
    ErrorCode["Timestamp"] = "timestamp";
    ErrorCode["CookieSessionState"] = "connector/sessionstate";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.encodeUrl = function (url) {
        if (!url)
            return "";
        return encodeURIComponent(url).replace(/[!'()*]/g, function (c) {
            // More stringent in adhering to RFC 3986 (which reserves!, ', (, ), and *)
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
            return '%' + c.charCodeAt(0).toString(16);
        });
    };
    Utils.decodeUrl = function (url) {
        return decodeURIComponent(url);
    };
    Utils.generateSHA256Hash = function (secretKey, stringToHash, context) {
        var cryptoProvider;
        if (context && context.getCryptoProvider && (cryptoProvider = context.getCryptoProvider())) {
            return cryptoProvider.getSha256Hash(secretKey, stringToHash);
        }
        throw Models_1.MissingSha256ImplementationException;
    };
    Utils.endsWith = function (str, search) {
        if (str === search)
            return true;
        if (!str || !search)
            return false;
        return str.substring(str.length - search.length, str.length) === search;
    };
    Utils.getCurrentTime = function () {
        return Math.floor(new Date().getTime() / 1000);
    };
    Utils.bin2hex = function (s) {
        var i;
        var l;
        var o = '';
        var n;
        s += '';
        for (i = 0, l = s.length; i < l; i++) {
            n = s.charCodeAt(i)
                .toString(16);
            o += n.length < 2 ? '0' + n : n;
        }
        return o;
    };
    return Utils;
}());
exports.Utils = Utils;
var QueueUrlParams = /** @class */ (function () {
    function QueueUrlParams() {
        this.timeStamp = 0;
        this.extendableCookie = false;
    }
    return QueueUrlParams;
}());
exports.QueueUrlParams = QueueUrlParams;
var QueueParameterHelper = /** @class */ (function () {
    function QueueParameterHelper() {
    }
    QueueParameterHelper.extractQueueParams = function (queueitToken) {
        if (!queueitToken) {
            return null;
        }
        var result = new QueueUrlParams();
        result.queueITToken = queueitToken;
        var paramList = result.queueITToken.split(QueueParameterHelper.KeyValueSeparatorGroupChar);
        for (var _i = 0, paramList_1 = paramList; _i < paramList_1.length; _i++) {
            var paramKeyValue = paramList_1[_i];
            var keyValueArr = paramKeyValue.split(QueueParameterHelper.KeyValueSeparatorChar);
            if (keyValueArr.length !== 2) {
                continue;
            }
            switch (keyValueArr[0]) {
                case QueueParameterHelper.HashKey:
                    result.hashCode = keyValueArr[1] || "";
                    break;
                case QueueParameterHelper.TimeStampKey: {
                    result.timeStamp = parseInt(keyValueArr[1]);
                    if (!result.timeStamp) {
                        result.timeStamp = 0;
                    }
                    break;
                }
                case QueueParameterHelper.CookieValidityMinutesKey: {
                    result.cookieValidityMinutes = parseInt(keyValueArr[1]);
                    if (!result.cookieValidityMinutes) {
                        result.cookieValidityMinutes = null;
                    }
                    break;
                }
                case QueueParameterHelper.EventIdKey:
                    result.eventId = keyValueArr[1] || "";
                    break;
                case QueueParameterHelper.ExtendableCookieKey: {
                    var extendCookie = (keyValueArr[1] || "false").toLowerCase();
                    result.extendableCookie = extendCookie === "true";
                    break;
                }
                case QueueParameterHelper.QueueIdKey:
                    result.queueId = keyValueArr[1] || "";
                    break;
                case QueueParameterHelper.RedirectTypeKey:
                    result.redirectType = keyValueArr[1] || "";
                    break;
                case QueueParameterHelper.HashedIPKey:
                    result.hashedIp = keyValueArr[1] || "";
                    break;
            }
        }
        var hashWithPrefix = "".concat(QueueParameterHelper.KeyValueSeparatorGroupChar).concat(QueueParameterHelper.HashKey).concat(QueueParameterHelper.KeyValueSeparatorChar).concat(result.hashCode);
        result.queueITTokenWithoutHash = result.queueITToken.replace(hashWithPrefix, "");
        return result;
    };
    QueueParameterHelper.TimeStampKey = "ts";
    QueueParameterHelper.ExtendableCookieKey = "ce";
    QueueParameterHelper.CookieValidityMinutesKey = "cv";
    QueueParameterHelper.HashKey = "h";
    QueueParameterHelper.EventIdKey = "e";
    QueueParameterHelper.QueueIdKey = "q";
    QueueParameterHelper.RedirectTypeKey = "rt";
    QueueParameterHelper.HashedIPKey = 'hip';
    QueueParameterHelper.KeyValueSeparatorChar = '_';
    QueueParameterHelper.KeyValueSeparatorGroupChar = '~';
    return QueueParameterHelper;
}());
exports.QueueParameterHelper = QueueParameterHelper;
var CookieHelper = /** @class */ (function () {
    function CookieHelper() {
    }
    CookieHelper.toMapFromValue = function (cookieValue) {
        try {
            var result = {};
            var items = cookieValue.split('&');
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                var keyValue = item.split('=');
                result[keyValue[0]] = keyValue[1];
            }
            return result;
        }
        catch (_a) {
            return {};
        }
    };
    CookieHelper.toValueFromKeyValueCollection = function (cookieValues) {
        var values = new Array();
        for (var _i = 0, cookieValues_1 = cookieValues; _i < cookieValues_1.length; _i++) {
            var keyVal = cookieValues_1[_i];
            values.push("".concat(keyVal.key, "=").concat(keyVal.value));
        }
        return values.join("&");
    };
    return CookieHelper;
}());
exports.CookieHelper = CookieHelper;
var ConnectorDiagnostics = /** @class */ (function () {
    function ConnectorDiagnostics() {
        this.isEnabled = false;
        this.hasError = false;
    }
    ConnectorDiagnostics.prototype.setStateWithTokenError = function (customerId, errorCode) {
        this.hasError = true;
        var redirectUrl = "https://".concat(customerId, ".api2.queue-it.net/").concat(customerId, "/diagnostics/connector/error/?code=").concat(errorCode);
        this.validationResult = new Models_1.RequestValidationResult("ConnectorDiagnosticsRedirect", null, null, redirectUrl, null, null);
    };
    ConnectorDiagnostics.prototype.setStateWithSetupError = function () {
        this.hasError = true;
        this.validationResult = new Models_1.RequestValidationResult("ConnectorDiagnosticsRedirect", null, null, "https://api2.queue-it.net/diagnostics/connector/error/?code=setup", null, null);
    };
    ConnectorDiagnostics.verify = function (customerId, secretKey, queueitToken, context) {
        var diagnostics = new ConnectorDiagnostics();
        var qParams = QueueParameterHelper.extractQueueParams(queueitToken);
        if (qParams == null)
            return diagnostics;
        if (qParams.redirectType == null)
            return diagnostics;
        if (qParams.redirectType !== "debug")
            return diagnostics;
        if (!(customerId && secretKey)) {
            diagnostics.setStateWithSetupError();
            return diagnostics;
        }
        if (Utils.generateSHA256Hash(secretKey, qParams.queueITTokenWithoutHash, context) != qParams.hashCode) {
            diagnostics.setStateWithTokenError(customerId, ErrorCode.Hash);
            return diagnostics;
        }
        if (qParams.timeStamp < Utils.getCurrentTime()) {
            diagnostics.setStateWithTokenError(customerId, ErrorCode.Timestamp);
            return diagnostics;
        }
        diagnostics.isEnabled = true;
        return diagnostics;
    };
    return ConnectorDiagnostics;
}());
exports.ConnectorDiagnostics = ConnectorDiagnostics;

},{"./Models":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInQueueService = void 0;
var QueueITHelpers_1 = require("./QueueITHelpers");
var Models_1 = require("./Models");
var UserInQueueService = /** @class */ (function () {
    function UserInQueueService(contextProvider, userInQueueStateRepository) {
        this.contextProvider = contextProvider;
        this.userInQueueStateRepository = userInQueueStateRepository;
    }
    UserInQueueService.prototype.getValidTokenResult = function (config, queueParams, secretKey) {
        this.userInQueueStateRepository.store(config.eventId, queueParams.queueId, queueParams.cookieValidityMinutes, config.cookieDomain, config.isCookieHttpOnly, config.isCookieSecure, queueParams.redirectType, queueParams.hashedIp, secretKey);
        return new Models_1.RequestValidationResult(Models_1.ActionTypes.QueueAction, config.eventId, queueParams.queueId, null, queueParams.redirectType, config.actionName);
    };
    UserInQueueService.prototype.getErrorResult = function (customerId, targetUrl, config, qParams, errorCode, state) {
        var queueItTokenParam = qParams ? "&queueittoken=".concat(qParams.queueITToken) : '';
        var query = this.getQueryString(customerId, config.eventId, config.version, config.culture, config.layoutName, config.actionName, state.getInvalidCookieReason()) +
            queueItTokenParam +
            "&ts=".concat(QueueITHelpers_1.Utils.getCurrentTime()) +
            (targetUrl ? "&t=".concat(QueueITHelpers_1.Utils.encodeUrl(targetUrl)) : "");
        var uriPath = "error/".concat(errorCode, "/");
        var redirectUrl = this.generateRedirectUrl(config.queueDomain, uriPath, query);
        return new Models_1.RequestValidationResult(Models_1.ActionTypes.QueueAction, config.eventId, null, redirectUrl, null, config.actionName);
    };
    UserInQueueService.prototype.getQueueResult = function (targetUrl, config, customerId) {
        var enqueueToken = this.contextProvider.getEnqueueTokenProvider
            && this.contextProvider.getEnqueueTokenProvider().getEnqueueToken(config.eventId);
        var query = this.getQueryString(customerId, config.eventId, config.version, config.culture, config.layoutName, config.actionName, null, enqueueToken) +
            (targetUrl ? "&t=" + QueueITHelpers_1.Utils.encodeUrl(targetUrl) : "");
        var redirectUrl = this.generateRedirectUrl(config.queueDomain, "", query);
        return new Models_1.RequestValidationResult(Models_1.ActionTypes.QueueAction, config.eventId, null, redirectUrl, null, config.actionName);
    };
    UserInQueueService.prototype.getQueryString = function (customerId, eventId, configVersion, culture, layoutName, actionName, invalidCookieReason, enqueueToken) {
        var queryStringList = new Array();
        queryStringList.push("c=".concat(QueueITHelpers_1.Utils.encodeUrl(customerId)));
        queryStringList.push("e=".concat(QueueITHelpers_1.Utils.encodeUrl(eventId)));
        queryStringList.push("ver=".concat(UserInQueueService.SDK_VERSION));
        queryStringList.push("cver=".concat(configVersion));
        queryStringList.push("man=".concat(QueueITHelpers_1.Utils.encodeUrl(actionName)));
        if (culture) {
            queryStringList.push("cid=" + QueueITHelpers_1.Utils.encodeUrl(culture));
        }
        if (layoutName) {
            queryStringList.push("l=" + QueueITHelpers_1.Utils.encodeUrl(layoutName));
        }
        if (invalidCookieReason) {
            queryStringList.push("icr=" + QueueITHelpers_1.Utils.encodeUrl(invalidCookieReason));
        }
        if (enqueueToken) {
            queryStringList.push("enqueuetoken=".concat(enqueueToken));
        }
        return queryStringList.join("&");
    };
    UserInQueueService.prototype.generateRedirectUrl = function (queueDomain, uriPath, query) {
        if (!QueueITHelpers_1.Utils.endsWith(queueDomain, "/"))
            queueDomain = queueDomain + "/";
        return "https://".concat(queueDomain).concat(uriPath, "?").concat(query);
    };
    UserInQueueService.prototype.validateQueueRequest = function (targetUrl, queueitToken, config, customerId, secretKey) {
        var state = this.userInQueueStateRepository.getState(config.eventId, config.cookieValidityMinute, secretKey, true);
        if (state.isValid) {
            if (state.isStateExtendable() && config.extendCookieValidity) {
                this.userInQueueStateRepository.store(config.eventId, state.queueId, null, config.cookieDomain, config.isCookieHttpOnly, config.isCookieSecure, state.redirectType, state.hashedIp, secretKey);
            }
            return new Models_1.RequestValidationResult(Models_1.ActionTypes.QueueAction, config.eventId, state.queueId, null, state.redirectType, config.actionName);
        }
        var queueTokenParams = QueueITHelpers_1.QueueParameterHelper.extractQueueParams(queueitToken);
        var requestValidationResult;
        var isTokenValid = false;
        if (queueTokenParams) {
            var tokenValidationResult = this.validateToken(config, queueTokenParams, secretKey);
            isTokenValid = tokenValidationResult.isValid;
            if (isTokenValid) {
                requestValidationResult = this.getValidTokenResult(config, queueTokenParams, secretKey);
            }
            else {
                requestValidationResult = this.getErrorResult(customerId, targetUrl, config, queueTokenParams, tokenValidationResult.errorCode, state);
            }
        }
        else if (state.isBoundToAnotherIp) {
            requestValidationResult = this.getErrorResult(customerId, targetUrl, config, queueTokenParams, QueueITHelpers_1.ErrorCode.CookieSessionState, state);
        }
        else {
            requestValidationResult = this.getQueueResult(targetUrl, config, customerId);
        }
        if (state.isFound && !isTokenValid) {
            this.userInQueueStateRepository.cancelQueueCookie(config.eventId, config.cookieDomain, config.isCookieHttpOnly, config.isCookieSecure);
        }
        return requestValidationResult;
    };
    UserInQueueService.prototype.validateCancelRequest = function (targetUrl, config, customerId, secretKey) {
        //we do not care how long cookie is valid while canceling cookie
        var state = this.userInQueueStateRepository.getState(config.eventId, -1, secretKey, false);
        if (state.isValid) {
            this.userInQueueStateRepository.cancelQueueCookie(config.eventId, config.cookieDomain, config.isCookieHttpOnly, config.isCookieSecure);
            var query = this.getQueryString(customerId, config.eventId, config.version, null, null, config.actionName) +
                (targetUrl ? "&r=" + QueueITHelpers_1.Utils.encodeUrl(targetUrl) : "");
            var uriPath = "cancel/".concat(customerId, "/").concat(config.eventId);
            if (state.queueId) {
                uriPath += "/".concat(state.queueId);
            }
            var redirectUrl = this.generateRedirectUrl(config.queueDomain, uriPath, query);
            return new Models_1.RequestValidationResult(Models_1.ActionTypes.CancelAction, config.eventId, state.queueId, redirectUrl, state.redirectType, config.actionName);
        }
        else {
            return new Models_1.RequestValidationResult(Models_1.ActionTypes.CancelAction, config.eventId, null, null, null, config.actionName);
        }
    };
    UserInQueueService.prototype.extendQueueCookie = function (eventId, cookieValidityMinutes, cookieDomain, isCookieHttpOnly, isCookieSecure, secretKey) {
        this.userInQueueStateRepository.reissueQueueCookie(eventId, cookieValidityMinutes, cookieDomain, isCookieHttpOnly, isCookieSecure, secretKey);
    };
    UserInQueueService.prototype.getIgnoreResult = function (actionName) {
        return new Models_1.RequestValidationResult(Models_1.ActionTypes.IgnoreAction, null, null, null, null, actionName);
    };
    UserInQueueService.prototype.validateToken = function (config, queueParams, secretKey) {
        var calculatedHash = QueueITHelpers_1.Utils.generateSHA256Hash(secretKey, queueParams.queueITTokenWithoutHash, this.contextProvider);
        if (calculatedHash !== queueParams.hashCode)
            return new TokenValidationResult(false, "hash");
        if (queueParams.eventId !== config.eventId)
            return new TokenValidationResult(false, "eventid");
        if (queueParams.timeStamp < QueueITHelpers_1.Utils.getCurrentTime())
            return new TokenValidationResult(false, "timestamp");
        var clientIp = this.contextProvider.getHttpRequest().getUserHostAddress();
        if (queueParams.hashedIp && clientIp) {
            var hashedIp = QueueITHelpers_1.Utils.generateSHA256Hash(secretKey, clientIp, this.contextProvider);
            if (hashedIp !== queueParams.hashedIp) {
                return new TokenValidationResult(false, "ip");
            }
        }
        return new TokenValidationResult(true, null);
    };
    UserInQueueService.SDK_VERSION = "v3-javascript-" + "3.7.8";
    return UserInQueueService;
}());
exports.UserInQueueService = UserInQueueService;
var TokenValidationResult = /** @class */ (function () {
    function TokenValidationResult(isValid, errorCode) {
        this.isValid = isValid;
        this.errorCode = errorCode;
    }
    return TokenValidationResult;
}());

},{"./Models":5,"./QueueITHelpers":6}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateInfo = exports.UserInQueueStateCookieRepository = exports.QueueItAcceptedCookie = exports.CookieValidationResult = void 0;
var QueueITHelpers_1 = require("./QueueITHelpers");
var CookieValidationResult;
(function (CookieValidationResult) {
    CookieValidationResult[CookieValidationResult["NotFound"] = 0] = "NotFound";
    CookieValidationResult[CookieValidationResult["Expired"] = 1] = "Expired";
    CookieValidationResult[CookieValidationResult["WaitingRoomMismatch"] = 2] = "WaitingRoomMismatch";
    CookieValidationResult[CookieValidationResult["HashMismatch"] = 3] = "HashMismatch";
    CookieValidationResult[CookieValidationResult["Error"] = 4] = "Error";
    CookieValidationResult[CookieValidationResult["Valid"] = 5] = "Valid";
    CookieValidationResult[CookieValidationResult["IpBindingMismatch"] = 6] = "IpBindingMismatch";
})(CookieValidationResult = exports.CookieValidationResult || (exports.CookieValidationResult = {}));
var QueueItAcceptedCookie = /** @class */ (function () {
    function QueueItAcceptedCookie(storedHash, issueTimeString, queueId, eventIdFromCookie, redirectType, fixedCookieValidityMinutes, isCookieHttpOnly, isCookieSecure, hashedIp) {
        this.storedHash = storedHash;
        this.issueTimeString = issueTimeString;
        this.queueId = queueId;
        this.eventIdFromCookie = eventIdFromCookie;
        this.redirectType = redirectType;
        this.fixedCookieValidityMinutes = fixedCookieValidityMinutes;
        this.isCookieHttpOnly = isCookieHttpOnly;
        this.isCookieSecure = isCookieSecure;
        this.hashedIp = hashedIp;
    }
    QueueItAcceptedCookie.fromCookieHeader = function (cookieHeaderValue) {
        var cookieValueMap = QueueITHelpers_1.CookieHelper.toMapFromValue(cookieHeaderValue);
        var storedHash = cookieValueMap[QueueItAcceptedCookie.HashKey] || "";
        var issueTimeString = cookieValueMap[QueueItAcceptedCookie.IssueTimeKey] || "";
        var queueId = cookieValueMap[QueueItAcceptedCookie.QueueIdKey] || "";
        var eventIdFromCookie = cookieValueMap[QueueItAcceptedCookie.EventIdKey] || "";
        var redirectType = cookieValueMap[QueueItAcceptedCookie.RedirectTypeKey] || "";
        var fixedCookieValidityMinutes = cookieValueMap[QueueItAcceptedCookie.FixedCookieValidityMinutesKey] || "";
        var isCookieHttpOnly = cookieValueMap[QueueItAcceptedCookie.IsCookieHttpOnly] || false;
        var isCookieSecure = cookieValueMap[QueueItAcceptedCookie.IsCookieSecure] || false;
        var hashedIpValue = cookieValueMap[QueueItAcceptedCookie.HashedIpKey] || "";
        return new QueueItAcceptedCookie(storedHash, issueTimeString, queueId, eventIdFromCookie, redirectType, fixedCookieValidityMinutes, isCookieHttpOnly, isCookieSecure, hashedIpValue);
    };
    QueueItAcceptedCookie.HashKey = "Hash";
    QueueItAcceptedCookie.IssueTimeKey = "IssueTime";
    QueueItAcceptedCookie.QueueIdKey = "QueueId";
    QueueItAcceptedCookie.EventIdKey = "EventId";
    QueueItAcceptedCookie.RedirectTypeKey = "RedirectType";
    QueueItAcceptedCookie.FixedCookieValidityMinutesKey = "FixedValidityMins";
    QueueItAcceptedCookie.IsCookieHttpOnly = "IsCookieHttpOnly";
    QueueItAcceptedCookie.IsCookieSecure = "IsCookieSecure";
    QueueItAcceptedCookie.HashedIpKey = "Hip";
    return QueueItAcceptedCookie;
}());
exports.QueueItAcceptedCookie = QueueItAcceptedCookie;
var UserInQueueStateCookieRepository = /** @class */ (function () {
    function UserInQueueStateCookieRepository(contextProvider) {
        this.contextProvider = contextProvider;
    }
    UserInQueueStateCookieRepository.getCookieKey = function (eventId) {
        return "".concat(UserInQueueStateCookieRepository._QueueITDataKey, "_").concat(eventId);
    };
    UserInQueueStateCookieRepository.prototype.store = function (eventId, queueId, fixedCookieValidityMinutes, cookieDomain, isCookieHttpOnly, isCookieSecure, redirectType, hashedIp, secretKey) {
        isCookieHttpOnly = isCookieHttpOnly == null ? false : isCookieHttpOnly;
        isCookieSecure = isCookieSecure == null ? false : isCookieSecure;
        this.createCookie(eventId, queueId, fixedCookieValidityMinutes ? fixedCookieValidityMinutes.toString() : "", redirectType, hashedIp, cookieDomain, isCookieHttpOnly, isCookieSecure, secretKey);
    };
    UserInQueueStateCookieRepository.prototype.createCookie = function (eventId, queueId, fixedCookieValidityMinutes, redirectType, hashedIp, cookieDomain, isCookieHttpOnly, isCookieSecure, secretKey) {
        var cookieKey = UserInQueueStateCookieRepository.getCookieKey(eventId);
        var issueTime = QueueITHelpers_1.Utils.getCurrentTime().toString();
        var cookieValues = new Array();
        cookieValues.push({ key: QueueItAcceptedCookie.EventIdKey, value: eventId });
        cookieValues.push({ key: QueueItAcceptedCookie.QueueIdKey, value: queueId });
        if (fixedCookieValidityMinutes) {
            cookieValues.push({
                key: QueueItAcceptedCookie.FixedCookieValidityMinutesKey,
                value: fixedCookieValidityMinutes
            });
        }
        cookieValues.push({ key: QueueItAcceptedCookie.RedirectTypeKey, value: redirectType.toLowerCase() });
        cookieValues.push({ key: QueueItAcceptedCookie.IssueTimeKey, value: issueTime });
        if (hashedIp) {
            cookieValues.push({ key: QueueItAcceptedCookie.HashedIpKey, value: hashedIp });
        }
        cookieValues.push({
            key: QueueItAcceptedCookie.HashKey,
            value: this.generateHash(eventId.toLowerCase(), queueId, fixedCookieValidityMinutes, redirectType.toLowerCase(), issueTime, hashedIp, secretKey)
        });
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var expire = Math.floor(tomorrow.getTime() / 1000);
        this.contextProvider.getHttpResponse().setCookie(cookieKey, QueueITHelpers_1.CookieHelper.toValueFromKeyValueCollection(cookieValues), cookieDomain, expire, isCookieHttpOnly, isCookieSecure);
    };
    UserInQueueStateCookieRepository.prototype.getState = function (eventId, cookieValidityMinutes, secretKey, validateTime) {
        var qitAcceptedCookie = null;
        var clientIp = this.contextProvider.getHttpRequest().getUserHostAddress();
        try {
            var cookieKey = UserInQueueStateCookieRepository.getCookieKey(eventId);
            var cookie = this.contextProvider.getHttpRequest().getCookieValue(cookieKey);
            if (!cookie)
                return new StateInfo("", null, "", null, CookieValidationResult.NotFound, null, clientIp);
            qitAcceptedCookie = QueueItAcceptedCookie.fromCookieHeader(cookie);
            var cookieValidationResult = this.isCookieValid(secretKey, qitAcceptedCookie, eventId, cookieValidityMinutes, validateTime);
            if (cookieValidationResult != CookieValidationResult.Valid) {
                return new StateInfo("", null, "", qitAcceptedCookie.hashedIp, cookieValidationResult, qitAcceptedCookie, clientIp);
            }
            return new StateInfo(qitAcceptedCookie.queueId, qitAcceptedCookie.fixedCookieValidityMinutes
                ? parseInt(qitAcceptedCookie.fixedCookieValidityMinutes)
                : null, qitAcceptedCookie.redirectType, qitAcceptedCookie.hashedIp, CookieValidationResult.Valid, qitAcceptedCookie, clientIp);
        }
        catch (ex) {
            return new StateInfo("", null, "", qitAcceptedCookie === null || qitAcceptedCookie === void 0 ? void 0 : qitAcceptedCookie.hashedIp, CookieValidationResult.Error, qitAcceptedCookie, clientIp);
        }
    };
    UserInQueueStateCookieRepository.prototype.isCookieValid = function (secretKey, cookie, eventId, cookieValidityMinutes, validateTime) {
        try {
            var expectedHash = this.generateHash(cookie.eventIdFromCookie, cookie.queueId, cookie.fixedCookieValidityMinutes, cookie.redirectType, cookie.issueTimeString, cookie.hashedIp, secretKey);
            if (expectedHash !== cookie.storedHash)
                return CookieValidationResult.HashMismatch;
            if (eventId.toLowerCase() !== cookie.eventIdFromCookie.toLowerCase())
                return CookieValidationResult.WaitingRoomMismatch;
            if (validateTime) {
                var validity = cookie.fixedCookieValidityMinutes ? parseInt(cookie.fixedCookieValidityMinutes) : cookieValidityMinutes;
                var expirationTime = parseInt(cookie.issueTimeString) + validity * 60;
                if (expirationTime < QueueITHelpers_1.Utils.getCurrentTime())
                    return CookieValidationResult.Expired;
            }
            var userHostAddress = this.contextProvider.getHttpRequest().getUserHostAddress();
            if (cookie.hashedIp && userHostAddress) {
                var hashedUserHostAddress = QueueITHelpers_1.Utils.generateSHA256Hash(secretKey, userHostAddress, this.contextProvider);
                if (cookie.hashedIp !== hashedUserHostAddress) {
                    return CookieValidationResult.IpBindingMismatch;
                }
            }
            return CookieValidationResult.Valid;
        }
        catch (_a) {
            return CookieValidationResult.Error;
        }
    };
    UserInQueueStateCookieRepository.prototype.cancelQueueCookie = function (eventId, cookieDomain, isCookieHttpOnly, isCookieSecure) {
        var cookieKey = UserInQueueStateCookieRepository.getCookieKey(eventId);
        this.contextProvider.getHttpResponse()
            .setCookie(cookieKey, "", cookieDomain, 0, isCookieHttpOnly, isCookieSecure);
    };
    UserInQueueStateCookieRepository.prototype.reissueQueueCookie = function (eventId, cookieValidityMinutes, cookieDomain, isCookieHttpOnly, isCookieSecure, secretKey) {
        var cookieKey = UserInQueueStateCookieRepository.getCookieKey(eventId);
        var cookie = this.contextProvider.getHttpRequest().getCookieValue(cookieKey);
        if (!cookie)
            return;
        var qitAcceptedCookie = QueueItAcceptedCookie.fromCookieHeader(cookie);
        if (!this.isCookieValid(secretKey, qitAcceptedCookie, eventId, cookieValidityMinutes, true))
            return;
        var fixedCookieValidityMinutes = "";
        if (qitAcceptedCookie.fixedCookieValidityMinutes)
            fixedCookieValidityMinutes = qitAcceptedCookie.fixedCookieValidityMinutes.toString();
        this.createCookie(eventId, qitAcceptedCookie.queueId, fixedCookieValidityMinutes, qitAcceptedCookie.redirectType, qitAcceptedCookie.hashedIp, cookieDomain, isCookieHttpOnly, isCookieSecure, secretKey);
    };
    UserInQueueStateCookieRepository.prototype.generateHash = function (eventId, queueId, fixedCookieValidityMinutes, redirectType, issueTime, hashedIp, secretKey) {
        var valueToHash = eventId
            + queueId
            + (fixedCookieValidityMinutes ? fixedCookieValidityMinutes : "")
            + redirectType
            + issueTime
            + (hashedIp ? hashedIp : "");
        return QueueITHelpers_1.Utils.generateSHA256Hash(secretKey, valueToHash, this.contextProvider);
    };
    UserInQueueStateCookieRepository._QueueITDataKey = "QueueITAccepted-SDFrts345E-V3";
    return UserInQueueStateCookieRepository;
}());
exports.UserInQueueStateCookieRepository = UserInQueueStateCookieRepository;
var StateInfo = /** @class */ (function () {
    function StateInfo(queueId, fixedCookieValidityMinutes, redirectType, hashedIp, cookieValidationResult, cookie, clientIp) {
        this.queueId = queueId;
        this.fixedCookieValidityMinutes = fixedCookieValidityMinutes;
        this.redirectType = redirectType;
        this.hashedIp = hashedIp;
        this.cookieValidationResult = cookieValidationResult;
        this.cookie = cookie;
        this.clientIp = clientIp;
    }
    Object.defineProperty(StateInfo.prototype, "isValid", {
        get: function () {
            return this.cookieValidationResult === CookieValidationResult.Valid;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateInfo.prototype, "isFound", {
        get: function () {
            return this.cookieValidationResult !== CookieValidationResult.NotFound;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateInfo.prototype, "isBoundToAnotherIp", {
        get: function () {
            return this.cookieValidationResult === CookieValidationResult.IpBindingMismatch;
        },
        enumerable: false,
        configurable: true
    });
    StateInfo.prototype.isStateExtendable = function () {
        return this.isValid && !this.fixedCookieValidityMinutes;
    };
    StateInfo.prototype.getInvalidCookieReason = function () {
        if (this.isValid) {
            return "";
        }
        var details = new Array();
        switch (this.cookieValidationResult) {
            case CookieValidationResult.HashMismatch:
                details.push("hash");
                details.push("h:".concat(this.cookie.storedHash));
                break;
            case CookieValidationResult.Expired:
                details.push("expired");
                break;
            case CookieValidationResult.Error:
                details.push("error");
                break;
            case CookieValidationResult.NotFound:
                break;
            case CookieValidationResult.IpBindingMismatch:
                details.push("ip");
                details.push("hip:".concat(this.cookie.hashedIp));
                details.push("cip:".concat(QueueITHelpers_1.Utils.bin2hex(this.clientIp)));
                break;
        }
        if (this.isFound) {
            if (this.redirectType) {
                details.push("r:".concat(this.redirectType));
            }
            if (this.queueId) {
                details.push("q:".concat(this.queueId));
            }
            details.push("st:".concat(Date.now()));
        }
        return details.join(",");
    };
    return StateInfo;
}());
exports.StateInfo = StateInfo;

},{"./QueueITHelpers":6}],9:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueUrlParams = exports.QueueParameterHelper = exports.Utils = exports.KnownUser = void 0;
var KnownUser_1 = require("./KnownUser");
Object.defineProperty(exports, "KnownUser", { enumerable: true, get: function () { return KnownUser_1.KnownUser; } });
__exportStar(require("./Models"), exports);
var QueueITHelpers_1 = require("./QueueITHelpers");
Object.defineProperty(exports, "Utils", { enumerable: true, get: function () { return QueueITHelpers_1.Utils; } });
Object.defineProperty(exports, "QueueParameterHelper", { enumerable: true, get: function () { return QueueITHelpers_1.QueueParameterHelper; } });
Object.defineProperty(exports, "QueueUrlParams", { enumerable: true, get: function () { return QueueITHelpers_1.QueueUrlParams; } });
__exportStar(require("./ConnectorContextProvider"), exports);

},{"./ConnectorContextProvider":1,"./KnownUser":4,"./Models":5,"./QueueITHelpers":6}]},{},[9]);
