<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="config.systemName"
          label="System Name"
          variant="outlined"
          hint="The name of your MukkaAI instance"
          persistent-hint
        ></v-text-field>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-select
          v-model="config.defaultModel"
          label="Default Model"
          variant="outlined"
          :items="modelOptions"
          hint="Default AI model for new conversations"
          persistent-hint
          menu-props="auto"
        ></v-select>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-select
          v-model="config.defaultTheme"
          label="Default UI Theme"
          variant="outlined"
          :items="themeOptions"
          hint="Default theme for new users"
          persistent-hint
          menu-props="auto"
        ></v-select>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-select
          v-model="config.defaultLanguage"
          label="Default Language"
          variant="outlined"
          :items="languageOptions"
          hint="Default interface language"
          persistent-hint
          menu-props="auto"
        ></v-select>
      </v-col>
      
      <v-col cols="12">
        <v-divider class="mb-4"></v-divider>
        <h3 class="text-subtitle-1 font-weight-bold mb-4">System Settings</h3>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-switch
          v-model="config.allowRegistration"
          label="Allow User Registration"
          color="primary"
          hint="Enable self-registration for new users"
          persistent-hint
        >
          <template v-slot:append>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" color="primary" size="small">mdi-help-circle-outline</v-icon>
              </template>
              <span>When enabled, new users can create accounts without admin approval</span>
            </v-tooltip>
          </template>
        </v-switch>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-switch
          v-model="config.autoToolTriggering"
          label="Enable Auto Tool Triggering"
          color="primary"
          hint="Automatically detect and trigger appropriate tools in conversations"
          persistent-hint
        >
          <template v-slot:append>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" color="primary" size="small">mdi-help-circle-outline</v-icon>
              </template>
              <span>When enabled, the system will automatically detect when tools should be used during conversations</span>
            </v-tooltip>
          </template>
        </v-switch>
      </v-col>
      
      <v-col cols="12">
        <v-divider class="mb-4"></v-divider>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Welcome Message</h3>
        <p class="text-caption mb-2">This message will be displayed on the dashboard to all users (supports markdown)</p>
      </v-col>
      
      <v-col cols="12">
        <v-textarea
          v-model="config.welcomeMessage"
          variant="outlined"
          rows="4"
          counter
          auto-grow
        ></v-textarea>
      </v-col>
      
      <v-col cols="12" class="d-flex justify-end">
        <v-btn
          color="secondary"
          variant="outlined"
          class="me-2"
          @click="resetForm"
          :disabled="loading"
        >
          Reset
        </v-btn>
        <v-btn 
          color="primary" 
          @click="saveConfig" 
          :loading="loading"
          :disabled="!valid || loading"
        >
          <v-icon start>mdi-content-save</v-icon>
          Save System Settings
        </v-btn>
      </v-col>
    </v-row>
    
    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="4000"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';

const props = defineProps({
  initialConfig: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save']);

const form = ref(null);
const valid = ref(true);
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// Available options for the select fields
const modelOptions = [
  'llama3',
  'mistral',
  'codellama',
  'phi-2',
  'mixtral',
  'openchat',
  'wizard-math',
  'neural-chat'
];

const themeOptions = [
  'System Default',
  'Light',
  'Dark',
  'High Contrast'
];

const languageOptions = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Italian',
  'Portuguese',
  'Russian'
];

// Original configuration to track changes
const originalConfig = reactive({});

// Configuration object to bind to the form
const config = reactive({
  systemName: 'MukkaAI',
  defaultModel: 'llama3',
  defaultTheme: 'System Default',
  defaultLanguage: 'English',
  allowRegistration: true,
  autoToolTriggering: true,
  welcomeMessage: 'Welcome to MukkaAI!'
});

// Watch for changes to initialConfig and update the form
watch(() => props.initialConfig, (newConfig) => {
  if (newConfig && Object.keys(newConfig).length > 0) {
    // Store original values for reset functionality
    Object.assign(originalConfig, newConfig);
    
    // Update the form
    Object.assign(config, {
      ...config, // Keep defaults for missing properties
      ...newConfig
    });
  }
}, { immediate: true, deep: true });

// Reset form to initial values
function resetForm() {
  Object.assign(config, originalConfig);
  form.value?.resetValidation();
  
  // Show notification
  snackbarText.value = 'Form has been reset to original values';
  snackbarColor.value = 'info';
  showSnackbar.value = true;
}

// Save configuration changes
function saveConfig() {
  if (!form.value?.validate()) {
    snackbarText.value = 'Please fix the validation errors before saving';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
    return;
  }
  
  // Show saving feedback
  snackbarText.value = 'Saving system settings...';
  snackbarColor.value = 'info';
  showSnackbar.value = true;
  
  // Clone the config to avoid reactivity issues
  const configToSave = { ...config };
  
  // Emit save event with cloned config
  emit('save', configToSave);
  
  // Update original config for reset functionality
  Object.assign(originalConfig, configToSave);
}

// Initialize and fix any UI issues in mounted hook
onMounted(() => {
  // Force validation to ensure UI is correct
  setTimeout(() => {
    form.value?.validate();
  }, 200);
});
</script>

<style scoped>
/* Fix for dropdown labels */
:deep(.v-select .v-field__input) {
  padding-top: 6px;
}

:deep(.v-field__field) {
  align-items: flex-start;
}

:deep(.v-field__field .v-label) {
  margin-top: 4px;
}

:deep(.v-field__append-inner) {
  padding-top: 6px;
}

:deep(.v-field--active .v-label.v-field-label) {
  transform: translateY(-16px) scale(0.75);
}
</style>
