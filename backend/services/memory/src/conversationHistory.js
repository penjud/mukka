const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ConversationHistory {
  constructor(storageDir = '/app/data/memory/conversations') {
    this.storageDir = storageDir;
    this.conversations = new Map();
    this.init();
  }

  init() {
    // Ensure storage directory exists
    fs.ensureDirSync(this.storageDir);
    this.loadConversations();
  }

  loadConversations() {
    try {
      const files = fs.readdirSync(this.storageDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const conversationId = path.basename(file, '.json');
          const conversationData = fs.readJSONSync(path.join(this.storageDir, file));
          this.conversations.set(conversationId, conversationData);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  saveConversation(conversationId) {
    try {
      const conversation = this.conversations.get(conversationId);
      if (conversation) {
        fs.writeJSONSync(
          path.join(this.storageDir, `${conversationId}.json`), 
          conversation
        );
      }
    } catch (error) {
      console.error(`Error saving conversation ${conversationId}:`, error);
    }
  }

  createConversation(title = 'New Conversation', metadata = {}) {
    const conversationId = uuidv4();
    const conversation = {
      id: conversationId,
      title,
      metadata,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.conversations.set(conversationId, conversation);
    this.saveConversation(conversationId);
    
    return conversation;
  }

  getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  getAllConversations() {
    return Array.from(this.conversations.values()).map(conv => ({
      id: conv.id,
      title: conv.title,
      messageCount: conv.messages.length,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      metadata: conv.metadata
    }));
  }

  addMessage(conversationId, message) {
    const conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const newMessage = {
      id: messageId,
      ...message,
      timestamp
    };
    
    conversation.messages.push(newMessage);
    conversation.updatedAt = timestamp;
    
    this.saveConversation(conversationId);
    
    return newMessage;
  }

  updateConversation(conversationId, updates) {
    const conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    const updatedConversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.conversations.set(conversationId, updatedConversation);
    this.saveConversation(conversationId);
    
    return updatedConversation;
  }

  deleteConversation(conversationId) {
    if (!this.conversations.has(conversationId)) {
      return false;
    }
    
    this.conversations.delete(conversationId);
    
    try {
      fs.removeSync(path.join(this.storageDir, `${conversationId}.json`));
      return true;
    } catch (error) {
      console.error(`Error deleting conversation ${conversationId}:`, error);
      return false;
    }
  }

  searchConversations(query) {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.conversations.values())
      .filter(conv => {
        // Search in title
        if (conv.title.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        // Search in messages
        return conv.messages.some(msg => 
          (msg.content && msg.content.toLowerCase().includes(lowerQuery)) ||
          (msg.role && msg.role.toLowerCase().includes(lowerQuery))
        );
      })
      .map(conv => ({
        id: conv.id,
        title: conv.title,
        messageCount: conv.messages.length,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        metadata: conv.metadata
      }));
  }
}

module.exports = ConversationHistory;