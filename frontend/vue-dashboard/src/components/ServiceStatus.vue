<template>
  <div class="service-status-container">
    <h2>MukkaAI Service Status</h2>
    
    <div class="service-grid">
      <div 
        v-for="(service, key) in serviceStore.services" 
        :key="key"
        class="service-card"
        :class="{ 'service-active': service.status, 'service-inactive': !service.status }"
      >
        <div class="service-icon">
          <i :class="service.icon"></i>
        </div>
        <div class="service-details">
          <h3>{{ service.name }}</h3>
          <p class="service-description">{{ service.description }}</p>
          <p class="service-endpoint">{{ service.endpoint }}</p>
          <div class="service-status-indicator">
            <span v-if="service.status" class="status-badge status-online">Online</span>
            <span v-else class="status-badge status-offline">Offline</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="service-actions">
      <button @click="refreshServices" class="refresh-button">
        Refresh Services
      </button>
      <div class="last-check" v-if="serviceStore.lastCheck">
        Last checked: {{ formatTimestamp(serviceStore.lastCheck) }}
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import { serviceStore, startDiscovery, stopDiscovery, checkAllServices } from '../services/discovery';

export default {
  name: 'ServiceStatus',
  
  setup() {
    // Start discovery when component mounts
    onMounted(() => {
      startDiscovery();
    });
    
    // Clean up when component unmounts
    onUnmounted(() => {
      stopDiscovery();
    });
    
    // Method to manually refresh service status
    const refreshServices = async () => {
      await checkAllServices();
    };
    
    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return '';
      return new Date(timestamp).toLocaleString();
    };
    
    return {
      serviceStore,
      refreshServices,
      formatTimestamp
    };
  }
};
</script>

<style scoped>
.service-status-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.service-card {
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.service-active {
  background-color: #f0f9ff;
  border-left: 4px solid #4caf50;
}

.service-inactive {
  background-color: #fff;
  border-left: 4px solid #f44336;
  opacity: 0.8;
}

.service-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.service-details h3 {
  margin: 0;
  font-size: 1.2rem;
}

.service-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.service-endpoint {
  font-family: monospace;
  font-size: 0.8rem;
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.service-status-indicator {
  margin-top: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-online {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-offline {
  background-color: #ffebee;
  color: #c62828;
}

.service-actions {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.refresh-button {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.refresh-button:hover {
  background-color: #1976d2;
}

.last-check {
  font-size: 0.8rem;
  color: #666;
}
</style>
