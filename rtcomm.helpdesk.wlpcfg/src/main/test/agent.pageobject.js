module.exports = Agent;



function Agent(_browser) {
  this.browser = _browser;
  this.element = _browser.element;

  this.enterBtn = this.element(by.id('btnAgent'));

  this.registerInput = this.element(by.id('register-input'));

  this.registerBtn = this.element(by.id('btn-register'));

  this.alertModalOkBtn = this.element(by.css('[ng-click="ok()"]'));

  this.enableAVBtn = this.element(by.id('btnEnableAV'));

  this.enter = enter;

  this.waitForAlertModal = waitForAlertModal;



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
