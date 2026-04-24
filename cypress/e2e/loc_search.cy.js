describe('map search', () => {
    it('search', { retries: 2 }, () => {
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
        cy.get("#loc_search_bar").type('Qxywqz48');
        cy.get('#loc_search_btn').click();
        cy.get('.loc_name').should('contain', 'No locations found.');
        cy.get('#search_popup_close').click();
        cy.get("#loc_search_bar").clear().type('1950');
        cy.get('#loc_search_btn').click();
        cy.get('.loc_name').should('contain', 'Class of 1950 Lecture Hall (CL50)');
        cy.get('.loc_result_route').click();
        cy.get('path.leaflet-interactive[stroke="#00ace6"]').should('exist').then(() => {
            cy.window().then((win) => {
                const map = win.leafletMap;
                let routeLayer = null;
                map.eachLayer((layer) => {
                    if (layer.options && layer.options.color === '#00ace6') {
                        routeLayer = layer;
                    }
                });
                expect(routeLayer).to.not.be.null;
                const latlngs = routeLayer.getLatLngs();
                expect(latlngs.length).to.be.greaterThan(0);
                win._walkRouteLength = latlngs.length;
            });
        });

        cy.get('#car_btn').click();
        cy.get("#loc_search_bar").clear().type('1950');
        cy.get('#loc_search_btn').click();
        cy.get('.loc_name').should('contain', 'Class of 1950 Lecture Hall (CL50)');
        cy.get('.loc_result_route').click();
        cy.get('path.leaflet-interactive[stroke="#00ace6"]').should('exist').then(() => {
            cy.window().then((win) => {
                const map = win.leafletMap;
                let routeLayer = null;
                map.eachLayer((layer) => {
                    if (layer.options && layer.options.color === '#00ace6') {
                        routeLayer = layer;
                    }
                });
                expect(routeLayer).to.not.be.null;
                const latlngs = routeLayer.getLatLngs();
                expect(latlngs.length).to.be.greaterThan(0);
                expect(latlngs.length).to.not.equal(win._walkRouteLength);
            });
        });
    });
});