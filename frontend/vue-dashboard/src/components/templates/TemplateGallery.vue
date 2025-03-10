<template>
  <div class="template-gallery">
    <div class="search-bar mb-4">
      <v-text-field
        v-model="searchQuery"
        label="Search templates"
        prepend-inner-icon="mdi-magnify"
        outlined
        dense
        clearable
      ></v-text-field>
      
      <v-select
        v-model="categoryFilter"
        :items="categoryOptions"
        label="Filter by category"
        prepend-inner-icon="mdi-filter"
        outlined
        dense
        clearable
        class="mt-2"
      ></v-select>
    </div>
    
    <div class="templates-grid">
      <v-row>
        <v-col
          v-for="template in filteredTemplates"
          :key="template._id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="template-card"
            :class="{ 'selected': isSelected(template) }"
            outlined
            hover
            @click="selectTemplate(template)"
          >
            <v-img
              v-if="template.avatarUrl"
              :src="template.avatarUrl"
              height="150"
              class="grey lighten-2"
            >
              <template v-slot:placeholder>
                <v-row
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            
            <v-avatar
              v-else
              size="80"
              color="primary"
              class="white--text mx-auto mt-4"
            >
              {{ getInitials(template.name) }}
            </v-avatar>
            
            <v-card-title class="text-h6 d-flex justify-space-between">
              {{ template.name }}
              <v-chip
                small
                :color="getCategoryColor(template.category)"
                text-color="white"
              >
                {{ template.category }}
              </v-chip>
            </v-card-title>
            
            <v-card-text>
              <div class="description mb-2">{{ truncateText(template.description, 100) }}</div>
              
              <div class="traits-container">
                <v-chip
                  v-for="trait in template.personalityTraits.slice(0, 3)"
                  :key="trait._id"
                  x-small
                  class="mr-1 mb-1"
                >
                  {{ trait.name }}
                </v-chip>
                <span v-if="template.personalityTraits.length > 3" class="text-caption">
                  +{{ template.personalityTraits.length - 3 }} more
                </span>
              </div>
            </v-card-text>
            
            <v-divider></v-divider>
            
            <v-card-actions>
              <v-btn
                text
                color="info"
                small
                @click.stop="previewTemplate(template)"
              >
                Preview
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                text
                :disabled="isSelected(template)"
                @click.stop="selectTemplate(template)"
              >
                {{ isSelected(template) ? 'Selected' : 'Select' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <!-- Template Preview Dialog -->
    <v-dialog
      v-model="previewDialog"
      max-width="700"
    >
      <v-card v-if="previewTemplate">
        <v-card-title class="text-h5">
          {{ previewTemplate.name }}
          <v-spacer></v-spacer>
          <v-chip
            small
            :color="getCategoryColor(previewTemplate.category)"
            text-color="white"
          >
            {{ previewTemplate.category }}
          </v-chip>
        </v-card-title>
        
        <v-card-text>
          <div class="d-flex mb-4">
            <v-avatar
              v-if="previewTemplate.avatarUrl"
              size="100"
              class="mr-4"
            >
              <v-img :src="previewTemplate.avatarUrl"></v-img>
            </v-avatar>
            <v-avatar
              v-else
              size="100"
              color="primary"
              class="white--text mr-4"
            >
              {{ getInitials(previewTemplate.name) }}
            </v-avatar>
            
            <div>
              <div class="text-body-1">{{ previewTemplate.description }}</div>
            </div>
          </div>
          
          <v-divider class="mb-4"></v-divider>
          
          <div class="mb-4">
            <div class="text-subtitle-1 font-weight-bold mb-2">Personality Traits</div>
            <div class="d-flex flex-wrap">
              <v-chip
                v-for="trait in previewTemplate.personalityTraits"
                :key="trait._id"
                class="mr-1 mb-1"
                small
              >
                {{ trait.name }}
              </v-chip>
            </div>
          </div>
          
          <div class="mb-4">
            <div class="text-subtitle-1 font-weight-bold mb-2">Knowledge Domains</div>
            <v-simple-table dense>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Expertise Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="domain in previewTemplate.knowledgeDomains" :key="domain._id">
                    <td>{{ domain.name }}</td>
                    <td>
                      <v-rating
                        :value="domain.expertiseLevel"
                        readonly
                        dense
                        small
                        length="5"
                        color="amber"
                        background-color="amber lighten-3"
                      ></v-rating>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
          
          <div>
            <div class="text-subtitle-1 font-weight-bold mb-2">System Prompt Preview</div>
            <v-alert
              text
              outlined
              color="info"
              class="text-caption"
            >
              {{ truncateText(previewTemplate.systemPrompt, 300) }}
            </v-alert>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            :disabled="isSelected(previewTemplate)"
            @click="selectAndClosePreview(previewTemplate)"
          >
            Select this template
          </v-btn>
          <v-btn
            color="grey darken-1"
            text
            @click="previewDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'TemplateGallery',
  props: {
    templates: {
      type: Array,
      required: true
    },
    selectedTemplate: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      searchQuery: '',
      categoryFilter: null,
      previewDialog: false,
      previewTemplate: null,
      categoryOptions: [
        'Legal', 
        'Technical', 
        'Medical', 
        'Creative', 
        'Business', 
        'Education',
        'Customer Service'
      ]
    }
  },
  computed: {
    filteredTemplates() {
      let filtered = [...this.templates];
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(template => 
          template.name.toLowerCase().includes(query) || 
          template.description.toLowerCase().includes(query)
        );
      }
      
      // Apply category filter
      if (this.categoryFilter) {
        filtered = filtered.filter(template => 
          template.category === this.categoryFilter
        );
      }
      
      return filtered;
    }
  },
  methods: {
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    getInitials(name) {
      if (!name) return '';
      return name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    },
    
    getCategoryColor(category) {
      const colorMap = {
        'Legal': 'indigo',
        'Technical': 'blue',
        'Medical': 'teal',
        'Creative': 'purple',
        'Business': 'amber darken-2',
        'Education': 'green',
        'Customer Service': 'deep-orange'
      };
      
      return colorMap[category] || 'grey';
    },
    
    isSelected(template) {
      if (!this.selectedTemplate || !template) return false;
      return this.selectedTemplate._id === template._id;
    },
    
    selectTemplate(template) {
      this.$emit('select-template', template);
    },
    
    previewTemplate(template) {
      this.previewTemplate = template;
      this.previewDialog = true;
    },
    
    selectAndClosePreview(template) {
      this.selectTemplate(template);
      this.previewDialog = false;
    }
  }
}
</script>

<style scoped>
.template-card {
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-card.selected {
  border: 2px solid var(--v-primary-base);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.description {
  min-height: 60px;
}

.traits-container {
  min-height: 40px;
}
</style>
