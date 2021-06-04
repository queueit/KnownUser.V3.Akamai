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
Installing the edge worker the first time requires uploading an archive file (TGZ format) to the Edge Worker manager in the Akamai Control Center. Once uploaded, the service worker code can be customized and updated with specific configurations (protection schema) managed and exported from the Queue-it GO Platform. 
 - Step 1: Download all js files plus bundle.json and create bundle and upload to Akamai Edge Worker manager **
 - Step 2: Create desired waiting room(s), triggers, and actions in GO. Then, save/publish the Configuration. 
 - Step 3: Replace/dowoload the integration config in Edgeworker by updating integrationConfigProvider.js file.			
 - Step 4: Upload the Queue-it edge worker bundle
 - Step 5: Update the bundle.js file in the Edge Worker manager with a new version and deploy the new version of EdgeWorker
 - Step 6: In your Property, create a behaviour for the URL/Hostname/Conditions where the edge worker will apply choose the name of EdgeWorker created in the upper section (make sure you are not executing edgeworker for static resources)
 - Step 7: Add a Site Failover behavior to retry if EdgeWorker fails
 - Step 8: Add integration config download criteria condition, behavior and cache if integration config download method is used.
 - Step 9: Deploy the updated Akamai Property configuration

** https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-53F43F70-BEBC-4BA4-A2FB-3F23A6125106.html 

### Providing the queue configuration
The configuration specifies a set of Triggers and Actions. A Trigger is an expression matching one, more or all URLs on your website. 
When a user enter your website and the URL matches a Trigger-expression the corresponding Action will be triggered. 
The Action specifies which queue the users should be send to. 
In this way you can specify which queue(s) should protect which page(s) on the fly without changing the server-side integration.

This configuration can then be used in Edge Worker by two ways.
  
#### Replacing integration config within Edge worker
Latest integration config can be download from Go platform and then can be updated by replacing "integrationConfig" variable value in integrationConfigProvider.js file.

#### Download and cache integration config within Edge worker
Integration config can be downloaded from Queue-I server by calling Queue-IT API endpoint and then can be cached in akamai network. Use [Customer API-Key] as request header and make sub call from Edgeworker to akamai network to donwload the integration config. Configure the akamai property to use caching behavior to cache the config value. 

### Property configuration to download integration config
Add following property configuration in the pictures to download integration config and cache it.

![Download integration config criteria](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/integrationConfigDonloadCriteria.PNG)

![Download integration config Behaviour](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/integrationConfigDonloadBehavior.PNG)

![Download integration config cache](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/integrationConfigCache.PNG)

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
