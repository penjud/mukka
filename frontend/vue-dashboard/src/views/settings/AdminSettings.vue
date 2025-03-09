<template>
  <div class="admin-settings">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 font-weight-bold">
            <v-icon start color="error" class="me-2">mdi-shield-account</v-icon>
            Admin Settings
          </v-card-title>
          
          <v-card-subtitle class="text-body-1">
            System administration panel - Manage users, system settings, and monitor services
          </v-card-subtitle>
          
          <v-tabs v-model="activeTab" bg-color="primary">
            <v-tab value="users">
              <v-icon start>mdi-account-multiple</v-icon>
              Users
            </v-tab>
            <v-tab value="system">
              <v-icon start>mdi-cog</v-icon>
              System Config
            </v-tab>
            <v-tab value="agents">
              <v-icon start>mdi-robot</v-icon>
              Agent Templates
            </v-tab>
            <v-tab value="monitoring">
              <v-icon start>mdi-monitor-dashboard</v-icon>
              Monitoring
            </v-tab>
          </v-tabs>
          
          <v-card-text>
            <v-window v-model="activeTab">
              <!-- User Management Tab -->
              <v-window-item value="users">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6">User Management</h3>
                  
                  <v-btn color="success" prepend-icon="mdi-account-plus">
                    Add User
                  </v-btn>
                </div>
                
                <v-table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>admin</td>
                      <td>admin@example.com</td>
                      <td>
                        <v-chip color="error" size="small">Admin</v-chip>
                      </td>
                      <td>
                        <v-chip color="success" size="small">Active</v-chip>
                      </td>
                      <td>
                        <v-btn icon size="small" color="info">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon size="small" color="error" class="ml-2">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                    <tr>
                      <td>user1</td>
                      <td>user1@example.com</td>
                      <td>
                        <v-chip color="primary" size="small">User</v-chip>
                      </td>
                      <td>
                        <v-chip color="success" size="small">Active</v-chip>
                      </td>
                      <td>
                        <v-btn icon size="small" color="info">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon size="small" color="error" class="ml-2">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-window-item>
              
              <!-- System Config Tab -->
              <v-window-item value="system">
                <h3 class="text-h6 mb-4">System Configuration</h3>
                
                <v-form>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        label="System Name"
                        variant="outlined"
                        value="MukkaAI"
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-select
                        label="Default Model"
                        variant="outlined"
                        :items="['llama3', 'mistral', 'codellama', 'phi-2']"
                        value="llama3"
                      ></v-select>
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-select
                        label="Default UI Theme"
                        variant="outlined"
                        :items="['Light', 'Dark', 'System Default']"
                        value="System Default"
                      ></v-select>
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-select
                        label="Default Language"
                        variant="outlined"
                        :items="['English', 'Spanish', 'French', 'German', 'Chinese']"
                        value="English"
                      ></v-select>
                    </v-col>
                    
                    <v-col cols="12">
                      <v-switch
                        label="Allow User Registration"
                        color="primary"
                        value="true"
                      ></v-switch>
                    </v-col>
                    
                    <v-col cols="12">
                      <v-switch
                        label="Enable Auto Tool Triggering"
                        color="primary"
                        value="true"
                      ></v-switch>
                    </v-col>
                    
                    <v-col cols="12">
                      <v-textarea
                        label="Welcome Message"
                        variant="outlined"
                        value="Welcome to MukkaAI!"
                      ></v-textarea>
                    </v-col>
                    
                    <v-col cols="12" class="d-flex justify-end">
                      <v-btn color="primary">
                        Save System Settings
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-window-item>
              
              <!-- Agent Templates Tab -->
              <v-window-item value="agents">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6">Agent Templates</h3>
                  
                  <v-btn color="success" prepend-icon="mdi-robot">
                    Create Template
                  </v-btn>
                </div>
                
                <v-row>
                  <v-col cols="12" md="4" v-for="i in 3" :key="i">
                    <v-card variant="outlined">
                      <v-card-item>
                        <template v-slot:prepend>
                          <v-avatar color="primary">
                            <v-icon color="white">mdi-robot</v-icon>
                          </v-avatar>
                        </template>
                        <v-card-title>Assistant Template {{i}}</v-card-title>
                      </v-card-item>
                      
                      <v-card-text>
                        <p class="mb-2">General purpose AI assistant with helpful personality traits.</p>
                        <v-chip-group>
                          <v-chip size="small">Helpful</v-chip>
                          <v-chip size="small">Friendly</v-chip>
                          <v-chip size="small">Professional</v-chip>
                        </v-chip-group>
                      </v-card-text>
                      
                      <v-card-actions>
                        <v-btn variant="text" color="primary">
                          Edit
                        </v-btn>
                        <v-btn variant="text" color="error">
                          Delete
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-window-item>
              
              <!-- Monitoring Tab -->
              <v-window-item value="monitoring">
                <h3 class="text-h6 mb-4">System Monitoring</h3>
                
                <v-row>
                  <v-col cols="12" md="6" lg="3">
                    <v-card class="pa-4 text-center">
                      <h4 class="text-h4 font-weight-bold">24</h4>
                      <p class="text-body-1">Active Users</p>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" md="6" lg="3">
                    <v-card class="pa-4 text-center">
                      <h4 class="text-h4 font-weight-bold">143</h4>
                      <p class="text-body-1">Today's Conversations</p>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" md="6" lg="3">
                    <v-card class="pa-4 text-center">
                      <h4 class="text-h4 font-weight-bold">87%</h4>
                      <p class="text-body-1">Server Uptime</p>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" md="6" lg="3">
                    <v-card class="pa-4 text-center">
                      <h4 class="text-h4 font-weight-bold">32</h4>
                      <p class="text-body-1">Custom Agents Created</p>
                    </v-card>
                  </v-col>
                </v-row>
                
                <v-card class="mt-6">
                  <v-card-title>Service Health</v-card-title>
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
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { serviceStore } from '../../services/discovery';

// Tabs
const activeTab = ref('users');

// Service data
const services = computed(() => serviceStore.services);
</script>
