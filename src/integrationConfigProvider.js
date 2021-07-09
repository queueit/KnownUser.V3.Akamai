var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*INLINE config*/
const inlineIntegrationConfig = 'IF YOU ARE USING INLINE CONFIGURATION: GET YOUR INTEGRATION CONFIG IN JSON FORMAT FROM GO QUEUE-IT PLATFORM AND PASTE IT HERE';
/*INLINE config*/
import { httpRequest } from 'http-request';
import { EdgeKV } from './lib/edgekv.js';
export { IntegrationConfigProvider };
class IntegrationConfigProvider {
}
IntegrationConfigProvider.getIntegrationConfig = function (configType, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (configType.toLowerCase()) {
            case 'inline':
                return inlineIntegrationConfig;
            case 'cache':
                return IntegrationConfigProvider.getIntegrationConfigFromCache(apiKey);
            case 'edgekv':
                return IntegrationConfigProvider.getIntegrationConfigFromEdgeKV();
        }
        return '';
    });
};
IntegrationConfigProvider.getIntegrationConfigFromCache = function (apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {};
        options.method = "GET";
        options.headers = { "api-key": apiKey };
        options.timeout = 950;
        return (yield httpRequest("/queueit/integrationconfig/", options)).text();
    });
};
IntegrationConfigProvider.getIntegrationConfigFromEdgeKV = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let edgeKV = new EdgeKV("QueueIT", "integrations");
        let result = yield edgeKV.requestHandlerTemplate(() => edgeKV.getRequest({ namespace: 'QueueIT', group: 'integrations', item: 'integrationConfig' }), (response) => response.text(), (response) => __awaiter(this, void 0, void 0, function* () { return yield edgeKV.streamText(response.body); }), "GET JSON string", null);
        return result;
    });
};
