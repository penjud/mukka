import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { startDiscovery } from './services/discovery';
import { useAuthStore } from './stores/auth';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3f51b5',
          secondary: '#607d8b',
          accent: '#ff4081',
          error: '#f44336',
          warning: '#ff9800',
          info: '#2196f3',
          success: '#4caf50'
        }
      },
      dark: {
        colors: {
          primary: '#5c6bc0',
          secondary: '#78909c',
          accent: '#ff4081',
          error: '#e57373',
          warning: '#ffb74d',
          info: '#64b5f6',
          success: '#81c784'
        }
      }
    }
  }
});

// Create Pinia store
const pinia = createPinia();

// Create app
const app = createApp(App);

// Use plugins
app.use(pinia);
app.use(router);
app.use(vuetify);

// Initialize auth store
const authStore = useAuthStore();
authStore.init().then(() => {
  console.log('Auth store initialized');
}).catch(error => {
  console.error('Failed to initialize auth store:', error);
});

// Start service discovery
startDiscovery();

// Mount app
app.mount('#app');
