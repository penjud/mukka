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
            
            <v-btn color="primary" prepend-icon="mdi-plus" @click="debugCreateAgent">
              Create Agent
            </v-btn>
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
      <v-col v-for="agent in agents" :key="agent.id" cols="12" sm="6" md="4" lg="3">
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
                v-for="(trait, index) in agent.traits.slice(0, 3)"
                :key="index"
                size="small"
                :color="getTraitColor(trait)"
                label
              >
                {{ trait }}
              </v-chip>
              <v-chip v-if="agent.traits.length > 3" size="small" variant="outlined">
                +{{ agent.traits.length - 3 }} more
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import mcpApi from '../../services/mcp-api';
import { serviceStore } from '../../services/discovery';
// Import the uuid library for client-side ID generation
import { v4 as uuidv4 } from 'uuid';

// Router
const router = useRouter();

// Component state
const agents = ref([]);
const showAgentDialog = ref(false);
const showDeleteDialog = ref(false);
const showCreateAgentDialog = ref(false); // Trigger for create dialog
const editMode = ref(false);
const selectedAgent = ref(null);
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
  
  // Check the Memory MCP service status
  try {
    const statusCheck = await mcpApi.get('memory', '/health');
    debugInfo.value.push(`Memory MCP health check: ${JSON.stringify(statusCheck)}`);
  } catch (error) {
    debugInfo.value.push(`Error checking Memory MCP health: ${error.message}`);
  }
  
  // Load models first
  await loadModels();
  
  // Then load agents
  await loadAgents();
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

// Load all agents from the server
async function loadAgents() {
  try {
    debugInfo.value.push('Loading agents from Memory MCP...');
    const response = await mcpApi.get('memory', '/api/agents');
    debugInfo.value.push(`Agents response: ${JSON.stringify(response)}`);
    agents.value = response || [];
  } catch (error) {
    debugInfo.value.push(`Error loading agents: ${error.message}`);
    console.error('Failed to load agents:', error);
    
    // Add some sample agents if API fails (for development)
    if (agents.value.length === 0) {
      agents.value = [
        {
          id: 'sample-1',
          name: 'Research Assistant',
          description: 'Helps you research topics and summarize information',
          avatar: null,
          color: 'blue',
          traits: ['Analytical', 'Detailed', 'Helpful'],
          expertise: ['Research', 'Writing', 'Analysis'],
          model: 'llama3.1:8b',
          systemPrompt: 'You are a research assistant, focused on finding accurate information and presenting it clearly.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sample-2',
          name: 'Coding Helper',
          description: 'Assists with programming and technical problems',
          avatar: null,
          color: 'green',
          traits: ['Technical', 'Precise', 'Patient'],
          expertise: ['Programming', 'Debugging', 'Software Design'],
          model: 'mistral:7b',
          systemPrompt: 'You are a coding assistant, focused on helping with programming tasks and explaining technical concepts clearly.',
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

// Debug function for saving agent
async function debugSaveAgent() {
  debugInfo.value.push('Save Agent button clicked');
  debugInfo.value.push(`Form data: ${JSON.stringify(agentFormData)}`);
  
  try {
    debugInfo.value.push('Checking Memory MCP service status...');
    const service = serviceStore.services['memory'];
    debugInfo.value.push(`Memory service status: ${JSON.stringify(service)}`);
    
    if (!service || !service.status) {
      debugInfo.value.push('Memory MCP service is not available');
      throw new Error('Memory MCP service is not available');
    }
    
    let response;
    
    // Handle avatar upload if provided
    if (avatarFile.value) {
      debugInfo.value.push('Avatar file provided, would upload in production');
      // In a real implementation, this would upload the file to a server
      agentFormData.avatar = '/avatars/placeholder.jpg';
    }
    
    // Create or update agent
    if (editMode.value) {
      debugInfo.value.push(`Updating agent ${agentFormData.id}...`);
      const url = `/api/agents/${agentFormData.id}`;
      debugInfo.value.push(`PUT request to ${service.endpoint}${url}`);
      response = await mcpApi.put('memory', url, agentFormData);
      debugInfo.value.push(`Update response: ${JSON.stringify(response)}`);
      
      // Update local agent list
      const index = agents.value.findIndex(a => a.id === agentFormData.id);
      if (index !== -1) {
        agents.value[index] = { ...response };
      }
    } else {
      debugInfo.value.push('Creating new agent...');
      
      // Client-side UUID generation
      const agentId = uuidv4();
      debugInfo.value.push(`Generated client-side UUID: ${agentId}`);
      
      // Create a new agent payload with the generated ID
      const agentPayload = {
        ...agentFormData,
        id: agentId, // Use the client-generated UUID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      debugInfo.value.push(`Enhanced agent payload: ${JSON.stringify(agentPayload)}`);
      
      const url = '/api/agents';
      debugInfo.value.push(`POST request to ${service.endpoint}${url}`);
      
      // Make direct fetch call to debug
      try {
        const directResponse = await fetch(`${service.endpoint}${url}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentPayload)
        });
        
        const directResponseData = await directResponse.json();
        debugInfo.value.push(`Direct fetch response: ${JSON.stringify(directResponseData)}`);
        
        // Use our client-side generated agent data with ID regardless of server response
        response = agentPayload;
        debugInfo.value.push(`Using client-generated agent data: ${JSON.stringify(response)}`);
        
        // Add to local agent list
        agents.value.push(response);
      } catch (directError) {
        debugInfo.value.push(`Direct fetch error: ${directError.message}`);
        throw directError;
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
  debugInfo.value.push(`Starting chat with agent ${agent.id}`);
  // Create a new conversation with this agent
  createConversationWithAgent(agent);
}

// Create a new conversation with an agent
async function createConversationWithAgent(agent) {
  try {
    debugInfo.value.push(`Creating conversation with agent ${agent.id}...`);
    
    // Generate a client-side ID for the conversation for consistency
    const conversationId = uuidv4();
    debugInfo.value.push(`Generated client-side UUID for conversation: ${conversationId}`);
    
    // Create the conversation payload
    const conversationPayload = {
      id: conversationId,
      title: `Chat with ${agent.name}`,
      agentId: agent.id,
      metadata: {
        agentId: agent.id,
        agentName: agent.name
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
  debugInfo.value.push(`Editing agent ${agent.id}`);
  // Set edit mode
  editMode.value = true;
  selectedAgent.value = agent;
  
  // Populate form with agent data
  agentFormData.id = agent.id;
  agentFormData.name = agent.name;
  agentFormData.description = agent.description;
  agentFormData.avatar = agent.avatar;
  agentFormData.color = agent.color || 'primary';
  agentFormData.traits = [...agent.traits];
  agentFormData.expertise = [...agent.expertise];
  agentFormData.model = agent.model;
  agentFormData.systemPrompt = agent.systemPrompt;
  
  // Show dialog
  showAgentDialog.value = true;
}

// Clone an existing agent
function cloneAgent(agent) {
  debugInfo.value.push(`Cloning agent ${agent.id}`);
  // Create a copy of the agent
  const clonedAgent = { ...agent };
  delete clonedAgent.id;
  clonedAgent.name = `${agent.name} (Copy)`;
  
  // Set form data
  editMode.value = false;
  agentFormData.id = null;
  agentFormData.name = clonedAgent.name;
  agentFormData.description = clonedAgent.description;
  agentFormData.avatar = clonedAgent.avatar;
  agentFormData.color = clonedAgent.color || 'primary';
  agentFormData.traits = [...clonedAgent.traits];
  agentFormData.expertise = [...clonedAgent.expertise];
  agentFormData.model = clonedAgent.model;
  agentFormData.systemPrompt = clonedAgent.systemPrompt;
  
  // Show dialog
  showAgentDialog.value = true;
}

// Export agent configuration
function exportAgent(agent) {
  debugInfo.value.push(`Exporting agent ${agent.id}`);
  // Create JSON export
  const exportData = JSON.stringify(agent, null, 2);
  
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
  debugInfo.value.push(`Delete button clicked for agent ${agent.id}`);
  selectedAgent.value = agent;
  showDeleteDialog.value = true;
}

// Confirm agent deletion
async function confirmDelete() {
  if (!selectedAgent.value) return;
  
  try {
    debugInfo.value.push(`Confirming deletion of agent ${selectedAgent.value.id}...`);
    await mcpApi.delete('memory', `/api/agents/${selectedAgent.value.id}`);
    debugInfo.value.push('Agent deleted successfully');
    
    // Remove from local list
    agents.value = agents.value.filter(a => a.id !== selectedAgent.value.id);
    
    // Close dialog
    showDeleteDialog.value = false;
    selectedAgent.value = null;
  } catch (error) {
    debugInfo.value.push(`Error deleting agent: ${error.message}`);
    console.error('Failed to delete agent:', error);
  }
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
