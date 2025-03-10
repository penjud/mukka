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
import AgentCustomization from '../views/agents/AgentCustomization.vue'
import AdminSettings from '../views/settings/AdminSettings.vue'

// Legal pages
import PrivacyPolicy from '../views/legal/PrivacyPolicy.vue'
import TermsOfService from '../views/legal/TermsOfService.vue'
import Contact from '../views/legal/Contact.vue'

// Global navigation state to prevent multiple redirects
const navigationState = {
  isAuthenticating: false,
  pendingRoute: null
}

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
            
            onMounted(async () => {
              try {
                console.log('Logout component mounted, attempting logout');
                await authStore.logout();
                console.log('Logout successful, redirecting to login');
                router.replace('/auth/login');
              } catch (error) {
                console.error('Error during logout:', error);
                // Force navigation to login even if logout fails
                router.replace('/auth/login');
              }
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
        path: 'agents/customize',
        name: 'AgentCustomization',
        component: AgentCustomization
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  
  // Check if authentication is in progress
  if (navigationState.isAuthenticating) {
    // If we're already authenticating and have a pending route, update it
    if (requiresAuth) {
      navigationState.pendingRoute = to.fullPath
    }
    console.log('Authentication in progress, deferring navigation to:', to.path)
    next(false) // Abort current navigation while authenticating
    return
  }
  
  // Check if this is first navigation after page load
  const isInitialNavigation = from.name === undefined
  
  // Handle token verification for authentication-required routes
  if (requiresAuth) {
    // If no token exists or user is not authenticated, redirect to login
    if (!authStore.token) {
      console.log(`Access to ${to.path} requires authentication, redirecting to login`)
      next({ path: '/auth/login', query: { redirect: to.fullPath } })
      return
    }
    
    // If token exists but no user (e.g. on page refresh), verify the token
    if (authStore.token && !authStore.user) {
      console.log('Token exists but no user object, verifying session')
      navigationState.isAuthenticating = true
      navigationState.pendingRoute = to.fullPath
      
      try {
        // Attempt to verify the token before proceeding
        console.log('Verifying token...')
        const userProfile = await authStore.fetchUserProfile()
        
        navigationState.isAuthenticating = false
        
        if (!userProfile) {
          console.warn('Token validation failed, redirecting to login')
          next({ path: '/auth/login', query: { redirect: navigationState.pendingRoute } })
          return
        }
        
        // If token is valid but the route requires admin privileges
        if (requiresAdmin && !authStore.isAdmin) {
          console.log(`Access to ${navigationState.pendingRoute} requires admin privileges, redirecting to home`)
          next('/')
          return
        }
        
        // Valid token and proper permissions, proceed to original route
        console.log(`Authentication successful, proceeding to ${navigationState.pendingRoute}`)
        next({ path: navigationState.pendingRoute, replace: true })
        return
      } catch (error) {
        console.error('Error during token verification:', error)
        navigationState.isAuthenticating = false
        next({ path: '/auth/login', query: { redirect: navigationState.pendingRoute } })
        return
      }
    }
    
    // Token and user exist, check for admin privileges if required
    if (requiresAdmin && !authStore.isAdmin) {
      console.log(`Access to ${to.path} requires admin privileges, redirecting to home`)
      next('/')
      return
    }
  }
  
  // Redirect to dashboard if user is already logged in but tries to access auth pages
  if (authStore.isAuthenticated && to.path.startsWith('/auth') && to.name !== 'Logout') {
    console.log('User already authenticated, redirecting to dashboard')
    next('/')
    return
  }
  
  // If no special conditions apply, proceed with navigation
  next()
})

// After each navigation, check if token needs refresh
router.afterEach((to) => {
  // Skip for auth routes
  if (to.path.startsWith('/auth')) {
    return
  }
  
  const authStore = useAuthStore()
  if (authStore.isAuthenticated && authStore.tokenExpiresAt) {
    // Check if token is close to expiry (less than 15 minutes remaining, increased from 5)
    const now = Date.now()
    const expiresAt = parseInt(authStore.tokenExpiresAt)
    const remainingSeconds = (expiresAt - now) / 1000
    
    if (!isNaN(expiresAt) && remainingSeconds > 0 && remainingSeconds < 900) {
      console.log(`Token expiring soon (${Math.round(remainingSeconds)}s), refreshing...`)
      authStore.refreshToken().catch(error => {
        console.error('Background token refresh failed:', error)
      })
    }
  }
})

// Add a global error handler for API errors that might indicate authentication issues
router.onError((error) => {
  console.error('Router error:', error)
  
  // Check if this is an authentication error
  if (error.message && (
    error.message.includes('401') || 
    error.message.includes('403') || 
    error.message.includes('Authentication required') ||
    error.message.includes('Invalid token') ||
    error.message.includes('Token expired')
  )) {
    console.warn('Authentication error detected in router, refreshing token')
    const authStore = useAuthStore()
    
    // Try to refresh the token without disrupting the user
    authStore.refreshToken().catch(() => {
      // If refresh fails, redirect to login
      console.error('Token refresh failed after error, redirecting to login')
      router.push('/auth/login')
    })
  }
})

export default router
