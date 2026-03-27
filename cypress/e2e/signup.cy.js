describe('signup page', () => {
    it('passes', () => {
        const latitude = 40.427083;
        const longitude = -86.92;
        cy.visit('/');
        cy.window().then((win) => {
            win.alert = () => {};
        });
        cy.get('#sign_here a').click();
        cy.stubGeolocation();
        cy.window().then((win) => {
            win.success({
                coords: {
                    latitude: 40.427083,
                    longitude: -86.92,
                    accuracy: 100,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null,
                }
            });
        });
        cy.get('#signup_email').type('cypressAlso@test.dln');
        cy.get('#signup_username').type('TestyMcTestFace');
        cy.get('#signup_password').type('password');
        cy.get('#signup_pass_conf').type('password');
        cy.get('#signup_button').click();
        cy.url().should('include', 'Map.html');
        cy.get('#settings_button').click();
        cy.get('#logout').click();
        cy.url().should('eq', 'http://127.0.0.1:8080/');
        cy.stubGeolocation();
        cy.get('#signin_email').type('cypressAlso@test.dln');
        cy.get('#signin_password').type('password');
        cy.get('#signin_button').click();
        cy.url().should('include', 'Map.html');
        cy.get('#settings_button').click();
        cy.url().should('include', 'Settings.html');
        cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true);
            win.alert = () => {};
        });
        cy.get('#delete').click();
        cy.url().should('eq', 'http://127.0.0.1:8080/');
    });
});