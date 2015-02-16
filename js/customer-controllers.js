customerModule.controller("CallAgentCtrl", function($scope, $log, $modal, CustomerService, RtcommService) {
	$scope.agent = CustomerService.agentCall;
	$scope.sessionEndpointID = null;
	
    $scope.calleeID = null;
    $scope.callerID = null;
	
    $scope.enableCallModel = false;
    $scope.mediaToEnable = ['chat'];
	
    $scope.$on('rtcomm::init', function (event, success, details) {
		$log.debug('CallAgentCtrl: rtcomm::init: success = ' + success);
	   	 if (success == true)
	   		 $scope.enableCallModel = true;
	   	 else
	   		 $scope.enableCallModel = false;
   });
	
	$scope.visible=CustomerService.agentCallVisible;
	
	$scope.$on('session:started', function (event, eventObject) {
	    $scope.enableCallModel = false;
    });

	$scope.$on('session:stopped', function (event, eventObject) {
	    $scope.enableCallModel = true;
	    CustomerService.setVisible(false);
    });	
	
	$scope.placeCall = function (calleeID){
		$scope.calleeID = calleeID;

	    var modalInstance = $modal.open({
			  templateUrl: 'templates/customer-modal-call.html',
			  controller: 'CallModalInstanceCtrl',
			  resolve: {}
		    	});
	
		    modalInstance.result.then(
		    	function (resultName) {
		            //	This is used to set an alias when the endoint is not defined.
		            if ($scope.callerID == null && (typeof resultName !== "undefined") && resultName != ''){
		            	$scope.callerID = resultName;
		            	RtcommService.setAlias(resultName);
		            }
		            
					CustomerService.setVisible(true);
		            $scope.sessionEndpointID = RtcommService.placeCall($scope.calleeID, $scope.mediaToEnable);
		     	}, 
		     	function () {
		     		$log.info('Modal dismissed at: ' + new Date());
		    });		
	};
	
	$scope.disconnectCall = function (){
		var endpoint = RtcommService.getEndpoint($scope.sessionEndpointID);
		
		if (endpoint)
			endpoint.disconnect();
		
	  	CustomerService.setVisible(false);
	  	$scope.sessionEndpointID = null;
	};
});

rtcommModule.controller('CallModalInstanceCtrl', ['$scope',  '$modalInstance', function ($scope, $modalInstance) {

	  $scope.endpointAlias = '';

	  $scope.ok = function () {
	    $modalInstance.close($scope.endpointAlias);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
}]);


