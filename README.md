# sample.rtcomm.helpdesk
This is a sample helpdesk web application built on WebRTC and the WebSphere Liberty Rtcomm feature. It demonstrates how the [lib.rtcomm.clientjs](https://github.com/wasdev/lib.rtcomm.clientjs) JavaScript library can be used to build an application that supports the creation of real-time audio/video/chat sessions between a customer and an agent. It includes support for call queuing allowing multiple agents to listen on one or more queues for inbound calls from customers of a web site.

## Setting up Application Environment
To run this demo you will need the following:
- A WebSphere Liberty server configured to run the Rtcomm feature. This feature will need to be configured with at least one call queue for the demo.
- An MQTT message broker that supports Shared Subscriptions.
- A server to host the JavaScript application. This can be the same server in #1 or any other server.

For details on how to download the WebSphere Liberty server go here: [Download WebSphere Liberty](https://developer.ibm.com/wasdev/)<br>For details on how to configure the WebSphere Liberty Rtcomm feature: [Configuring Rtcomm on Liberty](http://www-01.ibm.com/support/knowledgecenter/was_beta_liberty/com.ibm.websphere.wlp.nd.multiplatform.doc/ae/cwlp_rtcomm.html)

## Building and Running The Sample
There are two options for building and running the sample:
- Using [Eclipse with WDT](docs/eclipse-setup.md) (Websphere Developer Tools)
- [Command Line](docs/command-line-setup.md)

## Application Structure
This application was built using Angular.js, Bootstrap and jQuery, along with the Rtcomm clientjs library and an Rtcomm Angular.js module.

## Debugging Application
To enable debug tracing in the rtcomm angular module open the [rtcomm-services.js](https://github.com/WASdev/sample.rtcomm.helpdesk/blob/develop/js/libs/rtcomm/rtcomm-services.js) file and change:

_$logProvider.debugEnabled(**false**)_ to _$logProvider.debugEnabled(**true**)_

To enable debug tracing in the core rtcomm clientjs library, open the [rtcomm-services.js](https://github.com/WASdev/sample.rtcomm.helpdesk/blob/develop/js/libs/rtcomm/rtcomm-services.js) file and uncomment one of these lines:

_myEndpointProvider.setLogLevel('DEBUG');_<br>_myEndpointProvider.setLogLevel('MESSAGE');_  

## Application Library Versions
This section outlines the lib versions currently contained in this sample application:
- angularjs v1.4.5
- angular-rtcomm v1.0.0 ([http://github.com/WASdev/lib.angular-rtcomm](http://github.com/WASdev/lib.angular-rtcomm))
