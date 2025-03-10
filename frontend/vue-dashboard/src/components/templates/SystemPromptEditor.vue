<template>
  <div class="system-prompt-editor">
    <h3 class="text-lg font-medium mb-4">System Prompt</h3>
    
    <div class="d-flex mb-4">
      <v-tabs v-model="activeTab" grow>
        <v-tab>Edit</v-tab>
        <v-tab>Preview</v-tab>
        <v-tab>Suggestions</v-tab>
      </v-tabs>
    </div>
    
    <v-tabs-items v-model="activeTab">
      <!-- Edit Tab -->
      <v-tab-item>
        <div class="edit-container">
          <div class="mb-2 d-flex align-center">
            <div class="flex-grow-1">
              <v-select
                v-model="editorMode"
                :items="editorModes"
                label="Editor Mode"
                dense
                outlined
                hide-details
              ></v-select>
            </div>
            <v-spacer></v-spacer>
            <div>
              <v-btn
                small
                text
                color="primary"
                @click="resetToDefault"
                class="ml-2"
              >
                Reset to Default
              </v-btn>
            </div>
          </div>
          
          <v-textarea
            v-if="editorMode === 'Basic'"
            v-model="localSystemPrompt"
            outlined
            auto-grow
            rows="12"
            label="System Prompt"
            :placeholder="placeholderText"
            @input="updateValue"
          ></v-textarea>
          
          <div v-else-if="editorMode === 'Advanced'" class="advanced-editor">
            <v-card outlined class="mb-4">
              <v-card-title class="text-subtitle-1">
                Core Identity Section
              </v-card-title>
              <v-card-text>
                <v-textarea
                  v-model="advancedSections.identity"
                  outlined
                  auto-grow
                  rows="5"
                  label="Identity"
                  placeholder="Define the agent's core identity, role, and purpose"
                  @input="updateAdvancedPrompt"
                ></v-textarea>
              </v-card-text>
            </v-card>
            
            <v-card outlined class="mb-4">
              <v-card-title class="text-subtitle-1">
                Personality Section
              </v-card-title>
              <v-card-text>
                <v-textarea
                  v-model="advancedSections.personality"
                  outlined
                  auto-grow
                  rows="5"
                  label="Personality"
                  placeholder="Define how the agent should communicate and behave"
                  @input="updateAdvancedPrompt"
                ></v-textarea>
              </v-card-text>
            </v-card>
            
            <v-card outlined class="mb-4">
              <v-card-title class="text-subtitle-1">
                Knowledge Section
              </v-card-title>
              <v-card-text>
                <v-textarea
                  v-model="advancedSections.knowledge"
                  outlined
                  auto-grow
                  rows="5"
                  label="Knowledge"
                  placeholder="Define the agent's knowledge domains and expertise"
                  @input="updateAdvancedPrompt"
                ></v-textarea>
              </v-card-text>
            </v-card>
            
            <v-card outlined class="mb-4">
              <v-card-title class="text-subtitle-1">
                Response Guidelines Section
              </v-card-title>
              <v-card-text>
                <v-textarea
                  v-model="advancedSections.guidelines"
                  outlined
                  auto-grow
                  rows="5"
                  label="Guidelines"
                  placeholder="Define how the agent should structure and format responses"
                  @input="updateAdvancedPrompt"
                ></v-textarea>
              </v-card-text>
            </v-card>
            
            <v-card outlined>
              <v-card-title class="text-subtitle-1">
                Constraints Section
              </v-card-title>
              <v-card-text>
                <v-textarea
                  v-model="advancedSections.constraints"
                  outlined
                  auto-grow
                  rows="5"
                  label="Constraints"
                  placeholder="Define limitations, restrictions, or ethical boundaries"
                  @input="updateAdvancedPrompt"
                ></v-textarea>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-tab-item>
      
      <!-- Preview Tab -->
      <v-tab-item>
        <div class="preview-container">
          <v-skeleton-loader
            v-if="isGeneratingPreview"
            type="article, paragraph, paragraph"
          ></v-skeleton-loader>
          
          <div v-else>
            <div class="bg-grey-lighten-4 p-4 rounded mb-4">
              <pre class="system-prompt-preview">{{ localSystemPrompt }}</pre>
            </div>
            
            <v-alert
              type="info"
              outlined
              text
              dense
            >
              <p>This preview shows how the system prompt will be sent to the LLM. The prompt assembly system will automatically inject additional context based on:</p>
              <ul class="mt-2">
                <li v-if="personalityTraits.length > 0">
                  <strong>{{ personalityTraits.length }}</strong> personality traits
                </li>
                <li v-if="knowledgeDomains.length > 0">
                  <strong>{{ knowledgeDomains.length }}</strong> knowledge domains
                </li>
                <li>The selected LLM model and parameters</li>
                <li>Active tools and capabilities</li>
              </ul>
            </v-alert>
          </div>
        </div>
      </v-tab-item>
      
      <!-- Suggestions Tab -->
      <v-tab-item>
        <div class="suggestions-container">
          <v-alert
            type="info"
            text
            class="mb-4"
          >
            Below are suggested prompt segments based on your agent's configuration. Click any segment to add it to your system prompt.
          </v-alert>
          
          <v-expansion-panels>
            <!-- Identity Suggestions -->
            <v-expansion-panel>
              <v-expansion-panel-header>
                Identity Suggestions
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card
                  v-for="(suggestion, index) in suggestions.identity"
                  :key="`identity-${index}`"
                  outlined
                  class="mb-2 suggestion-card"
                  hover
                  @click="addSuggestion(suggestion)"
                >
                  <v-card-text>
                    {{ suggestion }}
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
            
            <!-- Personality Suggestions -->
            <v-expansion-panel>
              <v-expansion-panel-header>
                Personality Suggestions
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card
                  v-for="(suggestion, index) in suggestions.personality"
                  :key="`personality-${index}`"
                  outlined
                  class="mb-2 suggestion-card"
                  hover
                  @click="addSuggestion(suggestion)"
                >
                  <v-card-text>
                    {{ suggestion }}
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
            
            <!-- Knowledge Suggestions -->
            <v-expansion-panel>
              <v-expansion-panel-header>
                Knowledge Suggestions
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card
                  v-for="(suggestion, index) in suggestions.knowledge"
                  :key="`knowledge-${index}`"
                  outlined
                  class="mb-2 suggestion-card"
                  hover
                  @click="addSuggestion(suggestion)"
                >
                  <v-card-text>
                    {{ suggestion }}
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
            
            <!-- Guidelines Suggestions -->
            <v-expansion-panel>
              <v-expansion-panel-header>
                Response Guidelines Suggestions
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card
                  v-for="(suggestion, index) in suggestions.guidelines"
                  :key="`guidelines-${index}`"
                  outlined
                  class="mb-2 suggestion-card"
                  hover
                  @click="addSuggestion(suggestion)"
                >
                  <v-card-text>
                    {{ suggestion }}
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
export default {
  name: 'SystemPromptEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    personalityTraits: {
      type: Array,
      default: () => []
    },
    knowledgeDomains: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeTab: 0,
      editorMode: 'Basic',
      editorModes: ['Basic', 'Advanced'],
      localSystemPrompt: '',
      isGeneratingPreview: false,
      advancedSections: {
        identity: '',
        personality: '',
        knowledge: '',
        guidelines: '',
        constraints: ''
      },
      defaultPrompt: `You are a helpful AI assistant created by MukkaAI. Your purpose is to provide accurate, helpful, and thoughtful responses to user queries.

You are knowledgeable in a wide range of topics and can assist with various tasks. When you don't know something or are uncertain, you'll acknowledge your limitations and avoid making up information.

Respond to the user in a clear, concise, and helpful manner. Always prioritize being useful and providing accurate information.`,
      suggestions: {
        identity: [
          "You are a specialized assistant created by MukkaAI, focused on providing expert help in [specific domain].",
          "You are MukkaAI's advanced assistant with access to specialized knowledge and tools in [domain].",
          "You are a dedicated assistant designed to help users with [specific task or domain]."
        ],
        personality: [
          "Communicate in a professional, formal manner while maintaining clarity and precision in your responses.",
          "Present information in a friendly, conversational tone that's accessible to users of all technical backgrounds.",
          "Convey expertise through detailed, technical explanations when appropriate, while being able to simplify concepts when needed."
        ],
        knowledge: [
          "You specialize in [domain] with particular expertise in [subdomain]. You can explain complex concepts in this field clearly.",
          "Your knowledge covers both theoretical and practical aspects of [domain], including latest developments as of [date].",
          "You have been trained on comprehensive information about [domain] and can provide detailed insights and analysis."
        ],
        guidelines: [
          "When answering questions, first provide a concise summary, then offer more detailed information if relevant.",
          "Structure your responses with clear sections and use examples to illustrate complex concepts.",
          "When providing step-by-step instructions, number each step and include any relevant cautions or tips."
        ]
      }
    };
  },
  computed: {
    placeholderText() {
      return "Define how the agent should behave, what knowledge it should prioritize, and how it should respond to users...";
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.localSystemPrompt = newVal || this.defaultPrompt;
        this.parseAdvancedSections();
      }
    }
  },
  methods: {
    updateValue() {
      this.$emit('input', this.localSystemPrompt);
    },
    
    resetToDefault() {
      this.localSystemPrompt = this.defaultPrompt;
      this.parseAdvancedSections();
      this.updateValue();
    },
    
    parseAdvancedSections() {
      // Simple parsing - in a real implementation, this would be more sophisticated
      const sections = {
        identity: '',
        personality: '',
        knowledge: '',
        guidelines: '',
        constraints: ''
      };
      
      const prompt = this.localSystemPrompt;
      const lines = prompt.split('\n');
      
      let currentSection = 'identity';
      
      lines.forEach(line => {
        if (line.toLowerCase().includes('personality') || line.toLowerCase().includes('communication')) {
          currentSection = 'personality';
          return;
        }
        
        if (line.toLowerCase().includes('knowledge') || line.toLowerCase().includes('expertise')) {
          currentSection = 'knowledge';
          return;
        }
        
        if (line.toLowerCase().includes('response') || line.toLowerCase().includes('guidelines')) {
          currentSection = 'guidelines';
          return;
        }
        
        if (line.toLowerCase().includes('constraint') || line.toLowerCase().includes('limitation')) {
          currentSection = 'constraints';
          return;
        }
        
        sections[currentSection] += line + '\n';
      });
      
      // Clean up each section
      Object.keys(sections).forEach(key => {
        sections[key] = sections[key].trim();
      });
      
      this.advancedSections = sections;
    },
    
    updateAdvancedPrompt() {
      // Combine all sections into a single prompt
      const sections = this.advancedSections;
      let combined = '';
      
      if (sections.identity) {
        combined += sections.identity + '\n\n';
      }
      
      if (sections.personality) {
        combined += sections.personality + '\n\n';
      }
      
      if (sections.knowledge) {
        combined += sections.knowledge + '\n\n';
      }
      
      if (sections.guidelines) {
        combined += sections.guidelines + '\n\n';
      }
      
      if (sections.constraints) {
        combined += sections.constraints;
      }
      
      this.localSystemPrompt = combined.trim();
      this.updateValue();
    },
    
    addSuggestion(suggestion) {
      if (this.editorMode === 'Basic') {
        // Add to the main prompt
        this.localSystemPrompt += '\n\n' + suggestion;
        this.updateValue();
      } else {
        // Add to the appropriate section based on the active expansion panel
        // This is simplified; in a real app, you'd need to track which panel is open
        const panels = ['identity', 'personality', 'knowledge', 'guidelines'];
        const activePanel = panels[this.$refs.suggestionPanels?.value || 0];
        
        this.advancedSections[activePanel] += '\n\n' + suggestion;
        this.updateAdvancedPrompt();
      }
      
      // Switch back to edit tab
      this.activeTab = 0;
    },
    
    generateSuggestions() {
      // In a real implementation, this would fetch suggestions from the backend
      // based on the selected personality traits and knowledge domains
      
      // For now, we'll use the static suggestions defined in data()
    }
  }
};
</script>

<style scoped>
.system-prompt-preview {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.9rem;
  overflow-x: auto;
}

.suggestion-card {
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-card:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
}
</style>
