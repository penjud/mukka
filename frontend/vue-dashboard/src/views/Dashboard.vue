<template>
  <div class="dashboard">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="text-h5 font-weight-bold">
            Welcome, {{ user.name || user.username || 'User' }}
          </v-card-title>
          <v-card-subtitle>
            MCP Dashboard - Your Personal Command Center
          </v-card-subtitle>
          <v-card-text>
            <p>Select an option below to get started with your MCP experience.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row>
      <!-- Workspace Card -->
      <v-col cols="12" md="4">
        <v-card height="200" class="d-flex flex-column" @click="$router.push({name: 'PersonalWorkspace'})">
          <v-card-title class="text-h6">
            <v-icon start color="primary" class="me-2">mdi-account-group</v-icon>
            Personal Workspace
          </v-card-title>
          <v-card-text>
            Access your personal workspace to chat with AI agents and manage your conversations.
          </v-card-text>
          <v-card-actions class="mt-auto">
            <v-btn color="primary" variant="text">
              Open Workspace
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <!-- Agent Management Card -->
      <v-col cols="12" md="4">
        <v-card height="200" class="d-flex flex-column" @click="$router.push({name: 'AgentManagement'})">
          <v-card-title class="text-h6">
            <v-icon start color="info" class="me-2">mdi-robot</v-icon>
            Agent Management
          </v-card-title>
          <v-card-text>
            Create and customize AI agents with different personalities and capabilities.
          </v-card-text>
          <v-card-actions class="mt-auto">
            <v-btn color="info" variant="text">
              Manage Agents
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <!-- Profile Settings Card -->
      <v-col cols="12" md="4">
        <v-card height="200" class="d-flex flex-column" @click="$router.push({name: 'ProfileSettings'})">
          <v-card-title class="text-h6">
            <v-icon start color="success" class="me-2">mdi-account-cog</v-icon>
            Profile Settings
          </v-card-title>
          <v-card-text>
            Customize your user profile and application preferences.
          </v-card-text>
          <v-card-actions class="mt-auto">
            <v-btn color="success" variant="text">
              Edit Profile
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- System Status -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6">
            <v-icon start color="primary" class="me-2">mdi-server</v-icon>
            System Status
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="(service, key) in services" :key="key" cols="12" sm="6" md="4" lg="3">
                <v-card variant="outlined" class="service-card">
                  <v-card-item>
                    <template v-slot:prepend>
                      <v-icon :color="service.status ? 'success' : 'error'" :icon="service.icon"></v-icon>
                    </template>
                    <v-card-title>{{ service.name }}</v-card-title>
                    <v-card-subtitle>
                      <v-chip
                        :color="service.status ? 'success' : 'error'"
                        size="small"
                        class="mt-1"
                      >
                        {{ service.status ? 'Online' : 'Offline' }}
                      </v-chip>
                    </v-card-subtitle>
                  </v-card-item>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { serviceStore } from '../services/discovery';

const authStore = useAuthStore();

// Computed properties
const user = computed(() => authStore.userProfile || {});
const services = computed(() => serviceStore.services);
</script>

<style scoped>
.service-card {
  transition: transform 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
}
</style>
