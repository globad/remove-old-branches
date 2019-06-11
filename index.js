const { Builder, By, Key, until } = require('selenium-webdriver');
const config = require( './config');

const usernameInputId = 'j_username';
const passwordInputId = 'j_password';
const branchElementsSelector = '#branch-list > tbody > tr';
const yesButtonId = 'delete-branch-dialog-submit';

async function login (driver, path) {
  console.log('Going to ' + path);
  await driver.get(path);
  await driver.wait(until.titleIs('Log in - Bitbucket'), 5000);
  console.log('Ready');
  await driver.wait(until.elementLocated(By.id(usernameInputId)), 5000);
  await driver.findElement(By.id(usernameInputId)).sendKeys(config.USER);
  await driver.findElement(By.id(passwordInputId)).sendKeys(config.PASSWORD, Key.RETURN);
  await driver.wait(until.titleIs(config.PAGE_TITLE), 5000);
  console.log('Logged in!');
}

async function scrollToBottom (driver) {
  console.log('Scrolling...');
  for (let i = 0; i < config.NUMBER_OF_SCROLLS; i++) {
    await driver.executeScript('window.scrollBy(0, 2000)');
    await driver.sleep(500);
  }
}

async function getBranchElements (driver) {
  const elements = await driver.findElements(By.css(branchElementsSelector));
  return elements || [];
}

async function condition (driver) {
  const elements = await getBranchElements(driver);
  const result = elements && elements.length > config.LET_THEM_LIVE;
  console.warn('\nNUMBER OF BRANCHES:', elements.length, `${result ? '. Continuing...' : '. Stopping'}`);
  return result;
}

const canBeDeleted = (title) => {
  let includesStopWord = false;
  for (let word of config.STOP_WORDS) {
    if (title.includes(word)) {
      includesStopWord = true;
    }
  }
  return !includesStopWord && title !== ('develop') && title !== ('master');
};

async function deleteBranch (driver, element, title) {
  const re = /\//g;
  const titleEscaped = title.replace(re, '\\/');
  const actionsButtonId = `branch-list-actions-refs/heads/${title}`;
  const actionsButton = await element.findElement(By.id(actionsButtonId));
  if (actionsButton) {
    actionsButton.click();
    await driver.sleep(500);
    const deleteButtonSelector =    `#branch-list-actions-menu-refs\\/heads\\/${titleEscaped} > div > ul > li:nth-child(5)`;
    const deleteButtonSelectorAlt = `#branch-list-actions-menu-refs\\/heads\\/feature\\/${titleEscaped} > div > ul > li:nth-child(5)`;
    let deleteButton = await driver.findElements(By.css(deleteButtonSelector));
    if (!deleteButton.length) {
      deleteButton = await driver.findElements(By.css(deleteButtonSelectorAlt));
    }
    if (deleteButton && deleteButton.length) {
      await deleteButton[0].click();
      await driver.sleep(500);
      const yesButton = await driver.findElement(By.id(yesButtonId));
      if (yesButton) {
        await yesButton.click();
        await driver.sleep(300);
      }
    }
  }
}

async function execute (driver) {
  while (await condition(driver)) {
    const elements = await getBranchElements(driver);
    if (elements.length) {
      let deleted = 0;
      for (let i = elements.length - 1; i > config.LET_THEM_LIVE; i--) {
        const element = elements[i];
        const titleElement = await element.findElement(By.css('td.branch-name-column .line a'));
        const dateTimeElement = await element.findElement(By.css('td.last-updated-column > a > time'));
        if (titleElement && titleElement.getText && dateTimeElement && dateTimeElement.getText) {
          const title = await titleElement.getText();
          const dateTime = await dateTimeElement.getText();
          console.log(`Branch title: ${title}. Last updated: ${dateTime}`);
          console.log('Can delete:', canBeDeleted(title));
          if (canBeDeleted(title)) {
            console.log('Deleting branch ' + title);
            await deleteBranch(driver, element, title);
            console.warn('Branch ' + title + ' was deleted');
            deleted++;
            await driver.sleep(1000);
            break;
          }
        }
      }
      if (!deleted) {
        console.log('Nothing to delete!');
        break;
      }
    }
  }
}

(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await login(driver, config.URL);
    driver.manage().window().maximize();
    await scrollToBottom(driver);
    await execute(driver);
    console.log('Finishing...');
    await driver.sleep(1000);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.quit();
  }
})();