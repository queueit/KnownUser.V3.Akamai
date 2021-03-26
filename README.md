# KnownUser.V3.Akamai

The Queue-it Security Framework ensures that end-users are not able to access your online application without first going through the queue for any and all “protected” areas and paths on your sites. The queue system is implemented by adding a server-side (request-level) integration that protects your online application by redirecting users to a waiting room according to web traffic settings in the Queue-it GO Platform. After the integration is complete, queue system behavior and operations are managed in Queue-it’s Go Platform and/or via the Queue-it Admin API.

This Akamai Connector SDK uses Akamai Edge Workers (aka, Queue-it’s “serverless” server-side KnownUser integration) to integrate Queue-it functionality into Akamai’s proxy network. Because the Akamai platform contains a large collection of tools, the Queue-it Edge Worker can be implemented as a standalone service or alongside other Akamai capabilities, such as Page/Property Manager rules, Bot Manager, and HMAC (“dynamic hash”) filtering.

A subscription / access to Akamai Edge Workers is required to utilized this connector.

>You can find the latest released version [here](https://github.com/queueit/KnownUser.V3.Akamai/releases/latest).

# Queue-it KnownUser Connector for Akamai Edge Worker
The Queue-it Security Framework ensures that end users cannot bypass the queue by adding a server-side integration to your server.

## Installation
Installing the edge worker the first time requires uploading an archive file (TGZ format) to the Edge Worker manager in the Akamai Control Center. Once uploaded, the service worker code can be customized with a specific configuration (protection schema) created and downloaded from the Queue-it GO Platform. 
 - Step 1
 - Step 2
 - Step 3

## Introduction
When a user is redirected back from the queue to your website, the queue engine can attache a query string parameter (`queueittoken`) containing some information about the user. 
The most important fields of the `queueittoken` are:

 - q - the users unique queue identifier
 - ts - a timestamp of how long this redirect is valid
 - h - a hash of the token

The high level logic is as follows:

![The KnownUser validation flow](https://github.com/queueit/KnownUser.V3.JAVA/blob/master/Documentation/KnownUserFlow.png)

![Edge Worker Integration / Logical Flow](https://github.com/queueit/KnownUser.V3.JAVA/blob/master/Documentation/KnownUserFlow.png)

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

This configuration can then be downloaded to your application server as shown in the *[IntegrationConfigProvider](https://github.com/queueit/KnownUser.V3.JAVA/blob/master/Documentation/IntegrationConfigProvider.java)* example.  

### 2. Validate the `queueittoken` and store a session cookie
To validate that the user has been through the queue, use the `KnownUser.validateRequestByIntegrationConfig()` method. 
This call will validate the timestamp and hash and if valid create a "QueueITAccepted-SDFrts345E-V3_[EventId]" cookie with a TTL as specified in the configuration.
If the timestamp or hash is invalid, the user is send back to the queue.


## Implementation
The KnownUser validation must be done on all requests except requests for static and cached pages, resources like images, css files and .... So, if you add the KnownUser validation logic to a central place, then be sure that the Triggers only fire on page requests (including ajax requests) and not on e.g. image. 

## Protecting POST requests
The Akamai edge worker can see and respond to GET requests. POST requests, such as to API endpoints, can also be protected by adding a second Property Manager configuration that validates the Queue-it cookie before allowing a POST to proceed to the origin.

A sample PM configuration is provided:



## Alternative Implementation
If your application server (maybe due to security reasons) is not allowed to do external GET requests, then you have three options:

1. Manually download the configuration file from Queue-it Go self-service portal, save it on your application server and load it from local disk
2. Use an internal gateway server to download the configuration file and save to application server
3. Specify the configuration in code without using the Trigger/Action paradigm. In this case it is important *only to queue-up page requests* and not requests for resources. This can be done by adding custom filtering logic before caling the KnownUser.resolveQueueRequestByLocalConfig() method.


The following is an example of how to specify the configuration in code:
 
```
    private void doValidationByLocalEventConfig(HttpServletRequest request, HttpServletResponse response) {
        try {
                       
            String customerId = "Your Queue-it customer ID";
            String secretKey = "Your 72 char secrete key as specified in Go Queue-it self-service platform";

            String queueitToken = request.getParameter(KnownUser.QueueITTokenKey);
            String pureUrl = getPureUrl(request);
            
            QueueEventConfig eventConfig = new QueueEventConfig();
            eventConfig.setEventId("event1"); //ID of the queue to use           
            //eventConfig.setCookieDomain(".mydomain.com"); //Optional - Domain name where the Queue-it session cookie should be saved. 
            eventConfig.setQueueDomain("queue.mydomain.com"); //Domain name of the queue. 
            eventConfig.setCookieValidityMinute(15); //Validity of the Queue-it session cookie should be positive number.
            eventConfig.setExtendCookieValidity(true); //Should the Queue-it session cookie validity time be extended each time the validation runs?
            //eventConfig.setCulture("en-US"); //Optional - Culture of the queue layout in the format specified here: https://msdn.microsoft.com/en-us/library/ee825488(v=cs.20).aspx. If unspecified then settings from Event will be used.
            //eventConfig.setLayoutName("MyCustomLayoutName"); //Optional - Name of the queue ticket layout.If unspecified then settings from Event will be used.
            
            //Verify if the user has been through the queue
            RequestValidationResult validationResult = KnownUser.resolveQueueRequestByLocalConfig(pureUrl, queueitToken, eventConfig, customerId, request, response, secretKey);

            if (validationResult.doRedirect()) {
                //Adding no cache headers to prevent browsers to cache requests
                response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
                response.setHeader("Pragma", "no-cache");
                response.setHeader("Expires", "Fri, 01 Jan 1990 00:00:00 GMT");
                //end
		 if (validationResult.isAjaxResult) {
                    //In case of ajax call send the user to the queue by sending a custom queue-it header and redirecting user to queue from javascript
                    response.setHeader(validationResult.getAjaxQueueRedirectHeaderKey(), validationResult.getAjaxRedirectUrl());
                } else {
                    //Send the user to the queue - either becuase hash was missing or becuase is was invalid
                    response.sendRedirect(validationResult.getRedirectUrl());
                }               
            } else {
                String queryString = request.getQueryString();
                //Request can continue - we remove queueittoken form querystring parameter to avoid sharing of user specific token
                if (queryString != null && queryString.contains(KnownUser.QueueITTokenKey) && validationResult.getActionType() == "Queue") {
                    response.sendRedirect(pureUrl);
                }
            }
        } catch (Exception ex) {
            // There was an error validating the request
            // Use your own logging framework to log the error
            // This was a configuration error, so we let the user continue     
        }
    }
```
