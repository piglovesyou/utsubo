const {render} = require('react-dom');
const routes = require('./routes');
const Driver = require('./core/driver');

render(routes, document.getElementById('application-container'));

const win = require('nw.gui').Window.get();
win.moveTo(200, 150);
// win.showDevTools();

win.on('close', async () => {
  const driver = await Driver.getDefaultContent();
  await timeout(400); // I don't know why I need this timeout to close stablly
  // We don need to call `driver.close()`, let nw.js close its window by itself.
  driver.quit().thenFinally(() => {
    win.close(true);
  });
  // TODO: `chromedriver` process still exists. How do we terminate it from nw?
});

// For development
const {WebDriver, By, Key, until} = require('selenium-webdriver');
const {timeout, showDevTools, closeDevTools} = require('./util');
const assert = require('power-assert');
(async () => {
  try {
    await timeout(800);
    await showDevTools();

    var driver = await Driver.getDefaultContent();
    await driver.findElement(By.css('.browser__rec-btn')).click();
    // await locationInputEl.sendKeys('http://www.google.com/ncr');
    await driver.findElement(By.css('.browser_location-input')).sendKeys('http://passwordsgenerator.net/md5-hash-generator/');
    await driver.findElement(By.css('.browser_location-input')).sendKeys(Key.ENTER);

    var driver = await Driver.get();
    var txt1El = await driver.findElement(By.css('#txt1')).then(el => el);
    txt1El.sendKeys('abc');

    // await timeout(800);
    // var driver = await Driver.getDefaultContent();
    // var verifyBtn = driver.findElement(By.css('.step-adder__verify')).then(el => el);
    // await driver.actions()
    //   .click(verifyBtn)
    //   .mouseMove(txt1El, {x: 10, y: 10})
    //   .click(txt1El);

    await showDevTools();
    
  } catch(e) {
    await showDevTools();
    await timeout(800);
    debugger;
  }

})();
