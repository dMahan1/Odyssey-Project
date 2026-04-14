describe('map action', () => {
    it('pin', () => {
        cy.visit('/');
        cy.stubGeolocation();
        cy.window().then((win) => {
            cy.stub(win, 'alert').as('alert');
        });
        cy.get('#signin_email').type('cypress@test.qin');
        cy.get('#signin_password').clear().type('password');
        cy.get('#signin_button').click();
        cy.url().should('include', 'Map.html');
        cy.get('#make-pin-btn').click();
        cy.get('#map').click(500, 300);
        
    });
});