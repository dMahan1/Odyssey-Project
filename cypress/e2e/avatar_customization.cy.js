describe('signup page', () => {
    it('ad custom', { retries: 2 }, () => {
        const latitude = 40.427083;
        const longitude = -86.92;
        cy.visit('/');
        cy.get('#sign_here a').click();
        cy.url().should('include', 'Signup.html');
        cy.stubGeolocation();
        cy.get('#signup_email').type('anotherCypress@test.grama');
        cy.get('#signup_username').type('TheGoat182');
        cy.get('#signup_password').type('password');
        cy.get('#signup_pass_conf').type('password');
        cy.get('#signup_button').click();
        cy.url().should('include', 'Map.html');
        cy.window().then((win) => {
            return new Cypress.Promise((resolve) => {
                const interval = setInterval(() => {
                    if (win.socket) {
                        clearInterval(interval);
                        win.socket.emit('give_toucoins', 193800);
                        resolve();
                    }
                }, 100);
            });
        });
        cy.get('#settings_button').click();
        cy.url().should('include', 'Settings.html');
        cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true);
            win.alert = () => {};
        });

        cy.get('#layer-hat').invoke('attr', 'src').should('include', 'Blank-Avatar.png');
        cy.get('#layer-shirt').invoke('attr', 'src').should('include', 'Blank-Avatar.png');
        cy.get('#layer-shoes').invoke('attr', 'src').should('include', 'Blank-Avatar.png');
        cy.get('button[onclick="change_item(\'hat\', 1)"]').click();
        cy.get('button[onclick="change_item(\'hat\', 1)"]').click();
        cy.get('#hat_unlock').click();
        cy.get('button[onclick="change_item(\'shirt\', 1)"]').click();
        cy.get('button[onclick="change_item(\'shirt\', 1)"]').click();
        cy.get('#shirt_unlock').click();
        cy.get('button[onclick="change_item(\'shoes\', 1)"]').click();
        cy.get('#shoes_unlock').click();
        cy.get('#layer-hat').invoke('attr', 'src').should('include', 'Hat2.png');
        cy.get('#layer-shirt').invoke('attr', 'src').should('include', 'Shirt2.png');
        cy.get('#layer-shoes').invoke('attr', 'src').should('include', 'Shoes1.png');
        cy.get('#hat_unlock').should('have.css', 'visibility', 'hidden');
        cy.get('#shirt_unlock').should('have.css', 'visibility', 'hidden');
        cy.get('#shoes_unlock').should('have.css', 'visibility', 'hidden');
        cy.get('#delete').click();
        cy.url().should('eq', 'http://127.0.0.1:8080/');
    });
});