import { defineStore } from 'pinia';

export const useUserProfileStore = defineStore('userProfile', {
  state: () => ({
    id: null,
    displayName: '',
    username: '',
    email: '',
    role: '',
    createdAt: '',
    avatarUrl: '',
    bannerUrl: '',
    theme: localStorage.getItem('mcp_theme') || 'system',
    isLoading: false,
    error: null
  }),
  
  getters: {
    userInitials: (state) => {
      if (!state.displayName) return '?';
      return state.displayName
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    },
    
    userFirstName: (state) => {
      return state.displayName?.split(' ')[0] || 'User';
    },
    
    formattedJoinDate: (state) => {
      if (!state.createdAt) return 'Unknown';
      return new Date(state.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  
  actions: {
    // Initialize with data from localStorage or API
    async init() {
      try {
        this.isLoading = true;
        
        // Load from localStorage first for a fast initial render
        this.loadFromLocalStorage();
        
        // Then attempt to load from API
        await this.fetchFromApi();
      } catch (error) {
        console.error('Error initializing user profile:', error);
        this.error = 'Failed to load user profile';
      } finally {
        this.isLoading = false;
      }
    },
    
    // Load data from localStorage
    loadFromLocalStorage() {
      // Load theme (already loaded in state initialization)
      // Load displayName if available
      const storedName = localStorage.getItem('mcp_displayName');
      if (storedName) {
        this.displayName = storedName;
      }
      
      // Load avatar if available
      const storedAvatar = localStorage.getItem('mcp_avatar');
      if (storedAvatar) {
        this.avatarUrl = storedAvatar;
      }
      
      // Load banner if available
      const storedBanner = localStorage.getItem('mcp_banner');
      if (storedBanner) {
        this.bannerUrl = storedBanner;
      }
    },
    
    // Fetch data from API
    async fetchFromApi() {
      try {
        // Simulate API call - in a real app, this would come from an API service
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock response
        const response = {
          data: {
            id: '1',
            displayName: 'Alex Johnson',
            username: 'alex.johnson',
            email: 'alex.johnson@example.com',
            role: 'Administrator',
            createdAt: '2023-05-15T14:30:00.000Z',
            avatarUrl: localStorage.getItem('mcp_avatar') || '',
            bannerUrl: localStorage.getItem('mcp_banner') || '',
            theme: localStorage.getItem('mcp_theme') || 'system'
          }
        };
        
        // Update store with API data
        const userData = response.data;
        this.id = userData.id;
        this.displayName = userData.displayName;
        this.username = userData.username;
        this.email = userData.email;
        this.role = userData.role;
        this.createdAt = userData.createdAt;
        
        // Use localStorage values if they exist, otherwise use API values
        // This ensures any local changes take precedence
        this.avatarUrl = localStorage.getItem('mcp_avatar') || userData.avatarUrl;
        this.bannerUrl = localStorage.getItem('mcp_banner') || userData.bannerUrl;
        this.theme = localStorage.getItem('mcp_theme') || userData.theme;
        
        return userData;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.error = 'Failed to fetch user profile';
        throw error;
      }
    },
    
    // Update display name
    async updateDisplayName(displayName) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update local state
        this.displayName = displayName;
        
        // Store in localStorage for persistence
        localStorage.setItem('mcp_displayName', displayName);
        
        return { success: true };
      } catch (error) {
        console.error('Error updating display name:', error);
        this.error = 'Failed to update display name';
        throw error;
      }
    },
    
    // Update theme
    async updateTheme(theme) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Update local state
        this.theme = theme;
        
        // Store in localStorage for persistence
        localStorage.setItem('mcp_theme', theme);
        
        return { success: true };
      } catch (error) {
        console.error('Error updating theme:', error);
        this.error = 'Failed to update theme preference';
        throw error;
      }
    },
    
    // Update avatar
    async updateAvatar(avatarUrl) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local state
        this.avatarUrl = avatarUrl;
        
        // Store in localStorage for persistence
        localStorage.setItem('mcp_avatar', avatarUrl);
        
        return { success: true };
      } catch (error) {
        console.error('Error updating avatar:', error);
        this.error = 'Failed to update avatar';
        throw error;
      }
    },
    
    // Update banner
    async updateBanner(bannerUrl) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local state
        this.bannerUrl = bannerUrl;
        
        // Store in localStorage for persistence
        localStorage.setItem('mcp_banner', bannerUrl);
        
        return { success: true };
      } catch (error) {
        console.error('Error updating banner:', error);
        this.error = 'Failed to update banner';
        throw error;
      }
    },
    
    // Remove banner
    async removeBanner() {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update local state
        this.bannerUrl = '';
        
        // Remove from localStorage
        localStorage.removeItem('mcp_banner');
        
        return { success: true };
      } catch (error) {
        console.error('Error removing banner:', error);
        this.error = 'Failed to remove banner';
        throw error;
      }
    },
    
    // Update password
    async updatePassword(currentPassword, newPassword) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock validation - in a real implementation, this would be done server-side
        if (currentPassword === 'password') {
          return { success: true };
        } else {
          throw new Error('Current password is incorrect');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        this.error = error.message || 'Failed to update password';
        throw error;
      }
    }
  }
});
