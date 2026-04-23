describe('login page', () => {
  it('view change', () => {
    cy.visit('/');
    cy.stubGeolocation();
    cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
    });
    cy.get('#signin_email').type('cypress@test.qin');
    cy.get('#signin_password').clear().type('password');
    cy.get('#signin_button').click();
    cy.url().should('include', 'Map.html');
    cy.get('#loc_search_bar').type('Kran');
    cy.get('#loc_search_btn').click();
    cy.get('.loc_result_info').click();
    cy.get('.loc_name').should('contain', 'No upcoming events at this location.')
  });
});