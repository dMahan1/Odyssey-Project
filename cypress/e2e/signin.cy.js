describe('login page', () => {
  it('passes', () => {
    const latitude = 40.427083;
    const longitude = -86.92;
    cy.visit('/');
    cy.get('#sign_here a').click();
    cy.url().should('include', 'Signin.html');
    cy.stubGeolocation();
    cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
    });
    cy.get('#signin_email').type('cypress@test.qin');
    cy.get('#signin_password').type('password123');
    cy.get('#signin_button').click();
    cy.get('@alert').should('have.been.calledWith', 'Incorrect Password');
    cy.get('#signin_password').clear().type('password');
    cy.get('#signin_button').click();
    cy.url().should('include', 'Map.html');
  });
});