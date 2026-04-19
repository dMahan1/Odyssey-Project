describe('map search', () => {
    const EXPECTED_ROUTE = [
        {"lat":40.42773281484029,"lng":-86.91998668805766},
        {"lat":40.42773281484029,"lng":-86.91915266543825},
        {"lat":40.42728353001878,"lng":-86.91915571782457},
        {"lat":40.42625520372239,"lng":-86.91914468752138},
        {"lat":40.4252312844538,"lng":-86.91912338056945},
        {"lat":40.42528750907006,"lng":-86.92168193607813},
        {"lat":40.425302982307244,"lng":-86.92202568054199},
        {"lat":40.42531114965475,"lng":-86.92255139211615},
        {"lat":40.42532198671592,"lng":-86.92332886116039},
        {"lat":40.425333471777606,"lng":-86.92412269133558},
        {"lat":40.42629576234009,"lng":-86.92412021774207},
        {"lat":40.42630041919541,"lng":-86.92496672342322}
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
        cy.get('#car_btn').click();
        cy.get("#loc_search_bar").type('Qxywqz48');
        cy.get('#loc_search_btn').click();
        cy.get('.loc_name').should('contain', 'No locations found.');
        cy.get('#search_popup_close').click();
        cy.get("#loc_search_bar").clear().type('Mac');
        cy.get('#loc_search_btn').click();
        cy.get('.loc_name').should('contain', 'MacArthur Drive');
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