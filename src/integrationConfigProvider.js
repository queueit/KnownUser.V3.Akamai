var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { httpRequest } from 'http-request';
//GET YOUR INTEGRATION CONFIG WITH JSON FORMAT FROM QEUEU_IT GO PLATFORM AND PAST IT HERE IF YOU ARE USING INLINE CONFIGURATION;
const integrationConfig = '';
export { IntegrationConfig };
class IntegrationConfig {
}
IntegrationConfig.getIntegrationConfig = function (apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        if (integrationConfig) {
            return integrationConfig;
        }
        const options = {};
        options.method = "GET";
        options.headers = { "api-key": apiKey };
        options.timeout = 1000;
        return (yield httpRequest("/queueit/integrationconfig/", options)).text();
    });
};
