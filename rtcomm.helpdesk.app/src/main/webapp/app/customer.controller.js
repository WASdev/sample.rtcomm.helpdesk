/**
 * (C) Copyright IBM Corporation 2015.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Main Controller for the Rtcomm Helpdesk Demo
 */
(function() {
  'use strict';

  angular
    .module('helpdesk.customer.app')
    .controller('CallAgentController', CallAgentController)
    .controller('CallModalInstanceCtrl', CallModalInstanceCtrl);

  /* @ngInject */
  function CallAgentController($scope, $log, $uibModal, RtcommService) {
    var vm = this;
    vm.title = 'CallAgentController';

    vm.activeEndpoint = null;

    vm.calleeID = null;

    //Flag that toggles the call modal button
    vm.enableCallModal = false;

    //Flag for a session state
    vm.activeCall = false;

    //Flag for AV Status (WebRTC Video/Audio)
    vm.AVConnected = false;

    //Media to enable 
    vm.mediaToEnable = ['chat'];

    //Exposed functions
    vm.placeCallToQueue = placeCallToQueue;

    vm.disconnectCall = disconnectCall;

    //Start listening to Rtcomm Events
    activate();

    ////////////////

    function placeCallToQueue(queueID) {

      vm.queueID = queueID;
      //Open a dialog 
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/customer-modal-call.html',
        controller: 'CallModalInstanceCtrl as vm',
        resolve: {}
      });

      //Place a call to the queue once the user entered a name
      modalInstance.result.then(
        function(resultName) {
          //	This is used to set an alias when the endoint is not defined.
          if (resultName !== '') {
            vm.callerID = resultName;
            RtcommService.setAlias(resultName);
          }

          vm.activeCall = true;
          vm.activeEndpointID = RtcommService.placeCall(vm.queueID, vm.mediaToEnable);
        },
        function() {
          $log.info('Modal dismissed at: ' + new Date());
        });

    }


    function disconnectCall() {

      var endpoint = RtcommService.getEndpoint(vm.activeEndpointID);

      if (endpoint)
        endpoint.disconnect();

      vm.activeCall = false;
      vm.activeEndpointID = null;

    }

    function activate() {
      /**
       * Listen to Rtcomm Events
       */

      /**
       * When the rtcomm is initialized enable the call modal
       */
      $scope.$on('rtcomm::init', function(event, success, details) {
        $log.debug('CallAgentCtrl: rtcomm::init: success = ' + success);
        if (success === true)
          vm.enableCallModal = true;
        else
          vm.enableCallModal = false;
      });

      /**
       * An endpoint is activated when placing a call or when switched between active sessions
       */
      $scope.$on('endpointActivated', function(event, endpointUUID) {
        vm.activeEndpointID = endpointUUID;
      });

      /**
       * Disable the modal so users, this way only one session can be enabled
       */
      $scope.$on('session:started', function(event, eventObject) {
        vm.enableCallModal = false;
      });

      /**
       * Session with the other user (agent) has stopped, enable the call modal again
       */
      $scope.$on('session:stopped', function(event, eventObject) {
        vm.enableCallModal = true;
        vm.activeCall = false;
      });


      /**
       * Listen to webrtc connected
       */

      $scope.$on('webrtc:connected', function(event, eventObject) {
        vm.AVConnected = true;

      });

      $scope.$on('webrtc:disconnected', function(event, eventObject) {
        vm.AVConnected = false;
      });
    }
  }


  function CallModalInstanceCtrl($uibModalInstance) {
    var vm = this;
    vm.endpointAlias = '';

    //On 'ok' send the input alias name to the controller
    vm.ok = function() {
      $uibModalInstance.close(vm.endpointAlias);
    };

    //Dismiss modal
    vm.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
