<template>
  <div class="profile-card-dashboard">
    <v-container>
      <!-- Simple Profile Header -->
      <v-card class="mb-4">
        <v-card-title class="text-h5">Profile Settings</v-card-title>
        <v-card-subtitle>Manage your account information</v-card-subtitle>
      </v-card>
      
      <!-- Status messages -->
      <v-alert v-if="message" :type="messageType" class="mb-4" closable>
        {{ message }}
      </v-alert>
      
      <!-- Simple Form -->
      <form @submit.prevent="simpleSubmit">
        <v-row>
          <!-- User Info -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="profileData.name"
              label="Full Name"
              variant="outlined"
            ></v-text-field>
            
            <v-text-field
              v-model="profileData.email"
              label="Email"
              variant="outlined"
              readonly
            ></v-text-field>
            
            <v-select
              v-model="profileData.theme"
              label="Theme"
              :items="[
                { title: 'Light', value: 'light' },
                { title: 'Dark', value: 'dark' },
                { title: 'System', value: 'system' }
              ]"
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row>
        
        <div class="d-flex justify-end mt-4">
          <button type="submit" class="simple-button">
            Save Changes
          </button>
        </div>
      </form>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ProfileSettings',
  
  data() {
    return {
      profileData: {
        name: 'User Name',
        email: 'user@example.com',
        theme: 'system'
      },
      message: '',
      messageType: 'info'
    }
  },
  
  mounted() {
    // Simple load profile
    setTimeout(() => {
      this.profileData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        theme: 'light'
      }
    }, 500)
  },
  
  methods: {
    simpleSubmit() {
      // Simple submit without complex logic
      this.message = 'Profile updated successfully'
      this.messageType = 'success'
      
      // Clear message after 3 seconds
      setTimeout(() => {
        this.message = ''
      }, 3000)
    }
  }
}
</script>

<style scoped>
.simple-button {
  background-color: #1976d2;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.simple-button:hover {
  background-color: #1565c0;
}
</style>
