import { ref, watch, onMounted } from 'vue';
import { useTheme } from 'vuetify';

export function useThemeManager() {
  const vuetifyTheme = useTheme();
  const currentTheme = ref('light');

  // Initialize theme from localStorage or default to light
  onMounted(() => {
    const savedTheme = localStorage.getItem('mcp_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check for system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    }
  });

  // Watch for system theme changes if using system theme
  watch(currentTheme, (newTheme) => {
    if (newTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        vuetifyTheme.global.name.value = e.matches ? 'dark' : 'light';
      };
      
      mediaQuery.addEventListener('change', handleChange);
      // Set initial value
      handleChange(mediaQuery);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  });

  // Set theme function
  const setTheme = (theme) => {
    currentTheme.value = theme;
    localStorage.setItem('mcp_theme', theme);
    
    // Handle system theme differently
    if (theme === 'system') {
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      vuetifyTheme.global.name.value = prefersDark ? 'dark' : 'light';
    } else {
      vuetifyTheme.global.name.value = theme;
    }
  };

  return {
    currentTheme,
    setTheme
  };
}
