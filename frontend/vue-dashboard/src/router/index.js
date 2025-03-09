import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { onMounted } from 'vue'
import { useRouter as vueUseRouter } from 'vue-router'

// Layout components
import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Authentication views
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'
import ResetPassword from '../views/auth/ResetPassword.vue'

// Main application views
import Dashboard from '../views/Dashboard.vue'
import PersonalWorkspace from '../views/workspace/PersonalWorkspace.vue'
import AgentManagement from '../views/agents/AgentManagement.vue'
import AdminSettings from '../views/settings/AdminSettings.vue'

// Legal pages
import PrivacyPolicy from '../views/legal/PrivacyPolicy.vue'
import TermsOfService from '../views/legal/TermsOfService.vue'
import Contact from '../views/legal/Contact.vue'

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'logout',
        name: 'Logout',
        component: {
          // Use a simple empty component that just logs out and redirects
          setup() {
            const authStore = useAuthStore();
            const router = vueUseRouter();
            
            onMounted(() => {
              authStore.logout();
              router.push('/auth/login');
            });
            
            return () => null; // No rendering needed
          }
        }
      },
      {
        path: 'login',
        name: 'Login',
        component: Login
      },
      {
        path: 'register',
        name: 'Register',
        component: Register
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: ForgotPassword
      },
      {
        path: 'reset-password',
        name: 'ResetPassword',
        component: ResetPassword
      }
    ]
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'workspace',
        name: 'PersonalWorkspace',
        component: PersonalWorkspace
      },
      {
        path: 'agents',
        name: 'AgentManagement',
        component: AgentManagement
      },
      {
        path: 'profile',
        name: 'ProfileSettings',
        component: () => import('../views/ProfileSettingsNew.vue')
      },
      {
        path: 'admin',
        name: 'AdminSettings',
        component: AdminSettings,
        meta: { requiresAdmin: true }
      },
      // Legal routes
      {
        path: 'privacy-policy',
        name: 'PrivacyPolicy',
        component: PrivacyPolicy
      },
      {
        path: 'terms-of-service',
        name: 'TermsOfService',
        component: TermsOfService
      },
      {
        path: 'contact',
        name: 'Contact',
        component: Contact
      }
    ]
  },
  // Default redirect to login page
  {
    path: '/:pathMatch(.*)*',
    redirect: '/auth/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  // Check if user is authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
  } 
  // Check if user is admin for admin-only routes
  else if (requiresAdmin && !authStore.isAdmin) {
    next('/')
  }
  // Redirect to dashboard if user is already logged in but tries to access auth pages
  else if (authStore.isAuthenticated && to.path.startsWith('/auth')) {
    next('/')
  }
  else {
    next()
  }
})

export default router
