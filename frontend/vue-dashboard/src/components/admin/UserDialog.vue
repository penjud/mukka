<template>
  <v-dialog v-model="showDialog" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditing ? 'Edit User' : 'Add User' }}</span>
      </v-card-title>
      
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="userData.username"
                label="Username*"
                :disabled="isEditing"
                :rules="[rules.required]"
                variant="outlined"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="userData.email"
                label="Email*"
                :rules="[rules.required, rules.email]"
                variant="outlined"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6" v-if="!isEditing">
              <v-text-field
                v-model="userData.password"
                label="Password*"
                :rules="[rules.required, rules.minLength]"
                variant="outlined"
                type="password"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6" v-if="!isEditing">
              <v-text-field
                v-model="userData.confirmPassword"
                label="Confirm Password*"
                :rules="[rules.required, rules.passwordMatch]"
                variant="outlined"
                type="password"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-select
                v-model="userData.role"
                label="Role*"
                :items="roleOptions"
                :rules="[rules.required]"
                variant="outlined"
                item-title="text"
                item-value="value"
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-select
                v-model="userData.status"
                label="Status*"
                :items="statusOptions"
                :rules="[rules.required]"
                variant="outlined"
                item-title="text"
                item-value="value"
              ></v-select>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveUser" :loading="loading" :disabled="!valid">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';

const props = defineProps({
  show: Boolean,
  user: {
    type: Object,
    default: () => ({})
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:show', 'save', 'cancel']);

const form = ref(null);
const valid = ref(false);
const showDialog = ref(props.show);

// Watch for changes to the show prop
watch(() => props.show, (newValue) => {
  showDialog.value = newValue;
});

// Watch for changes to the showDialog value to emit events
watch(showDialog, (newValue) => {
  emit('update:show', newValue);
});

const userData = reactive({
  id: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  status: 'active'
});

// Watch for changes to the user prop
watch(() => props.user, (newUser) => {
  if (newUser && Object.keys(newUser).length > 0) {
    // Copy user data to the form
    userData.id = newUser.id || '';
    userData.username = newUser.username || '';
    userData.email = newUser.email || '';
    userData.role = newUser.role || 'user';
    userData.status = newUser.status || 'active';
    // Don't copy password fields when editing
  }
}, { immediate: true });

// Form validation rules
const rules = {
  required: v => !!v || 'This field is required',
  email: v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid',
  minLength: v => (v && v.length >= 8) || 'Password must be at least 8 characters',
  passwordMatch: v => v === userData.password || 'Passwords do not match'
};

// Role options
const roleOptions = [
  { text: 'User', value: 'user' },
  { text: 'Admin', value: 'admin' }
];

// Status options
const statusOptions = [
  { text: 'Active', value: 'active' },
  { text: 'Inactive', value: 'inactive' }
];

// Computed property for the form title
const formTitle = computed(() => props.isEditing ? 'Edit User' : 'Add User');

// Close the dialog
function closeDialog() {
  showDialog.value = false;
  emit('cancel');
}

// Save the user
function saveUser() {
  if (form.value.validate()) {
    // Clone the userData object to avoid reactivity issues
    const userToSave = { ...userData };
    
    // Remove confirmPassword before sending to API
    delete userToSave.confirmPassword;
    
    // If editing and password is empty, remove it
    if (props.isEditing && !userToSave.password) {
      delete userToSave.password;
    }
    
    emit('save', userToSave);
  }
}
</script>
