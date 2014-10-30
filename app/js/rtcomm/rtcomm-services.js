/**
 *
 */
var rtcommApp = angular.module('rtcommApp', ['angularModalService']);

/**
 *
 */
rtcommApp.factory('RtcommConfig', function rtcommConfigFactory(){

	var providerConfig = {
		    server : 'svt-msd4.rtp.raleigh.ibm.com',
		    port : 1883,
	    	rtcommTopicPath : "/rtcomm/",
		    createEndpoint : false,
            appContext: 'rtcommHelpdesk'
		  };

	  var endpointConfig = {
	          chat: true,
	          webrtc: true
	        };

	return {
		setConfig : function(config){
			console.log('RtcommConfig: setConfig: ');
			providerConfig.server = (typeof config.server !== "undefined")? config.server : providerConfig.server;
			providerConfig.port = (typeof config.port !== "undefined")? config.port : providerConfig.port;
			providerConfig.rtcommTopicPath = (typeof config.rtcommTopicPath !== "undefined")? config.rtcommTopicPath : providerConfig.rtcommTopicPath;
			providerConfig.createEndpoint = (typeof config.createEndpoint !== "undefined")? config.createEndpoint : providerConfig.createEndpoint;
			providerConfig.appContext = (typeof config.appContext !== "undefined")? config.appContext : providerConfig.appContext;

			endpointConfig.chat= (typeof config.chat!== "undefined")? config.chat: providerConfig.chat;
			endpointConfig.webrtc = (typeof config.webrtc!== "undefined")? config.webrtc: providerConfig.webrtc;
			
			if (typeof config.userid !== "undefined")
				endpointConfig.userid = config.userid;
		},

		getProviderConfig : function(){return providerConfig;},

		getEndpointConfig : function(){return endpointConfig;}
	};
});

rtcommApp.factory('RtcommService', function ($rootScope, RtcommConfig) {
	  console.log('rtcommService: Creating the Rtcomm EnpdointProvider');

	  /** Setup the endpoint provider first **/
	  var myEndpointProvider = new ibm.rtcomm.RtcommEndpointProvider();
	  var endpointProviderInitialized = false;
	  var endpointList = [];
	  var queueList = null;

	  myEndpointProvider.setLogLevel('DEBUG');
    /*
	  myEndpointProvider.setLogLevel('MESSAGE');
	  */

	  myEndpointProvider.setAppContext(RtcommConfig.getProviderConfig().appContext);

	  myEndpointProvider.on('queueupdate', function(queuelist) {
		  console.log('queueupdate', queuelist);
		  $rootScope.$broadcast('queueupdate', queuelist);
	  });

	  myEndpointProvider.on('newendpoint', function(eventObject) {
		  var endpoint = eventObject.endpoint;
		  registerEndpointCallbacks(endpoint);
		  $rootScope.$broadcast('newendpoint', endpoint);
	  });

	  var initSuccess = function(event) {
		console.log('Endpoint provider: inited: event:', event);
		var broadcastEvent = {
			  'ready': event.ready,
			  'registered': event.registered,
			  'endpoint': event.endpoint,
			  'userid' : RtcommConfig.getProviderConfig().userid
			  };

		$rootScope.$broadcast('init', true, broadcastEvent);
	  };

	  var initFailure = function(error) {
        console.log('Endpoint provider: init failed: error: ',error);
        $rootScope.$broadcast('init', false, error);
     };
     
     var callback = function(eventObject) { 
    	 		console.log('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
    	 		$rootScope.$broadcast(eventObject.eventName, eventObject);
    	 	};
     
	 var registerEndpointCallbacks = function(endpoint) {
		  console.log('RtcommService: registerEndpointCallbacks');

		  // These are all the session related events.
		  endpoint.on('session:started', callback);
		  endpoint.on('session:alerting', callback);
		  endpoint.on('session:ringing', callback);
		  endpoint.on('session:failed', callback);
		  endpoint.on('session:rejected', callback);
		  endpoint.on('session:stopped', callback);
		  
		  // These are all the WebRTC related events.
		  endpoint.on('webrtc:connected', callback);
		  endpoint.on('webrtc:disconnected', callback);

		  // These are all the chat related events.
		  endpoint.on('chat:connected', callback);
		  endpoint.on('chat:disconnected', callback);
		  endpoint.on('chat:message', callback);
		  endpoint.on('destroyed', callback);
	  };

	  return {
			setConfig : function(config){
				console.log('RtcommService: setConfig: ');

				RtcommConfig.setConfig(config);

				if (endpointProviderInitialized == false){
					if (RtcommConfig.getEndpointConfig().userid != ''){
						  myEndpointProvider.init(RtcommConfig.getProviderConfig(), initSuccess, initFailure);
						  endpointProviderInitialized = true;
					}
				}
			},

			getEndpoint : function(id) {
			  console.log('RtcommService: getEndpoint: id = ' + id);
			  var endpoint = null;

			  /*
			   * If endpointID is undefined, then return the first endpoint in the list or if null, create a new one.
			   * If endpointID is null, create a new one.
			   * If endpointID is valid, get the endpoint from the provider.
			   */
			  if (typeof id === "undefined"){
				  if (typeof endpointList[0] !== "undefined"){
					  endpoint = endpointList[0];
					  console.log('RtcommService: grabbing existing endpoint: id = ' + endpoint.id);
				  }
				  else{
					  console.log('RtcommService: no existing endpoint: id = null');
					  id = null;
				  }
			  }
			  else if (id !== null){
				  endpoint = myEndpointProvider.getRtcommEndpoint(id);
			  }

			  if (endpoint == null){
				  endpoint = myEndpointProvider.createRtcommEndpoint(RtcommConfig.getEndpointConfig());
				  endpointList.push(endpoint);
				  registerEndpointCallbacks(endpoint);
			  }
			  return (endpoint);
		   },

		  destroyEndpoint : function(id) {
		   },

		  register : function(userid) {
			   if (endpointProviderInitialized == false){
				   RtcommConfig.getEndpointConfig().userid = userid;

				   myEndpointProvider.init(RtcommConfig.getProviderConfig(), initSuccess, initFailure);
				   endpointProviderInitialized = true;
			   }
			   else
				   console.log('rtcomm-services: ERROR: endpoint provider already initialized');
		   },

		   unregister : function() {
		   },

		   joinQueue : function(queueID) {
			   myEndpointProvider.joinQueue(queueID);
		   },

		   leaveQueue : function(queueID) {
			   myEndpointProvider.leaveQueue(queueID);
		   },

		   getQueues : function() {
			   return(queueList);
			}
		};
});
