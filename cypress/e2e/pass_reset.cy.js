describe('Pass Reset', () => {
  it('Password resets', () => {
    cy.visit('/');
    cy.stubGeolocation();
    cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
    });
    cy.get('#signin_email').type('robb6@ethereal.email');
    cy.get('#forgot_button').click();
    cy.get('@alert').should('have.been.called');
    cy.wait(2000);
    cy.task('getResetLink', 'robb6@ethereal.email').then((resetLink) => {
      cy.visit(resetLink);
      cy.get('.firebaseui-id-new-password').should('be.visible').type('password123');
      cy.get('.firebaseui-id-submit').click();
      cy.wait(3000);
    });
    cy.visit('/');
    cy.stubGeolocation();
    cy.window().then((win) => {
        win.alert = () => {};
    });
    cy.get('#signin_email').type('robb6@ethereal.email');
    cy.get('#signin_password').type('password123');
    cy.get('#signin_button').click();
    cy.url().should('include', 'Map.html');
  });
});