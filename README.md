# KnownUser.V3.Akamai

The Queue-it Security Framework ensures that end-users are not able to access your online application without first going through the queue for any and all “protected” areas and paths on your sites. The queue system is implemented by adding a server-side (request-level) integration that protects your online application by redirecting users to a waiting room according to web traffic settings in the Queue-it GO Platform. After the integration is complete, queue system behavior and operations are managed in Queue-it’s Go Platform and/or via the Queue-it Admin API.

This Akamai Connector SDK uses Akamai Edge Workers (aka, Queue-it’s server-side KnownUser connector) to integrate Queue-it functionality into Akamai’s proxy network. Because the Akamai platform contains a large collection of tools, the Queue-it Edge Worker can be implemented as a standalone service or alongside other Akamai capabilities, such as Page/Property Manager rules, Bot Manager, and HMAC (“dynamic hash”) POST filtering.

A subscription / access to Akamai Edge Workers is required to utilize this connector, and Akamai resources and professional services should be consulted.

>You can find the latest released version [here](https://github.com/queueit/KnownUser.V3.Akamai/releases/latest).

# Queue-it KnownUser Connector for Akamai Edge Worker
The Queue-it Security Framework ensures that end users cannot bypass the queue by adding a server-side integration to your server.

## Installation
Installing the edge worker the first time requires uploading an archive file (TGZ format) to the Edge Worker manager in the Akamai Control Center. Once uploaded, the service worker code can be customized and updated with specific configurations (protection schema) managed and exported from the Queue-it GO Platform. 
 - Step 1: Download all SDK files and create bundle for upload to Akamai Edge Worker manager **
 - Step 2: Create Property Manager rule in Akamai for the URL/Hostname/Conditions where the edge worker will apply
 - Step 3: Create desired waiting room(s), triggers, and actions in GO. Then, save/publish an download the Configuration.
 - Step 4: Upload the Queue-it edge worker bundle (NOTE: The default configuration is to protect everything specified by the PM config)
 - Step 5: Update the IntegrationConfiguration.js file in the Edge Worker manager with the latest Queue-it configuration
 - Step 6: Update the bundle.js file in the Edge Worker manager with a new version and description
 - Step 7: Deploy the updated Akamai PM configuration

** https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-user-guide/GUID-53F43F70-BEBC-4BA4-A2FB-3F23A6125106.html 

## Introduction
When a user is redirected back from the queue to your website, the queue engine can attache a query string parameter (`queueittoken`) containing some information about the user. 
The most important fields of the `queueittoken` are:

 - q - the users unique queue identifier
 - ts - a timestamp of how long this redirect is valid
 - h - a hash of the token

The high level logic is as follows:

![Edge Worker Integration / Logical Flow](https://github.com/queueit/KnownUser.V3.Akamai/blob/main/akamai_edge_worker_diagram_v0.2.png)

 1. User requests a page on your server
 2. The validation method sees that the has no Queue-it session cookie and no `queueittoken` and sends him to the correct queue based on the configuration
 3. User waits in the queue
 4. User is redirected back to your website, now with a `queueittoken`
 5. The validation method validates the `queueittoken` and creates a Queue-it session cookie
 6. The user browses to a new page and the Queue-it session cookie will let him go there without queuing again

## How to validate a user
To validate that the current user is allowed to enter your website (has been through the queue) these steps are needed:

 1. Providing the queue configuration to the KnownUser validation
 2. Validate the `queueittoken` and store a session cookie

### 1. Providing the queue configuration
The recommended way is to use the Go Queue-it self-service portal to setup the configuration. 
The configuration specifies a set of Triggers and Actions. A Trigger is an expression matching one, more or all URLs on your website. 
When a user enter your website and the URL matches a Trigger-expression the corresponding Action will be triggered. 
The Action specifies which queue the users should be send to. 
In this way you can specify which queue(s) should protect which page(s) on the fly without changing the server-side integration.

This configuration can then be downloaded and saved within the Edge Worker configuration in the Akamai Control Center.  

### 2. Validate the `queueittoken` and store a session cookie
To validate that the user has been through the queue, use the `KnownUser.validateRequestByIntegrationConfig()` method. 
This call will validate the timestamp and hash and if valid create a "QueueITAccepted-SDFrts345E-V3_[EventId]" cookie with a TTL as specified in the configuration.
If the timestamp or hash is invalid, the user is send back to the queue.

## Implementation
The KnownUser validation must be done on all requests except requests for static and cached pages, resources like images, css files and .... So, if you add the KnownUser validation logic to a central place, then be sure that the Triggers only fire on page requests (including ajax requests) and not on e.g. image. 

## Protecting POST requests
The Akamai edge worker can see and respond to GET requests. POST requests, such as to API endpoints, can also be protected by adding a second Property Manager configuration that validates the Queue-it cookie before allowing a POST to proceed to the origin.

A sample PM configuration is provided:

-LINK TO HMAC/POST FILTER PM CONFIG
