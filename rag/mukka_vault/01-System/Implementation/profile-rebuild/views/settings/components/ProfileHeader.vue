<template>
  <div class="profile-header">
    <v-row align="center" class="mb-4">
      <v-col cols="12" sm="auto" class="text-center">
        <div class="avatar-container">
          <v-avatar size="100" :color="profile?.avatarUrl ? 'transparent' : 'primary'">
            <v-img v-if="profile?.avatarUrl" :src="profile.avatarUrl" alt="Avatar"></v-img>
            <span v-else class="text-h4 text-white">{{ initials }}</span>
          </v-avatar>
          
          <v-btn
            class="upload-btn"
            size="small"
            color="primary"
            icon
            @click="triggerUpload"
            :loading="isUploading"
            :disabled="isUploading"
          >
            <v-icon>mdi-camera</v-icon>
          </v-btn>
        </div>
        
        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="d-none"
          @change="handleFileUpload"
        />
      </v-col>
      
      <v-col>
        <div class="profile-name text-h5">{{ fullName || 'User Profile' }}</div>
        <div class="profile-details text-subtitle-1 text-medium-emphasis">
          {{ profile?.email || '' }}
        </div>
        <v-chip
          v-if="lastSavedText"
          variant="outlined"
          color="success"
          size="small"
          class="mt-2"
        >
          {{ lastSavedText }}
        </v-chip>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue';
import { useProfileStore } from '../../../stores/profileStore';

const profileStore = useProfileStore();
const { profile, lastSaved } = toRefs(profileStore);
const { fullName } = profileStore;

// Avatar upload
const fileInput = ref(null);
const isUploading = ref(false);

// Computed props
const initials = computed(() => {
  if (!profile.value) return '?';
  
  