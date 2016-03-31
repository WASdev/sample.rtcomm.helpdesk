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

describe('Unit Testing: CallAgentController', function() {

  //Variable that will represent the Controller we're testing
  var callAgentController;

  //Dependencies
  var RtcommService, scope, mockUibModal;

  //Mock and stubbing
  var sandbox;

  //Utilities
  var $compile, $rootScope, $controller;

  //Inject module
  beforeEach(module('helpdesk.customer.app'));

  beforeEach(inject(function($injector) {

    $rootScope = $injector.get('$rootScope');

    var $controller = $injector.get('$controller');

    //Create a new scope
    scope = $rootScope.$new();

    //Mock out services as empty objects (we'll add functionality depending on each test)
    RtcommService = {};
    mockUibModal = {};

    //Instantiate a controller with mock services and scope
    callAgentController = $controller('CallAgentController', {
      $scope: scope,
      $uibModal: mockUibModal,
      RtcommService: RtcommService
    });


    sandbox = sinon.sandbox.create();
  }));

  afterEach(function() {
    sandbox.restore();

  });

  it('should have defined default values', function() {

    expect(callAgentController.enableCallModal).to.be.false;
    expect(callAgentController.calleeID).to.be.null;
    expect(callAgentController.activeCall).to.be.false;
    expect(callAgentController.AVConnected).to.be.false;
    expect(callAgentController.mediaToEnable).to.eql(['chat']);
  });

  describe('call flow for queueing up', function() {

    beforeEach(function() {
      //Set flag for 'enableCallModal'
      callAgentController.enableCallModal = true;
    });

    //Creates a mock modal instance (treat it like a modal on the page)
    function createMockModalInstance() {

      return {
        result: {
          then: function(success, failure) {
            this.successCallback = success;
            this.failureCallback = failure;
          }

        },
        close: function(data) {
          this.result.successCallback(data);
        },

        dismiss: function(type) {
          this.result.failureCallback();
        }
      };

    }

    it('should have the modal enabled', function() {

      expect(callAgentController.enableCallModal).to.be.true;
    });

    it('function \'placecallToQueue\' should open the modal and place a call', function() {

      //Create a mockModalInstance
      var mockModalInstance = createMockModalInstance();

      mockUibModal.open = function() {};
      RtcommService.setAlias = function() {};
      RtcommService.placeCall = function() {};

      //Stub on the modal
      sandbox.stub(mockUibModal, 'open', function() {
        return mockModalInstance;
      });

      //Stub RtcommService
      sandbox.stub(RtcommService, 'setAlias');

      //Stub placeCall
      sandbox.stub(RtcommService, 'placeCall');

      //Scenario queue to call and the user
      var queueID = 'Apliances',
        mockUser = 'John';

      //Call placeCallToQueue
      callAgentController.placeCallToQueue(queueID);

      //Expect queue ID to be set
      expect(callAgentController.queueID).to.equal(queueID);

      //Expect modal to have been opened
      expect(mockUibModal.open.calledOnce).to.be.true;


      //Press ok (closes the modal as a 'Yes' and mockUser as the input)
      mockModalInstance.close(mockUser);

      expect(callAgentController.callerID).to.equal(mockUser);

      expect(RtcommService.setAlias.calledWith(mockUser)).to.be.true;

      expect(callAgentController.activeCall).to.be.true;
      //Expect Controller to call RtcommService.placeCall successfully
      expect(RtcommService.placeCall.calledOnce).to.be.true;
      expect(RtcommService.placeCall.calledWith(queueID, ['chat'])).to.be.true;
    });
  });

  describe('should listen to \'angular-rtcomm\' events correctly', function() {

    it('should toggle the call modal flag on \'rtcomm::init\' -> true/false', function() {

      $rootScope.$broadcast('rtcomm::init', true);

      expect(callAgentController.enableCallModal).to.be.true;

      $rootScope.$broadcast('rtcomm::init', false);
      expect(callAgentController.enableCallModal).to.be.false;
    });

    it('should assign an endpoint ID on \'endpointActivated\' event', function() {

      $rootScope.$broadcast('endpointActivated', 'MOCK_ID');

      expect(callAgentController.activeEndpointID).to.equal('MOCK_ID');
    });


    it('should disable call modal on \'session:started\'', function() {
      $rootScope.$broadcast('session:started');
      expect(callAgentController.enableCallModal).to.be.false;
    });

    it('should enable call modal on \'session:stopped\'', function() {

      $rootScope.$broadcast('session:stopped');
      expect(callAgentController.enableCallModal).to.be.true;
      expect(callAgentController.activeCall).to.be.false;
    });

    it('should activate AVConnected flag on \'webrtc:connected\'', function() {
      $rootScope.$broadcast('webrtc:connected');
      expect(callAgentController.AVConnected).to.be.true;
    });

    it('should deactivate AVConnected flag on \'webrtc:disconnected\'', function() {
      $rootScope.$broadcast('webrtc:disconnected');

      expect(callAgentController.AVConnected).to.be.false;
    });
  });
});
