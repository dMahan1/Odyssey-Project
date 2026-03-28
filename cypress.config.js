const { defineConfig } = require('cypress')
const { cypressBrowserPermissionsPlugin } = require('cypress-browser-permissions')

module.exports = defineConfig({
  env: {
    browserPermissions: {
      notifications: "allow",
      geolocation: "allow",
    },
  },
  chromeWebSecurity: false,
  e2e: {
    baseUrl: 'http://127.0.0.1:8080',
    setupNodeEvents(on, config) {
      config = cypressBrowserPermissionsPlugin(on, config)
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
      return config
    },
  },
})
