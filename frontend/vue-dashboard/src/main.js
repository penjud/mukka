import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { startDiscovery } from './services/discovery';
import { initFetchOverride } from './services/fetch-override';
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
      },
      'midnight-nebula': {
        dark: true,
        colors: {
          primary: '#2D1B54',
          secondary: '#1A1048',
          accent: '#FF00FF',
          tertiary: '#00FFFF',
          error: '#FF5252',
          info: '#7B52CC',
          success: '#3A2B69',
          warning: '#A020F0',
          background: '#121212',
          surface: '#1E1E1E',
          'on-background': '#E0E0E0',
          'on-surface': '#E0E0E0'
        }
      },
      'eco-tech': {
        dark: false,
        colors: {
          primary: '#2E7D32',
          secondary: '#7CB342',
          tertiary: '#607D8B',
          accent: '#009688',
          error: '#D32F2F',
          info: '#4DB6AC',
          success: '#388E3C',
          warning: '#F57C00',
          background: '#FFFFFF',
          surface: '#F5F5F5',
          'on-background': '#263238',
          'on-surface': '#263238'
        }
      },
      'corporate-clarity': {
        dark: false,
        colors: {
          primary: '#0D47A1',
          secondary: '#4285F4',
          accent: '#FF9800',
          tertiary: '#1565C0',
          error: '#D32F2F',
          info: '#64B5F6',
          success: '#388E3C',
          warning: '#FFB74D',
          background: '#FFFFFF',
          surface: '#F5F5F5',
          'on-background': '#263238',
          'on-surface': '#263238'
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

// Initialize fetch API override
initFetchOverride();

// Mount app
app.mount('#app');
