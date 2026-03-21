describe('login page', () => {
  it('passes', () => {
    const latitude = 40.427083;
    const longitude = -86.92;
    cy.visit('/');
    cy.get('#sign_here a').click();
    cy.url().should('include', 'Signin.html');
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

    cy.get('#signin_email').type('cypress@test.qin');
    cy.get('#signin_password').type('password');
    cy.get('#signin_button').click();
    cy.url({ timeout: 15000 }).should('include', 'Map.html');
  });
});