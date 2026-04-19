describe('map action', () => {
    const PIN_SELECTOR = 'img.leaflet-marker-icon[src*="marker-icon.png"]';
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
        cy.get('#temp-pin-name').type('Test');
        cy.get('#save-temp-pin').click();
        cy.wait(1000);
        cy.get(PIN_SELECTOR).should('exist').and('be.visible');
        cy.get(PIN_SELECTOR).trigger('click', { force: true });
        cy.get('.leaflet-popup-content strong').should('contain', 'Test');
        cy.get('.pull-pin-btn').click();
        cy.get('.leaflet-popup-content').should('not.exist');
        cy.get(PIN_SELECTOR).should('not.exist');
    });
});