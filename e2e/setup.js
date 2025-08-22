const detox = require('detox');
const config = require('../.detoxrc.js');

// Configuration globale pour Detox
beforeAll(async () => {
  await detox.init(config, { 
    initGlobals: false,
    launchApp: false 
  });
  
  // Configuration du device
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
      location: 'always',
      camera: 'YES',
      photos: 'YES',
      microphone: 'YES',
    },
    launchArgs: {
      detoxPrintBusyIdleResources: 'YES',
      detoxURLBlacklistRegex: '.*\\/logs.*',
      detoxEnableSynchronization: 'YES',
    },
  });
});

beforeEach(async () => {
  // Réinitialiser l'app avant chaque test
  await device.reloadReactNative();
});

afterAll(async () => {
  await detox.cleanup();
});

// Helpers globaux pour les tests
global.waitForElement = async (testID, timeout = 10000) => {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
};

global.tapElement = async (testID) => {
  await element(by.id(testID)).tap();
};

global.typeInElement = async (testID, text) => {
  await element(by.id(testID)).typeText(text);
};

global.clearAndTypeInElement = async (testID, text) => {
  await element(by.id(testID)).clearText();
  await element(by.id(testID)).typeText(text);
};

global.scrollToElement = async (testID, scrollViewTestID, direction = 'down') => {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .whileElement(by.id(scrollViewTestID))
    .scroll(200, direction);
};

global.swipeElement = async (testID, direction) => {
  await element(by.id(testID)).swipe(direction);
};

global.expectElementVisible = async (testID) => {
  await expect(element(by.id(testID))).toBeVisible();
};

global.expectElementNotVisible = async (testID) => {
  await expect(element(by.id(testID))).not.toBeVisible();
};

global.expectElementText = async (testID, text) => {
  await expect(element(by.id(testID))).toHaveText(text);
};

// Configuration du timeout global
jest.setTimeout(120000);

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});