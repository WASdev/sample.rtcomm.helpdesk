/**
 * AngularJS directives for Rtcomm
 */

/************* Endpoint Provider Directives *******************************/

/**
 * This directive is used to manage multiple sessions. If you are only supporting at most one session you wont need 
 * this directive. The associated template provides a way to switch between active sessions. The session must be in
 * the started state to be managed by this directive and is removed when the session stops.
 */
rtcommModule.directive('rtcommSessionmgr', ['RtcommService', '$log', function(RtcommService, $log) {
    return {
      restrict: 'E',
      templateUrl: 'templates/rtcomm/rtcomm-sessionmgr.html',
      controller: function ($scope, $rootScope) {

		$scope.sessions = [];
		$scope.sessMgrActiveEndpointUUID = null;

        $scope.$on('endpointActivated', function (event, endpointUUID) {
        	//	Not to do something here to show that this button is live.
            $log.debug('rtcommSessionmgr: endpointActivated =' + endpointUUID);
            
            if ($scope.sessMgrActiveEndpointUUID != null){
            	var origSession = $scope.getSession($scope.sessMgrActiveEndpointUUID);
            	
            	if (origSession != null)
            		origSession.activated = false;
            }
        	
        	var newSession = $scope.getSession(endpointUUID);
       		newSession.activated = true;
       		newSession.remoteEndpointID = RtcommService.getEndpoint(endpointUUID).getRemoteEndpointID();
        	
        	$scope.sessMgrActiveEndpointUUID = endpointUUID;
        });
        
		$scope.$on('session:started', function (event, eventObject) {
            $log.debug('rtcommSessionmgr: session:started: uuid =' + eventObject.endpoint.id);

            var session = $scope.getSession(eventObject.endpoint.id);
            session.remoteEndpointID = eventObject.endpoint.getRemoteEndpointID();
			
			$scope.sessions.push(session);
			
	        $rootScope.$broadcast('endpointActivated', eventObject.endpoint.id);
        });
		
		$scope.$on('session:failed', function (event, eventObject) {
			$scope.cleanupSession(eventObject.endpoint.id);
        });

		$scope.$on('session:rejected', function (event, eventObject) {
			$scope.cleanupSession(eventObject.endpoint.id);
        });


		$scope.$on('session:stopped', function (event, eventObject) {
			$scope.cleanupSession(eventObject.endpoint.id);
        });
		
        $scope.activateSession = function(endpointUUID) {
            $log.debug('rtcommSessionmgr: activateEndpoint =' + endpointUUID);
            if ($scope.sessMgrActiveEndpointUUID != endpointUUID){
	            $rootScope.$broadcast('endpointActivated', endpointUUID);
            }
        };
        
		$scope.cleanupSession = function(id){
			for	(var index = 0; index < $scope.sessions.length; index++) {
			    if($scope.sessions[index].endpointUUID === id){
		            RtcommService.getEndpoint(id).destroy();

			    	//	Remove the disconnected endpoint from the list.
			    	$scope.sessions.splice(index, 1);
			    	
			    	//	Now we need to set the active endpoint to someone else or to no endpoint if none are left.
			    	if ($scope.sessions.length != 0){
				        $rootScope.$broadcast('endpointActivated', $scope.sessions[0].endpointUUID);
			    	}
			    	else{
				        $rootScope.$broadcast('noEndpointActivated');
			    	}
			    	break;
			    }
			}
		};

        $scope.getSession = function(endpointUUID) {
        	var session = null;
			for	(var index = 0; index < $scope.sessions.length; index++) {
			    if($scope.sessions[index].endpointUUID === endpointUUID){
			    	session = $scope.sessions[index];
			    	break;
			    }
			}
			
			if (session == null){
	            session = {
						endpointUUID : endpointUUID,
						remoteEndpointID : null,
						activated : true
				};
			}
			
        	return (session);
        };
        
      },
      controllerAs: 'sessionmgr'
    };
}]);

/**
 * This directive is used to manage the registration of an endpoint provider. Since the registered name can only
 * be set on initialization of the endpoint provider, this directive actually controls the initialization of the
 * provider. Note that the endpoint provider must be initialized before any sessions can be created or received.
 */
rtcommModule.directive('rtcommRegister', ['RtcommService', '$log', function(RtcommService, $log) {
    return {
      restrict: 'E',
      templateUrl: 'templates/rtcomm/rtcomm-register.html',
      controller: function ($scope) {

    	$scope.nextAction = 'Register';

         $scope.onRegClick = function() {
          if ($scope.nextAction === 'Register'){
              $log.debug('Register: reguserid =' + $scope.reguserid);
              RtcommService.register($scope.reguserid);
          }
          else {
              $log.debug('Unregister: reguserid =' + $scope.reguserid);
              RtcommService.unregister();
          }
        };

        $scope.$on('rtcomm::init', function (event, success, details) {

			if (success == true){
				$scope.nextAction = 'Unregister';
				$scope.reguserid = details.userid;
			}
			else{
				$scope.nextAction = 'Register';
				
				if (details == 'destroyed')
					$scope.reguserid = null;
				else
					$scope.reguserid = 'Init failed:' +  details;
			}
        });
      },
      controllerAs: 'register'
    };
}]);

/**
 * This directive manages call queues. It provides the ability to display all the available queues
 * (along with their descriptions) and by clicking on a queue, allows an agent (or any type of user)
 * to subscribe on that queue.
 */
rtcommModule.directive('rtcommQueues', ['RtcommService', '$log', function(RtcommService, $log) {
	return {
		restrict : 'E',
		templateUrl : 'templates/rtcomm/rtcomm-queues.html',
		controller : function($scope) {
			$scope.rQueues = [];

			$scope.$on('queueupdate', function(event, queues) {
				$log.debug('scope queues', $scope.rQueues);
				Object.keys(queues).forEach(function(key) {
					$scope.rQueues.push(queues[key]);
				});
				$log.debug('queues', queues);
			});
			
	        $scope.$on('rtcomm::init', function (event, success, details) {

				if (success == false){
					$scope.rQueues = [];
				}
	        });

			$scope.onQueueClick = function(queue){
				var index;
				for	(index = 0; index < $scope.rQueues.length; index++) {
				    if($scope.rQueues[index].endpointID === queue.endpointID)
				    {
						$log.debug('rtcommQueues: onClick: queue.endpointID = ' + queue.endpointID);

						if (queue.active == false){
							RtcommService.joinQueue(queue.endpointID);
							$scope.rQueues[index].active = true;
						}
						else{
							RtcommService.leaveQueue(queue.endpointID);
							$scope.rQueues[index].active = false;
						}
				    }
				}
			};
		},
		controllerAs : 'queues'
	};
}]);


/********************** Endpoint Directives *******************************/

/**
 * This directive is a container for all the endpoint related directives. It provides some
 * control over the display of the container if that is needed but for the most part it is
 * needed for containment and layout of all the directives related to a single endpoint session.
 */
rtcommModule.directive('rtcommEndpoint', ['RtcommService', '$log', function(RtcommService, $log) {
    return {
        restrict: 'E',
        templateUrl: 'templates/rtcomm/rtcomm-endpoint.html',
        transclude: 'true', // Allows other directives to be contained by this one.
        controller: function ($scope) {

        	$scope.epActiveEndpointUUID = null; // Only define endpoint ID at the parent container. All other directives share this one.
        	$scope.displayEndpoint = true;

			$scope.init = function(displayEndpoint) {
			      $log.debug('rtcommEndpoint: displayEndoint = ' + displayEndpoint);
			      $scope.displayEndpoint = displayEndpoint;
      	  	};

			$scope.$on('endpointActivated', function (event, endpointUUID) {
			    $log.debug('endointActivated received: endpointID = ' + endpointUUID);
			    $scope.epActiveEndpointUUID = endpointUUID;
				$scope.displayEndpoint = true;
	        });

			$scope.$on('session:stopped', function (event, eventObject) {
			    $log.debug('endointActivated received: endpointID = ' + eventObject.endpoint.id);
				if ($scope.epActiveEndpointUUID == eventObject.endpoint.id){
					$scope.displayEndpoint = false;
				}
	        });
        },
        controllerAs: 'endpoint'
      };
}]);

/**
 * This directive is used for all the controls related to a single endpoint session. This includes
 * the ability to disconnect the sesssion and the ability to enable A/V for sessions that don't start
 * with A/V. This directive also maintains the enabled and disabled states of all its related controls.
 */
rtcommModule.directive('rtcommEndpointctrl', ['RtcommService', '$log', function(RtcommService, $log) {
    return {
        restrict: 'E',
        templateUrl: 'templates/rtcomm/rtcomm-endpointctrl.html',
        controller: function ($scope) {
        	
        	$scope.epCtrlActiveEndpointUUID = null;
        	$scope.epCtrlAVConnected = false;
        	$scope.epCtrlConnected = false;
        	$scope.epCtrlRemoteEndpointID = null;

			$scope.disconnect = function() {
				$log.debug('Disconnecting call for endpoint: ' + $scope.epCtrlActiveEndpointUUID);
				RtcommService.getEndpoint($scope.epCtrlActiveEndpointUUID).disconnect();
        	};

			$scope.toggleAV = function() {
				$log.debug('Enable AV for endpoint: ' + $scope.epCtrlActiveEndpointUUID);
				
				if ($scope.epCtrlAVConnected == false){
					RtcommService.getEndpoint($scope.epCtrlActiveEndpointUUID).webrtc.enable(function(value, message) {
		          		if (!value) {
		          			alertMessage('Failed to get local Audio/Video - nothing to broadcast');
		          		}
		          	});
				}
				else{
					$log.debug('Disable AV for endpoint: ' + $scope.epCtrlActiveEndpointUUID);
					RtcommService.getEndpoint($scope.epCtrlActiveEndpointUUID).webrtc.disable();
				}
			};

			$scope.$on('session:started', function (event, eventObject) {
			    $log.debug('endointActivated received: endpointID = ' + eventObject.endpoint.id);
				if ($scope.epCtrlActiveEndpointUUID == eventObject.endpoint.id){
					$scope.epCtrlConnected = true;
		        	$scope.epCtrlRemoteEndpointID = eventObject.endpoint.getRemoteEndpointID();
				}
	        });

			$scope.$on('session:stopped', function (event, eventObject) {
			    $log.debug('endointActivated received: endpointID = ' + eventObject.endpoint.id);
				if ($scope.epCtrlActiveEndpointUUID == eventObject.endpoint.id){
					$scope.epCtrlConnected = false;
				}
	        });

			$scope.$on('webrtc:connected', function (event, eventObject) {
	       		if ($scope.epCtrlActiveEndpointUUID == eventObject.endpoint.id)
					$scope.epCtrlAVConnected = true; 
	       	});
	       	
	       	$scope.$on('webrtc:disconnected', function (event, eventObject) {
	       		if ($scope.epCtrlActiveEndpointUUID == eventObject.endpoint.id)
					$scope.epCtrlAVConnected = false; 
	       	});
			
			
	       	$scope.$on('endpointActivated', function (event, endpointUUID) {
				$scope.epCtrlActiveEndpointUUID = endpointUUID;
				$scope.epCtrlAVConnected = RtcommService.isWebrtcConnected(endpointUUID);
				$scope.epCtrlConnected = RtcommService.isSessionStarted(endpointUUID);
				$scope.epCtrlRemoteEndpointID = RtcommService.getEndpoint(endpointUUID).getRemoteEndpointID();
	       	});
	       	
	       	$scope.$on('noEndpointActivated', function (event) {
				$scope.epCtrlAVConnected = false; 
				$scope.epCtrlConnected = false;
				$scope.epCtrlRemoteEndpointID = null;
	       	});
	       	
        },
        controllerAs: 'endpointctrl'
      };
}]);

/**
 * This directive manages the WebRTC video screen, including both the self view and the remote view. It
 * also takes care of switching state between endpoints based on which endpoint is "actively" being viewed.
 */
rtcommModule.directive('rtcommVideo', ['RtcommService', '$log', function(RtcommService, $log) {
    return {
      restrict: 'E',
      templateUrl: 'templates/rtcomm/rtcomm-video.html',

  		controller: function ($scope) {

       	  $scope.videoActiveEndpointUUID = null;
          
       	  $scope.$on('endpointActivated', function (event, endpointUUID) {
          	//	Not to do something here to show that this button is live.
              $log.debug('rtcommEndpointmgr: endpointActivated =' + endpointUUID);

              if ($scope.videoActiveEndpointUUID != endpointUUID){
            	  $scope.videoActiveEndpointUUID = endpointUUID;
		          var endpoint = RtcommService.getEndpoint(endpointUUID);
		          
		          endpoint.webrtc.setLocalMedia(
		  	            { mediaOut: document.querySelector('#selfView'),
		  	              mediaIn: document.querySelector('#remoteView')});
              }
          });
      },
      controllerAs: 'video'
    };
}]);

/**
 * This directive manages the chat portion of a session. The data model for chat
 * is maintained in the RtcommService. This directive handles switching between
 * active endpoints.
 */
rtcommModule.directive("rtcommChat", ['RtcommService', '$log', function(RtcommService, $log) {
    return {
      restrict: 'E',
      templateUrl: "templates/rtcomm/rtcomm-chat.html",
      controller: function ($scope) {
		  $scope.chats = [];
		  $scope.chatActiveEndpointUUID = null;
		  
		  $scope.$on('endpointActivated', function (event, endpointUUID) {
                $log.debug('rtcommChat: endpointActivated =' + endpointUUID);
                
                //	The data model for the chat is maintained in the RtcommService.
				$scope.chats = RtcommService.getChats(endpointUUID);
				$scope.chatActiveEndpointUUID = endpointUUID;
	        });
		  
	       	$scope.$on('noEndpointActivated', function (event) {
	       		$scope.chats = [];
	       		$scope.chatActiveEndpointUUID = null;
	       	});
	       	
	        $scope.keySendMessage = function(keyEvent){
	        	if (keyEvent.which === 13)
	        		$scope.sendMessage();
	        };


		  $scope.sendMessage = function() {
	  		  var chat = {
  				  time : new Date(),
  				  name : RtcommService.getEndpoint($scope.chatActiveEndpointUUID).getLocalEndpointID(),
  				  message : angular.copy($scope.message)
	  		   };

	  		  RtcommService.sendChatMessage(chat, $scope.chatActiveEndpointUUID);
	  		  $scope.message = '';
	  		};

      },
	  controllerAs: 'chat'
    };
}]);

/******************************** Rtcomm Modals ************************************************/

/**
 * This is the controller for all Rtcomm modals.
 */
rtcommModule.controller('ModalController', ['$scope', 'close', '$log', function($scope, close, $log) {

	$scope.close = function(result) {
	 	close(result, 500); // close, but give 500ms for bootstrap to animate
	 };
}]);

/**
 * This model is displayed on receiving an inbound call. It handles the alerting event.
 * Note that it can also auto accept requests for enabling A/V.
 */
rtcommModule.directive('rtcommAlert', ['RtcommService', 'ModalService', '$log', function(RtcommService, ModalService, $log) {
    return {
      restrict: 'E',
      controller: function($scope, ModalService) {
		    $log.debug('RtcommAlertController starting');

		    $scope.alertingEndpointObject = null;
		    $scope.autoAnswerNewMedia = false;
		    $scope.alertActiveEndpointUUID = null;

			$scope.init = function(autoAnswerNewMedia) {
			      $log.debug('rtcommAlert: autoAnswerNewMedia = ' + autoAnswerNewMedia);
			      $scope.autoAnswerNewMedia = autoAnswerNewMedia;
    	  	};

    	  	$scope.showAlerting = function() {
				ModalService.showModal({
		    		      templateUrl: "templates/rtcomm/rtcomm-modal-alert.html",
		    		      controller: "ModalController"
		    		    }).then(function(modal) {
		    		      modal.element.modal();
		    		      modal.close.then(function(result) {
		   		            if (result === true) {
			   		            $log.debug('Accepting call from: ' + $scope.caller + ' for endpoint: ' + $scope.alertingEndpointObject.id);
			   		            $scope.alertingEndpointObject.accept();
		   		            }
		   		            else {
			   		            $log.debug('Rejecting call from: ' + $scope.caller + ' for endpoint: ' + $scope.alertingEndpointObject.id);
			   		            $scope.alertingEndpointObject.reject();
		   		            }
	   		            	$scope.alertingEndpointObject = null;
		    		      });
		   	    });

		   };

	       $scope.$on('endpointActivated', function (event, endpointUUID) {
                $scope.alertActiveEndpointUUID = endpointUUID;
	        });

	       	$scope.$on('session:alerting', function (event, eventObject) {
		    		
	       			if (($scope.alertActiveEndpointUUID == eventObject.endpoint.id && $scope.autoAnswerNewMedia == false) ||
	       					($scope.alertActiveEndpointUUID != eventObject.endpoint.id))
	       			{
	       				$log.debug('rtcommAlert: display alterting model: alertActiveEndpointUUID = ' + $scope.alertActiveEndpointUUID + 'autoAnswerNewMedia = ' + $scope.autoAnswerNewMedia);
			            $scope.caller = eventObject.endpoint.getRemoteEndpointID();
			            $scope.alertingEndpointObject = eventObject.endpoint;
			            $scope.showAlerting();
	       			}
	       			else{
	   		            $log.debug('Accepting call from: ' + eventObject.endpoint.getRemoteEndpointID() + ' for endpoint: ' + eventObject.endpoint.id);
	   		            eventObject.endpoint.accept();
	       			}
		        });
		},

		controllerAs : alert
    };
}]);

/**
 * This is the controller that displays the call modal from a menu or button click. Its designed to 
 * be used in situations where the callee is known during initialization. This would be the case where
 * a call is made to a queue instead of a person. Note that the call modal is currently disabled if there 
 * is an active session.
 */
rtcommModule.controller('RtcommCallModalController', ['$scope', '$log', function($scope, $log){

    $scope.displayCallModal = false;
    $scope.enableCallModel = false;

    $scope.onDisplayCallModal = function () {
		$log.debug('RtcommCallModalController: onDisplayCallModal');
        $scope.displayCallModal = true;
    };

    $scope.$on('rtcomm::init', function (event, success, details) {
		$log.debug('RtcommCallModalController: rtcomm::init: success = ' + success);
	   	 if (success == true)
	   		 $scope.enableCallModel = true;
	   	 else
	   		 $scope.enableCallModel = false;
   });
    
	$scope.$on('session:started', function (event, eventObject) {
	    $scope.enableCallModel = false;
    });

	$scope.$on('session:stopped', function (event, eventObject) {
	    $scope.enableCallModel = true;
    });

}]);

/**
 * This modal can be used to initiate a call to a static callID such as a call queue.
 */
rtcommModule.directive('rtcommCallModal', ['RtcommService', 'ModalService', '$log', function(RtcommService, ModalService, $log) {
    return {
      restrict: 'E',
      controller: function($scope, $rootScope, RtcommService, ModalService) {
		    $scope.calleeID = null;

		    $scope.init = function(calleeID) {
			    $scope.calleeID = calleeID;
		    };

		    $scope.showCallModal = function() {
				ModalService.showModal({
		    		      templateUrl: "templates/rtcomm/rtcomm-modal-call.html",
		    		      controller: "ModalController"
		    		    }).then(function(modal) {
		    		      modal.element.modal();
		    		      modal.close.then(function(result) {
		   		            if (result === true) {
			   		            $log.debug('Calling calleeID: ' + $scope.calleeID);

			   		            var endpoint = RtcommService.getEndpoint();
			   		            $rootScope.$broadcast('endpointActivated', endpoint.id);
			   		            endpoint.chat.enable(); // Fix: probably should enable this is a more generic way.
		   		            	endpoint.connect($scope.calleeID);
		   		            }
	   		            	$scope.displayCallModal = false;
		    		      });
	    		    });
    		  };

              $scope.$watch('displayCallModal', function() {
          		$log.debug('watch: displayCallModal = ' + $scope.displayCallModal);
                  if ($scope.displayCallModal == true) {
                	  $scope.showCallModal();
                  }
             });
              
		}
   };
}]);

/********************************************* Rtcomm Controllers ******************************************************/

/**
 * This is the controller for config loader. It reads a JSON object and utilizes the RtcommService to set the configuration.
 * This can also result in the initialization of the endpoint provider if the config JSON object includes a registration name.
 * 
 * Here is an example of the config object:
 * 
 * {
 *  "server" : "server address",
 *	"port" : 1883,
 *	"rtcommTopicPath" : "/rtcomm-helpdesk/",
 *  "createEndpoint" : false,
 *  "userid" : "registration name",
 *	"broadcastAudio" : true,
 *	"broadcastVideo" : true
 * }
 * 
 * NOTE: If the user does not specify a userid, that says one will never be specified so go ahead
 * and initialize the endpoint provider and let the provider assign a name. If a defined empty
 * string is passed in, that means to wait until the end user registers a name before initializing
 * the endpoint provider.
 */
rtcommModule.controller('RtcommConfigController', ['$scope','$http', 'RtcommService', '$log', function($scope, $http, RtcommService, $log){

    $log.debug('RtcommConfigController: configURL = ' + $scope.configURL);

	$scope.setConfig = function(data) {
		$log.debug('RtcommConfigController: setting config data:' + data);
		RtcommService.setConfig(data);
  	};

  	$scope.init = function(configURL) {
			$log.debug('RtcommConfigController: initing configURL = ' + configURL);
			$scope.configURL = configURL;
			$scope.getConfig();
	  	};

	$scope.getConfig = function() {
		$http.get($scope.configURL).success (function(data){
			RtcommService.setConfig(data);
		});
	};
}]);

