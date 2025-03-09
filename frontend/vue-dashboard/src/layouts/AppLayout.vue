<template>
  <v-app>
    <!-- App header -->
    <v-app-bar app color="primary" dark elevation="4">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-toolbar-title class="text-h5 font-weight-bold">
        MukkaAI Dashboard
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <!-- User menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="secondary" size="36">
              <v-img 
                v-if="userProfileStore.avatarUrl" 
                :src="userProfileStore.avatarUrl" 
                alt="User Avatar" 
              />
              <v-icon v-else color="white">mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="{ name: 'ProfileSettings' }">
            <v-list-item-title>
              <v-icon start>mdi-account-cog</v-icon> 
              Profile
            </v-list-item-title>
          </v-list-item>
          
          <v-divider></v-divider>
          
          <v-list-item @click="logout">
            <v-list-item-title>
              <v-icon start>mdi-logout</v-icon> 
              Logout
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    
    <!-- Navigation drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      temporary
      :width="280"
    >
      <v-list-item class="pa-4">
        <template v-slot:prepend>
          <v-avatar color="secondary" size="40">
            <v-img 
              v-if="userProfileStore.avatarUrl" 
              :src="userProfileStore.avatarUrl" 
              alt="User Avatar" 
            />
            <v-icon v-else color="white">mdi-account</v-icon>
          </v-avatar>
        </template>
        
        <v-list-item-title class="text-h6">{{ user.name || user.username }}</v-list-item-title>
        <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
      </v-list-item>
      
      <v-divider></v-divider>
      
      <!-- Main navigation -->
      <v-list nav>
        <v-list-item :to="{ name: 'Dashboard' }" :active="$route.name === 'Dashboard'">
          <template v-slot:prepend>
            <v-icon>mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
        
        <v-list-item :to="{ name: 'PersonalWorkspace' }" :active="$route.name === 'PersonalWorkspace'">
          <template v-slot:prepend>
            <v-icon>mdi-account-group</v-icon>
          </template>
          <v-list-item-title>Personal Workspace</v-list-item-title>
        </v-list-item>
        
        <v-list-item :to="{ name: 'AgentManagement' }" :active="$route.name === 'AgentManagement'">
          <template v-slot:prepend>
            <v-icon>mdi-robot</v-icon>
          </template>
          <v-list-item-title>Agent Management</v-list-item-title>
        </v-list-item>
        
        <v-divider class="my-2"></v-divider>
        
        <v-list-item :to="{ name: 'ProfileSettings' }" :active="$route.name === 'ProfileSettings'">
          <template v-slot:prepend>
            <v-icon>mdi-account-cog</v-icon>
          </template>
          <v-list-item-title>Profile Settings</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          v-if="isAdmin" 
          :to="{ name: 'AdminSettings' }" 
          :active="$route.name === 'AdminSettings'"
        >
          <template v-slot:prepend>
            <v-icon>mdi-shield-account</v-icon>
          </template>
          <v-list-item-title>Admin Settings</v-list-item-title>
        </v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="error" @click="logout">
            <v-icon start>mdi-logout</v-icon>
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    
    <!-- Main content area -->
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
    
    <!-- Session expiration warning -->
    <SessionWarning />
    
    <!-- Simple footer -->
    <v-footer app class="pa-0">
      <SimpleFooter />
    </v-footer>
    
    <!-- Logout Confirmation Dialog -->
    <v-dialog v-model="logoutDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Confirm Logout</v-card-title>
        <v-card-text>
          Are you sure you want to log out? Your session will be terminated.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="cancelLogout">Cancel</v-btn>
          <v-btn color="error" @click="confirmLogout">Log Out</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUserProfileStore } from '../stores/userProfile';
import { startDiscovery } from '../services/discovery';
import SimpleFooter from '../components/SimpleFooter.vue';
import SessionWarning from '../components/SessionWarning.vue';

// Component state
const drawer = ref(false);
const logoutDialog = ref(false);
const authStore = useAuthStore();
const userProfileStore = useUserProfileStore();
const router = useRouter();

// Computed properties
const user = computed(() => authStore.userProfile || {});
const isAdmin = computed(() => authStore.isAdmin);

// Initialize auth store and start service discovery
onMounted(async () => {
  await authStore.init();
  await userProfileStore.init();
  startDiscovery();
});

// Logout function
function logout() {
  logoutDialog.value = true;
}

// Confirm logout
function confirmLogout() {
  router.push({ name: 'Logout' });
  logoutDialog.value = false;
}

// Cancel logout
function cancelLogout() {
  logoutDialog.value = false;
}
</script>
