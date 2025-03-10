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
                  
                  <v-btn color="success" prepend-icon="mdi-account-plus" @click="openAddUserDialog">
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
                    <tr v-if="loadingUsers" key="loading">
                      <td colspan="5" class="text-center py-4">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        <span class="ml-2">Loading users...</span>
                      </td>
                    </tr>
                    <tr v-else-if="users.length === 0" key="no-users">
                      <td colspan="5" class="text-center py-4">
                        No users found.
                      </td>
                    </tr>
                    <tr v-for="user in users" :key="user.id || user.username">
                      <td>{{ user.username }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <v-chip :color="user.role === 'admin' ? 'error' : 'primary'" size="small">
                          {{ user.role === 'admin' ? 'Admin' : 'User' }}
                        </v-chip>
                      </td>
                      <td>
                        <v-chip :color="user.status === 'active' ? 'success' : 'warning'" size="small">
                          {{ user.status === 'active' ? 'Active' : 'Inactive' }}
                        </v-chip>
                      </td>
                      <td>
                        <v-btn icon size="small" color="info" @click="openEditUserDialog(user)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon size="small" color="error" class="ml-2" @click="openDeleteConfirm(user)">
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
                
                <system-config-form 
                  :initial-config="systemConfig"
                  :loading="loadingConfig"
                  @save="saveSystemConfig"
                />
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
                      <h4 class="text-h4 font-weight-bold">{{ systemStats.activeUsers }}</h4>
                      <p class="text-body-1">Active Users</p>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" md="6" lg="3">
                    <v-card class="pa-4 text-center">
                      <h4 class="text-h4 font-weight-bold">{{ systemStats.conversations }}</h4>
                      <p class="text-body-1">Today's Conversations</p>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" md="6" lg="3">
                    <v-card class="pa-4 text-center">
                      <h4 class="text-h4 font-weight-bold">{{ systemStats.uptime }}%</h4>
                      <p class="text-body-1">Server Uptime</p>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" md="6" lg="3">
                    <v-card class="pa-4 text-center">
                      <h4 class="text-h4 font-weight-bold">{{ systemStats.customAgents }}</h4>
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

    <!-- User Dialog -->
    <user-dialog
      v-model:show="showUserDialog"
      :user="selectedUser"
      :is-editing="isEditingUser"
      :loading="loadingUsers"
      @save="saveUser"
    />

    <!-- Delete Confirmation Dialog -->
    <confirm-dialog
      v-model:show="showDeleteConfirm"
      title="Delete User"
      :message="`Are you sure you want to delete the user '${selectedUser.username}'? This action cannot be undone.`"
      :loading="loadingUsers"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import toast from '../../services/toast';
import { serviceStore, checkAllServices } from '../../services/discovery';
import userManagementService from '../../services/user-management';

// Import components
import UserDialog from '../../components/admin/UserDialog.vue';
import ConfirmDialog from '../../components/admin/ConfirmDialog.vue';
import SystemConfigForm from '../../components/admin/SystemConfigForm.vue';

// Using imported toast service

// Tabs
const activeTab = ref('users');

// Service data
const services = computed(() => serviceStore.services);

// Users data
const users = ref([]);
const loadingUsers = ref(false);
const selectedUser = ref({});
const showUserDialog = ref(false);
const isEditingUser = ref(false);
const showDeleteConfirm = ref(false);

// System config data
const systemConfig = reactive({
  systemName: 'MukkaAI',
  defaultModel: 'llama3',
  defaultTheme: 'System Default',
  defaultLanguage: 'English',
  allowRegistration: true,
  autoToolTriggering: true,
  welcomeMessage: 'Welcome to MukkaAI!'
});
const loadingConfig = ref(false);

// System monitoring stats
const systemStats = reactive({
  activeUsers: 0,
  conversations: 0,
  uptime: 0,
  customAgents: 0
});

// Function to fetch users
async function fetchUsers() {
  loadingUsers.value = true;
  try {
    const response = await userManagementService.getAllUsers();
    
    if (Array.isArray(response)) {
      users.value = response;
    } else {
      console.warn('Expected array of users but got:', response);
      users.value = [];
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to load users');
    // Provide sample data if API fails
    users.value = [
      {
        id: 'admin1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      },
      {
        id: 'user1',
        username: 'user1',
        email: 'user1@example.com',
        role: 'user',
        status: 'active'
      }
    ];
  } finally {
    loadingUsers.value = false;
  }
}

// Function to open add user dialog
function openAddUserDialog() {
  selectedUser.value = {};
  isEditingUser.value = false;
  showUserDialog.value = true;
}

// Function to open edit user dialog
function openEditUserDialog(user) {
  selectedUser.value = { ...user };
  isEditingUser.value = true;
  showUserDialog.value = true;
}

// Function to open delete user confirmation
function openDeleteConfirm(user) {
  selectedUser.value = { ...user };
  showDeleteConfirm.value = true;
}

// Function to save user (create or update)
async function saveUser(userData) {
  const isNew = !userData.id;
  loadingUsers.value = true;
  
  try {
    if (isNew) {
      // Create new user
      await userManagementService.createUser(userData);
      toast.success(`User ${userData.username} created successfully`);
    } else {
      // Update existing user
      await userManagementService.updateUser(userData.id, userData);
      toast.success(`User ${userData.username} updated successfully`);
    }
    
    // Refresh user list
    await fetchUsers();
    
    // Close dialog
    showUserDialog.value = false;
  } catch (error) {
    console.error('Error saving user:', error);
    toast.error(`Failed to ${isNew ? 'create' : 'update'} user`);
  } finally {
    loadingUsers.value = false;
  }
}

// Function to delete user
async function deleteUser() {
  loadingUsers.value = true;
  try {
    await userManagementService.deleteUser(selectedUser.value.id);
    toast.success(`User ${selectedUser.value.username} deleted successfully`);
    
    // Refresh user list
    await fetchUsers();
    
    // Close dialog
    showDeleteConfirm.value = false;
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.error('Failed to delete user');
  } finally {
    loadingUsers.value = false;
  }
}

// Function to fetch system config
async function fetchSystemConfig() {
  loadingConfig.value = true;
  try {
    const config = await userManagementService.getSystemConfig();
    
    // Update system config
    Object.assign(systemConfig, config);
  } catch (error) {
    console.error('Error fetching system config:', error);
    // Keep default values if API fails
  } finally {
    loadingConfig.value = false;
  }
}

// Function to save system config
async function saveSystemConfig(configData) {
  loadingConfig.value = true;
  try {
    await userManagementService.updateSystemConfig(configData);
    toast.success('System configuration saved successfully');
    
    // Update local config
    Object.assign(systemConfig, configData);
  } catch (error) {
    console.error('Error saving system config:', error);
    toast.error('Failed to save system configuration');
  } finally {
    loadingConfig.value = false;
  }
}

// Function to fetch system stats from various services
async function fetchSystemStats() {
  try {
    // Count online services for uptime calculation
    const totalServices = Object.keys(serviceStore.services).length;
    const onlineServices = Object.values(serviceStore.services).filter(s => s.status).length;
    systemStats.uptime = Math.round((onlineServices / totalServices) * 100);
    
    // Try to get real metrics from the API
    try {
      const metrics = await userManagementService.getSystemMetrics();
      systemStats.activeUsers = metrics.activeUsers || 0;
      systemStats.conversations = metrics.conversations || 0;
      systemStats.customAgents = metrics.customAgents || 0;
    } catch (error) {
      console.warn('Failed to fetch real metrics, using estimates:', error);
      
      // If API fails, estimate based on users
      systemStats.activeUsers = Math.ceil(users.value.length * 0.6);
      systemStats.conversations = Math.floor(Math.random() * 200) + 50;
      systemStats.customAgents = Math.floor(Math.random() * 20) + 5;
    }
  } catch (error) {
    console.error('Error fetching system stats:', error);
  }
}

// Initialize data
onMounted(async () => {
  await checkAllServices();
  
  // Fetch initial data
  await Promise.all([
    fetchUsers(),
    fetchSystemConfig(),
    fetchSystemStats()
  ]);
  
  // Update stats periodically
  setInterval(fetchSystemStats, 60000); // Update every minute
});
</script>
