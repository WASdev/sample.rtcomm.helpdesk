# sample.rtcomm.helpdesk
This is a sample helpdesk web application built on [WebRTC](https://webrtc.org/) and [WebSphere Liberty](https://developer.ibm.com/wasdev/websphere-liberty/) and the [Rtcomm feature](https://www.ibm.com/support/knowledgecenter/SSEQTP_8.5.5/com.ibm.websphere.wlp.doc/ae/cwlp_rtcomm.html). It demonstrates how the [lib.rtcomm.clientjs](https://github.com/wasdev/lib.rtcomm.clientjs) JavaScript library can be used to build an application that supports the creation of real-time audio/video/chat sessions between a customer and an agent. It includes support for call queuing allowing multiple agents to listen on one or more queues for inbound calls from customers of a web site.

## Building and Running The Sample
There are two options for building and running the sample:
- Using [Eclipse with WDT](docs/eclipse-setup.md) (Websphere Developer Tools)
- [Command Line](docs/command-line-setup.md)


## Configuration
Go to <code>pom.xml</code> found in the root directory of the project (_sample.rtcomm.helpdesk/pom.xml_)

Edit the property values accordingly, you may leave the server hostname or change it as you wish. But if you leave the <code>mqttServerHostname</code> property  value as <code>messagesight.ibm.demos.com</code>,**change the <code>rtcommTopicPath</code> value**!

```xml

<properties>
...

	<!--  Change to your prefered broker address -->
	<mqttServerHostname>messagesight.demos.ibm.com</mqttServerHostname>

	<!--  Change for fixed topic path -->
	<rtcommTopicPath>helpdesk-demo</rtcommTopicPath>

	<!--  Change the TCP Port to which your Liberty instance will connect -->
	<mqttServerPort>1883</mqttServerPort>

	<!--  Websocket port the browser client should connect to -->
	<webSocketPort>1883</webSocketPort>

...
</properties>

```

These properties can also be changed when building through the command line or using Maven commands:
```bash
$ mvn install -DrtcommTopicPath=<TOPICPATH> \
	-DmqttServerHostname=<HOSTNAME> \
	-DmqttServerPort=<TCP_PORT_NUMBER> \
	-DwebSocketPort=<PORT_NUMBER>
	
```
As an example:
```bash
$ mvn install -DrtcommTopicPath=helpdesk \
	-DmqttServerHostname=localhost \
	-DmqttServerPort=1883 \
	-DwebSocketPort=8083
```

## Application Dependencies

The web application was built using the [angular-rtcomm](https://github.com/WASdev/lib.angular-rtcomm) framework, which uses [AngularJS](https://angularjs.org/) and [Bootstrap](http://getbootstrap.com/).

The backend (where the hosted is server) and how the call queue is managed is with [Websphere Liberty](https://developer.ibm.com/wasdev/websphere-liberty/) using the [rtcomm-1.0](https://www.ibm.com/support/knowledgecenter/SSEQTP_8.5.5/com.ibm.websphere.wlp.doc/ae/cwlp_rtcomm.html) feature.

[Karma](https://karma-runner.github.io/0.13/index.html) and [Protractor](http://www.protractortest.org/#/) where used for unit and integration testing respectively.

[Maven](https://maven.apache.org/what-is-maven.html)  is the build tool for the application along with the [ci.maven](https://github.com/WASdev/ci.maven) to manage Liberty profile servers.


## Debugging Application
To enable debug tracing in the rtcomm angular module open the [rtcomm-services.js](https://github.com/WASdev/sample.rtcomm.helpdesk/blob/develop/js/libs/rtcomm/rtcomm-services.js) file and change:

_$logProvider.debugEnabled(**false**)_ to _$logProvider.debugEnabled(**true**)_

To enable debug tracing in the core rtcomm clientjs library, open the [rtcomm-services.js](https://github.com/WASdev/sample.rtcomm.helpdesk/blob/develop/js/libs/rtcomm/rtcomm-services.js) file and uncomment one of these lines:

_myEndpointProvider.setLogLevel('DEBUG');_<br>_myEndpointProvider.setLogLevel('MESSAGE');_  



# License

```text
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

    ```
