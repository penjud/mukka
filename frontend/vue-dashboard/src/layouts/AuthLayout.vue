<template>
  <v-app>
    <v-main class="auth-layout d-flex align-center justify-center">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="mx-auto pa-4 auth-card" elevation="8">
              <v-card-title class="text-center py-4">
                <div class="d-flex flex-column align-center">
                  <v-avatar size="80" color="primary" class="mb-4">
                    <v-icon size="48" color="white">mdi-shield-account</v-icon>
                  </v-avatar>
                  <h2 class="text-h4 font-weight-bold primary--text">MCP Dashboard</h2>
                </div>
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text>
                <!-- Router view for auth pages -->
                <router-view></router-view>
              </v-card-text>
              
              <v-card-actions class="d-flex justify-center mt-4">
                <div class="text-caption text-center text-medium-emphasis">
                  <v-icon small color="info">mdi-information-outline</v-icon>
                  Mothership Command Platform &copy; {{ new Date().getFullYear() }}
                </div>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    
    <!-- Simple footer -->
    <v-footer app class="pa-0">
      <SimpleFooter />
    </v-footer>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { startDiscovery } from '../services/discovery';
import SimpleFooter from '../components/SimpleFooter.vue';

// Start service discovery when component mounts
onMounted(() => {
  startDiscovery();
});
</script>

<style scoped>
.auth-layout {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  min-height: 100vh;
}

.auth-card {
  border-radius: 12px;
  overflow: hidden;
}
</style>
