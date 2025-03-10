<template>
  <!-- Toast Component using Vuetify snackbars -->
  <div class="toast-container">
    <v-snackbar
      v-for="toast in toasts"
      :key="toast.id"
      v-model="toast.show"
      :color="toast.color"
      :timeout="toast.timeout"
      :location="location"
      class="mb-2"
    >
      {{ toast.text }}
      
      <template v-slot:actions>
        <v-btn 
          variant="text" 
          icon="mdi-close" 
          @click="removeToast(toast.id)"
        ></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import toastService from '../../services/toast';

// Component props
const props = defineProps({
  location: {
    type: String,
    default: 'top'
  }
});

// Get toasts from service
const toasts = computed(() => toastService.toasts.value);

// Local version of removeToast function from service
function removeToast(id) {
  toastService.removeToast(id);
}

// Watch toasts to add show property for v-model
watch(toasts, (newToasts) => {
  newToasts.forEach(toast => {
    if (!toast.hasOwnProperty('show')) {
      toast.show = true;
    }
  });
}, { deep: true, immediate: true });
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.toast-container .v-snackbar {
  pointer-events: auto;
}
</style>
