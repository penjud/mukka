<template>
  <div class="personality-selector">
    <h3 class="text-lg font-medium mb-2">Personality Traits</h3>
    
    <!-- Intensity Slider -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Personality Intensity: {{ personalityIntensity }}
      </label>
      <div class="flex items-center">
        <span class="text-xs text-gray-500 mr-2">Subtle</span>
        <input
          type="range"
          min="1"
          max="10"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          v-model.number="personalityIntensity"
        />
        <span class="text-xs text-gray-500 ml-2">Strong</span>
      </div>
    </div>
    
    <!-- Trait Categories -->
    <div class="mb-4">
      <div v-for="(traits, category) in traitsByCategory" :key="category" class="mb-6">
        <h4 class="font-medium text-gray-800 mb-2">{{ formatCategoryName(category) }}</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <div
            v-for="trait in traits"
            :key="trait._id"
            @click="toggleTrait(trait)"
            class="personality-trait-card p-3 border rounded-lg cursor-pointer transition-all"
            :class="{
              'border-blue-500 bg-blue-50': isTraitSelected(trait),
              'border-gray-200 hover:border-gray-300': !isTraitSelected(trait),
              'opacity-40': isTraitDisabled(trait) && !isTraitSelected(trait)
            }"
            :title="isTraitDisabled(trait) && !isTraitSelected(trait) ? 'Incompatible with selected traits' : trait.description"
          >
            <div class="flex justify-between items-start">
              <div class="font-medium text-gray-900">{{ trait.name }}</div>
              <div
                v-if="isTraitSelected(trait)"
                class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="mt-1 text-xs text-gray-600">{{ trait.shortDescription }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Selected Traits Summary -->
    <div v-if="selectedTraits.length > 0" class="mt-4 p-3 bg-gray-50 rounded-lg">
      <h4 class="font-medium text-gray-800 mb-2">Selected Traits</h4>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="trait in selectedTraits"
          :key="trait._id"
          class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center"
        >
          {{ trait.name }}
          <button
            @click.stop="toggleTrait(trait)"
            class="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Personality Preview -->
    <div class="mt-6">
      <h4 class="font-medium text-gray-800 mb-2">Personality Preview</h4>
      <div class="p-4 border rounded-lg bg-white">
        <div v-if="selectedTraits.length === 0" class="text-gray-500 italic">
          Select personality traits to see a preview
        </div>
        <div v-else>
          <div class="text-sm text-gray-700 mb-3">
            <strong>This agent will communicate in a{{ isVowel(previewDescription[0]) ? 'n' : '' }} {{ previewDescription }} manner:</strong>
          </div>
          <div class="text-sm text-gray-600">
            {{ previewExample }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PersonalitySelector',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    intensityValue: {
      type: Number,
      default: 5
    },
    allTraits: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedTraitIds: [],
      personalityIntensity: 5,
      
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
    // Group traits by category for display
    traitsByCategory() {
      const grouped = {};
      
      this.allTraits.forEach(trait => {
        if (!grouped[trait.category]) {
          grouped[trait.category] = [];
        }
        
        grouped[trait.category].push(trait);
      });
      
      return grouped;
    },
    
    // Get full trait objects for selected traits
    selectedTraits() {
      return this.allTraits.filter(trait => this.selectedTraitIds.includes(trait._id));
    },
    
    // Generate a description of the personality based on selected traits
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
    },
    
    // Generate a preview example based on selected traits
    previewExample() {
      if (this.selectedTraits.length === 0) return '';
      
      // Special case for Bogan archetype - it overrides other traits
      const hasBogan = this.selectedTraits.some(t => t.name.toLowerCase() === 'bogan');
      if (hasBogan) {
        return this.previewExamples.bogan;
      }
      
      // Start with an empty preview
      let preview = '';
      
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
  },
  watch: {
    // Watch for changes from parent component
    value: {
      immediate: true,
      handler(newVal) {
        this.selectedTraitIds = [...newVal];
      }
    },
    intensityValue: {
      immediate: true,
      handler(newVal) {
        this.personalityIntensity = newVal;
      }
    },
    
    // Emit changes to parent component
    selectedTraitIds() {
      this.$emit('input', this.selectedTraitIds);
    },
    personalityIntensity() {
      this.$emit('update:intensity', this.personalityIntensity);
    }
  },
  methods: {
    // Toggle trait selection
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
    
    // Check if trait is selected
    isTraitSelected(trait) {
      return this.selectedTraitIds.includes(trait._id);
    },
    
    // Check if trait is disabled due to incompatibility
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
        
        // Check if the trait categories are the same (indicating incompatibility)
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
    
    // Format category name for display
    formatCategoryName(category) {
      switch (category) {
        case 'communication_style':
          return 'Communication Style';
        case 'emotional':
          return 'Emotional Style';
        case 'personality_archetype':
          return 'Character Archetype';
        default:
          return category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
      }
    },
    
    // Check if a letter is a vowel
    isVowel(letter) {
      return /^[aeiou]$/i.test(letter);
    }
  }
};
</script>

<style scoped>
.personality-trait-card {
  transition: all 0.2s ease;
}

.personality-trait-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
