# KnownUser.V3.Akamai
The Queue-it Security Framework ensures that end-users are not able to access your online application without first going through the queue for any and all “protected” areas and paths on your sites. The queue system is implemented by adding a server-side (request-level) integration that protects your online application by redirecting users to a waiting room according to web traffic settings in the Queue-it GO Platform. After the integration is complete, queue system behavior and operations are managed in Queue-it’s Go Platform and/or via the Queue-it Admin API.

This Akamai Queue-it Connector SDK (aka, Queue-it’s server-side KnownUser connector) uses Akamai Edge Workers to integrate Queue-it functionality into Akamai’s CDN network. 

A subscription / access to Akamai Edge Workers is required to utilize this connector, and Akamai resources and professional services should be consulted.

>You can find the latest released version [here](https://github.com/queueit/KnownUser.V3.Akamai/releases/latest).

## How it works
![Edge Worker Integration / Logical Flow](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/akamai_edge_worker_diagram_v0.2.png)

 1. User requests a page on your server
 2. Upon first request of a protected page, the validation method will see that there is no Queue-it session cookie and no `queueittoken` and send the user to the correct queue based on the configuration
 3. User waits in the queue
 4. User is redirected back to your website, now with a `queueittoken`
 5. The validation method validates the `queueittoken` and creates a Queue-it session cookie
 6. The user browses to a new page and the presence of a valid Queue-it session cookie prevent a return to the queue

## Installation
### Note: EdgeWorker should be created using the Dynamic Compute resource tier.
Installing the edge worker the first time requires uploading an archive file (TGZ format) to the Edge Worker manager in the Akamai Control Center. Once uploaded, the service worker code can be customized and updated with specific configurations (protection schema) managed and exported from the Queue-it GO Platform. 
 - Step 1: Download all js files plus bundle.json and create bundle and upload to Akamai Edge Worker manager **
 - Step 2: Create desired waiting room(s), triggers, and actions in GO. Then, save/publish the Configuration. 
 - Step 3: Provide integration config by implementing one of the following methods.
   - 3.1 Manually updating integration config within Edge worker code
   - 3.2 Dynamically download and cache integration config
   - 3.3 Push integration config to Akamai EdgeKV   
 - Step 4: Upload the Queue-it edge worker bundle
 - Step 5: Update the bundle.js file in the Edge Worker manager with a new version and deploy the new version of EdgeWorker
 - Step 6: In Akamai Propery, add queue-it required variables named as 'PMUSER_QUEUEIT_CUSTOMERID', 'PMUSER_QUEUEIT_CONFIG_TYPE', 'PMUSER_QUEUEIT_SECRET_KEY' and 'PMUSER_QUEUEIT_API_KEY' optional if  'PMUSER_QUEUEIT_CONFIG_TYPE' is cache. Section 'QueueIT variables' describes queue-it varibles in details.
 - Step 7: In Akamai Property, create a behaviour for the URL/Hostname/Conditions where the edge worker will apply choose the name of EdgeWorker created in the upper section (make sure you are not executing edgeworker for static resources)
 - Step 8: Add a Site Failover behavior to retry if EdgeWorker fails
 - Step 9: Add integration config download criteria condition, behavior and cache if integration config download method is used.
 - Step 10: Deploy the updated Akamai Property configuration

** https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-53F43F70-BEBC-4BA4-A2FB-3F23A6125106.html 

### Providing the queue configuration
The configuration specifies a set of Triggers and Actions. A Trigger is an expression matching one, more or all URLs on your website. 
When a user enter your website and the URL matches a Trigger-expression the corresponding Action will be triggered. 
The Action specifies which queue the users should be send to. 
In this way you can specify which queue(s) should protect which page(s) on the fly without changing the server-side integration.

This configuration can then be used in Edge Worker by three ways.
  
### 3.1 Manually updating integration config within Edge worker code
Latest integration config can be downloaded from GO Queue-it Platform and then updated by replacing "inlineIntegrationConfig" variable value in integrationConfigProvider.js file.
To use the inline integration config, set 'QUEUEIT_CONFIG_TYPE' queue-it variable value to 'inline' in Akamai property manager.

### 3.2 Dynamically download and cache integration config
Integration config can be downloaded by calling Queue-IT API endpoint and then cached in Akamai network. In Akamai property manager, set variables 'PMUSER_QUEUEIT_CONFIG_TYPE' to 'cache' and 'PMUSER_QUEUEIT_API_KEY' to your API key. Configure the following Akamai property rules by setting the criteria, out going request path and caching behavior to download and cache the integration config.

#### Edgeworker rule
Define edgeworker rule in Akamai property and set criteria as illustrated in picture.

![Edge worker criteria](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/edgeworkerCriteria.PNG)

#### Download integration config rule
Define property rule to download integration config and add following configuration illustrated in the pictures.

![Download integration config criteria](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/integrationConfigDonloadCriteria.PNG)

![Download integration config Behaviour](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/integrationConfigDonloadBehavior.PNG)

![Download integration config Outgoing Path](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/outgoingRequestPath.PNG)

![Download integration config cache](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/integrationConfigCache.PNG)

### 3.3 Push integration config to Akamai EdgeKV
Integration config can be pushed and stored in Akamai EdgeKV from GO Queue-it Platform. Connector can fetch stored integration config from Edgekv by setting the 'PMUSER_QUEUEIT_CONFIG_TYPE' variable to 'edgekv' in Akamai property manager. Apply the following steps to setup and use integration config from EdgeKV in the connector.

- Get access to Akamai EdgeKV and its API. Read details about EdgeKV in Akamai documentation.
- Download Akamai client credentials and these credential will be used to complete the following step in GO Queue-it Platform.
- Update and publish integration config in GO Queue-it Platform.
- Generate Akamai EdgeKV token from GO Queue-it Platform and copy into 'lib/edgekv_tokens.js' file in the connector code.
- Push integration config to Akamai EdgeKV from GO Queue-it Platform. 

#### Generate EdgeKV token
Queue-IT connector needs Akamai EdgeKV API token to get integration config from EdgeKV. The token can also be generated using Akamai EdgeKV CLI/API. GO Queue-it Platform also has functionality to generate and retrieve EdgeKV tokens on a button click which reduce the complexity of using Akamai API/Cli. Currently, it is only possible to generate one token to use in both environments (staging/production). Default life time of the token is 6 months if generated from GO Queue-it Platform. Generate or retrieve the Akamai EdgeKV tokens by providing the required information in GO Queue-it Platform (on integration overview page).

##### Important Note: Remember to generate new token before existing one expires and update the 'lib/edgekv_tokens.js' file.

![Retrieve token](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/AkamaiPushConfigForm.PNG)
![Generate token](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/AkamaiGenerateToken.PNG)

#### Push integration config
Integration config can be pushed to Akamai EdgeKV from GO Queue-it Platform by providing Akamai client credentials and environment. This process will initialize the EdgeKV if it is not initialized and then create namespace "QueueIT", group "integrations" and item "integrationConfig" in EdgeKV to store integration config. Following picture shows the required information to push the integration config.

![Akamai Push Config Form](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/AkamaiPushConfigForm.PNG)

#### Update token in edgeworker bundle
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

### QueueIT variables
To integrate with QueueIT Akamai connector it is required to define queueit variables in your Akamai property. These variables should be named as 'PMUSER_QUEUEIT_CUSTOMERID', 'PMUSER_QUEUEIT_CONFIG_TYPE', 'PMUSER_QUEUEIT_SECRET_KEY', 'PMUSER_QUEUEIT_API_KEY' and of type 'Hidden' in Akamai property manager. The following table describes the options for variable values.

| Variable | Required | Value |
| :---: | :---: | :---: |
| PMUSER_QUEUEIT_CUSTOMERID | Yes | Find your Customer ID in the GO Queue-it Platform. |
| PMUSER_QUEUEIT_SECRET_KEY | Yes | Find your Secret key in the GO Queue-it Platform. |
| PMUSER_QUEUEIT_CONFIG_TYPE | Yes | 'inline' or 'cahce' or 'edgekv' |
| PMUSER_QUEUEIT_API_KEY | If 'PMUSER_QUEUEIT_CONFIG_TYPE' is set to cache  | Find your Api key in the GO Queue-it Platform. |

### Adding a Site Failover behaviour
After the EdgeWokrewr behaviour you need to add a Site Failover to do a retry if EW fails.

![Site Failover Behaviour](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/failover.PNG)

## Protecting AJAX calls
If you need to protect AJAX calls beside page loads you need to add the below JavaScript tags to your pages:
```
<script type="text/javascript" src="//static.queue-it.net/script/queueclient.min.js"></script>
<script
 data-queueit-intercept-domain="{YOUR_CURRENT_DOMAIN}"
   data-queueit-intercept="true"
  data-queueit-c="{YOUR_CUSTOMER_ID}"
  type="text/javascript"
  src="//static.queue-it.net/script/queueconfigloader.min.js">
</script>
```