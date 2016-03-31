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

/* globals browser */
/* globals EC */
/* globals by */


var Customer = require('./customer.pageobject.js');
var Agent = require('./agent.pageobject.js');

describe('E2E Testing: Rtcomm Helpdesk App', function() {

  //Create two browser instances
  beforeEach(function() {
    browser.ignoreSynchronization = true;

    browser.get('/');


  });

  describe('Customer actions', function() {
    var customerName, customer;


    beforeEach(function() {
      //Just a little renaming
      customer = new Customer(browser);
      customerName = 'John';
      customer.enter();
    });

    it('should be able to click the \'Helpdesk\' button', function() {

      customer.waitForHelpdeskBtn();

    });

    it('should be able to place a call to Helpdesk', function() {

      //Wait for helpdesk button to be enabled
      customer.waitForHelpdeskBtn();

      //Click the button
      customer.helpdeskBtn.click();

      //Should expect the help modal to show up
      customer.waitForHelpModal();

      //Input name to the modal
      customer.connectModal.aliasInput.sendKeys(customerName);

      //Connect
      customer.connectModal.connectBtn.click();

    });

  });

  describe('Agent actions', function() {
    var agent, agentName;
    beforeEach(function() {
      agent = new Agent(browser);
      agentName = 'Michael';
      agent.enter();
    });

    it('should be able to register', function() {

      agent.registerInput.sendKeys(agentName);

      agent.registerBtn.click();

      agent.browser.driver.wait(function() {
          return agent.registerBtn.getText().then(function(text) {
            return text === 'Unregister';
          });
        },

        5000,
        'There was a problem registering the agent');


      agent.waitForAlertModal();
    });


  });

  describe('session between customer and agent', function() {
    var browserTwo,
      agent, agentName,
      customer, customerName;

    beforeEach(function() {

      browserTwo = browser.forkNewDriverInstance();
      browser.ignoreSynchronization = true;

      agent = new Agent(browser);
      agentName = 'Jeff';
      agent.enter();

      //Setup Customer and enter



      //Setup Agent and enter 
      browserTwo.ignoreSynchronization = true;
      browserTwo.manage().window().setSize(1600, 1000);

      browserTwo.get('/');
      customer = new Customer(browserTwo);
      customerName = 'Michael';
      customer.enter();


      //Agent should register
      agent.registerInput.sendKeys(agentName);
      agent.registerBtn.click();

      //Customer should place a call to queue
      customer.waitForHelpdeskBtn();
      customer.helpdeskBtn.click();

      //Should expect the help modal to show up
      customer.waitForHelpModal();
      customer.connectModal.aliasInput.sendKeys(customerName);

      //Connect
      customer.connectModal.connectBtn.click();

      //Agent should expect an alert modal
      agent.waitForAlertModal();
      agent.alertModalOkBtn.click();


    });

    afterEach(function() {
      browserTwo.quit();
    });

    it('should be able start a chat session', function() {


      //Define a conversation between agent and customer
      var conversation = [{
        user: agentName,
        message: 'How can I help you today?'
      }, {
        user: customerName,
        message: 'I need to verify the warranty on a product'
      }, {
        user: agentName,
        message: 'Sure, I\'ll just need a few details from the product... what\'s the ID'
      }];

      conversation.forEach(function(message) {
        if (message.user === agentName) agent.sendChatMessage(message.message);
        else if (message.user === customerName) customer.sendChatMessage(message.message);
        browser.driver.sleep(500); //Wait for each message to be sent
      });
      agent.getChatMessages().then(function(messages) {
        messages.forEach(function(message, index) {
          expect(message.name).to.equal(conversation[index].user, 'Incorrect user match in chat for agent');
          expect(message.message).to.equal(conversation[index].message, 'Incorrect message sent in chat for agent');
        });
      });

      customer.getChatMessages().then(function(messages) {
        messages.forEach(function(message, index) {
          expect(message.name).to.equal(conversation[index].user, 'Incorrect user match in chat for customer');
          expect(message.message).to.equal(conversation[index].message, 'Incorrect message sent in chat for customer');
        });
      });

    });

    it('should be able to start a video session', function() {
    	
    	//Click enable AV button
      agent.browser.wait(EC.elementToBeClickable(agent.enableAVBtn), 5000,
        'Enable AV button seems to be disabled or not visible');

      agent.enableAVBtn.click();

      //Wait for video to start/stabilize
      browser.driver.sleep(5000);

      //Expect agent video feed to work

      expect(videoPollReadyStateHelper(agent.browser, '#selfView')).to.eventually.equal(4);
      expect(videoPollReadyStateHelper(agent.browser, '#remoteView')).to.eventually.equal(4);

      expect(videoPollReadyStateHelper(customer.browser, '#selfView')).to.eventually.equal(4);
      expect(videoPollReadyStateHelper(customer.browser, '#remoteView')).to.eventually.equal(4);

    });
  });


  function videoPollReadyStateHelper(browser, selector, _ms, _msg) {
    var msg = _msg || 'Timed out while retrieving video state';
    var ms = _ms || 5000;

    var script = function(selector) {
      var callback = arguments[arguments.length - 1];

      try {

        var video = document.querySelector(selector);
        if (video.readyState === 4) {
          callback(video.readyState);
        } else {
          video.onloadeddata = function() {
            if (video.readyState === 4) {
              callback(video.readyState);
            }
          };
        }

      } catch (err) {

        callback(err);
      }
    };

    return browser.driver.wait(browser.driver.executeAsyncScript(script, [selector]), ms, msg);
  }
});
