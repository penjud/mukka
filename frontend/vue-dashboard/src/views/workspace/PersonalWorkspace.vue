<template>
  <div class="personal-workspace">
    <v-row>
      <v-col cols="12" md="3">
        <!-- Sidebar with conversation history -->
        <v-card class="conversation-sidebar" height="calc(100vh - 160px)">
          <v-card-title class="d-flex justify-space-between align-center py-3">
            <span>Conversations</span>
            <v-btn
              color="primary"
              variant="text"
              size="small"
              @click="startNewConversation"
              prepend-icon="mdi-plus"
            >
              New Chat
            </v-btn>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-list nav density="compact" class="conversation-list">
            <v-list-item
              v-for="conversation in conversations"
              :key="conversation.id"
              :active="conversation.id === activeConversation.id"
              @click="selectConversation(conversation)"
              :title="conversation.title"
              :subtitle="formatDate(conversation.updatedAt)"
              lines="two"
            >
              <template v-slot:prepend>
                <v-avatar size="32" :color="getAgentColor(conversation.agent)">
                  <v-icon v-if="!conversation.agent.avatar" color="white" size="small">
                    mdi-robot
                  </v-icon>
                  <img v-else :src="conversation.agent.avatar" alt="Agent Avatar" />
                </v-avatar>
              </template>
              
              <template v-slot:append>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" density="compact"></v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="renameConversation(conversation)" prepend-icon="mdi-pencil" title="Rename"></v-list-item>
                    <v-list-item @click="deleteConversation(conversation)" prepend-icon="mdi-delete" title="Delete"></v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-list-item>
            
            <v-list-item v-if="conversations.length === 0" class="text-center pa-4">
              <p class="text-body-2 text-medium-emphasis">No conversations yet</p>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="9">
        <!-- Main chat area -->
        <v-card class="chat-container" height="calc(100vh - 160px)">
          <v-card-title class="chat-header d-flex justify-space-between align-center py-3">
            <div class="d-flex align-center">
              <v-avatar size="32" :color="getAgentColor(activeConversation.agent)" class="mr-2">
                <v-icon v-if="!activeConversation.agent?.avatar" color="white" size="small">
                  mdi-robot
                </v-icon>
                <img v-else :src="activeConversation.agent.avatar" alt="Agent Avatar" />
              </v-avatar>
              
              <span>{{ activeConversation.title || 'New Conversation' }}</span>
            </div>
            
            <div>
              <v-select
                v-model="selectedModel"
                :items="availableModels"
                label="Model"
                density="compact"
                variant="outlined"
                hide-details
                class="model-select"
                style="width: 150px;"
              ></v-select>
            </div>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <!-- Chat messages -->
          <div class="chat-messages pa-4" ref="messagesContainer">
            <template v-if="messages.length > 0">
              <div
                v-for="(message, index) in messages"
                :key="index"
                class="message mb-4"
                :class="{ 'user-message': message.role === 'user', 'agent-message': message.role === 'assistant' }"
              >
                <div class="message-avatar">
                  <v-avatar size="36" :color="message.role === 'user' ? 'primary' : getAgentColor(activeConversation.agent)">
                    <v-icon v-if="message.role === 'user'" color="white" size="small">mdi-account</v-icon>
                    <v-icon v-else-if="!activeConversation.agent?.avatar" color="white" size="small">mdi-robot</v-icon>
                    <img v-else :src="activeConversation.agent.avatar" alt="Agent Avatar" />
                  </v-avatar>
                </div>
                
                <div class="message-content">
                  <div class="message-author">
                    {{ message.role === 'user' ? 'You' : (activeConversation.agent?.name || 'AI Assistant') }}
                  </div>
                  <div class="message-text" v-html="formatMessage(message.content)"></div>
                  <div class="message-time text-caption text-medium-emphasis">
                    {{ formatTime(message.timestamp) }}
                  </div>
                </div>
              </div>
            </template>
            
            <div v-else class="empty-conversation d-flex flex-column align-center justify-center">
              <v-icon size="64" color="primary" class="mb-4">mdi-robot</v-icon>
              <h3 class="text-h6 mb-2">Start a conversation</h3>
              <p class="text-body-2 text-medium-emphasis text-center">
                Send a message below to start chatting with the AI assistant.
              </p>
            </div>
            
            <div v-if="isTyping" class="typing-indicator d-flex align-center mt-2">
              <v-avatar size="36" :color="getAgentColor(activeConversation.agent)" class="mr-2">
                <v-icon v-if="!activeConversation.agent?.avatar" color="white" size="small">mdi-robot</v-icon>
                <img v-else :src="activeConversation.agent.avatar" alt="Agent Avatar" />
              </v-avatar>
              <span class="typing-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </span>
            </div>
          </div>
          
          <!-- Chat input -->
          <div class="chat-input pa-4">
            <v-form @submit.prevent="sendMessage">
              <v-textarea
                v-model="userInput"
                label="Type your message..."
                rows="2"
                auto-grow
                variant="outlined"
                hide-details
                @keydown.enter.prevent="sendMessage"
                :disabled="isTyping"
              ></v-textarea>
              
              <div class="d-flex justify-end mt-2">
                <v-btn
                  color="primary"
                  @click="sendMessage"
                  :disabled="!userInput.trim() || isTyping"
                >
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </div>
            </v-form>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useAuthStore } from '../../stores/auth';
import mcpApi from '../../services/mcp-api';

// State
const userInput = ref('');
const messages = ref([]);
const conversations = ref([]);
const isTyping = ref(false);
const messagesContainer = ref(null);
const selectedModel = ref('llama3');

// Active conversation
const activeConversation = reactive({
  id: null,
  title: 'New Conversation',
  agent: {
    id: null,
    name: 'AI Assistant',
    avatar: null,
    color: 'primary'
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// Available models - will be populated from API
const availableModels = ref([]);

// Load available models from Ollama Bridge
async function loadModels() {
  try {
    const response = await mcpApi.get('ollama', '/api/models');
    if (response.models && Array.isArray(response.models)) {
      availableModels.value = response.models.map(model => ({
        title: model.name,
        value: model.name
      }));
      
      // Set default model if available
      if (availableModels.value.length > 0) {
        selectedModel.value = availableModels.value[0].value;
      }
    }
  } catch (error) {
    console.error('Failed to load models:', error);
    // Fallback to default models if API fails
    availableModels.value = [
      { title: 'Llama 3', value: 'llama3.1:8b' },
      { title: 'Mistral', value: 'mistral:7b' },
      { title: 'Gemma 2', value: 'gemma2:9b' }
    ];
    selectedModel.value = 'llama3.1:8b';
  }
}

// Auth store for user info
const authStore = useAuthStore();

// Initialize workspace
onMounted(async () => {
  // Load models first
  await loadModels();
  
  // Then load conversations
  await loadConversations();
  
  // If there are conversations, select the most recent
  if (conversations.value.length > 0) {
    selectConversation(conversations.value[0]);
  } else {
    // Otherwise, start with an empty conversation
    startNewConversation();
  }
});

// Watch for changes in messages to scroll to bottom
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// Load conversations from the server
async function loadConversations() {
  try {
    const response = await mcpApi.get('memory', '/api/conversations');
    
    if (response && Array.isArray(response)) {
      conversations.value = response.map(conv => ({
        id: conv.id,
        title: conv.title || 'Untitled Conversation',
        agent: conv.agent || {
          id: null,
          name: 'AI Assistant',
          avatar: null,
          color: 'primary'
        },
        createdAt: conv.createdAt || new Date(),
        updatedAt: conv.updatedAt || new Date()
      }));
    } else {
      conversations.value = [];
    }
  } catch (error) {
    console.error('Failed to load conversations:', error);
    conversations.value = [];
  }
}

// Load messages for a conversation
async function loadMessages(conversationId) {
  try {
    const response = await mcpApi.get('memory', `/api/conversations/${conversationId}/messages`);
    
    if (response && Array.isArray(response)) {
      messages.value = response.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt || new Date()
      }));
    } else {
      messages.value = [];
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
    messages.value = [];
  }
}

// Select a conversation
function selectConversation(conversation) {
  // Update active conversation
  activeConversation.id = conversation.id;
  activeConversation.title = conversation.title;
  activeConversation.agent = conversation.agent;
  activeConversation.createdAt = conversation.createdAt;
  activeConversation.updatedAt = conversation.updatedAt;
  
  // Load messages for this conversation
  loadMessages(conversation.id);
}

// Start a new conversation
async function startNewConversation() {
  try {
    // Create a new conversation on the server
    const response = await mcpApi.post('memory', '/api/conversations', {
      title: 'New Conversation',
      agentId: null // Default agent
    });
    
    // Add to local list and select it
    const newConversation = {
      id: response.id,
      title: 'New Conversation',
      agent: {
        id: null,
        name: 'AI Assistant',
        avatar: null,
        color: 'primary'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    conversations.value.unshift(newConversation);
    selectConversation(newConversation);
    
    // Clear messages
    messages.value = [];
  } catch (error) {
    console.error('Failed to create new conversation:', error);
  }
}

// Rename a conversation
async function renameConversation(conversation) {
  // In a real app, would show a dialog to get the new name
  const newTitle = prompt('Enter a new name for this conversation:', conversation.title);
  
  if (newTitle && newTitle.trim() !== '') {
    try {
      await mcpApi.put('memory', `/api/conversations/${conversation.id}`, {
        title: newTitle
      });
      
      // Update local state
      conversation.title = newTitle;
      
      // Update active conversation if this is the active one
      if (activeConversation.id === conversation.id) {
        activeConversation.title = newTitle;
      }
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  }
}

// Delete a conversation
async function deleteConversation(conversation) {
  // In a real app, would show a confirmation dialog
  const confirm = window.confirm('Are you sure you want to delete this conversation?');
  
  if (confirm) {
    try {
      await mcpApi.delete('memory', `/api/conversations/${conversation.id}`);
      
      // Remove from local list
      conversations.value = conversations.value.filter(c => c.id !== conversation.id);
      
      // If this was the active conversation, select another one or create a new one
      if (activeConversation.id === conversation.id) {
        if (conversations.value.length > 0) {
          selectConversation(conversations.value[0]);
        } else {
          startNewConversation();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }
}

// Send a message
async function sendMessage() {
  const messageText = userInput.value.trim();
  if (!messageText || isTyping.value) return;
  
  // Add user message to the UI
  const userMessage = {
    role: 'user',
    content: messageText,
    timestamp: new Date()
  };
  
  messages.value.push(userMessage);
  userInput.value = '';
  
  // Save message to the server
  try {
    await mcpApi.post('memory', `/api/conversations/${activeConversation.id}/messages`, {
      role: 'user',
      content: messageText
    });
    
    // Set typing indicator
    isTyping.value = true;
    
    // Send to Ollama for response
    const response = await mcpApi.post('ollama', '/api/chat', {
      model: selectedModel.value,
      messages: [{ role: 'user', content: messageText }],
      stream: false
    });
    
    // Add AI response to the UI
    const assistantMessage = {
      role: 'assistant',
      content: response.message?.content || 'I apologize, but I encountered an issue processing your request.',
      timestamp: new Date()
    };
    
    messages.value.push(assistantMessage);
    
    // Save assistant message to the server
    await mcpApi.post('memory', `/api/conversations/${activeConversation.id}/messages`, {
      role: 'assistant',
      content: assistantMessage.content
    });
    
    // Update conversation title if this is the first message
    if (messages.value.length <= 2 && activeConversation.title === 'New Conversation') {
      // Generate a title based on the content (in a real app, could use AI to create a better title)
      const newTitle = messageText.substring(0, 30) + (messageText.length > 30 ? '...' : '');
      renameConversation({ ...activeConversation, title: newTitle });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Add error message
    messages.value.push({
      role: 'assistant',
      content: 'I apologize, but I encountered an error processing your request. Please try again later.',
      timestamp: new Date()
    });
  } finally {
    // Turn off typing indicator
    isTyping.value = false;
  }
}

// Helper Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  // If today, show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If this year, show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  // Otherwise show full date
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMessage(content) {
  // Simple implementation - a real app would use a markdown parser
  // or sanitize HTML properly
  return content.replace(/\n/g, '<br>');
}

function getAgentColor(agent) {
  // Return agent color or default color
  return agent?.color || 'secondary';
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.conversation-sidebar {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.conversation-list {
  overflow-y: auto;
  flex-grow: 1;
}

.chat-messages {
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.empty-conversation {
  height: 100%;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message-content {
  flex-grow: 1;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  position: relative;
  max-width: calc(100% - 60px);
}

.user-message .message-content {
  background-color: #e3f2fd;
}

.message-author {
  font-weight: bold;
  margin-bottom: 4px;
}

.message-time {
  margin-top: 4px;
}

.chat-input {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.typing-indicator {
  margin-top: 8px;
}

.typing-dots {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #bdbdbd;
  margin-right: 3px;
  animation: dotPulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
