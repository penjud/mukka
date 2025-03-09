<template>
  <div class="password-strength">
    <div class="strength-meter my-2">
      <v-progress-linear
        :value="strengthScore * 25"
        :color="strengthColor"
        height="8"
        rounded
      ></v-progress-linear>
    </div>
    <div class="strength-text text-caption" :class="strengthTextClass">
      {{ strengthText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  password: {
    type: String,
    required: true
  }
});

// Calculate password strength on a scale of 0-4
const strengthScore = computed(() => {
  const { password } = props;
  
  if (!password) return 0;
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1; // Has uppercase
  if (/[a-z]/.test(password)) score += 1; // Has lowercase
  if (/[0-9]/.test(password)) score += 1; // Has number
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
  
  // Cap at 4
  return Math.min(4, score);
});

// Color based on strength
const strengthColor = computed(() => {
  switch (strengthScore.value) {
    case 0: return 'grey';
    case 1: return 'red';
    case 2: return 'orange';
    case 3: return 'yellow-darken-2';
    case 4: return 'green';
    default: return 'grey';
  }
});

// Text description of strength
const strengthText = computed(() => {
  switch (strengthScore.value) {
    case 0: return 'Enter a password';
    case 1: return 'Very weak';
    case 2: return 'Weak';
    case 3: return 'Medium';
    case 4: return 'Strong';
    default: return '';
  }
});

// Text class based on strength
const strengthTextClass = computed(() => {
  switch (strengthScore.value) {
    case 0: return 'text-medium-emphasis';
    case 1: return 'text-error';
    case 2: return 'text-warning';
    case 3: return 'text-yellow-darken-2';
    case 4: return 'text-success';
    default: return '';
  }
});
</script>