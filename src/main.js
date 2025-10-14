/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

import router from './router'

// Styles
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

router.isReady().then(() => {
  app.mount('#app')
})
