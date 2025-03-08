import { defineStore } from 'pinia'
import mcpApi from '../services/mcp-api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token') || null,
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
            this.setToken(response.token)
          } else {
            // The token might be set as an HTTP-only cookie by the server
            // In this case, we just note that authentication was successful
            this.token = 'authenticated'
            mcpApi.setAuthToken('authenticated')
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
    
    setToken(token) {
      this.token = token
      localStorage.setItem('auth_token', token)
      mcpApi.setAuthToken(token)
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
        
        // Remove token from localStorage
        localStorage.removeItem('auth_token')
        
        // Clear auth token from API service
        mcpApi.setAuthToken(null)
      }
    },
    
    async updateProfile(profileData) {
      this.loading = true
      this.error = null
      
      try {
        // Note: The Auth Server doesn't have a profile endpoint currently
        // This would need to be implemented
        const updatedUser = await mcpApi.put('auth', '/profile', profileData)
        this.setUser(updatedUser)
        return true
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
      // Set the token for API service if it exists
      if (this.token) {
        mcpApi.setAuthToken(this.token)
        return this.fetchUserProfile()
      }
      return Promise.resolve(null)
    }
  }
})
