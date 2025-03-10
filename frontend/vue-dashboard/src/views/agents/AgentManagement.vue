<template>
  <div class="agent-management">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="text-h5 font-weight-bold d-flex justify-space-between align-center">
            <span>
              <v-icon start color="primary" class="me-2">mdi-robot</v-icon>
              Agent Management
            </span>
            
            <div>
              <v-btn color="secondary" class="me-2" prepend-icon="mdi-shape-outline" @click="showTemplatesDialog = true">
                From Template
              </v-btn>
              <v-btn color="success" class="me-2" prepend-icon="mdi-wizard-hat" @click="goToCustomizationWizard">
                Advanced Wizard
              </v-btn>
              <v-btn color="primary" prepend-icon="mdi-plus" @click="editMode = false; showAgentDialog = true">
                Create Agent
              </v-btn>
            </div>
          </v-card-title>
          
          <v-card-subtitle class="text-body-1">
            Create and customize AI agents with different personalities and capabilities
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Debug Information Card -->
    <v-row v-if="debugInfo.length > 0">
      <v-col cols="12">
        <v-card color="info" class="mb-4">
          <v-card-title>Debug Information</v-card-title>
          <v-card-text>
            <pre>{{ debugInfo }}</pre>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="debugInfo = []">Clear</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Agent Grid -->
    <v-row>
      <v-col v-for="agent in agents" :key="agent._id" cols="12" sm="6" md="4" lg="3">
        <v-card class="agent-card">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar :color="agent.color || 'primary'" size="48">
                <img v-if="agent.avatar" :src="agent.avatar" alt="Agent Avatar" />
                <v-icon v-else color="white" size="24">mdi-robot</v-icon>
              </v-avatar>
            </template>
            
            <v-card-title>{{ agent.name }}</v-card-title>
            <v-card-subtitle>{{ formatDate(agent.updatedAt) }}</v-card-subtitle>
          </v-card-item>
          
          <v-card-text>
            <p class="text-body-2 text-truncate-2 mb-3">{{ agent.description }}</p>
            
            <v-chip-group>
              <v-chip
                v-for="(trait, index) in getTraitsArray(agent).slice(0, 3)"
                :key="index"
                size="small"
                :color="getTraitColor(trait)"
                label
              >
                {{ trait }}
              </v-chip>
              <v-chip v-if="getTraitsArray(agent).length > 3" size="small" variant="outlined">
                +{{ getTraitsArray(agent).length - 3 }} more
              </v-chip>
            </v-chip-group>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions>
            <v-btn
              variant="text"
              color="primary"
              @click="editAgent(agent)"
            >
              Edit
            </v-btn>
            
            <v-btn
              variant="text"
              @click="startChat(agent)"
            >
              Chat
            </v-btn>
            
            <v-spacer></v-spacer>
            
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
              </template>
              <v-list>
                <v-list-item @click="cloneAgent(agent)" prepend-icon="mdi-content-copy" title="Clone"></v-list-item>
                <v-list-item @click="exportAgent(agent)" prepend-icon="mdi-export" title="Export"></v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="deleteAgent(agent)" prepend-icon="mdi-delete" title="Delete" color="error"></v-list-item>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <!-- Empty state -->
      <v-col v-if="agents.length === 0" cols="12">
        <v-card class="pa-6 text-center">
          <v-icon size="64" color="primary" class="mb-4">mdi-robot-off</v-icon>
          <h3 class="text-h5 mb-2">No Agents Created Yet</h3>
          <p class="text-body-1 mb-6">Create your first AI agent by clicking the button below.</p>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="debugCreateAgent">
            Create Agent
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Create/Edit Agent Dialog -->
    <v-dialog v-model="showAgentDialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold">
          {{ editMode ? 'Edit Agent' : 'Create New Agent' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="agentForm">
            <v-row>
              <v-col cols="12" md="4" class="text-center">
                <!-- Avatar selection -->
                <v-avatar :color="agentFormData.color" size="120" class="mb-3">
                  <img v-if="agentFormData.avatar" :src="agentFormData.avatar" alt="Agent Avatar" />
                  <v-icon v-else color="white" size="48">mdi-robot</v-icon>
                </v-avatar>
                
                <v-file-input
                  v-model="avatarFile"
                  accept="image/*"
                  label="Upload Avatar"
                  prepend-icon="mdi-camera"
                  variant="outlined"
                  hide-details
                  class="mb-3"
                ></v-file-input>
                
                <!-- Color picker -->
                <label class="text-body-2 mb-1 d-block">Agent Color</label>
                <div class="color-picker d-flex flex-wrap justify-center mb-4">
                  <v-btn
                    v-for="color in availableColors"
                    :key="color"
                    :color="color"
                    icon
                    size="small"
                    class="ma-1"
                    :variant="agentFormData.color === color ? 'flat' : 'text'"
                    @click="agentFormData.color = color"
                  >
                    <v-icon v-if="agentFormData.color === color" color="white">mdi-check</v-icon>
                  </v-btn>
                </div>
              </v-col>
              
              <v-col cols="12" md="8">
                <!-- Agent details -->
                <v-text-field
                  v-model="agentFormData.name"
                  label="Agent Name"
                  :rules="[rules.required]"
                  variant="outlined"
                  class="mb-3"
                ></v-text-field>
                
                <v-textarea
                  v-model="agentFormData.description"
                  label="Description"
                  :rules="[rules.required]"
                  variant="outlined"
                  rows="2"
                  class="mb-3"
                ></v-textarea>
                
                <!-- Agent traits -->
                <label class="text-body-1 font-weight-bold mb-2 d-block">Personality Traits</label>
                <v-combobox
                  v-model="agentFormData.traits"
                  :items="availableTraits"
                  label="Add personality traits"
                  multiple
                  chips
                  closable-chips
                  variant="outlined"
                  class="mb-3"
                ></v-combobox>
                
                <!-- Model selection -->
                <v-select
                  v-model="agentFormData.model"
                  :items="availableModels"
                  label="Default Model"
                  variant="outlined"
                  class="mb-3"
                ></v-select>
                
                <!-- Knowledge fields -->
                <label class="text-body-1 font-weight-bold mb-2 d-block">Knowledge & Expertise</label>
                <v-combobox
                  v-model="agentFormData.expertise"
                  :items="availableExpertise"
                  label="Areas of expertise"
                  multiple
                  chips
                  closable-chips
                  variant="outlined"
                  class="mb-4"
                ></v-combobox>
                
                <!-- System prompt -->
                <v-textarea
                  v-model="agentFormData.systemPrompt"
                  label="System Prompt"
                  hint="Instructions that define the agent's behavior and knowledge"
                  variant="outlined"
                  rows="3"
                  class="mb-3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showAgentDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="debugSaveAgent">
            {{ editMode ? 'Update Agent' : 'Create Agent' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Delete Agent</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ selectedAgent?.name }}</strong>? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Templates Dialog -->
    <v-dialog v-model="showTemplatesDialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold">
          <v-icon start color="primary" class="me-2">mdi-shape-outline</v-icon>
          Choose a Template
        </v-card-title>
        
        <v-card-subtitle class="text-body-1">
          Create a new agent based on a pre-configured template
        </v-card-subtitle>
        
        <v-card-text>
          <v-row>
            <v-col v-for="template in templates" :key="template._id" cols="12" sm="6" md="4">
              <v-card class="h-100" :color="template.templateSettings?.featured ? 'primary' : undefined" :variant="template.templateSettings?.featured ? 'outlined' : 'elevated'" @click="createFromTemplate(template)">
                <v-card-item>
                  <template v-slot:prepend>
                    <v-avatar :color="template.color || 'primary'" size="48">
                      <img v-if="template.avatar" :src="template.avatar" alt="Template Avatar" />
                      <v-icon v-else color="white" size="24">mdi-shape-outline</v-icon>
                    </v-avatar>
                  </template>
                  <v-card-title>{{ template.name }}</v-card-title>
                  <v-card-subtitle>
                    {{ template.templateSettings?.category || 'General' }}
                    <v-chip v-if="template.templateSettings?.featured" size="small" color="primary" class="ms-2">Featured</v-chip>
                  </v-card-subtitle>
                </v-card-item>
                
                <v-card-text>
                  <p class="text-body-2 text-truncate-2 mb-3">{{ template.description }}</p>
                  
                  <v-chip-group>
                    <v-chip
                      v-for="(trait, index) in getTraitsArray(template).slice(0, 3)"
                      :key="index"
                      size="small"
                      :color="getTraitColor(trait)"
                      label
                    >
                      {{ trait }}
                    </v-chip>
                  </v-chip-group>
                </v-card-text>
              </v-card>
            </v-col>
            
            <!-- Empty state -->
            <v-col v-if="templates.length === 0" cols="12">
              <v-card class="pa-6 text-center">
                <v-icon size="64" color="secondary" class="mb-4">mdi-shape-plus</v-icon>
                <h3 class="text-h5 mb-2">No Templates Available</h3>
                <p class="text-body-1 mb-6">There are no agent templates available yet.</p>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showTemplatesDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import mcpApi from '../../services/mcp-api';
import { serviceStore } from '../../services/discovery';
// Import the uuid library for client-side ID generation
import uuidHelper from '../../services/uuid-helper';

// Router
const router = useRouter();

// Navigation
function goToCustomizationWizard() {
  debugInfo.value.push('Navigating to customization wizard');
  router.push('/agents/customize');
}

// Component state
const agents = ref([]);
const templates = ref([]);
const showAgentDialog = ref(false);
const showDeleteDialog = ref(false);
const showCreateAgentDialog = ref(false); // Trigger for create dialog
const showTemplatesDialog = ref(false); // Dialog for template selection
const editMode = ref(false);
const selectedAgent = ref(null);
const selectedTemplate = ref(null);
const avatarFile = ref(null);
const agentFormRef = ref(null);
const debugInfo = ref([]); // Debug information

// Form data
const agentFormData = reactive({
  id: null,
  name: '',
  description: '',
  avatar: null,
  color: 'primary',
  traits: [],
  expertise: [],
  model: 'llama3',
  systemPrompt: ''
});

// Form validation
const rules = {
  required: value => !!value || 'This field is required'
};

// Available options
const availableColors = [
  'primary', 'secondary', 'success', 'info', 'warning', 'error',
  'purple', 'indigo', 'blue', 'cyan', 'teal', 'green', 'orange', 'deep-orange'
];

const availableModels = ref([
  { title: 'Llama 3', value: 'llama3.1:8b' },
  { title: 'Mistral', value: 'mistral:7b' },
  { title: 'Gemma 2', value: 'gemma2:9b' }
]);

// Load available models
async function loadModels() {
  try {
    debugInfo.value.push('Loading models from Ollama Bridge...');
    const response = await mcpApi.get('ollama', '/api/models');
    debugInfo.value.push(`Models response: ${JSON.stringify(response)}`);
    
    if (response.models && Array.isArray(response.models)) {
      availableModels.value = response.models.map(model => ({
        title: model.name,
        value: model.name
      }));
      debugInfo.value.push(`Loaded ${availableModels.value.length} models`);
    }
  } catch (error) {
    debugInfo.value.push(`Error loading models: ${error.message}`);
    console.error('Failed to load models:', error);
  }
}

const availableTraits = [
  'Friendly', 'Professional', 'Creative', 'Technical', 'Helpful',
  'Concise', 'Detailed', 'Enthusiastic', 'Formal', 'Informal',
  'Analytical', 'Empathetic', 'Humorous', 'Serious', 'Patient',
  'Proactive', 'Methodical', 'Adaptable'
];

const availableExpertise = [
  'Programming', 'Math', 'Science', 'Literature', 'History',
  'Business', 'Marketing', 'Design', 'Art', 'Music',
  'Health', 'Finance', 'Law', 'Education', 'Engineering'
];

// Watch for dialog changes
watch(() => showAgentDialog.value, (val) => {
  if (!val) {
    // Reset form when dialog closes
    resetForm();
  }
});

// Initialize component
onMounted(async () => {
  debugInfo.value.push('Component mounted');
  
  // Check the Auth service status
  try {
    const statusCheck = await mcpApi.get('auth', '/health');
    debugInfo.value.push(`Auth health check: ${JSON.stringify(statusCheck)}`);
  } catch (error) {
    debugInfo.value.push(`Error checking Auth health: ${error.message}`);
  }
  
  // Load models first
  await loadModels();
  
  // Then load agents and templates
  await Promise.all([
    loadAgents(),
    loadTemplates()
  ]);
});

// Watch for create dialog trigger
watch(() => showCreateAgentDialog.value, (val) => {
  if (val) {
    // Open dialog in create mode
    debugInfo.value.push('Opening create agent dialog');
    editMode.value = false;
    resetForm();
    showAgentDialog.value = true;
    showCreateAgentDialog.value = false;
  }
});

// Load agent templates
async function loadTemplates() {
  try {
    debugInfo.value.push('Loading templates from Auth service...');
    const response = await mcpApi.get('auth', '/agents/templates');
    debugInfo.value.push(`Templates response: ${JSON.stringify(response)}`);
    templates.value = response.templates || [];
  } catch (error) {
    debugInfo.value.push(`Error loading templates: ${error.message}`);
    console.error('Failed to load templates:', error);
    
    // Add sample templates if API fails (for development)
    if (templates.value.length === 0) {
      templates.value = [
        {
          _id: 'template-1',
          name: 'Technical Assistant',
          description: 'A template for technical help and code assistance',
          avatar: null,
          color: 'blue',
          personalityTraits: ['Technical', 'Helpful', 'Precise'],
          knowledgeDomains: [
            { domain: 'Programming', level: 0.9 },
            { domain: 'Computer Science', level: 0.8 }
          ],
          llmConfig: {
            model: 'llama3:8b',
            temperature: 0.5
          },
          systemPrompt: 'You are a technical assistant, focused on providing accurate and helpful information about programming and technology.',
          templateSettings: {
            isTemplate: true,
            category: 'Technical',
            featured: true
          },
          accessControl: {
            isPublic: true
          }
        },
        {
          _id: 'template-2',
          name: 'Creative Writer',
          description: 'A template for creative writing and storytelling',
          avatar: null,
          color: 'purple',
          personalityTraits: ['Creative', 'Enthusiastic', 'Detailed'],
          knowledgeDomains: [
            { domain: 'Literature', level: 0.9 },
            { domain: 'Storytelling', level: 0.9 }
          ],
          llmConfig: {
            model: 'mistral:7b',
            temperature: 0.8
          },
          systemPrompt: 'You are a creative writing assistant, focused on helping with storytelling, character development, and creative expression.',
          templateSettings: {
            isTemplate: true,
            category: 'Creative',
            featured: true
          },
          accessControl: {
            isPublic: true
          }
        }
      ];
    }
  }
}

// Load all agents from the server
async function loadAgents() {
  try {
    debugInfo.value.push('Loading agents from Auth service...');
    const response = await mcpApi.get('auth', '/agents');
    debugInfo.value.push(`Agents response: ${JSON.stringify(response)}`);
    agents.value = response.profiles || [];
  } catch (error) {
    debugInfo.value.push(`Error loading agents: ${error.message}`);
    console.error('Failed to load agents:', error);
    
    // Add some sample agents if API fails (for development)
    if (agents.value.length === 0) {
      agents.value = [
        {
          _id: 'sample-1',
          name: 'Research Assistant',
          description: 'Helps you research topics and summarize information',
          avatar: null,
          color: 'blue',
          personalityTraits: ['Analytical', 'Detailed', 'Helpful'],
          knowledgeDomains: [
            { domain: 'Research', level: 0.8 },
            { domain: 'Writing', level: 0.7 }
          ],
          llmConfig: {
            model: 'llama3:8b',
            temperature: 0.7,
            maxTokens: 1024
          },
          systemPrompt: 'You are a research assistant, focused on finding accurate information and presenting it clearly.',
          templateSettings: {
            isTemplate: false
          },
          accessControl: {
            isPublic: false,
            allowEditing: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'sample-2',
          name: 'Coding Helper',
          description: 'Assists with programming and technical problems',
          avatar: null,
          color: 'green',
          personalityTraits: ['Technical', 'Precise', 'Patient'],
          knowledgeDomains: [
            { domain: 'Programming', level: 0.9 },
            { domain: 'Debugging', level: 0.8 }
          ],
          llmConfig: {
            model: 'mistral:7b',
            temperature: 0.5,
            maxTokens: 2048
          },
          systemPrompt: 'You are a coding assistant, focused on helping with programming tasks and explaining technical concepts clearly.',
          templateSettings: {
            isTemplate: false
          },
          accessControl: {
            isPublic: false,
            allowEditing: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  }
}

// Debug function for the Create Agent button
function debugCreateAgent() {
  debugInfo.value.push('Create Agent button clicked');
  showCreateAgentDialog.value = true;
}

// Save agent function
async function debugSaveAgent() {
  debugInfo.value.push('Save Agent button clicked');
  debugInfo.value.push(`Form data: ${JSON.stringify(agentFormData)}`);
  
  try {
    debugInfo.value.push('Checking Auth service status...');
    const service = serviceStore.services['auth'];
    debugInfo.value.push(`Auth service status: ${JSON.stringify(service)}`);
    
    if (!service || !service.status) {
      debugInfo.value.push('Auth service is not available');
      throw new Error('Auth service is not available');
    }
    
    let response;
    
    // Handle avatar upload if provided
    if (avatarFile.value) {
      debugInfo.value.push('Avatar file provided, uploading it now');
      try {
        debugInfo.value.push('Using filesystem service for avatar upload');
        
        // Create a FormData object for the file upload
        const formData = new FormData();
        formData.append('avatar', avatarFile.value);
        
        // Get filesystem service endpoint
        const filesystemService = serviceStore.services['filesystem'];
        if (!filesystemService || !filesystemService.status) {
          throw new Error('Filesystem service not available');
        }
        
        // Upload the file to the filesystem MCP service
        const uploadUrl = filesystemService.endpoint + '/uploads/avatar';
        debugInfo.value.push(`Uploading avatar to ${uploadUrl}`);
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        debugInfo.value.push(`Avatar upload successful: ${JSON.stringify(uploadResult)}`);
        
        // Set the avatar path to the uploaded file URL
        // The URL should be relative to the filesystem service
        const avatarUrl = filesystemService.endpoint + uploadResult.filePath;
        debugInfo.value.push(`Setting avatar URL to: ${avatarUrl}`);
        agentFormData.avatar = avatarUrl;
      } catch (uploadError) {
        debugInfo.value.push(`Avatar upload error: ${uploadError.message}`);
        console.error('Failed to upload avatar:', uploadError);
        // Generate a unique placeholder to avoid caching issues
        agentFormData.avatar = '/avatars/agent-' + Date.now() + '.jpg';
        debugInfo.value.push(`Falling back to placeholder: ${agentFormData.avatar}`);
      }
    }
    
    // Convert form data to agent profile format
    const agentProfile = {
      name: agentFormData.name,
      description: agentFormData.description,
      avatar: agentFormData.avatar,
      personalityTraits: agentFormData.traits.map(trait => trait),
      personalityIntensity: 0.7,
      knowledgeDomains: agentFormData.expertise.map(expertise => ({
        domain: expertise,
        level: 0.8
      })),
      llmConfig: {
        model: agentFormData.model,
        temperature: 0.7,
        maxTokens: 1024
      },
      systemPrompt: agentFormData.systemPrompt,
      toolAccess: {
        filesystem: true,
        webSearch: true,
        memory: true
      },
      ragSettings: {
        enabled: true,
        retrievalDepth: 3
      }
    };
    
    // Add color field which is not part of the schema but used by UI
    agentProfile.color = agentFormData.color;
    
    debugInfo.value.push(`Converted agent profile: ${JSON.stringify(agentProfile)}`);
    
    // Create or update agent
    if (editMode.value) {
      debugInfo.value.push(`Updating agent ${agentFormData.id}...`);
      response = await mcpApi.put('auth', `/agents/${agentFormData.id}`, agentProfile);
      debugInfo.value.push(`Update response: ${JSON.stringify(response)}`);
      
      // Update local agent list
      const index = agents.value.findIndex(a => a._id === agentFormData.id);
      if (index !== -1 && response.success) {
        agents.value[index] = { ...response.profile };
      }
    } else {
      debugInfo.value.push('Creating new agent...');
      response = await mcpApi.post('auth', '/agents', agentProfile);
      debugInfo.value.push(`Create response: ${JSON.stringify(response)}`);
      
      // Add to local agent list if successful
      if (response.success) {
        agents.value.push(response.profile);
      }
    }
    
    // Close dialog
    showAgentDialog.value = false;
  } catch (error) {
    debugInfo.value.push(`Error saving agent: ${error.message}`);
    console.error('Failed to save agent:', error);
  }
}

// Start a chat with a specific agent
function startChat(agent) {
  debugInfo.value.push(`Starting chat with agent ${agent._id}`);
  // Create a new conversation with this agent
  createConversationWithAgent(agent);
}

// Create a new conversation with an agent
async function createConversationWithAgent(agent) {
  try {
    debugInfo.value.push(`Creating conversation with agent ${agent._id}...`);
    
    // Generate a client-side ID for the conversation using our helper
    const conversationId = uuidHelper.generateUuid();
    debugInfo.value.push(`Generated client-side UUID for conversation: ${conversationId}`);
    
    // Create the conversation payload
    const conversationPayload = {
      id: conversationId,
      title: `Chat with ${agent.name}`,
      agentId: agent._id,
      metadata: {
        agentId: agent._id,
        agentName: agent.name,
        agentModel: agent.llmConfig?.model || 'llama3',
        systemPrompt: agent.systemPrompt
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    
    debugInfo.value.push(`Conversation payload: ${JSON.stringify(conversationPayload)}`);
    
    // Create conversation on the server
    const response = await mcpApi.post('memory', '/conversations', conversationPayload);
    debugInfo.value.push(`Conversation created: ${JSON.stringify(response)}`);
    
    // If the agent has a conversations array, add this conversation to it
    if (!agent.conversations) {
      agent.conversations = [];
    }
    
    if (!agent.conversations.includes(conversationId)) {
      agent.conversations.push(conversationId);
      debugInfo.value.push(`Updated agent conversations: ${JSON.stringify(agent.conversations)}`);
    }
    
    // Navigate to the chat
    router.push({
      name: 'PersonalWorkspace',
      query: { conversation: conversationId }
    });
  } catch (error) {
    debugInfo.value.push(`Error creating conversation: ${error.message}`);
    console.error('Failed to create conversation:', error);
  }
}

// Edit an existing agent
function editAgent(agent) {
  debugInfo.value.push(`Editing agent ${agent._id}`);
  // Set edit mode
  editMode.value = true;
  selectedAgent.value = agent;
  
  // Populate form with agent data
  agentFormData.id = agent._id;
  agentFormData.name = agent.name;
  agentFormData.description = agent.description;
  agentFormData.avatar = agent.avatar;
  agentFormData.color = agent.color || 'primary';
  
  // Map personality traits array to traits form field
  if (agent.personalityTraits && Array.isArray(agent.personalityTraits)) {
    agentFormData.traits = agent.personalityTraits.map(t => typeof t === 'object' ? t.name : t);
  } else {
    agentFormData.traits = [];
  }
  
  // Map knowledge domains to expertise form field
  if (agent.knowledgeDomains && Array.isArray(agent.knowledgeDomains)) {
    agentFormData.expertise = agent.knowledgeDomains.map(d => {
      return typeof d === 'object' ? (d.domain.name || d.domain) : d;
    });
  } else {
    agentFormData.expertise = [];
  }
  
  // Set model and system prompt
  agentFormData.model = agent.llmConfig?.model || 'llama3';
  agentFormData.systemPrompt = agent.systemPrompt || 'You are a helpful AI assistant.';
  
  // Show dialog
  showAgentDialog.value = true;
}

// Create an agent from a template
async function createFromTemplate(template) {
  debugInfo.value.push(`Creating agent from template ${template._id}`);
  try {
    const customizations = {
      name: `My ${template.name}`,
      description: template.description
    };
    
    // Call the API to create from template
    const response = await mcpApi.post('auth', '/agents/from-template', {
      templateId: template._id,
      customizations: customizations
    });
    
    debugInfo.value.push(`Template creation response: ${JSON.stringify(response)}`);
    
    // If successful, add to local list
    if (response.success) {
      agents.value.push(response.profile);
      debugInfo.value.push('Agent created from template successfully');
    } else {
      debugInfo.value.push(`Failed to create from template: ${response.errors.join(', ')}`);
    }
  } catch (error) {
    debugInfo.value.push(`Error creating from template: ${error.message}`);
    console.error('Failed to create from template:', error);
  }
}

// Clone an existing agent
function cloneAgent(agent) {
  debugInfo.value.push(`Cloning agent ${agent._id}`);
  
  // Set form data for a new agent based on the existing one
  editMode.value = false;
  agentFormData.id = null;
  agentFormData.name = `${agent.name} (Copy)`;
  agentFormData.description = agent.description;
  agentFormData.avatar = agent.avatar;
  agentFormData.color = agent.color || 'primary';
  
  // Map personality traits
  if (agent.personalityTraits && Array.isArray(agent.personalityTraits)) {
    agentFormData.traits = agent.personalityTraits.map(t => typeof t === 'object' ? t.name : t);
  } else {
    agentFormData.traits = [];
  }
  
  // Map knowledge domains
  if (agent.knowledgeDomains && Array.isArray(agent.knowledgeDomains)) {
    agentFormData.expertise = agent.knowledgeDomains.map(d => {
      return typeof d === 'object' ? (d.domain.name || d.domain) : d;
    });
  } else {
    agentFormData.expertise = [];
  }
  
  // Set model and system prompt
  agentFormData.model = agent.llmConfig?.model || 'llama3';
  agentFormData.systemPrompt = agent.systemPrompt || 'You are a helpful AI assistant.';
  
  // Show dialog
  showAgentDialog.value = true;
}

// Export agent configuration
function exportAgent(agent) {
  debugInfo.value.push(`Exporting agent ${agent._id}`);
  // Create JSON export - clean up MongoDB specific fields
  const exportData = JSON.stringify({
    name: agent.name,
    description: agent.description,
    avatar: agent.avatar,
    personalityTraits: agent.personalityTraits,
    personalityIntensity: agent.personalityIntensity,
    knowledgeDomains: agent.knowledgeDomains,
    llmConfig: agent.llmConfig,
    systemPrompt: agent.systemPrompt,
    toolAccess: agent.toolAccess,
    ragSettings: agent.ragSettings,
    templateSettings: {
      isTemplate: false
    }
  }, null, 2);
  
  // Create a download link
  const blob = new Blob([exportData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${agent.name.replace(/\s+/g, '_')}_agent.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Delete an agent
function deleteAgent(agent) {
  debugInfo.value.push(`Delete button clicked for agent ${agent._id}`);
  selectedAgent.value = agent;
  showDeleteDialog.value = true;
}

// Confirm agent deletion
async function confirmDelete() {
  if (!selectedAgent.value) return;
  
  try {
    debugInfo.value.push(`Confirming deletion of agent ${selectedAgent.value._id}...`);
    const response = await mcpApi.delete('auth', `/agents/${selectedAgent.value._id}`);
    debugInfo.value.push(`Delete response: ${JSON.stringify(response)}`);
    
    if (response.success) {
      debugInfo.value.push('Agent deleted successfully');
      
      // Remove from local list
      agents.value = agents.value.filter(a => a._id !== selectedAgent.value._id);
      
      // Close dialog
      showDeleteDialog.value = false;
      selectedAgent.value = null;
    } else {
      debugInfo.value.push(`Failed to delete agent: ${response.errors.join(', ')}`);
    }
  } catch (error) {
    debugInfo.value.push(`Error deleting agent: ${error.message}`);
    console.error('Failed to delete agent:', error);
  }
}

// Helper function to get traits array from agent (handles both old and new formats)
function getTraitsArray(agent) {
  // Handle new format with personalityTraits field
  if (agent.personalityTraits && Array.isArray(agent.personalityTraits)) {
    return agent.personalityTraits.map(t => typeof t === 'object' ? t.name : t);
  }
  
  // Handle old format with traits field
  if (agent.traits && Array.isArray(agent.traits)) {
    return agent.traits;
  }
  
  // Default to empty array
  return [];
}

// Reset form to default values
function resetForm() {
  debugInfo.value.push('Resetting form');
  agentFormData.id = null;
  agentFormData.name = '';
  agentFormData.description = '';
  agentFormData.avatar = null;
  agentFormData.color = 'primary';
  agentFormData.traits = [];
  agentFormData.expertise = [];
  agentFormData.model = 'llama3';
  agentFormData.systemPrompt = 'You are a helpful AI assistant.';
  avatarFile.value = null;
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Get color for trait chips
function getTraitColor(trait) {
  // Map traits to colors
  const traitColors = {
    'Friendly': 'success',
    'Professional': 'primary',
    'Creative': 'purple',
    'Technical': 'blue',
    'Helpful': 'teal',
    'Concise': 'cyan',
    'Detailed': 'indigo',
    'Enthusiastic': 'orange',
    'Formal': 'blue-grey',
    'Informal': 'amber',
    'Analytical': 'blue',
    'Empathetic': 'pink',
    'Humorous': 'deep-orange',
    'Serious': 'grey'
  };
  
  return traitColors[trait] || 'secondary';
}
</script>

<style scoped>
.agent-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.agent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
