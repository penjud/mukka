#!/usr/bin/env node

/**
 * Migration Script
 * Migrates data from JSON file storage to MongoDB
 */

const path = require('path');
const { migrateData } = require('../src/db/migrate');

// Run the migration
console.log('Starting migration from JSON file to MongoDB...');
migrateData().then(() => {
  console.log('Migration script completed');
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
