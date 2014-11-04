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
	  
	  var broadcastAudio = false;
	  var broadcastVideo = false;

	return {
		setConfig : function(config){
			console.log('RtcommConfig: setConfig: ');
			providerConfig.server = (typeof config.server !== "undefined")? config.server : providerConfig.server;
			providerConfig.port = (typeof config.port !== "undefined")? config.port : providerConfig.port;
			providerConfig.rtcommTopicPath = (typeof config.rtcommTopicPath !== "undefined")? config.rtcommTopicPath : providerConfig.rtcommTopicPath;
			providerConfig.createEndpoint = (typeof config.createEndpoint !== "undefined")? config.createEndpoint : providerConfig.createEndpoint;
			providerConfig.appContext = (typeof config.appContext !== "undefined")? config.appContext : providerConfig.appContext;

			//	Protocol enablement booleans
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

rtcommApp.factory('RtcommService', function ($rootScope, RtcommConfig) {
	  console.log('rtcommService: Creating the Rtcomm EnpdointProvider');

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
	 	  console.log('<<------rtcomm-service------>> - Event: queueupdate');
		  console.log('queueupdate', queuelist);
	 	  $rootScope.$evalAsync(
	 				function () {
					  $rootScope.$broadcast('queueupdate', queuelist);
	 				}
            );
	  });

	  myEndpointProvider.on('newendpoint', function(endpoint) {
	 	  console.log('<<------rtcomm-service------>> - Event: newendpoint remoteEndpointID: ' + endpoint.getRemoteEndpointID());
	 	  $rootScope.$evalAsync(
	 				function () {
					  $rootScope.$broadcast('newendpoint', endpoint);
	 				}
          );
	  });

	 var callback = function(eventObject) {
	 		console.log('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
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
		 		console.log('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
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
	  	 		console.log('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
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
		 		console.log('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
		 		
		 		$rootScope.$evalAsync(
		 				function () {
		 					getSession(eventObject.endpoint.id).webrtcConnected = true;
			 				$rootScope.$broadcast(eventObject.eventName, eventObject);
		 				}
		            );
			 	},
			 	
		  'webrtc:disconnected' : function(eventObject) {
		 		console.log('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
		 		
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
	 		console.log('<<------rtcomm-service------>> - Event: ' + eventObject.eventName + ' remoteEndpointID: ' + eventObject.endpoint.getRemoteEndpointID());
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
		console.log('Endpoint provider: inited: event:', event);
 		$rootScope.$evalAsync(
 				function () {
					var broadcastEvent = {
						  'ready': event.ready,
						  'registered': event.registered,
						  'endpoint': event.endpoint,
						  'userid' : RtcommConfig.getProviderConfig().userid
						  };
			
					$rootScope.$broadcast('init', true, broadcastEvent);
 				}
			);
	  };

	  var initFailure = function(error) {
        console.log('Endpoint provider: init failed: error: ',error);
 		$rootScope.$evalAsync(
 				function () {
			        $rootScope.$broadcast('init', false, error);
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
				console.log('RtcommService: setConfig: ');

				RtcommConfig.setConfig(config);
				myEndpointProvider.setRtcommEndpointConfig(getMediaConfig());

				if (endpointProviderInitialized == false){
					if (RtcommConfig.getProviderConfig().userid != ''){
						  myEndpointProvider.init(RtcommConfig.getProviderConfig(), initSuccess, initFailure);
						  endpointProviderInitialized = true;
					}
				}
			},

			getEndpoint : function(uuid) {
			  console.log('RtcommService: getEndpoint: id = ' + uuid);
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
				   console.log('rtcomm-services: ERROR: endpoint provider already initialized');
		   },

		   unregister : function() {
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
			}
			
	  };
});
