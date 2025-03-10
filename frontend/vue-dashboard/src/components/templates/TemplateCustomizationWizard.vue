<template>
  <div class="template-customization-wizard">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-stepper v-model="currentStep" :vertical="isMobile">
            <!-- Step 1: Template Selection -->
            <v-stepper-step step="1" :complete="currentStep > 1">
              Select Template
            </v-stepper-step>
            <v-stepper-content step="1">
              <v-card class="mb-4">
                <v-card-title>Choose a Base Template</v-card-title>
                <v-card-text>
                  <template-gallery 
                    :templates="availableTemplates" 
                    :selected-template="selectedTemplate"
                    @select-template="selectTemplate"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn 
                    color="primary" 
                    :disabled="!selectedTemplate" 
                    @click="currentStep = 2"
                  >
                    Continue
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 2: Basic Information -->
            <v-stepper-step step="2" :complete="currentStep > 2">
              Basic Information
            </v-stepper-step>
            <v-stepper-content step="2">
              <v-card class="mb-4">
                <v-card-title>Customize Basic Information</v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model="customizedTemplate.name"
                    label="Name"
                    :counter="50"
                    :rules="[v => !!v || 'Name is required', v => v.length <= 50 || 'Name must be less than 50 characters']"
                    required
                  ></v-text-field>
                  
                  <v-textarea
                    v-model="customizedTemplate.description"
                    label="Description"
                    :counter="1000"
                    :rules="[v => !!v || 'Description is required', v => v.length <= 1000 || 'Description must be less than 1000 characters']"
                    required
                  ></v-textarea>
                  
                  <v-select
                    v-model="customizedTemplate.category"
                    :items="categoryOptions"
                    label="Category"
                    required
                  ></v-select>
                  
                  <v-file-input
                    v-model="avatarFile"
                    label="Avatar (optional)"
                    accept="image/*"
                    prepend-icon="mdi-camera"
                    @change="handleAvatarChange"
                  ></v-file-input>
                  
                  <div v-if="customizedTemplate.avatarUrl" class="avatar-preview">
                    <v-img
                      :src="customizedTemplate.avatarUrl"
                      width="100"
                      height="100"
                      class="rounded-circle"
                    ></v-img>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="currentStep = 1">Back</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn 
                    color="primary" 
                    :disabled="!isBasicInfoValid" 
                    @click="currentStep = 3"
                  >
                    Continue
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 3: Personality Traits -->
            <v-stepper-step step="3" :complete="currentStep > 3">
              Personality Traits
            </v-stepper-step>
            <v-stepper-content step="3">
              <v-card class="mb-4">
                <v-card-title>Customize Personality Traits</v-card-title>
                <v-card-text>
                  <personality-trait-editor 
                    v-model="customizedTemplate.personalityTraits"
                    :available-traits="availableTraits"
                    :intensity="customizedTemplate.personalityIntensity"
                    @update:intensity="updateIntensity"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="currentStep = 2">Back</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="currentStep = 4">
                    Continue
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 4: Knowledge Domains -->
            <v-stepper-step step="4" :complete="currentStep > 4">
              Knowledge Domains
            </v-stepper-step>
            <v-stepper-content step="4">
              <v-card class="mb-4">
                <v-card-title>Customize Knowledge Domains</v-card-title>
                <v-card-text>
                  <knowledge-domain-editor 
                    v-model="customizedTemplate.knowledgeDomains"
                    :available-domains="availableDomains"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="currentStep = 3">Back</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="currentStep = 5">
                    Continue
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 5: System Prompt -->
            <v-stepper-step step="5" :complete="currentStep > 5">
              System Prompt
            </v-stepper-step>
            <v-stepper-content step="5">
              <v-card class="mb-4">
                <v-card-title>Customize System Prompt</v-card-title>
                <v-card-text>
                  <system-prompt-editor 
                    v-model="customizedTemplate.systemPrompt"
                    :personality-traits="getSelectedPersonalityTraits()"
                    :knowledge-domains="customizedTemplate.knowledgeDomains"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="currentStep = 4">Back</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="currentStep = 6">
                    Continue
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 6: Model Configuration -->
            <v-stepper-step step="6" :complete="currentStep > 6">
              Model Configuration
            </v-stepper-step>
            <v-stepper-content step="6">
              <v-card class="mb-4">
                <v-card-title>Configure Model Settings</v-card-title>
                <v-card-text>
                  <v-select
                    v-model="customizedTemplate.model"
                    :items="modelOptions"
                    label="Base Model"
                    required
                  ></v-select>
                  
                  <v-slider
                    v-model="customizedTemplate.temperature"
                    label="Temperature"
                    thumb-label="always"
                    min="0"
                    max="1"
                    step="0.1"
                    :hint="`Lower values are more deterministic, higher values are more creative`"
                    persistent-hint
                  ></v-slider>
                  
                  <v-slider
                    v-model="customizedTemplate.contextWindow"
                    label="Context Window Size"
                    thumb-label="always"
                    min="1000"
                    max="100000"
                    step="1000"
                    :hint="`Larger context windows allow for more history but use more resources`"
                    persistent-hint
                  ></v-slider>
                  
                  <v-checkbox
                    v-model="customizedTemplate.enableStreaming"
                    label="Enable Streaming"
                    hint="Enable to receive responses as they're generated"
                    persistent-hint
                  ></v-checkbox>
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="currentStep = 5">Back</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="currentStep = 7">
                    Continue
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 7: Tool Access -->
            <v-stepper-step step="7" :complete="currentStep > 7">
              Tool Access
            </v-stepper-step>
            <v-stepper-content step="7">
              <v-card class="mb-4">
                <v-card-title>Configure Tool Access</v-card-title>
                <v-card-text>
                  <v-expansion-panels>
                    <v-expansion-panel>
                      <v-expansion-panel-header>
                        Filesystem Access
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-checkbox
                          v-model="customizedTemplate.tools.filesystem.enabled"
                          label="Enable Filesystem Access"
                        ></v-checkbox>
                        
                        <v-select
                          v-if="customizedTemplate.tools.filesystem.enabled"
                          v-model="customizedTemplate.tools.filesystem.accessLevel"
                          :items="filesystemAccessLevels"
                          label="Access Level"
                        ></v-select>
                        
                        <v-text-field
                          v-if="customizedTemplate.tools.filesystem.enabled && customizedTemplate.tools.filesystem.accessLevel === 'limited'"
                          v-model="customizedTemplate.tools.filesystem.rootPath"
                          label="Root Path"
                          hint="Limit filesystem access to this directory"
                          persistent-hint
                        ></v-text-field>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    
                    <v-expansion-panel>
                      <v-expansion-panel-header>
                        Web Search
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-checkbox
                          v-model="customizedTemplate.tools.webSearch.enabled"
                          label="Enable Web Search"
                        ></v-checkbox>
                        
                        <v-select
                          v-if="customizedTemplate.tools.webSearch.enabled"
                          v-model="customizedTemplate.tools.webSearch.accessLevel"
                          :items="webSearchAccessLevels"
                          label="Access Level"
                        ></v-select>
                        
                        <v-text-field
                          v-if="customizedTemplate.tools.webSearch.enabled && customizedTemplate.tools.webSearch.accessLevel === 'limited'"
                          v-model="customizedTemplate.tools.webSearch.allowedDomains"
                          label="Allowed Domains"
                          hint="Comma-separated list of allowed domains"
                          persistent-hint
                        ></v-text-field>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    
                    <v-expansion-panel>
                      <v-expansion-panel-header>
                        Memory Access
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-checkbox
                          v-model="customizedTemplate.tools.memory.enabled"
                          label="Enable Memory Access"
                        ></v-checkbox>
                        
                        <v-select
                          v-if="customizedTemplate.tools.memory.enabled"
                          v-model="customizedTemplate.tools.memory.retention"
                          :items="memoryRetentionOptions"
                          label="Retention Period"
                        ></v-select>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="currentStep = 6">Back</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="currentStep = 8">
                    Continue
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 8: Review & Save -->
            <v-stepper-step step="8">
              Review & Save
            </v-stepper-step>
            <v-stepper-content step="8">
              <v-card class="mb-4">
                <v-card-title>Review Agent Configuration</v-card-title>
                <v-card-text>
                  <v-alert
                    v-if="validationErrors.length > 0"
                    type="error"
                    outlined
                    class="mb-4"
                  >
                    <div class="font-weight-bold mb-2">Please fix the following issues:</div>
                    <ul>
                      <li v-for="(error, index) in validationErrors" :key="index">
                        {{ error }}
                      </li>
                    </ul>
                  </v-alert>
                  
                  <v-simple-table>
                    <template v-slot:default>
                      <tbody>
                        <tr>
                          <td class="font-weight-bold">Name</td>
                          <td>{{ customizedTemplate.name }}</td>
                        </tr>
                        <tr>
                          <td class="font-weight-bold">Category</td>
                          <td>{{ customizedTemplate.category }}</td>
                        </tr>
                        <tr>
                          <td class="font-weight-bold">Personality Traits</td>
                          <td>
                            <v-chip
                              v-for="trait in getSelectedPersonalityTraits()"
                              :key="trait._id"
                              small
                              class="mr-1 mb-1"
                            >
                              {{ trait.name }}
                            </v-chip>
                            <div class="mt-1 text-caption">
                              Intensity: {{ customizedTemplate.personalityIntensity }}/10
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td class="font-weight-bold">Knowledge Domains</td>
                          <td>
                            <v-chip
                              v-for="domain in customizedTemplate.knowledgeDomains"
                              :key="domain._id"
                              small
                              class="mr-1 mb-1"
                            >
                              {{ domain.name }} ({{ domain.expertiseLevel }}/5)
                            </v-chip>
                          </td>
                        </tr>
                        <tr>
                          <td class="font-weight-bold">Model</td>
                          <td>{{ customizedTemplate.model }}</td>
                        </tr>
                        <tr>
                          <td class="font-weight-bold">Temperature</td>
                          <td>{{ customizedTemplate.temperature }}</td>
                        </tr>
                        <tr>
                          <td class="font-weight-bold">Context Window</td>
                          <td>{{ customizedTemplate.contextWindow.toLocaleString() }} tokens</td>
                        </tr>
                        <tr>
                          <td class="font-weight-bold">Tools</td>
                          <td>
                            <ul class="pl-4 mb-0">
                              <li v-if="customizedTemplate.tools.filesystem.enabled">
                                Filesystem: {{ customizedTemplate.tools.filesystem.accessLevel }}
                                <span v-if="customizedTemplate.tools.filesystem.rootPath">
                                  ({{ customizedTemplate.tools.filesystem.rootPath }})
                                </span>
                              </li>
                              <li v-if="customizedTemplate.tools.webSearch.enabled">
                                Web Search: {{ customizedTemplate.tools.webSearch.accessLevel }}
                                <span v-if="customizedTemplate.tools.webSearch.allowedDomains">
                                  ({{ customizedTemplate.tools.webSearch.allowedDomains }})
                                </span>
                              </li>
                              <li v-if="customizedTemplate.tools.memory.enabled">
                                Memory: {{ customizedTemplate.tools.memory.retention }} retention
                              </li>
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="currentStep = 7">Back</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn 
                    color="success" 
                    :loading="isSaving"
                    :disabled="validationErrors.length > 0 || isSaving"
                    @click="saveTemplate"
                  >
                    Save Agent
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>
          </v-stepper>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Result Dialog -->
    <v-dialog
      v-model="resultDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ saveSuccess ? 'Success!' : 'Error' }}
        </v-card-title>
        <v-card-text>
          <v-alert
            :type="saveSuccess ? 'success' : 'error'"
            text
            outlined
          >
            {{ resultMessage }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="handleResultClose"
          >
            {{ saveSuccess ? 'Continue' : 'Close' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import TemplateGallery from './TemplateGallery.vue';
import PersonalityTraitEditor from './PersonalityTraitEditor.vue';
import KnowledgeDomainEditor from './KnowledgeDomainEditor.vue';
import SystemPromptEditor from './SystemPromptEditor.vue';
import agentCustomizationService from '../../services/agent-customization-service';

export default {
  name: 'TemplateCustomizationWizard',
  components: {
    TemplateGallery,
    PersonalityTraitEditor,
    KnowledgeDomainEditor,
    SystemPromptEditor
  },
  data() {
    return {
      currentStep: 1,
      isMobile: window.innerWidth < 960,
      selectedTemplate: null,
      customizedTemplate: {
        name: '',
        description: '',
        category: '',
        avatarUrl: '',
        personalityTraits: [],
        personalityIntensity: 5,
        knowledgeDomains: [],
        systemPrompt: '',
        model: 'llama3-8b',
        temperature: 0.7,
        contextWindow: 8000,
        enableStreaming: true,
        tools: {
          filesystem: {
            enabled: false,
            accessLevel: 'full',
            rootPath: ''
          },
          webSearch: {
            enabled: false,
            accessLevel: 'full',
            allowedDomains: ''
          },
          memory: {
            enabled: true,
            retention: 'session'
          }
        }
      },
      availableTemplates: [],
      availableTraits: [],
      availableDomains: [],
      avatarFile: null,
      isSaving: false,
      validationErrors: [],
      resultDialog: false,
      saveSuccess: false,
      resultMessage: '',
      
      // Options for selects
      categoryOptions: [
        'Legal', 
        'Technical', 
        'Medical', 
        'Creative', 
        'Business', 
        'Education',
        'Customer Service'
      ],
      modelOptions: [
        { text: 'Llama 3 (8B)', value: 'llama3-8b' },
        { text: 'Llama 3 (70B)', value: 'llama3-70b' },
        { text: 'Mixtral (8x7B)', value: 'mixtral-8x7b' },
        { text: 'Claude 3 Opus', value: 'claude3-opus' },
        { text: 'Claude 3 Sonnet', value: 'claude3-sonnet' },
        { text: 'GPT-4', value: 'gpt-4' }
      ],
      filesystemAccessLevels: [
        { text: 'Full Access', value: 'full' },
        { text: 'Limited Access', value: 'limited' },
        { text: 'Read Only', value: 'readonly' }
      ],
      webSearchAccessLevels: [
        { text: 'Full Access', value: 'full' },
        { text: 'Limited Domains', value: 'limited' }
      ],
      memoryRetentionOptions: [
        { text: 'Session Only', value: 'session' },
        { text: '24 Hours', value: '24h' },
        { text: '7 Days', value: '7d' },
        { text: '30 Days', value: '30d' },
        { text: 'Permanent', value: 'permanent' }
      ]
    };
  },
  computed: {
    isBasicInfoValid() {
      return (
        this.customizedTemplate.name && 
        this.customizedTemplate.name.length <= 50 &&
        this.customizedTemplate.description && 
        this.customizedTemplate.description.length <= 1000 &&
        this.customizedTemplate.category
      );
    },
    
    authHeaders() {
      // Get auth token from localStorage or similar
      const token = localStorage.getItem('authToken');
      return {
        'Authorization': `Bearer ${token}`
      };
    }
  },
  watch: {
    // Responsive adjustments
    '$vuetify.breakpoint.mdAndDown'(value) {
      this.isMobile = value;
    }
  },
  created() {
    // Fetch data from API
    this.fetchTemplates();
    this.fetchPersonalityTraits();
    this.fetchKnowledgeDomains();
    
    // Add window resize listener
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // Remove window resize listener
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth < 960;
    },
    
    async fetchTemplates() {
      try {
        const response = await agentCustomizationService.getTemplates();
        this.availableTemplates = response.templates || [];
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    },
    
    async fetchPersonalityTraits() {
      try {
        const traits = await agentCustomizationService.getPersonalityTraits();
        this.availableTraits = traits;
      } catch (error) {
        console.error('Error fetching personality traits:', error);
      }
    },
    
    async fetchKnowledgeDomains() {
      try {
        const domains = await agentCustomizationService.getKnowledgeDomains();
        this.availableDomains = domains;
      } catch (error) {
        console.error('Error fetching knowledge domains:', error);
      }
    },
    
    selectTemplate(template) {
      this.selectedTemplate = template;
      
      // Initialize customized template with selected template values
      this.customizedTemplate = {
        name: `${template.name} (Custom)`,
        description: template.description,
        category: template.category,
        avatarUrl: template.avatarUrl,
        personalityTraits: [...template.personalityTraits.map(t => t._id)],
        personalityIntensity: template.personalityIntensity || 5,
        knowledgeDomains: [...template.knowledgeDomains],
        systemPrompt: template.systemPrompt,
        model: template.model || 'llama3-8b',
        temperature: template.temperature || 0.7,
        contextWindow: template.contextWindow || 8000,
        enableStreaming: template.enableStreaming !== false,
        tools: {
          filesystem: {
            enabled: template.tools?.filesystem?.enabled || false,
            accessLevel: template.tools?.filesystem?.accessLevel || 'full',
            rootPath: template.tools?.filesystem?.rootPath || ''
          },
          webSearch: {
            enabled: template.tools?.webSearch?.enabled || false,
            accessLevel: template.tools?.webSearch?.accessLevel || 'full',
            allowedDomains: template.tools?.webSearch?.allowedDomains || ''
          },
          memory: {
            enabled: template.tools?.memory?.enabled !== false,
            retention: template.tools?.memory?.retention || 'session'
          }
        }
      };
    },
    
    handleAvatarChange(file) {
      if (!file) {
        this.customizedTemplate.avatarUrl = '';
        return;
      }
      
      // In a real implementation, upload the file to a server
      // For now, just create an object URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.customizedTemplate.avatarUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    
    updateIntensity(value) {
      this.customizedTemplate.personalityIntensity = value;
    },
    
    getSelectedPersonalityTraits() {
      return this.availableTraits.filter(trait => 
        this.customizedTemplate.personalityTraits.includes(trait._id)
      );
    },
    
    validateTemplate() {
      const errors = [];
      
      // Basic information validation
      if (!this.customizedTemplate.name) {
        errors.push('Name is required');
      }
      
      if (!this.customizedTemplate.description) {
        errors.push('Description is required');
      }
      
      if (!this.customizedTemplate.category) {
        errors.push('Category is required');
      }
      
      // Personality traits validation
      if (this.customizedTemplate.personalityTraits.length === 0) {
        errors.push('At least one personality trait is required');
      }
      
      // Knowledge domains validation
      if (this.customizedTemplate.knowledgeDomains.length === 0) {
        errors.push('At least one knowledge domain is required');
      }
      
      // System prompt validation
      if (!this.customizedTemplate.systemPrompt) {
        errors.push('System prompt is required');
      }
      
      // Model configuration validation
      if (!this.customizedTemplate.model) {
        errors.push('Model selection is required');
      }
      
      // Tool configuration validation
      if (
        this.customizedTemplate.tools.filesystem.enabled && 
        this.customizedTemplate.tools.filesystem.accessLevel === 'limited' && 
        !this.customizedTemplate.tools.filesystem.rootPath
      ) {
        errors.push('Root path is required for limited filesystem access');
      }
      
      if (
        this.customizedTemplate.tools.webSearch.enabled && 
        this.customizedTemplate.tools.webSearch.accessLevel === 'limited' && 
        !this.customizedTemplate.tools.webSearch.allowedDomains
      ) {
        errors.push('Allowed domains are required for limited web search access');
      }
      
      this.validationErrors = errors;
      return errors.length === 0;
    },
    
    async saveTemplate() {
      if (!this.validateTemplate()) {
        return;
      }
      
      this.isSaving = true;
      
      try {
        // Prepare the payload
        const payload = {
          ...this.customizedTemplate,
          baseTemplateId: this.selectedTemplate._id
        };
        
        // Handle avatar upload if provided
        if (this.avatarFile) {
          try {
            const avatarUrl = await agentCustomizationService.uploadAvatar(this.avatarFile);
            payload.avatar = avatarUrl;
          } catch (uploadError) {
            console.error('Failed to upload avatar:', uploadError);
          }
        }
        
        // Send to the API
        const response = await agentCustomizationService.createAgent(payload);
        
        // Handle success
        this.saveSuccess = true;
        this.resultMessage = `Agent "${this.customizedTemplate.name}" was created successfully!`;
        this.resultDialog = true;
      } catch (error) {
        // Handle error
        console.error('Error saving agent:', error);
        this.saveSuccess = false;
        this.resultMessage = `Error creating agent: ${error.message}`;
        this.resultDialog = true;
      } finally {
        this.isSaving = false;
      }
    },
    
    handleResultClose() {
      this.resultDialog = false;
      if (this.saveSuccess) {
        // Reset wizard or navigate to agents list
        this.$router.push('/agents');
      }
    }
  }
};
</script>

<style scoped>
.avatar-preview {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
