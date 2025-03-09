<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import { useThemeManager } from './composables/useTheme';

const authStore = useAuthStore();
const router = useRouter();
const { setTheme } = useThemeManager();

onMounted(async () => {
  // Initialize auth store
  await authStore.init();

  // Initialize theme
  const storedTheme = localStorage.getItem('mcp_theme');
  if (storedTheme) {
    setTheme(storedTheme);
  }
});
</script>

<style>
/* Global styles */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
