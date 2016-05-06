import assert from 'assert';
import Q from 'q';
import getpid_ from 'getpid';
const getpid = Q.denodeify(getpid_);
import kill_ from 'tree-kill';
const kill = Q.denodeify(kill_);

import {CHROMEDRIVER_PORT} from '../src/const';
import {WebDriver, By, Key, until} from 'selenium-webdriver';
import HttpUtil from 'selenium-webdriver/http/util';
import Http from 'selenium-webdriver/http';
import Chrome from 'selenium-webdriver/chrome';
import {Command, Name} from 'selenium-webdriver/lib/command';
import {getDriver, switchToDefaultContent, switchToFrame, timeout, launchCarbuncle, terminateAll} from './lib';

describe('Carbuncle', function() {
  this.timeout(20 * 1000);

  beforeEach(launchCarbuncle);
  afterEach(terminateAll);

  it('should correctly launch and halt', async function () {
    assert(await getpid('carbuncle'));
    assert(await getpid('chromedriver'));
    assert(await getpid('nw'));

    const driver = await getDriver();
    assert(await driver.isElementPresent(By.id('application-container')));

    await kill(await getpid('carbuncle'), null);
    assert(!(await getpid('carbuncle')));
    assert(!(await getpid('chromedriver')));
    await timeout(500); // nw needs time to terminate
    assert(!(await getpid('nw')));
  });

  it.skip('should correctly launch and halt', async function () {
    // TODO: Not stable. Why?

    const driver = await getDriver();

    // Start recording
    await driver.findElement(By.css('.browser__rec-btn')).click();

    // Open web site
    await driver.findElement(By.css('.browser__location-input input')).sendKeys('http://www.google.com/ncr');
    await driver.findElement(By.css('.browser__location-input input')).sendKeys(Key.ENTER);

    await switchToFrame(driver);
    await driver.findElement(By.name('q')).sendKeys('carbuncle');
    await driver.findElement(By.name('q')).sendKeys(Key.ENTER);

    await switchToDefaultContent(driver);
    await driver.findElement(By.css('.step-adder__verify')).click();
    await timeout(400);

    await switchToFrame(driver);
    // await timeout(400);
    await driver.findElement(By.css('.g h3')).click();
    // await timeout(400);

    await switchToDefaultContent(driver);
    await timeout(400);
    await driver.findElement(By.css('.palette__playback-btn')).click();
  });
});
