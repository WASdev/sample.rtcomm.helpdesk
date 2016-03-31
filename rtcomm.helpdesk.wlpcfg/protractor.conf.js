//Required to use Mocha in Protractor
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;


exports.config = {
  //  seleniumAddress: process.env.SELENIUM_ADDRESS || 'http://localhost:4444/wd/hub',
  specs: ['src/main/test/*.spec.js'],
  baseUrl: process.env.BASE_URL || 'http://localhost:9080/',
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {

      'args': ['--start-maximized',
        '--allow-file-access-from-files',
        '--disable-gesture-requirement-for-media-playback',
        '--allow-file-access',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--start-maximized'
      ]
    }

  },
  onPrepare: function() {

    global.EC = protractor.ExpectedConditions;
    global.expect = expect;
    browser.manage().window().maximize();

  },

  framework: 'mocha',

  mochaOpts: {
    reporter: 'spec',
    colors: true,
    timeout: 60000
  }
};
