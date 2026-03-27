describe('login page', () => {
  it('passes', () => {
    cy.visit('/');
    cy.get('#sign_here a').click();
    cy.url().should('include', 'Signup.html');
    cy.stubGeolocation();
    cy.window().then((win) => {
        win.success({
            coords: {
                latitude: 40.427083,
                longitude: -86.92,
                accuracy: 100,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
            }
        });
    });
    cy.window().then((win) => {
        win.alert = () => {};
    });
    cy.get('#signin_email').type('cypress@test.qin');
    cy.get('#signin_password').type('password123');
    cy.get('#signin_button').click();
    cy.get('@alert').should('have.been.calledWith', 'Incorrect Password for provided email');
    cy.get('#signin_password').clear().type('password');
    cy.get('#signin_button').click();
    cy.url().should('include', 'Map.html');
  });
});