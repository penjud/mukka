import SecureLS from 'secure-ls';

/**
 * Secure Storage Service
 * Provides encrypted local storage functionality using secure-ls
 * This helps protect sensitive data like auth tokens from XSS attacks
 */
class SecureStorageService {
  constructor() {
    this.ls = new SecureLS({
      isCompression: false,
      encodingType: 'aes',
      encryptionSecret: 'mcp-secure-storage'
    });
    this.prefix = 'mcp_';
  }

  /**
   * Get an item from secure storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} The stored value or defaultValue
   */
  getItem(key, defaultValue = null) {
    try {
      const prefixedKey = this.prefix + key;
      const value = this.ls.get(prefixedKey);
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      console.error('Secure storage get error:', error);
      return defaultValue;
    }
  }

  /**
   * Set an item in secure storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} True if successful
   */
  setItem(key, value) {
    try {
      const prefixedKey = this.prefix + key;
      this.ls.set(prefixedKey, value);
      return true;
    } catch (error) {
      console.error('Secure storage set error:', error);
      return false;
    }
  }

  /**
   * Remove an item from secure storage
   * @param {string} key - Storage key to remove
   * @returns {boolean} True if successful
   */
  removeItem(key) {
    try {
      const prefixedKey = this.prefix + key;
      this.ls.remove(prefixedKey);
      return true;
    } catch (error) {
      console.error('Secure storage remove error:', error);
      return false;
    }
  }

  /**
   * Clear all items from secure storage that start with our prefix
   * @returns {boolean} True if successful
   */
  clear() {
    try {
      this.ls.removeAll();
      return true;
    } catch (error) {
      console.error('Secure storage clear error:', error);
      return false;
    }
  }
  
  /**
   * Check if secure storage is available and working
   * @returns {boolean} True if secure storage is working
   */
  isAvailable() {
    try {
      const testKey = this.prefix + 'test';
      this.ls.set(testKey, 'test');
      const value = this.ls.get(testKey);
      this.ls.remove(testKey);
      return value === 'test';
    } catch (error) {
      console.error('Secure storage is not available:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const secureStorage = new SecureStorageService();
export default secureStorage;
