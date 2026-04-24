describe('map page', () => {
    it('snapback', () => {
        cy.visit('/');
        cy.stubGeolocation();
        cy.window().then((win) => {
            cy.stub(win, 'alert').as('alert');
        });
        cy.get('#signin_email').type('cypress@test.qin');
        cy.get('#signin_password').clear().type('password');
        cy.get('#signin_button').click();
        cy.url().should('include', 'Map.html');
        cy.get('.leaflet-marker-icon').should('exist');
        cy.window().then((win) => {
            win.navigator.geolocation.getCurrentPosition = () => {};
            win.leafletMap.options.zoomAnimation = false;
            win.setAppLocation(40.427083, -86.92);
        });
        cy.get('.leaflet-control-zoom-in').click();
        cy.window().should((win) => {
            expect(win.leafletMap._animatingZoom).to.equal(false);
        });
        cy.window().should((win) => {
            expect(win.leafletMap.getZoom()).to.equal(16);
        });
        cy.get('.leaflet-control-zoom-out').click();
        cy.window().should((win) => {
            expect(win.leafletMap._animatingZoom).to.equal(false);
        });
        cy.window().should((win) => {
            expect(win.leafletMap.getZoom()).to.equal(15);
        });
        cy.get('.leaflet-container')
            .trigger('mousedown', { clientX: 400, clientY: 300 })
            .trigger('mousemove', { clientX: 400, clientY: 9000 })
            .trigger('mouseup');
        cy.window().should((win) => {
            expect(win.leafletMap.getCenter().lat).to.be.greaterThan(40.405);
        });
        cy.get('#snap_btn').click();
        cy.window().should((win) => {
            expect(win.leafletMap.getCenter().lat).to.be.closeTo(40.427083, 0.001);
            expect(win.leafletMap.getCenter().lng).to.be.closeTo(-86.92, 0.001);
        });
    });
});