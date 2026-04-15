describe('map search', () => {
    const EXPECTED_ROUTE = [
        {"lat":40.42453587760915,"lng":-86.91110619345575},
        {"lat":40.42442976609365,"lng":-86.91110619345575},
        {"lat":40.42442976609365,"lng":-86.91098819668645},
        {"lat":40.42443792852387,"lng":-86.91091042608849},
        {"lat":40.42431549196669,"lng":-86.9107602483821},
        {"lat":40.4241195930116,"lng":-86.91052157309873},
        {"lat":40.42389104350963,"lng":-86.91050548263021}
    ];
    it('search', () => {
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
        cy.get("#loc_search_bar").clear().type('Kran');
        cy.get('#loc_search_btn').click();
        cy.get('.loc_name').should('contain', 'Krannert School of Management');
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
                expect(latlngs).to.have.lengthOf(EXPECTED_ROUTE.length);
                latlngs.forEach((point, i) => {
                    expect(point.lat).to.be.closeTo(EXPECTED_ROUTE[i].lat, 0.0001);
                    expect(point.lng).to.be.closeTo(EXPECTED_ROUTE[i].lng, 0.0001);
                });
            });
        });
    });
});