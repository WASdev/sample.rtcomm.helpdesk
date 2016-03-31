module.exports = Customer;


function Customer(_browser) {
    this.browser = _browser;
    this.element = _browser.element;
    
    
    this.enterBtn = this.element(by.id('btnCustomer'));
    this.connectModal = {

      aliasInput: this.element(by.model('vm.endpointAlias')),
      connectBtn: this.element(by.css('[ng-click="vm.ok()"'))
    };

    this.aliasInput = this.element(by.model('vm.endpointAlias'));
    this.helpdeskBtn = this.element(by.id('btn-helpdesk'));


    this.enter = enter;
    this.waitForHelpModal = waitForHelpModal;
    this.waitForHelpdeskBtn = waitForHelpdeskBtn;

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
      this.enterBtn.click();
      var self = this;
      //Wait and see the url change
      this.browser.wait(function() {
        return self.browser.getCurrentUrl().then(function(url) {
          self.browser.ignoreSynchronization = false;

          return /customerHome/.test(url);
        });
      }, 10000, 'Expected URL to change to Customer Home, but it timed out!');


    }

    function waitForHelpModal() {

      return this.browser.wait(EC.elementToBeClickable(this.connectModal.connectBtn),

        5000,
        'Waited for Connect modal too long to appear');


    }

    function waitForHelpdeskBtn() {

      return this.browser.wait(EC.elementToBeClickable(this.helpdeskBtn),
        5000,
        'Waited too long for \'Helpdesk Button\' to appear active - Client probably couldn\'t connect to the broker, is it setup?');
    }




  }