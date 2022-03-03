/*INLINE config*/
const inlineIntegrationConfig = 'IF YOU ARE USING INLINE CONFIGURATION: GET YOUR INTEGRATION CONFIG IN JSON FORMAT FROM GO QUEUE-IT PLATFORM AND PASTE IT HERE';
/*INLINE config*/

import { httpRequest } from 'http-request';
import { EdgeKV } from './lib/edgekv.js';

export { IntegrationConfigProvider };
class IntegrationConfigProvider {
    public static getIntegrationConfig = async function (customerId: string, configType: string, apiKey: string) {

        switch (configType.toLowerCase()) {
            case 'inline':
                return inlineIntegrationConfig;
            case 'cache':
                return IntegrationConfigProvider.getIntegrationConfigFromCache(apiKey);
            case 'edgekv':
                return IntegrationConfigProvider.getIntegrationConfigFromEdgeKV(customerId);
        }
        return '';
    }

    private static getIntegrationConfigFromCache = async function (apiKey: string) {
        const options: any = {}
        options.method = "GET";
        options.headers = { "api-key": apiKey };
        options.timeout = 1400;
        return (await httpRequest("/queueit/integrationconfig/", options)).text();
    }
    
    private static getIntegrationConfigFromEdgeKV = async function (customerId: string) {
        let edgeKV = new EdgeKV("QueueIT", customerId);

        return await edgeKV.requestHandlerTemplate(
            () => edgeKV.getRequest({ namespace: 'QueueIT', group: customerId, item: 'integrationConfig' }),
            (response) => response.text(),
            async (response) => await edgeKV.streamText(response.body),
            "GET JSON string",
            null);
    }

}
