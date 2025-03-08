<template>
  <div class="search-interface">
    <h2>Brave Search MCP</h2>
    
    <div class="search-container">
      <div class="search-input">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Enter your search query..."
          @keyup.enter="performSearch"
        />
        <button @click="performSearch" class="search-button">
          <i class="mdi mdi-magnify"></i> Search
        </button>
      </div>
      
      <div class="search-options">
        <div class="option-group">
          <label>Results Count:</label>
          <select v-model="searchOptions.count">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="results-container" v-if="searchPerformed">
      <div v-if="isLoading" class="loading">
        <i class="mdi mdi-loading mdi-spin"></i> Searching...
      </div>
      
      <div v-else-if="searchResults.length === 0" class="no-results">
        <i class="mdi mdi-alert-circle-outline"></i>
        <p>No results found for "{{ searchQuery }}"</p>
      </div>
      
      <div v-else class="results-list">
        <!-- Placeholder for search results -->
        <div class="search-result" v-for="(result, index) in searchResults" :key="index">
          <h3>{{ result.title || 'Search Result' }}</h3>
          <p class="result-url">{{ result.url || 'https://example.com' }}</p>
          <p class="result-description">{{ result.description || 'Result description placeholder' }}</p>
        </div>
      </div>
    </div>
    
    <div class="initial-state" v-else>
      <i class="mdi mdi-search-web"></i>
      <p>Enter a search query to find results</p>
      <p class="note">This component will be fully implemented in the next update.</p>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  name: 'SearchInterface',
  
  setup() {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const isLoading = ref(false);
    const searchPerformed = ref(false);
    
    const searchOptions = reactive({
      count: 10
    });
    
    // This will be implemented to use the real API in a future update
    const performSearch = () => {
      if (!searchQuery.value.trim()) return;
      
      searchPerformed.value = true;
      isLoading.value = true;
      
      // Simulate API delay
      setTimeout(() => {
        // Placeholder results
        searchResults.value = [
          {
            title: 'Search Result 1',
            url: 'https://example.com/result1',
            description: 'This is a placeholder for search result 1. Real search functionality will be implemented in the next update.'
          },
          {
            title: 'Search Result 2',
            url: 'https://example.com/result2',
            description: 'This is a placeholder for search result 2. Real search functionality will be implemented in the next update.'
          },
          {
            title: 'Search Result 3',
            url: 'https://example.com/result3',
            description: 'This is a placeholder for search result 3. Real search functionality will be implemented in the next update.'
          }
        ];
        
        isLoading.value = false;
      }, 1000);
    };
    
    return {
      searchQuery,
      searchResults,
      isLoading,
      searchPerformed,
      searchOptions,
      performSearch
    };
  }
};
</script>

<style scoped>
.search-interface {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height) - var(--footer-height) - 4rem);
  max-height: 800px;
}

.search-container {
  margin-bottom: 1rem;
}

.search-input {
  display: flex;
  margin-bottom: 1rem;
}

.search-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.search-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
}

.search-options {
  display: flex;
  gap: 1rem;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-group select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.results-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  padding: 1rem;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 1.2rem;
  color: #666;
}

.loading i {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.no-results {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  text-align: center;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--warning-color);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-result {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.search-result h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.result-url {
  color: #2e7d32;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.result-description {
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.initial-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  text-align: center;
  color: #666;
}

.initial-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.note {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #999;
  font-style: italic;
}
</style>
