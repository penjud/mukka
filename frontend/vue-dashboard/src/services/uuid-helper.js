/**
 * UUID Helper Service
 * 
 * This service provides standardized UUID management across the application
 * to ensure consistency between client-generated UUIDs and server responses.
 */

import { v4 as uuidv4 } from 'uuid';

class UuidHelper {
  /**
   * Generate a UUID for a new entity
   * @returns {string} A new UUID
   */
  generateUuid() {
    return uuidv4();
  }

  /**
   * Ensure an entity has a valid UUID
   * 
   * @param {Object} entity - Entity object that should have an ID
   * @param {string} [idField='id'] - Name of the ID field in the entity
   * @returns {Object} Entity with guaranteed ID
   */
  ensureEntityId(entity, idField = 'id') {
    // Clone the entity to avoid mutations
    const result = { ...entity };
    
    // If entity doesn't have an ID or it's invalid, generate a new one
    if (!result[idField]) {
      result[idField] = this.generateUuid();
    }
    
    return result;
  }

  /**
   * Reconcile client and server IDs for entities
   * 
   * If the server returns an entity with a different ID than the client-generated one,
   * this function ensures the client uses the server's ID while logging the discrepancy.
   * 
   * @param {Object} clientEntity - Entity with client-generated ID
   * @param {Object} serverEntity - Entity returned from the server
   * @param {string} [idField='id'] - Name of the ID field
   * @returns {Object} Entity with reconciled ID
   */
  reconcileEntityIds(clientEntity, serverEntity, idField = 'id') {
    if (!serverEntity) {
      return clientEntity;
    }
    
    // Check if IDs match
    if (clientEntity[idField] !== serverEntity[idField]) {
      console.warn(
        `UUID mismatch detected: Client generated ${clientEntity[idField]}, but server returned ${serverEntity[idField]}. Using server ID.`
      );
      
      // Create a new entity with the server's ID
      return {
        ...clientEntity,
        [idField]: serverEntity[idField]
      };
    }
    
    // IDs match, return the client entity
    return clientEntity;
  }
}

// Export singleton instance
const uuidHelper = new UuidHelper();
export default uuidHelper;
