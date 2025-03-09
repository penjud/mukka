<template>
  <v-dialog v-model="showDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h5">
        {{ title }}
      </v-card-title>
      
      <v-card-text>
        {{ message }}
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn color="error" @click="confirm" :loading="loading">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed with this action?'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:show', 'confirm', 'cancel']);

const showDialog = ref(props.show);

// Watch for changes to the show prop
watch(() => props.show, (newValue) => {
  showDialog.value = newValue;
});

// Watch for changes to the showDialog value to emit events
watch(showDialog, (newValue) => {
  emit('update:show', newValue);
});

// Close the dialog
function closeDialog() {
  showDialog.value = false;
  emit('cancel');
}

// Confirm the action
function confirm() {
  emit('confirm');
}
</script>
