<template>
  <div class="knowledge-domain-editor">
    <h3 class="text-lg font-medium mb-4">Knowledge Domains</h3>
    
    <v-alert
      v-if="value.length === 0"
      type="info"
      outlined
      text
      dense
    >
      No knowledge domains selected. Add domains to specify this agent's expertise areas.
    </v-alert>
    
    <!-- Selected Domains -->
    <div v-if="value.length > 0" class="mb-6">
      <h4 class="text-base font-medium mb-2">Selected Domains</h4>
      <v-chip-group column>
        <v-chip
          v-for="domain in value"
          :key="domain._id"
          class="mb-2"
          close
          @click:close="removeDomain(domain)"
        >
          {{ domain.name }}
          <template v-slot:append>
            <v-rating
              v-model="domain.expertiseLevel"
              dense
              half-increments
              hover
              small
              color="amber"
              background-color="amber lighten-3"
              class="ml-2"
              @input="updateDomain(domain)"
            ></v-rating>
          </template>
        </v-chip>
      </v-chip-group>
    </div>
    
    <!-- Domain Search and Add -->
    <div class="mb-4">
      <h4 class="text-base font-medium mb-2">Add Knowledge Domains</h4>
      
      <div class="domain-search mb-2">
        <v-autocomplete
          v-model="selectedDomain"
          :items="availableDomainOptions"
          :filter="customFilter"
          :loading="isLoading"
          item-text="name"
          item-value="_id"
          label="Search for domains"
          return-object
          outlined
          dense
          chips
          hide-details
          clearable
          @change="domainSelected"
        >
          <template v-slot:selection="{ item }">
            <v-chip small>{{ item.name }}</v-chip>
          </template>
          <template v-slot:item="{ item }">
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle v-if="item.description" class="text-caption">
                {{ item.description }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </div>
      
      <div v-if="selectedDomain" class="domain-level-select mt-4 d-flex align-center">
        <span class="mr-3">Expertise Level:</span>
        <v-rating
          v-model="expertiseLevel"
          hover
          length="5"
          color="amber"
          background-color="amber lighten-3"
        ></v-rating>
        <div class="ml-3 text-caption">
          {{ getExpertiseLevelLabel(expertiseLevel) }}
        </div>
      </div>
      
      <div class="mt-4">
        <v-btn
          color="primary"
          :disabled="!selectedDomain"
          @click="addDomain"
          small
        >
          Add Domain
        </v-btn>
      </div>
    </div>
    
    <!-- Domain Categories -->
    <div class="mt-6">
      <h4 class="text-base font-medium mb-2">Browse by Category</h4>
      
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(domains, category) in domainsByCategory"
          :key="category"
        >
          <v-expansion-panel-header>
            {{ formatCategoryName(category) }}
            <span class="text-caption ml-2">({{ domains.length }})</span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-chip-group column>
              <v-chip
                v-for="domain in domains"
                :key="domain._id"
                outlined
                :disabled="isDomainSelected(domain)"
                @click="quickAddDomain(domain)"
              >
                {{ domain.name }}
              </v-chip>
            </v-chip-group>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    
    <!-- Domain Usage Tips -->
    <v-card class="mt-6" outlined>
      <v-card-title class="text-subtitle-1">
        <v-icon left>mdi-lightbulb-outline</v-icon>
        Tips for Setting Knowledge Domains
      </v-card-title>
      <v-card-text class="text-caption">
        <ul class="pl-4">
          <li class="mb-1">Select domains that are relevant to the agent's purpose</li>
          <li class="mb-1">Set appropriate expertise levels based on the desired depth of knowledge</li>
          <li class="mb-1">More domains may increase retrieval diversity but could reduce focus</li>
          <li class="mb-1">Higher expertise levels will prioritize that domain in responses</li>
          <li>Selected domains influence both content retrieval and response style</li>
        </ul>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeDomainEditor',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    availableDomains: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedDomain: null,
      expertiseLevel: 3,
      isLoading: false
    };
  },
  computed: {
    availableDomainOptions() {
      // Filter out already selected domains
      return this.availableDomains.filter(domain => 
        !this.isDomainSelected(domain)
      );
    },
    
    domainsByCategory() {
      const grouped = {};
      
      this.availableDomains.forEach(domain => {
        if (!grouped[domain.category]) {
          grouped[domain.category] = [];
        }
        
        grouped[domain.category].push(domain);
      });
      
      return grouped;
    }
  },
  methods: {
    isDomainSelected(domain) {
      return this.value.some(d => d._id === domain._id);
    },
    
    removeDomain(domain) {
      const updatedDomains = this.value.filter(d => d._id !== domain._id);
      this.$emit('input', updatedDomains);
    },
    
    domainSelected(domain) {
      if (domain) {
        this.expertiseLevel = 3; // Default to mid-level expertise
      }
    },
    
    addDomain() {
      if (!this.selectedDomain) return;
      
      // Create a new domain object with the selected expertise level
      const newDomain = {
        _id: this.selectedDomain._id,
        name: this.selectedDomain.name,
        category: this.selectedDomain.category,
        description: this.selectedDomain.description,
        expertiseLevel: this.expertiseLevel
      };
      
      // Add to the selected domains
      const updatedDomains = [...this.value, newDomain];
      this.$emit('input', updatedDomains);
      
      // Reset the selection
      this.selectedDomain = null;
      this.expertiseLevel = 3;
    },
    
    quickAddDomain(domain) {
      if (this.isDomainSelected(domain)) return;
      
      // Add with default expertise level
      const newDomain = {
        _id: domain._id,
        name: domain.name,
        category: domain.category,
        description: domain.description,
        expertiseLevel: 3
      };
      
      const updatedDomains = [...this.value, newDomain];
      this.$emit('input', updatedDomains);
    },
    
    updateDomain(domain) {
      // Find and update the domain in the value array
      const updatedDomains = this.value.map(d => {
        if (d._id === domain._id) {
          return {...d, expertiseLevel: domain.expertiseLevel};
        }
        return d;
      });
      
      this.$emit('input', updatedDomains);
    },
    
    customFilter(item, queryText) {
      const name = item.name.toLowerCase();
      const description = (item.description || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const searchText = queryText.toLowerCase();
      
      return name.includes(searchText) || 
             description.includes(searchText) || 
             category.includes(searchText);
    },
    
    getExpertiseLevelLabel(level) {
      const labels = {
        1: 'Basic familiarity',
        2: 'Working knowledge',
        3: 'Proficient',
        4: 'Advanced',
        5: 'Expert'
      };
      
      return labels[level] || '';
    },
    
    formatCategoryName(category) {
      return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
};
</script>

<style scoped>
.domain-search {
  max-width: 600px;
}
</style>
