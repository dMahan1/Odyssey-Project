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