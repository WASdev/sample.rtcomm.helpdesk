sample.rtcomm.helpdesk
======================

This is a sample helpdesk web application built on WebRTC and the WebSphere Liberty Rtcomm feature. It demonstrates how the [lib.rtcomm.clientjs](https://github.com/wasdev/lib.rtcomm.clientjs) JavaScript library can be used to build an application that supports the creation of real-time audio/video/chat sessions between a customer and an agent. It includes support for call queuing allowing multiple agents to listen on one or more queues for inbound calls from customers of a web site. 

## Application Setup
To run this demo you will need the following:

* A WebSphere Liberty server configured to run the Rtcomm feature. This feature will need to be configured with at least one call queue for the demo.
* An MQTT message broker that supports Shared Subscriptions.
* A server to host the JavaScript application. This can be the same server in #1 or any other server.

For details on how to download the WebSphere Liberty server go here: [Download WebSphere Liberty](https://developer.ibm.com/wasdev/)  
For details on how to configure the WebSphere Liberty Rtcomm feature: [Configuring Rtcomm on Liberty](http://www-01.ibm.com/support/knowledgecenter/was_beta_liberty/com.ibm.websphere.wlp.nd.multiplatform.doc/ae/cwlp_rtcomm.html)

## Application Configuration
The customer and agent are each configured through the following JSON files contained in the root directory:

  * agentConfig.json  
  * customerConfig.json  

The RtcommConfigController angular controller located on the customerHome.html and agentHome.html pages are used to pull in these config files. Here is an example of the customerConfig:

* "server" : "192.84.45.43", - Address of the MQTT message broker.
* "port" : 80,  - Port of the MQTT message broker.
* "rtcommTopicPath" : "/rtcomm-helpdesk-ibm/",  - Main rtcomm topic path (same as the rtcom topic path configured at the Liberty server).
* "broadcastAudio" : true,  - Enable the client to broadcast WebRTC audio when available.
* "broadcastVideo" : true  - Enable the client to broadcast WebRTC video when available.

In addition, the "userid" can be configured. This represents the Rtcomm endpointID associated with this client. If included as an empty string ("userid" : ""), the rtcomm Registration directive can be used to specify the endpointID associated with this client. See the agent for an example of this. If undefined, the userid will be generated by the rtcomm lib.

## Deployment
If deploying this application to a J2EE application server like WebSphere, you will need to copy the contents of this repository to the WebContent directory of an Eclipse J2EE project from which a WAR file can be extracted. Since this application is completed contained in HTML, JavaScript and CSS files, it can be hosted on any web server or a server like Node.js.

## Running
The home page for the helpdesk sample application is index.html which is located in the root directory of this repository. From here you can enter the demo as either a customer or agent. The HTML associated with the client and agent are also contained in the root directory.

## Structure
This application was built using Angular.js, Bootstrap and jQuery, along with the Rtcomm clientjs library and an Rtcomm Angular.js module. The application is organized as follows:

root/ - Contains the index.html, sample JSON config files and other HTML pages related to this dmeo.  
-js/  
--libs/  
---angular/ - The angular related components    
---boostrap/ - The bootstrap related components  
---jquery/ - The jquery related components  
---rtcomm/ - The rtcomm related js components including angular directives, services, rtcomm lib and mqtt lib.  
-templates/  
--rtcomm/ - rtcomm angular templates  
---css/ - style sheet for rtcomm angular templates.

## Application Debugging
To enable debug tracing in the rtcomm angular module open the [rtcomm-services.js](https://github.com/WASdev/sample.rtcomm.helpdesk/blob/develop/js/libs/rtcomm/rtcomm-services.js) file and change:

*$logProvider.debugEnabled(**false**)* to *$logProvider.debugEnabled(**true**)*

To enable debug tracing in the core rtcomm clientjs library, open the [rtcomm-services.js](https://github.com/WASdev/sample.rtcomm.helpdesk/blob/develop/js/libs/rtcomm/rtcomm-services.js) file and uncomment one of these lines:

*myEndpointProvider.setLogLevel('DEBUG');*  
*myEndpointProvider.setLogLevel('MESSAGE');*  

