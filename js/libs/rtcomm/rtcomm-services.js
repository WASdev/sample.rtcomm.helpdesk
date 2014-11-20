/**
 * Definition for the 
 */
var rtcommModule = angular.module('rtcommModule', ['angularModalService','ui.bootstrap','treeControl']);

/**
 * Set debugEnaled to true to enable the debug messages in this rtcomm angule module.
 */
rtcommModule.config(function($logProvider){
	  $logProvider.debugEnabled(true);
	});

/**
 *
 */
rtcommModule.factory('RtcommConfig', function rtcommConfigFactory(){

	var providerConfig = {
		    server : 'svt-msd4.rtp.raleigh.ibm.com',
		    port : 1883,
	    	rtcommTopicPath : "/rtcomm/",
		    createEndpoint : false,
            appContext: 'rtcommHelpdesk',
            userid: "",
            presence : {topic : ""}
		  };

	  var endpointConfig = {
	          chat: true,
	          webrtc: true
	        };
	  
	  var broadcastAudio = false;
	  var broadcastVideo = false;

	return {
		setConfig : function(config){
			providerConfig.server = (typeof config.server !== "undefined")? config.server : providerConfig.server;
			providerConfig.port = (typeof config.port !== "undefined")? config.port : providerConfig.port;
			providerConfig.rtcommTopicPath = (typeof config.rtcommTopicPath !== "undefined")? config.rtcommTopicPath : providerConfig.rtcommTopicPath;
			providerConfig.createEndpoint = (typeof config.createEndpoint !== "undefined")? config.createEndpoint : providerConfig.createEndpoint;
			providerConfig.appContext = (typeof config.appContext !== "undefined")? config.appContext : providerConfig.appContext;
			providerConfig.presence.topic = (typeof config.presenceTopic !== "undefined")? config.presenceTopic : providerConfig.presence.topic;

			//	Protocol related booleans
			endpointConfig.chat= (typeof config.chat!== "undefined")? config.chat: endpointConfig.chat;
			endpointConfig.webrtc = (typeof config.webrtc!== "undefined")? config.webrtc: endpointConfig.webrtc;
			
			broadcastAudio = (typeof config.broadcastAudio !== "undefined")? config.broadcastAudio: broadcastAudio;
			broadcastVideo = (typeof config.broadcastVideo !== "undefined")? config.broadcastVideo: broadcastVideo;

			if (typeof config.userid !== "undefined")
				providerConfig.userid = config.userid;
		},

		getProviderConfig : function(){return providerConfig;},

		getWebRTCEnabled : function(){return endpointConfig.webrtc;},

		getChatEnabled : function(){return endpointConfig.chat;},

		getBroadcastAudio : function(){return broadcastAudio;},

		getBroadcastVideo : function(){return broadcastVideo;}
	};
});

rtcommModule.factory('RtcommService', function ($rootScope, RtcommConfig, $log) {

	  /** Setup the endpoint provider first **/
	  var myEndpointProvider = new ibm.rtcomm.RtcommEndpointProvider();
	  var endpointProviderInitialized = false;
	  var queueList = null;
	  var sessions = [];
	  
	  myEndpointProvider.setLogLevel('DEBUG');
	  /*
	  myEndpointProvider.setLogLevel('MESSAGE');
	  */

	  myEndpointProvider.setAppContext(RtcommConfig.getProviderConfig().appContext);
	  
	   //	This defines all the media related configuration and is controlled through external config.
	   var getMediaConfig = function() {
		   
		  var mediaConfig = {
				  
				    broadcast : {
						audio : RtcommConfig.getBroadcastAudio(),
						video : RtcommConfig.getBroadcastVideo()
		  			},
		  			webrtc : RtcommConfig.getWebRTCEnabled(),
		  			chat : RtcommConfig.getChatEnabled(),
				}; 
		  
		  return (mediaConfig);		
	   };


	  myEndpointProvider.on('queueupdate', function(queuelist) {
	 	  $log.debug('<<------rtcomm-service------>> - Event: queueupdate');
		  $log.debug('queueupdate', queuelist);
	 	  $rootScope.$evalAsync(
	 				function () {
					  $rootScope.$broadcast('queueupdate', queuelist);
	 				}
            );
	  });

	  myEndpointProvider.on('newendpoint', function(endpoint) {
	 	  $log.debug('<<------rtcomm-service------>> - Event: newendpoint remoteEndpointID: ' + endpoint.getRemoteEndpointID());
	 	  $rootScope.$evalAsync(
	 				function () {
					  $rootScope.$broadcast('newendpoint', endpoint);
	 				}
          );
	  });

	 var callback = function(eventObject) {
	 		$log.debug('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
	 		$rootScope.$evalAsync(
	 				function () {
		 				$rootScope.$broadcast(eventObject.eventName, eventObject);
	 				}
	            );
		 	};
	 
	 //	Setup all the callbacks here because they are all static.
	 myEndpointProvider.setRtcommEndpointConfig ({
	
		  // These are all the session related events.
		  'session:started' : function(eventObject) {
		 		$log.debug('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
		 		$rootScope.$evalAsync(
		 				function () {
		 					getSession(eventObject.endpoint.id).sessionStarted = true;
			 				$rootScope.$broadcast(eventObject.eventName, eventObject);
		 				}
		            );
			 	},

		  'session:alerting' : callback,
		  'session:ringing' : callback,
		  'session:failed' : callback,
		  'session:rejected' : callback,
		  
		  'session:stopped' : function(eventObject) { 
	  	 		$log.debug('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
		 		$rootScope.$evalAsync(
		 				function () {
				  	 		//	Clean up existing data related to this session.
				  	 		if (eventObject.endpoint.id in sessions)
				  	 			delete sessions[eventObject.endpoint.id];
					 		
				  	 		$rootScope.$broadcast(eventObject.eventName, eventObject);
		 				}
		 			);
			  },
		  
		  // These are all the WebRTC related events.
		  'webrtc:connected' : function(eventObject) {
		 		$log.debug('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
		 		
		 		$rootScope.$evalAsync(
		 				function () {
		 					getSession(eventObject.endpoint.id).webrtcConnected = true;
			 				$rootScope.$broadcast(eventObject.eventName, eventObject);
		 				}
		            );
			 	},
			 	
		  'webrtc:disconnected' : function(eventObject) {
		 		$log.debug('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
		 		
		 		$rootScope.$evalAsync(
		 				function () {
		 					getSession(eventObject.endpoint.id).webrtcConnected = false;
			 				$rootScope.$broadcast(eventObject.eventName, eventObject);
		 				}
		            );
			 	},
	
		  // These are all the chat related events.
		  'chat:connected' : callback,
		  'chat:disconnected' : callback,
		  
		  'chat:message' :  function(eventObject) { 
	 		$log.debug('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
	 		$rootScope.$evalAsync(
	 				function () {
					  		var chat = {
					  				  time : new Date(),
					  				  name : eventObject.message.from,
					  				  message : angular.copy(eventObject.message.message)
						  		   };
					  		
					  		getSession(eventObject.endpoint.id).chats.push(chat);
					 		$rootScope.$broadcast(eventObject.eventName, eventObject);
	 				}
	 			);
		  },
	
		  // Endpoint destroyed
		  'destroyed' : callback
	 	});
	  
	  var initSuccess = function(event) {
		$log.debug('<<------rtcomm-service------>> - Event: Provider init succeeded');
 		$rootScope.$evalAsync(
 				function () {
					var broadcastEvent = {
						  'ready': event.ready,
						  'registered': event.registered,
						  'endpoint': event.endpoint,
						  'userid' : RtcommConfig.getProviderConfig().userid
						  };
			
					$rootScope.$broadcast('rtcomm::init', true, broadcastEvent);
 				}
			);
	  };

	  var initFailure = function(error) {
        $log.debug('<<------rtcomm-service------>> - Event: Provider init failed: error: ',error);
 		$rootScope.$evalAsync(
 				function () {
			        $rootScope.$broadcast('rtcomm::init', false, error);
			}
		);
     };
     
     var getSession = function(endpointUUID){
    	 
    	 if (endpointUUID in sessions)
    		 return (sessions[endpointUUID]);
    	 else{
    		 var session = {
    			chats : [],
    			webrtcConnected : false,
    			sessionStarted : false
    		 };
    		 sessions[endpointUUID] = session;
    		 return (session);
    	 }
     };

	  return {
			setConfig : function(config){
				$log.debug('rtcomm-services: setConfig: config: ', config);
				
				RtcommConfig.setConfig(config);
				myEndpointProvider.setRtcommEndpointConfig(getMediaConfig());

				if (endpointProviderInitialized == false){
					// If the user does not specify a userid, that says one will never be specified so go ahead
					// and initialize the endpoint provider and let the provider assign a name. If a defined empty
					// string is passed in, that means to wait until the end user registers a name.
					if (typeof config.userid == "undefined" || RtcommConfig.getProviderConfig().userid != ''){
						  myEndpointProvider.init(RtcommConfig.getProviderConfig(), initSuccess, initFailure);
						  endpointProviderInitialized = true;
					}
				}
			},

	      // Changes for presenceMonitor
	      getPresenceMonitor:function(topic) {
	    	  return myEndpointProvider.getPresenceMonitor(topic);
	      },
	      
	      // Changes for presenceMonitor
	      publishPresence:function() {
	    	  return myEndpointProvider.publishPresence();
	      },


			getEndpoint : function(uuid) {
			  var endpoint = null;

			  if ((typeof uuid === "undefined") || uuid == null)
				  endpoint = myEndpointProvider.createRtcommEndpoint();
			  else
				  endpoint = myEndpointProvider.getRtcommEndpoint(uuid);
				  
			  return (endpoint);
		   },

		  destroyEndpoint : function(uuid) {
			  myEndpointProvider.getRtcommEndpoint(uuid).destroy();
		   },

		  //	Registration related methods.
		  register : function(userid) {
			   if (endpointProviderInitialized == false){
				   RtcommConfig.getProviderConfig().userid = userid;

				   myEndpointProvider.init(RtcommConfig.getProviderConfig(), initSuccess, initFailure);
				   endpointProviderInitialized = true;
			   }
			   else
				   $log.error('rtcomm-services: register: ERROR: endpoint provider already initialized');
		   },

		   unregister : function() {
			   if (endpointProviderInitialized == true){
				   myEndpointProvider.destroy();
				   endpointProviderInitialized = false;
				   initFailure("destroyed");
			   }
			   else
				   $log.error('rtcomm-services: unregister: ERROR: endpoint provider not initialized');
		   },
		   
		   // Queue related methods
		   joinQueue : function(queueID) {
			   myEndpointProvider.joinQueue(queueID);
		   },

		   leaveQueue : function(queueID) {
			   myEndpointProvider.leaveQueue(queueID);
		   },

		   getQueues : function() {
			   return(queueList);
			},

			/**
			 * Chat related methods
			 */
			sendChatMessage : function(chat, endpointUUID){
				//	Save this chat in the local session store
				var session = getSession(endpointUUID);
				session.chats.push(chat);
				
				myEndpointProvider.getRtcommEndpoint(endpointUUID).chat.send(chat.message);
			},
			
			getChats : function(endpointUUID) {
				var session = getSession(endpointUUID);
				if (session != null)
					return (session.chats);
				else
					return(null);
			},

			isWebrtcConnected : function(endpointUUID) {
				var session = getSession(endpointUUID);
				if (session != null)
					return (session.webrtcConnected);
				else
					return(false);
			},

			isSessionStarted : function(endpointUUID) {
				var session = getSession(endpointUUID);
				if (session != null)
					return (session.sessionStarted);
				else
					return(false);
			},
			
			setAlias : function(aliasID) {
				if ((typeof aliasID !== "undefined") && aliasID != '')
					myEndpointProvider.setUserID(aliasID); 
			}
	  };
});
