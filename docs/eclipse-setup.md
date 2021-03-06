### Eclipse with WDT

[Install WDT on Eclipse](https://developer.ibm.com/wasdev/downloads/liberty-profile-using-eclipse/)


#### Clone the Git Repo

1. Open the Git repositories view
  +  *Window -> Show View -> Other...*
  + Type *git* in the filter box and select **Git Repositories** and click 'OK'
  + Click on *Clone a Git Repository*
2. Copy and paste the Github repository URI (https://github.com/WASdev/sample.rtcomm.helpdesk.git) to the Location URI text field on Eclipse
3. Click 'Next', select only the 'master' branch, uncheck the other branches that may have been selected and Click 'Next'
4. Click on 'Finish'

#### Building with Maven

###### Import Maven projects into WDT

1. In the *Git Repositories* view, expand the **sample.rtcomm.helpdesk** repo
2. Right-click on the "Working Directory" folder and select "Copy Path to Clipboard"
3. Select *File -> Import -> Maven -> Existing Maven Projects*, then click 'Next'
4. In the Root Directory textbox, Paste in the repository directory (from Step 2)
5. Select Browse... and confirm 3 pom.xml files are selected, click "Finish"
6. Eclipse will create 3 projects:
  + *rtcomm.helpdesk.app* - Application part of the sample
  + *rtcomm.helpdesk.wlpcfg* - Liberty server configuration of the sample
  + *sample.rtcomm.helpdesk* - Root directory of the sample


##### Configuration
**Important**: View the configuration section on the home page of the Github repo: [README.MD](../README.md)


###### Run Maven Install
1. Expand the **sample.rtcomm.helpdesk** project and right-click on sample.rtcomm.helpdesk/pom.xml
2. *Run As -> Maven Build...*
3. In the **Goals** section enter "install"
4. Click 'Run',the build takes a few minutes to complete.

#### Run the application locally

###### Create a runtime Environment in Eclipse

1. Open the 'Runtime Explorer' view
  + *Window -> Show View -> Other*
  + Type *runtime* in the filterbox and select **Runtime Explorer** and Click 'OK'
2. Right-click below in the view and select *New -> Runtime Environment...*
3. Give the Runtime environment a name, e.g.
`wlp-2015.8.0.0` if you're using the August 2015 release
4. Create the runtime environment either:
  + Select an existing installation
  + Select *Install from an archive or a repository* to download a new Liberty archive
5. Follow the prompts:
  + If you decided to download Liberty, choose "WAS Liberty V8.5.5.7 Web Profile " please install the following add-ons when prompted
    + `Real-Time Communications [rtcomm-1.0]` "rtcomm" in the text filter


###### Add the User Directory from the Maven project and create a Server

1. Right-click on the Runtime Environment created above located in the 'Runtime Explorer' view and select 'Edit'
2. Click the Advanced Options...
3. If the *rtcomm.helpdesk.wlpcfg* directory is not listed, we need to add it:
  1. Click New
  2. Select the *rtcomm.helpdesk.wlpcfg* project
  3. Select *Finish, Ok, Finish*
4. Right-click on the *rtcomm.helpdesk.wlpcfg* user directory listed under the target Runtime Environment in the Runtime Explorer View and select *New -> Server...*.
5. A dialog should appear and select the **RtcommHelpdeskServer** Liberty Profile server from the dropdown menu. The default name for this server can vary, you might also opt to rename it from the Right-click menu in the Servers view to make it easier to identify.
6. Click Finish

###### Running Liberty and the sample application from WDT

1. Select the 'rtcomm.helpdesk.app' project
2. Right-click -> *Run As ... -> Run On Server*
3. Select the appropiate server (as created above) and select *Finish*
4. Open the sample at http://localhost:9080/ using either Firefox or Chrome

If you encounter a validation error running app on the Server:
1. Open the *Servers* view
2. Right-click on the server that was created earlier (if you opted out, by default it will contain *RtcommHelpdeskServer* in its name)
3. Click *Start* to start the Server.
4. Open the sample at http://localhost:9080/ using either Firefox or Chrome


:star: *Note:* Some versions of WDT incorrectly map the cdi-1.2 dependency to the CDI 1.0 Facet, which prevents the *Run As ...* operation in step 2 from succeeding. If this happens, Right-click on the `rtcomm.helpdesk.app` project, and select *Properties*, then select *Project Facets* in the left-hand pane. Change the the "Context and dependency injection (CDI)" facet to use version 1.2, at which point, step 2 (above) should work.

#### Additional Configurations
To have the sample change the <code>topic path</code>, <code>MQTT Server</code> or the <code>WebSocket Port</code> define the properties when calling mvn install:

```
$ mvn install -DrtcommTopicPath=<TOPICPATH> -DmqttServerHostname=<HOSTNAME> -DwebSocketPort=<PORT_NUMBER>
```

As an example:
```
$ mvn install -DrtcommTopicPath=helpdesk -DmqttServerHostname=localhost -DwebSocketPort=8083
```

<!-- ###### Deploying the application to Bluemix


Requires: [IBM Eclipse Tools for Bluemix]

You'll need to create a Bluemix server:
1. 'Click' on the servers tab in Eclipse
2. Select _new > server_
3. Select the server type as __IBM Bluemix__, give the server a name
4. Click _Next_ and enter your credentials
5. Choose your organization/space
6. Drag and drop the _RtcommHelpdeskServer.zip_ file (in rtcomm.helpdesk.wlpcfg/servers/RtcommHelpdeskServer/) into the Bluemix server. Fill the Bluemix server information. -->
