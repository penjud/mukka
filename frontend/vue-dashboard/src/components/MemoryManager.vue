<template>
  <div class="memory-manager">
    <h2>Memory Manager</h2>
    
    <div class="control-panel">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search memory entries..."
          @input="debounceSearch"
        />
      </div>
      
      <button @click="createNewEntry" class="action-button create-button">
        <i class="mdi mdi-plus"></i> New Entry
      </button>
    </div>
    
    <div class="content-area">
      <div class="entry-list">
        <div 
          v-for="entry in memoryEntries" 
          :key="entry.id"
          class="memory-entry"
          :class="{ 'entry-selected': selectedEntry && selectedEntry.id === entry.id }"
          @click="selectEntry(entry)"
        >
          <div class="entry-header">
            <h3>{{ entry.name }}</h3>
            <span class="entry-type">{{ entry.entityType }}</span>
          </div>
          <p class="entry-preview">
            {{ getPreview(entry) }}
          </p>
        </div>
        
        <div v-if="memoryEntries.length === 0" class="empty-state">
          <p v-if="isLoading">Loading memory entries...</p>
          <p v-else-if="searchQuery">No results found for "{{ searchQuery }}"</p>
          <p v-else>No memory entries. Create your first entry with the "New Entry" button.</p>
        </div>
      </div>
      
      <div class="entry-detail" v-if="selectedEntry">
        <div class="detail-header">
          <input 
            type="text" 
            v-model="selectedEntry.name" 
            class="detail-name"
            @change="updateEntry"
          />
          
          <div class="entry-actions">
            <button @click="saveEntry" class="action-button save-button">
              <i class="mdi mdi-content-save"></i> Save
            </button>
            <button @click="deleteEntry" class="action-button delete-button">
              <i class="mdi mdi-delete"></i> Delete
            </button>
          </div>
        </div>
        
        <div class="entity-type">
          <label>Entity Type:</label>
          <input 
            type="text" 
            v-model="selectedEntry.entityType" 
            @change="updateEntry"
          />
        </div>
        
        <div class="observations">
          <h4>Observations</h4>
          <div 
            v-for="(observation, index) in selectedEntry.observations" 
            :key="index"
            class="observation-item"
          >
            <textarea 
              v-model="selectedEntry.observations[index]" 
              rows="3"
              @change="updateEntry"
            ></textarea>
            <button @click="removeObservation(index)" class="remove-button">
              <i class="mdi mdi-close"></i>
            </button>
          </div>
          
          <button @click="addObservation" class="action-button add-button">
            <i class="mdi mdi-plus"></i> Add Observation
          </button>
        </div>
        
        <div class="relations">
          <h4>Relations</h4>
          <div 
            v-for="(relation, index) in relations" 
            :key="index"
            class="relation-item"
          >
            <div class="relation-content">
              <span class="relation-from">{{ relation.from }}</span>
              <span class="relation-type">{{ relation.relationType }}</span>
              <span class="relation-to">{{ relation.to }}</span>
            </div>
            <button @click="removeRelation(index)" class="remove-button">
              <i class="mdi mdi-close"></i>
            </button>
          </div>
          
          <div class="add-relation">
            <input 
              type="text" 
              v-model="newRelation.from" 
              placeholder="From"
              class="relation-input"
            />
            <input 
              type="text" 
              v-model="newRelation.relationType" 
              placeholder="Relation Type"
              class="relation-input"
            />
            <input 
              type="text" 
              v-model="newRelation.to" 
              placeholder="To"
              class="relation-input"
            />
            <button @click="addRelation" class="action-button add-button">
              <i class="mdi mdi-plus"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="entry-detail empty-detail" v-else>
        <div class="empty-detail-message">
          <i class="mdi mdi-information-outline"></i>
          <p>Select a memory entry to view and edit details</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import mcpApi from '../services/mcp-api';

export default {
  name: 'MemoryManager',
  
  setup() {
    const memoryEntries = ref([]);
    const selectedEntry = ref(null);
    const relations = ref([]);
    const searchQuery = ref('');
    const isLoading = ref(false);
    const searchTimeout = ref(null);
    
    const newRelation = reactive({
      from: '',
      relationType: '',
      to: ''
    });
    
    // Load memory entries from the API
    const loadEntries = async () => {
      isLoading.value = true;
      try {
        const result = await mcpApi.get('memory', '/entities');
        memoryEntries.value = result || [];
      } catch (error) {
        console.error('Failed to load memory entries:', error);
        memoryEntries.value = [];
      } finally {
        isLoading.value = false;
      }
    };
    
    // Load relations for the selected entry
    const loadRelations = async (entityName) => {
      try {
        const result = await mcpApi.get('memory', `/relations/${entityName}`);
        relations.value = result || [];
      } catch (error) {
        console.error('Failed to load relations:', error);
        relations.value = [];
      }
    };
    
    // Select an entry for editing
    const selectEntry = async (entry) => {
      selectedEntry.value = { ...entry };
      await loadRelations(entry.name);
    };
    
    // Create a new entry
    const createNewEntry = () => {
      const newEntry = {
        id: Date.now().toString(),
        name: 'New Entry',
        entityType: 'Note',
        observations: ['']
      };
      
      selectedEntry.value = newEntry;
      relations.value = [];
    };
    
    // Save the current entry
    const saveEntry = async () => {
      try {
        // Check if it's a new entry or update
        const isNew = !memoryEntries.value.find(e => e.id === selectedEntry.value.id);
        
        if (isNew) {
          await mcpApi.post('memory', '/entities', {
            entities: [selectedEntry.value]
          });
          
          // Add to local list
          memoryEntries.value.push({ ...selectedEntry.value });
        } else {
          // Update existing entry
          await mcpApi.put('memory', `/entities/${selectedEntry.value.name}`, selectedEntry.value);
          
          // Update in local list
          const index = memoryEntries.value.findIndex(e => e.id === selectedEntry.value.id);
          if (index !== -1) {
            memoryEntries.value[index] = { ...selectedEntry.value };
          }
        }
      } catch (error) {
        console.error('Failed to save entry:', error);
      }
    };
    
    // Delete the current entry
    const deleteEntry = async () => {
      if (!selectedEntry.value) return;
      
      try {
        await mcpApi.delete('memory', `/entities/${selectedEntry.value.name}`);
        
        // Remove from local list
        memoryEntries.value = memoryEntries.value.filter(
          e => e.id !== selectedEntry.value.id
        );
        
        selectedEntry.value = null;
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    };
    
    // Add a new observation to the selected entry
    const addObservation = () => {
      if (!selectedEntry.value) return;
      
      selectedEntry.value.observations.push('');
    };
    
    // Remove an observation from the selected entry
    const removeObservation = (index) => {
      if (!selectedEntry.value || selectedEntry.value.observations.length <= 1) return;
      
      selectedEntry.value.observations.splice(index, 1);
      updateEntry();
    };
    
    // Add a new relation
    const addRelation = async () => {
      if (!newRelation.from || !newRelation.relationType || !newRelation.to) return;
      
      try {
        await mcpApi.post('memory', '/relations', {
          relations: [{ ...newRelation }]
        });
        
        // Add to local list
        relations.value.push({ ...newRelation });
        
        // Clear form
        newRelation.from = '';
        newRelation.relationType = '';
        newRelation.to = '';
      } catch (error) {
        console.error('Failed to add relation:', error);
      }
    };
    
    // Remove a relation
    const removeRelation = async (index) => {
      const relation = relations.value[index];
      
      try {
        await mcpApi.delete('memory', `/relations?from=${relation.from}&type=${relation.relationType}&to=${relation.to}`);
        
        // Remove from local list
        relations.value.splice(index, 1);
      } catch (error) {
        console.error('Failed to remove relation:', error);
      }
    };
    
    // Update the current entry
    const updateEntry = () => {
      // This is a local update only, saveEntry will push to API
    };
    
    // Get a preview of an entry for the list view
    const getPreview = (entry) => {
      if (!entry.observations || entry.observations.length === 0) {
        return 'No observations';
      }
      
      const text = entry.observations[0];
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };
    
    // Debounce search to avoid too many API calls
    const debounceSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
      
      searchTimeout.value = setTimeout(() => {
        performSearch();
      }, 300);
    };
    
    // Perform the actual search
    const performSearch = async () => {
      if (!searchQuery.value) {
        await loadEntries();
        return;
      }
      
      isLoading.value = true;
      try {
        const result = await mcpApi.get('memory', `/search?query=${searchQuery.value}`);
        memoryEntries.value = result || [];
      } catch (error) {
        console.error('Search failed:', error);
        memoryEntries.value = [];
      } finally {
        isLoading.value = false;
      }
    };
    
    // Load entries when component mounts
    onMounted(() => {
      loadEntries();
    });
    
    return {
      memoryEntries,
      selectedEntry,
      relations,
      newRelation,
      searchQuery,
      isLoading,
      selectEntry,
      createNewEntry,
      saveEntry,
      deleteEntry,
      addObservation,
      removeObservation,
      addRelation,
      removeRelation,
      updateEntry,
      getPreview,
      debounceSearch
    };
  }
};
</script>

<style scoped>
.memory-manager {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height) - var(--footer-height) - 4rem);
  max-height: 800px;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-box input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.create-button {
  background-color: var(--primary-color);
  color: white;
}

.save-button {
  background-color: var(--success-color);
  color: white;
}

.delete-button {
  background-color: var(--danger-color);
  color: white;
}

.add-button {
  background-color: var(--primary-color);
  color: white;
}

.content-area {
  display: flex;
  flex: 1;
  gap: 1rem;
  overflow: hidden;
}

.entry-list {
  flex: 1;
  max-width: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.memory-entry {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.memory-entry:hover {
  background-color: #f9f9f9;
}

.entry-selected {
  background-color: #e3f2fd;
  border-left: 3px solid var(--primary-color);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.entry-header h3 {
  margin: 0;
  font-size: 1rem;
}

.entry-type {
  font-size: 0.8rem;
  color: #666;
  background-color: #eee;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.entry-preview {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.entry-detail {
  flex: 2;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  padding: 1rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.detail-name {
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-bottom: 1px solid #ddd;
  padding: 0.5rem 0;
  width: 100%;
  max-width: 300px;
}

.entry-actions {
  display: flex;
  gap: 0.5rem;
}

.entity-type {
  margin-bottom: 1rem;
}

.entity-type label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.entity-type input {
  width: 100%;
  max-width: 300px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.observations {
  margin-bottom: 1rem;
}

.observation-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.observation-item textarea {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.remove-button {
  border: none;
  background-color: transparent;
  color: var(--danger-color);
  cursor: pointer;
  font-size: 1.1rem;
}

.relations {
  margin-top: 2rem;
}

.relation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.relation-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.relation-type {
  font-weight: bold;
  color: var(--primary-color);
}

.add-relation {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.relation-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 1rem;
  color: #666;
  text-align: center;
}

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-detail-message {
  text-align: center;
  color: #666;
}

.empty-detail-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>
