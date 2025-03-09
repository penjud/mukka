import { defineStore } from 'pinia'
import mcpApi from '../services/mcp-api'
import secureStorage from '../services/secure-storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: secureStorage.getItem('auth_token') || null,
    refreshEnabled: true, // Always enable refresh for better session persistence
    tokenExpiresAt: secureStorage.getItem('token_expires_at') || null,
    refreshTimerId: null,
    sessionWarningTimerId: null, // Timer for session expiry warning
    showSessionWarning: false,    // Flag to control warning display
    remainingTime: 0,            // Seconds remaining before expiry
    loading: false,
    error: null,
    tokenRefreshAttempts: 0,
    maxRefreshAttempts: 3
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
        // Try multiple registration endpoints
        try {
          // First try public registration endpoint
          const response = await mcpApi.post('auth', '/register', userData)
          return !!response.user || !!response.success
        } catch (publicError) {
          console.warn('Public registration endpoint failed:', publicError)
          
          // Fall back to admin endpoint
          const response = await mcpApi.post('auth', '/users', userData)
          return !!response.user || !!response.success
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
        let user = null
        
        // Try multiple endpoints for user profile
        try {
          // First try /me endpoint
          user = await mcpApi.get('auth', '/me')
        } catch (meError) {
          console.warn('Failed to fetch user from /me endpoint:', meError.message)
          
          // Fall back to /profile endpoint
          try {
            user = await mcpApi.get('auth', '/profile')
          } catch (profileError) {
            console.warn('Failed to fetch user from /profile endpoint:', profileError.message)
            
            // Last resort - try /user endpoint
            try {
              user = await mcpApi.get('auth', '/user')
            } catch (userError) {
              console.error('All user profile endpoints failed:', userError.message)
              throw userError
            }
          }
        }
        
        if (user) {
          this.setUser(user)
          return user
        } else {
          throw new Error('Failed to retrieve user profile')
        }
      } catch (error) {
        this.error = error.message
        // Don't logout immediately - refresh token first
        const refreshSuccessful = await this.refreshToken()
        if (!refreshSuccessful) {
          // Only logout if refresh failed
          await this.logout()
        }
        return null
      } finally {
        this.loading = false
      }
    },
    
    setUser(user) {
      this.user = user
      // Also store in secure storage for recovery on page reload
      secureStorage.setItem('user_profile', JSON.stringify(user))
    },
    
    setToken(token, expiresIn) {
      this.token = token
      // Store token in secure storage
      secureStorage.setItem('auth_token', token)
      mcpApi.setAuthToken(token)
      
      // Reset refresh attempts counter
      this.tokenRefreshAttempts = 0
      
      // Always enable refresh
      this.refreshEnabled = true
      secureStorage.setItem('refresh_enabled', 'true')
      
      // If expiresIn is provided, set up token refresh
      if (expiresIn) {
        const expiresAt = Date.now() + (expiresIn * 1000)
        this.tokenExpiresAt = expiresAt
        // Store expiry time in secure storage
        secureStorage.setItem('token_expires_at', expiresAt.toString())
        
        // Set up auto refresh
        this.setupTokenRefresh(expiresIn)
      }
    },
    
    setupTokenRefresh(expiresIn) {
      // Clear any existing timer
      if (this.refreshTimerId) {
        clearTimeout(this.refreshTimerId)
      }
      
      // Set refresh to happen at 80% of token lifetime
      // This is earlier than before to prevent token expiry issues
      const refreshDelay = Math.max((expiresIn * 0.8) * 1000, 0)
      
      this.refreshTimerId = setTimeout(async () => {
        console.log('Refreshing access token...')
        await this.refreshToken()
      }, refreshDelay)
    },
    
    async refreshToken() {
      // Increment attempts counter
      this.tokenRefreshAttempts += 1
      
      try {
        // Don't set loading state to avoid UI flicker during refresh
        this.error = null
        
        // Try multiple refresh endpoints
        const refreshEndpoints = [
          '/refresh-token',
          '/refresh',
          '/token/refresh'
        ]
        
        for (const endpoint of refreshEndpoints) {
          try {
            console.log(`Trying to refresh token using ${endpoint}`)
            const response = await mcpApi.post('auth', endpoint)
            
            if (response.token && response.user) {
              // Update token and user info
              this.setToken(response.token, response.expiresIn || 3600)
              this.setUser(response.user)
              console.log('Token refreshed successfully')
              return true
            }
          } catch (endpointError) {
            console.warn(`Refresh endpoint ${endpoint} failed:`, endpointError.message)
          }
        }
        
        // If we've exhausted all endpoints and reached max attempts, give up
        if (this.tokenRefreshAttempts >= this.maxRefreshAttempts) {
          console.error(`Maximum refresh attempts (${this.maxRefreshAttempts}) reached`)
          return false
        }
        
        // If all endpoints failed but we haven't reached max attempts,
        // retry after a delay with exponential backoff
        const backoffDelay = Math.pow(2, this.tokenRefreshAttempts) * 1000
        console.log(`Scheduling retry ${this.tokenRefreshAttempts}/${this.maxRefreshAttempts} after ${backoffDelay}ms`)
        
        return new Promise(resolve => {
          setTimeout(async () => {
            const result = await this.refreshToken()
            resolve(result)
          }, backoffDelay)
        })
      } catch (error) {
        console.error('Token refresh failed:', error)
        return false
      }
    },
    
    async logout() {
      this.loading = true
      this.error = null
      
      // Start by clearing any refresh timers
      this.clearRefreshTimer()
      
      // Create a promise to track the logout request
      let logoutPromise
      
      try {
        // Call the server logout endpoint to clear the cookie
        console.log('Sending logout request to server')
        
        // Try multiple logout endpoints
        const logoutEndpoints = [
          '/logout',
          '/auth/logout',
          '/signout'
        ]
        
        for (const endpoint of logoutEndpoints) {
          try {
            console.log(`Trying logout endpoint: ${endpoint}`)
            logoutPromise = mcpApi.post('auth', endpoint)
            
            // Wait for the request, but with a timeout
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Logout request timed out')), 5000)
            })
            
            await Promise.race([logoutPromise, timeoutPromise])
            console.log(`Server logout successful using ${endpoint}`)
            break
          } catch (error) {
            console.warn(`Logout endpoint ${endpoint} failed:`, error.message)
          }
        }
      } catch (error) {
        console.error('Logout error:', error)
        // Continue with local logout even if server logout fails
      } finally {
        // Clear user data locally regardless of server response
        console.log('Clearing local user data')
        this.user = null
        this.token = null
        this.tokenExpiresAt = null
        this.tokenRefreshAttempts = 0
        
        // Remove token from secure storage and localStorage
        secureStorage.removeItem('auth_token')
        secureStorage.removeItem('token_expires_at')
        secureStorage.removeItem('user_profile')
        secureStorage.removeItem('refresh_enabled')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('token_expires_at')
        localStorage.removeItem('user_profile')
        localStorage.removeItem('refresh_enabled')
        
        // Clear auth token from API service
        mcpApi.setAuthToken(null)
        
        this.loading = false
        console.log('Logout complete')
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
        // Try to refresh the token first
        this.refreshToken().then(success => {
          if (!success) {
            // Force logout when token is fully expired and refresh failed
            this.logout()
          }
        })
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
        // Try multiple endpoints for profile update
        try {
          // First try /me endpoint (RESTful)
          const updatedUser = await mcpApi.put('auth', '/me', profileData)
          this.setUser(updatedUser)
          return true
        } catch (meError) {
          console.warn('Profile update via /me endpoint failed:', meError.message)
          
          // Try /profile endpoint
          try {
            const updatedUser = await mcpApi.put('auth', '/profile', profileData)
            this.setUser(updatedUser)
            return true
          } catch (profileError) {
            console.warn('Profile update via /profile endpoint failed:', profileError.message)
            
            // Last resort - update local only
            console.warn('Falling back to local profile update')
            this.user = {
              ...this.user,
              ...profileData,
              preferences: {
                ...(this.user?.preferences || {}),
                ...(profileData.preferences || {})
              }
            }
            
            // Store updated profile in secure storage for persistence
            if (this.user) {
              secureStorage.setItem('user_profile', JSON.stringify(this.user))
            }
            
            return true
          }
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
        // Try multiple endpoints for password change
        try {
          // First try /password endpoint
          const response = await mcpApi.put('auth', '/password', passwordData)
          return response.message === 'Password changed successfully' || !!response.success
        } catch (pwError) {
          console.warn('Password change via /password endpoint failed:', pwError.message)
          
          // Try /change-password endpoint
          try {
            const response = await mcpApi.post('auth', '/change-password', passwordData)
            return response.message === 'Password changed successfully' || !!response.success
          } catch (cpError) {
            console.error('All password change endpoints failed:', cpError.message)
            throw cpError
          }
        }
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
        // Try multiple endpoints for password reset request
        try {
          // First try /forgot-password endpoint
          const response = await mcpApi.post('auth', '/forgot-password', { email })
          return !!response.success || !!response.message
        } catch (fpError) {
          console.warn('Password reset request via /forgot-password endpoint failed:', fpError.message)
          
          // Try /reset-request endpoint
          try {
            const response = await mcpApi.post('auth', '/reset-request', { email })
            return !!response.success || !!response.message
          } catch (rrError) {
            console.error('All password reset request endpoints failed:', rrError.message)
            throw rrError
          }
        }
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
        // Try multiple endpoints for password reset
        try {
          // First try /reset-password endpoint
          const response = await mcpApi.post('auth', '/reset-password', { token, newPassword })
          return response.message === 'Password reset successfully' || !!response.success
        } catch (rpError) {
          console.warn('Password reset via /reset-password endpoint failed:', rpError.message)
          
          // Try /reset endpoint
          try {
            const response = await mcpApi.post('auth', '/reset', { token, password: newPassword })
            return response.message === 'Password reset successfully' || !!response.success
          } catch (rError) {
            console.error('All password reset endpoints failed:', rError.message)
            throw rError
          }
        }
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
        // Try multiple endpoints for logout from all devices
        try {
          // First try /logout-all endpoint
          await mcpApi.post('auth', '/logout-all')
        } catch (laError) {
          console.warn('Logout all devices via /logout-all endpoint failed:', laError.message)
          
          // Try /signout-all endpoint
          try {
            await mcpApi.post('auth', '/signout-all')
          } catch (saError) {
            console.error('All logout from all devices endpoints failed:', saError.message)
            throw saError
          }
        }
        
        // Clear user data locally
        this.user = null
        this.token = null
        this.tokenExpiresAt = null
        
        // Clear storage
        secureStorage.removeItem('auth_token')
        secureStorage.removeItem('token_expires_at')
        secureStorage.removeItem('user_profile')
        secureStorage.removeItem('refresh_enabled')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('token_expires_at')
        localStorage.removeItem('user_profile')
        localStorage.removeItem('refresh_enabled')
        
        // Clear API token
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
        // Try multiple endpoints for token verification
        try {
          // First try /verify endpoint
          const result = await mcpApi.post('auth', '/verify')
          return result.valid || !!result.success
        } catch (vError) {
          console.warn('Token verification via /verify endpoint failed:', vError.message)
          
          // Try /validate-token endpoint
          try {
            const result = await mcpApi.post('auth', '/validate-token')
            return result.valid || !!result.success
          } catch (vtError) {
            console.warn('Token verification via /validate-token endpoint failed:', vtError.message)
            
            // Fall back to /me check as verification
            try {
              const user = await mcpApi.get('auth', '/me')
              return !!user && !!user.username
            } catch (meError) {
              console.error('All token verification endpoints failed:', meError.message)
              return false
            }
          }
        }
      } catch (error) {
        console.error('Token verification error:', error)
        return false
      }
    },
    
    async init() {
      try {
        // First check if secure storage is available
        if (!secureStorage.isAvailable()) {
          console.warn('Secure storage is not available, falling back to less secure methods');
          // Try to load from localStorage as fallback
          this.token = localStorage.getItem('auth_token') || null;
          this.tokenExpiresAt = localStorage.getItem('token_expires_at') || null;
          this.refreshEnabled = true; // Always enable refresh for better experience
        }
        
        // Load profile from secure storage if available
        const storedProfile = secureStorage.getItem('user_profile');
        if (storedProfile) {
          try {
            this.user = JSON.parse(storedProfile);
            console.log('Loaded user profile from secure storage:', this.user?.username);
          } catch (e) {
            console.error('Failed to parse stored profile:', e);
          }
        }
        
        // Set the token for API service if it exists
        if (this.token) {
          mcpApi.setAuthToken(this.token)
          console.log('Auth token found, attempting to restore session');
          
          // Check if token is expired and needs refresh
          if (this.tokenExpiresAt) {
            const now = Date.now()
            const expiresAt = parseInt(this.tokenExpiresAt)
            
            if (isNaN(expiresAt)) {
              // Invalid expiry time, clear it
              this.tokenExpiresAt = null
              secureStorage.removeItem('token_expires_at')
              localStorage.removeItem('token_expires_at')
            } else if (expiresAt > now) {
              // Token not expired yet, set up refresh timer
              const remainingTime = (expiresAt - now) / 1000 // convert to seconds
              console.log(`Token valid for ${Math.round(remainingTime)} more seconds`);
              
              // Always enable refresh for better session persistence
              this.refreshEnabled = true;
              secureStorage.setItem('refresh_enabled', 'true');
              localStorage.setItem('refresh_enabled', 'true');
              
              this.setupTokenRefresh(remainingTime)
            } else {
              // Token expired, try to refresh it
              console.log('Token expired, attempting refresh');
              const refreshSuccessful = await this.refreshToken();
              
              if (!refreshSuccessful) {
                console.warn('Token refresh failed, logging out');
                await this.logout();
                return null;
              }
            }
          }
          
          // Fetch user profile to confirm session is valid, but don't wait for it
          // This helps prevent page refresh issues while still eventually validating the session
          setTimeout(async () => {
            try {
              await this.fetchUserProfile();
            } catch (error) {
              console.warn('Background profile fetch failed:', error.message);
            }
          }, 0);
          
          // Return the stored profile immediately for faster UI rendering
          return this.user;
        }
        
        return null;
      } catch (error) {
        console.error('Error during auth initialization:', error);
        return null;
      }
    }
  }
})
