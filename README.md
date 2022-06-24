# KnownUser.V3.Akamai
Before getting started please read the [documentation](https://github.com/queueit/Documentation/tree/main/edge-connectors) to get acquainted with edge connectors.

This Akamai Queue-it Connector SDK (aka, Queue-it’s server-side KnownUser connector) uses Akamai Edge Workers to integrate Queue-it functionality into Akamai’s CDN network. 

A subscription / access to Akamai Edge Workers is required to utilize this connector, and Akamai resources and professional services should be consulted.

>You can find the latest released version and deployable bundle "kuedge.tar.gz" [here](https://github.com/queueit/KnownUser.V3.Akamai/releases/latest).

## Installation

**Note: EdgeWorker should be created using the Dynamic Compute resource tier.**

Installing the edge worker the first time requires uploading an archive file (TGZ format) to the Edge Worker manager in the Akamai Control Center. Once uploaded, the service worker code can be customized and updated with specific configurations (protection schema) managed and exported from the Queue-it GO Platform. 
 - Step 1: Download all js files plus bundle.json and create bundle and upload to Akamai Edge Worker manager **
 - Step 2: Create desired waiting room(s), triggers, and actions in GO. Then, save/publish the Configuration. 
 - [Step 3: Provide integration config](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/IntegrationConfig.md)
 - Step 4: Upload the Queue-it edge worker bundle
 - Step 5: Update the bundle.js file in the Edge Worker manager with a new version and deploy the new version of EdgeWorker
 - Step 6: In Akamai Propery, add queue-it required **hidden** variables named as 
   - 'PMUSER_QUEUEIT_CUSTOMERID', 'PMUSER_QUEUEIT_SECRET_KEY', 'PMUSER_QUEUEIT_CONFIG_TYPE' and 'PMUSER_QUEUEIT_API_KEY'
   - **Section [QueueIT variables](#queueit-variables) describes queue-it variables in detail.**
 - Step 7: In Akamai Property, create a behaviour for the URL/Hostname/Conditions where the edge worker will apply choose the name of EdgeWorker created in the upper section (make sure you are not executing edgeworker for static resources)
 - [Step 8: Add a Site Failover behavior to retry if EdgeWorker fails](#adding-a-site-failover-behaviour)
 - [Step 9: Add a user varible PMUSER_TRUE_CLIENT_IP and a behaviour to set PMUSER_TRUE_CLIENT_IP variable to {{builtin.AK_CLIENT_REAL_IP}}](#adding-set-ip-behaviour)
 - Step 10: Add integration config download criteria condition, behavior and cache if integration config download method is used.
 - Step 11: Deploy the updated Akamai Property configuration

** https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-53F43F70-BEBC-4BA4-A2FB-3F23A6125106.html 

## Adding a Site Failover behaviour
EdgeWorks may fail to execute, the first time they are run on an EdgeServer, so it is recommended to add a Site Failover behaviour to perform a retry when the EdgeWorker execution fails.

First, create a PMUSER variable, with an arbitrary name, and set the value to %(AK_HOST):

![Site Failover PMUSER Variable](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/failover1.png)

Then add a Site Failover behaviour that uses the PMUSER variable from above, and has the following settings:
![Site Failover Behaviour](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/failover2.png)

## Adding Set IP behaviour
Connector might need to validate visitor IP, so you need to define a PMUSER variable with name PMUSER_TRUE_CLIENT_IP and add a behaviour to set the value for this by {{builtin.AK_CLIENT_REAL_IP}} expression.

![Visitor IP Behaviour](https://github.com/queueit/KnownUser.V3.Akamai/blob/master/documentation/setIpVariableBehaviour.png)
## QueueIT variables
To integrate with QueueIT Akamai connector it is required to define queueit variables in your Akamai property.   
These variables should be named as 'PMUSER_QUEUEIT_CUSTOMERID', 'PMUSER_QUEUEIT_CONFIG_TYPE', 'PMUSER_QUEUEIT_SECRET_KEY', 'PMUSER_QUEUEIT_API_KEY' 
and of type **Hidden** in Akamai property manager. The following table describes the options for variable values.

| Variable | Required | Value |
| :---: | :---: | :---: |
| PMUSER_QUEUEIT_CUSTOMERID | Yes | Find your Customer ID in the GO Queue-it Platform. |
| PMUSER_QUEUEIT_SECRET_KEY | Yes | Find your Secret key in the GO Queue-it Platform. |
| PMUSER_QUEUEIT_CONFIG_TYPE | Yes | 'inline' or 'cache' or 'edgekv' |
| PMUSER_QUEUEIT_API_KEY | If 'PMUSER_QUEUEIT_CONFIG_TYPE' is set to cache  | Find your Api key in the GO Queue-it Platform. |
| PMUSER_TRUE_CLIENT_IP | Yes | If enabled at waitingroom, it is used to validate the vistor IP by connector |
| PMUSER_QUEUEIT_EXECUTED | For validation that the Queue-It EdgeWorker was executed | The Queue-It EdgeWorker will set the variable to `true`. This variable can be used in Akamai Property Manager to apply alternative logic if the EdgeWorker was not executed. | 
| PMUSER_QUEUEIT_GENERATE_EQTOKEN| [Advanced enqueue token feature](#using-enqueueToken) | Optional boolean value ('true'/'false') where default is 'false'. |
| PMUSER_QUEUEIT_NO_KEY| [Advanced enqueue token feature](#using-enqueueToken) | Optional boolean value ('true'/'false') where default is 'false'. |
| PMUSER_QUEUEIT_EQTOKEN_VALIDITY | No | Default: 240000 ms if provided value is null or less than 30000 ms |


## Advanced features

### Ignoring OPTIONS requests
If you want to ignore all HTTP OPTIONS request, ex. no triggers will be evaluated, it can be achieved with a global setting.
- Add a variable with name PMUSER_QUEUEIT_IGNORE_REQUESTS and value 'true' to your Akamai property.

### Using EnqueueToken
An enqueue token can be used for allowing access to waiting room(s). Any user without it can't join the queue. The token will be included when the user is redirected from Akamai to the queue. 
[QueueToken](https://github.com/queueit/QueueToken.V1.JavaScript) package has been used to generate this token. The generated token will be valid for 4 minute.

Follow the steps below to enable use of enqueue token:
- The waiting room should be configured to require token to enter it. Use Queue-it Go platform or API to setup your waiting room.
- Add a variable with name PMUSER_QUEUEIT_GENERATE_EQTOKEN and value 'true' to your Akamai property.
- If you are using invite-only WRs simultaneously and want to generate default enqueuetoken on the connector you need set PMUSER_QUEUEIT_NO_KEY to true and in your waitingroom set "Require user identification key" to Disabled.
