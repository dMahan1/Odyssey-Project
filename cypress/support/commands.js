// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// cypress/support/commands.js

Cypress.Commands.add('stubGeolocation', () => {
  const latitude = 40.427083;
  const longitude = -86.92;

  cy.window().then((win) => {
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
    win.navigator.geolocation.getCurrentPosition(
      (pos) => {
        win.latitude = pos.coords.latitude;
        win.longitude = pos.coords.longitude;
        win.location_success = true;
      },
      () => { win.location_success = false; }
    );
  });
  cy.window().its('location_success').should('eq', true);
});