<template>
  <div class="banner-upload">
    <!-- Banner Preview -->
    <div 
      class="banner-preview" 
      :style="bannerStyle" 
      @click="triggerFileInput"
    >
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <v-avatar v-if="showAvatar" size="120" class="avatar-overlay">
          <v-img v-if="avatarUrl" :src="avatarUrl" cover></v-img>
          <span v-else class="text-h2">{{ userInitials }}</span>
        </v-avatar>
        
        <div class="banner-actions">
          <v-btn
            icon
            variant="text"
            color="white"
            class="upload-icon"
            @click.stop="triggerFileInput"
          >
            <v-icon>mdi-camera</v-icon>
          </v-btn>
          
          <v-btn
            v-if="bannerPreview || bannerUrl"
            icon
            variant="text"
            color="white"
            class="remove-icon ml-2"
            @click.stop="removeBanner"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    
    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="d-none"
      @change="onFileSelected"
    />
  </div>
</template>

<script>
export default {
  name: 'BannerUpload',
  
  props: {
    bannerUrl: {
      type: String,
      default: ''
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    userInitials: {
      type: String,
      default: '?'
    },
    showAvatar: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      bannerFile: null,
      bannerPreview: null,
      isUploading: false
    };
  },
  
  computed: {
    bannerStyle() {
      const backgroundImage = this.bannerPreview || this.bannerUrl;
      return {
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : null,
        backgroundColor: backgroundImage ? null : 'var(--v-theme-primary)'
      };
    }
  },
  
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      this.bannerFile = file;
      
      // Generate preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.bannerPreview = e.target.result;
        this.$emit('banner-change', { file: this.bannerFile, preview: this.bannerPreview });
      };
      reader.readAsDataURL(file);
    },
    
    removeBanner() {
      this.bannerFile = null;
      this.bannerPreview = null;
      this.$emit('banner-change', { file: null, preview: null, remove: true });
    }
  }
};
</script>

<style scoped>
.banner-upload {
  width: 100%;
  position: relative;
}

.banner-preview {
  height: 200px;
  width: 100%;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
              rgba(var(--v-theme-primary), 0.1),
              rgba(var(--v-theme-primary), 0.3));
}

.banner-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.avatar-overlay {
  margin-bottom: 10px;
  border: 4px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.banner-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
}

.upload-icon, .remove-icon {
  background-color: rgba(0, 0, 0, 0.4);
  margin: 0 4px;
}
</style>
