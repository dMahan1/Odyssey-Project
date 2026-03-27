describe('signup page', () => {
    it('signup_err', () => {
        const latitude = 40.427083;
        const longitude = -86.92;
        cy.visit('/');
        cy.get('#sign_here a').click();
        cy.url().should('include', 'Signup.html');
        cy.stubGeolocation();
        cy.window().then((win) => {
            cy.stub(win, 'alert').as('alert');
        });
        cy.get('#signup_email').type('cypressErr@test.lyc');
        cy.get('#signup_username').type('ErrName69');
        cy.get('#signup_password').type('pass');
        cy.get('#signup_pass_conf').type('pass');
        cy.get('#signup_button').click();
        cy.get('@alert').should('have.been.calledWith', 'Password must be greater than 6 characters.');
        cy.get('#signup_email').clear().type('cypress@test.qin');
        cy.get('#signup_password').clear().type('password');
        cy.get('#signup_pass_conf').clear().type('password');
        cy.get('#signup_button').click();
        cy.get('@alert').should('have.been.calledWith', 'Email already registered. Did you mean to sign in instead?');
        cy.get('#signup_email').clear().type('cypressErr@test.lyc');
        cy.get('#signup_username').clear().type('TestUser');
        cy.get('#signup_button').click();
        cy.get('@alert').should('have.been.calledWith', 'Username is already taken.');
        cy.get('#signup_email').clear().type('cypressErr');
        cy.get('#signup_username').clear().type('ErrName69');
        cy.get('#signup_button').click();
        cy.get('@alert').should('have.been.calledWith', 'Please enter a valid email.');
        cy.get('#signup_email').clear().type('cypressErr@test.lyc');
        cy.get('#signup_pass_conf').clear().type('notPassword');
        cy.get('#signup_button').click();
        cy.get('@alert').should('have.been.calledWith', 'Passwords do not match');
    });
});