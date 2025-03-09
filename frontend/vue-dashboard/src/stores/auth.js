import { defineStore } from 'pinia'
import mcpApi from '../services/mcp-api'
import secureStorage from '../services/secure-storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: secureStorage.getItem('auth_token') || null,
    refreshEnabled: secureStorage.getItem('refresh_enabled') === 'true',
    tokenExpiresAt: secureStorage.getItem('token_expires_at') || null,
    refreshTimerId: null,
    sessionWarningTimerId: null, // Timer for session expiry warning
    showSessionWarning: false,    // Flag to control warning display
    remainingTime: 0,            // Seconds remaining before expiry
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    userProfile: (state) => state.user
  },
  
  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null
      
      try {
        const response = await mcpApi.post('auth', '/login', { username, password })
        
        if (response.user) {
          this.setUser(response.user)
          // Set token from response or cookies if available
          if (response.token) {
            this.setToken(response.token, response.expiresIn || 3600) // Default to 1 hour if no expiry provided
          } else {
            // The token might be set as an HTTP-only cookie by the server
            // In this case, we just note that authentication was successful
            this.token = 'authenticated'
            mcpApi.setAuthToken('authenticated')
            
            // If expiresIn is provided, set up refresh timer
            if (response.expiresIn) {
              this.setupTokenRefresh(response.expiresIn)
            }
          }
          return true
        } else {
          throw new Error('Invalid response from server')
        }
      } catch (error) {
        this.error = error.message || 'Authentication failed'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        // Note: Registration is handled by admin-only endpoint in the Auth Server
        // This would need to be adjusted for a public-facing system
        const response = await mcpApi.post('auth', '/users', userData)
        
        if (response.user) {
          return true
        } else {
          throw new Error(response.message || 'Registration failed')
        }
      } catch (error) {
        this.error = error.message || 'Registration failed'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async fetchUserProfile() {
      if (!this.token) return null
      
      this.loading = true
      try {
        const user = await mcpApi.get('auth', '/me')
        this.setUser(user)
        return user
      } catch (error) {
        this.error = error.message
        this.logout()
        return null
      } finally {
        this.loading = false
      }
    },
    
    setUser(user) {
      this.user = user
    },
    
    setToken(token, expiresIn) {
      this.token = token
      // Store token in secure storage instead of localStorage
      secureStorage.setItem('auth_token', token)
      mcpApi.setAuthToken(token)
      
      // If expiresIn is provided, set up token refresh
      if (expiresIn) {
        const expiresAt = Date.now() + (expiresIn * 1000)
        this.tokenExpiresAt = expiresAt
        // Store expiry time in secure storage
        secureStorage.setItem('token_expires_at', expiresAt.toString())
        
        // Set up auto refresh if enabled
        if (this.refreshEnabled) {
          this.setupTokenRefresh(expiresIn)
        } else {
          // If refresh is not enabled, set up session warning
          this.setupSessionWarning(expiresIn)
        }
      }
    },
    
    setupTokenRefresh(expiresIn) {
      // Clear any existing timer
      if (this.refreshTimerId) {
        clearTimeout(this.refreshTimerId)
      }
      
      // Set refresh to happen 1 minute before token expires
      const refreshDelay = Math.max((expiresIn - 60) * 1000, 0)
      
      this.refreshTimerId = setTimeout(async () => {
        console.log('Refreshing access token...')
        await this.refreshToken()
      }, refreshDelay)
    },
    
    async refreshToken() {
      try {
        // Don't set loading state to avoid UI flicker during refresh
        this.error = null
        
        // Call refresh endpoint
        const response = await mcpApi.post('auth', '/refresh-token')
        
        if (response.token && response.user) {
          // Update token and user info
          this.setToken(response.token, response.expiresIn)
          this.setUser(response.user)
          return true
        }
        return false
      } catch (error) {
        console.error('Token refresh failed:', error)
        // If refresh fails, we'll need to re-authenticate
        // but don't log out automatically to avoid disrupting the user
        return false
      }
    },
    
    async logout() {
      try {
        // Call the server logout endpoint to clear the cookie
        await mcpApi.post('auth', '/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear user data locally regardless of server response
        this.user = null
        this.token = null
        this.tokenExpiresAt = null
        
        // Remove token from secure storage
        secureStorage.removeItem('auth_token')
        secureStorage.removeItem('token_expires_at')
        secureStorage.removeItem('user_profile')
        
        // Clear auth token from API service
        mcpApi.setAuthToken(null)
        
        // Clear any refresh timers
        this.clearRefreshTimer()
      }
    },
    
    setupSessionWarning(expiresIn) {
      // Clear any existing timer
      if (this.sessionWarningTimerId) {
        clearInterval(this.sessionWarningTimerId)
        this.sessionWarningTimerId = null
      }
      
      // Reset the warning flag
      this.showSessionWarning = false
      
      // Calculate when to show the warning (5 minutes before expiry)
      const warningTime = Math.max(expiresIn - 300, 0) * 1000
      
      // Set timeout for the warning
      setTimeout(() => {
        this.showSessionWarning = true
        this.updateRemainingTime()
        
        // Start interval to update remaining time every second
        this.sessionWarningTimerId = setInterval(() => {
          this.updateRemainingTime()
        }, 1000)
      }, warningTime)
    },
    
    updateRemainingTime() {
      if (!this.tokenExpiresAt) return
      
      const now = Date.now()
      const expiresAt = parseInt(this.tokenExpiresAt)
      
      // Calculate remaining seconds
      this.remainingTime = Math.max(0, Math.floor((expiresAt - now) / 1000))
      
      // If expired, clear the interval
      if (this.remainingTime <= 0) {
        if (this.sessionWarningTimerId) {
          clearInterval(this.sessionWarningTimerId)
          this.sessionWarningTimerId = null
        }
        // Force logout when token is fully expired
        setTimeout(() => {
          this.logout()
        }, 1000) // Small delay to allow user to see the message
      }
    },
    
    dismissSessionWarning() {
      this.showSessionWarning = false
      if (this.sessionWarningTimerId) {
        clearInterval(this.sessionWarningTimerId)
        this.sessionWarningTimerId = null
      }
    },
    
    clearRefreshTimer() {
      if (this.refreshTimerId) {
        clearTimeout(this.refreshTimerId)
        this.refreshTimerId = null
      }
      
      if (this.sessionWarningTimerId) {
        clearInterval(this.sessionWarningTimerId)
        this.sessionWarningTimerId = null
      }
    },
    
    async updateProfile(profileData) {
      this.loading = true
      this.error = null
      
      try {
        // FIXED: The correct Auth Server endpoint for profile update is '/me' not '/profile'
        // Try to update the profile using the '/me' endpoint
        try {
          const updatedUser = await mcpApi.put('auth', '/me', profileData);
          this.setUser(updatedUser);
          return true;
        } catch (error) {
          console.warn('Profile update via API failed:', error.message);
          console.warn('Falling back to local profile update');
          
          // Fallback: Update the local user state only if API call fails
          this.user = {
            ...this.user,
            ...profileData,
            preferences: {
              ...(this.user?.preferences || {}),
              ...(profileData.preferences || {})
            }
          };
          
          // Store updated profile in secure storage for persistence
          if (this.user) {
            secureStorage.setItem('user_profile', JSON.stringify(this.user));
          }
          
          return true;
        }
      } catch (error) {
        this.error = error.message || 'Failed to update profile'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async changePassword(passwordData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await mcpApi.put('auth', '/password', passwordData)
        return response.message === 'Password changed successfully'
      } catch (error) {
        this.error = error.message || 'Failed to change password'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async requestPasswordReset(email) {
      this.loading = true
      this.error = null
      
      try {
        const response = await mcpApi.post('auth', '/forgot-password', { email })
        return true
      } catch (error) {
        this.error = error.message || 'Failed to request password reset'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async resetPassword(token, newPassword) {
      this.loading = true
      this.error = null
      
      try {
        const response = await mcpApi.post('auth', '/reset-password', { token, newPassword })
        return response.message === 'Password reset successfully'
      } catch (error) {
        this.error = error.message || 'Failed to reset password'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async logoutAllDevices() {
      this.loading = true
      this.error = null
      
      try {
        await mcpApi.post('auth', '/logout-all')
        // Clear user data locally
        this.user = null
        this.token = null
        localStorage.removeItem('auth_token')
        mcpApi.setAuthToken(null)
        return true
      } catch (error) {
        this.error = error.message || 'Failed to logout from all devices'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async verifyToken() {
      if (!this.token) return false
      
      try {
        const result = await mcpApi.post('auth', '/verify')
        return result.valid
      } catch (error) {
        console.error('Token verification error:', error)
        return false
      }
    },
    
    init() {
      // First check if secure storage is available
      if (!secureStorage.isAvailable()) {
        console.warn('Secure storage is not available, falling back to less secure methods');
        // Try to load from localStorage as fallback
        this.token = localStorage.getItem('auth_token') || null;
        this.tokenExpiresAt = localStorage.getItem('token_expires_at') || null;
        this.refreshEnabled = localStorage.getItem('refresh_enabled') === 'true';
      }
      
      // Set the token for API service if it exists
      if (this.token) {
        mcpApi.setAuthToken(this.token)
        
        // Check if token is expired and needs refresh
        if (this.tokenExpiresAt && this.refreshEnabled) {
          const now = Date.now()
          const expiresAt = parseInt(this.tokenExpiresAt)
          
          if (isNaN(expiresAt)) {
            // Invalid expiry time, clear it
            this.tokenExpiresAt = null
            localStorage.removeItem('token_expires_at')
          } else if (expiresAt > now) {
            // Token not expired yet, set up refresh timer
            const remainingTime = (expiresAt - now) / 1000 // convert to seconds
            this.setupTokenRefresh(remainingTime)
          } else {
            // Token expired, try to refresh it
            this.refreshToken().catch(() => {
              // If refresh fails, we'll need to log in again
              this.logout()
            })
          }
        }
        
        return this.fetchUserProfile()
      }
      
      // Try to load profile from secure storage if available
      const storedProfile = secureStorage.getItem('user_profile');
      if (storedProfile) {
        try {
          this.user = JSON.parse(storedProfile);
        } catch (e) {
          console.error('Failed to parse stored profile:', e);
        }
      }
      
      return Promise.resolve(null)
    }
  }
})
