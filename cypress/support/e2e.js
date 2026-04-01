// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

Cypress.on('window:before:load', (win) => {
  const latitude = 40.427083;
  const longitude = -86.92;

  Object.defineProperty(win.navigator, 'geolocation', {
    value: {
      getCurrentPosition: (successCb, errorCb, options) => {
        successCb({
          coords: {
            latitude,
            longitude,
            accuracy: 100,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: new Date().getTime(),
        });
      },
    },
    writable: true,
  });

  win.alert = () => {};
});