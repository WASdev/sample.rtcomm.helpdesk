/**
 * AngularJS directives for Rtcomm
 */

/************* Endpoint Provider Directives *******************************/

rtcommApp.directive('rtcommSessionmgr', ['RtcommService', function(RtcommService) {
    return {
      restrict: 'E',
      templateUrl: '../views/rtcomm/rtcomm-sessionmgr.html',
      controller: function ($scope, $rootScope) {

		$scope.sessions = [];

        $scope.$on('endpointActivated', function (event, endpointUUID) {
        	//	Not to do something here to show that this button is live.
            console.log('rtcommEndpointmgr: endpointActivated =' + endpointUUID);
        });
        
		$scope.$on('session:started', function (event, eventObject) {
			var sessionRecord = {
					endpointUUID : eventObject.endpoint.id,
					remoteEndpointID : eventObject.endpoint.getRemoteEndpointID()
			};
			
			$scope.sessions.push(sessionRecord);
			$scope.$apply();
        });

		$scope.$on('session:stopped', function (event, eventObject) {
			var id = eventObject.endpoint.id;
			
			for	(var index = 0; index < $scope.sessions.length; index++) {
			    if($scope.sessions[index].endpointUUID === id){
			    	//	We only destroy the endpoint if its not our default (0 index) endpoint.
			    	if (index != 0){
			            console.log('rtcommEndpointmgr: non-default endpoint being detroyed: endpointUUID = ' + id);
			            RtcommService.getEndpoint(id).destroy();
			    	}

			    	//	Remove the disconnected endpoint from the list.
			    	$scope.sessions.splice(index, 1);
			    	break;
			    }
			}

			//$scope.$apply();
        });

        $scope.activateSession = function(endpointUUID) {
        	// $rootScope.$broadcast('endpointActivated', endpointID);
            console.log('rtcommEndpointmgr: activateEndpoint =' + endpointUUID);
            $rootScope.$broadcast('endpointActivated', endpointUUID);
        };
      },
      controllerAs: 'sessionmgr'
    };
}]);


rtcommApp.directive('rtcommRegister', ['RtcommService', function(RtcommService) {
    return {
      restrict: 'E',
      templateUrl: '../views/rtcomm/rtcomm-register.html',
      controller: function ($scope) {

    	$scope.nextAction = 'Register';

         $scope.onRegClick = function() {
          if ($scope.nextAction === 'Register'){
              console.log('Register: reguserid =' + $scope.reguserid);
              RtcommService.register($scope.reguserid);
              console.log($scope);
          }
          else {
              console.log('Unregister: reguserid =' + $scope.reguserid);
          }
        };

        $scope.$on('init', function (event, success, details) {

			if (success == true){
				$scope.nextAction = 'Unregister';
				$scope.reguserid = details.userid;
			}
			else{
				$scope.nextAction = 'Register';
				$scope.reguserid = 'Rtcomm init failed';
			}
			$scope.$apply();
        });
      },
      controllerAs: 'register'
    };
}]);

rtcommApp.directive('rtcommQueues', ['RtcommService', function(RtcommService) {
	return {
		restrict : 'E',
		templateUrl : '../views/rtcomm/rtcomm-queues.html',
		controller : function($scope) {
			$scope.rQueues = [];

			//  $scope.registered = false;
			$scope.init = function() {
				console.log('rtcommQueues: INITTED!');
			};

			$scope.$on('queueupdate', function(event, queues) {
				console.log('scope queues', $scope.rQueues);
				Object.keys(queues).forEach(function(key) {
					$scope.rQueues.push(queues[key]);
				});
				console.log('queues', queues);
				$scope.$apply();
			});

			$scope.onQueueClick = function(queue){
				var index;
				for	(index = 0; index < $scope.rQueues.length; index++) {
				    if($scope.rQueues[index].endpointID === queue.endpointID)
				    {
						console.log('rtcommQueues: onClick: queue.endpointID = ' + queue.endpointID);

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

rtcommApp.directive('rtcommPresence', ['RtcommService', function(RtcommService) {
	return {
		restrict : 'E',
		templateUrl : '../views/rtcomm/rtcomm-presence.html',
		controller : function($scope) {
			$scope.users = [{name: 'Scott Graham'},
			                {name: 'Brian Pulito'},
			                {name: 'Jim Lawwill'},
			                {name: 'Tibor Beres'},
			                {name: 'Segio Costa'}
			                ];
			$scope.init = function(myName){
				$scope.title = title;
		  };
		},
		controllerAs : 'presence'
	};
}]);

/********************** Endpoint Directives *******************************/

/*
 * This directive is a container for all the endpoint related directives.
 */
rtcommApp.directive('rtcommEndpoint', ['RtcommService', function(RtcommService) {
    return {
        restrict: 'E',
        templateUrl: '../views/rtcomm/rtcomm-endpoint.html',
        transclude: 'true', // Allows other directives to be contained by this one.
        controller: function ($scope) {

    		$scope.activeEndpointConnected = false; 
        	$scope.activeEndpointUUID = null; // Only define endpoint ID at the parent container. All other directives share this one.
        	$scope.displayEndpoint = true;

			$scope.init = function(displayEndpoint) {
			      console.log('rtcomm endpoint initialized');
			      if ($scope.activeEndpointUUID == null){
			    	  $scope.activeEndpointUUID = RtcommService.getEndpoint(null).id;
			          console.log('rtcomm endpoint initialized: endpointID = ' + $scope.activeEndpointUUID);
			      }
			      $scope.displayEndpoint = displayEndpoint;
      	  	};

			$scope.$on('endpointActivated', function (event, endpointID) {
			    console.log('endointActivated received: endpointID = ' + endpointID);
				$scope.activeEndpointUUID = endpointID;
				$scope.displayEndpoint = true;
	        });

			$scope.$on('session:stopped', function (event, eventObject) {
			    console.log('endointActivated received: endpointID = ' + eventObject.endpoint.id);
				if ($scope.activeEndpointUUID == eventObject.endpoint.id){
					$scope.displayEndpoint = false;
					$scope.activeEndpointUUID = null;
				}
	        });
        },
        controllerAs: 'endpoint'
      };
}]);

rtcommApp.directive('rtcommEndpointctrl', ['RtcommService', function(RtcommService) {
    return {
        restrict: 'E',
        templateUrl: '../views/rtcomm/rtcomm-endpointctrl.html',
        controller: function ($scope) {

			$scope.init = function() {
      	  	};

			$scope.disconnect = function() {
				console.log('Disconnecting call for endpoint: ' + $scope.activeEndpointUUID);
				$scope.activeEndpointConnected = false;
				RtcommService.getEndpoint($scope.activeEndpointUUID).disconnect();
        	};

			$scope.enableAV = function() {
				console.log('Enable AV for endpoint: ' + $scope.activeEndpointUUID);
				  RtcommService.getEndpoint($scope.activeEndpointUUID).webrtc.enable();
			};

			$scope.$on('session:started', function (event, eventObject) {
				$scope.activeEndpointUUID = eventObject.endpoint.id;
				$scope.activeEndpointConnected = true;
	            $scope.$apply();
	        });

		    $scope.$on('session:stopped', function (event, eventObject) {
		    	if ($scope.activeEndpointConnected == true && $scope.activeEndpointUUID == eventObject.endpoint.id){
					$scope.activeEndpointConnected = false;
		            $scope.$apply();
		    	}
	        });
        },
        controllerAs: 'endpointctrl'
      };
}]);

rtcommApp.directive('rtcommVideo', ['RtcommService', function(RtcommService) {
    return {
      restrict: 'E',
      templateUrl: '../views/rtcomm/rtcomm-video.html',

  		controller: function ($scope) {

    	  $scope.init = function(/* boolean */ attachVideo) {
	          console.log('rtcomm video initialized: endpointID = ' + $scope.activeEndpointUUID);
	          var endpoint = RtcommService.getEndpoint($scope.activeEndpointUUID);
	          /**FIX: we need to use the scope to determine the proper IDs for setMedia instead of using a querySelector*/

	          endpoint.webrtc.setLocalMedia(
	            { mediaOut: document.querySelector('#selfView'),
	              mediaIn: document.querySelector('#remoteView'),
	              broadcast: {audio: true, video: true}
	            });
	        
	          if (attachVideo) {
	        	  endpoint.webrtc.enable(function(value, message) {
	          		if (!value) {
	          			alertMessage('Failed to get local Audio/Video - nothing to broadcast');
	          		}
	          	});
	          }
    	  };
      },
      controllerAs: 'video'
    };
}]);

/**
 * 
 */
rtcommApp.directive("rtcommChat", ['RtcommService', function(RtcommService) {
    return {
      restrict: 'E',
      templateUrl: "../views/rtcomm/rtcomm-chat.html",
      controller: function ($scope) {
		  $scope.chats = [];
		  
		  $scope.init = function(myName)
		  {
			console.log('rtcommChat: INITTED!');
			$scope.myName = myName;
		  };
	
		  $scope.sendMessage = function() {
	  		  var chat = {
  				  time : new Date(),
  				  name : $scope.myName,
  				  message : angular.copy($scope.message)
	  		  };

	  		  RtcommService.getEndpoint($scope.activeEndpointUUID).chat.send(chat.message);

	  		  $scope.chats.push(chat);
	  		  $scope.message = '';
	  		};

	        $scope.$on('registered', function(event, registered, message, userid) {
	            $scope.myName = userid;
	            $scope.$apply();
	        });


			$scope.$on('session:started', function (event, eventObject) {
				$scope.activeEndpointUUID = eventObject.endpoint.id;
				$scope.activeEndpointConnected = true;
	            $scope.$apply();
		    });

	        $scope.$on('chat:message', function (event, eventObject) {
	        	if ($scope.activeEndpointUUID == eventObject.endpoint.id){
		  		  var chat = {
		  				  time : new Date(),
		  				  name : eventObject.message.from,
		  				  message : angular.copy(eventObject.message.message)
			  		  };

		  		  $scope.chats.push(chat);
		  		  $scope.$apply();

	        	}
	        });
      },
	  controllerAs: 'chat'
    };
}]);

/******************************** Rtcomm Modals ************************************************/

/**
 * This is the controller for all Rtcomm modals.
 */
rtcommApp.controller('ModalController', ['$scope', 'close', function($scope, close) {

	$scope.close = function(result) {
	 	close(result, 500); // close, but give 500ms for bootstrap to animate
	 };
}]);

/**
 * This model is displayed on receiving an inbound call.
 */
rtcommApp.directive('rtcommAlert', ['RtcommService', 'ModalService', function(RtcommService, ModalService) {
    return {
      restrict: 'E',
      controller: function($scope, ModalService) {
		    console.log('RtcommAlertController starting');

		    $scope.alertingEndpointObject = null;

		    $scope.showAlerting = function() {
				ModalService.showModal({
		    		      templateUrl: "../views/rtcomm/rtcomm-modal-alert.html",
		    		      controller: "ModalController"
		    		    }).then(function(modal) {
		    		      modal.element.modal();
		    		      modal.close.then(function(result) {
		   		            if (result === true) {
			   		            console.log('Accepting call from: ' + $scope.caller + ' for endpoint: ' + $scope.alertingEndpointObject.id);
			   		            $scope.activeEndpointUUID = $scope.alertingEndpointObject.id;
			   		            $scope.alertingEndpointObject.accept();
		   		            }
		   		            else {
		   		            	/**FIX: add reject when its available **/
			   		            console.log('Rejecting call from: ' + $scope.caller + ' for endpoint: ' + $scope.alertingEndpointObject.id);
			   		            $scope.alertingEndpointObject.reject();
		   		            }
	   		            	$scope.alertingEndpointObject = null;
		    		      });
		    		    });

		    		  };

		    $scope.$on('session:alerting', function (event, eventObject) {
		            $scope.caller = eventObject.endpoint.getRemoteEndpointID();
		            $scope.alertingEndpointObject = eventObject.endpoint;
		            $scope.showAlerting();
		            $scope.$apply();
		        });
		},

		controllerAs : alert
    };
}]);

/**
 * This is the controller that displays the call modal from a menu or button click.
 */
rtcommApp.controller('RtcommCallModalController', function($scope){

    $scope.displayCallModal = false;

    $scope.onDisplayCallModal = function () {
		console.log('RtcommCallModalController: onDisplayCallModal');
        $scope.displayCallModal = true;
    };
});

/**
 * This modal can be used to initiate a call to a static callID such as a call queue.
 */
rtcommApp.directive('rtcommCallModal', ['RtcommService', 'ModalService', function(RtcommService, ModalService) {
    return {
      restrict: 'E',
      controller: function($scope, $rootScope, RtcommService, ModalService) {
		    $scope.calleeID = null;

		    $scope.init = function(calleeID) {
			    $scope.calleeID = calleeID;
		    };

		    $scope.showCallModal = function() {
				ModalService.showModal({
		    		      templateUrl: "../views/rtcomm/rtcomm-modal-call.html",
		    		      controller: "ModalController"
		    		    }).then(function(modal) {
		    		      modal.element.modal();
		    		      modal.close.then(function(result) {
		   		            if (result === true) {
			   		            console.log('Calling calleeID: ' + $scope.calleeID);

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
          		console.log('watch: displayCallModal = ' + $scope.displayCallModal);
                  if ($scope.displayCallModal == true) {
                	  $scope.showCallModal();
                  }
             });

		}
   };
}]);

/********************************************* Rtcomm Controllers ******************************************************/

/**
 * This is the controller for config loader.
 */
rtcommApp.controller('RtcommConfigController', ['$scope','$http', 'RtcommService', function($scope, $http, RtcommService){

    console.log('RtcommConfigController: configURL = ' + $scope.configURL);

	$scope.setConfig = function(data) {
		console.log('RtcommConfigController: setting config data:' + data);
		RtcommService.setConfig(data);
  	};

  	$scope.init = function(configURL) {
			console.log('RtcommConfigController: initing configURL = ' + configURL);
			$scope.configURL = configURL;
			$scope.getConfig();
	  	};

	$scope.getConfig = function() {
		$http.get($scope.configURL).success (function(data){
			RtcommService.setConfig(data);
		});
	};
}]);

