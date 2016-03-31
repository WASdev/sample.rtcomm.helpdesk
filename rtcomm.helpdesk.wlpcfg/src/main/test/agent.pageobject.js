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
 * Page Object for the Agent
 * This will represent the helpdesk agent's actions as an Object
 */
module.exports = Agent;

function Agent(_browser) {

  this.browser = _browser;
  this.element = _browser.element;

  //Enter button on the home page of the sample
  this.enterBtn = this.element(by.id('btnAgent'));

  //Register input
  this.registerInput = this.element(by.id('register-input'));

  //Register Button
  this.registerBtn = this.element(by.id('btn-register'));

  //Alert modal ok button
  this.alertModalOkBtn = this.element(by.css('[ng-click="ok()"]'));

  this.enableAVBtn = this.element(by.id('btnEnableAV'));

  this.enter = enter;

  this.waitForAlertModal = waitForAlertModal;


  //Chat related functionality
  this.send = this.element(by.id('btn-chat'));
  this.input = this.element(by.model('chatVM.message'));

  this.sendChatMessage = function(msg) {
    expect(this.send.isEnabled()).to.eventually.be.true;

    this.input.sendKeys(msg);
    this.send.click();

  };
  this.getChatMessages = function() {
    this.chatElements = this.element.all(by.css('ul.chat > li'));

    var chats = this.chatElements.map(function(chatMessage, index) {

      return {
        name: chatMessage.element(by.css('strong.ng-binding')).getText(),
        message: chatMessage.element(by.css('p.ng-binding')).getText()
      };
    });

    return chats;
  };

  //Click on the 'Enter' button from Agent on the home page and expect the URL to change
  function enter() {
    var self = this;
    this.enterBtn.click();
    //Wait and see the url change
    this.browser.wait(function() {
      return self.browser.getCurrentUrl().then(function(url) {
        self.browser.ignoreSynchronization = false;

        return /agentHome/.test(url);
      });
    }, 10000, 'Expected URL to change to Agent Home, but it timed out!');


  }

  function waitForAlertModal() {

    this.browser.wait(EC.visibilityOf(this.alertModalOkBtn), 5000);
    return this.browser.wait(EC.elementToBeClickable(this.alertModalOkBtn),

      7000,
      'Agent waited too long for alert modal, did the customer join?');
  }


}
