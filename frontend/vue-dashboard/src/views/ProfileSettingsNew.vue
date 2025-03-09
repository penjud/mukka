<template>
  <div class="profile-dashboard">
    <v-container fluid>
      <!-- Welcome Header -->
      <div class="welcome-header text-center py-8">
        <v-avatar size="120" class="mb-4">
          <v-img v-if="userAvatar" :src="userAvatar" cover></v-img>
          <span v-else class="text-h2">{{ userInitials }}</span>
        </v-avatar>
        <h1 class="text-h4 font-weight-bold">Welcome, {{ userFirstName }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Manage your profile with these quick actions
        </p>
      </div>

      <!-- Success Message -->
      <v-snackbar
        v-model="showSuccess"
        color="success"
        timeout="3000"
        location="top"
      >
        {{ successMessage }}
      </v-snackbar>

      <!-- Main Content: Action Cards -->
      <v-row>
        <!-- Avatar Card -->
        <v-col cols="12" sm="6" lg="3">
          <v-card height="100%" class="action-card" @click="dialogs.avatar = true">
            <v-card-item>
              <v-icon size="48" color="primary" class="mb-4">mdi-account-circle</v-icon>
              <v-card-title>Update Photo</v-card-title>
              <v-card-subtitle>Change your profile picture</v-card-subtitle>
            </v-card-item>
          </v-card>
        </v-col>

        <!-- Display Name Card -->
        <v-col cols="12" sm="6" lg="3">
          <v-card height="100%" class="action-card" @click="dialogs.displayName = true">
            <v-card-item>
              <v-icon size="48" color="primary" class="mb-4">mdi-card-account-details</v-icon>
              <v-card-title>Display Name</v-card-title>
              <v-card-subtitle>How others see you</v-card-subtitle>
            </v-card-item>
          </v-card>
        </v-col>

        <!-- Theme Card -->
        <v-col cols="12" sm="6" lg="3">
          <v-card height="100%" class="action-card" @click="dialogs.theme = true">
            <v-card-item>
              <v-icon size="48" color="primary" class="mb-4">mdi-theme-light-dark</v-icon>
              <v-card-title>Theme</v-card-title>
              <v-card-subtitle>Light, dark, or system default</v-card-subtitle>
            </v-card-item>
          </v-card>
        </v-col>

        <!-- Password Card -->
        <v-col cols="12" sm="6" lg="3">
          <v-card height="100%" class="action-card" @click="dialogs.password = true">
            <v-card-item>
              <v-icon size="48" color="primary" class="mb-4">mdi-key</v-icon>
              <v-card-title>Password</v-card-title>
              <v-card-subtitle>Change your password</v-card-subtitle>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <!-- Account Details Section -->
      <v-sheet class="mt-8 pa-4 rounded" color="surface">
        <h2 class="text-h5 mb-4">Account Details</h2>
        <v-list>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary">mdi-email</v-icon>
            </template>
            <v-list-item-title>Email</v-list-item-title>
            <v-list-item-subtitle>{{ userData.email }}</v-list-item-subtitle>
          </v-list-item>
          
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary">mdi-account</v-icon>
            </template>
            <v-list-item-title>Username</v-list-item-title>
            <v-list-item-subtitle>{{ userData.username }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary">mdi-account-check</v-icon>
            </template>
            <v-list-item-title>Account Type</v-list-item-title>
            <v-list-item-subtitle>{{ userData.role }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary">mdi-calendar</v-icon>
            </template>
            <v-list-item-title>Member Since</v-list-item-title>
            <v-list-item-subtitle>{{ formattedDate }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-sheet>

      <!-- Session Information -->
      <v-sheet class="mt-8 pa-4 rounded" color="surface">
        <div class="d-flex align-center mb-4">
          <h2 class="text-h5 mr-auto">Active Sessions</h2>
          <v-btn color="error" variant="outlined" small @click="logoutAllSessions">
            Sign Out All Devices
          </v-btn>
        </div>
        
        <v-table>
          <thead>
            <tr>
              <th>Device</th>
              <th>Location</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-2">mdi-laptop</v-icon>
                  Current Device
                </div>
              </td>
              <td>New York, USA</td>
              <td>Just now</td>
              <td>
                <v-btn color="primary" variant="text" small>
                  This Device
                </v-btn>
              </td>
            </tr>
            <tr>
              <td>
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-2">mdi-cellphone</v-icon>
                  Mobile Device
                </div>
              </td>
              <td>New York, USA</td>
              <td>2 days ago</td>
              <td>
                <v-btn color="error" variant="text" small @click="logoutSession(2)">
                  Sign Out
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-sheet>
    </v-container>

    <!-- DIALOGS -->
    
    <!-- Avatar Dialog -->
    <v-dialog v-model="dialogs.avatar" max-width="500">
      <v-card>
        <v-card-title>Update Profile Picture</v-card-title>
        <v-card-text>
          <div class="text-center my-4">
            <v-avatar size="150" class="mb-4">
              <v-img v-if="previewAvatar" :src="previewAvatar" cover></v-img>
              <v-img v-else-if="userAvatar" :src="userAvatar" cover></v-img>
              <span v-else class="text-h2">{{ userInitials }}</span>
            </v-avatar>
            
            <v-file-input
              v-model="avatarFile"
              accept="image/*"
              label="Select an image"
              prepend-icon="mdi-camera"
              @change="previewImage"
            ></v-file-input>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="default" variant="text" @click="cancelAvatar">Cancel</v-btn>
          <v-btn color="primary" @click="saveAvatar" :loading="isUpdating">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Display Name Dialog -->
    <v-dialog v-model="dialogs.displayName" max-width="500">
      <v-card>
        <v-card-title>Update Display Name</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editData.displayName"
            label="Display Name"
            variant="outlined"
            hint="This is how your name will appear to others"
            persistent-hint
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="default" variant="text" @click="dialogs.displayName = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveDisplayName" :loading="isUpdating">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Theme Dialog -->
    <v-dialog v-model="dialogs.theme" max-width="500">
      <v-card>
        <v-card-title>Select Theme</v-card-title>
        <v-card-text>
          <v-radio-group v-model="editData.theme">
            <v-radio
              v-for="(option, index) in themeOptions"
              :key="index"
              :label="option.label"
              :value="option.value"
            ></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="default" variant="text" @click="dialogs.theme = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveTheme" :loading="isUpdating">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Password Dialog -->
    <v-dialog v-model="dialogs.password" max-width="500">
      <v-card>
        <v-card-title>Change Password</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="passwordData.current"
            label="Current Password"
            type="password"
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          
          <v-text-field
            v-model="passwordData.new"
            label="New Password"
            type="password"
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          
          <v-text-field
            v-model="passwordData.confirm"
            label="Confirm New Password"
            type="password"
            variant="outlined"
            :error-messages="passwordMatch ? '' : 'Passwords do not match'"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="default" variant="text" @click="resetPasswordForm">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="savePassword" 
            :loading="isUpdating"
            :disabled="!canSavePassword"
          >
            Update Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useThemeManager } from '../composables/useTheme';

export default defineComponent({
  name: 'ProfileSettings',
  
  setup() {
    const { setTheme } = useThemeManager();
    return { themeManager: { setTheme } };
  },
  
  data() {
    return {
      // User data
      userData: {
        displayName: 'Alex Johnson',
        username: 'alex.johnson',
        email: 'alex.johnson@example.com',
        role: 'Administrator',
        createdAt: '2023-05-15T14:30:00.000Z',
        avatarUrl: '',
        theme: 'system'
      },
      
      // Edit data (for dialogs)
      editData: {
        displayName: '',
        theme: 'system'
      },
      
      // Password form
      passwordData: {
        current: '',
        new: '',
        confirm: ''
      },
      
      // UI State
      isUpdating: false,
      avatarFile: null,
      previewAvatar: null,
      showSuccess: false,
      successMessage: '',
      
      // Dialog visibility
      dialogs: {
        avatar: false,
        displayName: false,
        theme: false,
        password: false,
      },
      
      // Theme options
      themeOptions: [
        { label: 'Light Theme', value: 'light' },
        { label: 'Dark Theme', value: 'dark' },
        { label: 'Use System Settings', value: 'system' },
        { label: 'Midnight Nebula', value: 'midnight-nebula' },
        { label: 'Eco-Tech', value: 'eco-tech' },
        { label: 'Corporate Clarity', value: 'corporate-clarity' }
      ]
    };
  },
  
  computed: {
    // User display utilities
    userFirstName() {
      return this.userData.displayName?.split(' ')[0] || 'User';
    },
    
    userInitials() {
      if (!this.userData.displayName) return '?';
      return this.userData.displayName
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    },
    
    userAvatar() {
      return this.userData.avatarUrl || '';
    },
    
    formattedDate() {
      if (!this.userData.createdAt) return 'Unknown';
      return new Date(this.userData.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    // Form validation
    passwordMatch() {
      return !this.passwordData.confirm || 
             this.passwordData.new === this.passwordData.confirm;
    },
    
    canSavePassword() {
      return this.passwordData.current && 
             this.passwordData.new && 
             this.passwordData.confirm &&
             this.passwordMatch;
    }
  },
  
  watch: {
    // Initialize edit fields when dialogs open
    'dialogs.displayName'(val) {
      if (val) {
        this.editData.displayName = this.userData.displayName;
      }
    },
    
    'dialogs.theme'(val) {
      if (val) {
        this.editData.theme = this.userData.theme;
      }
    }
  },
  
  methods: {
    // Avatar methods
    previewImage() {
      if (!this.avatarFile) {
        this.previewAvatar = null;
        return;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(this.avatarFile);
      reader.onload = e => {
        this.previewAvatar = e.target.result;
      };
    },
    
    cancelAvatar() {
      this.avatarFile = null;
      this.previewAvatar = null;
      this.dialogs.avatar = false;
    },
    
    async saveAvatar() {
      if (!this.avatarFile) {
        this.dialogs.avatar = false;
        return;
      }
      
      this.isUpdating = true;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data with preview avatar
      this.userData.avatarUrl = this.previewAvatar;
      
      // Reset and close dialog
      this.avatarFile = null;
      this.previewAvatar = null;
      this.isUpdating = false;
      this.dialogs.avatar = false;
      
      // Show success message
      this.showSuccessMessage('Profile picture updated successfully');
    },
    
    // Display Name methods
    async saveDisplayName() {
      if (!this.editData.displayName) return;
      
      this.isUpdating = true;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update user data
      this.userData.displayName = this.editData.displayName;
      
      // Reset and close dialog
      this.isUpdating = false;
      this.dialogs.displayName = false;
      
      // Show success message
      this.showSuccessMessage('Display name updated successfully');
    },
    
    // Theme methods
    async saveTheme() {
      this.isUpdating = true;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Update user data
      this.userData.theme = this.editData.theme;
      
      // Apply theme using the theme manager
      this.themeManager.setTheme(this.editData.theme);
      
      // Store in localStorage for persistence (the theme manager also does this, but for consistency)
      localStorage.setItem('mcp_theme', this.editData.theme);
      
      // Reset and close dialog
      this.isUpdating = false;
      this.dialogs.theme = false;
      
      // Show success message
      this.showSuccessMessage('Theme preference updated successfully');
    },
    
    // Password methods
    resetPasswordForm() {
      this.passwordData = {
        current: '',
        new: '',
        confirm: ''
      };
      this.dialogs.password = false;
    },
    
    async savePassword() {
      if (!this.canSavePassword) return;
      
      this.isUpdating = true;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Reset password form
      this.resetPasswordForm();
      this.isUpdating = false;
      
      // Show success message
      this.showSuccessMessage('Password updated successfully');
    },
    
    // Session management
    logoutSession(sessionId) {
      console.log(`Logging out session ${sessionId}`);
      this.showSuccessMessage('Device signed out successfully');
    },
    
    logoutAllSessions() {
      console.log('Logging out all sessions');
      this.showSuccessMessage('Signed out from all devices');
    },
    
    // UI Helpers
    showSuccessMessage(message) {
      this.successMessage = message;
      this.showSuccess = true;
    }
  }
});
</script>

<style scoped>
.profile-dashboard {
  margin-bottom: 40px;
}

.welcome-header {
  background-color: rgb(var(--v-theme-surface-variant));
  border-radius: 12px;
  margin-bottom: 24px;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
}
</style>
