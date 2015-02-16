var customerModule = angular.module('customerModule', ['ui.bootstrap','angular-rtcomm','ngAnimate']);


customerModule.factory('CustomerService',function ($rootScope, $log, $http) {
	
	var agentCall = { visible: false};
	return {
			agentCall: agentCall,
			setVisible: function(v) {
      				agentCall.visible= v;
			}
	};
	
}); 

