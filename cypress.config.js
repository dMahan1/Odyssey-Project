const { defineConfig } = require('cypress');
const { cypressBrowserPermissionsPlugin } = require('cypress-browser-permissions');
const dotenvPlugin = require('cypress-dotenv');
const admin = require('firebase-admin');
const serviceAccount = require('./cypress/service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = defineConfig({
    defaultCommandTimeout: 10000,
    env: {
        browserPermissions: {
            notifications: "allow",
            geolocation: "allow",
        },
    },
    chromeWebSecurity: false,
    e2e: {
        baseUrl: 'http://127.0.0.1:8080',
        async setupNodeEvents(on, config) {
            config = dotenvPlugin(config, { path: './.env' }, true);
            config = cypressBrowserPermissionsPlugin(on, config);
            on('task', {
                log(message) {
                    console.log(message);
                    return null;
                },
                getResetLink(email) {
                    return admin.auth().generatePasswordResetLink(email);
                }
            });
            return config;
        },
    },
})