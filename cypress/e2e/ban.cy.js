describe('Banning', () => {
  it('bans', () => {
    const aPass = Cypress.env('ADMIN_PASSWORD')
    cy.visit('/');
    cy.stubGeolocation();
    cy.get('#signin_email').type('odysseyadmin307@gmail.com');
    cy.get('#signin_password').type(aPass);
    cy.get('#signin_button').click();
    cy.url().should('include', 'Map.html');
    cy.get('#settings_button').click();
    cy.url().should('include', 'Settings.html');
    cy.get('#ban_search').type('bannedhammed');
    cy.on('window:alert', (text) => {
        expect(text).to.equal('The user has banned for one week, SO SAYS THE BAN HAMMER!!!');
    });
    cy.get('#ban_user').click();
    cy.get('#logout').click();
    cy.url().should('eq', 'http://127.0.0.1:8080/');
    cy.stubGeolocation();
    cy.get('#signin_email').type('banned@test.org');
    cy.get('#signin_password').type('12345678');
    cy.on('window:alert', (text) => {
        expect(text).to.include('You have been struck with the BAN HAMMER, you have been banned until');
        expect(text).to.include('We appreciate your understanding.');
    });
    cy.get('#signin_button').click();
  });
});