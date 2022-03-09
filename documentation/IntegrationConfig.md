# Providing the queue configuration
The configuration specifies a set of Triggers and Actions. A Trigger is an expression matching one, more or all URLs on your website. 
When a user enter your website and the URL matches a Trigger-expression the corresponding Action will be triggered. 
The Action specifies which queue the users should be send to. 
In this way you can specify which queue(s) should protect which page(s) on the fly without changing the server-side integration.

This configuration can then be used in Edge Worker by three ways.
  
## 1. Manually updating integration config within Edge worker code
Latest integration config can be downloaded from GO Queue-it Platform and then updated by replacing "inlineIntegrationConfig" variable value in integrationConfigProvider.js file.
To use the inline integration config, set 'QUEUEIT_CONFIG_TYPE' queue-it variable value to 'inline' in Akamai property manager.

## 2. Dynamically download and cache integration config
### NOTE: If you are deploying to a staging environment that has an IP-filter applied, make sure to whitelist the path to the integration config, so the IP-filter doesn’t apply. Otherwise, the Queue-it Edge Worker will be blocked from accessing the configuration path. 
Integration config can be downloaded by calling Queue-IT API endpoint and then cached in Akamai network. In Akamai property manager, set variables 'PMUSER_QUEUEIT_CONFIG_TYPE' to 'cache' and 'PMUSER_QUEUEIT_API_KEY' to your API key. Configure the following Akamai property rules by setting the criteria, out going request path and caching behavior to download and cache the integration config.

### Edgeworker rule
Define edgeworker rule in Akamai property and set criteria as illustrated in picture.

![Edge worker criteria](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/edgeworkerCriteria.png)

#### Download integration config rule
Define property rule to download integration config and add following configuration illustrated in the pictures.

NOTE:  Choose the "Blank Rule" template and press "Insert Rule" to continue and then choose the "Origin Server" behavior as shown below.

![Download integration config criteria](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/integrationConfigDownloadCriteria.png)

![Download integration config Behaviour](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/integrationConfigDonloadBehavior.png)

![Download integration config Outgoing Path](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/outgoingRequestPath.png)

![Download integration config cache](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/integrationConfigCache.png)

![Download integration config cache prefresh](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/cachePrefreshing.png)

## 3. Push integration config to Akamai EdgeKV
Before you start using Akamai edgekv to store and fetch integration config, make sure that you have entitlements for both EdgeKV products on contract.
Integration config can be pushed and stored in Akamai EdgeKV from GO Queue-it Platform. Connector can fetch stored integration config from Edgekv by setting the 'PMUSER_QUEUEIT_CONFIG_TYPE' variable to 'edgekv' in Akamai property manager. Apply the following steps to setup and use integration config from EdgeKV in the connector.

- Get access to Akamai EdgeKV and its API. Read details about EdgeKV in Akamai documentation.
- Download Akamai client credentials and these credential will be used to complete the following step in GO Queue-it Platform.
- Update and publish integration config in GO Queue-it Platform.
- Generate Akamai EdgeKV token from GO Queue-it Platform and copy into 'lib/edgekv_tokens.js' file in the connector code.
- Push integration config to Akamai EdgeKV from GO Queue-it Platform. 

### Assign roles and permissions
You need to assign roles to create and manage access to EdgeKV in Akamai Control Center.
Administrator can add individual users, then create and assign roles and access rights. You can find detailed instructions for managing users, roles, and permissions in the Akamai Identity and Access Management online help.

### Set up authentication for an API client:
- Create an API client with the necessary credential for a single Control Center account. This credential applies to all APIs for all products you currently have access to with that Control Center account.
- Launch Identity and Access Management. In Control Center, you can navigate there by selecting → ACCOUNT ADMIN → Identity & access.
- From the Users and API Clients tab, click New API client for me to open the Customize API client screen.
- Click Quick to instantly create an API client with the necessary credential. This client’s API access levels, group roles, and permissions are identical to your current login.
- You can verify the APIs you can access by clicking Show additional details. Enter the API service’s name in the Filter field to verify that it’s included and that you have the proper level of access.

![Akamai API Client](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/apiClient.png)

### Generate API client credentials
To make EdgeKV API calls over the Akamai network, you first need to generate API credentials. 

- To use EdgeKV management APIs or the Edge KV CLI, the API credentials need to be created using the Admin role.
- To add permissions to your API credentials go to the Account Admin > Identity & access section in Akamai Control Center.
- On the Users and API Clients tab, use the search bar to find your Client Name and open the client details.
- Click the Edit API client button and scroll down to the APIs section.
- Click the Select APIs radio button and type edgekv in the search bar.
- Select the EdgeKV API.
- Select READ-WRITE from the Access Level dropdown and submit your changes.
- Download the credentials from API client page in Akamai control center
 
![Access Level Edgekv API](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/accessLevelEdgekvAPI.png)

### Akamai Settings in Go Queue-IT Platform
EdgeKV API host url is required to store integration config and generate the EdgeKV token for edgeworker. Add host url in 'Web End Point' field on Integration => Overview => Settings page. 
You can find Akamai host url from API client page in Akamai control center.

![Akamai Host Settings](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/hostSettings.png)

### Generate EdgeKV token
Queue-IT connector needs Akamai EdgeKV API token to get integration config from EdgeKV. The token can also be generated using Akamai EdgeKV CLI/API. GO Queue-it Platform also has functionality to generate and retrieve EdgeKV tokens on a button click which reduce the complexity of using Akamai API/Cli. Currently, it is only possible to generate one token to use in both environments (staging/production). Default life time of the token is 6 months if generated from GO Queue-it Platform. Generate or retrieve the Akamai EdgeKV tokens by providing the required information in GO Queue-it Platform (on integration overview page).

#### Important Note: Remember to generate new token before existing one expires and update the 'lib/edgekv_tokens.js' file.

![Retrieve token](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/pushConfigForm.png)
![Generate token](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/generateToken.png)

### Push integration config
Integration config can be pushed to Akamai EdgeKV from GO Queue-it Platform by providing Akamai client credentials and environment. This process will initialize the EdgeKV if it is not initialized and then create namespace "QueueIT", group "integrations" and item "integrationConfig" in EdgeKV to store integration config. Following picture shows the required information to push the integration config.

![Akamai Push Config Form](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/pushConfigForm.png)

### Update token in edgeworker bundle
Copy the valid token name and value from GO Queue-it Platform and update 'lib/edgekv_tokens.js' file in Edgeworker code bundle to get integration config from EdgeKV.
Edgekv library will use this token to authenticate the request from edgeworker.
```
var edgekv_access_tokens = {
  "namespace-QueueIT" : { 
    "name": "Name of the token",
    "value" : "Value of the token"
    }
}
export { edgekv_access_tokens };
```
