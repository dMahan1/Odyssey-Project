describe('login page', () => {
  it('passes', () => {
    const latitude = 40.427083;
    const longitude = -86.92;
    cy.visit('/');
    cy.get('#sign_here a').click();
    cy.url().should('include', 'Signin.html');
    cy.stubGeolocation();
    cy.get('#signin_email').type('cypress@test.qin');
    cy.get('#signin_password').type('password');
    cy.get('#signin_button').click();
    cy.url({ timeout: 15000 }).should('include', 'Map.html');
  });
});