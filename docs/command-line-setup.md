# Command Line
### Clone the Git Repo
Clone the repository into a directory (i.e. $HOME/sample.rtcomm.helpdesk)

```
$ git clone https://github.com/WASdev/sample.rtcomm.helpdesk.git
```
### Configuration

View the configuration section on the home page: [README.md](../README.md)

### Building the Sample Using [Apache Maven](https://maven.apache.org/)
Change to the created project directory and use Maven to build the sample. The following will happen:
- Web application (_rtcomm.helpdesk.app_) is built and packaged as a .war file
- Liberty is downloaded to the project
- Application is installed to the server and the server is assembled and packaged. (_rtcomm.helpdesk.wlpcfg_)
- Integration testing will occur using Selenium Webdriver

Run this command to fully build and test the project
```bash
$ mvn install
```
Else if you don't want to run the integration tests and just build it run (disables the E2E profile):
```bash
$ mvn install -P-E2E
```

This may take a few minutes to complete because it installs NodeJS and Websphere Liberty as dependencies.

### Running the Sample Locally

The build should have downloaded a Liberty install. You can run the sample by executing the maven liberty goal, if no MQTT Server is specified, by default it will use <code>messagesight.demos.ibm.com</code> as the MQTT Server.

```
$ mvn -f rtcomm.helpdesk.wlpcfg/pom.xml liberty:run-server
```
Access the sample at: [http://localhost:9080](http://localhost:9080)
### Additional Configurations
To have the sample change the <code>topic path</code>, <code>MQTT Server</code> or the <code>WebSocket Port</code> define the properties when calling mvn install:

```
$ mvn install -DrtcommTopicPath=<TOPICPATH> -DmqttServerHostname=<HOSTNAME> -DwebSocketPort=<PORT_NUMBER>
```

As an example:
```
$ mvn install -DrtcommTopicPath=helpdesk -DmqttServerHostname=localhost -DwebSocketPort=8083
```

<!-- ### Deploying the Sample to Bluemix
You will need to download and install the [Cloud Foundry command line interface](https://www.ng.bluemix.net/docs/starters/install_cli.html), this can be used to deploy and manage applications on Bluemix. Once the Cloud Foundry tools are installed you can simply push the packaged server:

```
 $ cf push <appName> -p rtcomm.helpdesk.wlpcfg/servers/RtcommHelpdeskServer/RtcommHelpdeskServer.zip
``` -->
