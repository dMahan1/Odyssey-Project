describe('login page', () => {
  it('signin', () => {
    cy.visit('/');
    cy.stubGeolocation();
    cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
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