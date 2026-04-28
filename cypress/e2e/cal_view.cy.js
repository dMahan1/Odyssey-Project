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
    cy.get('#calendar_button').should('exist').click();
    cy.url().should('include', 'Calendar.html');

    cy.get('.week_calendar').should('have.css', 'display', 'flex');
    cy.get('#change_mode_button').click();
    cy.get('#month_change').click();
    cy.get('.month_calendar').should('have.css', 'display', 'flex');
    cy.get('.week_calendar').should('have.css', 'display', 'none');
    cy.get('#change_mode_button').click();
    cy.get('#year_change').click();
    cy.get('.year_calendar').should('have.css', 'display', 'flex');
    cy.get('.month_calendar').should('have.css', 'display', 'none');
    cy.get('#change_mode_button').click();
    cy.get('#week_change').click();
    cy.get('.week_calendar').should('have.css', 'display', 'flex');
    cy.get('.year_calendar').should('have.css', 'display', 'none');
    cy.get('#change_mode_button').click();
    cy.get('#day_change').click();
    cy.get('.day_calendar').should('have.css', 'display', 'flex');
    cy.get('.week_calendar').should('have.css', 'display', 'none');
  });
});