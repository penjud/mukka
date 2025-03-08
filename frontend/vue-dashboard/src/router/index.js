import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layout components
import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Authentication views
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'

// Main application views
import Dashboard from '../views/Dashboard.vue'
import PersonalWorkspace from '../views/workspace/PersonalWorkspace.vue'
import AgentManagement from '../views/agents/AgentManagement.vue'
import ProfileSettings from '../views/settings/ProfileSettings.vue'
import AdminSettings from '../views/settings/AdminSettings.vue'

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
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
        component: ProfileSettings
      },
      {
        path: 'admin',
        name: 'AdminSettings',
        component: AdminSettings,
        meta: { requiresAdmin: true }
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
