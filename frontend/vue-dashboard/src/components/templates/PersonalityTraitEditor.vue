<template>
  <div class="personality-trait-editor">
    <h3 class="text-lg font-medium mb-4">Personality Traits</h3>
    
    <!-- Intensity Slider -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Personality Intensity: {{ personalityIntensity }}
      </label>
      <div class="d-flex align-center">
        <span class="text-caption grey--text mr-2">Subtle</span>
        <v-slider
          v-model="personalityIntensity"
          min="1"
          max="10"
          thumb-label="always"
          hide-details
          class="flex-grow-1"
        ></v-slider>
        <span class="text-caption grey--text ml-2">Strong</span>
      </div>
      <div class="text-caption mt-1 grey--text">
        Intensity affects how strongly these traits will influence the agent's communication style.
      </div>
    </div>
    
    <!-- Selected Traits Summary -->
    <div v-if="selectedTraits.length > 0" class="mb-6">
      <h4 class="text-base font-medium mb-2">Selected Traits</h4>
      <v-chip-group column>
        <v-chip
          v-for="trait in selectedTraits"
          :key="trait._id"
          close
          @click:close="removeTrait(trait)"
          class="ma-1"
        >
          {{ trait.name }}
        </v-chip>
      </v-chip-group>
    </div>
    
    <v-alert
      v-else
      type="info"
      outlined
      text
      dense
      class="mb-4"
    >
      No personality traits selected. Select traits to define how your agent communicates.
    </v-alert>
    
    <!-- Personality Trait Categories -->
    <v-tabs v-model="activeCategory" slider-color="primary" class="mb-4">
      <v-tab
        v-for="category in traitCategories"
        :key="category.value"
      >
        {{ category.text }}
      </v-tab>
    </v-tabs>
    
    <v-tabs-items v-model="activeCategory">
      <v-tab-item
        v-for="category in traitCategories"
        :key="category.value"
      >
        <div class="traits-grid">
          <v-row>
            <v-col
              v-for="trait in getTraitsByCategory(category.value)"
              :key="trait._id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                outlined
                :class="[
                  'trait-card',
                  isTraitSelected(trait) ? 'selected' : '',
                  isTraitDisabled(trait) && !isTraitSelected(trait) ? 'disabled' : ''
                ]"
                hover
                @click="toggleTrait(trait)"
              >
                <v-card-title class="text-subtitle-1">
                  {{ trait.name }}
                  <v-spacer></v-spacer>
                  <v-icon v-if="isTraitSelected(trait)" color="primary" small>
                    mdi-check-circle
                  </v-icon>
                </v-card-title>
                <v-card-text>
                  <p class="text-caption mb-2">{{ trait.shortDescription }}</p>
                  
                  <v-expansion-panels flat>
                    <v-expansion-panel>
                      <v-expansion-panel-header class="pa-0">
                        <span class="text-caption primary--text">
                          See Details
                        </span>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content class="text-caption">
                        <p v-if="trait.description" class="mb-2">{{ trait.description }}</p>
                        
                        <div v-if="trait.examples && trait.examples.length" class="mt-2">
                          <strong class="text-caption">Examples:</strong>
                          <ul class="pl-4">
                            <li v-for="(example, i) in trait.examples" :key="i" class="text-caption">
                              {{ example }}
                            </li>
                          </ul>
                        </div>
                        
                        <div v-if="trait.incompatibleWith && trait.incompatibleWith.length" class="mt-2">
                          <strong class="text-caption">Incompatible with:</strong>
                          <v-chip
                            v-for="incompatId in trait.incompatibleWith"
                            :key="incompatId"
                            x-small
                            class="ma-1"
                          >
                            {{ getTraitName(incompatId) }}
                          </v-chip>
                        </div>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-tab-item>
    </v-tabs-items>
    
    <!-- Personality Preview -->
    <div class="mt-6">
      <h4 class="text-base font-medium mb-2">Personality Preview</h4>
      <v-card outlined>
        <v-card-text>
          <div v-if="selectedTraits.length === 0" class="text-body-2 grey--text font-italic">
            Select personality traits to see a preview
          </div>
          <div v-else>
            <div class="text-body-2 mb-3">
              <strong>This agent will communicate in a{{ isVowel(previewDescription[0]) ? 'n' : '' }} {{ previewDescription }} manner:</strong>
            </div>
            <div class="text-body-2 grey--text">
              {{ getPreviewExample() }}
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- Personality Traits Guide -->
    <v-card class="mt-6" outlined>
      <v-card-title class="text-subtitle-1">
        <v-icon left>mdi-lightbulb-outline</v-icon>
        Tips for Personality Traits
      </v-card-title>
      <v-card-text class="text-caption">
        <ul class="pl-4">
          <li class="mb-1">Select traits that align with the agent's purpose</li>
          <li class="mb-1">Combine complementary traits for a more nuanced personality</li>
          <li class="mb-1">Avoid conflicting traits that would create inconsistent behavior</li>
          <li class="mb-1">Consider the intensity level to make traits more or less pronounced</li>
          <li>The preview gives a sample of how the agent might respond</li>
        </ul>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'PersonalityTraitEditor',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    availableTraits: {
      type: Array,
      required: true
    },
    intensity: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      selectedTraitIds: [],
      personalityIntensity: 5,
      activeCategory: 0,
      traitCategories: [
        { text: 'Communication Style', value: 'communication_style' },
        { text: 'Emotional Style', value: 'emotional' },
        { text: 'Character Archetype', value: 'personality_archetype' }
      ],
      
      // Example responses for previewing personality combinations
      previewExamples: {
        // Communication Style
        formal: "I would be pleased to provide you with comprehensive information regarding that topic. The primary considerations are as follows...",
        casual: "Sure thing! Here's what you need to know about that. First off...",
        technical: "The implementation requires specific configuration of the following parameters: (1) initialization vector, (2) encryption key, and (3) cipher mode...",
        simplified: "Think of it like building with blocks. You start with the foundation, then add each piece one by one until you're done.",
        direct: "Focus on these three steps: 1. Analyze the data. 2. Identify patterns. 3. Draw conclusions.",
        elaborate: "This subject encompasses multiple interconnected facets. Let's begin by examining the historical context, before proceeding to contemporary applications and finally exploring potential future developments...",
        
        // Emotional Traits
        enthusiastic: "I'm so excited to help with this! It's a fascinating topic with so many interesting aspects to explore!",
        reserved: "The data indicates several relevant factors to consider. An analysis of these elements will provide appropriate guidance.",
        empathetic: "I understand how challenging this situation must be for you. Many people find themselves feeling similarly when faced with these circumstances.",
        analytical: "Let's evaluate this systematically by examining the variables involved, their relationships, and potential outcomes based on empirical evidence.",
        humorous: "So a dataset walks into a neural network... just kidding! But seriously, let's look at how these numbers tell a surprisingly entertaining story.",
        serious: "This matter requires careful consideration. Let's focus on the essential factors without diversion.",
        
        // Archetypes
        bogan: "Yeah mate, no worries. I can sort that out for ya. Let's have a proper look at what you're dealing with here..."
      }
    };
  },
  computed: {
    selectedTraits() {
      return this.availableTraits.filter(trait => this.selectedTraitIds.includes(trait._id));
    },
    
    previewDescription() {
      if (this.selectedTraits.length === 0) return '';
      
      const traitNames = this.selectedTraits.map(t => t.name.toLowerCase());
      
      // If there's only one trait, use its name
      if (traitNames.length === 1) {
        return traitNames[0];
      }
      
      // If there are two traits, combine them
      if (traitNames.length === 2) {
        return `${traitNames[0]} and ${traitNames[1]}`;
      }
      
      // If there are more than two traits, list them with commas and 'and'
      return traitNames.slice(0, -1).join(', ') + ', and ' + traitNames[traitNames.length - 1];
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.selectedTraitIds = newVal.map(trait => 
          typeof trait === 'string' ? trait : trait._id
        );
      }
    },
    intensity: {
      immediate: true,
      handler(newVal) {
        this.personalityIntensity = newVal;
      }
    },
    selectedTraitIds() {
      this.$emit('input', this.selectedTraitIds);
    },
    personalityIntensity() {
      this.$emit('update:intensity', this.personalityIntensity);
    }
  },
  methods: {
    getTraitsByCategory(category) {
      return this.availableTraits.filter(trait => trait.category === category);
    },
    
    toggleTrait(trait) {
      if (this.isTraitDisabled(trait) && !this.isTraitSelected(trait)) {
        // Don't allow selecting incompatible traits
        return;
      }
      
      if (this.isTraitSelected(trait)) {
        // Deselect trait
        this.selectedTraitIds = this.selectedTraitIds.filter(id => id !== trait._id);
      } else {
        // Select trait
        this.selectedTraitIds.push(trait._id);
      }
    },
    
    removeTrait(trait) {
      this.selectedTraitIds = this.selectedTraitIds.filter(id => id !== trait._id);
    },
    
    isTraitSelected(trait) {
      return this.selectedTraitIds.includes(trait._id);
    },
    
    isTraitDisabled(trait) {
      if (this.selectedTraits.length === 0) {
        return false;
      }
      
      // Check for incompatibility with any selected trait
      for (const selectedTrait of this.selectedTraits) {
        // Skip self-comparison
        if (selectedTrait._id === trait._id) {
          continue;
        }
        
        // Check if the trait categories are incompatible
        // Usually traits in the same category are incompatible with each other
        if (selectedTrait.category === trait.category) {
          return true;
        }
        
        // Check explicit incompatibilities if they exist
        if (selectedTrait.incompatibleWith && 
            selectedTrait.incompatibleWith.includes(trait._id)) {
          return true;
        }
        
        if (trait.incompatibleWith && 
            trait.incompatibleWith.includes(selectedTrait._id)) {
          return true;
        }
      }
      
      return false;
    },
    
    getTraitName(traitId) {
      const trait = this.availableTraits.find(t => t._id === traitId);
      return trait ? trait.name : 'Unknown Trait';
    },
    
    isVowel(letter) {
      return /^[aeiou]$/i.test(letter);
    },
    
    getPreviewExample() {
      if (this.selectedTraits.length === 0) return '';
      
      // Special case for Bogan archetype - it overrides other traits
      const hasBogan = this.selectedTraits.some(t => t.name.toLowerCase() === 'bogan');
      if (hasBogan) {
        return this.previewExamples.bogan;
      }
      
      // If there's only one trait, use its example directly
      if (this.selectedTraits.length === 1) {
        const traitName = this.selectedTraits[0].name.toLowerCase();
        return this.previewExamples[traitName] || 'This agent will exhibit the selected personality trait.';
      }
      
      // For multiple traits, blend examples
      
      // First, check for communication style traits
      const commStyles = ['formal', 'casual', 'technical', 'simplified', 'direct', 'elaborate'];
      const selectedCommStyles = this.selectedTraits
        .filter(t => commStyles.includes(t.name.toLowerCase()))
        .map(t => t.name.toLowerCase());
      
      // Use the first communication style as the base structure
      let preview = '';
      if (selectedCommStyles.length > 0) {
        preview = this.previewExamples[selectedCommStyles[0]];
      } else {
        preview = "I'll help you with that. ";
      }
      
      // Check for emotional traits to influence the tone
      const emotionalTraits = ['enthusiastic', 'reserved', 'empathetic', 'analytical', 'humorous', 'serious'];
      const selectedEmotionalTraits = this.selectedTraits
        .filter(t => emotionalTraits.includes(t.name.toLowerCase()))
        .map(t => t.name.toLowerCase());
      
      // Add emotional markers if present
      if (selectedEmotionalTraits.includes('enthusiastic')) {
        preview = preview.replace('.', '!');
        preview = preview.replace('I would', "I'd be thrilled to");
        preview = preview.replace('provide you with', 'share');
      }
      
      if (selectedEmotionalTraits.includes('empathetic')) {
        preview = "I understand this is important to you. " + preview;
      }
      
      if (selectedEmotionalTraits.includes('humorous')) {
        preview += " Don't worry, I promise to make this information more entertaining than reading the terms and conditions!";
      }
      
      if (selectedEmotionalTraits.includes('serious')) {
        preview = preview.replace('!', '.');
        preview = preview.replace(/exciting|thrilled|fascinating/gi, 'important');
      }
      
      return preview;
    }
  }
};
</script>

<style scoped>
.trait-card {
  transition: all 0.2s ease;
  height: 100%;
}

.trait-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.trait-card.selected {
  border: 2px solid var(--v-primary-base);
  background-color: rgba(var(--v-primary-base), 0.1);
}

.trait-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trait-card.disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>
